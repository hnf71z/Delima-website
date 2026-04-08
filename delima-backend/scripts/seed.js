require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

console.log('🌱 Seeding database...');

// Create admin user
const adminId = 'user_admin_001';
const adminEmail = 'admin@delima.com';
const adminPassword = bcrypt.hashSync('admin123', 10);
const adminName = 'Admin DeLima';

const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  db.prepare(
    'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)'
  ).run(adminId, adminEmail, adminPassword, adminName, 'admin');
  console.log('✓ Admin user created');
} else {
  console.log('✓ Admin user already exists');
}

// Create products
const products = [
  { id: 'prod_dimsum_ayam', name: 'Dimsum Ayam', category: 'dimsum', price: 25000, stock: 100, description: 'Dimsum ayam premium dengan bumbu rahasia DeLima' },
  { id: 'prod_dimsum_sayur', name: 'Dimsum Sayur', category: 'dimsum', price: 22000, stock: 80, description: 'Dimsum sehat dengan campuran sayuran segar' },
  { id: 'prod_dimsum_udang', name: 'Dimsum Udang', category: 'dimsum', price: 28000, stock: 60, description: 'Dimsum udang segar dengan tekstur kenyal' },
  { id: 'prod_infus_melon', name: 'Infus Water Melon', category: 'minuman', price: 15000, stock: 120, description: 'Air infus segar dengan buah melon pilihan' },
  { id: 'prod_infus_lemon', name: 'Infus Water Lemon', category: 'minuman', price: 15000, stock: 150, description: 'Air infus lemon yang menyegarkan dan menyehatkan' },
  { id: 'prod_infus_strawberry', name: 'Infus Water Strawberry', category: 'minuman', price: 18000, stock: 90, description: 'Air infus strawberry dengan rasa manis alami' },
];

products.forEach(product => {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(product.id);
  
  if (!existing) {
    db.prepare(
      'INSERT INTO products (id, name, category, price, stock, description) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(product.id, product.name, product.category, product.price, product.stock, product.description);
    console.log(`✓ Product created: ${product.name}`);
  }
});

// Create sample orders
const sampleOrders = [
  {
    id: 'ORD-001',
    customer_name: 'Ahmad Rizki',
    customer_email: 'ahmad@email.com',
    customer_phone: '081234567890',
    status: 'completed',
    total: 85000,
    items: [
      { product_id: 'prod_dimsum_ayam', product_name: 'Dimsum Ayam', quantity: 2, price: 25000 },
      { product_id: 'prod_infus_melon', product_name: 'Infus Water Melon', quantity: 1, price: 15000 },
    ],
    created_at: '2026-04-05 10:30:00',
  },
  {
    id: 'ORD-002',
    customer_name: 'Siti Nurhaliza',
    customer_email: 'siti@email.com',
    customer_phone: '081234567891',
    status: 'processing',
    total: 120000,
    items: [
      { product_id: 'prod_dimsum_sayur', product_name: 'Dimsum Sayur', quantity: 3, price: 22000 },
      { product_id: 'prod_infus_lemon', product_name: 'Infus Water Lemon', quantity: 2, price: 15000 },
    ],
    created_at: '2026-04-06 14:15:00',
  },
  {
    id: 'ORD-003',
    customer_name: 'Budi Santoso',
    customer_email: 'budi@email.com',
    customer_phone: '081234567892',
    status: 'pending',
    total: 95000,
    items: [
      { product_id: 'prod_dimsum_udang', product_name: 'Dimsum Udang', quantity: 1, price: 28000 },
      { product_id: 'prod_infus_strawberry', product_name: 'Infus Water Strawberry', quantity: 3, price: 18000 },
    ],
    created_at: '2026-04-07 09:00:00',
  },
  {
    id: 'ORD-004',
    customer_name: 'Dewi Lestari',
    customer_email: 'dewi@email.com',
    customer_phone: '081234567893',
    status: 'completed',
    total: 150000,
    items: [
      { product_id: 'prod_dimsum_ayam', product_name: 'Dimsum Ayam', quantity: 4, price: 25000 },
      { product_id: 'prod_infus_melon', product_name: 'Infus Water Melon', quantity: 2, price: 15000 },
    ],
    created_at: '2026-04-07 11:45:00',
  },
  {
    id: 'ORD-005',
    customer_name: 'Eko Prasetyo',
    customer_email: 'eko@email.com',
    customer_phone: '081234567894',
    status: 'cancelled',
    total: 50000,
    items: [
      { product_id: 'prod_infus_lemon', product_name: 'Infus Water Lemon', quantity: 5, price: 15000 },
    ],
    created_at: '2026-04-07 16:20:00',
  },
];

sampleOrders.forEach(order => {
  const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(order.id);
  
  if (!existing) {
    db.prepare(
      'INSERT INTO orders (id, customer_name, customer_email, customer_phone, status, total, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(order.id, order.customer_name, order.customer_email, order.customer_phone, order.status, order.total, '', order.created_at);
    
    order.items.forEach((item, index) => {
      const itemId = `item_${order.id}_${index}`;
      db.prepare(
        'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(itemId, order.id, item.product_id, item.product_name, item.quantity, item.price);
    });
    
    console.log(`✓ Order created: ${order.id}`);
  }
});

console.log('✅ Database seeding completed!');
