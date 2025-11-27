-- SQL Script to Clean Up Duplicate Grampanchayat Inspection Form Records
-- Run this in your Supabase SQL Editor

-- Step 1: View duplicate records (for review before deletion)
SELECT
    inspection_id,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as all_ids
FROM grampanchayat_inspection_form
GROUP BY inspection_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Delete duplicate records, keeping only the most recent one
-- (Uncomment this after reviewing the duplicates above)

/*
DELETE FROM grampanchayat_inspection_form
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY inspection_id ORDER BY updated_at DESC, created_at DESC) as row_num
        FROM grampanchayat_inspection_form
    ) t
    WHERE row_num > 1
);
*/

-- Step 3: Verify cleanup - should return 0 rows
-- (Run this after Step 2 to confirm duplicates are removed)

/*
SELECT
    inspection_id,
    COUNT(*) as duplicate_count
FROM grampanchayat_inspection_form
GROUP BY inspection_id
HAVING COUNT(*) > 1;
*/

-- Step 4: Add a unique constraint to prevent future duplicates
-- (Uncomment after cleanup is complete)

/*
ALTER TABLE grampanchayat_inspection_form
ADD CONSTRAINT unique_inspection_id UNIQUE (inspection_id);
*/
