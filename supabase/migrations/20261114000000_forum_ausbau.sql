-- FEMPIRE CLUB: Forum-Ausbau
-- Kategorien, Fragen mit Lösung, geschlossene Themen, Bearbeiten eigener Beiträge, letzte Antwort.

-- ---------------------------------------------------------------------------
-- Kategorien
-- ---------------------------------------------------------------------------
create table public.forum_categories (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  description text not null default '',
  sort        integer not null default 0
);

alter table public.forum_categories enable row level security;
revoke all on public.forum_categories from anon, authenticated;
grant select on public.forum_categories to authenticated;

create policy "Mitglieder sehen Kategorien"
  on public.forum_categories for select
  to authenticated
  using ((select public.is_active_member()));

insert into public.forum_categories (slug, name, description, sort) values
  ('zahlen-finanzen', 'Zahlen & Finanzen', 'Umsatz, Marge, Liquidität, Pricing, Holding und Steuern.', 10),
  ('fuehrung-team', 'Führung & Team', 'Mitarbeiter, Recruiting, Delegieren, Strukturen und Prozesse.', 20),
  ('marketing-sichtbarkeit', 'Marketing & Social Media', 'Positionierung, Website, Content, Social Media und Vertrieb.', 30),
  ('ki-tools', 'KI & Tools', 'Software, Automatisierung und KI im Unternehmensalltag.', 40),
  ('vereinbarkeit', 'Vereinbarkeit & Mental Health', 'Familie, Belastung, Grenzen und was dabei hilft.', 50),
  ('gruendung', 'Gründung', 'Fragen rund um den Start, Rechtsform und die ersten Kundinnen.', 60),
  ('allgemeines', 'Allgemeines', 'Alles, was in keine andere Kategorie passt.', 90);

-- ---------------------------------------------------------------------------
-- Themen und Antworten erweitern
-- ---------------------------------------------------------------------------
alter table public.forum_threads
  add column category_id    uuid references public.forum_categories (id) on delete restrict,
  -- frage: kann als gelöst markiert werden. diskussion: offener Austausch.
  add column kind           text not null default 'diskussion' check (kind in ('frage', 'diskussion')),
  -- Geschlossen: keine neuen Antworten mehr
  add column locked         boolean not null default false,
  add column solved_post_id uuid references public.forum_posts (id) on delete set null,
  add column last_author_id uuid references public.members (user_id) on delete set null,
  add column edited_at      timestamptz;

update public.forum_threads
set category_id = (select id from public.forum_categories where slug = 'allgemeines')
where category_id is null;

alter table public.forum_threads alter column category_id set not null;

create index forum_threads_category_idx on public.forum_threads (category_id, status, last_activity_at desc);

alter table public.forum_posts add column edited_at timestamptz;

-- Eigene Themen bearbeiten: nur Titel, Text, Kategorie, Art. Status, Anheften, Schließen und
-- Lösung setzen nur Moderatorinnen bzw. die Website nach Prüfung.
grant update (title, body, category_id, kind, edited_at) on public.forum_threads to authenticated;

create policy "Autorinnen bearbeiten ihre Themen"
  on public.forum_threads for update
  to authenticated
  using ((select public.is_active_member()) and author_id = (select auth.uid()) and status <> 'hidden')
  with check (author_id = (select auth.uid()));

-- Eigene Antworten bearbeiten
grant update (body, edited_at) on public.forum_posts to authenticated;

create policy "Autorinnen bearbeiten ihre Antworten"
  on public.forum_posts for update
  to authenticated
  using ((select public.is_active_member()) and author_id = (select auth.uid()) and status = 'approved')
  with check (author_id = (select auth.uid()));

-- Antworten nur in freigegebenen, nicht geschlossenen Themen
drop policy "Mitglieder antworten in freigegebenen Themen" on public.forum_posts;

create policy "Mitglieder antworten in offenen Themen"
  on public.forum_posts for insert
  to authenticated
  with check (
    (select public.is_active_member())
    and author_id = (select auth.uid())
    and status = 'approved'
    and exists (
      select 1 from public.forum_threads t
      where t.id = thread_id and t.status = 'approved' and t.locked = false
    )
  );

-- Neue Antwort: Thema nach oben, letzte Autorin merken
create or replace function public.forum_touch_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.forum_threads
  set last_activity_at = new.created_at, last_author_id = new.author_id
  where id = new.thread_id;
  return new;
end;
$$;

revoke execute on function public.forum_touch_thread() from public, anon, authenticated;
