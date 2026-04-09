# De'Lima Admin Dashboard - Deployment Guide

## 📋 Overview

This guide will help you deploy the De'Lima Admin Dashboard using:
- **Supabase** for database, authentication, and backend
- **Vercel** for frontend hosting (or any Next.js hosting)

**Features included:**
- ✅ Authentication with Supabase Auth (login/signup)
- ✅ Dashboard with real-time analytics charts
- ✅ Order management with search & filter
- ✅ Product catalog management (placeholder ready)
- ✅ Customer directory (placeholder ready)
- ✅ Responsive sidebar navigation
- ✅ Protected routes

---

## 🚀 Step 1: Setup Supabase Project

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - **Project name**: `delima-admin`
   - **Database password**: (save this securely!)
   - **Region**: Choose closest to your users (e.g., Singapore for Indonesia)
   - **Pricing plan**: Free tier is perfect for starting

### 1.2 Get Project Credentials
After project is created (takes ~2 minutes):
1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)
   - **service_role key**: `eyJhbG...` (keep this secret!)

---

## 🗄️ Step 2: Setup Database Schema

### 2.1 Run SQL Migration
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file: `delima-backend/supabase-schema.sql`
4. Copy ALL the content
5. Paste into SQL Editor
6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned"

**What this creates:**
- `profiles` table - user profiles linked to auth.users
- `products` table - product catalog
- `orders` table - customer orders
- `order_items` table - items in each order
- Row Level Security (RLS) policies
- Auto-create profile trigger on signup
- Indexes for performance

### 2.2 Create Admin User
1. Go to **Authentication** → **Users** (left sidebar)
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: `admin@delima.com`
   - **Password**: `admin123` (change later!)
   - **Email Confirm**: ✅ Check this box (skip email verification)
   - **User metadata** (JSON):
     ```json
     {
       "name": "Admin DeLima",
       "role": "admin"
     }
     ```
4. Click **"Create user"**

The trigger will auto-create a profile for this user.

### 2.3 Seed Initial Data
1. Go back to **SQL Editor**
2. Open the file: `delima-backend/supabase-seed.sql`
3. Copy ALL the content
4. Paste into SQL Editor
5. Click **"Run"**
6. You should see "Success. 6 rows inserted" (or similar)

**What this seeds:**
- 6 products (3 dimsum, 3 infus water)
- 5 sample orders with different statuses
- 9 order items

---

## 🔧 Step 3: Configure Frontend

### 3.1 Create Environment File
In the frontend project root (`delima-project-website/`):

```bash
# File already exists: delima-project-website/.env.local
# Update it with your Supabase credentials:
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Replace `your-project.supabase.co` with your actual Project URL
- Replace `your-anon-key-here` with your **anon/public** key (NOT service_role!)
- These keys are in **Project Settings → API**

### 3.2 Install Dependencies (if not done)
```bash
cd delima-project-website
npm install
```

### 3.3 Test Locally
```bash
npm run dev
```

Open http://localhost:3000/login and test:
- **Email**: `admin@delima.com`
- **Password**: `admin123`

You should see the dashboard with real data from Supabase!

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Prepare Repository
1. Make sure your code is in a Git repository:
```bash
cd delima-project-website
git init
git add .
git commit -m "Initial commit: De'Lima Admin Dashboard"
```

2. Push to GitHub/GitLab/Bitbucket:
```bash
# Example for GitHub
git remote add origin https://github.com/yourusername/delima-admin.git
git push -u origin main
```

### 4.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `delima-project-website`
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   
6. **Environment Variables** (IMPORTANT!):
   Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`

7. Click **"Deploy"**
8. Wait 2-3 minutes for deployment to complete

