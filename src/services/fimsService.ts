import { supabase, isSupabaseConfigured } from './supabase';
import { Inspection, InspectionCategory } from '../types';
import offlineService, { OfflineInspection, OfflinePhoto } from './offlineService';
import { MahatmaGandhiFormData } from '../screens/forms/MahatmaGandhiRojgarHamiScreen';


export const getInspections = async (userId?: string, userRole?: string): Promise<Inspection[]> => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, returning empty inspections list');
    return [];
  }

  try {
    let query = supabase
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
        )
      `)
      .order('created_at', { ascending: false });

    if (userId && userRole !== 'developer' && userRole !== 'super_admin') {
      query = query.eq('inspector_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      category_id: item.category_id,
      category_name: item.fims_categories?.name,
      category_name_marathi: item.fims_categories?.name_marathi,
      form_type: item.fims_categories?.form_type,
      status: item.status,
      location_name: item.location_name,
      location_latitude: item.latitude,
      location_longitude: item.longitude,
      location_address: item.address,
      inspector_id: item.inspector_id,
      filled_by_name: item.filled_by_name,
      assigned_by: item.assigned_by,
      notes: item.review_comments,
      created_at: item.created_at,
      updated_at: item.updated_at,
      photos: item.fims_inspection_photos || [],
    }));
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return [];
  }
};

/**
 * Diagnostic helper (in-app)
 * - Fetches `photoUri` and logs response details
 * - Runs a simple Supabase read (fims_categories) to verify Supabase connectivity
 * Call this from a debug button or console in the app to see Metro logs.
 */
export const runUploadDiagnostics = async (photoUri: string): Promise<void> => {
  console.log('[diagnostic] Starting upload diagnostics for:', photoUri);

  try {
    console.log('[diagnostic] Testing fetch of photo URI...');
    const res = await fetch(photoUri as string);
    console.log('[diagnostic] fetch.ok:', res.ok, 'status:', res.status);
    try {
      const buf = await res.arrayBuffer();
      console.log('[diagnostic] fetched bytes:', buf?.byteLength ?? 'unknown');
    } catch (readErr) {
      console.warn('[diagnostic] could not read response body:', readErr);
    }
  } catch (err) {
    console.error('[diagnostic] photo fetch error:', err);
  }

  try {
    console.log('[diagnostic] Testing Supabase read (fims_categories)...');
    const { data, error } = await supabase.from('fims_categories').select('*').limit(1);
    if (error) {
      console.error('[diagnostic] Supabase read error:', error);
    } else {
      console.log('[diagnostic] Supabase read success, rows:', Array.isArray(data) ? data.length : 'unknown');
    }
  } catch (err) {
    console.error('[diagnostic] Supabase diagnostic error:', err);
  }

  // Attempt a storage upload (dry run) if fetch succeeded
  try {
    console.log('[diagnostic] Attempting storage upload (dry run)...');
    const fetchRes = await fetch(photoUri as string);
    if (!fetchRes.ok) {
      console.warn('[diagnostic] Cannot upload: fetch not ok, status', fetchRes.status);
    } else {
      const arr = await fetchRes.arrayBuffer();
      const fileExt = (photoUri.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
      const filePath = `diagnostics/${Date.now()}_diag_test.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('field-visit-images')
        .upload(filePath, arr, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('[diagnostic] Storage upload error:', uploadError);
      } else {
        console.log('[diagnostic] Storage upload succeeded for', filePath);
        try {
          const { data: { publicUrl } } = supabase.storage.from('field-visit-images').getPublicUrl(filePath);
          console.log('[diagnostic] publicUrl:', publicUrl);
        } catch (e) {
          console.warn('[diagnostic] Could not get publicUrl:', e);
        }

        // Attempt to remove the diagnostic file to keep storage clean
        try {
          const { error: removeError } = await supabase.storage.from('field-visit-images').remove([filePath]);
          if (removeError) console.warn('[diagnostic] remove error:', removeError);
          else console.log('[diagnostic] removed diagnostic file');
        } catch (e) {
          console.warn('[diagnostic] remove call failed:', e);
        }
      }
    }
  } catch (err) {
    console.error('[diagnostic] storage upload diagnostic error:', err);
  }

  console.log('[diagnostic] Completed upload diagnostics.');
};

