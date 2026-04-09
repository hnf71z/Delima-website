const TelegramBot = require('node-telegram-bot-api');
const supabaseDataService = require('./supabaseDataService');
const geminiAI = require('./geminiAI');
const aiParser = require('./aiParser'); // Fallback

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.adminChatIds = [];
    this.initialized = false;
    this.pendingActions = new Map(); // Track pending AI actions
  }

  initialize() {
    if (this.initialized) return;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminIds = process.env.ADMIN_CHAT_IDS;

    if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
      console.log('⚠️  Telegram Bot: Token not configured. Skipping initialization.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.adminChatIds = adminIds && adminIds !== 'YOUR_CHAT_ID_HERE' 
        ? adminIds.split(',').map(id => id.trim())
        : [];

      console.log('🤖 Telegram Bot initialized successfully');
      if (this.adminChatIds.length > 0) {
        console.log(`👥 Admin access granted to ${this.adminChatIds.length} chat(s)`);
      }

      this.setupHandlers();
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram Bot:', error.message);
    }
  }

  isAdmin(chatId) {
    if (this.adminChatIds.length === 0) return true; // No restrictions if no admin IDs set
    return this.adminChatIds.includes(chatId.toString());
  }

  setupHandlers() {
    if (!this.bot) return;

    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses untuk menggunakan bot ini.');
        return;
      }

      const welcomeMessage = `
🎉 *Selamat datang di De'Lima Bot!*

Saya adalah asisten bot untuk dashboard admin De'Lima. Saya bisa membantu Anda:

📊 *Laporan & Analytics*
• /revenue - Total pendapatan
• /orders - Statistik pesanan
• /products - Statistik produk
• /customers - Jumlah customer
• /growth - Growth rate

📦 *Pesanan Terbaru*
• /recent - 5 order terakhir
• /pending - Order pending

📈 *Laporan Detail*
• /daily - Laporan hari ini
• /weekly - Laporan minggu ini
• /monthly - Laporan bulan ini

💡 *Tips:*
Ketik command di atas untuk melihat data real-time dari dashboard.
      `.trim();

      this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      const helpMessage = `
📖 *Daftar Command Tersedia:*

*General:*
/start - Mulai bot
/help - Tampilan bantuan

*Laporan Keuangan:*
/revenue - Total pendapatan
/growth - Growth rate
/daily - Laporan hari ini
/weekly - Laporan minggu ini
/monthly - Laporan bulan ini

*Pesanan:*
/orders - Statistik pesanan
/recent - 5 order terakhir
/pending - Order pending

*Produk:*
/products - Statistik produk

*Customers:*
/customers - Jumlah customer

💡 Semua data diambil real-time dari database.
      `.trim();

      this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle /revenue command
    this.bot.onText(/\/revenue/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil data revenue...');
        
        const revenueData = await this.getTotalRevenue();
        const message = `
💰 *Total Revenue*

${revenueData.formattedTotal}

📊 *Detail:*
• Revenue bulan ini: ${revenueData.thisMonth}
• Bulan lalu: ${revenueData.lastMonth}
• Growth: ${revenueData.growthRate}%
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching revenue:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data revenue. Coba lagi nanti.');
      }
    });

    // Handle /orders command
    this.bot.onText(/\/orders/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil data orders...');
        
        const ordersData = await this.getOrderStats();
        const message = `
📦 *Order Statistics*

*Total Orders:* ${ordersData.total}

*By Status:*
• Pending: ${ordersData.pending}
• Processing: ${ordersData.processing}
• Completed: ${ordersData.completed}
• Cancelled: ${ordersData.cancelled}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data orders. Coba lagi nanti.');
      }
    });

    // Handle /recent command
    this.bot.onText(/\/recent/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil order terbaru...');
        
        const recentOrders = await this.getRecentOrders(5);
        
        if (recentOrders.length === 0) {
          this.bot.sendMessage(chatId, '📭 Belum ada pesanan.');
          return;
        }

        let message = '📋 *5 Order Terbaru:*\n\n';
        recentOrders.forEach((order, index) => {
          const statusEmoji = {
            pending: '⏳',
            processing: '🔄',
            completed: '✅',
            cancelled: '❌'
          }[order.status] || '📦';

          message += `${index + 1}. *#${order.id.slice(0, 8)}*\n`;
          message += `   Customer: ${order.customer_name}\n`;
          message += `   Total: Rp ${this.formatNumber(order.total)}\n`;
          message += `   Status: ${statusEmoji} ${order.status}\n`;
          message += `   Tanggal: ${this.formatDate(order.created_at)}\n\n`;
        });

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data order. Coba lagi nanti.');
      }
    });

    // Handle /pending command
    this.bot.onText(/\/pending/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil order pending...');
        
        const pendingOrders = await this.getPendingOrders();
        
        if (pendingOrders.length === 0) {
          this.bot.sendMessage(chatId, '✅ Tidak ada order pending.');
          return;
        }

        let message = `⏳ *Order Pending (${pendingOrders.length}):*\n\n`;
        pendingOrders.forEach((order, index) => {
          message += `${index + 1}. *#${order.id.slice(0, 8)}*\n`;
          message += `   Customer: ${order.customer_name}\n`;
          message += `   Total: Rp ${this.formatNumber(order.total)}\n`;
          message += `   Tanggal: ${this.formatDate(order.created_at)}\n\n`;
        });

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data order pending.');
      }
    });

    // Handle /products command
    this.bot.onText(/\/products/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil data produk...');
        
        const productsData = await this.getProductStats();
        const message = `
📦 *Product Statistics*

*Total Produk:* ${productsData.total}
*Aktif:* ${productsData.active}
*Stok Habis:* ${productsData.outOfStock}

*Top 5 Produk Terlaris:*
${productsData.topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.total_sold} terjual)`).join('\n')}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching products:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data produk.');
      }
    });

    // Handle /customers command
    this.bot.onText(/\/customers/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil data customer...');
        
        const customersData = await this.getCustomerStats();
        const message = `
👥 *Customer Statistics*

*Total Customer:* ${customersData.total}

*Top 5 Customer:*
${customersData.topCustomers.map((c, i) => `${i + 1}. ${c.name} (${c.order_count} orders)`).join('\n')}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching customers:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data customer.');
      }
    });

    // Handle /growth command
    this.bot.onText(/\/growth/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Mengambil data growth...');
        
        const growthData = await this.getGrowthRate();
        const message = `
📈 *Growth Rate*

*Growth:* ${growthData.growthRate}%

Revenue bulan ini: Rp ${this.formatNumber(growthData.thisMonth)}
Revenue bulan lalu: Rp ${this.formatNumber(growthData.lastMonth)}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching growth:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil data growth.');
      }
    });

    // Handle /daily command
    this.bot.onText(/\/daily/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        const dailyData = await this.getDailyReport();
        const message = `
📅 *Laporan Hari Ini*
*Tanggal:* ${dailyData.date}

💰 *Revenue:* Rp ${this.formatNumber(dailyData.revenue)}
📦 *Orders:* ${dailyData.orders}
👥 *Customers:* ${dailyData.newCustomers}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching daily report:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil laporan harian.');
      }
    });

    // Handle /weekly command
    this.bot.onText(/\/weekly/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        const weeklyData = await this.getWeeklyReport();
        const message = `
📊 *Laporan Minggu Ini*

💰 *Total Revenue:* Rp ${this.formatNumber(weeklyData.revenue)}
📦 *Total Orders:* ${weeklyData.orders}
📈 *Rata-rata/hari:* Rp ${this.formatNumber(weeklyData.dailyAverage)}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching weekly report:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil laporan mingguan.');
      }
    });

    // Handle /monthly command
    this.bot.onText(/\/monthly/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (!this.isAdmin(chatId)) {
        this.bot.sendMessage(chatId, '❌ Anda tidak memiliki akses.');
        return;
      }

      try {
        const monthlyData = await this.getMonthlyReport();
        const message = `
📅 *Laporan Bulan Ini*
*Bulan:* ${monthlyData.month}

💰 *Total Revenue:* Rp ${this.formatNumber(monthlyData.revenue)}
📦 *Total Orders:* ${monthlyData.orders}
👥 *Total Customers:* ${monthlyData.customers}
📊 *Rata-rata/hari:* Rp ${this.formatNumber(monthlyData.dailyAverage)}
        `.trim();

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching monthly report:', error);
        this.bot.sendMessage(chatId, '❌ Gagal mengambil laporan bulanan.');
      }
    });

    // Handle unknown commands
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!this.isAdmin(chatId)) return;
      if (!text) return;
      
      // Check if this is a confirmation message
      if (this.pendingActions.has(chatId)) {
        try {
          const confirmResult = await this.handleConfirmation(chatId, text);
          if (confirmResult.response) {
            await this.safeSendMessage(chatId, confirmResult.response);
          }
        } catch (error) {
          console.error('Error handling confirmation:', error);
          await this.bot.sendMessage(chatId, '❌ Terjadi error saat memproses konfirmasi.').catch(() => {});
        }
        return;
      }

      // Skip if it's a command we already handle
      const knownCommands = ['/start', '/help', '/revenue', '/orders', '/recent', '/pending', '/products', '/customers', '/growth', '/daily', '/weekly', '/monthly'];
      if (text.startsWith('/') && knownCommands.includes(text)) {
        return; // Already handled by other handlers
      }

      // Try to parse with AI
      if (!text.startsWith('/')) {
        this.handleAIMessage(chatId, text);
      }
    });
  }

  /**
   * Escape text for safe display (disables Markdown formatting)
   * Use this when you want to display text exactly as-is
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeMarkdown(text) {
    if (!text) return '';
    // Escape special Markdown characters
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  }

  /**
   * Safely send a message with Markdown formatting
   * Falls back to plain text if Markdown fails
   * @param {number} chatId - Chat ID
   * @param {string} text - Message text
   * @param {object} options - Additional options
   */
  async safeSendMessage(chatId, text, options = {}) {
    try {
      // Try sending with Markdown first
      return await this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...options });
    } catch (error) {
      if (error.message && (error.message.includes('parse') || error.message.includes('ETELEGRAM'))) {
        console.warn('⚠️ Markdown parse error, sending without formatting');
        console.warn('Error:', error.message);
        console.warn('Message length:', text?.length);
        console.warn('First 100 chars:', text?.substring(0, 100));
        console.warn('Last 100 chars:', text?.substring(Math.max(0, text.length - 100)));
        
        try {
          // Try sending without Markdown formatting
          return await this.bot.sendMessage(chatId, text, { ...options });
        } catch (fallbackError) {
          console.error('❌ Failed to send message even without formatting:', fallbackError.message);
          // Last resort: send a simplified message
          return await this.bot.sendMessage(chatId, '❌ Terjadi error saat mengirim pesan. Silakan coba lagi.');
        }
      }
      throw error;
    }
  }

  /**
   * Handle AI message parsing and response
   */
  async handleAIMessage(chatId, text) {
    try {
      // Send typing indicator
      this.bot.sendChatAction(chatId, 'typing');

      let parseResult;
      let parserSource = 'rule';
      const aiMode = String(process.env.AI_MODE || 'rule').toLowerCase().trim();
      const useGemini = aiMode === 'gemini' && geminiAI.initialized;

      // Try Gemini only when explicitly enabled
      if (useGemini) {
        parseResult = await geminiAI.parseMessage(text, chatId);
        parserSource = 'gemini';

        // Auto fallback jika Gemini kena rate limit/quota
        if (!parseResult.success && parseResult.canFallbackToRuleParser) {
          await this.safeSendMessage(chatId, parseResult.response);
          parseResult = await aiParser.parseMessage(text, chatId);
          parserSource = 'rule';
        }
      } else {
        // Fallback to rule-based AI parser
        parseResult = await aiParser.parseMessage(text, chatId);
      }

      if (!parseResult.success) {
        this.safeSendMessage(chatId, parseResult.response);
        return;
      }

      // If requires confirmation, store action and ask for confirmation
      if (parseResult.requiresConfirmation && parseResult.data) {
        const pendingData = {
          ...parseResult.data,
          type: parseResult.data.type || parseResult.action || parseResult.data.action,
        };

        this.pendingActions.set(chatId, {
          ...pendingData,
          __source: parserSource,
        });
        this.safeSendMessage(chatId, parseResult.response);
        return;
      }

      // Direct response (for search queries, etc)
      this.safeSendMessage(chatId, parseResult.response);

    } catch (error) {
      console.error('Error handling AI message:', error);
      this.bot.sendMessage(chatId, '❌ Terjadi error saat memproses pesan Anda. Coba lagi.');
    }
  }

  /**
   * Handle confirmation response
   */
  async handleConfirmation(chatId, message) {
    const text = message.toLowerCase().trim();
    const normalizedText = text.replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, '').trim();
    const pendingAction = this.pendingActions.get(chatId);

    if (!pendingAction) {
      return {
        success: false,
        response: `❌ Tidak ada aksi yang pending. Ketik perintah Anda untuk memulai.`
      };
    }

    if (normalizedText === 'konfirmasi' || normalizedText === 'ya' || normalizedText === 'ok' || normalizedText === 'yes') {
      const source = pendingAction.__source || (geminiAI.initialized ? 'gemini' : 'rule');
      const actionPayload = { ...pendingAction };
      delete actionPayload.__source;

      const result = source === 'gemini'
        ? await geminiAI.executePendingAction(actionPayload)
        : await aiParser.executePendingAction(actionPayload);

      this.pendingActions.delete(chatId);
      return result;
    }

    if (normalizedText === 'batal' || normalizedText === 'batalkan' || normalizedText === 'cancel' || normalizedText === 'tidak') {
      this.pendingActions.delete(chatId);
      return {
        success: true,
        response: `✅ Aksi dibatalkan.`
      };
    }

    return {
      success: false,
      response: `Ketik *"konfirmasi"* untuk melanjutkan, atau *"batal"* untuk membatalkan.`
    };
  }

  // Helper methods untuk query database
  async getTotalRevenue() {
    const summary = await supabaseDataService.getRevenueSummary();

    return {
      formattedTotal: `Rp ${this.formatNumber(summary.total)}`,
      thisMonth: `Rp ${this.formatNumber(summary.thisMonth)}`,
      lastMonth: `Rp ${this.formatNumber(summary.lastMonth)}`,
      growthRate: summary.growthRate,
    };
  }

  async getOrderStats() {
    return supabaseDataService.getOrderStats();
  }

  async getRecentOrders(limit = 5) {
    return supabaseDataService.getRecentOrders(limit);
  }

  async getPendingOrders() {
    return supabaseDataService.getPendingOrders();
  }

  async getProductStats() {
    return supabaseDataService.getProductStats();
  }

  async getCustomerStats() {
    return supabaseDataService.getCustomerStats();
  }

  async getGrowthRate() {
    return supabaseDataService.getGrowthRate();
  }

  async getDailyReport() {
    return supabaseDataService.getDailyReport();
  }

  async getWeeklyReport() {
    return supabaseDataService.getWeeklyReport();
  }

  async getMonthlyReport() {
    return supabaseDataService.getMonthlyReport();
  }

  // Utility methods
  formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Method untuk mengirim pesan ke admin (untuk notifikasi)
  sendMessage(chatId, message, options = {}) {
    if (!this.bot || !this.initialized) {
      console.warn('Telegram Bot not initialized');
      return Promise.reject(new Error('Bot not initialized'));
    }

    return this.bot.sendMessage(chatId, message, options);
  }

  // Broadcast ke semua admin
  broadcastToAdmins(message, options = {}) {
    if (!this.bot || !this.initialized) {
      console.warn('Telegram Bot not initialized');
      return;
    }

    const adminIds = this.adminChatIds.length > 0 
      ? this.adminChatIds 
      : [];

    adminIds.forEach(chatId => {
      this.bot.sendMessage(chatId, message, options).catch(err => {
        console.error(`Failed to send message to admin ${chatId}:`, err.message);
      });
    });
  }
}

// Singleton instance
const telegramBot = new TelegramBotService();

module.exports = telegramBot;
