-- Mahatma Gandhi Form Data Verification Query
-- Run this in Supabase SQL Editor to verify data sync

-- 1. Check if category exists and get its ID
SELECT 
  id as category_id,
  name,
  name_marathi,
  form_type
FROM fims_categories
WHERE form_type = 'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection'
   OR form_type ILIKE '%mahatma%gandhi%'
   OR name ILIKE '%mahatma%gandhi%';

-- Expected: One row with the category details

-- 2. Check all inspections for this category
SELECT 
  i.id,
  i.inspection_number,
  i.category_id,
  i.location_name,
  i.status,
  i.inspector_id,
  i.filled_by_name,
  i.created_at,
  c.name as category_name,
  c.form_type
FROM fims_inspections i
LEFT JOIN fims_categories c ON i.category_id = c.id
WHERE c.form_type = 'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection'
ORDER BY i.created_at DESC
LIMIT 10;

-- Expected: List of inspections with correct category_id

-- 3. Check form data for each inspection
SELECT 
  mg.id as form_id,
  mg.inspection_id,
  mg.work_name,
  mg.officer_name,
  mg.gram_panchayat,
  mg.village,
  mg.total_amount,
  mg.created_at as form_created,
  i.id as inspection_exists,
  i.inspection_number,
  i.status,
  i.created_at as inspection_created
FROM mahatma_gandhi_rastriya_gramin_tapasani_praptra mg
LEFT JOIN fims_inspections i ON mg.inspection_id = i.id
ORDER BY mg.created_at DESC
LIMIT 10;

-- Expected: Form records with matching inspection_ids

-- 4. FULL JOIN to find orphaned records
SELECT 
  i.id as inspection_id,
  i.inspection_number,
  i.category_id,
  i.status as inspection_status,
  i.created_at as inspection_created,
  c.name as category_name,
  c.form_type,
  mg.id as form_id,
  mg.work_name,
  mg.officer_name,
  mg.gram_panchayat,
  CASE 
    WHEN mg.id IS NULL THEN '❌ NO FORM DATA'
    WHEN i.id IS NULL THEN '❌ ORPHANED FORM'
    ELSE '✅ LINKED'
  END as sync_status
FROM fims_inspections i
LEFT JOIN fims_categories c ON i.category_id = c.id
FULL OUTER JOIN mahatma_gandhi_rastriya_gramin_tapasani_praptra mg ON i.id = mg.inspection_id
WHERE c.form_type = 'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection'
   OR mg.id IS NOT NULL  -- Include orphaned form records
ORDER BY 
  COALESCE(i.created_at, mg.created_at) DESC
LIMIT 20;

-- This will show:
-- ✅ LINKED = Inspection has form data (GOOD!)
-- ❌ NO FORM DATA = Inspection created but form data insert failed
-- ❌ ORPHANED FORM = Form data exists but no matching inspection (shouldn't happen due to FK)

-- 5. Count summary
SELECT 
  COUNT(DISTINCT i.id) as total_inspections,
  COUNT(DISTINCT mg.id) as total_form_records,
  COUNT(DISTINCT CASE WHEN mg.id IS NOT NULL THEN i.id END) as inspections_with_form_data,
  COUNT(DISTINCT i.id) - COUNT(DISTINCT CASE WHEN mg.id IS NOT NULL THEN i.id END) as inspections_missing_form_data
FROM fims_inspections i
LEFT JOIN fims_categories c ON i.category_id = c.id
LEFT JOIN mahatma_gandhi_rastriya_gramin_tapasani_praptra mg ON i.id = mg.inspection_id
WHERE c.form_type = 'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection';

-- Expected result example:
-- total_inspections: 5
-- total_form_records: 5
-- inspections_with_form_data: 5
-- inspections_missing_form_data: 0

-- If inspections_missing_form_data > 0, those inspections won't show on website!

-- 6. WEBSITE VIEW - Exact query the website should use
-- This simulates what the website sees when it queries for Mahatma Gandhi inspections
SELECT 
  i.id,
  i.inspection_number,
  i.category_id,
  i.location_name,
  i.address,
  i.status,
  i.inspector_id,
  i.filled_by_name,
  i.created_at,
  i.updated_at,
  -- Form data (this is what website needs!)
  mg.id as form_data_id,
  mg.work_name,
  mg.officer_name,
  mg.gram_panchayat,
  mg.village,
  mg.tehsil,
  mg.district,
  mg.total_amount,
  mg.current_status,
  mg.inspection_date
FROM fims_inspections i
LEFT JOIN mahatma_gandhi_rastriya_gramin_tapasani_praptra mg ON i.id = mg.inspection_id
WHERE i.category_id = 'b34d762e-4ecf-4af4-b374-d04ad639bce8'  -- Use the actual category_id from query 1
ORDER BY i.created_at DESC
LIMIT 10;

-- Expected: Rows with BOTH inspection data AND form data columns filled
-- If form_data_id is NULL, that inspection won't show proper data on website!

-- 7. Check if website has RLS (Row Level Security) blocking access
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('fims_inspections', 'mahatma_gandhi_rastriya_gramin_tapasani_praptra');

-- If rls_enabled = true, check policies:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('fims_inspections', 'mahatma_gandhi_rastriya_gramin_tapasani_praptra')
ORDER BY tablename, policyname;
