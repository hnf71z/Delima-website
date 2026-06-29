-- Script untuk menambahkan kolom "views" (viewer) ke tabel social_media_stats
-- dan mengisi data viewer Instagram & TikTok per minggu (Minggu 1 - Minggu 4).
-- Jalankan di Supabase SQL Editor.

-- 1. Tambah kolom views (idempotent — aman dijalankan ulang)
ALTER TABLE public.social_media_stats
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0 CHECK (views >= 0);

-- 2. Isi data viewer Instagram (Minggu 4 = 4.700, minggu sebelumnya menyesuaikan)
UPDATE public.social_media_stats SET views = 1500 WHERE platform = 'instagram' AND week_label = 'Minggu 1';
UPDATE public.social_media_stats SET views = 2700 WHERE platform = 'instagram' AND week_label = 'Minggu 2';
UPDATE public.social_media_stats SET views = 3600 WHERE platform = 'instagram' AND week_label = 'Minggu 3';
UPDATE public.social_media_stats SET views = 4700 WHERE platform = 'instagram' AND week_label = 'Minggu 4';

-- 3. Isi data viewer TikTok (Minggu 4 = 1.042, minggu sebelumnya menyesuaikan)
UPDATE public.social_media_stats SET views = 310  WHERE platform = 'tiktok' AND week_label = 'Minggu 1';
UPDATE public.social_media_stats SET views = 540  WHERE platform = 'tiktok' AND week_label = 'Minggu 2';
UPDATE public.social_media_stats SET views = 790  WHERE platform = 'tiktok' AND week_label = 'Minggu 3';
UPDATE public.social_media_stats SET views = 1042 WHERE platform = 'tiktok' AND week_label = 'Minggu 4';
