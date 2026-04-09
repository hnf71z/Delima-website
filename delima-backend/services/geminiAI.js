const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabaseDataService = require('./supabaseDataService');

class GeminiAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.pendingConfirmations = new Map();
    
    this.initialize();
  }

  isRateLimitError(error) {
    const message = (error && error.message ? error.message : '').toLowerCase();
    return message.includes('429')
      || message.includes('too many requests')
      || message.includes('quota exceeded')
      || message.includes('rate limit');
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('⚠️  Gemini AI: API Key not configured. Using rule-based fallback.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      this.initialized = true;
      console.log('🧠 Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  /**
   * Parse pesan user dengan Gemini AI
   */
  async parseMessage(message, chatId) {
    if (!this.initialized) {
      return {
        success: false,
        requiresConfirmation: false,
        response: `⚠️ Gemini AI belum dikonfigurasi.

Silakan tambahkan GEMINI_API_KEY di file .env.

Untuk sementara, gunakan command:
• /revenue - Lihat pendapatan
• /orders - Lihat statistik order
• /help - Lihat semua command`
      };
    }

    const prompt = this.buildPrompt(message);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response dari AI
      const aiResponse = this.parseAIResponse(text);

      if (!aiResponse || !aiResponse.action) {
        return {
          success: false,
          requiresConfirmation: false,
          response: this.getHelpMessage()
        };
      }

      // Handle help atau info request
      if (aiResponse.action === 'help' || aiResponse.action === 'info') {
        return {
          success: true,
          requiresConfirmation: false,
          response: aiResponse.message || this.getHelpMessage()
        };
      }

      // Handle data query (read-only)
      if (aiResponse.action === 'query_data') {
        const queryResult = await this.executeQuery(aiResponse);
        return {
          success: true,
          requiresConfirmation: false,
          response: queryResult
        };
      }

      // Handle CRUD operations (needs confirmation)
      if (['create_order', 'update_order', 'update_order_status', 'create_product', 'update_product', 'delete_order', 'update_customer'].includes(aiResponse.action)) {
        const actionData = {
          type: aiResponse.action,
          ...aiResponse.data,
          timestamp: Date.now()
        };

        this.pendingConfirmations.set(chatId, actionData);

        return {
          success: true,
          requiresConfirmation: true,
          action: aiResponse.action,
          data: actionData,
          response: this.formatConfirmationMessage(aiResponse.action, aiResponse.data)
        };
      }

      // Jika AI tidak yakin
      if (aiResponse.confidence < 0.7) {
        return {
          success: false,
          requiresConfirmation: false,
          response: `🤔 Saya kurang yakin dengan permintaan Anda.

Bisa jelaskan lebih detail? Atau gunakan command:
• /help - Lihat daftar command
• /revenue - Lihat pendapatan
• /orders - Lihat statistik`
        };
      }

      return {
        success: false,
        requiresConfirmation: false,
        response: this.getHelpMessage()
      };

    } catch (error) {
      console.error('❌ Gemini AI Error:', error);
      const isRateLimited = this.isRateLimitError(error);
      return {
        success: false,
        requiresConfirmation: false,
        errorType: isRateLimited ? 'RATE_LIMIT' : 'AI_ERROR',
        canFallbackToRuleParser: isRateLimited,
        response: isRateLimited
          ? '⚠️ Kuota Gemini sedang habis. Saya akan coba proses pakai mode lokal (rule-based).'
          : `❌ Terjadi error saat memproses dengan AI. Coba lagi dalam beberapa detik.

Error: ${error.message}`
      };
    }
  }

  /**
   * Build prompt untuk Gemini
   */
  buildPrompt(userMessage) {
    return `
Anda adalah asisten AI untuk dashboard admin De'Lima (restoran). 
Tugas Anda adalah memahami perintah user dalam bahasa Indonesia atau Inggris, lalu mengekstrak informasi ke format JSON.

CONTOH PERMINTAAN YANG VALID:

1. **Buat Order Baru:**
   - "Buat order untuk Budi, email budi@mail.com, 2 dimsum, catatan: urgent"
   - "Tambah order dari Sari, 3 infus water, sari@test.com"

2. **Update Status Order:**
   - "Update status order abc12345 menjadi processing"
   - "Ubah status order def67890 jadi completed"
   - Status valid: pending, processing, completed, cancelled

3. **Buat Produk Baru:**
   - "Tambah produk nama Dimsum Ayam, harga 25000, stok 100"
   - "Buat product Infus Water, harga 15000, stock 50"

4. **Update Harga Produk:**
   - "Update harga produk Dimsum menjadi 30000"
   - "Ubah harga product Infus Water jadi 20000"

5. **Hapus Order:**
   - "Hapus order abc12345"
   - "Delete order def67890"

6. **Update Info Customer:**
   - "Update email customer order abc123 menjadi newemail@mail.com"
   - "Ubah phone pelanggan order def67890 jadi 08123456789"

7. **Lihat Data (Query):**
   - "Berapa total revenue bulan ini?"
   - "Lihat order terakhir"
   - "Berapa jumlah customer?"
   - "Lihat produk terlaris"

8. **Lihat Order Customer:**
   - "Cari order dari Budi"
   - "Lihat pesanan customer Sari"

PENTING:
- Ekstrak informasi dari pesan user
- Jika permintaan edit data (create/update/delete), set "requires_confirmation": true
- Jika permintaan lihat data saja, set "action": "query_data"
- Berikan confidence score (0-1) seberapa yakin Anda dengan parsing

RESPON HARUS DALAM FORMAT JSON:

\`\`\`json
{
  "action": "create_order|update_order_status|create_product|update_product|delete_order|update_customer|query_data|help",
  "confidence": 0.95,
  "requires_confirmation": true,
  "data": {
    // Data sesuai action
  },
  "message": "Pesan singkat untuk user (opsional)"
}
\`\`\`

CONTOH RESPON UNTUK "Buat order untuk Budi, email budi@mail.com, 2 dimsum":
\`\`\`json
{
  "action": "create_order",
  "confidence": 0.95,
  "requires_confirmation": true,
  "data": {
    "customer_name": "Budi",
    "email": "budi@mail.com",
    "products": [{"name": "Dimsum", "quantity": 2}],
    "notes": ""
  }
}
\`\`\`

CONTOH RESPON UNTUK "Update status order abc12345 menjadi processing":
\`\`\`json
{
  "action": "update_order_status",
  "confidence": 0.98,
  "requires_confirmation": true,
  "data": {
    "order_id": "abc12345",
    "new_status": "processing"
  }
}
\`\`\`

CONTOH RESPON UNTUK "Berapa total revenue?":
\`\`\`json
{
  "action": "query_data",
  "confidence": 0.95,
  "requires_confirmation": false,
  "data": {
    "query_type": "revenue"
  },
  "message": "Saya akan mengambil data revenue untuk Anda."
}
\`\`\`

PESAN USER:
"${userMessage}"

Berikan respon dalam format JSON saja, tanpa teks tambahan.
`;
  }

  /**
   * Parse JSON response dari AI
   */
  parseAIResponse(text) {
    try {
      // Extract JSON dari markdown code block jika ada
      const jsonMatch = text.match(/```json\n?([\s\S]*?)```/) || text.match(/```\n?([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      
      return JSON.parse(jsonStr.trim());
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      console.log('Raw AI response:', text);
      return null;
    }
  }

  /**
   * Execute query data
   */
  async executeQuery(aiResponse) {
    const queryType = aiResponse.data?.query_type || aiResponse.data?.type;

    switch (queryType) {
      case 'revenue': {
        const summary = await supabaseDataService.getRevenueSummary();
        return `💰 *Total Revenue*\n\nRp ${summary.total.toLocaleString('id-ID')}`;
      }

      case 'orders': {
        const stats = await supabaseDataService.getOrderStats();
        return `📦 *Order Statistics*\n\n• Total: ${stats.total}\n• Pending: ${stats.pending}\n• Processing: ${stats.processing}\n• Completed: ${stats.completed}`;
      }

      case 'recent_orders': {
        const orders = await supabaseDataService.getRecentOrders(5);
        if (orders.length === 0) return '📭 Belum ada order.';
        
        let msg = '📋 *5 Order Terbaru:*\n\n';
        orders.forEach((o, i) => {
          msg += `${i + 1}. #${o.id.slice(0, 8)} - ${o.customer_name}\n`;
          msg += `   Rp ${(o.total || 0).toLocaleString('id-ID')} | ${o.status}\n\n`;
        });
        return msg;
      }

      case 'customers': {
        const stats = await supabaseDataService.getCustomerStats();
        return `👥 *Total Customer*\n\n${stats.total} customer`;
      }

      case 'products': {
        const stats = await supabaseDataService.getProductStats();
        
        let msg = `📦 *Total Produk:* ${stats.total}\n\n*Top 5 Produk Terlaris:*\n`;
        stats.topProducts.forEach((p, i) => {
          msg += `${i + 1}. ${p.name} (${p.total_sold} terjual)\n`;
        });
        return msg;
      }

      case 'search_orders_by_customer': {
        const customerName = aiResponse.data?.customer_name;
        if (!customerName) return '❌ Nama customer tidak ditemukan.';

        const orders = await supabaseDataService.searchOrdersByCustomer(customerName, 10);

        if (orders.length === 0) {
          return `🔍 Tidak ditemukan order untuk "${customerName}".`;
        }

        let msg = `🔍 Ditemukan *${orders.length}* order untuk "${customerName}":\n\n`;
        orders.forEach((o, i) => {
          msg += `${i + 1}. #${o.id.slice(0, 8)}\n`;
          msg += `   Rp ${(o.total || 0).toLocaleString('id-ID')} | ${o.status}\n`;
          msg += `   ${new Date(o.created_at).toLocaleDateString('id-ID')}\n\n`;
        });
        return msg;
      }

      default:
        return aiResponse.message || '🤔 Saya tidak memahami permintaan Anda. Ketik /help untuk bantuan.';
    }
  }

  /**
   * Format confirmation message untuk user
   */
  formatConfirmationMessage(action, data) {
    switch (action) {
      case 'create_order':
        const productsText = (data.products || []).map(p => `  • ${p.name} x${p.quantity || 1}`).join('\n');
        return `✅ Saya akan membuat order baru:

👤 Customer: ${data.customer_name || 'Unknown'}
📧 Email: ${data.email || '-'}
📱 Phone: ${data.phone || '-'}

📦 Products:
${productsText || '  • Dimsum x1'}

📝 Notes: ${data.notes || '-'}

Ketik *"konfirmasi"* untuk membuat order ini, atau *"batal"* untuk membatalkan.`;

      case 'update_order_status':
        const statusEmoji = {
          'pending': '⏳',
          'processing': '🔄',
          'completed': '✅',
          'cancelled': '❌'
        }[data.new_status] || '📦';

        return `✅ Saya akan update status order:

📦 Order ID: #${data.order_id || 'N/A'}
${statusEmoji} Status baru: *${(data.new_status || '').toUpperCase()}*

Ketik *"konfirmasi"* untuk update, atau *"batal"* untuk membatalkan.`;

      case 'create_product':
        return `✅ Saya akan menambah produk baru:

📦 Nama: ${data.name || 'Unknown'}
💰 Harga: Rp ${(data.price || 0).toLocaleString('id-ID')}
📊 Stok: ${data.stock || 0}

Ketik *"konfirmasi"* untuk menambah produk, atau *"batal"* untuk membatalkan.`;

      case 'update_product':
        return `✅ Saya akan update harga produk:

📦 Produk: ${data.product_name || 'Unknown'}
💰 Harga baru: Rp ${(data.new_price || 0).toLocaleString('id-ID')}

Ketik *"konfirmasi"* untuk update harga, atau *"batal"* untuk membatalkan.`;

      case 'delete_order':
        return `⚠️ Saya akan menghapus order:

📦 Order ID: #${data.order_id || 'N/A'}

🚨 *PERINGATAN:* Order ini akan dihapus permanen!

Ketik *"konfirmasi"* untuk menghapus, atau *"batal"* untuk membatalkan.`;

      case 'update_customer':
        let updateText = '';
        if (data.email) updateText += `📧 Email baru: ${data.email}\n`;
        if (data.phone) updateText += `📱 Phone baru: ${data.phone}\n`;

        return `✅ Saya akan update info customer:

📦 Order ID: #${data.order_id || 'N/A'}
${updateText}
Ketik *"konfirmasi"* untuk update, atau *"batal"* untuk membatalkan.`;

      default:
        return `✅ Saya akan mengeksekusi: *${action}*

${JSON.stringify(data, null, 2)}

Ketik *"konfirmasi"* untuk melanjutkan, atau *"batal"* untuk membatalkan.`;
    }
  }

  /**
   * Execute pending action
   */
  async executePendingAction(action) {
    try {
      switch (action.type) {
        case 'create_order': {
          const createdOrder = await supabaseDataService.createOrder({
            customerName: action.customer_name || action.customerName,
            customerEmail: action.email,
            customerPhone: action.phone,
            products: action.products || [],
            notes: action.notes,
          });

          return {
            success: true,
            response: `✅ *Order berhasil dibuat!*

📦 Order ID: #${createdOrder.id.slice(0, 8)}
👤 Customer: ${action.customer_name || action.customerName}
💰 Total: Rp ${createdOrder.total.toLocaleString('id-ID')}`
          };
        }

        case 'update_order_status':
        case 'update_order': {
          const orderReference = action.order_id || action.orderId;
          const targetStatus = action.new_status || action.newStatus || action.status;

          if (!targetStatus) {
            return {
              success: false,
              response: '❌ Status baru belum disebutkan. Contoh: update status order ... menjadi processing.'
            };
          }

          const order = await supabaseDataService.updateOrderStatus(orderReference, targetStatus);
          
          if (!order) {
            return {
              success: false,
              response: `❌ Order #${orderReference} tidak ditemukan.`
            };
          }

          const statusEmoji = {
            'pending': '⏳',
            'processing': '🔄',
            'completed': '✅',
            'cancelled': '❌'
          }[order.status] || '📦';

          return {
            success: true,
            response: `✅ *Status order berhasil diupdate!*

📦 Order ID: #${order.id.slice(0, 8)}
👤 Customer: ${order.customer_name}
${statusEmoji} Status: *${order.status.toUpperCase()}*`
          };
        }

        case 'create_product': {
          const product = await supabaseDataService.createProduct({
            name: action.name,
            price: action.price,
            stock: action.stock,
            category: action.category,
          });

          return {
            success: true,
            response: `✅ *Produk berhasil ditambahkan!*

📦 Nama: ${product.name}
💰 Harga: Rp ${(product.price || 0).toLocaleString('id-ID')}
📊 Stok: ${product.stock || 0}
🏷️ Kategori: ${product.category}`
          };
        }

        case 'update_product':
        case 'update_product_price': {
          const result = await supabaseDataService.updateProductPrice(
            action.product_name || action.productName || action.name,
            action.new_price || action.newPrice || action.price
          );
          
          if (!result) {
            return {
              success: false,
              response: `❌ Produk "${action.product_name || action.productName || action.name}" tidak ditemukan.`
            };
          }

          const { before, after } = result;

          return {
            success: true,
            response: `✅ *Harga produk berhasil diupdate!*

📦 Produk: ${before.name}
💰 Harga lama: Rp ${(before.price || 0).toLocaleString('id-ID')}
💰 Harga baru: Rp ${(after.price || 0).toLocaleString('id-ID')}`
          };
        }

        case 'delete_order': {
          const orderReference = action.order_id || action.orderId;
          const order = await supabaseDataService.deleteOrder(orderReference);
          
          if (!order) {
            return {
              success: false,
              response: `❌ Order #${orderReference} tidak ditemukan.`
            };
          }

          return {
            success: true,
            response: `✅ *Order berhasil dihapus!*

📦 Order ID: #${order.id.slice(0, 8)}
👤 Customer: ${order.customer_name}
💰 Total: Rp ${order.total.toLocaleString('id-ID')}`
          };
        }

        case 'update_customer': {
          const orderReference = action.order_id || action.orderId;
          const order = await supabaseDataService.updateCustomerInfo(orderReference, {
            email: action.email,
            phone: action.phone,
          });
          
          if (!order) {
            return {
              success: false,
              response: `❌ Order #${orderReference} tidak ditemukan.`
            };
          }

          let updateText = '';
          if (order.customer_email) updateText += `📧 Email: ${order.customer_email}\n`;
          if (order.customer_phone) updateText += `📱 Phone: ${order.customer_phone}\n`;

          return {
            success: true,
            response: `✅ *Info customer berhasil diupdate!*

📦 Order ID: #${order.id.slice(0, 8)}
👤 Customer: ${order.customer_name}
${updateText}`
          };
        }

        default:
          return {
            success: false,
            response: `❌ Aksi tidak dikenali: ${action.type}`
          };
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        response: `❌ Terjadi error: ${error.message}`
      };
    }
  }

  /**
   * Get help message
   */
  getHelpMessage() {
    return `
🤖 *De'Lima AI Assistant (Powered by Gemini)*

Saya bisa membantu Anda dengan bahasa natural!

📦 *Kelola Order:*
• "Buat order untuk Budi, email budi@mail.com, 2 dimsum"
• "Update status order abc123 menjadi processing"
• "Hapus order abc12345"
• "Cari order dari Budi"

💰 *Kelola Produk:*
• "Tambah produk nama Dimsum Ayam, harga 25000, stok 100"
• "Update harga produk Dimsum menjadi 30000"

📊 *Laporan:*
• "Berapa total revenue?"
• "Lihat order terakhir"
• "Berapa jumlah customer?"

💡 *Tips:*
Cukup ketik seperti berbicara dengan manusia!
Setelah saya paham, saya akan minta konfirmasi sebelum mengubah data.
    `.trim();
  }
}

// Singleton instance
const geminiAI = new GeminiAIService();

module.exports = geminiAI;
