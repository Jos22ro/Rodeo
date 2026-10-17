-- Supabase schema for sistema_ganaderia
-- Execute this in the Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null check (role in ('owner', 'capataz', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cows table
create table if not exists public.cows (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  active boolean not null default true,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz
);

-- Milkings table (ordeños)
create table if not exists public.milkings (
  id uuid primary key default uuid_generate_v4(),
  cow_id uuid references public.cows(id) on delete cascade not null,
  date date not null,
  shift text not null check (shift in ('morning', 'afternoon')),
  liters numeric(5,2) not null check (liters >= 0 and liters <= 100),
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz,
  unique(cow_id, date, shift)
);

-- Dispatches table (despachos)
create table if not exists public.dispatches (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  shift text check (shift in ('morning', 'afternoon')),
  liters numeric(7,2) not null check (liters > 0),
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz
);

-- Indexes
create index if not exists idx_cows_active on public.cows(active);
create index if not exists idx_cows_code on public.cows(code);
create index if not exists idx_milkings_cow_date on public.milkings(cow_id, date);
create index if not exists idx_milkings_date on public.milkings(date);
create index if not exists idx_dispatches_date on public.dispatches(date);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.cows enable row level security;
alter table public.milkings enable row level security;
alter table public.dispatches enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can update profiles"
  on public.profiles for update
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Cows policies
create policy "Authenticated users can view cows"
  on public.cows for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert cows"
  on public.cows for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update cows"
  on public.cows for update
  using (auth.role() = 'authenticated');

-- Milkings policies
create policy "Authenticated users can view milkings"
  on public.milkings for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert milkings"
  on public.milkings for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update milkings"
  on public.milkings for update
  using (auth.role() = 'authenticated');

-- Dispatches policies
create policy "Authenticated users can view dispatches"
  on public.dispatches for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert dispatches"
  on public.dispatches for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update dispatches"
  on public.dispatches for update
  using (auth.role() = 'authenticated');

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'capataz')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grant permissions
grant usage on schema public to authenticated;
grant all on public.profiles to authenticated;
grant all on public.cows to authenticated;
grant all on public.milkings to authenticated;
grant all on public.dispatches to authenticated;
grant execute on function public.handle_new_user() to authenticated;
