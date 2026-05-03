-- ============================================================
-- Business owner auth + RLS
-- İşletme sahipleri Supabase Auth ile sadece kendi işletme verisini görür.
-- Admin/operator paneli mevcut SECURITY DEFINER RPC akışını kullanmaya devam eder.
-- ============================================================

alter table public.businesses
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists trial_started_at timestamptz not null default now(),
  add column if not exists trial_ends_at timestamptz,
  add column if not exists trial_max_days int not null default 7;

alter table public.businesses
  drop constraint if exists businesses_trial_max_days_check;

alter table public.businesses
  add constraint businesses_trial_max_days_check
  check (trial_max_days between 1 and 7);

update public.businesses
set
  trial_started_at = coalesce(trial_started_at, created_at, now()),
  trial_ends_at = coalesce(trial_ends_at, trial_started_at + interval '7 days'),
  trial_max_days = least(greatest(coalesce(trial_max_days, 7), 1), 7)
where trial_ends_at is null or trial_max_days is null;

create index if not exists idx_businesses_auth_user_id on public.businesses(auth_user_id);

alter table public.businesses enable row level security;
alter table public.scans enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

drop policy if exists "businesses_owner_select" on public.businesses;
drop policy if exists "businesses_owner_insert" on public.businesses;
drop policy if exists "businesses_owner_update" on public.businesses;
drop policy if exists "scans_owner_select" on public.scans;
drop policy if exists "scans_owner_insert" on public.scans;
drop policy if exists "orders_owner_select" on public.orders;
drop policy if exists "orders_owner_insert" on public.orders;
drop policy if exists "customers_owner_select" on public.customers;
drop policy if exists "customers_owner_insert" on public.customers;

create policy "businesses_owner_select"
  on public.businesses
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

create policy "businesses_owner_insert"
  on public.businesses
  for insert
  to authenticated
  with check (
    auth.uid() = auth_user_id
    and trial_max_days between 1 and 7
    and trial_ends_at <= trial_started_at + interval '7 days'
  );

create policy "businesses_owner_update"
  on public.businesses
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (
    auth.uid() = auth_user_id
    and trial_max_days between 1 and 7
    and trial_ends_at <= trial_started_at + interval '7 days'
  );

create policy "scans_owner_select"
  on public.scans
  for select
  to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = scans.business_id and b.auth_user_id = auth.uid()
    )
  );

create policy "scans_owner_insert"
  on public.scans
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = scans.business_id and b.auth_user_id = auth.uid()
    )
  );

create policy "orders_owner_select"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.auth_user_id = auth.uid()
    )
  );

create policy "orders_owner_insert"
  on public.orders
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.auth_user_id = auth.uid()
    )
  );

create policy "customers_owner_select"
  on public.customers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.auth_user_id = auth.uid()
    )
  );

create policy "customers_owner_insert"
  on public.customers
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.auth_user_id = auth.uid()
    )
  );

grant select, insert, update on public.businesses to authenticated;
grant select, insert on public.scans to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.customers to authenticated;
