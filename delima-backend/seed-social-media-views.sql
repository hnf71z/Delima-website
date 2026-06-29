-- Script untuk menambahkan kolom "views" (viewer) ke tabel social_media_stats
-- dan mengisi data viewer Instagram & TikTok per minggu (Week 1 - Week 4).
--
-- CARA PAKAI: buka Supabase SQL Editor, KOSONGKAN seleksi (klik di editor,
-- jangan highlight teks apa pun), tekan Cmd/Ctrl + A untuk select semua,
-- lalu Run. Grid hasil di bawah akan langsung menampilkan views yang terisi.

-- 1. Tambah kolom views (idempotent — aman dijalankan ulang)
ALTER TABLE public.social_media_stats
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0 CHECK (views >= 0);

-- 2. Isi views berdasarkan URUTAN minggu per platform.
--    Tidak bergantung pada teks week_label, dan kebal spasi/kapitalisasi
--    (btrim + lower) — jadi pasti kena selama ada 4 baris per platform.
WITH ranked AS (
  SELECT
    id,
    lower(btrim(platform)) AS plat,
    ROW_NUMBER() OVER (
      PARTITION BY lower(btrim(platform))
      ORDER BY week_label ASC, recorded_at ASC, created_at ASC
    ) AS rn
  FROM public.social_media_stats
),
target_views (plat, rn, v) AS (
  VALUES
    ('instagram', 1, 1500),
    ('instagram', 2, 2700),
    ('instagram', 3, 3600),
    ('instagram', 4, 4700),
    ('tiktok',    1, 310),
    ('tiktok',    2, 540),
    ('tiktok',    3, 790),
    ('tiktok',    4, 1042)
)
UPDATE public.social_media_stats AS s
SET views = t.v
FROM ranked r
JOIN target_views t
  ON t.plat = r.plat
 AND t.rn  = r.rn
WHERE s.id = r.id;

-- 3. Tampilkan hasil (statement terakhir, jadi muncul di grid setelah Run).
SELECT platform, week_label, views
FROM public.social_media_stats
ORDER BY lower(btrim(platform)), week_label;
