-- Fix Order Statuses
-- Run ini untuk update status orders yang sudah ada

UPDATE orders SET 
  status = 'completed',
  total = 85000,
  customer_name = 'Ahmad Rizki',
  customer_email = 'ahmad@email.com',
  customer_phone = '081234567890',
  updated_at = now()
WHERE id = 'b0000000-0000-0000-0000-000000000001';

UPDATE orders SET 
  status = 'processing',
  total = 120000,
  customer_name = 'Siti Nurhaliza',
  customer_email = 'siti@email.com',
  customer_phone = '081234567891',
  updated_at = now()
WHERE id = 'b0000000-0000-0000-0000-000000000002';

UPDATE orders SET 
  status = 'pending',
  total = 95000,
  customer_name = 'Budi Santoso',
  customer_email = 'budi@email.com',
  customer_phone = '081234567892',
  updated_at = now()
WHERE id = 'b0000000-0000-0000-0000-000000000003';

UPDATE orders SET 
  status = 'completed',
  total = 150000,
  customer_name = 'Dewi Lestari',
  customer_email = 'dewi@email.com',
  customer_phone = '081234567893',
  updated_at = now()
WHERE id = 'b0000000-0000-0000-0000-000000000004';

UPDATE orders SET 
  status = 'cancelled',
  total = 50000,
  customer_name = 'Eko Prasetyo',
  customer_email = 'eko@email.com',
  customer_phone = '081234567894',
  updated_at = now()
WHERE id = 'b0000000-0000-0000-0000-000000000005';
