-- Supabase Database Schema for De'Lima Admin
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (Supabase Auth will handle auth, this is for profiles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text not null,
  role text default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('dimsum', 'minuman')),
  price integer not null check (price >= 0),
  stock integer default 0 check (stock >= 0),
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  total integer not null check (total >= 0),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Order items table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 0),
  created_at timestamp with time zone default now()
);

-- Indexes for better query performance
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_customer_email on public.orders(customer_email);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_active on public.products(is_active);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: authenticated users can read
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Products: everyone can read active products
create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true);

-- Products: authenticated users can manage
create policy "Authenticated users can manage products"
  on public.products for all
  using (auth.role() = 'authenticated');

-- Orders: authenticated users can read
create policy "Orders are viewable by authenticated users"
  on public.orders for select
  using (auth.role() = 'authenticated');

-- Orders: authenticated users can insert/update
create policy "Authenticated users can manage orders"
  on public.orders for all
  using (auth.role() = 'authenticated');

-- Order items: authenticated users can read
create policy "Order items are viewable by authenticated users"
  on public.order_items for select
  using (auth.role() = 'authenticated');

-- Order items: authenticated users can manage
create policy "Authenticated users can manage order items"
  on public.order_items for all
  using (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at_products
  before update on public.products
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at_orders
  before update on public.orders
  for each row
  execute function public.handle_updated_at();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile (drop if exists first)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
