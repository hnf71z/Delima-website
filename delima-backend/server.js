require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/database');
const telegramBot = require('./services/telegramBot');
const { isConfigured: isSupabaseConfigured, hasServiceRoleKey } = require('./config/supabase');

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Telegram Bot Status endpoint
app.get('/api/telegram/status', (req, res) => {
  res.json({
    initialized: telegramBot.initialized,
    adminCount: telegramBot.adminChatIds.length,
    supabaseConfigured: isSupabaseConfigured,
    serviceRoleConfigured: hasServiceRoleKey,
    message: telegramBot.initialized
      ? 'Telegram Bot is running'
      : 'Telegram Bot is not configured',
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 De'Lima Backend running on port ${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);

  // Initialize Telegram Bot
  telegramBot.initialize();
});

// Global error handlers for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection at:', promise);
  console.error('Reason:', reason);
  
  // If it's a Telegram error, log it but don't crash
  if (reason && reason.message && reason.message.includes('ETELEGRAM')) {
    console.error('⚠️ Telegram Bot error (non-critical):', reason.message);
    return; // Don't exit the process
  }
  
  // For other errors, log and potentially exit
  console.error('Stack trace:', reason?.stack || 'No stack trace');
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  
  // Graceful shutdown
  process.exit(1);
});

module.exports = app;
