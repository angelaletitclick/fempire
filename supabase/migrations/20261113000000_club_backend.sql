-- FEMPIRE CLUB: Mitgliederbereich und Backend
-- Rollen, Mitgliedschaften, Profile, Magazin (CMS), Termine, Schnupper-Anfragen, Forum, Nachrichten.
--
-- Sicherheitsmodell
-- - Admin-Aktionen laufen serverseitig nach Rollenprüfung (lib/auth.ts) mit dem Secret Key.
-- - Mitglieder lesen und schreiben mit ihrer eigenen Sitzung. RLS lässt nur aktive Mitglieder
--   (Status "active") und Admins in Forum, Verzeichnis, Termine und Nachrichten.
-- - Magazin und Schnupper-Anfragen haben keine Policies: Lesen nur serverseitig. Der Text
--   bezahlter Artikel ist dadurch nie über den öffentlichen Schlüssel abrufbar.

-- ---------------------------------------------------------------------------
-- Mitglieder: Rolle, Mitgliedschaft, Profil
-- ---------------------------------------------------------------------------
alter table public.members drop column circle;

alter table public.members
  add column email          text,
  add column role           text not null default 'member' check (role in ('member', 'admin')),
  -- Mitgliedschaft. Admins brauchen keine.
  add column tier           text check (tier in ('community', 'founder', 'leader', 'mastermind')),
  -- active = bezahlt und freigeschaltet. Gezahlt wird per Rechnung, den Status setzen die Admins.
  add column status         text not null default 'active' check (status in ('active', 'paused', 'ended')),
  add column company        text,
  add column position       text,
  add column website        text,
  add column linkedin       text,
  add column instagram      text,
  add column bio            text,
  add column avatar_path    text,
  add column application_id uuid references public.applications (id) on delete set null,
  add column updated_at     timestamptz not null default now();

create unique index members_email_idx on public.members (lower(email));

-- Aktives Mitglied oder Admin. security definer, damit die Prüfung nicht an RLS hängt.
create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.user_id = (select auth.uid())
      and (m.role = 'admin' or m.status = 'active')
  );
$$;

-- Darf diese Person angeschrieben werden (aktives Mitglied oder Admin)?
create or replace function public.is_contactable(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.user_id = p_user and (m.role = 'admin' or m.status = 'active')
  );
$$;

revoke execute on function public.is_active_member() from public, anon;
revoke execute on function public.is_contactable(uuid) from public, anon;
grant execute on function public.is_active_member() to authenticated;
grant execute on function public.is_contactable(uuid) to authenticated;

drop policy "Mitglieder sehen ihren eigenen Eintrag" on public.members;

-- Eigener Eintrag immer, sonst das Verzeichnis aller aktiven Mitglieder und Admins
create policy "Mitglieder lesen Verzeichnis"
  on public.members for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or ((select public.is_active_member()) and (status = 'active' or role = 'admin'))
  );

create policy "Mitglieder bearbeiten ihr Profil"
  on public.members for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Spaltenrechte: E-Mail, Rolle, Mitgliedschaft und Status sind für Mitglieder nicht änderbar,
-- die E-Mail-Adressen anderer sind nicht lesbar (Kontakt läuft über den Website-Chat).
revoke all on public.members from anon, authenticated;
grant select (user_id, created_at, full_name, role, tier, status, city_slug, company, position,
              website, linkedin, instagram, bio, avatar_path, updated_at)
  on public.members to authenticated;
grant update (full_name, city_slug, company, position, website, linkedin, instagram, bio, updated_at)
  on public.members to authenticated;

-- ---------------------------------------------------------------------------
-- Bewerbungen: Zuordnung auf Mitgliedschaft statt Kreis
-- ---------------------------------------------------------------------------
alter table public.applications drop constraint if exists applications_assigned_circle_check;
alter table public.applications
  add constraint applications_assigned_circle_check
  check (assigned_circle in ('community', 'founder', 'leader', 'mastermind'));
alter table public.applications add column decided_at timestamptz;

-- ---------------------------------------------------------------------------
-- Magazin (CMS)
-- ---------------------------------------------------------------------------
create table public.articles (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title        text not null,
  teaser       text not null default '',
  topic        text not null default '',
  author       text not null,
  -- Absätze durch Leerzeilen getrennt, "## " am Anfang ergibt eine Zwischenüberschrift
  body         text not null default '',
  -- true: vollständiger Text nur für aktive Mitglieder, alle anderen sehen den Anfang
  paid         boolean not null default false,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz
);

create index articles_published_idx on public.articles (status, published_at desc);

