# 🚀 Cara Deploy De'Lima Admin ke Vercel

## ⚠️ PENTING: Struktur Project

Project ini memiliki struktur monorepo dengan 2 bagian utama:
```
Delima FullStack/
├── delima-project-website/    ← Frontend (Next.js) - INI YANG DI-DEPLOY KE VERCEL
└── delima-backend/            ← Backend (Supabase) - SUDAH ADA DI CLOUD
```

**Yang perlu di-deploy ke Vercel: `delima-project-website`**

---

## ✅ Prerequisites (Sudah Selesai)
- ✅ Data sudah ada di Supabase (Products: 6, Orders: 5, Order Items: 9)
- ✅ Frontend sudah ter-build tanpa error
- ✅ `.env.example` sudah tersedia di `delima-project-website/`

---

## 📋 Step-by-Step Deploy

### **STEP 1: Setup Environment Variables** (2 menit)

**Lokasi:** `delima-project-website/`

1. Copy file `.env.example` menjadi `.env.local`:
```bash
cd "/Users/hanifabdusy/Downloads/Delima FullStack/delima-project-website"
cp .env.example .env.local
```

2. Buka `.env.local` dan isi dengan credentials Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://oitywzooutklkhzwcrdj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_3d5hMVkO6srY1Gr-603n5Q_sNmAbo-K
```

⚠️ **JANGAN commit `.env.local` ke Git!** (Sudah ada di `.gitignore`)

---

### **STEP 2: Push Code ke GitHub** (3 menit)

**PENTING:** Pastikan hanya folder `delima-project-website` yang di-deploy ke Vercel!

```bash
cd "/Users/hanifabdusy/Downloads/Delima FullStack/delima-project-website"
git init
git add .
git commit -m "De'Lima Admin Dashboard - Ready for deploy"
```

**Buat Repository di GitHub:**
1. Buka https://github.com/new
2. Isi:
   - **Repository name**: `delima-admin`
   - **Visibility**: Private atau Public (terserah)
   - **JANGAN** centang "Add README" atau ".gitignore"
3. Klik **"Create repository"**

**Push ke GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/delima-admin.git
git branch -M main
git push -u origin main
```

Ganti `YOUR_USERNAME` dengan username GitHub Anda!

---

### **STEP 3: Deploy ke Vercel** (5 menit)

**1. Buka Vercel:**
- Go to https://vercel.com
- Klik **"Sign Up"** atau **"Log In"** (pakai GitHub account)

**2. Import Project:**
- Klik **"Add New..."** → **"Project"**
- Cari repository `delima-admin`
- Klik **"Import"**

**3. ⚠️ Configure Project Settings** (SANGAT PENTING!)

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./`  ← BIARKAN DEFAULT (jika repository hanya berisi frontend)
  
  ATAU
  
- **Root Directory**: `delima-project-website` ← PILIH INI (jika repository berisi MONOREPO)

- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)

**4. ⚠️ TAMBAH ENVIRONMENT VARIABLES** (PENTING!)

Klik **"Environment Variables"** dan tambahkan:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oitywzooutklkhzwcrdj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_3d5hMVkO6srY1Gr-603n5Q_sNmAbo-K` |

**Copy dari `.env.local` Anda!**

**5. Deploy:**
- Klik **"Deploy"**
- Tunggu 2-3 menit ⏳

**6. Selesai!**
- Anda akan dapat URL seperti: `https://delima-admin.vercel.app`
- Klik URL tersebut → dashboard sudah live! 🎉

---

### **STEP 3: Custom Domain (Optional)**

Jika punya domain sendiri (contoh: `admin.delima.com`):

1. Di Vercel Dashboard → Project Anda → **Settings** → **Domains**
2. Klik **"Add"**
3. Masukkan domain: `admin.delima.com`
4. Vercel akan beri tahu cara setup DNS di domain provider Anda
5. Tunggu SSL certificate (1-5 menit)

---

## 🔒 Security Checklist Sebelum Deploy

### ✅ Sudah OK:
- ✅ Row Level Security (RLS) aktif di Supabase
- ✅ Environment variables tidak di-commit ke Git
- ✅ `.env.local` ada di `.gitignore`

### ⚠️ Yang Perlu Anda Lakukan:

**1. Ganti Password Admin:**
- Buka Supabase Dashboard → **Authentication** → **Users**
- Klik user `admin@delima.com` → **"..."** → **"Edit user"**
- Set password baru yang **kuat** (minimal 12 karakter)
- Klik **"Save"**

