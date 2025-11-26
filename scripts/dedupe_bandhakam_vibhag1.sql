-- scripts/dedupe_bandhakam_vibhag1.sql
-- One-time dedupe and add unique constraint for bandhakam_vibhag1
-- IMPORTANT: Review results in Supabase SQL editor before running. Recommended to backup data first.

/*
  Steps this script performs:
  1. Create a backup table `bandhakam_vibhag1_backup` (appends rows if exists).
  2. Copy rows that have duplicate inspection_id into the backup (for inspection).
  3. Delete duplicate rows keeping the latest row per inspection_id (based on updated_at then created_at).
  4. Add a UNIQUE constraint on inspection_id to enable atomic UPSERT.
*/

BEGIN;

-- 1) Create backup table if not present (no data copied yet)
CREATE TABLE IF NOT EXISTS public.bandhakam_vibhag1_backup (LIKE public.bandhakam_vibhag1 INCLUDING ALL);

-- 2) Copy duplicate rows into backup for review
INSERT INTO public.bandhakam_vibhag1_backup
SELECT * FROM public.bandhakam_vibhag1
WHERE inspection_id IN (
  SELECT inspection_id FROM (
    SELECT inspection_id, COUNT(*) AS cnt
    FROM public.bandhakam_vibhag1
    GROUP BY inspection_id
    HAVING COUNT(*) > 1
  ) t
);

-- 3) Delete duplicates, keep the latest row per inspection_id by updated_at then created_at
DELETE FROM public.bandhakam_vibhag1 a
USING (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY inspection_id ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST) AS rn
    FROM public.bandhakam_vibhag1
  ) x
  WHERE x.rn > 1
) b
WHERE a.id = b.id;

-- 4) Add unique constraint on inspection_id
ALTER TABLE public.bandhakam_vibhag1
ADD CONSTRAINT bandhakam_vibhag1_inspection_id_unique UNIQUE (inspection_id);

COMMIT;

-- After running: verify rows and test upsert from the app.
-- If anything goes wrong, you can restore from `bandhakam_vibhag1_backup`.
-- Example to inspect backed up duplicates:
-- SELECT * FROM public.bandhakam_vibhag1_backup ORDER BY inspection_id, updated_at DESC;
