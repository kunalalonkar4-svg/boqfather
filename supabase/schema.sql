-- BOQFather database. Applied on 3 Nov 2026 to Supabase project `boqfather` (tkxkexslvlelhzaivvgd, Mumbai).
-- For a new project: Dashboard → SQL Editor → New query → paste → Run.

-- One row per user (created automatically on first login).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  phone text,
  email text,
  name text,
  -- Pro monthly plan valid until this time
  pro_until timestamptz,
  -- name and logo printed on Pro PDF / Excel
  brand_name text,
  brand_logo text,
  created_at timestamptz default now()
);

-- Saved estimates / plans. `data` is the whole tool state; `pro` = unlocked with the ₹199 project plan.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null default 'My house',
  kind text not null default 'boq',
  data jsonb not null,
  pro boolean not null default false,
  share_token text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists projects_user on public.projects (user_id, updated_at desc);

-- Razorpay payments (written only by the server).
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  plan text not null,               -- 'project' | 'month' | 'custom'
  amount integer not null,          -- paise
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  project_id uuid references public.projects on delete set null,
  status text not null default 'created', -- created | paid
  created_at timestamptz default now()
);

-- Paid custom naksha requests.
create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  details jsonb not null,
  payment_id uuid references public.payments on delete set null,
  status text not null default 'new',     -- new | in_progress | delivered
  created_at timestamptz default now()
);

-- Count of AI reads (plans / bills) per user per day, to stop abuse.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null default current_date,
  reads integer not null default 0,
  primary key (user_id, day)
);

-- Row level security: each user sees only their own rows; payments and usage are written by the server.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.custom_orders enable row level security;
alter table public.ai_usage enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using ((select auth.uid()) = id);
drop policy if exists "own profile brand" on public.profiles;
create policy "own profile brand" on public.profiles for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
-- a user may not give themself Pro: pro_until is changed only by the server (service role)
revoke update on public.profiles from authenticated;
grant update (name, brand_name, brand_logo) on public.profiles to authenticated;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
-- only the server marks a project as paid (column grants: users can change everything except `pro`)
revoke update on public.projects from authenticated;
grant update (name, kind, data, share_token, updated_at) on public.projects to authenticated;
revoke insert on public.projects from authenticated;
grant insert (user_id, name, kind, data, share_token) on public.projects to authenticated;

drop policy if exists "own payments read" on public.payments;
create policy "own payments read" on public.payments for select using ((select auth.uid()) = user_id);
drop policy if exists "own orders read" on public.custom_orders;
create policy "own orders read" on public.custom_orders for select using ((select auth.uid()) = user_id);

-- Profile row on sign-up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, phone, email, name)
  values (new.id, new.phone, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Shared project by link: anyone with the token can read the name and data (nothing else).
create or replace function public.shared_project(token text)
returns table (name text, kind text, data jsonb, updated_at timestamptz)
language sql security definer set search_path = '' stable as $$
  select p.name, p.kind, p.data, p.updated_at from public.projects p where p.share_token = token limit 1;
$$;
revoke execute on function public.shared_project(text) from public;
grant execute on function public.shared_project(text) to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- payments, orders and usage are written only by the server
revoke insert, update, delete on public.payments, public.custom_orders, public.ai_usage from authenticated, anon;

-- Newsletter sign-ups from the home page. Written and read only by the server (service role); no policies on purpose.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  status text not null default 'active',          -- active | unsubscribed
  token uuid not null unique default gen_random_uuid(), -- goes in the unsubscribe link of every email
  source text,
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.newsletter_subscribers enable row level security;
