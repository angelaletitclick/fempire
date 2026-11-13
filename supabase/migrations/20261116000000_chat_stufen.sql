-- FEMPIRE CLUB: Chat nach Mitgliedschaft
-- Mitglieder schreiben an die eigene und an niedrigere Stufen. Das Team (Admins) schreibt an alle
-- und ist für alle erreichbar. Wer angeschrieben wurde, darf in dieser Unterhaltung antworten.

-- Rangfolge der Mitgliedschaften
create or replace function public.tier_rank(p_tier text)
returns integer
language sql
immutable
as $$
  select case p_tier
    when 'community' then 1
    when 'founder' then 2
    when 'leader' then 3
    when 'mastermind' then 4
    else 0
  end;
$$;

-- Darf die angemeldete Person dieser Person schreiben?
create or replace function public.can_message(p_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members s
    join public.members r on r.user_id = p_recipient
    where s.user_id = (select auth.uid())
      and s.user_id <> r.user_id
      and (s.role = 'admin' or s.status = 'active')
      and (r.role = 'admin' or r.status = 'active')
      and (
        s.role = 'admin'
        or r.role = 'admin'
        or public.tier_rank(s.tier) >= public.tier_rank(r.tier)
        -- Antwort auf eine Nachricht, die die andere Person zuerst geschickt hat
        or exists (
          select 1 from public.messages m
          where m.sender_id = r.user_id and m.recipient_id = s.user_id
        )
      )
  );
$$;

revoke execute on function public.can_message(uuid) from public, anon;
grant execute on function public.can_message(uuid) to authenticated;

drop policy "Mitglieder schreiben Nachrichten" on public.messages;

create policy "Mitglieder schreiben Nachrichten"
  on public.messages for insert
  to authenticated
  with check (
    (select public.is_active_member())
    and sender_id = (select auth.uid())
    and read_at is null
    and (select public.can_message(recipient_id))
  );