alter table public.articles enable row level security;
revoke all on public.articles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Termine
-- ---------------------------------------------------------------------------
create table public.events (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  title             text not null,
  format            text not null
                    check (format in ('workshop', 'founder', 'talk_walk', 'hot_seat', 'mastermind', 'retreat', 'event')),
  topic             text,
  description       text,
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  city_slug         text not null default 'osnabrueck',
  -- Genauer Ort, nur für Mitglieder sichtbar
  location          text,
  -- Welche Mitgliedschaften teilnehmen können
  audience          text[] not null default '{founder,leader,mastermind}'
                    check (audience <@ array['community', 'founder', 'leader', 'mastermind']::text[]),
  -- Teilnahmebeitrag in Cent, leer = in der Mitgliedschaft enthalten
  price_cents       integer check (price_cents >= 0),
  -- Schnuppertermin für Nicht-Mitglieder in Cent, leer = kein Schnuppern möglich
  trial_price_cents integer check (trial_price_cents >= 0),
  capacity          integer check (capacity > 0),
  status            text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  cancel_note       text
);

create index events_starts_idx on public.events (status, starts_at);

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant select on public.events to authenticated;

create policy "Mitglieder sehen veröffentlichte Termine"
  on public.events for select
  to authenticated
  using ((select public.is_active_member()) and status <> 'draft');

-- Zusagen
create table public.event_registrations (
  event_id   uuid not null references public.events (id) on delete cascade,
  user_id    uuid not null references public.members (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.event_registrations enable row level security;
revoke all on public.event_registrations from anon, authenticated;
grant select, insert, delete on public.event_registrations to authenticated;

-- Zusage möglich: Termin veröffentlicht und in der Zukunft, Mitgliedschaft passt, Platz frei
create or replace function public.can_attend(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    join public.members m on m.user_id = (select auth.uid())
    where e.id = p_event
      and e.status = 'published'
      and e.starts_at > now()
      and (m.role = 'admin' or (m.status = 'active' and m.tier = any (e.audience)))
      and (e.capacity is null
           or (select count(*) from public.event_registrations r where r.event_id = e.id) < e.capacity)
  );
$$;

-- Belegte Plätze pro Termin, ohne preiszugeben wer zugesagt hat
create or replace function public.event_seats_taken()
returns table (event_id uuid, taken bigint)
language sql
stable
security definer
set search_path = public
as $$
  select r.event_id, count(*)
  from public.event_registrations r
  where (select public.is_active_member())
  group by r.event_id;
$$;

revoke execute on function public.can_attend(uuid) from public, anon;
revoke execute on function public.event_seats_taken() from public, anon;
grant execute on function public.can_attend(uuid) to authenticated;
grant execute on function public.event_seats_taken() to authenticated;

create policy "Mitglieder sehen ihre Zusagen"
  on public.event_registrations for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Mitglieder sagen zu"
  on public.event_registrations for insert
  to authenticated
  with check (user_id = (select auth.uid()) and (select public.can_attend(event_id)));

create policy "Mitglieder sagen ab"
  on public.event_registrations for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Schnupper-Anfragen (öffentliches Formular, nur serverseitig)
-- ---------------------------------------------------------------------------
create table public.trial_requests (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  event_id            uuid references public.events (id) on delete set null,
  name                text not null,
  email               text not null,
  phone               text,
  company             text,
  message             text,
  status              text not null default 'neu' check (status in ('neu', 'bestaetigt', 'abgesagt')),
  privacy_accepted_at timestamptz not null,
  ip_hash             text
);

create index trial_requests_created_idx on public.trial_requests (created_at desc);

alter table public.trial_requests enable row level security;
revoke all on public.trial_requests from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Forum
-- ---------------------------------------------------------------------------
create table public.forum_threads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  author_id        uuid not null references public.members (user_id) on delete cascade,
  title            text not null check (char_length(title) between 3 and 140),
  body             text not null check (char_length(body) between 1 and 10000),
  -- Neue Themen prüfen die Admins vor der Freigabe
  status           text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  pinned           boolean not null default false,
  last_activity_at timestamptz not null default now()
);

create index forum_threads_list_idx on public.forum_threads (status, pinned desc, last_activity_at desc);

create table public.forum_posts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  thread_id  uuid not null references public.forum_threads (id) on delete cascade,
  author_id  uuid not null references public.members (user_id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 10000),
  -- Antworten erscheinen sofort, Admins können sie ausblenden oder löschen
  status     text not null default 'approved' check (status in ('approved', 'hidden'))
);

create index forum_posts_thread_idx on public.forum_posts (thread_id, created_at);

alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;
revoke all on public.forum_threads from anon, authenticated;
revoke all on public.forum_posts from anon, authenticated;
grant select, insert on public.forum_threads to authenticated;
grant select, insert on public.forum_posts to authenticated;

create policy "Mitglieder lesen freigegebene Themen"
  on public.forum_threads for select
  to authenticated
  using ((select public.is_active_member()) and (status = 'approved' or author_id = (select auth.uid())));

