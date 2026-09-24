-- FEMPIRE CLUB: Bewerbungen, Warteliste, Rate-Limit, Mitglieder
--
-- Sicherheitsmodell: Die Website schreibt ausschließlich serverseitig mit dem
-- Secret Key (Rolle service_role, umgeht RLS). Für anon und authenticated gibt es
-- auf applications, waitlist und rate_limit_hits keine Policies, also keinen Zugriff.
-- Der Score einer Bewerbung ist damit von außen nicht lesbar.

-- ---------------------------------------------------------------------------
-- Bewerbungen
-- ---------------------------------------------------------------------------
create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  status           text not null default 'neu'
                   check (status in ('neu', 'geprueft', 'gespraech', 'aufgenommen', 'abgelehnt')),
  score            smallint not null check (score between 0 and 100),
  internal_note    text,

  -- Schritt 1: Person
  name             text not null,
  email            text not null,
  phone            text,
  city             text not null,
  profile_url      text,

  -- Schritt 2: Unternehmen
  company          text not null,
  legal_form       text not null,
  role             text not null,
  founded_year     smallint not null,
  employees        text not null,
  industry         text not null,

  -- Schritt 3: Zahlen
  revenue_range    text not null,
  goal_12m         text not null,
  bottleneck       text not null,

  -- Schritt 4: Passung
  motivation       text not null,
  contribution     text not null,
  has_children     text check (has_children in ('ja', 'nein')),
  time_commitment  text not null,

  -- Schritt 5: Einwilligung
  privacy_accepted_at timestamptz not null,

  ip_hash          text
);

create index applications_created_at_idx on public.applications (created_at desc);
create index applications_email_idx on public.applications (lower(email));

alter table public.applications enable row level security;
revoke all on public.applications from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Warteliste mit Double-Opt-in
-- ---------------------------------------------------------------------------
create table public.waitlist (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  email         text not null,
  city          text not null,
  confirm_token uuid not null unique default gen_random_uuid(),
  confirmed_at  timestamptz,
  ip_hash       text
);

create unique index waitlist_email_city_idx on public.waitlist (lower(email), lower(city));

alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Rate-Limit pro gehashter IP
-- ---------------------------------------------------------------------------
create table public.rate_limit_hits (
  id         bigint generated always as identity primary key,
  bucket     text not null,
  key        text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_lookup_idx on public.rate_limit_hits (bucket, key, created_at desc);

alter table public.rate_limit_hits enable row level security;
revoke all on public.rate_limit_hits from anon, authenticated;

-- Zählt Treffer im Zeitfenster und trägt einen neuen ein, falls noch Luft ist.
-- Gibt true zurück, wenn die Anfrage erlaubt ist.
create or replace function public.hit_rate_limit(
  p_bucket text,
  p_key text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hits int;
begin
  -- Alte Einträge nebenbei aufräumen, damit keine IP-Hashes liegen bleiben
  delete from rate_limit_hits where created_at < now() - interval '1 day';

  select count(*) into hits
  from rate_limit_hits
  where bucket = p_bucket
    and key = p_key
    and created_at > now() - make_interval(secs => p_window_seconds);

  if hits >= p_limit then
    return false;
  end if;

  insert into rate_limit_hits (bucket, key) values (p_bucket, p_key);
  return true;
end;
$$;

revoke execute on function public.hit_rate_limit(text, text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, text, int, int) to service_role;

-- ---------------------------------------------------------------------------
-- Mitglieder (für /club, vorerst nur Gerüst)
-- Aufnahme passiert manuell: Nutzerin in Supabase Auth einladen, dann hier eintragen.
-- ---------------------------------------------------------------------------
create table public.members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name  text not null,
  city       text not null default 'Osnabrück'
);

alter table public.members enable row level security;

create policy "Mitglieder sehen ihren eigenen Eintrag"
  on public.members for select
  to authenticated
  using ((select auth.uid()) = user_id);