### 4.3 Custom Domain (Optional)
1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `admin.delima.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## 🔒 Step 5: Security Checklist

### 5.1 Supabase Security
- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Only authenticated users can access admin data
- ✅ Service role key is NEVER exposed in frontend code
- ✅ Admin password should be changed from default

**Change admin password:**
1. Go to **Authentication** → **Users**
2. Find `admin@delima.com`
3. Click **"..."** → **"Edit user"**
4. Set a strong password
5. Click **"Save"**

### 5.2 Environment Variables
- ✅ `.env.local` should be in `.gitignore`
- ✅ Never commit `SUPABASE_SERVICE_ROLE_KEY` to frontend
- ✅ Use environment variables in Vercel (not hardcoded)

### 5.3 Email Confirmation (Production)
For production, consider enabling email confirmation:
1. **Authentication** → **Settings** → **Email Auth**
2. Enable "Confirm email"
3. Customize email template with your branding

---

## 📊 Step 6: Verify All Features

### ✅ Login Page
- [ ] Can login with admin credentials
- [ ] Error shows for wrong credentials
- [ ] Redirects to dashboard after login

### ✅ Dashboard Analytics
- [ ] 4 metric cards show correct data:
  - Total Revenue
  - Total Orders
  - Total Customers
  - Growth Rate
- [ ] Sales Overview chart displays monthly data
- [ ] Product Distribution pie chart shows categories
- [ ] Revenue by Product bar chart compares products

### ✅ Orders Management
- [ ] Orders table displays all orders
- [ ] Search works (by ID, customer name, email)
- [ ] Filter by status works (all, pending, processing, completed, cancelled)
- [ ] Order details modal shows when clicking eye icon
- [ ] Shows customer info, products, total, status
- [ ] Pagination works (if more than 10 orders)

### ✅ Navigation
- [ ] Sidebar shows all menu items
- [ ] Clicking menu items navigates correctly
- [ ] Active page is highlighted in sidebar
- [ ] Mobile menu works (hamburger icon)
- [ ] Logout button works and redirects to login

### ✅ Protected Routes
- [ ] Cannot access /dashboard without login
- [ ] Cannot access /orders without login
- [ ] Redirects to /login if not authenticated
- [ ] Session persists on page refresh

---

## 🛠️ Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure `.env.local` exists in `delima-project-website/` with correct keys.

### Issue: Dashboard shows empty data
**Solution**: 
1. Check if seed data was inserted correctly in Supabase
2. Check browser console for errors
3. Verify RLS policies allow authenticated users to read

### Issue: Login fails
**Solution**:
1. Verify admin user exists in Supabase Auth → Users
2. Check email and password are correct
3. Check browser console for error messages

### Issue: "Row Level Security policy violation"
**Solution**: 
1. Make sure RLS policies are created (check `supabase-schema.sql` was run)
2. Verify user is authenticated (check Supabase Auth session)

### Issue: Orders page shows "undefined" for order_items
**Solution**: 
1. Check if order_items were seeded correctly
2. Verify foreign key relationships exist
3. Check Supabase query in `lib/api.ts` - `ordersAPI.getAll()`

---

## 📈 Next Steps & Enhancements

### Easy Wins
- [ ] Add ability to update order status (dropdown in order details)
- [ ] Add create order form
- [ ] Add product management CRUD
- [ ] Add customer management page
- [ ] Export orders to CSV

### Medium Complexity
- [ ] Add real-time order notifications
- [ ] Add date range filter for orders
- [ ] Add product images upload
- [ ] Add order status timeline
- [ ] Add dashboard date range selector

### Advanced
- [ ] Add role-based access control (admin vs superadmin)
- [ ] Add order analytics with predictive insights
- [ ] Add inventory management with low stock alerts
- [ ] Add customer loyalty program tracking
- [ ] Add multi-language support (i18n)

---

## 🎯 Quick Reference

### Supabase Dashboard
- URL: https://app.supabase.com
- Your Project: [Find in your email or dashboard]

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Your Project: [After deployment]

### Admin Login
- URL: `https://your-domain.com/login`
- Email: `admin@delima.com`
- Password: [Your secure password]

### Database Tables
- `profiles` - User profiles
- `products` - Product catalog (dimsum, minuman)
- `orders` - Customer orders
- `order_items` - Items in each order

### Key Files
- `lib/supabase.ts` - Supabase client
- `lib/api.ts` - API helpers for all database operations
- `contexts/auth-context.tsx` - Authentication state management
- `app/(admin)/layout.tsx` - Admin route layout with AuthProvider
- `app/(admin)/(protected)/layout.tsx` - Protected routes layout
- `app/(admin)/login/page.tsx` - Login page
- `app/(admin)/(protected)/dashboard/page.tsx` - Dashboard with charts
- `app/(admin)/(protected)/orders/page.tsx` - Orders management

---

## 💡 Tips

1. **Backup regularly**: Use Supabase's built-in backup feature
2. **Monitor usage**: Check Supabase usage in Project Settings
3. **Use staging**: Create a staging environment before production
4. **Enable logging**: Supabase logs all database queries
5. **Test RLS**: Always test Row Level Security policies before going live

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in Dashboard
3. Review this guide's troubleshooting section
4. Check Supabase docs: https://supabase.com/docs

---

**Congratulations! Your De'Lima Admin Dashboard is now deployed and ready to use! 🎉**