export const getInspectionById = async (id: string): Promise<Inspection | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
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
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) return null;

    const inspection: any = data;

    return {
      id: inspection.id,
      category_id: inspection.category_id,
      category_name: inspection.fims_categories?.name,
      category_name_marathi: inspection.fims_categories?.name_marathi,
      form_type: inspection.fims_categories?.form_type,
      status: inspection.status,
      location_name: inspection.location_name,
      location_latitude: inspection.latitude,
      location_longitude: inspection.longitude,
      location_address: inspection.address,
      inspector_id: inspection.inspector_id,
      filled_by_name: inspection.filled_by_name,
      assigned_by: inspection.assigned_by,
      notes: inspection.review_comments,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at,
      photos: inspection.fims_inspection_photos || [],
    };
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return null;
  }
};

export const createInspection = async (inspectionData: Partial<Inspection>): Promise<Inspection> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  const isOnline = await offlineService.isOnline();

  if (!isOnline) {
    const offlineInspection: OfflineInspection = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category_id: inspectionData.category_id!,
      inspector_id: inspectionData.inspector_id,
      filled_by_name: inspectionData.filled_by_name || '',
      status: inspectionData.status || 'draft',
      location_latitude: inspectionData.location_latitude ?? undefined,
      location_longitude: inspectionData.location_longitude ?? undefined,
      location_address: inspectionData.location_address ?? null,
      created_at: new Date().toISOString(),
      photos: [],
    };

    await offlineService.saveOfflineInspection(offlineInspection);

    return {
      id: offlineInspection.id,
      category_id: offlineInspection.category_id,
      status: offlineInspection.status,
      location_name: null,
      location_latitude: offlineInspection.location_latitude ?? null,
      location_longitude: offlineInspection.location_longitude ?? null,
      location_address: offlineInspection.location_address ?? null,
      inspector_id: offlineInspection.inspector_id || '',
      filled_by_name: offlineInspection.filled_by_name,
      assigned_by: null,
      notes: null,
      created_at: offlineInspection.created_at,
      updated_at: offlineInspection.created_at,
      photos: [],
    };
  }

  try {
    const inspectionNumber = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const insertPayload: any = {
      inspection_number: inspectionNumber,
      category_id: inspectionData.category_id,
      inspector_id: inspectionData.inspector_id,
      filled_by_name: inspectionData.filled_by_name,
      status: inspectionData.status || 'draft',
      location_name: inspectionData.location_name,
      latitude: inspectionData.location_latitude,
      longitude: inspectionData.location_longitude,
      address: inspectionData.location_address,
      location_accuracy: null,
    };

    // Optionally include form_data JSON so web can display form values
    if ((inspectionData as any).form_data !== undefined) {
      insertPayload.form_data = (inspectionData as any).form_data;
    }

    const { data, error } = await supabase
      .from('fims_inspections')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    const inspection: any = data;

    return {
      id: inspection.id,
      category_id: inspection.category_id,
      status: inspection.status,
      location_name: inspection.location_name,
      location_latitude: inspection.latitude,
      location_longitude: inspection.longitude,
      location_address: inspection.address,
      inspector_id: inspection.inspector_id,
      filled_by_name: inspection.filled_by_name,
      assigned_by: inspection.assigned_by,
      notes: null,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at,
      photos: [],
    };
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
};

/**
 * Save or update a grampanchayat inspection form row linked to an inspection
 * 
 * 
 */

