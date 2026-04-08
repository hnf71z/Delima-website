const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    // Total revenue
    const { total_revenue } = db.prepare(
      "SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE status != 'cancelled'"
    ).get();

    // Total orders
    const { total_orders } = db.prepare(
      "SELECT COUNT(*) as total_orders FROM orders WHERE status != 'cancelled'"
    ).get();

    // Total customers
    const { total_customers } = db.prepare(
      "SELECT COUNT(DISTINCT customer_email) as total_customers FROM orders WHERE status != 'cancelled'"
    ).get();

    // This month's revenue
    const { monthly_revenue } = db.prepare(
      `SELECT COALESCE(SUM(total), 0) as monthly_revenue FROM orders 
       WHERE status != 'cancelled' 
       AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    ).get();

    // Last month's revenue for comparison
    const { last_month_revenue } = db.prepare(
      `SELECT COALESCE(SUM(total), 0) as last_month_revenue FROM orders 
       WHERE status != 'cancelled' 
       AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', '-1 month')`
    ).get();

    res.json({
      totalRevenue: total_revenue,
      totalOrders: total_orders,
      totalCustomers: total_customers,
      monthlyRevenue: monthly_revenue,
      lastMonthRevenue: last_month_revenue,
      growthRate: last_month_revenue > 0 
        ? (((monthly_revenue - last_month_revenue) / last_month_revenue) * 100).toFixed(1)
        : 0,
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sales data for charts (monthly)
router.get('/sales-chart', (req, res) => {
  try {
    const salesData = db.prepare(`
      SELECT 
        strftime('%b', created_at) as month,
        SUM(total) as sales,
        COUNT(*) as orders
      FROM orders
      WHERE status != 'cancelled'
        AND created_at >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY created_at ASC
    `).all();

    res.json(salesData);
  } catch (error) {
    console.error('Get sales chart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product distribution
router.get('/product-distribution', (req, res) => {
  try {
    const distribution = db.prepare(`
      SELECT 
        p.category as name,
        COUNT(oi.id) as value
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.category
    `).all();

    res.json(distribution);
  } catch (error) {
    console.error('Get product distribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get revenue by product (monthly)
router.get('/revenue-by-product', (req, res) => {
  try {
    const revenueData = db.prepare(`
      SELECT 
        strftime('%b', o.created_at) as month,
        SUM(CASE WHEN p.category = 'dimsum' THEN oi.price * oi.quantity ELSE 0 END) as dimsum,
        SUM(CASE WHEN p.category = 'minuman' THEN oi.price * oi.quantity ELSE 0 END) as "infusWater"
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status != 'cancelled'
        AND o.created_at >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', o.created_at)
      ORDER BY o.created_at ASC
    `).all();

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue by product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
