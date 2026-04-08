const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all products
router.get('/', (req, res) => {
  try {
    const { category, active } = req.query;
    
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (active !== undefined) {
      conditions.push('is_active = ?');
      params.push(active === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params);
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/', (req, res) => {
  try {
    const { name, category, price, stock, description, image_url } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `prod_${Date.now()}`;

    db.prepare(
      'INSERT INTO products (id, name, category, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name, category, price, stock || 0, description || '', image_url || '');

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.patch('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, category, price, stock, description, image_url, is_active } = req.body;

    db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          price = COALESCE(?, price),
          stock = COALESCE(?, stock),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, category, price, stock, description, image_url, is_active, req.params.id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
