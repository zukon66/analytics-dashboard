-- Admin/operator panelinden isletme trial suresini guvenli sekilde uzatir.
-- Ust sinir: islem anindan itibaren en fazla 7 gun.

create or replace function public.admin_extend_business_trial(
  target_business_id bigint,
  extend_days int
)
returns table (
  id bigint,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  trial_max_days int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  base_end timestamptz;
  new_end timestamptz;
begin
  if extend_days not in (1, 3, 7) then
    raise exception 'extend_days must be 1, 3, or 7';
  end if;

  select greatest(coalesce(b.trial_ends_at, now()), now())
    into base_end
  from public.businesses b
  where b.id = target_business_id
  for update;

  if base_end is null then
    raise exception 'business not found';
  end if;

  new_end := least(base_end + make_interval(days => extend_days), now() + interval '7 days');

  return query
  update public.businesses b
  set
    trial_started_at = coalesce(b.trial_started_at, now()),
    trial_ends_at = new_end,
    trial_max_days = 7,
    status = case when b.status = 'inactive' then 'trial' else b.status end
  where b.id = target_business_id
  returning b.id, b.trial_started_at, b.trial_ends_at, b.trial_max_days;
end;
$$;

grant execute on function public.admin_extend_business_trial(bigint, int) to anon, authenticated;
