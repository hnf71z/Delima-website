-- Quick Check: Apakah data sudah ada di database?
-- Run ini di SQL Editor untuk verify

SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles;
