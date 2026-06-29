-- Script to create the weekly web analytics table and seed dummy data
-- Ringkasan pengunjung website De'Lima per minggu (4 stage / 4 minggu)
-- Run this in Supabase SQL Editor

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.weekly_web_analytics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  stage text NOT NULL,
  week_number integer NOT NULL CHECK (week_number BETWEEN 1 AND 4),
  visitors integer NOT NULL DEFAULT 0 CHECK (visitors >= 0),
  page_views integer NOT NULL DEFAULT 0 CHECK (page_views >= 0),
  period_start date,
  period_end date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (week_number)
);

-- 2. Enable RLS
ALTER TABLE public.weekly_web_analytics ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Only authenticated admins can view/manage)
DROP POLICY IF EXISTS "Weekly web analytics are viewable by authenticated users" ON public.weekly_web_analytics;
CREATE POLICY "Weekly web analytics are viewable by authenticated users"
  ON public.weekly_web_analytics FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage weekly web analytics" ON public.weekly_web_analytics;
CREATE POLICY "Authenticated users can manage weekly web analytics"
  ON public.weekly_web_analytics FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Index + Trigger for updated_at
CREATE INDEX IF NOT EXISTS idx_weekly_web_analytics_week ON public.weekly_web_analytics(week_number);

DROP TRIGGER IF EXISTS handle_updated_at_weekly_web_analytics ON public.weekly_web_analytics;
CREATE TRIGGER handle_updated_at_weekly_web_analytics
  BEFORE UPDATE ON public.weekly_web_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Seed Dummy Data (4 minggu, periode relatif terhadap 28 hari terakhir)
-- ON CONFLICT memastikan script bisa dijalankan ulang tanpa duplikasi.
INSERT INTO public.weekly_web_analytics
  (stage, week_number, visitors, page_views, period_start, period_end)
VALUES
  ('Minggu 1', 1, 42, 118, current_date - 27, current_date - 21),
  ('Minggu 2', 2, 58, 167, current_date - 20, current_date - 14),
  ('Minggu 3', 3, 73, 205, current_date - 13, current_date - 7),
  ('Minggu 4', 4, 96, 281, current_date - 6,  current_date)
ON CONFLICT (week_number) DO UPDATE SET
  stage        = EXCLUDED.stage,
  visitors     = EXCLUDED.visitors,
  page_views   = EXCLUDED.page_views,
  period_start = EXCLUDED.period_start,
  period_end   = EXCLUDED.period_end,
  updated_at   = now();