create policy "Mitglieder eröffnen Themen zur Prüfung"
  on public.forum_threads for insert
  to authenticated
  with check (
    (select public.is_active_member())
    and author_id = (select auth.uid())
    and status = 'pending'
    and pinned = false
  );

create policy "Mitglieder lesen Antworten"
  on public.forum_posts for select
  to authenticated
  using (
    (select public.is_active_member())
    and (status = 'approved' or author_id = (select auth.uid()))
  );

create policy "Mitglieder antworten in freigegebenen Themen"
  on public.forum_posts for insert
  to authenticated
  with check (
    (select public.is_active_member())
    and author_id = (select auth.uid())
    and status = 'approved'
    and exists (select 1 from public.forum_threads t where t.id = thread_id and t.status = 'approved')
  );

-- Neue Antwort schiebt das Thema nach oben
create or replace function public.forum_touch_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.forum_threads set last_activity_at = new.created_at where id = new.thread_id;
  return new;
end;
$$;

revoke execute on function public.forum_touch_thread() from public, anon, authenticated;

create trigger forum_posts_touch_thread
  after insert on public.forum_posts
  for each row execute function public.forum_touch_thread();

-- ---------------------------------------------------------------------------
-- Nachrichten (Website-Chat zwischen Mitgliedern)
-- ---------------------------------------------------------------------------
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  sender_id    uuid not null references public.members (user_id) on delete cascade,
  recipient_id uuid not null references public.members (user_id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 4000),
  read_at      timestamptz,
  check (sender_id <> recipient_id)
);

create index messages_pair_idx on public.messages (sender_id, recipient_id, created_at desc);
create index messages_inbox_idx on public.messages (recipient_id, read_at);

alter table public.messages enable row level security;
revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

create policy "Beteiligte lesen Nachrichten"
  on public.messages for select
  to authenticated
  using ((select public.is_active_member()) and (select auth.uid()) in (sender_id, recipient_id));

create policy "Mitglieder schreiben Nachrichten"
  on public.messages for insert
  to authenticated
  with check (
    (select public.is_active_member())
    and sender_id = (select auth.uid())
    and read_at is null
    and (select public.is_contactable(recipient_id))
  );

create policy "Empfängerin markiert als gelesen"
  on public.messages for update
  to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- Unterhaltungen der angemeldeten Person: letzte Nachricht und ungelesene pro Gegenüber
create or replace function public.my_conversations()
returns table (partner_id uuid, last_body text, last_at timestamptz, last_from_me boolean, unread bigint)
language sql
stable
security invoker
set search_path = public
as $$
  with mine as (
    select
      case when m.sender_id = (select auth.uid()) then m.recipient_id else m.sender_id end as partner,
      m.body, m.created_at, m.sender_id = (select auth.uid()) as from_me
    from public.messages m
    where (select auth.uid()) in (m.sender_id, m.recipient_id)
  )
  select distinct on (partner)
    partner, body, created_at, from_me,
    (select count(*) from public.messages u
      where u.sender_id = mine.partner and u.recipient_id = (select auth.uid()) and u.read_at is null)
  from mine
  order by partner, created_at desc;
$$;

revoke execute on function public.my_conversations() from public, anon;
grant execute on function public.my_conversations() to authenticated;

-- ---------------------------------------------------------------------------
-- Profilfotos: privater Bucket, ausgeliefert über /club/avatar/[id] nach Login-Prüfung
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Startdaten: Workshop-Termine des Leader Circle 2027 (erster Dienstag im Monat)
-- ANNAHME: 18:30 bis 21:30 Uhr. Uhrzeit, Ort und Themen im Backend unter Termine anpassen.
-- ---------------------------------------------------------------------------
insert into public.events (title, format, topic, starts_at, ends_at, audience, trial_price_cents, status)
select
  case when d = date '2027-01-05' then 'Auftakt Leader Circle' else 'Leader Circle Workshop' end,
  'workshop',
  case d
    when date '2027-01-05' then 'Website'
    when date '2027-02-02' then 'KI'
    when date '2027-03-02' then 'Mitarbeiter'
    when date '2027-04-06' then 'Social Media'
  end,
  (d + time '18:30') at time zone 'Europe/Berlin',
  (d + time '21:30') at time zone 'Europe/Berlin',
  '{founder,leader,mastermind}',
  2900,
  'published'
from unnest(array[
  date '2027-01-05', date '2027-02-02', date '2027-03-02', date '2027-04-06',
  date '2027-05-04', date '2027-06-01', date '2027-07-06', date '2027-08-03',
  date '2027-09-07', date '2027-10-05', date '2027-11-02', date '2027-12-07'
]) as d;
