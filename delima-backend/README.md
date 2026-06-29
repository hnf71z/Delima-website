# De'Lima Backend - Supabase

This project uses **Supabase** as the single source of truth for dashboard and Telegram operations.

## Architecture

```
Frontend (Next.js) → Supabase (PostgreSQL + Auth + API)
Telegram Bot (Node.js backend) → Supabase (PostgreSQL + Auth + API)
```

For the dashboard UI, Supabase can be accessed directly from frontend. Supabase provides:
- Database (PostgreSQL)
- Authentication
- Real-time subscriptions
- Storage
- Edge functions (if needed later)

For Telegram Bot automation, jalankan backend ini agar bot bisa melakukan operasi CRUD ke tabel Supabase yang sama dengan dashboard.

## Setup

### 1. SQL Files
Two SQL files are provided:

- **`supabase-schema.sql`** - Database schema with tables, policies, triggers
- **`supabase-seed.sql`** - Initial seed data (products, orders, order_items)

### 2. Setup Steps

1. Create Supabase project at https://supabase.com
2. Run `supabase-schema.sql` in SQL Editor
3. Create admin user in Authentication → Users
4. Run `supabase-seed.sql` in SQL Editor
5. Update frontend `.env.local` with Supabase credentials
6. Deploy frontend to Vercel

See full instructions in: **`../DEPLOYMENT-GUIDE.md`**

## Database Schema

### Tables
- `profiles` - User profiles (linked to auth.users)
- `products` - Product catalog (dimsum, minuman)
- `orders` - Customer orders
- `order_items` - Items in each order
- `web_analytics_events` - Event dari Vercel Web Analytics Drain untuk grafik pengunjung dashboard
- `weekly_web_analytics` - Ringkasan pengunjung & page views website per minggu (4 stage), sumber utama grafik Web Analytics di dashboard (fallback ke `web_analytics_events` bila kosong)

### Security
- Row Level Security (RLS) enabled on all tables
- Only authenticated users can access data
- Auto-create profile trigger on user signup

## Environment Variables (for reference)

These are used in the **frontend**, not here:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (NOT service_role!)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key untuk endpoint drain Vercel Analytics (server-only, jangan prefix `NEXT_PUBLIC_`)
- `VERCEL_ANALYTICS_DRAIN_SECRET` - Secret bebas untuk mengamankan endpoint `/api/analytics/vercel-drain`

## Vercel Web Analytics Drain

Dashboard menampilkan grafik pengunjung dari tabel `web_analytics_events`. Karena Vercel Web Analytics belum menyediakan REST API publik untuk menarik data dashboard secara langsung, kirim event ke Supabase melalui drain endpoint:

```
https://your-domain.com/api/analytics/vercel-drain?secret=YOUR_SECRET
```

Gunakan value yang sama dengan `VERCEL_ANALYTICS_DRAIN_SECRET` di environment Vercel.

## Runtime Modes

- Dashboard-only mode: frontend langsung ke Supabase.
- Dashboard + Telegram Bot mode: jalankan backend (`npm run dev`) agar bot aktif dan sinkron ke Supabase.
