import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, updateInspection, uploadPhoto, getInspectionById } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Stepper from '../../components/common/Stepper';
import DateInput from '../../components/common/DateInput';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

// Cache of table column info to avoid querying information_schema repeatedly
// cached value shape: { [tableName]: { [columnName]: { is_nullable: 'YES'|'NO', column_default: string|null } } }
const tableColumnsCache: Record<string, Record<string, { is_nullable: string | null; column_default: any }>> = {};

async function getTableColumnInfo(tableName: string): Promise<Record<string, { is_nullable: string | null; column_default: any }>> {
  if (tableColumnsCache[tableName]) return tableColumnsCache[tableName];
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name,is_nullable,column_default')
      .eq('table_name', tableName);

    if (error) {
      console.warn('Could not fetch information_schema columns for', tableName, error);
      tableColumnsCache[tableName] = {};
      return tableColumnsCache[tableName];
    }

    const info: Record<string, any> = {};
    (data || []).forEach((r: any) => {
      info[r.column_name] = { is_nullable: r.is_nullable, column_default: r.column_default };
    });
    tableColumnsCache[tableName] = info;
    return info;
  } catch (e) {
    console.warn('Exception fetching table columns for', tableName, e);
    tableColumnsCache[tableName] = {};
    return tableColumnsCache[tableName];
  }
}

// Backwards-compatible helper returning a Set of column names
async function getTableColumns(tableName: string): Promise<Set<string>> {
  const info = await getTableColumnInfo(tableName);
  const cols = Object.keys(info || {});
  if (cols.length > 0) return new Set(cols);

  // Fallback: try to infer columns by fetching a single row from the table.
  // This works even when `information_schema` is not exposed via PostgREST.
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      console.warn('Could not fetch a sample row to infer columns for', tableName, error);
      return new Set();
    }
    if (Array.isArray(data) && data.length > 0) {
      return new Set(Object.keys(data[0] || {}));
    }
    return new Set();
  } catch (e) {
    console.warn('Exception while fetching sample row for', tableName, e);
    return new Set();
  }
}

async function upsertWithPrune(tableName: string, payloadIn: any, onConflict = 'inspection_id') {
  let payload = Array.isArray(payloadIn) ? payloadIn.slice() : { ...payloadIn };
  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data, error } = await supabase.from(tableName).upsert(payload, { onConflict }).select();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      const msg = err?.message || String(err);
      // PostgREST error when column not found
      const colMatch = msg.match(/Could not find the '([^']+)' column/);
      if (colMatch && colMatch[1]) {
        const col = colMatch[1];
        console.warn(`Upsert: column not found (${col}), pruning and retrying`);
        if (Array.isArray(payload)) {
          payload = payload.map((p: any) => {
            const copy = { ...p };
            delete copy[col];
            return copy;
          });
        } else {
          delete payload[col];
        }
        continue;
      }

      

      // If the error is a Postgres NOT NULL violation (e.g., missing required column values), rethrow
      if (err?.code === '23502' || String(msg).includes('violates not-null constraint')) {
        throw err;
      }

      // For other errors, rethrow
      throw err;
    }
  }
  throw new Error('upsertWithPrune: exceeded retry attempts');
}

type RouteParams = RouteProp<FormsStackParamList, 'BandhkamVibhag1'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'BandhkamVibhag1'>;

const STEPS = ['मूलभूत माहिती', 'स्थान माहिती', 'बांधकाम तपासणी', 'फोटो'];

// Columns known to exist in Supabase schema for `bandhakam_vibhag1` (server-side canonical list)
const BANDHAKAM_ALLOWED_COLUMNS = new Set([
  'id',
  'inspection_id',
  'work_name',
  'budget_head',
  'admin_approval_details',
  'technical_approval_details',
  'road_length_building_area',
  'karnama_details',
  'contractor_name',
  'work_order_details',
  'extension_details',
  'estimate_scope',
  'current_work_status',
  'measurement_book_details',
  'payment_status',
  'created_at',
  'updated_at',
  'visit_date',
]);

// Columns that are NOT NULL according to the schema and should be validated on submit
const BANDHAKAM_REQUIRED_COLUMNS: string[] = [
  'work_name',
  'budget_head',
  'admin_approval_details',
  'technical_approval_details',
  'road_length_building_area',
  'karnama_details',
  'contractor_name',
  'work_order_details',
  'extension_details',
  'estimate_scope',
  'current_work_status',
  'measurement_book_details',
  'payment_status',
];

// Helper: filter a payload object to only include allowed keys
function filterPayloadToAllowed(payload: Record<string, any>, allowed: Set<string>) {
  const out: Record<string, any> = {};
  Object.keys(payload).forEach((k) => {
    if (allowed.has(k)) out[k] = payload[k];
  });
  return out;
}

interface BandhkamFormData {
  visit_date: string;
  work_name: string;
  account_head: string;
  admin_approval_number: string;
  admin_approval_date: string;
  admin_approval_amount: string;
  technical_approval_number: string;
  technical_approval_date: string;
  road_length_building_area: string;
  contract_number: string;
  contract_amount: string;
  contract_percentage: string;
  contractor_name: string;
  work_start_order_number: string;
  work_start_date: string;
  work_duration_from: string;
  work_duration_to: string;
  extension_details: string;
  extension_reasons: string;
  approved_estimate_scope: string;
  current_work_status: string;
  measurement_book_page: string;
  payment_status: string;
  inspector_name: string;
  inspector_designation: string;
  inspection_date: string;
}

