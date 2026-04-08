# De'Lima Backend - Supabase

This backend uses **Supabase** directly from the frontend for a simpler, more deployable architecture.

## Architecture

```
Frontend (Next.js) → Supabase (PostgreSQL + Auth + API)
```

**No separate backend server needed!** Supabase provides:
- Database (PostgreSQL)
- Authentication
- Real-time subscriptions
- Storage
- Edge functions (if needed later)

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

### Security
- Row Level Security (RLS) enabled on all tables
- Only authenticated users can access data
- Auto-create profile trigger on user signup

## Environment Variables (for reference)

These are used in the **frontend**, not here:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (NOT service_role!)

## Legacy Files

The Express.js backend files in this folder are **NOT used** in the Supabase architecture. They are kept for reference only.

**Do NOT run `npm install` or `npm run dev` in this folder.**

All logic is now in the frontend using Supabase client.
