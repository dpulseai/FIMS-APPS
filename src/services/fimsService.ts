import { supabase, isSupabaseConfigured } from './supabase';
import { Inspection, InspectionCategory } from '../types';
import offlineService, { OfflineInspection, OfflinePhoto } from './offlineService';

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

    return {
      id: data.id,
      category_id: data.category_id,
      category_name: data.fims_categories?.name,
      category_name_marathi: data.fims_categories?.name_marathi,
      form_type: data.fims_categories?.form_type,
      status: data.status,
      location_name: data.location_name,
      location_latitude: data.latitude,
      location_longitude: data.longitude,
      location_address: data.address,
      inspector_id: data.inspector_id,
      filled_by_name: data.filled_by_name,
      assigned_by: data.assigned_by,
      notes: data.review_comments,
      created_at: data.created_at,
      updated_at: data.updated_at,
      photos: data.fims_inspection_photos || [],
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

    const { data, error } = await supabase
      .from('fims_inspections')
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      category_id: data.category_id,
      status: data.status,
      location_name: data.location_name,
      location_latitude: data.latitude,
      location_longitude: data.longitude,
      location_address: data.address,
      inspector_id: data.inspector_id,
      filled_by_name: data.filled_by_name,
      assigned_by: data.assigned_by,
      notes: null,
      created_at: data.created_at,
      updated_at: data.updated_at,
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
    const { error } = await supabase
      .from('grampanchayat_inspection_form')
      .insert({
        inspection_id: inspectionId,
        ...formData,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving grampanchayat inspection form:', error);
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
    if (updates.filled_by_name) updateData.filled_by_name = updates.filled_by_name;

    const { data, error } = await supabase
      .from('fims_inspections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      category_id: data.category_id,
      status: data.status,
      location_name: data.location_name,
      location_latitude: data.latitude,
      location_longitude: data.longitude,
      location_address: data.address,
      inspector_id: data.inspector_id,
      filled_by_name: data.filled_by_name,
      assigned_by: data.assigned_by,
      notes: data.review_comments,
      created_at: data.created_at,
      updated_at: data.updated_at,
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

// export const saveGrampanchayatInspectionForm = async (inspectionId: string, formData: any): Promise<void> => {
//   if (!isSupabaseConfigured) {
//     throw new Error('Supabase client not initialized');
//   }

//   try {
//     const { error } = await supabase
//       .from('grampanchayat_inspection_form')
//       .insert({
//         inspection_id: inspectionId,
//         ...formData,
//       });

//     if (error) throw error;
//   } catch (error) {
//     console.error('Error saving grampanchayat inspection form:', error);
//     throw error;
//   }
// };
