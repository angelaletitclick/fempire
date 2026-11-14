-- FEMPIRE CLUB: Zahlung offen, Bewerbung pro Kreis, Einladungscodes
--
-- 1. Mitgliedsstatus "payment_due": nach der Aufnahme, bis der erste Beitrag da ist. Kein Zugang,
--    alle Freigaben im Club prüfen bereits auf status = 'active'.
-- 2. Bewerbungen nennen den gewählten Kreis (community, founder, leader, mastermind), haben je Kreis
--    eigene Fragen und eine bestätigte Verbindlichkeit.
-- 3. Einladungscodes: Rabatt in Prozent, kostenlose Monate, Aufnahme ohne Bewerbung, begrenzt auf
--    bestimmte Kreise, Anzahl und Ablaufdatum. Nur serverseitig lesbar (keine Policies).

-- ---------------------------------------------------------------------------
-- 1. Mitglieder
-- ---------------------------------------------------------------------------
alter table public.members drop constraint if exists members_status_check;
alter table public.members
  add constraint members_status_check check (status in ('active', 'payment_due', 'paused', 'ended'));

alter table public.members
  add column invite_code      text,
  add column discount_percent smallint not null default 0 check (discount_percent between 0 and 100),
  add column free_until       date;

-- ---------------------------------------------------------------------------
-- 2. Bewerbungen
-- ---------------------------------------------------------------------------
alter table public.applications drop constraint if exists applications_suggested_circle_check;
alter table public.applications
  add constraint applications_suggested_circle_check
  check (suggested_circle in ('community', 'founder', 'leader', 'mastermind', 'foundations'));

alter table public.applications drop constraint if exists applications_stage_check;
alter table public.applications
  add constraint applications_stage_check check (stage is null or stage in ('unternehmen', 'fuehrung', 'vor_gruendung'));

alter table public.applications
  alter column stage drop not null,
  alter column industry drop not null,
  alter column goal_12m drop not null,
  alter column bottleneck drop not null,
  alter column motivation drop not null,
  alter column contribution drop not null,
  alter column time_commitment drop not null;

alter table public.applications
  add column expectation            text,
  add column mastermind_focus       text,
  add column commitment_accepted_at timestamptz,
  add column invite_code            text;

-- ---------------------------------------------------------------------------
-- 3. Einladungscodes
-- ---------------------------------------------------------------------------
create table public.invite_codes (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  code             text not null unique check (code = upper(code) and length(code) between 4 and 40),
  note             text,
  -- Leer = gilt für alle Kreise
  tiers            text[] not null default '{}',
  discount_percent smallint not null default 0 check (discount_percent between 0 and 100),
  free_months      smallint not null default 0 check (free_months between 0 and 36),
  skip_application boolean not null default false,
  max_uses         integer check (max_uses is null or max_uses > 0),
  uses             integer not null default 0,
  expires_at       timestamptz,
  active           boolean not null default true
);

alter table public.invite_codes enable row level security;
revoke all on public.invite_codes from anon, authenticated;

-- Code einlösen: zählt nur hoch, wenn der Code aktiv, nicht abgelaufen und nicht aufgebraucht ist.
create or replace function public.redeem_invite_code(p_code text)
returns setof public.invite_codes
language sql
security definer
set search_path = public
as $$
  update public.invite_codes
     set uses = uses + 1
   where code = upper(trim(p_code))
     and active
     and (expires_at is null or expires_at > now())
     and (max_uses is null or uses < max_uses)
  returning *;
$$;

revoke execute on function public.redeem_invite_code(text) from public, anon, authenticated;
grant execute on function public.redeem_invite_code(text) to service_role;
