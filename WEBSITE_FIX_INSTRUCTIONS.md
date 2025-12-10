# Website Dashboard Fix - Mahatma Gandhi Form Data Not Visible

## Problem Identified
✅ Mobile app is saving data correctly to `mahatma_gandhi_rastriya_gramin_tapasani_praptra` table  
✅ All records with `inspection_id` are present in the database  
❌ Website dashboard cannot display this data

## Root Cause
The website is not properly querying or joining the form data with inspections.

---

## Solution: Update Website Query

### Current Issue
The website likely uses a query like this:
```typescript
const { data } = await supabase
  .from('fims_inspections')
  .select('*')
  .eq('category_id', mahatmaGandhiCategoryId);
```

This only fetches inspections but **doesn't include the form data**.

### Fixed Query
Update your website's inspection loading code to include the form data:

```typescript
const { data: inspections } = await supabase
  .from('fims_inspections')
  .select(`
    *,
    fims_categories (
      id,
      name,
      name_marathi,
      form_type
    ),
    fims_inspection_photos (
      id,
      photo_url,
      photo_name,
      description,
      photo_order
    ),
    mahatma_gandhi_rastriya_gramin_tapasani_praptra (
      *
    )
  `)
  .eq('category_id', mahatmaGandhiCategoryId)
  .order('created_at', { ascending: false });
```

### Access Form Data
After fetching, the form data will be available as:
```typescript
inspections.forEach(inspection => {
  const formData = inspection.mahatma_gandhi_rastriya_gramin_tapasani_praptra?.[0];
  
  if (formData) {
    console.log('Work Name:', formData.work_name);
    console.log('Officer:', formData.officer_name);
    console.log('Gram Panchayat:', formData.gram_panchayat);
    // ... etc
  }
});
```

**Note:** The form data comes as an array `[0]` because Supabase returns related records as arrays.

---

## Alternative: Direct Query

If you want to fetch form records directly:

```typescript
const { data: formRecords } = await supabase
  .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
  .select(`
    *,
    fims_inspections (
      id,
      inspection_number,
      location_name,
      address,
      status,
      created_at,
      fims_inspection_photos (*)
    )
  `)
  .order('created_at', { ascending: false });
```

---

## Testing Query in Supabase Dashboard

1. Go to your Supabase project → SQL Editor
2. Run this query to verify data exists:

```sql
SELECT 
  i.id as inspection_id,
  i.inspection_number,
  i.location_name,
  i.status,
  i.created_at as inspection_created,
  mg.id as form_id,
  mg.work_name,
  mg.officer_name,
  mg.gram_panchayat,
  mg.village,
  mg.created_at as form_created
FROM fims_inspections i
LEFT JOIN mahatma_gandhi_rastriya_gramin_tapasani_praptra mg 
  ON i.id = mg.inspection_id
WHERE i.category_id = (
  SELECT id FROM fims_categories 
  WHERE form_type = 'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection'
  LIMIT 1
)
ORDER BY i.created_at DESC
LIMIT 10;
```

**Expected Result:** You should see rows with both inspection data AND form data (work_name, officer_name, etc.)

If you see NULLs in form columns → Mobile app issue  
If you see data in form columns → Website query issue

---

## Row Level Security (RLS) Check

If query returns data in SQL Editor but not in website, check RLS policies:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mahatma_gandhi_rastriya_gramin_tapasani_praptra';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename = 'mahatma_gandhi_rastriya_gramin_tapasani_praptra';
```

If RLS is blocking, add this policy:

```sql
-- Allow SELECT for authenticated users
CREATE POLICY "Allow authenticated users to read Mahatma Gandhi forms"
ON mahatma_gandhi_rastriya_gramin_tapasani_praptra
FOR SELECT
TO authenticated
USING (true);
```

---

## Quick Verification Script

Add this to your website console (F12 → Console):

```javascript
// Test if form data is accessible
const { data, error } = await supabase
  .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
  .select('*')
  .limit(5);

if (error) {
  console.error('❌ RLS or permission error:', error);
} else if (data.length === 0) {
  console.warn('⚠️ No data found - check category filter');
} else {
  console.log('✅ Form data accessible:', data.length, 'records');
  console.table(data);
}
```

---

## Field Mapping Reference

Mobile app saves data with these field names (already correct):

| Mobile Field | Database Column | Website Should Display |
|--------------|-----------------|------------------------|
| `inspector_name` | `officer_name` | Inspector Name |
| `work_name` | `work_name` | Work Name |
| `gram_panchayat` | `gram_panchayat` | Gram Panchayat |
| `village` | `village` | Village |
| `estimated_amount_total` | `total_amount` | Total Amount |
| `attendance_register_workers` | `recorded_workers` | Workers (Register) |
| `actual_workers_present` | `present_workers` | Workers (Present) |

All field mappings are correct! The website just needs to **fetch** the data properly.

---

## Summary

✅ **Mobile app is working correctly** - data is being saved  
✅ **Database has all the data** - verified in schema  
❌ **Website needs fix** - update query to join form data  

**Action Required:** Update website's inspection fetching query to include:
```
mahatma_gandhi_rastriya_gramin_tapasani_praptra (*)
```

Or check RLS policies if query still doesn't return data.
