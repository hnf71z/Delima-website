-- De'Lima Supabase Seed Data
-- Run this in Supabase SQL Editor AFTER running the schema migration

-- Note: The admin user will be created via Supabase Auth
-- Use the Supabase Dashboard > Authentication > Users to create:
-- Email: admin@delima.com
-- Password: admin123
-- The profile will be auto-created by the trigger

-- Insert Products
INSERT INTO products (id, name, category, price, stock, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Dimsum Ayam', 'dimsum', 25000, 100, 'Dimsum ayam premium dengan bumbu rahasia DeLima'),
  ('a0000000-0000-0000-0000-000000000002', 'Dimsum Sayur', 'dimsum', 22000, 80, 'Dimsum sehat dengan campuran sayuran segar'),
  ('a0000000-0000-0000-0000-000000000003', 'Dimsum Udang', 'dimsum', 28000, 60, 'Dimsum udang segar dengan tekstur kenyal'),
  ('a0000000-0000-0000-0000-000000000004', 'Infus Water Melon', 'minuman', 15000, 120, 'Air infus segar dengan buah melon pilihan'),
  ('a0000000-0000-0000-0000-000000000005', 'Infus Water Lemon', 'minuman', 15000, 150, 'Air infus lemon yang menyegarkan dan menyehatkan'),
  ('a0000000-0000-0000-0000-000000000006', 'Infus Water Strawberry', 'minuman', 18000, 90, 'Air infus strawberry dengan rasa manis alami')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Orders
INSERT INTO orders (id, customer_name, customer_email, customer_phone, status, total, notes, created_at, updated_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Ahmad Rizki', 'ahmad@email.com', '081234567890', 'completed', 85000, '', '2026-04-05 10:30:00+00', '2026-04-05 10:30:00+00'),
  ('b0000000-0000-0000-0000-000000000002', 'Siti Nurhaliza', 'siti@email.com', '081234567891', 'processing', 120000, '', '2026-04-06 14:15:00+00', '2026-04-06 14:15:00+00'),
  ('b0000000-0000-0000-0000-000000000003', 'Budi Santoso', 'budi@email.com', '081234567892', 'pending', 95000, '', '2026-04-07 09:00:00+00', '2026-04-07 09:00:00+00'),
  ('b0000000-0000-0000-0000-000000000004', 'Dewi Lestari', 'dewi@email.com', '081234567893', 'completed', 150000, '', '2026-04-07 11:45:00+00', '2026-04-07 11:45:00+00'),
  ('b0000000-0000-0000-0000-000000000005', 'Eko Prasetyo', 'eko@email.com', '081234567894', 'cancelled', 50000, '', '2026-04-07 16:20:00+00', '2026-04-07 16:20:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert Order Items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Dimsum Ayam', 2, 25000),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Infus Water Melon', 1, 15000),
  
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Dimsum Sayur', 3, 22000),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'Infus Water Lemon', 2, 15000),
  
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Dimsum Udang', 1, 28000),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'Infus Water Strawberry', 3, 18000),
  
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Dimsum Ayam', 4, 25000),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Infus Water Melon', 2, 15000),
  
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Infus Water Lemon', 5, 15000)
ON CONFLICT (id) DO NOTHING;