export const saveGrampanchayatInspectionForm = async (inspectionId: string, formData: any): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // Check if a form already exists for this inspection
    const { data: existingForms, error: fetchError } = await supabase
      .from('grampanchayat_inspection_form')
      .select('id')
      .eq('inspection_id', inspectionId);

    if (fetchError) throw fetchError;

    if (existingForms && existingForms.length > 0) {
      // Update existing form (updates all matching rows to handle duplicates)
      const { error } = await supabase
        .from('grampanchayat_inspection_form')
        .update(formData as any)
        .eq('inspection_id', inspectionId);

      if (error) throw error;
    } else {
      // Insert new form
      const { error } = await supabase
        .from('grampanchayat_inspection_form')
        .insert({
          inspection_id: inspectionId,
          ...formData,
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving grampanchayat inspection form:', error);
    throw error;
  }
};

/**
 * Save or update rajya_tapasani form row linked to an inspection
 */
export const saveRajyaTapasaniForm = async (inspectionId: string, formData: any): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // Check if a form already exists for this inspection
    const { data: existingForms, error: fetchError } = await supabase
      .from('rajya_tapasani')
      .select('id')
      .eq('inspection_id', inspectionId);

    if (fetchError) throw fetchError;

    if (existingForms && existingForms.length > 0) {
      // Update existing form (updates all matching rows to handle duplicates)
      const { error } = await supabase
        .from('rajya_tapasani')
        .update(formData as any)
        .eq('inspection_id', inspectionId);

      if (error) throw error;
    } else {
      // Insert new form
      const { error } = await supabase
        .from('rajya_tapasani')
        .insert({
          inspection_id: inspectionId,
          ...formData,
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving rajya_tapasani form:', error);
    throw error;
  }
};


export const updateInspection = async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.location_latitude !== undefined) updateData.latitude = updates.location_latitude;
    if (updates.location_longitude !== undefined) updateData.longitude = updates.location_longitude;
    if (updates.location_address) updateData.address = updates.location_address;
    if ((updates as any).location_name) updateData.location_name = (updates as any).location_name;
    if ((updates as any).location_accuracy !== undefined) updateData.location_accuracy = (updates as any).location_accuracy;
    if (updates.filled_by_name) updateData.filled_by_name = updates.filled_by_name;
    // allow updating form_data JSON from mobile so web can load the form values
    if ((updates as any).form_data !== undefined) updateData.form_data = (updates as any).form_data;

    const { data, error } = await supabase
      .from('fims_inspections')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const inspection: any = data;

    return {
      id: inspection.id,
      category_id: inspection.category_id,
      status: inspection.status,
      location_name: inspection.location_name,
      location_latitude: inspection.latitude,
      location_longitude: inspection.longitude,
      location_address: inspection.address,
      inspector_id: inspection.inspector_id,
      filled_by_name: inspection.filled_by_name,
      assigned_by: inspection.assigned_by,
      notes: inspection.review_comments,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at,
    };
  } catch (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
};

export const deleteInspection = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { error } = await supabase
      .from('fims_inspections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting inspection:', error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<InspectionCategory[]> => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, returning empty categories list');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('fims_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Create a new Adarsha Shala record
 */
export const createAdarshaShalaForm = async (formData: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('adarsha_shala')
      .insert(formData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating adarsha_shala form:', error);
    throw error;
  }
};

/**
 * Update Adarsha Shala record by inspection_id
 */
export const updateAdarshaShalaFormByInspectionId = async (inspectionId: string, updates: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('adarsha_shala')
      .update(updates)
      .eq('inspection_id', inspectionId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating adarsha_shala by inspection_id:', error);
    throw error;
  }
};

/**
 * Update Adarsha Shala record by primary id
 */
export const updateAdarshaShalaFormById = async (id: string, updates: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('adarsha_shala')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating adarsha_shala by id:', error);
    throw error;
  }
};

/**
 * Fetch Adarsha Shala record by inspection_id
 */
export const getAdarshaShalaByInspectionId = async (inspectionId: string) => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('adarsha_shala')
      .select('*')
      .eq('inspection_id', inspectionId)
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching adarsha_shala by inspection_id:', error);
    return null;
  }
};

export const getRajyaTapasaniByInspectionId = async (inspectionId: string) => {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('rajya_tapasani')
      .select('*')
      .eq('inspection_id', inspectionId)
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching rajya_tapasani by inspection_id:', error);
    return null;
  }
};