export default function BandhkamVibhag1Screen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId, inspectionId, edit } = route.params as { categoryId: string; inspectionId?: string; edit?: boolean };

  // Today's date for visit_date (YYYY-MM-DD)
  const todayIso = new Date().toISOString().slice(0, 10);

  // Debug: check access to bandhakam_vibhag1 table at mount
  React.useEffect(() => {
    const testTable = async () => {
      try {
        const { data, error } = await supabase.from('bandhakam_vibhag1').select('inspection_id').limit(1);
        console.log('Bandhakam table check:', { data, error });
        if (error) {
          Alert.alert('DB Check Error', `Bandhakam table access error: ${error.message || JSON.stringify(error)}`);
        }
      } catch (e) {
        console.error('Bandhakam table check exception:', e);
        Alert.alert('DB Check Exception', String(e));
      }
    };
    testTable();
  }, []);

  // Load existing inspection/form when editing/viewing
  React.useEffect(() => {
    if (!inspectionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const inspection = await getInspectionById(inspectionId);
        if (!inspection) return;

        setLocation({
          latitude: inspection.location_latitude || 0,
          longitude: inspection.location_longitude || 0,
          accuracy: null,
          address: inspection.location_address || null,
          timestamp: Date.now(),
        });

        if (inspection.photos && inspection.photos.length > 0) {
          setPhotos(inspection.photos.map((p: any) => p.photo_url));
          // attempt to parse saved photo metadata from description JSON
          try {
            const metas = inspection.photos.map((p: any) => {
              if (!p.description) return {};
              try {
                const parsed = JSON.parse(p.description);
                return parsed?.photo_location || {};
              } catch (e) {
                return {};
              }
            });
            setPhotoMetas(metas);
          } catch (e) {
            console.warn('Could not parse photo metas from inspection photos', e);
          }
        }

        // Load form-specific row if present and map into UI fields
        try {
          const { data: formRows, error: formErr } = await supabase
            .from('bandhakam_vibhag1')
            .select('*')
            .eq('inspection_id', inspectionId)
            .order('updated_at', { ascending: false })
            .limit(1);

          const formRow = Array.isArray(formRows) && formRows.length > 0 ? formRows[0] : null;
          console.log('Bandhakam loaded formRow:', formRow);

          if (!formErr && formRow) {
            // Attempt to parse compound text fields that may have been stored as combined strings
            const parseParts = (val: any) => (val && typeof val === 'string' ? val.split('|').map((s: string) => s.trim()) : []);

            const adminParts = parseParts(formRow.admin_approval_details);
            const techParts = parseParts(formRow.technical_approval_details);
            const karnamaParts = parseParts(formRow.karnama_details);
            const workOrderParts = parseParts(formRow.work_order_details);

            setFormData((prev: any) => ({
              ...prev,
              work_name: formRow.work_name || prev.work_name,
              account_head: formRow.budget_head || prev.account_head,
              admin_approval_number: adminParts[0] || prev.admin_approval_number,
              admin_approval_date: adminParts[1] || prev.admin_approval_date,
              admin_approval_amount: adminParts[2] || prev.admin_approval_amount,
              technical_approval_number: techParts[0] || prev.technical_approval_number,
              technical_approval_date: techParts[1] || prev.technical_approval_date,
              road_length_building_area: formRow.road_length_building_area || prev.road_length_building_area,
              contract_number: karnamaParts[0] || prev.contract_number,
              contract_amount: karnamaParts[1] || prev.contract_amount,
              contract_percentage: karnamaParts[2] || prev.contract_percentage,
              contractor_name: formRow.contractor_name || prev.contractor_name,
              work_start_order_number: workOrderParts[0] || prev.work_start_order_number,
              work_start_date: workOrderParts[1] || prev.work_start_date,
              extension_details: formRow.extension_details || prev.extension_details,
              approved_estimate_scope: formRow.estimate_scope || prev.approved_estimate_scope,
              current_work_status: formRow.current_work_status || prev.current_work_status,
              measurement_book_page: formRow.measurement_book_details || prev.measurement_book_page,
              payment_status: formRow.payment_status || prev.payment_status,
              visit_date: formRow.visit_date ? String(new Date(Number(formRow.visit_date)).toISOString().slice(0, 10)) : prev.visit_date,
            }));
          } else {
            // Fallback: map inspection-level fields
            setFormData((prev: any) => ({ ...prev, contractor_name: inspection.filled_by_name || prev.contractor_name }));
          }
        } catch (e) {
          console.warn('Could not load bandhakam form row:', e);
          setFormData((prev: any) => ({ ...prev, contractor_name: inspection.filled_by_name || prev.contractor_name }));
        }
      } catch (err) {
        console.error('Error loading inspection data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [inspectionId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photoMetas, setPhotoMetas] = useState<Array<{ latitude?: number; longitude?: number; accuracy?: number; address?: string }>>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(() => Boolean(edit) || !inspectionId);

  const [formData, setFormData] = useState<BandhkamFormData>({
    visit_date: todayIso,
    work_name: '',
    account_head: '',
    admin_approval_number: '',
    admin_approval_date: '',
    admin_approval_amount: '',
    technical_approval_number: '',
    technical_approval_date: '',
    road_length_building_area: '',
    contract_number: '',
    contract_amount: '',
    contract_percentage: '',
    contractor_name: '',
    work_start_order_number: '',
    work_start_date: '',
    work_duration_from: '',
    work_duration_to: '',
    extension_details: '',
    extension_reasons: '',
    approved_estimate_scope: '',
    current_work_status: '',
    measurement_book_page: '',
    payment_status: '',
    inspector_name: '',
    inspector_designation: '',
    inspection_date: '',
  });

  const toNumberOrNull = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return Number.isNaN(n) ? null : n;
  };

  const dateToEpochMs = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    // If already a number, assume epoch ms
    if (typeof val === 'number') return Number.isFinite(val) ? val : null;
    try {
      const t = new Date(String(val)).getTime();
      return Number.isNaN(t) ? null : t;
    } catch (e) {
      return null;
    }
  };

  const saveLocally = async (inspectionId: string, data: any) => {
    try {
      const key = `inspection_${inspectionId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));

      const photosKey = `inspection_photos_${inspectionId}`;
      await AsyncStorage.setItem(photosKey, JSON.stringify(photos));
      const metasKey = `inspection_photo_metas_${inspectionId}`;
      await AsyncStorage.setItem(metasKey, JSON.stringify(photoMetas));
    } catch (error) {
      console.error('Error saving locally:', error);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.work_name) {
        Alert.alert(t('common.error'), 'कामाचे नाव आवश्यक आहे');
        return;
      }
    }

    if (currentStep === 1) {
      if (!location) {
        Alert.alert(t('common.error'), 'स्थान कॅप्चर करा');
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      let inspectionIdToUse = inspectionId as string | undefined;

      if (inspectionIdToUse) {
        // Update inspection basic fields
        await updateInspection(inspectionIdToUse, {
          filled_by_name: formData.contractor_name || user?.email || '',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
      } else {
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: formData.contractor_name || user?.email || '',
          status: 'draft',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
        inspectionIdToUse = inspection.id;
      }

      // Prepare payload for bandhakam_vibhag1
      // Use epoch ms for visit_date (column is bigint)
      const payload: any = {
        inspection_id: inspectionIdToUse,
        work_name: formData.work_name || '',
        budget_head: formData.account_head || '',
        // keep combined fields for backward compatibility
        admin_approval_details: `${formData.admin_approval_number || ''} | ${formData.admin_approval_date || ''} | ${toNumberOrNull(formData.admin_approval_amount) ?? ''}`,
        technical_approval_details: `${formData.technical_approval_number || ''} | ${formData.technical_approval_date || ''}`,
        karnama_details: `${formData.contract_number || ''} | ${toNumberOrNull(formData.contract_amount) ?? ''} | ${toNumberOrNull(formData.contract_percentage) ?? ''}`,
        work_order_details: `${formData.work_start_order_number || ''} | ${formData.work_start_date || ''}`,
        // Also write separate columns so website can read individual values
        admin_approval_number: formData.admin_approval_number || null,
        admin_approval_date: formData.admin_approval_date || null,
        admin_approval_amount: toNumberOrNull(formData.admin_approval_amount),
        technical_approval_number: formData.technical_approval_number || null,
        technical_approval_date: formData.technical_approval_date || null,
        contract_number: formData.contract_number || null,
        contract_amount: toNumberOrNull(formData.contract_amount),
        contract_percentage: toNumberOrNull(formData.contract_percentage),
        work_order_number: formData.work_start_order_number || null,
        work_order_date: formData.work_start_date || null,
        // existing fields
        road_length_building_area: formData.road_length_building_area || '',
        contractor_name: formData.contractor_name || '',
        extension_details: formData.extension_details || '',
        estimate_scope: formData.approved_estimate_scope || '',
        current_work_status: formData.current_work_status || '',
        measurement_book_details: formData.measurement_book_page || '',
        payment_status: formData.payment_status || '',
        visit_date: dateToEpochMs(formData.visit_date),
      };

      // Ensure we have an inspection id
      if (!inspectionIdToUse) {
        console.error('No inspection id available for Bandhakam save', inspectionIdToUse);
        Alert.alert(t('common.error'), 'Missing inspection id');
        return;
      }

      // Debug: log payload and inspection id
      console.log('Bandhakam save payload:', { inspectionIdToUse, payload });

      // If inspection is offline-generated, skip remote upsert and save locally for sync
      if (typeof inspectionIdToUse === 'string' && inspectionIdToUse.startsWith('offline_')) {
        console.warn('Inspection is offline; skipping remote upsert for Bandhakam:', inspectionIdToUse);
        await saveLocally(inspectionIdToUse as string, { formData, location, photos });
        Alert.alert(t('common.success'), 'Saved locally (offline). It will sync when online.');
        navigation.goBack();
        return;
      }

      // Use upsert on inspection_id to avoid duplicate inserts or missed updates
      try {
        // Filter payload to only columns that exist in the table schema to avoid PGRST204 errors.
        // Prefer server-reported columns, but fall back to the canonical allowed list when info is unavailable.
        const remoteCols = await getTableColumns('bandhakam_vibhag1');
        let allowedSet: Set<string>;
        if (!remoteCols || remoteCols.size === 0) {
          allowedSet = BANDHAKAM_ALLOWED_COLUMNS;
          console.warn('No remote column info available for bandhakam_vibhag1; using canonical allowed column list.');
        } else {
          // intersect remote columns with canonical allowed list to be extra-safe
          allowedSet = new Set([...remoteCols].filter((c) => BANDHAKAM_ALLOWED_COLUMNS.has(c)));
        }

        let filteredPayload: any = filterPayloadToAllowed(payload, allowedSet);

        const { data: upsertData, error: upsertError } = await supabase
          .from('bandhakam_vibhag1')
          .upsert(filteredPayload, { onConflict: 'inspection_id' })
          .select();

        if (upsertError) {
          // Fallback for Postgres when ON CONFLICT target isn't indexed/unique
          if (upsertError.code === '42P10') {
            console.warn('Upsert unsupported (no unique constraint). Falling back to update->insert.');
            const { data: updateData, error: updateError } = await supabase
              .from('bandhakam_vibhag1')
              .update(filteredPayload)
              .eq('inspection_id', inspectionIdToUse as string)
              .select();

            if (updateError) {
              console.error('Bandhakam update fallback error:', updateError);
              Alert.alert(t('common.error'), `Failed to save form data: ${updateError.message || JSON.stringify(updateError)}`);
              return;
            }

            if (!updateData || (Array.isArray(updateData) && updateData.length === 0)) {
              const { data: insertData, error: insertError } = await supabase
                .from('bandhakam_vibhag1')
                .insert(filteredPayload)
                .select();

              if (insertError) {
                console.error('Bandhakam insert fallback error:', insertError);
                Alert.alert(t('common.error'), `Failed to save form data: ${insertError.message || JSON.stringify(insertError)}`);
                return;
              }

              console.log('Bandhakam insert fallback success:', insertData);
            } else {
              console.log('Bandhakam update fallback success:', updateData);
            }

            // finished fallback
          } else {
            console.error('Bandhakam upsert error:', upsertError);
            Alert.alert(t('common.error'), `Failed to save form data: ${upsertError.message || JSON.stringify(upsertError)}`);
            return;
          }
        } else {
          console.log('Bandhakam upsert success:', upsertData);
            try {
              const { data: savedRow } = await supabase
                .from('bandhakam_vibhag1')
                .select('*')
                .eq('inspection_id', inspectionIdToUse as string)
                .order('updated_at', { ascending: false })
                .limit(1);
              console.log('Bandhakam saved row (draft):', savedRow);

              const savedObject = (savedRow || [])[0] || {};
              const json = JSON.stringify(savedObject, null, 2);
              // persist for later retrieval
              try {
                await AsyncStorage.setItem('bandhakam_debug_last_saved', json);
              } catch (e) {
                console.warn('Could not save debug payload to AsyncStorage:', e);
              }

              // Removed Share.sheet to avoid UI hangs. Log instead.
              console.log('Bandhakam saved row (draft) JSON saved to AsyncStorage for debugging');

              // Also write a copy into fims_inspections.form_data so the web UI that reads inspection.form_data can show fields
              try {
                const formDataForInspection = {
                  visit_date: formData.visit_date,
                  work_name: formData.work_name,
                  account_head: formData.account_head,
                  admin_approval_number: formData.admin_approval_number,
                  admin_approval_date: formData.admin_approval_date,
                  admin_approval_amount: formData.admin_approval_amount,
                  technical_approval_number: formData.technical_approval_number,
                  technical_approval_date: formData.technical_approval_date,
                  road_length_building_area: formData.road_length_building_area,
                  contract_number: formData.contract_number,
                  contract_amount: formData.contract_amount,
                  contract_percentage: formData.contract_percentage,
                  contractor_name: formData.contractor_name,
                  work_start_order_number: formData.work_start_order_number,
                  work_start_date: formData.work_start_date,
                  work_duration_from: formData.work_duration_from,
                  work_duration_to: formData.work_duration_to,
                  extension_details: formData.extension_details,
                  extension_reasons: formData.extension_reasons,
                  approved_estimate_scope: formData.approved_estimate_scope,
                  current_work_status: formData.current_work_status,
                  measurement_book_page: formData.measurement_book_page,
                  payment_status: formData.payment_status,
                  inspector_name: formData.inspector_name,
                  inspector_designation: formData.inspector_designation,
                  inspection_date: formData.inspection_date,
                };

                const { error: formUpdateError } = await supabase
                  .from('fims_inspections')
                  .update({ form_data: formDataForInspection })
                  .eq('id', inspectionIdToUse as string);
                if (formUpdateError) console.warn('Could not update fims_inspections.form_data (draft):', formUpdateError);
                else console.log('Updated fims_inspections.form_data with bandhakam payload (draft)');
              } catch (e) {
                console.warn('Exception updating fims_inspections.form_data (draft):', e);
              }

              // Also write a copy into fims_inspections.review_comments so web UI that reads inspection-level notes can show data
              try {
                const wrapped = JSON.stringify({ bandhakam_vibhag1: savedObject }, null, 2);
                const { error: updateError } = await supabase
                  .from('fims_inspections')
                  .update({ review_comments: wrapped })
                  .eq('id', inspectionIdToUse as string);
                if (updateError) console.warn('Could not update fims_inspections.review_comments (draft):', updateError);
                else console.log('Updated fims_inspections.review_comments with bandhakam JSON (draft)');
              } catch (e) {
                console.warn('Exception updating fims_inspections.review_comments (draft):', e);
              }
            } catch (e) {
              console.warn('Could not fetch saved bandhakam row after upsert (draft):', e);
            }
        }
      } catch (e) {
        console.error('Bandhakam upsert exception:', e);
        Alert.alert(t('common.error'), `Failed to save form data: ${String(e)}`);
        return;
      }

      await saveLocally(inspectionIdToUse as string, { formData, location, photos });

      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert(t('common.error'), 'Failed to save inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert(t('common.error'), 'Add photo');
      return;
    }

    try {
      setLoading(true);
      let inspectionIdToUse = inspectionId as string | undefined;

      if (inspectionIdToUse) {
        // mark inspection submitted
        await updateInspection(inspectionIdToUse, {
          filled_by_name: formData.contractor_name || user?.email || '',
          status: 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
      } else {
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: formData.contractor_name || user?.email || '',
          status: 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
        inspectionIdToUse = inspection.id;
      }

      // insert/update bandhakam_vibhag1 similar to draft save
      const payload: any = {
        inspection_id: inspectionIdToUse,
        work_name: formData.work_name || '',
        budget_head: formData.account_head || '',
        // combined fields
        admin_approval_details: `${formData.admin_approval_number || ''} | ${formData.admin_approval_date || ''} | ${toNumberOrNull(formData.admin_approval_amount) ?? ''}`,
        technical_approval_details: `${formData.technical_approval_number || ''} | ${formData.technical_approval_date || ''}`,
        karnama_details: `${formData.contract_number || ''} | ${toNumberOrNull(formData.contract_amount) ?? ''} | ${toNumberOrNull(formData.contract_percentage) ?? ''}`,
        work_order_details: `${formData.work_start_order_number || ''} | ${formData.work_start_date || ''}`,
        // separate columns for compatibility with web UI
        admin_approval_number: formData.admin_approval_number || null,
        admin_approval_date: formData.admin_approval_date || null,
        admin_approval_amount: toNumberOrNull(formData.admin_approval_amount),
        technical_approval_number: formData.technical_approval_number || null,
        technical_approval_date: formData.technical_approval_date || null,
        contract_number: formData.contract_number || null,
        contract_amount: toNumberOrNull(formData.contract_amount),
        contract_percentage: toNumberOrNull(formData.contract_percentage),
        work_order_number: formData.work_start_order_number || null,
        work_order_date: formData.work_start_date || null,
        // existing fields
        road_length_building_area: formData.road_length_building_area || '',
        contractor_name: formData.contractor_name || '',
        extension_details: formData.extension_details || '',
        estimate_scope: formData.approved_estimate_scope || '',
        current_work_status: formData.current_work_status || '',
        measurement_book_details: formData.measurement_book_page || '',
        payment_status: formData.payment_status || '',
        visit_date: dateToEpochMs(formData.visit_date),
      };

      if (!inspectionIdToUse) {
        console.error('No inspection id available for Bandhakam submit', inspectionIdToUse);
        Alert.alert(t('common.error'), 'Missing inspection id');
        return;
      }

      console.log('Bandhakam submit payload:', { inspectionIdToUse, payload });

      if (typeof inspectionIdToUse === 'string' && inspectionIdToUse.startsWith('offline_')) {
        console.warn('Inspection is offline; skipping remote upsert for Bandhakam submit:', inspectionIdToUse);
        await saveLocally(inspectionIdToUse as string, { formData, location, photos });
        Alert.alert(t('common.success'), 'Saved locally (offline). It will sync when online.');
        navigation.goBack();
        return;
      }

      // Use upsert on submit as well
      try {
        // Filter payload keys to existing table columns before attempting upsert.
        // Use server-reported columns if available; otherwise use canonical allowed columns.
        const remoteCols = await getTableColumns('bandhakam_vibhag1');
        let allowedSet: Set<string>;
        if (!remoteCols || remoteCols.size === 0) {
          allowedSet = BANDHAKAM_ALLOWED_COLUMNS;
          console.warn('No remote column info available for bandhakam_vibhag1; using canonical allowed list for submit.');
        } else {
          allowedSet = new Set([...remoteCols].filter((c) => BANDHAKAM_ALLOWED_COLUMNS.has(c)));
        }

        const filteredPayload: any = filterPayloadToAllowed(payload, allowedSet);

        // Validate required NOT NULL columns are present and non-empty for submit
        const missingRequired = BANDHAKAM_REQUIRED_COLUMNS.filter((col) => {
          // If the server does not expose this column (allowedSet doesn't contain it), still check original payload
          const val = (payload as any)[col];
          return val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
        });
        if (missingRequired.length > 0) {
          Alert.alert(t('common.error'), `Missing required fields: ${missingRequired.join(', ')}`);
          setLoading(false);
          return;
        }

        const { data: upsertData, error: upsertError } = await supabase
          .from('bandhakam_vibhag1')
          .upsert(filteredPayload, { onConflict: 'inspection_id' })
          .select();

        if (upsertError) {
          if (upsertError.code === '42P10') {
            console.warn('Upsert unsupported (no unique constraint). Falling back to update->insert on submit.');
            const { data: updateData, error: updateError } = await supabase
              .from('bandhakam_vibhag1')
              .update(filteredPayload)
              .eq('inspection_id', inspectionIdToUse as string)
              .select();

            if (updateError) {
              console.error('Bandhkam update fallback error on submit:', updateError);
              Alert.alert(t('common.error'), `Failed to save form data: ${updateError.message || JSON.stringify(updateError)}`);
              return;
            }

            if (!updateData || (Array.isArray(updateData) && updateData.length === 0)) {
              const { data: insertData, error: insertError } = await supabase
                .from('bandhakam_vibhag1')
                .insert(filteredPayload)
                .select();

              if (insertError) {
                console.error('Bandhakam insert fallback error on submit:', insertError);
                Alert.alert(t('common.error'), `Failed to save form data: ${insertError.message || JSON.stringify(insertError)}`);
                return;
              }

              console.log('Bandhakam insert fallback success on submit:', insertData);
            } else {
              console.log('Bandhakam update fallback success on submit:', updateData);
            }
          } else {
            console.error('Bandhakam upsert error on submit:', upsertError);
            Alert.alert(t('common.error'), `Failed to save form data: ${upsertError.message || JSON.stringify(upsertError)}`);
            return;
          }
        } else {
          console.log('Bandhkam upsert success on submit:', upsertData);
          try {
            const { data: savedRow } = await supabase
              .from('bandhakam_vibhag1')
              .select('*')
              .eq('inspection_id', inspectionIdToUse as string)
              .order('updated_at', { ascending: false })
              .limit(1);
            console.log('Bandhakam saved row (submit):', savedRow);

            const savedObject = (savedRow || [])[0] || {};
            const json = JSON.stringify(savedObject, null, 2);
            try {
              await AsyncStorage.setItem('bandhakam_debug_last_saved', json);
            } catch (e) {
              console.warn('Could not save debug payload to AsyncStorage:', e);
            }
            // Removed debug Share sheet to avoid UI hangs/crashes on some devices.
            console.log('Bandhakam saved row (submit) JSON saved to AsyncStorage for debugging');
              // Also write a copy into fims_inspections.form_data so the web UI that reads inspection.form_data can show fields
              try {
                const formDataForInspection = {
                  visit_date: formData.visit_date,
                  work_name: formData.work_name,
                  account_head: formData.account_head,
                  admin_approval_number: formData.admin_approval_number,
                  admin_approval_date: formData.admin_approval_date,
                  admin_approval_amount: formData.admin_approval_amount,
                  technical_approval_number: formData.technical_approval_number,
                  technical_approval_date: formData.technical_approval_date,
                  road_length_building_area: formData.road_length_building_area,
                  contract_number: formData.contract_number,
                  contract_amount: formData.contract_amount,
                  contract_percentage: formData.contract_percentage,
                  contractor_name: formData.contractor_name,
                  work_start_order_number: formData.work_start_order_number,
                  work_start_date: formData.work_start_date,
                  work_duration_from: formData.work_duration_from,
                  work_duration_to: formData.work_duration_to,
                  extension_details: formData.extension_details,
                  extension_reasons: formData.extension_reasons,
                  approved_estimate_scope: formData.approved_estimate_scope,
                  current_work_status: formData.current_work_status,
                  measurement_book_page: formData.measurement_book_page,
                  payment_status: formData.payment_status,
                  inspector_name: formData.inspector_name,
                  inspector_designation: formData.inspector_designation,
                  inspection_date: formData.inspection_date,
                };

                const { error: formUpdateError } = await supabase
                  .from('fims_inspections')
                  .update({ form_data: formDataForInspection })
                  .eq('id', inspectionIdToUse as string);
                if (formUpdateError) console.warn('Could not update fims_inspections.form_data (submit):', formUpdateError);
                else console.log('Updated fims_inspections.form_data with bandhakam payload (submit)');
              } catch (e) {
                console.warn('Exception updating fims_inspections.form_data (submit):', e);
              }

              // Also write a copy into fims_inspections.review_comments so web UI that reads inspection-level notes can show data
              try {
                const wrapped = JSON.stringify({ bandhakam_vibhag1: savedObject }, null, 2);
                const { error: updateError } = await supabase
                  .from('fims_inspections')
                  .update({ review_comments: wrapped })
                  .eq('id', inspectionIdToUse as string);
                if (updateError) console.warn('Could not update fims_inspections.review_comments (submit):', updateError);
                else console.log('Updated fims_inspections.review_comments with bandhakam JSON (submit)');
              } catch (e) {
                console.warn('Exception updating fims_inspections.review_comments (submit):', e);
              }
          } catch (e) {
            console.warn('Could not fetch saved bandhakam row after upsert (submit):', e);
          }
        }
      } catch (e) {
        console.error('Bandhkam upsert exception on submit:', e);
        Alert.alert(t('common.error'), `Failed to save form data: ${String(e)}`);
        return;
      }

      await saveLocally(inspectionIdToUse as string, { formData, location, photos });

      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i];
        const meta = photoMetas && photoMetas[i] ? photoMetas[i] : undefined;

        // If the photo is already a remote URL (previously uploaded), don't try to re-upload.
        // Instead, update the existing DB row's description with any new photo metadata.
        const lower = (uri || '').toLowerCase();
        if (lower.startsWith('http://') || lower.startsWith('https://')) {
          if (meta) {
            try {
              const { data: upd, error: updErr } = await supabase
                .from('fims_inspection_photos')
                .update({ description: JSON.stringify({ photo_location: meta }) })
                .match({ inspection_id: inspectionIdToUse as string, photo_url: uri });

              if (updErr) {
                console.warn('Could not update existing photo metadata for remote photo:', updErr);
              } else {
                console.log('Updated existing photo metadata for remote photo:', upd);
              }
            } catch (e) {
              console.warn('Exception updating photo metadata for remote photo:', e);
            }
          }
          continue;
        }

        // Otherwise upload the local/captured photo
        await uploadPhoto(inspectionIdToUse as string, uri, `photo_${i + 1}.jpg`, i + 1, meta);
      }

      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      Alert.alert(t('common.error'), 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>मूलभूत माहिती</Text>
            <Text style={styles.sectionSubtitle}>Basic Information</Text>

            <DateInput
              label="भेट दिनांक *"
              value={formData.visit_date || todayIso}
              onChangeDate={(date) => setFormData({ ...formData, visit_date: date })}
              minimumDate={new Date()}
              maximumDate={new Date()}
              disabled={!isEditMode}
            />

            <Input
              label="मंजूर अंदाजपत्रकानुसार कामाचे नाव *"
              value={formData.work_name}
              onChangeText={(text) => setFormData({ ...formData, work_name: text })}
              placeholder="कामाचे नाव प्रविष्ट करा"
              editable={isEditMode}
            />

            <Input
              label="लेखाशिर्ष"
              value={formData.account_head}
              onChangeText={(text) => setFormData({ ...formData, account_head: text })}
              placeholder="लेखाशिर्ष प्रविष्ट करा"
              editable={isEditMode}
            />

            <Input
              label="ठेकेदाराचे नाव"
              value={formData.contractor_name}
              onChangeText={(text) => setFormData({ ...formData, contractor_name: text })}
              placeholder="ठेकेदाराचे नाव प्रविष्ट करा"
              editable={isEditMode}
            />

            <Input
              label="प्रशासकीय मान्यता क्रमांक"
              value={formData.admin_approval_number}
              onChangeText={(text) => setFormData({ ...formData, admin_approval_number: text })}
              placeholder="मान्यता क्रमांक प्रविष्ट करा"
              editable={isEditMode}
            />

            <DateInput
              label="प्रशासकीय मान्यता दिनांक"
              value={formData.admin_approval_date}
              onChangeDate={(date) => setFormData({ ...formData, admin_approval_date: date })}
              disabled={!isEditMode}
            />

            <Input
              label="प्रशासकीय मान्यता रक्कम"
              value={formData.admin_approval_amount}
              onChangeText={(text) => setFormData({ ...formData, admin_approval_amount: text })}
              placeholder="रक्कम प्रविष्ट करा"
              keyboardType="numeric"
              editable={isEditMode}
            />

            <Input
              label="तांत्रिक मान्यता क्रमांक"
              value={formData.technical_approval_number}
              onChangeText={(text) => setFormData({ ...formData, technical_approval_number: text })}
              placeholder="तांत्रिक मान्यता क्रमांक प्रविष्ट करा"
              editable={isEditMode}
            />

            <DateInput
              label="तांत्रिक मान्यता दिनांक"
              value={formData.technical_approval_date}
              onChangeDate={(date) => setFormData({ ...formData, technical_approval_date: date })}
              disabled={!isEditMode}
            />

            <Input
              label="रस्त्याची लांबी / इमारतीचे क्षेत्रफळ"
              value={formData.road_length_building_area}
              onChangeText={(text) => setFormData({ ...formData, road_length_building_area: text })}
              placeholder="लांबी/क्षेत्रफळ प्रविष्ट करा"
              editable={isEditMode}
            />
          </ScrollView>
        );

      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>स्थान माहिती</Text>
            <Text style={styles.sectionSubtitle}>Location Information</Text>
            <LocationPicker location={location} onLocationChange={setLocation} disabled={!isEditMode} />
          </View>
        );

      case 2:
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>बांधकाम विभाग तपासणी प्रपत्र</Text>
            <Text style={styles.sectionSubtitle}>Construction Department Inspection Form</Text>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>कारनामा तपशील</Text>
              <Text style={styles.subSectionLabel}>Contract Details</Text>

              <Input
                label="कारनामा क्रमांक"
                value={formData.contract_number}
                onChangeText={(text) => setFormData({ ...formData, contract_number: text })}
                placeholder="कारनामा क्रमांक प्रविष्ट करा"
                editable={isEditMode}
              />

              <Input
                label="कारनामा रक्कम"
                value={formData.contract_amount}
                onChangeText={(text) => setFormData({ ...formData, contract_amount: text })}
                placeholder="रक्कम प्रविष्ट करा"
                keyboardType="numeric"
                editable={isEditMode}
              />

              <Input
                label="टक्केवारी (कमी / अधिक)"
                value={formData.contract_percentage}
                onChangeText={(text) => setFormData({ ...formData, contract_percentage: text })}
                placeholder="टक्केवारी प्रविष्ट करा"
                editable={isEditMode}
              />

              <Input
                label="कार्यारंभ आदेश पत्र क्रमांक"
                value={formData.work_start_order_number}
                onChangeText={(text) => setFormData({ ...formData, work_start_order_number: text })}
                placeholder="आदेश पत्र क्रमांक प्रविष्ट करा"
                editable={isEditMode}
              />

              <DateInput
                label="कार्यारंभ दिनांक"
                value={formData.work_start_date}
                onChangeDate={(date) => setFormData({ ...formData, work_start_date: date })}
                disabled={!isEditMode}
              />

              <DateInput
                label="कामाचा विहित कालावधी (पासून)"
                value={formData.work_duration_from}
                onChangeDate={(date) => setFormData({ ...formData, work_duration_from: date })}
                disabled={!isEditMode}
              />

              <DateInput
                label="कामाचा विहित कालावधी (पर्यंत)"
                value={formData.work_duration_to}
                onChangeDate={(date) => setFormData({ ...formData, work_duration_to: date })}
                disabled={!isEditMode}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>कामाची स्थिती आणि तपशील</Text>
              <Text style={styles.subSectionLabel}>Work Status and Details</Text>

              <Input
                label="मुदतवाढी संबंधी सविस्तर तपशिल व कारणे"
                value={formData.extension_details}
                onChangeText={(text) => setFormData({ ...formData, extension_details: text })}
                placeholder="मुदतवाढी तपशील प्रविष्ट करा"
                multiline
                numberOfLines={3}
                editable={isEditMode}
              />

              <Input
                label="मुदतवाढीची कारणे"
                value={formData.extension_reasons}
                onChangeText={(text) => setFormData({ ...formData, extension_reasons: text })}
                placeholder="कारणे प्रविष्ट करा"
                multiline
                numberOfLines={3}
                editable={isEditMode}
              />

              <Input
                label="तांत्रिक मान्यता प्राप्त अंदाजपत्रकानुसार कामांचा वाव"
                value={formData.approved_estimate_scope}
                onChangeText={(text) => setFormData({ ...formData, approved_estimate_scope: text })}
                placeholder="कामांचा वाव प्रविष्ट करा"
                multiline
                numberOfLines={3}
                editable={isEditMode}
              />

              <Input
                label="कामाची सद्यस्थिती (मुख्य बाबी निहाय)"
                value={formData.current_work_status}
                onChangeText={(text) => setFormData({ ...formData, current_work_status: text })}
                placeholder="सद्यस्थिती प्रविष्ट करा"
                multiline
                numberOfLines={4}
                editable={isEditMode}
              />

              <Input
                label="मोजमाप पुस्तक व पान क्रमांक"
                value={formData.measurement_book_page}
                onChangeText={(text) => setFormData({ ...formData, measurement_book_page: text })}
                placeholder="पुस्तक व पान क्रमांक प्रविष्ट करा"
                editable={isEditMode}
              />

              <Input
                label="देयकाची सद्यस्थिती व आता पावेतो झालेला"
                value={formData.payment_status}
                onChangeText={(text) => setFormData({ ...formData, payment_status: text })}
                placeholder="देयकाची स्थिती प्रविष्ट करा"
                editable={isEditMode}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>निरीक्षकाची माहिती</Text>
              <Text style={styles.subSectionLabel}>Inspector Information</Text>

              <Input
                label="निरीक्षकाचे नाव"
                value={formData.inspector_name}
                onChangeText={(text) => setFormData({ ...formData, inspector_name: text })}
                placeholder="निरीक्षकाचे नाव प्रविष्ट करा"
                editable={isEditMode}
              />

              <Input
                label="पदनाम"
                value={formData.inspector_designation}
                onChangeText={(text) => setFormData({ ...formData, inspector_designation: text })}
                placeholder="पदनाम प्रविष्ट करा"
                editable={isEditMode}
              />

              <DateInput
                label="तपासणी दिनांक"
                value={formData.inspection_date}
                onChangeDate={(date) => setFormData({ ...formData, inspection_date: date })}
                disabled={!isEditMode}
              />
            </View>
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView contentContainerStyle={styles.photoStepContainer}>
            <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              photoMetas={photoMetas}
              onPhotoMetaChange={(m) => setPhotoMetas(m)}
              disabled={!isEditMode}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stepper steps={STEPS} currentStep={currentStep} />

      {inspectionId ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8, alignItems: 'flex-end' }}>
          {!isEditMode ? (
            <Button title={t('common.edit') || 'Edit'} onPress={() => setIsEditMode(true)} variant="outline" />
          ) : (
            <Text style={{ color: '#059669', fontWeight: '600' }}>{t('fims.editing') || 'Editing'}</Text>
          )}
        </View>
      ) : null}

      <View style={styles.content}>
        <Card>{renderStep()}</Card>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <Button
              title={t('common.previous')}
              onPress={handlePrevious}
              variant="outline"
              style={styles.navButton}
              disabled={loading}
            />
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button
              title={t('common.next')}
              onPress={handleNext}
              style={styles.navButton}
              disabled={loading}
            />
          ) : (
            <View style={styles.submitButtons}>
              <Button
                title={t('fims.saveAsDraft')}
                onPress={handleSaveAsDraft}
                variant="outline"
                style={styles.actionButton}
                loading={loading}
              />
              <Button
                title={t('fims.submitInspection')}
                onPress={handleSubmit}
                style={styles.actionButton}
                loading={loading}
              />
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  photoStepContainer: {
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  subSectionLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  navButton: {
    flex: 1,
    minHeight: 52,
  },
  submitButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 56,
  },
});
