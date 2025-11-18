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
      location_latitude: inspectionData.location_latitude,
      location_longitude: inspectionData.location_longitude,
      location_address: inspectionData.location_address,
      created_at: new Date().toISOString(),
      photos: [],
    };

    await offlineService.saveOfflineInspection(offlineInspection);

    return {
      id: offlineInspection.id,
      category_id: offlineInspection.category_id,
      status: offlineInspection.status,
      location_latitude: offlineInspection.location_latitude,
      location_longitude: offlineInspection.location_longitude,
      location_address: offlineInspection.location_address,
      inspector_id: offlineInspection.inspector_id,
      filled_by_name: offlineInspection.filled_by_name,
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

export const uploadPhoto = async (inspectionId: string, photoUri: string, photoName: string, order: number): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const filePath = `inspections/${inspectionId}/${Date.now()}_${photoName}`;

    const { error: uploadError } = await supabase.storage
      .from('fims-photos')
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('fims-photos')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('fims_inspection_photos')
      .insert({
        inspection_id: inspectionId,
        photo_url: publicUrl,
        photo_name: photoName,
        photo_order: order,
      });

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
