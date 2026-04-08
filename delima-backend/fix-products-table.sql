-- Fix Missing Columns
-- Run this BEFORE supabase-seed.sql

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;

-- Drop constraint if exists, then add back
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN ('dimsum', 'minuman'));
