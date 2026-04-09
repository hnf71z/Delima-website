const supabaseDataService = require('./supabaseDataService');

/**
 * AI Parser untuk Telegram Bot
 * 
 * Service ini menggunakan pattern matching dan NLP sederhana untuk:
 * - Memahami intent dari pesan user
 * - Ekstrak parameter dari kalimat
 * - Execute CRUD operations
 */

class AIParser {
  constructor() {
    this.pendingConfirmations = new Map(); // Store pending confirmations
  }

  /**
   * Parse dan proses pesan dari user
   * @param {string} message - Pesan dari user
   * @param {number} chatId - Chat ID user
   * @returns {object} - Result dengan action dan response
   */
  async parseMessage(message, chatId) {
    const text = message.toLowerCase().trim();
    const originalText = message.trim();

    // 1. READ-ONLY DASHBOARD QUERIES (no confirmation)
    const dashboardQueryResult = await this.tryHandleDashboardQuery(text, originalText);
    if (dashboardQueryResult) {
      return dashboardQueryResult;
    }

    // 2. CREATE ORDER
    const orderCreateResult = this.tryParseCreateOrder(text, originalText);
    if (orderCreateResult) {
      return orderCreateResult;
    }

    // 3. UPDATE ORDER STATUS
    const orderUpdateResult = this.tryParseUpdateOrderStatus(text, originalText);
    if (orderUpdateResult) {
      return orderUpdateResult;
    }

    // 4. ADD/EDIT PRODUCT
    const productResult = this.tryParseProductAction(text, originalText);
    if (productResult) {
      return productResult;
    }

    // 5. UPDATE CUSTOMER INFO
    const customerResult = this.tryParseCustomerUpdate(text, originalText);
    if (customerResult) {
      return customerResult;
    }

    // 6. DELETE ORDER
    const deleteResult = this.tryParseDeleteOrder(text, originalText);
    if (deleteResult) {
      return deleteResult;
    }

    // 7. SEARCH ORDERS
    const searchResult = this.tryParseSearchOrders(text, originalText);
    if (searchResult) {
      if (!searchResult.success) {
        return searchResult;
      }

      try {
        const customerName = searchResult.data.customerName;
        const orders = await supabaseDataService.searchOrdersByCustomer(customerName);

        if (orders.length === 0) {
          return {
            success: true,
            requiresConfirmation: false,
            response: `🔍 Tidak ditemukan order untuk customer "${customerName}".`
          };
        }

        return {
          success: true,
          requiresConfirmation: false,
          response: `🔍 Ditemukan *${orders.length}* order untuk "${customerName}":\n\n${orders.map((order, index) => {
            const statusEmoji = {
              pending: '⏳',
              processing: '🔄',
              completed: '✅',
              cancelled: '❌'
            }[order.status] || '📦';

            return `${index + 1}. *#${order.id.slice(0, 8)}*\n   Total: Rp ${(order.total || 0).toLocaleString('id-ID')}\n   Status: ${statusEmoji} ${order.status}\n   Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`;
          }).join('\n\n')}`
        };
      } catch (error) {
        console.error('Error searching orders from Supabase:', error);
        return {
          success: false,
          requiresConfirmation: false,
          response: `❌ Gagal mencari data order di Supabase: ${error.message}`
        };
      }
    }

    // If no pattern matched
    return {
      success: false,
      response: this.getHelpMessage()
    };
  }

  containsWriteIntent(text) {
    return /\b(?:buat|tambah|create|update|ubah|ganti|set|hapus|delete|remove|aktifkan|nonaktifkan|deactivate|activate|disable|enable|matikan)\b/i.test(text);
  }

  containsReadIntent(text) {
    return /(?:lihat|tampilkan|show|cek|berapa|statistik|laporan|report|ringkasan|summary|total|jumlah|data|info)/i.test(text);
  }

  extractLimit(text, fallback = 5, max = 20) {
    const match = text.match(/(?:top|limit|sebanyak|terbaru|recent|last)\s*(\d{1,2})/i);
    if (!match) return fallback;

    const parsed = parseInt(match[1], 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
  }

  formatCurrency(value) {
    return `Rp ${(value || 0).toLocaleString('id-ID')}`;
  }

  formatOrderList(orders, title) {
    if (!orders || orders.length === 0) {
      return `📭 ${title}\n\nBelum ada data.`;
    }

    return `${title}\n\n${orders.map((order, index) => {
      const statusEmoji = {
        pending: '⏳',
        processing: '🔄',
        completed: '✅',
        cancelled: '❌',
      }[order.status] || '📦';

      return `${index + 1}. *#${order.id.slice(0, 8)}*\n   Customer: ${order.customer_name}\n   Total: ${this.formatCurrency(order.total)}\n   Status: ${statusEmoji} ${order.status}\n   Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`;
    }).join('\n\n')}`;
  }

  async tryHandleDashboardQuery(text, originalText) {
    const hasOrderSearchByCustomer =
      /(?:cari|search|find|temukan|lookup)\s*(?:order|pesanan)/i.test(text)
      && /(?:dari|customer|pelanggan|atas\s*nama|untuk)\s+[a-z0-9]/i.test(text);

    if (hasOrderSearchByCustomer || this.containsWriteIntent(text)) {
      return null;
    }

    const hasReadIntent = this.containsReadIntent(text)
      || /(?:revenue|pendapatan|omzet|income|order|orders|pesanan|produk|products|product|customer|customers|pelanggan|growth|dashboard|grafik|chart|trend|distribusi|komposisi)/i.test(text);

    if (!hasReadIntent) {
      return null;
    }

    try {
      const wantsDashboardSummary = /(?:dashboard|ringkasan|summary|overview|metrik|metrics)/i.test(text);
      if (wantsDashboardSummary) {
        const [revenue, orders, products, customers, growth] = await Promise.all([
          supabaseDataService.getRevenueSummary(),
          supabaseDataService.getOrderStats(),
          supabaseDataService.getProductStats(),
          supabaseDataService.getCustomerStats(),
          supabaseDataService.getGrowthRate(),
        ]);

        return {
          success: true,
          requiresConfirmation: false,
          response: `📊 *Ringkasan Dashboard*\n\n💰 Revenue Total: ${this.formatCurrency(revenue.total)}\n📦 Total Order: ${orders.total}\n👥 Total Customer: ${customers.total}\n📦 Total Produk: ${products.total}\n📈 Growth Bulan Ini: ${growth.growthRate}%\n\n*Order Status:*\n• Pending: ${orders.pending}\n• Processing: ${orders.processing}\n• Completed: ${orders.completed}\n• Cancelled: ${orders.cancelled}`,
        };
      }

      const wantsDaily = /(?:laporan|report).*(?:harian|hari\s*ini|daily)|(?:hari\s*ini).*(?:laporan|report|revenue|order|pesanan)/i.test(text);
      if (wantsDaily) {
        const report = await supabaseDataService.getDailyReport();
        return {
          success: true,
          requiresConfirmation: false,
          response: `📅 *Laporan Hari Ini*\n*Tanggal:* ${report.date}\n\n💰 *Revenue:* ${this.formatCurrency(report.revenue)}\n📦 *Orders:* ${report.orders}\n👥 *Customers:* ${report.newCustomers}`,
        };
      }

      const wantsWeekly = /(?:laporan|report).*(?:mingguan|minggu\s*ini|weekly)|(?:minggu\s*ini).*(?:laporan|report|revenue|order|pesanan)/i.test(text);
      if (wantsWeekly) {
        const report = await supabaseDataService.getWeeklyReport();
        return {
          success: true,
          requiresConfirmation: false,
          response: `📊 *Laporan Minggu Ini*\n\n💰 *Total Revenue:* ${this.formatCurrency(report.revenue)}\n📦 *Total Orders:* ${report.orders}\n📈 *Rata-rata/hari:* ${this.formatCurrency(report.dailyAverage)}`,
        };
      }

      const wantsMonthly = /(?:laporan|report).*(?:bulanan|bulan\s*ini|monthly)|(?:bulan\s*ini).*(?:laporan|report|revenue|order|pesanan)/i.test(text);
      if (wantsMonthly) {
        const report = await supabaseDataService.getMonthlyReport();
        return {
          success: true,
          requiresConfirmation: false,
          response: `📅 *Laporan Bulan Ini*\n*Bulan:* ${report.month}\n\n💰 *Total Revenue:* ${this.formatCurrency(report.revenue)}\n📦 *Total Orders:* ${report.orders}\n👥 *Total Customers:* ${report.customers}\n📊 *Rata-rata/hari:* ${this.formatCurrency(report.dailyAverage)}`,
        };
      }

      const wantsRecentOrders = /(?:order|pesanan).*(?:terbaru|recent|akhir)|(?:terbaru|recent).*(?:order|pesanan)/i.test(text);
      if (wantsRecentOrders) {
        const limit = this.extractLimit(text, 5, 15);
        const orders = await supabaseDataService.getRecentOrders(limit);
        return {
          success: true,
          requiresConfirmation: false,
          response: this.formatOrderList(orders, `📋 *${limit} Order Terbaru:*`),
        };
      }

      const wantsPendingOrders = /(?:order|pesanan).*(?:pending|menunggu)|(?:pending|menunggu).*(?:order|pesanan)/i.test(text);
      if (wantsPendingOrders) {
        const allPending = await supabaseDataService.getPendingOrders();
        const limit = this.extractLimit(text, 10, 20);
        const pending = allPending.slice(0, limit);

        return {
          success: true,
          requiresConfirmation: false,
          response: this.formatOrderList(pending, `⏳ *Order Pending (${allPending.length} total):*`),
        };
      }

      const statusQueryMatch = text.match(/\b(pending|processing|completed|cancelled|selesai|batal|diproses)\b/i);
      const wantsOrderStatusCount = statusQueryMatch && /(?:order|orders|pesanan)/i.test(text) && hasReadIntent;
      if (wantsOrderStatusCount) {
        const statusMap = {
          pending: 'pending',
          processing: 'processing',
          completed: 'completed',
          cancelled: 'cancelled',
          selesai: 'completed',
          batal: 'cancelled',
          diproses: 'processing',
        };

        const requested = statusMap[statusQueryMatch[1].toLowerCase()];
        const stats = await supabaseDataService.getOrderStats();

        return {
          success: true,
          requiresConfirmation: false,
          response: `📦 *Jumlah Order ${requested.toUpperCase()}*\n\n${stats[requested] || 0} order`,
        };
      }

      const wantsOrderStats =
        /^(?:order|orders|pesanan)$/i.test(text)
        || /(?:statistik|jumlah|total).*(?:order|orders|pesanan)|(?:order|orders|pesanan).*(?:statistik|jumlah|total)/i.test(text)
        || /(?:lihat|tampilkan|show|cek)\s*(?:order|orders|pesanan)\b(?!.*(?:terbaru|recent|pending|dari|customer|pelanggan|atas\s*nama|untuk))/i.test(text);

      if (wantsOrderStats) {
        const stats = await supabaseDataService.getOrderStats();
        return {
          success: true,
          requiresConfirmation: false,
          response: `📦 *Order Statistics*\n\n• Total: ${stats.total}\n• Pending: ${stats.pending}\n• Processing: ${stats.processing}\n• Completed: ${stats.completed}\n• Cancelled: ${stats.cancelled}`,
        };
      }

      const wantsRevenueByProduct = /(?:revenue|pendapatan|omzet).*(?:produk|product)|(?:produk|product).*(?:revenue|pendapatan|omzet)/i.test(text);
      if (wantsRevenueByProduct) {
        const data = await supabaseDataService.getRevenueByProduct(6);
        if (data.length === 0) {
          return {
            success: true,
            requiresConfirmation: false,
            response: '📭 Belum ada data revenue per produk.',
          };
        }

        return {
          success: true,
          requiresConfirmation: false,
          response: `📈 *Revenue per Produk (6 Bulan)*\n\n${data.map((item) => `• ${item.month}: Dimsum ${this.formatCurrency(item.dimsum)} | Infus Water ${this.formatCurrency(item.infusWater)}`).join('\n')}`,
        };
      }

      const wantsProductDistribution = /(?:distribusi|komposisi).*(?:produk|product)|(?:produk|product).*(?:distribusi|komposisi)/i.test(text);
      if (wantsProductDistribution) {
        const distribution = await supabaseDataService.getProductDistribution();
        return {
          success: true,
          requiresConfirmation: false,
          response: `🧩 *Distribusi Produk*\n\n${distribution.map((item) => `• ${item.name}: ${item.value}`).join('\n')}`,
        };
      }

      const wantsSalesChart = /(?:grafik|chart|trend).*(?:penjualan|sales)|(?:penjualan|sales).*(?:grafik|chart|trend)/i.test(text);
      if (wantsSalesChart) {
        const sales = await supabaseDataService.getSalesChart(6);
        if (sales.length === 0) {
          return {
            success: true,
            requiresConfirmation: false,
            response: '📭 Belum ada data trend penjualan.',
          };
        }

        return {
          success: true,
          requiresConfirmation: false,
          response: `📉 *Trend Penjualan (6 Bulan)*\n\n${sales.map((item) => `• ${item.month}: ${this.formatCurrency(item.sales)} (${item.orders} order)`).join('\n')}`,
        };
      }

      const wantsProductStats =
        /^(?:produk|products?)$/i.test(text)
        || /(?:statistik|jumlah|total).*(?:produk|product)|(?:produk|product).*(?:statistik|jumlah|total|terlaris|stok)/i.test(text);

      if (wantsProductStats) {
        const stats = await supabaseDataService.getProductStats();
        return {
          success: true,
          requiresConfirmation: false,
          response: `📦 *Product Statistics*\n\n• Total Produk: ${stats.total}\n• Aktif: ${stats.active}\n• Stok Habis: ${stats.outOfStock}\n\n*Top 5 Produk Terlaris:*\n${stats.topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.total_sold} terjual)`).join('\n') || '-'}`,
        };
      }

      const wantsCustomerStats =
        /^(?:customer|customers|pelanggan)$/i.test(text)
        || /(?:statistik|jumlah|total).*(?:customer|customers|pelanggan)|(?:customer|customers|pelanggan).*(?:statistik|jumlah|total|terbanyak)/i.test(text);

      if (wantsCustomerStats) {
        const stats = await supabaseDataService.getCustomerStats();
        return {
          success: true,
          requiresConfirmation: false,
          response: `👥 *Customer Statistics*\n\n• Total Customer: ${stats.total}\n\n*Top 5 Customer:*\n${stats.topCustomers.map((c, i) => `${i + 1}. ${c.name} (${c.order_count} orders)`).join('\n') || '-'}`,
        };
      }

      const wantsGrowth = /(?:growth|pertumbuhan|kenaikan|naik\s*turun)/i.test(text);
      if (wantsGrowth) {
        const growth = await supabaseDataService.getGrowthRate();
        return {
          success: true,
          requiresConfirmation: false,
          response: `📈 *Growth Rate*\n\n• Growth: ${growth.growthRate}%\n• Bulan Ini: ${this.formatCurrency(growth.thisMonth)}\n• Bulan Lalu: ${this.formatCurrency(growth.lastMonth)}`,
        };
      }

      const wantsRevenue = /(?:revenue|pendapatan|omzet|income)/i.test(text)
        || /^(?:revenue|pendapatan|omzet)$/i.test(text);

      if (wantsRevenue) {
        const summary = await supabaseDataService.getRevenueSummary();
        return {
          success: true,
          requiresConfirmation: false,
          response: `💰 *Revenue Summary*\n\n• Total: ${this.formatCurrency(summary.total)}\n• Bulan Ini: ${this.formatCurrency(summary.thisMonth)}\n• Bulan Lalu: ${this.formatCurrency(summary.lastMonth)}\n• Growth: ${summary.growthRate}%`,
        };
      }

      return null;
    } catch (error) {
      console.error('Error processing dashboard query:', error);
      return {
        success: false,
        requiresConfirmation: false,
        response: `❌ Gagal mengambil data dashboard: ${error.message}`,
      };
    }
  }

  /**
   * Parse perintah untuk membuat order baru
   * Pattern: "buat order", "tambah order", "new order", "order baru"
   * Contoh: "buat order untuk Budi, email budi@mail.com, 2 dimsum, catatan: urgent"
   */
  tryParseCreateOrder(text, originalText) {
    const createPatterns = [
      /(?:buat|tambah|tambahkan|new|create|order\s*baru)/i
    ];

    const isCreateOrder = createPatterns.some(pattern => pattern.test(text));
    if (!isCreateOrder) return null;

    // Ekstrak customer name (setelah "untuk" atau "atas nama")
    const namePatterns = [
      /(?:untuk|atas\s*nama|customer|pelanggan)[:\s]+([a-zA-Z\s]+)/i,
      /order\s*(?:untuk|dari)\s+([a-zA-Z\s]+)/i
    ];

    let customerName = null;
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        customerName = match[1].trim();
        break;
      }
    }

    // Ekstrak email
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const emailMatch = text.match(emailPattern);
    const email = emailMatch ? emailMatch[1] : null;

    // Ekstrak phone
    const phonePattern = /(?:phone|hp|telepon|telp|no)[:\s]*(\+?[\d\s-]{8,})/i;
    const phoneMatch = text.match(phonePattern);
    const phone = phoneMatch ? phoneMatch[1].trim() : null;

    // Ekstrak products (pattern: "2 dimsum", "3 infus water")
    const productPattern = /(\d+)\s+(dimsum|infus\s*water|infus|air)/gi;
    const products = [];
    let productMatch;
    while ((productMatch = productPattern.exec(text)) !== null) {
      products.push({
        quantity: parseInt(productMatch[1]),
        productName: productMatch[2].toLowerCase().includes('dimsum') ? 'Dimsum' : 'Infus Water'
      });
    }

    // Ekstrak notes
    const notesPattern = /(?:catatan|notes|pesan|keterangan)[:\s]+(.+?)(?:\.|$)/i;
    const notesMatch = text.match(notesPattern);
    const notes = notesMatch ? notesMatch[1].trim() : null;

    // Validasi minimal
    if (!customerName && !email) {
      return {
        success: false,
        requiresConfirmation: false,
        response: `❌ Saya tidak bisa memahami detail order.

📝 Format yang benar:
"Buat order untuk [nama], email [email], [jumlah] [produk]"

Contoh:
• "Buat order untuk Budi, email budi@mail.com, 2 dimsum"
• "Tambah order dari Sari, email sari@test.com, 3 infus water, catatan: urgent"`
      };
    }

    // Simpan data untuk confirmation
    const orderData = {
      type: 'create_order',
      customerName: customerName || 'Unknown',
      email: email || '',
      phone: phone || '',
      products: products.length > 0 ? products : [{ quantity: 1, productName: 'Dimsum' }],
      notes: notes || '',
      timestamp: Date.now()
    };

    // Format produk untuk konfirmasi
    const productsText = orderData.products.map(p => 
      `  • ${p.productName} x${p.quantity}`
    ).join('\n');

    return {
      success: true,
      requiresConfirmation: true,
      action: 'create_order',
      data: orderData,
      response: `✅ Saya akan membuat order baru:

👤 Customer: ${orderData.customerName}
📧 Email: ${orderData.email || '-'}
📱 Phone: ${orderData.phone || '-'}

📦 Products:
${productsText}

📝 Notes: ${orderData.notes || '-'}

Ketik *"konfirmasi"* untuk membuat order ini, atau *"batal"* untuk membatalkan.`
    };
  }

  /**
   * Parse perintah untuk update status order
   * Pattern: "update status", "ubah status", "set status"
   * Contoh: "update status order abc123 menjadi processing"
   */
  tryParseUpdateOrderStatus(text, originalText) {
    const updatePatterns = [
      /(?:update|ubah|set|ganti)\s*status/i,
      /status\s*(?:order|pesanan)/i
    ];

    const isUpdateStatus = updatePatterns.some(pattern => pattern.test(text));
    if (!isUpdateStatus) return null;

    // Ekstrak order ID (format: abc123, atau #abc123)
    const idPattern = /(?:order|id|nomor|#?)\s*([a-f0-9]{8,})/i;
    const idMatch = text.match(idPattern);
    const orderId = idMatch ? idMatch[1] : null;

    // Ekstrak status baru
    const statusPattern = /(?:menjadi|jadi|to|set)\s*(pending|processing|completed|cancelled|selesai|batal|diproses)/i;
    const statusMatch = text.match(statusPattern);
    
    let newStatus = null;
    if (statusMatch) {
      const statusMap = {
        'pending': 'pending',
        'processing': 'processing',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'selesai': 'completed',
        'batal': 'cancelled',
        'diproses': 'processing'
      };
      newStatus = statusMap[statusMatch[1].toLowerCase()];
    }

    if (!orderId || !newStatus) {
      return {
        success: false,
        requiresConfirmation: false,
        response: `❌ Saya tidak bisa memahami perintah update status.

📝 Format yang benar:
"Update status order [order_id] menjadi [status]"

Contoh:
• "Update status order abc12345 menjadi processing"
• "Ubah status order def67890 jadi completed"
• "Set status order #ghi11223 menjadi cancelled"

Status yang valid: pending, processing, completed, cancelled`
      };
    }

    const statusEmoji = {
      'pending': '⏳',
      'processing': '🔄',
      'completed': '✅',
      'cancelled': '❌'
    };

    return {
      success: true,
      requiresConfirmation: true,
      action: 'update_order_status',
      data: {
        type: 'update_order_status',
        orderId,
        newStatus,
        timestamp: Date.now()
      },
      response: `✅ Saya akan update status order:

📦 Order ID: #${orderId.slice(0, 8)}
${statusEmoji[newStatus]} Status baru: *${newStatus.toUpperCase()}*

Ketik *"konfirmasi"* untuk update, atau *"batal"* untuk membatalkan.`
    };
  }

  /**
   * Parse perintah untuk product action
   * Pattern: "tambah produk", "edit produk", "update harga"
   */
  tryParseProductAction(text, originalText) {
    const normalizeName = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const extractByPatterns = (patterns) => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return normalizeName(match[1]);
        }
      }
      return null;
    };

    // ADD PRODUCT
    const addPatterns = [
      /(?:buat|tambah|tambahkan|new|add|create)\s*(produk|product|item)/i,
      /produk\s*(?:baru|new)/i
    ];

    const isAddProduct = addPatterns.some(pattern => pattern.test(text));
    if (isAddProduct) {
      // Ekstrak nama produk
      const namePattern = /(?:nama|name|produk|product)[:\s]+([a-zA-Z0-9\s]+)/i;
      const nameMatch = text.match(namePattern);
      const productName = nameMatch ? nameMatch[1].trim() : null;

      // Ekstrak harga
      const pricePattern = /(?:harga|price|rp|idr)[:\s]*([\d,]+\.?\d*)/i;
      const priceMatch = text.match(pricePattern);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;

      // Ekstrak stok
      const stockPattern = /(?:stok|stock|qty|quantity)[:\s]*(\d+)/i;
      const stockMatch = text.match(stockPattern);
      const stock = stockMatch ? parseInt(stockMatch[1]) : null;

      const categoryPattern = /(?:kategori|category)[:\s]*(dimsum|minuman|drink)/i;
      const categoryMatch = text.match(categoryPattern);
      const category = categoryMatch ? categoryMatch[1].toLowerCase() : null;

      if (!productName || !price) {
        return {
          success: false,
          requiresConfirmation: false,
          response: `❌ Saya tidak bisa memahami detail produk.

📝 Format yang benar:
"Tambah produk nama [nama], harga [harga], stok [jumlah]"

Contoh:
• "Tambah produk nama Dimsum Ayam, harga 25000, stok 100"
• "Buat product nama Infus Water, harga 15000, stock 50"`
        };
      }

      return {
        success: true,
        requiresConfirmation: true,
        action: 'create_product',
        data: {
          type: 'create_product',
          name: productName,
          price,
          stock: stock || 0,
          category,
          timestamp: Date.now()
        },
        response: `✅ Saya akan menambah produk baru:

📦 Nama: ${productName}
💰 Harga: Rp ${price.toLocaleString('id-ID')}
📊 Stok: ${stock || 0}

Ketik *"konfirmasi"* untuk menambah produk, atau *"batal"* untuk membatalkan.`
      };
    }

    // UPDATE PRODUCT PRICE
    const updatePricePatterns = [
      /(?:update|ubah|set|ganti)\s*(?:harga|price)/i,
      /harga\s*(?:produk|product)/i
    ];

    const isUpdatePrice = updatePricePatterns.some(pattern => pattern.test(text));
    if (isUpdatePrice) {
      const productName = extractByPatterns([
        /(?:harga|price)\s*(?:produk|product)\s+([a-zA-Z0-9\s-]+?)\s*(?:menjadi|jadi|to|=|:)/i,
        /(?:update|ubah|set|ganti)\s*(?:harga|price)\s*(?:produk|product)?\s*([a-zA-Z0-9\s-]+?)\s*(?:menjadi|jadi|to|=|:)/i,
        /(?:produk|product|nama|name)[:\s]+([a-zA-Z0-9\s-]+)/i,
      ]);

      const pricePattern = /(?:harga|price|rp|idr|menjadi|jadi)[:\s]*([\d,]+\.?\d*)/i;
      const priceMatch = text.match(pricePattern);
      const newPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;

      if (!productName || !newPrice) {
        return {
          success: false,
          requiresConfirmation: false,
          response: `❌ Saya tidak bisa memahami perintah update harga.

📝 Format yang benar:
"Update harga produk [nama] menjadi [harga]"

Contoh:
• "Update harga produk Dimsum menjadi 30000"
• "Ubah harga product Infus Water jadi 20000"`
        };
      }

      return {
        success: true,
        requiresConfirmation: true,
        action: 'update_product_price',
        data: {
          type: 'update_product_price',
          productName,
          newPrice,
          timestamp: Date.now()
        },
        response: `✅ Saya akan update harga produk:

📦 Produk: ${productName}
💰 Harga baru: Rp ${newPrice.toLocaleString('id-ID')}

Ketik *"konfirmasi"* untuk update harga, atau *"batal"* untuk membatalkan.`
      };
    }

    // UPDATE PRODUCT STOCK
    const updateStockPatterns = [
      /(?:update|ubah|set|ganti)\s*(?:stok|stock|qty|quantity)/i,
      /(?:stok|stock)\s*(?:produk|product)/i,
    ];

    const isUpdateStock = updateStockPatterns.some((pattern) => pattern.test(text));
    if (isUpdateStock) {
      const productName = extractByPatterns([
        /(?:stok|stock)\s*(?:produk|product)\s+([a-zA-Z0-9\s-]+?)\s*(?:menjadi|jadi|to|=|:)/i,
        /(?:update|ubah|set|ganti)\s*(?:stok|stock)\s*(?:produk|product)?\s*([a-zA-Z0-9\s-]+?)\s*(?:menjadi|jadi|to|=|:)/i,
        /(?:produk|product|nama|name)[:\s]+([a-zA-Z0-9\s-]+)/i,
      ]);

      const stockPattern = /(?:stok|stock|qty|quantity|menjadi|jadi|to|=|:)\s*(\d{1,6})/i;
      const stockMatch = text.match(stockPattern);
      const newStock = stockMatch ? parseInt(stockMatch[1], 10) : null;

      if (!productName || newStock === null || Number.isNaN(newStock)) {
        return {
          success: false,
          requiresConfirmation: false,
          response: `❌ Saya tidak bisa memahami perintah update stok.

📝 Format yang benar:
"Update stok produk [nama] menjadi [jumlah]"

Contoh:
• "Update stok produk Dimsum Ayam menjadi 120"
• "Ubah stock product Infus Water jadi 40"`,
        };
      }

      return {
        success: true,
        requiresConfirmation: true,
        action: 'update_product_stock',
        data: {
          type: 'update_product_stock',
          productName,
          newStock,
          timestamp: Date.now(),
        },
        response: `✅ Saya akan update stok produk:

📦 Produk: ${productName}
📊 Stok baru: ${newStock}

Ketik *"konfirmasi"* untuk update stok, atau *"batal"* untuk membatalkan.`,
      };
    }

    // ACTIVATE / DEACTIVATE PRODUCT
    const activatePatterns = [
      /(?:aktifkan|activate|enable)/i,
      /(?:nonaktif|deactivate|disable|matikan)/i,
    ];

    const isToggleActive = activatePatterns.some((pattern) => pattern.test(text))
      && /(?:produk|product)/i.test(text);

    if (isToggleActive) {
      const isActive = /(?:aktifkan|activate|enable)/i.test(text)
        && !/(?:nonaktif|deactivate|disable|matikan)/i.test(text);

      const productName = extractByPatterns([
        /(?:aktifkan|activate|enable|nonaktifkan|deactivate|disable|matikan)\s*(?:produk|product)\s+([a-zA-Z0-9\s-]+)/i,
        /(?:produk|product)\s+([a-zA-Z0-9\s-]+?)\s*(?:di)?(?:aktifkan|nonaktifkan|deactivate|disable)/i,
        /(?:produk|product|nama|name)[:\s]+([a-zA-Z0-9\s-]+)/i,
      ]);

      if (!productName) {
        return {
          success: false,
          requiresConfirmation: false,
          response: `❌ Saya tidak bisa memahami produk yang ingin diubah status aktifnya.

📝 Format yang benar:
• "Aktifkan produk [nama]"
• "Nonaktifkan produk [nama]"`,
        };
      }

      return {
        success: true,
        requiresConfirmation: true,
        action: 'set_product_active',
        data: {
          type: 'set_product_active',
          productName,
          isActive,
          timestamp: Date.now(),
        },
        response: `✅ Saya akan ${isActive ? 'mengaktifkan' : 'menonaktifkan'} produk:

📦 Produk: ${productName}
🟢 Status baru: ${isActive ? 'AKTIF' : 'NONAKTIF'}

Ketik *"konfirmasi"* untuk melanjutkan, atau *"batal"* untuk membatalkan.`,
      };
    }

    // DELETE PRODUCT
    const deletePatterns = [
      /(?:hapus|delete|remove)\s*(?:produk|product)/i,
      /(?:produk|product)\s*(?:hapus|delete|remove)/i,
    ];

    const isDeleteProduct = deletePatterns.some((pattern) => pattern.test(text));
    if (isDeleteProduct) {
      const productName = extractByPatterns([
        /(?:hapus|delete|remove)\s*(?:produk|product)\s+([a-zA-Z0-9\s-]+)/i,
        /(?:produk|product)\s+([a-zA-Z0-9\s-]+?)\s*(?:hapus|delete|remove)/i,
        /(?:produk|product|nama|name)[:\s]+([a-zA-Z0-9\s-]+)/i,
      ]);

      if (!productName) {
        return {
          success: false,
          requiresConfirmation: false,
          response: `❌ Saya tidak bisa memahami produk yang ingin dihapus.

📝 Format yang benar:
• "Hapus produk [nama]"
• "Delete product [nama]"`,
        };
      }

      return {
        success: true,
        requiresConfirmation: true,
        action: 'delete_product',
        data: {
          type: 'delete_product',
          productName,
          timestamp: Date.now(),
        },
        response: `⚠️ Saya akan menghapus produk:

📦 Produk: ${productName}

🚨 *PERINGATAN:* Produk akan dihapus permanen!

Ketik *"konfirmasi"* untuk menghapus, atau *"batal"* untuk membatalkan.`,
      };
    }

    return null;
  }

  /**
   * Parse perintah untuk update customer info
   */
  tryParseCustomerUpdate(text, originalText) {
    const patterns = [
      /(?:update|ubah|ganti)\s*(?:customer|pelanggan|email|phone|telepon)/i,
      /(?:email|phone|telepon)\s*(?:customer|pelanggan)/i
    ];

    const isCustomerUpdate = patterns.some(pattern => pattern.test(text));
    if (!isCustomerUpdate) return null;

    // Ekstrak customer identifier
    const idPattern = /(?:order|id|customer)[:\s]*([a-f0-9]{8,})/i;
    const idMatch = text.match(idPattern);
    const customerId = idMatch ? idMatch[1] : null;

    // Ekstrak email baru
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const emailMatch = text.match(emailPattern);
    const newEmail = emailMatch ? emailMatch[1] : null;

    // Ekstrak phone baru
    const phonePattern = /(?:phone|hp|telepon|telp|no)[:\s]*(\+?[\d\s-]{8,})/i;
    const phoneMatch = text.match(phonePattern);
    const newPhone = phoneMatch ? phoneMatch[1].trim() : null;

    if (!customerId || (!newEmail && !newPhone)) {
      return {
        success: false,
        requiresConfirmation: false,
        response: `❌ Saya tidak bisa memahami perintah update customer.

📝 Format yang benar:
"Update email customer order [order_id] menjadi [email]"

Contoh:
• "Update email customer order abc12345 menjadi budi@mail.com"
• "Ubah phone pelanggan order def67890 jadi 08123456789"`
      };
    }

    let updateText = '';
    if (newEmail) updateText += `📧 Email baru: ${newEmail}\n`;
    if (newPhone) updateText += `📱 Phone baru: ${newPhone}\n`;

    return {
      success: true,
      requiresConfirmation: true,
      action: 'update_customer_info',
      data: {
        type: 'update_customer_info',
        orderId: customerId,
        email: newEmail,
        phone: newPhone,
        timestamp: Date.now()
      },
      response: `✅ Saya akan update info customer:

📦 Order ID: #${customerId.slice(0, 8)}
${updateText}
Ketik *"konfirmasi"* untuk update, atau *"batal"* untuk membatalkan.`
    };
  }

  /**
   * Parse perintah untuk delete order
   */
  tryParseDeleteOrder(text, originalText) {
    const patterns = [
      /(?:hapus|delete|remove|cancel)\s*(?:order|pesanan)/i,
      /(?:order|pesanan)\s*(?:hapus|delete|remove|cancel)/i
    ];

    const isDeleteOrder = patterns.some(pattern => pattern.test(text));
    if (!isDeleteOrder) return null;

    const idPattern = /(?:order|id|nomor|#?)\s*([a-f0-9]{8,})/i;
    const idMatch = text.match(idPattern);
    const orderId = idMatch ? idMatch[1] : null;

    if (!orderId) {
      return {
        success: false,
        requiresConfirmation: false,
        response: `❌ Saya tidak bisa memahami perintah hapus order.

📝 Format yang benar:
"Hapus order [order_id]"

Contoh:
• "Hapus order abc12345"
• "Delete order def67890"`
      };
    }

    return {
      success: true,
      requiresConfirmation: true,
      action: 'delete_order',
      data: {
        type: 'delete_order',
        orderId,
        timestamp: Date.now()
      },
      response: `⚠️ Saya akan menghapus order:

📦 Order ID: #${orderId.slice(0, 8)}

🚨 *PERINGATAN:* Order ini akan dihapus permanen!

Ketik *"konfirmasi"* untuk menghapus, atau *"batal"* untuk membatalkan.`
    };
  }

  /**
   * Parse perintah untuk search orders
   */
  tryParseSearchOrders(text, originalText) {
    const patterns = [
      /(?:cari|search|find|temukan)\s*(?:order|pesanan)/i,
      /(?:order|pesanan)\s*(?:dari|customer|pelanggan|nama)/i,
      /order\s*(?:atas\s*nama|untuk)/i
    ];

    const isSearchOrder = patterns.some(pattern => pattern.test(text));
    if (!isSearchOrder) return null;

    // Ekstrak customer name
    const namePatterns = [
      /(?:dari|customer|pelanggan|nama|atas\s*nama|untuk)[:\s]+([a-zA-Z\s]+)/i
    ];

    let customerName = null;
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        customerName = match[1].trim();
        break;
      }
    }

    if (!customerName) {
      return {
        success: false,
        requiresConfirmation: false,
        response: `❌ Saya tidak bisa memahami pencarian.

📝 Format yang benar:
"Cari order dari [nama customer]"

Contoh:
• "Cari order dari Budi"
• "Search pesanan customer Sari"
• "Lihat order untuk Ahmad"`
      };
    }

    return {
      success: true,
      requiresConfirmation: false,
      action: 'search_orders',
      data: {
        customerName
      }
    };
  }

  /**
   * Handle confirmation response
   */
  async handleConfirmation(chatId, message, providedAction = null) {
    const text = message.toLowerCase().trim();
    const pendingAction = providedAction || this.pendingConfirmations.get(chatId);

    if (!pendingAction) {
      return {
        success: false,
        response: `❌ Tidak ada aksi yang pending. Ketik perintah Anda untuk memulai.`
      };
    }

    if (text === 'konfirmasi' || text === 'ya' || text === 'ok' || text === 'yes') {
      // Execute the pending action
      const result = await this.executePendingAction(pendingAction);
      if (!providedAction) {
        this.pendingConfirmations.delete(chatId);
      }
      return result;
    }

    if (text === 'batal' || text === 'batalkan' || text === 'cancel' || text === 'tidak') {
      if (!providedAction) {
        this.pendingConfirmations.delete(chatId);
      }
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

  /**
   * Execute pending action
   */
  async executePendingAction(action) {
    try {
      switch (action.type) {
        case 'create_order': {
          const createdOrder = await supabaseDataService.createOrder({
            customerName: action.customerName,
            customerEmail: action.email,
            customerPhone: action.phone,
            products: (action.products || []).map((item) => ({
              name: item.productName || item.name,
              quantity: item.quantity,
            })),
            notes: action.notes,
          });

          return {
            success: true,
            response: `✅ *Order berhasil dibuat!*

📦 Order ID: #${createdOrder.id.slice(0, 8)}
👤 Customer: ${action.customerName}
📧 Email: ${action.email || '-'}
💰 Total: Rp ${createdOrder.total.toLocaleString('id-ID')}`
          };
        }

        case 'update_order_status': {
          const order = await supabaseDataService.updateOrderStatus(action.orderId, action.newStatus);
          
          if (!order) {
            return {
              success: false,
              response: `❌ Order #${action.orderId.slice(0, 8)} tidak ditemukan.`
            };
          }

          const statusEmoji = {
            pending: '⏳',
            processing: '🔄',
            completed: '✅',
            cancelled: '❌'
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

        case 'update_product_price': {
          const result = await supabaseDataService.updateProductPrice(action.productName, action.newPrice);
          
          if (!result) {
            return {
              success: false,
              response: `❌ Produk "${action.productName}" tidak ditemukan.`
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

        case 'update_product_stock': {
          const result = await supabaseDataService.updateProductStock(action.productName, action.newStock);

          if (!result) {
            return {
              success: false,
              response: `❌ Produk "${action.productName}" tidak ditemukan.`,
            };
          }

          const { before, after } = result;

          return {
            success: true,
            response: `✅ *Stok produk berhasil diupdate!*

📦 Produk: ${before.name}
📊 Stok lama: ${before.stock || 0}
📊 Stok baru: ${after.stock || 0}`,
          };
        }

        case 'set_product_active': {
          const result = await supabaseDataService.setProductActiveState(action.productName, action.isActive);

          if (!result) {
            return {
              success: false,
              response: `❌ Produk "${action.productName}" tidak ditemukan.`,
            };
          }

          const { before, after } = result;

          return {
            success: true,
            response: `✅ *Status produk berhasil diupdate!*

📦 Produk: ${before.name}
🟡 Status lama: ${before.is_active ? 'AKTIF' : 'NONAKTIF'}
🟢 Status baru: ${after.is_active ? 'AKTIF' : 'NONAKTIF'}`,
          };
        }

        case 'delete_product': {
          const product = await supabaseDataService.deleteProduct(action.productName);

          if (!product) {
            return {
              success: false,
              response: `❌ Produk "${action.productName}" tidak ditemukan.`,
            };
          }

          return {
            success: true,
            response: `✅ *Produk berhasil dihapus!*

📦 Produk: ${product.name}
💰 Harga: Rp ${(product.price || 0).toLocaleString('id-ID')}
📊 Stok terakhir: ${product.stock || 0}`,
          };
        }

        case 'update_customer_info': {
          const order = await supabaseDataService.updateCustomerInfo(action.orderId, {
            email: action.email,
            phone: action.phone,
          });
          
          if (!order) {
            return {
              success: false,
              response: `❌ Order #${action.orderId.slice(0, 8)} tidak ditemukan.`
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

        case 'delete_order': {
          const order = await supabaseDataService.deleteOrder(action.orderId);
          
          if (!order) {
            return {
              success: false,
              response: `❌ Order #${action.orderId.slice(0, 8)} tidak ditemukan.`
            };
          }

          return {
            success: true,
            response: `✅ *Order berhasil dihapus!*

📦 Order ID: #${order.id.slice(0, 8)}
👤 Customer: ${order.customer_name}
💰 Total: Rp ${order.total.toLocaleString('id-ID')}

🗑️ Order dan semua item terkait telah dihapus.`
          };
        }

        default:
          return {
            success: false,
            response: `❌ Aksi tidak dikenali.`
          };
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        response: `❌ Terjadi error saat mengeksekusi aksi: ${error.message}`
      };
    }
  }

  /**
   * Store pending confirmation
   */
  storePendingConfirmation(chatId, actionData) {
    this.pendingConfirmations.set(chatId, actionData);
  }

  /**
   * Get help message
   */
  getHelpMessage() {
    return `
🤖 *De'Lima AI Assistant*

Saya bisa bantu semua fitur dashboard dengan mode rule-based (tanpa token AI).

📦 *Kelola Order:*
• "Buat order untuk Budi, email budi@mail.com, 2 dimsum"
• "Update status order abc123 menjadi processing"
• "Hapus order abc12345"
• "Cari order dari Budi"

🛍️ *Kelola Produk:*
• "Tambah produk nama Dimsum Ayam, harga 25000, stok 100"
• "Update harga produk Dimsum menjadi 30000"
• "Update stok produk Dimsum menjadi 80"
• "Nonaktifkan produk Dimsum"
• "Hapus produk Dimsum"

📊 *Analytics Dashboard:*
• "Lihat ringkasan dashboard"
• "Berapa total revenue?"
• "Tampilkan statistik order"
• "Lihat order terbaru"
• "Lihat order pending"
• "Tampilkan statistik produk"
• "Tampilkan statistik customer"
• "Lihat growth bulan ini"
• "Laporan harian / mingguan / bulanan"
• "Trend penjualan 6 bulan"
• "Revenue per produk"
• "Distribusi produk"

💡 *Tips:*
Gunakan bahasa natural seperti ngobrol biasa.

Setelah saya memahami perintah Anda, saya akan meminta konfirmasi sebelum mengeksekusi.
    `.trim();
  }
}

// Singleton instance
const aiParser = new AIParser();

module.exports = aiParser;