export const uploadPhoto = async (inspectionId: string, photoUri: string, photoName: string, order: number, meta?: { latitude?: number; longitude?: number; accuracy?: number }): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }
  const isOnline = await offlineService.isOnline();
  if (!isOnline) {
    throw new Error('No network connection: cannot upload photo');
  }

  // Enforce camera-only uploads: reject remote URLs or unsupported schemes here.
  // Acceptable schemes typically from camera: file://, content://, ph://, assets-library://
  const uriLower = (photoUri || '').toLowerCase();
  if (uriLower.startsWith('http://') || uriLower.startsWith('https://')) {
    throw new Error('Uploading remote images is not allowed. Please capture photo using the device camera.');
  }

  try {
    const response = await fetch(photoUri);
    if (!response.ok) throw new Error(`Failed to fetch photo URI: ${response.status}`);

    // Use arrayBuffer for React Native compatibility (consistent with offlineService)
    const arrayBuffer = await response.arrayBuffer();
    const fileExt = photoName.split('.').pop() || 'jpg';
    const filePath = `inspections/${inspectionId}/${Date.now()}_${photoName}`;

    const { error: uploadError } = await supabase.storage
      .from('field-visit-images')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('field-visit-images')
      .getPublicUrl(filePath);

    const insertPayload: any = {
      inspection_id: inspectionId,
      photo_url: publicUrl,
      photo_name: photoName,
      photo_order: order,
    };
    if (meta) {
      try {
        insertPayload.description = JSON.stringify({ photo_location: meta });
      } catch (e) {
        insertPayload.description = null;
      }
    }

    const { error: dbError } = await supabase
      .from('fims_inspection_photos')
      .insert(insertPayload);

    if (dbError) {
      console.error('DB insert error after photo upload:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    // Suggest retry from caller
    throw error;
  }
};

// In your fimsService.ts - these MUST exist for the mobile file to work
export const createMahatmaGandhiFormRecord = async (
  inspectionId: string,
  formData: MahatmaGandhiFormData
): Promise<any> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
      .insert({ 
        inspection_id: inspectionId, // Use passed inspectionId
        inspection_date: formData.inspection_date || new Date().toISOString().split('T')[0],
        officer_name: formData.inspector_name,
        work_name: formData.work_name,
        gram_panchayat: formData.gram_panchayat,
        village: formData.village,
        tehsil: formData.tehsil,
        district: formData.district,
        work_type: formData.work_type,
        annual_plan: formData.annual_action_plan_included,
        plan_year: formData.annual_action_plan_year,
        implementing_agency: formData.implementation_agency,
        work_code: formData.work_code,
        unskilled_amount: parseFloat(formData.estimated_amount_unskilled) || 0,
        skilled_amount: parseFloat(formData.estimated_amount_skilled) || 0,
        total_amount: parseFloat(formData.estimated_amount_total) || 0,
        dsr_department: formData.dsr_department,
        dsr_year: formData.dsr_year,
        nrega_records: formData.nrega_soft_records_correct,
        nrega_form_a: formData.nrega_soft_form_a,
        nrega_form_b: formData.nrega_soft_form_b,
        convergence: formData.work_under_convergence,
        department_name: formData.convergence_department,
        fund_details: formData.convergence_fund_details,
        mgnrega_unskilled: parseFloat(formData.mgnrega_unskilled) || 0,
        mgnrega_skilled: parseFloat(formData.mgnrega_skilled) || 0,
        mgnrega_total: parseFloat(formData.mgnrega_total) || 0,
        other_dept_unskilled: parseFloat(formData.other_dept_unskilled) || 0,
        other_dept_skilled: parseFloat(formData.other_dept_skilled) || 0,
        other_dept_total: parseFloat(formData.other_dept_total) || 0,
        recorded_workers: parseInt(formData.attendance_register_workers) || 0,
        present_workers: parseInt(formData.actual_workers_present) || 0,
        shelter: formData.shelter_for_workers,
        first_aid: formData.first_aid_kit,
        drinking_water: formData.drinking_water,
        child_care: formData.childcare_for_workers_children,
        current_status: formData.current_work_status,
        expense_unskilled: parseFloat(formData.expenses_unskilled) || 0,
        expense_skilled: parseFloat(formData.expenses_skilled) || 0,
        expense_total: parseFloat(formData.expenses_total) || 0,
        attendance_close_date: formData.previous_attendance_closure_date || new Date().toISOString().split('T')[0],
        wage_deposited: formData.wages_deposited_timely,
        delay_compensation: formData.delay_compensation_provided,
        aadhaar_wage: formData.aadhaar_based_payment,
        wage_not_deposited_reasons: formData.payment_failure_reasons,
        job_card_available: formData.workers_have_job_cards,
        job_card_updated: formData.job_card_records_updated,
        work_file_updated: formData.work_file_updated,
        cib_available: formData.citizen_information_board,
        measurement_taken: formData.work_measurement_done,
        measurement_book_no: formData.measurement_book_number,
        all_measurements_recorded: formData.all_measurements_recorded,
        senior_officer_check: formData.senior_technical_officer_check,
        measurement_discrepancy: formData.measurement_discrepancy,
        discrepancy_details: formData.discrepancy_details,
        geo_tagging: formData.work_geotagged,
        other_important_matters: formData.other_important_matters,
        overall_quality: formData.overall_work_quality,
        utility_feedback: formData.work_utility_feedback,
        final_date: formData.inspection_date_final || new Date().toISOString().split('T')[0],
        final_place: formData.inspection_location,
        final_officer_name: formData.inspector_name_final,
        final_designation: formData.inspector_designation_final,
        final_office: formData.inspector_office
      })
      .select()
      .single();

    if (error) throw error;
    console.log('[fimsService] created mahatma gandhi form record:', data);
    return data;
  } catch (error) {
    console.error('Error creating Mahatma Gandhi form record:', error);
    throw error;
  }
};

