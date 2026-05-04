-- KOK-OS Analytics production restaurant data model.
-- Ana proje entegrasyonu icin isletme uyelikleri, menu, masa, QR oturumu,
-- siparis kalemleri, odeme ve abonelik katmanlarini ekler.

create table if not exists public.plans (
  code text primary key
    check (code in ('trial', 'starter', 'pro', 'enterprise')),
  name text not null,
  monthly_price numeric(10, 2) not null default 0,
  max_qr_codes int,
  analytics_level text not null default 'basic',
  created_at timestamptz not null default now()
);

insert into public.plans (code, name, monthly_price, max_qr_codes, analytics_level)
values
  ('trial', 'Trial', 0, 1, 'basic'),
  ('starter', 'Starter', 699, 5, 'basic'),
  ('pro', 'Pro', 1499, null, 'advanced'),
  ('enterprise', 'Enterprise', 3499, null, 'enterprise')
on conflict (code) do update
set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  max_qr_codes = excluded.max_qr_codes,
  analytics_level = excluded.analytics_level;

alter table public.businesses
  add column if not exists external_project_user_id text,
  add column if not exists plan_code text references public.plans(code),
  add column if not exists timezone text not null default 'Europe/Istanbul';

update public.businesses
set plan_code = coalesce(plan_code, plan)
where plan_code is null;

alter table public.businesses
  drop constraint if exists businesses_plan_code_fkey;

alter table public.businesses
  add constraint businesses_plan_code_fkey
  foreign key (plan_code) references public.plans(code);

create table if not exists public.business_members (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'manager', 'staff', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  unique (business_id, auth_user_id)
);

insert into public.business_members (business_id, auth_user_id, role, status)
select id, auth_user_id, 'owner', 'active'
from public.businesses
where auth_user_id is not null
on conflict (business_id, auth_user_id) do nothing;

