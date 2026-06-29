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

-- Vercel Web Analytics Drain events table
create table if not exists public.web_analytics_events (
  id uuid default uuid_generate_v4() primary key,
  event_type text not null default 'pageview',
  event_name text,
  timestamp timestamp with time zone not null,
  project_id text,
  owner_id text,
  session_id text,
  device_id text,
  origin text,
  path text,
  route text,
  referrer text,
  country text,
  device_type text,
  os_name text,
  client_name text,
  vercel_environment text,
  raw_event jsonb,
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
create index if not exists idx_web_analytics_events_timestamp on public.web_analytics_events(timestamp desc);
create index if not exists idx_web_analytics_events_event_type on public.web_analytics_events(event_type);
create index if not exists idx_web_analytics_events_device_id on public.web_analytics_events(device_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.web_analytics_events enable row level security;

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

-- Web analytics events: authenticated users can read dashboard analytics
create policy "Web analytics events are viewable by authenticated users"
  on public.web_analytics_events for select
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

-- Weekly Sales Reports table
create table if not exists public.weekly_sales_reports (
  id uuid default uuid_generate_v4() primary key,
  period_name text not null,
  total_omset integer not null check (total_omset >= 0),
  total_hpp integer not null check (total_hpp >= 0),
  net_profit integer not null,
  margin_percentage numeric,
  total_customers integer,
  total_products_sold integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Weekly Product Sales table
create table if not exists public.weekly_product_sales (
  id uuid default uuid_generate_v4() primary key,
  report_id uuid references public.weekly_sales_reports(id) on delete cascade not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 0),
  total_revenue integer not null check (total_revenue >= 0),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.weekly_sales_reports enable row level security;
alter table public.weekly_product_sales enable row level security;

-- Policies for Weekly Sales Reports
create policy "Weekly sales reports are viewable by authenticated users"
  on public.weekly_sales_reports for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can manage weekly sales reports"
  on public.weekly_sales_reports for all
  using (auth.role() = 'authenticated');

-- Policies for Weekly Product Sales
create policy "Weekly product sales are viewable by authenticated users"
  on public.weekly_product_sales for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can manage weekly product sales"
  on public.weekly_product_sales for all
  using (auth.role() = 'authenticated');

-- Triggers for updated_at
create trigger handle_updated_at_weekly_sales_reports
  before update on public.weekly_sales_reports
  for each row
  execute function public.handle_updated_at();

-- Weekly Web Analytics table (ringkasan pengunjung website per minggu / 4 stage)
create table if not exists public.weekly_web_analytics (
  id uuid default uuid_generate_v4() primary key,
  stage text not null,
  week_number integer not null check (week_number between 1 and 4),
  visitors integer not null default 0 check (visitors >= 0),
  page_views integer not null default 0 check (page_views >= 0),
  period_start date,
  period_end date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (week_number)
);

-- Enable RLS
alter table public.weekly_web_analytics enable row level security;

-- Policies for Weekly Web Analytics
create policy "Weekly web analytics are viewable by authenticated users"
  on public.weekly_web_analytics for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can manage weekly web analytics"
  on public.weekly_web_analytics for all
  using (auth.role() = 'authenticated');

-- Index for ordered reads
create index if not exists idx_weekly_web_analytics_week on public.weekly_web_analytics(week_number);

-- Trigger for updated_at
create trigger handle_updated_at_weekly_web_analytics
  before update on public.weekly_web_analytics
  for each row
  execute function public.handle_updated_at();