export const upsertMahatmaGandhiFormRecord = async (
  inspectionId: string,
  formData: MahatmaGandhiFormData
): Promise<any> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  const payload = {
    inspection_id: inspectionId,
    inspection_date: formData.inspection_date || new Date().toISOString().split('T')[0],
    officer_name: formData.inspector_name,
    work_name: formData.work_name,
    gram_panchayat: formData.gram_panchayat,
    village: formData.village,
    tehsil: formData.tehsil,
    district: formData.district,
    work_type: formData.work_type,
    annual_plan: formData.annual_action_plan_included,
    plan_year: formData.annual_action_plan_year,
    implementing_agency: formData.implementation_agency,
    work_code: formData.work_code,
    unskilled_amount: parseFloat(formData.estimated_amount_unskilled) || 0,
    skilled_amount: parseFloat(formData.estimated_amount_skilled) || 0,
    total_amount: parseFloat(formData.estimated_amount_total) || 0,
    dsr_department: formData.dsr_department,
    dsr_year: formData.dsr_year,
    nrega_records: formData.nrega_soft_records_correct,
    nrega_form_a: formData.nrega_soft_form_a,
    nrega_form_b: formData.nrega_soft_form_b,
    convergence: formData.work_under_convergence,
    department_name: formData.convergence_department,
    fund_details: formData.convergence_fund_details,
    mgnrega_unskilled: parseFloat(formData.mgnrega_unskilled) || 0,
    mgnrega_skilled: parseFloat(formData.mgnrega_skilled) || 0,
    mgnrega_total: parseFloat(formData.mgnrega_total) || 0,
    other_dept_unskilled: parseFloat(formData.other_dept_unskilled) || 0,
    other_dept_skilled: parseFloat(formData.other_dept_skilled) || 0,
    other_dept_total: parseFloat(formData.other_dept_total) || 0,
    recorded_workers: parseInt(formData.attendance_register_workers) || 0,
    present_workers: parseInt(formData.actual_workers_present) || 0,
    shelter: formData.shelter_for_workers,
    first_aid: formData.first_aid_kit,
    drinking_water: formData.drinking_water,
    child_care: formData.childcare_for_workers_children,
    current_status: formData.current_work_status,
    expense_unskilled: parseFloat(formData.expenses_unskilled) || 0,
    expense_skilled: parseFloat(formData.expenses_skilled) || 0,
    expense_total: parseFloat(formData.expenses_total) || 0,
    attendance_close_date: formData.previous_attendance_closure_date || new Date().toISOString().split('T')[0],
    wage_deposited: formData.wages_deposited_timely,
    delay_compensation: formData.delay_compensation_provided,
    aadhaar_wage: formData.aadhaar_based_payment,
    wage_not_deposited_reasons: formData.payment_failure_reasons,
    job_card_available: formData.workers_have_job_cards,
    job_card_updated: formData.job_card_records_updated,
    work_file_updated: formData.work_file_updated,
    cib_available: formData.citizen_information_board,
    measurement_taken: formData.work_measurement_done,
    measurement_book_no: formData.measurement_book_number,
    all_measurements_recorded: formData.all_measurements_recorded,
    senior_officer_check: formData.senior_technical_officer_check,
    measurement_discrepancy: formData.measurement_discrepancy,
    discrepancy_details: formData.discrepancy_details,
    geo_tagging: formData.work_geotagged,
    other_important_matters: formData.other_important_matters,
    overall_quality: formData.overall_work_quality,
    utility_feedback: formData.work_utility_feedback,
    final_date: formData.inspection_date_final || new Date().toISOString().split('T')[0],
    final_place: formData.inspection_location,
    final_officer_name: formData.inspector_name_final,
    final_designation: formData.inspector_designation_final,
    final_office: formData.inspector_office
  };

  try {
    const { data, error } = await supabase
      .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
      .upsert([payload], { onConflict: 'inspection_id' })
      .select()
      .single();

    if (error) throw error;
    console.log('[fimsService] upserted mahatma gandhi form record:', data);
    return data;
  } catch (error) {
    console.error('Error upserting Mahatma Gandhi form record:', error);
    throw error;
  }
};