create table if not exists public.menus (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  menu_id bigint not null references public.menus(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  menu_id bigint references public.menus(id) on delete cascade,
  category_id bigint references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  status text not null default 'active'
    check (status in ('active', 'hidden', 'sold_out')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_tables (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  table_code text not null,
  zone text not null default 'Salon',
  seats int,
  status text not null default 'active'
    check (status in ('active', 'disabled', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, table_code)
);

create table if not exists public.qr_sessions (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  restaurant_table_id bigint references public.restaurant_tables(id) on delete set null,
  table_id text not null,
  zone text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int not null default 0,
  scan_count int not null default 1,
  status text not null default 'active'
    check (status in ('active', 'ordered', 'paid', 'abandoned', 'expired')),
  source text not null default 'qr',
  metadata jsonb not null default '{}'::jsonb
);

alter table public.orders
  add column if not exists restaurant_table_id bigint references public.restaurant_tables(id) on delete set null,
  add column if not exists qr_session_id bigint references public.qr_sessions(id) on delete set null,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists status_reason text;

create table if not exists public.order_items (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  order_id bigint not null references public.orders(id) on delete cascade,
  menu_item_id bigint references public.menu_items(id) on delete set null,
  name text not null,
  category text,
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null default 0,
  total numeric(10, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  plan_code text not null references public.plans(code),
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_started_at timestamptz,
  current_period_ends_at timestamptz,
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_subscriptions_business_active
  on public.subscriptions (business_id)
  where status in ('trialing', 'active', 'past_due');

create table if not exists public.payments (
  id bigserial primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  subscription_id bigint references public.subscriptions(id) on delete set null,
  provider text,
  external_payment_id text,
  amount numeric(10, 2) not null default 0,
  currency text not null default 'TRY',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_business_members_user on public.business_members(auth_user_id);
create index if not exists idx_business_members_business on public.business_members(business_id);
create index if not exists idx_menus_business on public.menus(business_id);
create index if not exists idx_menu_categories_menu on public.menu_categories(menu_id);
create index if not exists idx_menu_items_business on public.menu_items(business_id);
create index if not exists idx_restaurant_tables_business on public.restaurant_tables(business_id);
create index if not exists idx_qr_sessions_business_started on public.qr_sessions(business_id, started_at);
create index if not exists idx_qr_sessions_table_started on public.qr_sessions(business_id, table_id, started_at);
create index if not exists idx_orders_business_status_time on public.orders(business_id, status, created_at);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_business on public.order_items(business_id);
create index if not exists idx_payments_business_created on public.payments(business_id, created_at);

alter table public.plans enable row level security;
alter table public.business_members enable row level security;
alter table public.menus enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.qr_sessions enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

drop policy if exists "plans_authenticated_select" on public.plans;
create policy "plans_authenticated_select"
  on public.plans for select
  to authenticated
  using (true);

drop policy if exists "business_members_own_select" on public.business_members;
create policy "business_members_own_select"
  on public.business_members for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "businesses_owner_select" on public.businesses;
create policy "businesses_owner_select"
  on public.businesses for select
  to authenticated
  using (
    auth.uid() = auth_user_id
    or exists (
      select 1 from public.business_members bm
      where bm.business_id = businesses.id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "businesses_owner_update" on public.businesses;
create policy "businesses_owner_update"
  on public.businesses for update
  to authenticated
  using (
    auth.uid() = auth_user_id
    or exists (
      select 1 from public.business_members bm
      where bm.business_id = businesses.id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  )
  with check (
    (
      auth.uid() = auth_user_id
      or exists (
        select 1 from public.business_members bm
        where bm.business_id = businesses.id
          and bm.auth_user_id = auth.uid()
          and bm.role in ('owner', 'manager')
          and bm.status = 'active'
      )
    )
    and trial_max_days between 1 and 7
    and (
      trial_ends_at is null
      or trial_started_at is null
      or trial_ends_at <= trial_started_at + interval '7 days'
    )
  );

drop policy if exists "menus_member_select" on public.menus;
create policy "menus_member_select"
  on public.menus for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menus.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "menus_manager_write" on public.menus;
create policy "menus_manager_write"
  on public.menus for all
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menus.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menus.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  );

drop policy if exists "menu_categories_member_select" on public.menu_categories;
create policy "menu_categories_member_select"
  on public.menu_categories for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menu_categories.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "menu_categories_manager_write" on public.menu_categories;
create policy "menu_categories_manager_write"
  on public.menu_categories for all
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menu_categories.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menu_categories.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  );

drop policy if exists "menu_items_member_select" on public.menu_items;
create policy "menu_items_member_select"
  on public.menu_items for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menu_items.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "menu_items_manager_write" on public.menu_items;
create policy "menu_items_manager_write"
  on public.menu_items for all
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menu_items.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = menu_items.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  );

drop policy if exists "restaurant_tables_member_select" on public.restaurant_tables;
create policy "restaurant_tables_member_select"
  on public.restaurant_tables for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = restaurant_tables.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "restaurant_tables_manager_write" on public.restaurant_tables;
create policy "restaurant_tables_manager_write"
  on public.restaurant_tables for all
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = restaurant_tables.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = restaurant_tables.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  );

drop policy if exists "qr_sessions_member_select" on public.qr_sessions;
create policy "qr_sessions_member_select"
  on public.qr_sessions for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = qr_sessions.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "orders_member_select" on public.orders;
create policy "orders_member_select"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = orders.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "order_items_member_select" on public.order_items;
create policy "order_items_member_select"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = order_items.business_id
        and bm.auth_user_id = auth.uid()
        and bm.status = 'active'
    )
  );

drop policy if exists "subscriptions_member_select" on public.subscriptions;
create policy "subscriptions_member_select"
  on public.subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = subscriptions.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  );

drop policy if exists "payments_member_select" on public.payments;
create policy "payments_member_select"
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = payments.business_id
        and bm.auth_user_id = auth.uid()
        and bm.role in ('owner', 'manager')
        and bm.status = 'active'
    )
  );

grant select on public.plans to authenticated;
grant select on public.business_members to authenticated;
grant select, insert, update on public.menus to authenticated;
grant select, insert, update on public.menu_categories to authenticated;
grant select, insert, update on public.menu_items to authenticated;
grant select, insert, update on public.restaurant_tables to authenticated;
grant select on public.qr_sessions to authenticated;
grant select on public.order_items to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.payments to authenticated;
grant usage, select on all sequences in schema public to authenticated;