**2. Enable Email Confirmation (Opsional):**
- **Authentication** → **Settings** → **Email Auth**
- Enable "Confirm email" jika ingin verifikasi email

**3. Backup Database:**
- **Project Settings** → **Database** → **Backups**
- Enable automatic backups

---

## 🧪 Test Setelah Deploy

Buka URL Vercel Anda dan test:

### ✅ Login
- [ ] Buka `/login`
- [ ] Login dengan `admin@delima.com` + password Anda
- [ ] Harus redirect ke `/dashboard`

### ✅ Dashboard
- [ ] 4 metric cards muncul (Revenue, Orders, Customers, Growth)
- [ ] Sales Overview chart tampil
- [ ] Product Distribution pie chart tampil
- [ ] Revenue by Product bar chart tampil

### ✅ Orders
- [ ] Buka `/orders`
- [ ] Tabel orders muncul (5 orders)
- [ ] Search berfungsi
- [ ] Filter by status berfungsi
- [ ] Klik eye icon → modal order details muncul

### ✅ Navigation
- [ ] Sidebar menu navigasi berfungsi
- [ ] Mobile hamburger menu berfungsi
- [ ] Logout berfungsi (redirect ke `/login`)

---

## 🐛 Troubleshooting

### Issue: "Build failed" di Vercel
**Solusi:**
- ✅ Pastikan `.env.local` **TIDAK** di-commit ke Git
- ✅ Check `.gitignore` punya `.env.local`
- ✅ Environment variables harus di-set di Vercel Settings
- ✅ Pastikan **Root Directory** benar saat configure project:
  - Jika repo hanya berisi frontend: gunakan `./`
  - Jika repo berisi monorepo: gunakan `delima-project-website`
- ✅ Cek Vercel Build Logs untuk error detail

### Issue: "Module not found: @nuxt/kit"
**Solusi:**
- ✅ Dependency `@nuxt/kit` sudah dihapus dari package.json
- ✅ Jika masih error, jalankan: `npm install` di folder `delima-project-website`
- ✅ Pastikan `package-lock.json` sudah ter-update

### Issue: Dashboard blank/error setelah deploy
**Solusi:**
- Cek Vercel Logs (Dashboard → Your Project → Logs)
- Pastikan Environment Variables sudah benar
- Cek browser console untuk error messages
- Pastikan Supabase URL dan Anon Key benar

### Issue: Login gagal
**Solusi:**
- Pastikan user sudah verified di Supabase Auth
- Cek URL Supabase dan Anon Key benar di Environment Variables
- Cek browser console untuk error detail

### Issue: Data tidak muncul
**Solusi:**
- Run query check di Supabase SQL Editor:
  ```sql
  SELECT COUNT(*) FROM products;
  SELECT COUNT(*) FROM orders;
  ```
- Pastikan RLS policies sudah aktif
- Check browser console untuk Supabase errors

### Issue: "Failed to collect page data" saat build
**Solusi:**
- Pastikan tidak ada import yang salah di file
- Cek semua component exists dan ter-import dengan benar
- Jalankan `npm run build` secara lokal untuk test

### Issue: Vercel deploy ke folder yang salah
**Solusi:**
- Saat import project di Vercel, pastikan **Root Directory** di-set ke `delima-project-website`
- Atau buat repository terpisah hanya berisi `delima-project-website`

---

## 📊 Update Setelah Deploy

**Jika ada perubahan code:**
```bash
git add .
git commit -m "Update: deskripsi perubahan"
git push
```

Vercel akan **auto-deploy** setiap ada push ke GitHub! 🎯

---

## 💡 Tips

1. **Preview Deployments**: Setiap pull request dapat preview URL
2. **Rollback**: Bisa rollback ke versi sebelumnya di Vercel Dashboard
3. **Analytics**: Enable Vercel Analytics untuk track usage
4. **Speed**: Vercel otomatis CDN ke seluruh dunia
5. **SSL**: HTTPS otomatis, tidak perlu setup manual

---

**Setelah deploy, Anda dapat:**
- ✅ Akses dashboard dari mana saja
- ✅ Data real-time dari Supabase
- ✅ Auto HTTPS/SSL
- ✅ Auto backup di Vercel
- ✅ Easy rollback jika ada masalah

**Good luck! 🚀**
