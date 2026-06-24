-- Script to create weekly sales report tables and seed data from PDF
-- Run this in Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.weekly_sales_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  period_name text NOT NULL,
  total_omset integer NOT NULL,
  total_hpp integer NOT NULL,
  net_profit integer NOT NULL,
  margin_percentage numeric,
  total_customers integer,
  total_products_sold integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weekly_product_sales (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id uuid REFERENCES public.weekly_sales_reports(id) ON DELETE CASCADE NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  price integer NOT NULL,
  total_revenue integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.weekly_sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_product_sales ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Only authenticated admins can view/manage)
CREATE POLICY "Weekly sales reports are viewable by authenticated users"
  ON public.weekly_sales_reports FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage weekly sales reports"
  ON public.weekly_sales_reports FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Weekly product sales are viewable by authenticated users"
  ON public.weekly_product_sales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage weekly product sales"
  ON public.weekly_product_sales FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Triggers for updated_at
CREATE TRIGGER handle_updated_at_weekly_sales_reports
  BEFORE UPDATE ON public.weekly_sales_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Seed Data
DO $$
DECLARE
  report1_id uuid;
  report2_id uuid;
BEGIN
  -- Insert Minggu 1 & 2
  INSERT INTO public.weekly_sales_reports 
    (period_name, total_omset, total_hpp, net_profit, margin_percentage, total_customers, total_products_sold)
  VALUES 
    ('Minggu 1 & 2', 284000, 185975, 98025, 34.52, 23, 27)
  RETURNING id INTO report1_id;

  -- Insert products for Minggu 1 & 2
  INSERT INTO public.weekly_product_sales (report_id, product_name, quantity, price, total_revenue)
  VALUES 
    (report1_id, 'Dimsum Normal (Tanpa Chili Oil)', 19, 12000, 228000),
    (report1_id, 'Dimsum + Add-on Chilli Oil', 4, 14000, 56000);

  -- Insert Minggu 3 & 4
  INSERT INTO public.weekly_sales_reports 
    (period_name, total_omset, total_hpp, net_profit, margin_percentage, total_customers, total_products_sold)
  VALUES 
    ('Minggu 3 & 4', 426000, 252500, 173500, 40.73, 15, 36)
  RETURNING id INTO report2_id;

  -- Insert products for Minggu 3 & 4
  INSERT INTO public.weekly_product_sales (report_id, product_name, quantity, price, total_revenue)
  VALUES 
    (report2_id, 'Dimsum Original', 22, 12000, 264000),
    (report2_id, 'Dimsum Mentai Premium', 6, 15000, 90000),
    (report2_id, 'Add-on Chilli Oil', 1, 2000, 2000),
    (report2_id, 'Infused Water', 7, 10000, 70000);
END $$;
