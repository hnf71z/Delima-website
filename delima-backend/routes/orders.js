const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all orders with pagination and filters
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(customer_name LIKE ? OR customer_email LIKE ? OR id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const orders = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...params.slice(0, -2));

    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.json({
      orders: ordersWithItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);

    res.json({ ...order, items });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items, notes } = req.body;

    if (!customer_name || !customer_email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `ORD-${Date.now()}`;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const dbInstance = db;
    const insertOrder = dbInstance.prepare(
      'INSERT INTO orders (id, customer_name, customer_email, customer_phone, total, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertItem = dbInstance.prepare(
      'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const transaction = dbInstance.transaction(() => {
      insertOrder.run(id, customer_name, customer_email, customer_phone, total, notes || '');
      
      items.forEach((item, index) => {
        const itemId = `item_${Date.now()}_${index}`;
        insertItem.run(itemId, id, item.product_id, item.product_name, item.quantity, item.price);
      });
    });

    transaction();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    res.status(201).json({ ...order, items: orderItems });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);

    res.json({ ...updatedOrder, items });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order
router.delete('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
