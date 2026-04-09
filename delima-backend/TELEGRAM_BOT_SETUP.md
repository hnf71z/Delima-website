# 🤖 De'Lima Telegram Bot - Setup Guide

## Overview

Telegram Bot yang terintegrasi dengan dashboard admin De'Lima untuk:
- 📊 Melihat laporan dan analytics secara real-time
- ✏️ **MENGEDIT DATA** dengan perintah natural language (AI-powered)
- 📦 Create, Update, Delete orders & products

---

## 🚀 Quick Start

### Step 1: Konfigurasi Bot Token & Gemini API

File `.env` Anda harus memiliki:
```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
ADMIN_CHAT_IDS=YOUR_TELEGRAM_CHAT_ID

# Supabase (WAJIB agar bot sync dengan dashboard admin)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
AI_MODE=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE  # <-- GANTI INI
GEMINI_MODEL=gemini-2.0-flash
```

### Cara Mendapatkan Gemini API Key:

1. Kunjungi: https://aistudio.google.com/
2. Login dengan akun Google
3. Klik **"Get API Key"** di sidebar kiri
4. Klik **"Create API Key"**
5. Copy API key dan paste ke `.env`

**Gratis!** Gemini free tier: 60 requests/menit, 1500 requests/hari

### Step 2: Jalankan Backend

```bash
cd delima-backend
npm run dev
```

Anda akan melihat:
```
🚀 De'Lima Backend running on port 4000
🤖 Telegram Bot initialized successfully
👥 Admin access granted to 1 chat(s)
```

Cek status integrasi Telegram + Supabase:

```bash
curl http://localhost:4000/api/telegram/status
```

Pastikan `supabaseConfigured: true` dan `serviceRoleConfigured: true`.

### Step 3: Test Bot

Buka bot di Telegram dan kirim `/start`

---

## 📱 Commands - READ ONLY

### General
- `/start` - Mulai bot dan lihat menu
- `/help` - Tampilkan bantuan

### 📊 Laporan Keuangan
- `/revenue` - Total pendapatan dan growth
- `/growth` - Growth rate detail
- `/daily` - Laporan hari ini
- `/weekly` - Laporan minggu ini
- `/monthly` - Laporan bulan ini

### 📦 Pesanan
- `/orders` - Statistik semua pesanan
- `/recent` - 5 order terakhir
- `/pending` - Order yang masih pending

### 📦 Produk
- `/products` - Statistik produk dan top seller

### 👥 Customers
- `/customers` - Jumlah customer dan top buyers

---

## ✏️ AI COMMANDS - EDIT DATA

Bot sekarang bisa **mengedit data** dengan bahasa natural! Cukup ketik seperti Anda berbicara dengan manusia.

### 📦 CREATE ORDER

**Contoh perintah:**
```
Buat order untuk Budi, email budi@mail.com, 2 dimsum
```
```
Tambah order dari Sari, email sari@test.com, 3 infus water, catatan: urgent
```
```
Order baru untuk Ahmad, email ahmad@mail.com, phone 08123456789, 1 dimsum
```

**Bot akan reply:**
```
✅ Saya akan membuat order baru:

👤 Customer: Budi
📧 Email: budi@mail.com
📱 Phone: -

📦 Products:
  • Dimsum x2

📝 Notes: -

Ketik "konfirmasi" untuk membuat order ini, atau "batal" untuk membatalkan.
```

**Ketik:** `konfirmasi` atau `batal`

---

### 🔄 UPDATE ORDER STATUS

**Contoh perintah:**
```
Update status order abc12345 menjadi processing
```
```
Ubah status order def67890 jadi completed
```
```
Set status order #ghi11223 menjadi cancelled
```

**Status yang valid:**
- `pending` - Order menunggu
- `processing` - Sedang diproses
- `completed` - Selesai
- `cancelled` - Dibatalkan

---

### 📦 ADD PRODUCT

**Contoh perintah:**
```
Tambah produk nama Dimsum Ayam, harga 25000, stok 100
```
```
Buat product nama Infus Water, harga 15000, stock 50
```
```
Tambah produk nama Dimsum Keju, harga 30000
```

---

### 💰 UPDATE PRODUCT PRICE

**Contoh perintah:**
```
Update harga produk Dimsum menjadi 30000
```
```
Ubah harga product Infus Water jadi 20000
```
```
Ganti harga produk Dimsum Ayam menjadi 35000
```

---

### 🗑️ DELETE ORDER

**Contoh perintah:**
```
Hapus order abc12345
```
```
Delete order def67890
```
```
Remove order #ghi11223
```

⚠️ **PERINGATAN:** Order akan dihapus permanen beserta semua item-nya!

---

### 🔍 SEARCH ORDERS

**Contoh perintah:**
```
Cari order dari Budi
```
```
Search pesanan customer Sari
```
```
Lihat order untuk Ahmad
```

---

## 💡 TIPS & TRICKS

### 1. Confirmation Flow
Setiap perintah edit data akan meminta konfirmasi sebelum execute. Ini untuk mencegah perubahan yang tidak diinginkan.

```
User: "Buat order untuk Budi, email budi@mail.com, 2 dimsum"
Bot: "✅ Saya akan membuat order baru..."
User: "konfirmasi"  ← Atau "batal"
Bot: "✅ Order berhasil dibuat!"
```

### 2. Natural Language
Anda tidak perlu mengikuti format yang kaku. Bot akan mencoba memahami maksud Anda.

Contoh yang akan dipahami:
- "Buat order baru untuk John, email john@test.com, 5 dimsum"
- "Tambah order dari Jane, 2 infus water, jane@test.com"
- "Update status order abc123 jadi processing"

### 3. Case Insensitive
Huruf besar/kecil tidak berpengaruh. "Buat Order" = "buat order" = "BUAT ORDER"

---

## 🔐 Security

- ✅ **Admin-only access** - Hanya Chat ID `7444121420` yang bisa akses
- ✅ **Confirmation required** - Semua perubahan butuh konfirmasi
- ✅ **Read commands** - `/revenue`, `/orders`, dll tidak perlu konfirmasi
- ✅ **Edit commands** - Create/Update/Delete butuh konfirmasi

---

## 🛠️ Troubleshooting

### Bot tidak response

**Check 1:** Pastikan token benar
```bash
curl https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getMe
```

**Check 2:** Cek log backend
```
🤖 Telegram Bot initialized successfully
```

### "Anda tidak memiliki akses"

- Pastikan Chat ID Anda sudah benar di `ADMIN_CHAT_IDS=YOUR_TELEGRAM_CHAT_ID`
- Kirim `/start` ke bot, lalu cek apakah ada response

### Bot tidak paham perintah saya

- Coba gunakan format yang lebih jelas
- Lihat contoh di atas untuk format yang benar
- Bot masih dalam mode **rule-based**, belum full AI

---

## 🚀 Future Enhancements

- [ ] Integrasi dengan OpenAI GPT untuk pemahaman bahasa yang lebih baik
- [ ] Integrasi dengan OpenClaw AI
- [ ] Bulk operations (create multiple orders at once)
- [ ] Upload foto produk via Telegram
- [ ] Generate dan kirim laporan PDF/Excel
- [ ] Push notifications saat ada order baru
- [ ] Inline keyboard untuk interaksi lebih mudah

---

## 📞 Support

Jika ada masalah atau pertanyaan, cek log di console backend atau kunjungi dokumentasi Telegram Bot API: https://core.telegram.org/bots/api
