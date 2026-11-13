-- FEMPIRE CLUB: Bilder im Magazin
-- Titelbild pro Artikel und ein öffentlicher Speicher für Magazin-Bilder (Titel- und Textbilder).

alter table public.articles
  add column cover_path    text,
  -- Beschreibung für Screenreader und Suchmaschinen
  add column cover_alt     text not null default '',
  -- Sichtbare Bildunterschrift, z. B. Foto-Credit
  add column cover_caption text not null default '';

-- Öffentlich lesbar, weil Titelbilder auch auf frei zugänglichen Seiten erscheinen.
-- Hochladen nur serverseitig nach Admin-Prüfung (Secret Key), deshalb keine Schreib-Policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('magazin', 'magazin', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
