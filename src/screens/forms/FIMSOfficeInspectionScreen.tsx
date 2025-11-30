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
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { createInspection, updateInspection, uploadPhoto, getInspectionById, deleteInspection } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'FIMSOfficeInspection'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'FIMSOfficeInspection'>;

const STEPS = ['Employee Info', 'Location Details', 'Office Inspection', 'Photos & Submit'];

interface OfficeFormData {
  visit_date?: string;
  department_name: string;
  employee_name: string;
  designation: string;
  table_number: string;
  date_of_joining: string;
  work_nature: string;
  letter_received_logged: boolean;
  letter_priority_disposed: boolean;
  weekly_report_created: boolean;
  pending_register_maintained: boolean;
  reminders_sent_in_time: boolean;
  letters_bound_with_permission: boolean;
  class_d_letters_destroyed: boolean;
  long_pending_cases: boolean;
  required_registers: boolean;
  updated_registers: boolean;
  registers_submitted_on_time: boolean;
  file_structure_six_bundle: boolean;
  post_disposal_bundling: boolean;
  periodic_statements_submitted: boolean;
  permanent_instruction_available: boolean;
  indexed_instruction_complete: boolean;
  updated_by_gov_circular: boolean;
  files_classified: boolean;
  binding_and_submission: boolean;
  disposal_speed_satisfactory: boolean;
  evaluation_score: number;
  work_quality: string;
  inspection_issues: string;
  inspector_name: string;
  inspector_designation: string;
  supervisor_remarks: string;
  supervisor_signature: string;
}

interface LocalPhotoMeta {
  latitude?: number;
  longitude?: number;
  accuracy?: number | undefined;
  address?: string | undefined;
}

export default function FIMSOfficeInspectionScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { hasAccess, userRole } = usePermissions(user);
  const { categoryId, inspectionId, edit } = route.params as { categoryId: string; inspectionId?: string; edit?: boolean };

  const [isEditMode, setIsEditMode] = useState<boolean>(() => Boolean(edit) || !inspectionId);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoMetas, setPhotoMetas] = useState<LocalPhotoMeta[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [inspectionOwnerId, setInspectionOwnerId] = useState<string | null>(null);

  const [formData, setFormData] = useState<OfficeFormData>({
    visit_date: new Date().toISOString().slice(0, 10),
    department_name: '',
    employee_name: '',
    designation: '',
    table_number: '',
    date_of_joining: '',
    work_nature: '',
    letter_received_logged: false,
    letter_priority_disposed: false,
    weekly_report_created: false,
    pending_register_maintained: false,
    reminders_sent_in_time: false,
    letters_bound_with_permission: false,
    class_d_letters_destroyed: false,
    long_pending_cases: false,
    required_registers: false,
    updated_registers: false,
    registers_submitted_on_time: false,
    file_structure_six_bundle: false,
    post_disposal_bundling: false,
    periodic_statements_submitted: false,
    permanent_instruction_available: false,
    indexed_instruction_complete: false,
    updated_by_gov_circular: false,
    files_classified: false,
    binding_and_submission: false,
    disposal_speed_satisfactory: false,
    evaluation_score: 0,
    work_quality: '',
    inspection_issues: '',
    inspector_name: '',
    inspector_designation: '',
    supervisor_remarks: '',
    supervisor_signature: '',
  });

  // Helper: sanitize office form data to match DB expectations
  const sanitizeOfficeFormData = () => {
    const booleanFields = [
      'letter_received_logged', 'letter_priority_disposed', 'weekly_report_created',
      'pending_register_maintained', 'reminders_sent_in_time', 'letters_bound_with_permission',
      'class_d_letters_destroyed', 'long_pending_cases', 'required_registers', 'updated_registers',
      'registers_submitted_on_time', 'file_structure_six_bundle', 'post_disposal_bundling',
      'periodic_statements_submitted', 'permanent_instruction_available', 'indexed_instruction_complete',
      'updated_by_gov_circular', 'files_classified', 'binding_and_submission', 'disposal_speed_satisfactory'
    ];

    const sanitized: any = {};
    // copy simple string fields
    sanitized.department_name = formData.department_name ?? null;
    // visit_date: default to today if not provided
    sanitized.visit_date = formData.visit_date ?? new Date().toISOString().slice(0, 10);
    sanitized.employee_name = formData.employee_name || null;
    sanitized.designation = formData.designation || null;
    sanitized.table_number = formData.table_number || null;
    sanitized.date_of_joining = formData.date_of_joining || null;
    sanitized.work_nature = formData.work_nature || null;

    // booleans
    booleanFields.forEach((f) => {
      // @ts-ignore
      sanitized[f] = Boolean((formData as any)[f]);
    });

    // inspection_issues_json should be array
    if (Array.isArray((formData as any).inspection_issues_json)) {
      sanitized.inspection_issues_json = (formData as any).inspection_issues_json;
    } else if ((formData as any).inspection_issues) {
      sanitized.inspection_issues_json = [(formData as any).inspection_issues];
    } else {
      sanitized.inspection_issues_json = [];
    }

    // evaluation_score
    sanitized.evaluation_score = Number((formData as any).evaluation_score) || 0;

    // work_quality: if empty -> null (DB allows null), otherwise use provided value
    sanitized.work_quality = (formData as any).work_quality ? (formData as any).work_quality : null;

    sanitized.inspector_name = formData.inspector_name || null;
    sanitized.inspector_designation = formData.inspector_designation || null;
    sanitized.supervisor_remarks = formData.supervisor_remarks || null;
    sanitized.supervisor_signature = formData.supervisor_signature || null;

    // ensure filled_by_name
    sanitized.filled_by_name = formData.employee_name || '';

    return sanitized;
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

  // Load existing inspection/form when editing
  React.useEffect(() => {
    if (!inspectionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const inspection = await getInspectionById(inspectionId);
        if (inspection) {
          setInspectionOwnerId(inspection.inspector_id || null);
          setLocation({
            latitude: inspection.location_latitude || 0,
            longitude: inspection.location_longitude || 0,
            accuracy: null,
            address: inspection.location_address || null,
            timestamp: Date.now(),
          });
          if (inspection.photos && inspection.photos.length > 0) {
            setPhotos(inspection.photos.map((p: any) => p.photo_url));
            // Parse stored metadata (description) for each photo when available
            const metas = inspection.photos.map((p: any) => {
              try {
                const desc = p.description;
                if (!desc) return {} as LocalPhotoMeta;
                const parsed = typeof desc === 'string' ? JSON.parse(desc) : desc;
                // Support shape { photo_location: { latitude, longitude, accuracy, address } }
                if (parsed && parsed.photo_location) {
                  const pl = parsed.photo_location;
                  return {
                    latitude: pl.latitude,
                    longitude: pl.longitude,
                    accuracy: pl.accuracy ?? undefined,
                    address: pl.address ?? pl.name ?? undefined,
                  } as LocalPhotoMeta;
                }
                // If description is just an address string or object with address
                if (typeof parsed === 'string') return { address: parsed } as LocalPhotoMeta;
                if (parsed.address) return { address: parsed.address } as LocalPhotoMeta;
              } catch (e) {
                // ignore parse errors
              }
              return {} as LocalPhotoMeta;
            });
            setPhotoMetas(metas);
          }
        }

        const { data: formRows, error: formError } = await supabase
          .from('fims_office_inspection_forms')
          .select('*')
          .eq('inspection_id', inspectionId)
          .single();

        if (!formError && formRows) {
          // Map DB row fields into formData
          const mapped: any = { ...formRows };
          // ensure fields present in our state shape
          setFormData((prev: any) => ({ ...prev, ...mapped }));
        }
      } catch (err) {
        console.error('Error loading office inspection edit data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [inspectionId]);

  const handleToggleEditTop = () => {
    setIsEditMode(prev => {
      const next = !prev;
      Alert.alert('Edit Mode', next ? 'Editing enabled' : 'Editing disabled');
      return next;
    });
  };

  const handleDeleteInspection = () => {
    if (!inspectionId) return;

    const isOwner = Boolean((user?.id && inspectionOwnerId && user.id === inspectionOwnerId));
    const isAdminRole = hasAccess('fims', 'admin') || ['admin', 'super_admin', 'developer'].includes(userRole ?? '');
    if (!hasAccess('fims', 'delete') && !isOwner && !isAdminRole) {
      Alert.alert(t('common.error'), 'You do not have permission to delete this inspection');
      return;
    }

    Alert.alert(
      t('common.delete'),
      t('common.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInspection(inspectionId);
              Alert.alert(t('common.success'), 'Inspection deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('common.error'), 'Failed to delete inspection');
            }
          },
        },
      ]
    );
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.department_name || !formData.employee_name) {
        Alert.alert(t('common.error'), 'Please fill in all required fields');
        return;
      }
    }

    if (currentStep === 1) {
      if (!location) {
        Alert.alert(t('common.error'), 'Please capture location');
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

  // Enter edit mode and jump to the first page to make editing obvious
  const enterEditMode = () => {
    console.log('enterEditMode called');
    setIsEditMode(true);
    setCurrentStep(0);
  };

  React.useEffect(() => {
    console.log('FIMSOfficeInspectionScreen isEditMode:', isEditMode);
  }, [isEditMode]);

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);

      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.employee_name,
        status: 'draft',
        location_name: location?.address || null,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_accuracy: location?.accuracy ?? null,
        location_address: location?.address || null,
      } as any);

      // If createInspection returned an offline id, save locally and return
      if (inspection.id && String(inspection.id).startsWith('offline_')) {
        await saveLocally(inspection.id, { formData, location, photos });
        Alert.alert(t('common.success'), 'Saved offline — will sync when online');
        navigation.goBack();
        return;
      }

      // Sanitize office form data to match DB expectations
      const sanitizeOfficeForm = () => {
        const booleanFields = [
          'letter_received_logged', 'letter_priority_disposed', 'weekly_report_created',
          'pending_register_maintained', 'reminders_sent_in_time', 'letters_bound_with_permission',
          'class_d_letters_destroyed', 'long_pending_cases', 'required_registers', 'updated_registers',
          'registers_submitted_on_time', 'file_structure_six_bundle', 'post_disposal_bundling',
          'periodic_statements_submitted', 'permanent_instruction_available', 'indexed_instruction_complete',
          'updated_by_gov_circular', 'files_classified', 'binding_and_submission', 'disposal_speed_satisfactory'
        ];

        const sanitized: any = {};
        // copy simple string fields
        sanitized.department_name = formData.department_name ?? null;
        sanitized.employee_name = formData.employee_name || null;
        sanitized.designation = formData.designation || null;
        sanitized.table_number = formData.table_number || null;
        sanitized.date_of_joining = formData.date_of_joining || null;
        sanitized.work_nature = formData.work_nature || null;

        // booleans
        booleanFields.forEach((f) => {
          // @ts-ignore
          sanitized[f] = Boolean((formData as any)[f]);
        });

        // inspection_issues_json should be array
        if (Array.isArray((formData as any).inspection_issues_json)) {
          sanitized.inspection_issues_json = (formData as any).inspection_issues_json;
        } else if ((formData as any).inspection_issues) {
          sanitized.inspection_issues_json = [(formData as any).inspection_issues];
        } else {
          sanitized.inspection_issues_json = [];
        }

        // evaluation_score
        sanitized.evaluation_score = Number((formData as any).evaluation_score) || 0;

        // work_quality: if empty -> null (DB allows null), otherwise use provided value
        sanitized.work_quality = (formData as any).work_quality ? (formData as any).work_quality : null;

        sanitized.inspector_name = formData.inspector_name || null;
        sanitized.inspector_designation = formData.inspector_designation || null;
        sanitized.supervisor_remarks = formData.supervisor_remarks || null;
        sanitized.supervisor_signature = formData.supervisor_signature || null;

        // ensure filled_by_name
        sanitized.filled_by_name = formData.employee_name || '';

        // do not include per-form location_address (stored on main inspection row)

        return sanitized;
      };

      const sanitizedFormData = sanitizeOfficeForm();

      console.log('Inserting office form for inspection:', inspection.id, sanitizedFormData);

      // Use maybeSingle to detect existence in later flows; here this is an insert for new inspection
      const { data: insertedForm, error: formError } = await supabase
        .from('fims_office_inspection_forms')
        .insert({ inspection_id: inspection.id, ...sanitizedFormData })
        .select()
        .single();

      if (formError) {
        console.error('Office form insert error:', formError);
        Alert.alert(t('common.error'), `Failed to save form: ${formError.message || JSON.stringify(formError)}`);
        return;
      }

      console.log('Office form inserted row:', insertedForm);

      await saveLocally(inspection.id, { formData, location, photos });

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
      Alert.alert(t('common.error'), 'Please add at least one photo');
      return;
    }

    try {
      setLoading(true);

      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.employee_name,
        status: 'submitted',
        location_name: location?.address || null,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_accuracy: location?.accuracy ?? null,
      } as any);

      // If offline inspection id returned, save locally and notify user
      if (inspection.id && String(inspection.id).startsWith('offline_')) {
        await saveLocally(inspection.id, { formData, location, photos });
        Alert.alert(t('common.success'), 'Saved offline — will sync when online');
        return;
      }

      // compute evaluation score (same logic as draft)
      const booleanFields = [
        'letter_received_logged',
        'letter_priority_disposed',
        'weekly_report_created',
        'pending_register_maintained',
        'reminders_sent_in_time',
        'letters_bound_with_permission',
        'class_d_letters_destroyed',
        'long_pending_cases',
        'required_registers',
        'updated_registers',
        'registers_submitted_on_time',
        'file_structure_six_bundle',
        'post_disposal_bundling',
        'periodic_statements_submitted',
        'permanent_instruction_available',
        'indexed_instruction_complete',
        'updated_by_gov_circular',
        'files_classified',
        'binding_and_submission',
        'disposal_speed_satisfactory',
      ];

      let evaluation_score = 0;
      booleanFields.forEach((f) => {
        // @ts-ignore
        if (formData[f]) evaluation_score += 1;
      });

      const allowedWorkQuality = ['वाईट', 'साधारण', 'चांगला', 'उत्तम', 'उत्कृष्ट'];
      const work_quality_val = allowedWorkQuality.includes(formData.work_quality) ? formData.work_quality : 'साधारण';

      const officeData: any = {
        inspection_id: inspection.id,
        filled_by_name: formData.employee_name || '',
        visit_date: formData.visit_date || new Date().toISOString().slice(0, 10),
        department_name: formData.department_name,
        employee_name: formData.employee_name,
        designation: formData.designation,
        table_number: formData.table_number,
        date_of_joining: formData.date_of_joining || null,
        work_nature: formData.work_nature,
        letter_received_logged: formData.letter_received_logged,
        letter_priority_disposed: formData.letter_priority_disposed,
        weekly_report_created: formData.weekly_report_created,
        pending_register_maintained: formData.pending_register_maintained,
        reminders_sent_in_time: formData.reminders_sent_in_time,
        letters_bound_with_permission: formData.letters_bound_with_permission,
        class_d_letters_destroyed: formData.class_d_letters_destroyed,
        long_pending_cases: formData.long_pending_cases,
        required_registers: formData.required_registers,
        updated_registers: formData.updated_registers,
        registers_submitted_on_time: formData.registers_submitted_on_time,
        file_structure_six_bundle: formData.file_structure_six_bundle,
        post_disposal_bundling: formData.post_disposal_bundling,
        periodic_statements_submitted: formData.periodic_statements_submitted,
        permanent_instruction_available: formData.permanent_instruction_available,
        indexed_instruction_complete: formData.indexed_instruction_complete,
        updated_by_gov_circular: formData.updated_by_gov_circular,
        files_classified: formData.files_classified,
        binding_and_submission: formData.binding_and_submission,
        disposal_speed_satisfactory: formData.disposal_speed_satisfactory,
        inspection_issues_json: formData.inspection_issues ? [formData.inspection_issues] : [],
        evaluation_score: evaluation_score,
        work_quality: work_quality_val,
        inspector_name: formData.inspector_name,
        inspector_designation: formData.inspector_designation,
        supervisor_remarks: formData.supervisor_remarks,
        supervisor_signature: formData.supervisor_signature,
      };

      console.log('Inserting office form for inspection:', inspection.id, officeData);
      const { data: insertedForm, error: formError } = await supabase
        .from('fims_office_inspection_forms')
        .insert(officeData)
        .select()
        .single();

      if (formError) {
        console.error('Office form insert error:', formError);
        Alert.alert(t('common.error'), `Failed to save form: ${formError.message || JSON.stringify(formError)}`);
        return;
      }

      console.log('Office form inserted row:', insertedForm);

      await saveLocally(inspection.id, { formData, location, photos });

      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i] || '';
        if (!uri) continue;
        // Skip remote URLs (already uploaded)
        if (uri.toLowerCase().startsWith('http')) continue;
        const rawMeta = photoMetas[i];
        const meta = rawMeta ? { latitude: rawMeta.latitude, longitude: rawMeta.longitude, accuracy: rawMeta.accuracy ?? undefined } : undefined;
        await uploadPhoto(inspection.id, uri, `photo_${i + 1}.jpg`, i + 1, meta);
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

  // Save edits for existing inspection/form
  const handleSaveEdits = async () => {
    if (!inspectionId) return;
    try {
      setLoading(true);

      // If this is an offline inspection id, save locally instead of updating remote
      if (String(inspectionId).startsWith('offline_')) {
        await saveLocally(inspectionId, { formData, location, photos });
        Alert.alert(t('common.success'), 'Saved offline — will sync when online');
        setIsEditMode(false);
        return;
      }

      // Update inspection basic fields
      const updatedInspection = await updateInspection(inspectionId, {
        filled_by_name: formData.employee_name,
        location_name: location?.address || null,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_accuracy: location?.accuracy ?? null,
        location_address: location?.address || null,
      } as any);
      console.log('Inspection updated:', updatedInspection);

      // Prepare office data to update
      const booleanFields = [
        'letter_received_logged',
        'letter_priority_disposed',
        'weekly_report_created',
        'pending_register_maintained',
        'reminders_sent_in_time',
        'letters_bound_with_permission',
        'class_d_letters_destroyed',
        'long_pending_cases',
        'required_registers',
        'updated_registers',
        'registers_submitted_on_time',
        'file_structure_six_bundle',
        'post_disposal_bundling',
        'periodic_statements_submitted',
        'permanent_instruction_available',
        'indexed_instruction_complete',
        'updated_by_gov_circular',
        'files_classified',
        'binding_and_submission',
        'disposal_speed_satisfactory',
      ];

      let evaluation_score = 0;
      booleanFields.forEach((f) => {
        // @ts-ignore
        if (formData[f]) evaluation_score += 1;
      });

      const allowedWorkQuality = ['वाईट', 'साधारण', 'चांगला', 'उत्तम', 'उत्कृष्ट'];
      const work_quality_val = allowedWorkQuality.includes(formData.work_quality) ? formData.work_quality : 'साधारण';

      const officeData: any = {
        filled_by_name: formData.employee_name || '',
        location_address: location?.address || null,
        visit_date: formData.visit_date || new Date().toISOString().slice(0, 10),
        department_name: formData.department_name,
        employee_name: formData.employee_name,
        designation: formData.designation,
        table_number: formData.table_number,
        date_of_joining: formData.date_of_joining || null,
        work_nature: formData.work_nature,
        letter_received_logged: formData.letter_received_logged,
        letter_priority_disposed: formData.letter_priority_disposed,
        weekly_report_created: formData.weekly_report_created,
        pending_register_maintained: formData.pending_register_maintained,
        reminders_sent_in_time: formData.reminders_sent_in_time,
        letters_bound_with_permission: formData.letters_bound_with_permission,
        class_d_letters_destroyed: formData.class_d_letters_destroyed,
        long_pending_cases: formData.long_pending_cases,
        required_registers: formData.required_registers,
        updated_registers: formData.updated_registers,
        registers_submitted_on_time: formData.registers_submitted_on_time,
        file_structure_six_bundle: formData.file_structure_six_bundle,
        post_disposal_bundling: formData.post_disposal_bundling,
        periodic_statements_submitted: formData.periodic_statements_submitted,
        permanent_instruction_available: formData.permanent_instruction_available,
        indexed_instruction_complete: formData.indexed_instruction_complete,
        updated_by_gov_circular: formData.updated_by_gov_circular,
        files_classified: formData.files_classified,
        binding_and_submission: formData.binding_and_submission,
        disposal_speed_satisfactory: formData.disposal_speed_satisfactory,
        inspection_issues_json: formData.inspection_issues ? [formData.inspection_issues] : [],
        evaluation_score: evaluation_score,
        work_quality: work_quality_val,
        inspector_name: formData.inspector_name,
        inspector_designation: formData.inspector_designation,
        supervisor_remarks: formData.supervisor_remarks,
        supervisor_signature: formData.supervisor_signature,
      };

      console.log('Updating office form for inspection:', inspectionId, officeData);
      const { data: updatedForm, error: updateError } = await supabase
        .from('fims_office_inspection_forms')
        .update(officeData)
        .eq('inspection_id', inspectionId)
        .select()
        .single();

      if (updateError) {
        console.error('Office form update error:', updateError);
        // Try insert if update failed (record might not exist)
        const { data: insertedForm, error: insertError } = await supabase
          .from('fims_office_inspection_forms')
          .insert({ inspection_id: inspectionId, ...officeData })
          .select()
          .single();
        if (insertError) {
          console.error('Office form insert-on-update error:', insertError);
          Alert.alert(t('common.error'), `Failed to save changes: ${insertError.message || JSON.stringify(insertError)}`);
          return;
        }
        console.log('Office form inserted on update fallback:', insertedForm);
      } else {
        console.log('Office form updated row:', updatedForm);
      }

      // Upload any local photos (skip remote URLs). Collect photo upload errors but continue.
      const photoUploadErrors: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i] || '';
        if (!uri) continue;
        if (uri.toLowerCase().startsWith('http')) continue;
        const rawMeta = photoMetas[i];
        const meta = rawMeta ? { latitude: rawMeta.latitude, longitude: rawMeta.longitude, accuracy: rawMeta.accuracy ?? undefined } : undefined;
        try {
          await uploadPhoto(inspectionId, uri, `photo_${i + 1}.jpg`, i + 1, meta);
        } catch (upErr: any) {
          console.error('Photo upload failed for', uri, upErr);
          photoUploadErrors.push(`Photo ${i + 1}: ${upErr?.message || String(upErr)}`);
        }
      }

      if (photoUploadErrors.length > 0) {
        Alert.alert(t('common.success'), `Saved changes, but some photos failed to upload:\n${photoUploadErrors.join('\n')}`);
      } else {
        Alert.alert(t('common.success'), 'Changes saved');
      }
      setIsEditMode(false);
    } catch (err) {
      console.error('Save edits error:', err);
      Alert.alert(t('common.error'), 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckItem = (label: string, value: boolean, onChange: (val: boolean) => void) => (
    <View style={styles.checkItem}>
      <Text style={styles.checkLabel}>{label}</Text>
      <Switch value={value} onValueChange={isEditMode ? onChange : undefined} disabled={!isEditMode} />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>कर्मचाऱ्यांची माहिती</Text>
            <Text style={styles.sectionSubtitle}>Employee Information</Text>

            <Input
              label="विभागाचे नाव  *"
              value={formData.department_name}
              onChangeText={(text) => setFormData({ ...formData, department_name: text })}
              editable={isEditMode}
              placeholder="विभागाचे नाव प्रविष्ट करा"
            />

            <Input
              label="कर्मचाऱ्याचे नाव  *"
              value={formData.employee_name}
              onChangeText={(text) => setFormData({ ...formData, employee_name: text })}
              editable={isEditMode}
              placeholder="कर्मचाऱ्याचे नाव प्रविष्ट करा"
            />

            <Input
              label="पदनाम "
              value={formData.designation}
              onChangeText={(text) => setFormData({ ...formData, designation: text })}
              editable={isEditMode}
              placeholder="पदनाम प्रविष्ट करा"
            />

            <Input
              label="टेबल क्रमांक "
              value={formData.table_number}
              onChangeText={(text) => setFormData({ ...formData, table_number: text })}
              editable={isEditMode}
              placeholder="टेबल क्रमांक प्रविष्ट करा"
              keyboardType="number-pad"
            />

            <DateInput
              label="भेटीची तारीख / Visit Date *"
              value={formData.visit_date || new Date().toISOString().slice(0, 10)}
              onChangeDate={(date) => setFormData({ ...formData, visit_date: date })}
              minimumDate={new Date()}
              maximumDate={new Date()}
              disabled={!isEditMode}
            />

            <DateInput
              label="कार्यरत असण्याची तारीख "
              value={formData.date_of_joining}
              onChangeDate={(date) => setFormData({ ...formData, date_of_joining: date })}
              placeholder="YYYY-MM-DD"
              maximumDate={new Date()}
              disabled={!isEditMode}
            />

            <Input
              label="हाताळलेले कामाचे स्वरूप "
              value={formData.work_nature}
              onChangeText={(text) => setFormData({ ...formData, work_nature: text })}
              editable={isEditMode}
              placeholder="कामाचे स्वरूप वर्णन करा"
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        );

      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>स्थान माहिती</Text>
            <Text style={styles.sectionSubtitle}>Location Information</Text>
            <LocationPicker location={location} onLocationChange={setLocation} disabled={!isEditMode} />

            <Input
              label="Location / ठिकाण"
              value={location?.address || ''}
              onChangeText={(text) => setLocation((prev) => ({
                latitude: prev?.latitude ?? 0,
                longitude: prev?.longitude ?? 0,
                accuracy: prev?.accuracy ?? null,
                address: text,
                timestamp: prev?.timestamp ?? Date.now(),
              }))}
              editable={isEditMode}
              placeholder="Capture location or enter address"
            />
          </View>
        );

      case 2:
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>दफ्तर निरीक्षण प्रपत्र</Text>
            <Text style={styles.sectionSubtitle}>Office Inspection Form</Text>

            {/* visit_date shown on first page only */}

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>पत्र व्यवहार तपशील</Text>
              <Text style={styles.subSectionLabel}>Letter Correspondence Details</Text>
              {renderCheckItem('प्राप्त पत्रे कार्यविवरण पंजीत नोंदवले जातात?', formData.letter_received_logged, (val) =>
                setFormData({ ...formData, letter_received_logged: val })
              )}
              {renderCheckItem('पत्रांचा प्राधान्यानुसार निपटारा केला जातो?', formData.letter_priority_disposed, (val) =>
                setFormData({ ...formData, letter_priority_disposed: val })
              )}
              {renderCheckItem('आठवडी गोपवारा नियमित काढला जातो?', formData.weekly_report_created, (val) =>
                setFormData({ ...formData, weekly_report_created: val })
              )}
              {renderCheckItem('प्रतिक्षाधिन तोंश्वही ठेवली आहे?', formData.pending_register_maintained, (val) =>
                setFormData({ ...formData, pending_register_maintained: val })
              )}
              {renderCheckItem('विहित मुदतीत स्मरणपत्र दिले जाते?', formData.reminders_sent_in_time, (val) =>
                setFormData({ ...formData, reminders_sent_in_time: val })
              )}
              {renderCheckItem('अधिकाऱ्याच्या आदेशानंतर नस्तीबद्ध केले जाते?', formData.letters_bound_with_permission, (val) =>
                setFormData({ ...formData, letters_bound_with_permission: val })
              )}
              {renderCheckItem('\'ड\' वर्ग पत्र नष्ट केले जातात?', formData.class_d_letters_destroyed, (val) =>
                setFormData({ ...formData, class_d_letters_destroyed: val })
              )}
              {renderCheckItem('दिर्घ प्रलंबित पत्रे/प्रकरणे?', formData.long_pending_cases, (val) =>
                setFormData({ ...formData, long_pending_cases: val })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>नोंदवह्या</Text>
              <Text style={styles.subSectionLabel}>Registers</Text>
              {renderCheckItem('आवश्यक नोंदवह्या आहेत?', formData.required_registers, (val) =>
                setFormData({ ...formData, required_registers: val })
              )}
              {renderCheckItem('अद्ययावत आहेत?', formData.updated_registers, (val) =>
                setFormData({ ...formData, updated_registers: val })
              )}
              {renderCheckItem('तपासणीसाठी सादर केल्या जातात?', formData.registers_submitted_on_time, (val) =>
                setFormData({ ...formData, registers_submitted_on_time: val })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>दप्तरची रचना</Text>
              <Text style={styles.subSectionLabel}>Office Structure</Text>
              {renderCheckItem('६ गठ्ठे पद्धत वापरण्यात आलेली?', formData.file_structure_six_bundle, (val) =>
                setFormData({ ...formData, file_structure_six_bundle: val })
              )}
              {renderCheckItem('प्राप्त पत्रांची निपटारी ६ गठ्ठ्यात केली जाते?', formData.post_disposal_bundling, (val) =>
                setFormData({ ...formData, post_disposal_bundling: val })
              )}
              {renderCheckItem('नियतकालिक विवरण पाठवले जाते?', formData.periodic_statements_submitted, (val) =>
                setFormData({ ...formData, periodic_statements_submitted: val })
              )}
              {renderCheckItem('स्थायी आदेश वस्त्या उपलब्ध?', formData.permanent_instruction_available, (val) =>
                setFormData({ ...formData, permanent_instruction_available: val })
              )}
              {renderCheckItem('पृष्ठांकन व अनुक्रमणिका पूर्ण?', formData.indexed_instruction_complete, (val) =>
                setFormData({ ...formData, indexed_instruction_complete: val })
              )}
              {renderCheckItem('शासन निर्णय व परिपत्रकाने अद्ययावत?', formData.updated_by_gov_circular, (val) =>
                setFormData({ ...formData, updated_by_gov_circular: val })
              )}
              {renderCheckItem('निंदणीकरण व वर्गीकरण?', formData.files_classified, (val) =>
                setFormData({ ...formData, files_classified: val })
              )}
              {renderCheckItem('योग्य वस्त्यात बाइंडिंग आणि पाठवणी?', formData.binding_and_submission, (val) =>
                setFormData({ ...formData, binding_and_submission: val })
              )}
              {renderCheckItem('कामाचा निपटारा आवश्यक गतीने?', formData.disposal_speed_satisfactory, (val) =>
                setFormData({ ...formData, disposal_speed_satisfactory: val })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>तपासणीच्या तुटी</Text>
              <Text style={styles.subSectionLabel}>Inspection Issues</Text>
              <Input
                label="तपासणीच्या तुटी नोंदवा"
                value={formData.inspection_issues}
                onChangeText={(text) => setFormData({ ...formData, inspection_issues: text })}
                editable={isEditMode}
                placeholder="Enter any issues found during inspection"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>कामाचा दर्जा मूल्यांकन</Text>
              <Text style={styles.subSectionLabel}>Work Quality Evaluation</Text>

              <Input
                label="होय उत्तरांची संख्या (Automatic)"
                value={String(formData.evaluation_score)}
                editable={false}
                style={{ backgroundColor: '#f3f4f6' }}
              />

              <Input
                label="कामाचा दर्जा / Work Quality"
                value={formData.work_quality}
                onChangeText={(text) => setFormData({ ...formData, work_quality: text })}
                editable={isEditMode}
                placeholder="वाईट / साधारण / चांगला / उत्तम / उत्कृष्ट"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>अधिकारी अभिज्ञान</Text>
              <Text style={styles.subSectionLabel}>Officer Acknowledgment</Text>

              <Input
                label="निरीक्षण करणाऱ्या अधिकाऱ्याचे नाव"
                value={formData.inspector_name}
                onChangeText={(text) => setFormData({ ...formData, inspector_name: text })}
                editable={isEditMode}
                placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
              />

              <Input
                label="पदनाम / Designation"
                value={formData.inspector_designation}
                onChangeText={(text) => setFormData({ ...formData, inspector_designation: text })}
                editable={isEditMode}
                placeholder="पदनाम प्रविष्ट करा"
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
              onPhotoMetaChange={setPhotoMetas}
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
      {inspectionId && (
        (() => {
          const isOwner = Boolean((user?.id && inspectionOwnerId && user.id === inspectionOwnerId));
          const isAdminRole = hasAccess('fims', 'admin') || ['admin', 'super_admin', 'developer'].includes(userRole ?? '');
          const canEdit = hasAccess('fims', 'write') || isOwner || isAdminRole;
          const canDelete = hasAccess('fims', 'delete') || isOwner || isAdminRole;
          if (!canEdit && !canDelete) return null;
          return (
            <View style={{ paddingHorizontal: 16, paddingTop: 12, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              {canEdit && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', marginRight: 8 }]} onPress={handleToggleEditTop}>
                  <Text style={{ color: '#111', fontWeight: '600' }}>{isEditMode ? (t('common.view') || 'View') : (t('common.edit') || 'Edit')}</Text>
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ef4444' }]} onPress={handleDeleteInspection}>
                  <Text style={{ color: '#ef4444', fontWeight: '600' }}>{t('common.delete')}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })()
      )}
      <Stepper steps={STEPS} currentStep={currentStep} />

      {/* edit banner removed for cleaner UI */}

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
              {inspectionId ? (
                isEditMode ? (
                  <>
                    <Button
                      title="Save Changes"
                      onPress={handleSaveEdits}
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
                  </>
                ) : (
                  <>
                    <Button
                      title="Edit"
                      onPress={enterEditMode}
                      variant="outline"
                      style={styles.actionButton}
                      disabled={loading}
                    />
                    <Button
                      title="Close"
                      onPress={() => navigation.goBack()}
                      style={styles.actionButton}
                      disabled={loading}
                    />
                  </>
                )
              ) : (
                <>
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
                </>
              )}
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
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkLabel: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
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
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 48,
  },
  submitButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 52,
  },
  // edit banner styles removed
});
