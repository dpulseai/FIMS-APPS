import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
type FormsStackParamList = {
  MahatmaGandhiRojgarHami: { categoryId: string; inspectionId?: string };
  CategorySelection: undefined;
};
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto, createMahatmaGandhiFormRecord, updateInspection, upsertMahatmaGandhiFormRecord } from '../../services/fimsService';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';
// Add this import after your existing imports
import { supabase } from '../../services/supabase' // Adjust path based on your file structure



type RouteParams = RouteProp<FormsStackParamList, 'MahatmaGandhiRojgarHami'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'MahatmaGandhiRojgarHami'>;

const STEPS = [
  'मूलभूत माहिती',
  'स्थान माहिती',
  'रोजगार हमी तपासणी',
  'छायाचित्रे',
];

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface MahatmaGandhiFormData {
  inspection_date: string;
  inspector_name: string;
  inspector_designation: string;
  work_name: string;
  gram_panchayat: string;
  village: string;
  tehsil: string;
  district: string;
  work_type: string;
  annual_action_plan_included: string;
  annual_action_plan_year: string;
  implementation_agency: string;
  work_code: string;
  estimated_amount_unskilled: string;
  estimated_amount_skilled: string;
  estimated_amount_total: string;
  dsr_department: string;
  dsr_year: string;
  nrega_soft_records_correct: string;
  nrega_soft_form_a: string;
  nrega_soft_form_b: string;
  work_under_convergence: string;
  convergence_department: string;
  convergence_fund_details: string;
  mgnrega_unskilled: string;
  mgnrega_skilled: string;
  mgnrega_total: string;
  other_dept_unskilled: string;
  other_dept_skilled: string;
  other_dept_total: string;
  attendance_register_workers: string;
  actual_workers_present: string;
  shelter_for_workers: string;
  first_aid_kit: string;
  drinking_water: string;
  childcare_for_workers_children: string;
  current_work_status: string;
  expenses_unskilled: string;
  expenses_skilled: string;
  expenses_total: string;
  previous_attendance_closure_date: string;
  wages_deposited_timely: string;
  delay_compensation_provided: string;
  aadhaar_based_payment: string;
  payment_failure_reasons: string;
  workers_have_job_cards: string;
  job_card_records_updated: string;
  work_file_updated: string;
  citizen_information_board: string;
  work_measurement_done: string;
  measurement_book_number: string;
  all_measurements_recorded: string;
  senior_technical_officer_check: string;
  measurement_discrepancy: string;
  discrepancy_details: string;
  work_geotagged: string;
  other_important_matters: string;
  overall_work_quality: string;
  work_utility_feedback: string;
  inspection_date_final: string;
  inspection_location: string;
  inspector_name_final: string;
  inspector_designation_final: string;
  inspector_office: string;
}

export default function MahatmaGandhiRojgarHamiScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId, inspectionId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Array<{ uri: string; meta?: { latitude?: number; longitude?: number; accuracy?: number; address?: string } }>>([]);
    const [editingInspection, setEditingInspection] = useState<any>(null);
    const isEditMode = !!inspectionId;
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationName, setLocationName] = useState('');
  const [plannedDate, setPlannedDate] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string>('');

  const [formData, setFormData] = useState<MahatmaGandhiFormData>({
    inspection_date: '',
    inspector_name: '',
    inspector_designation: '',
    work_name: '',
    gram_panchayat: '',
    village: '',
    tehsil: '',
    district: '',
    work_type: '',
    annual_action_plan_included: '',
    annual_action_plan_year: '',
    implementation_agency: '',
    work_code: '',
    estimated_amount_unskilled: '0',
    estimated_amount_skilled: '0',
    estimated_amount_total: '0',
    dsr_department: '',
    dsr_year: '',
    nrega_soft_records_correct: '',
    nrega_soft_form_a: '',
    nrega_soft_form_b: '',
    work_under_convergence: '',
    convergence_department: '',
    convergence_fund_details: '',
    mgnrega_unskilled: '0',
    mgnrega_skilled: '0',
    mgnrega_total: '0',
    other_dept_unskilled: '0',
    other_dept_skilled: '0',
    other_dept_total: '0',
    attendance_register_workers: '0',
    actual_workers_present: '0',
    shelter_for_workers: '',
    first_aid_kit: '',
    drinking_water: '',
    childcare_for_workers_children: '',
    current_work_status: '',
    expenses_unskilled: '0',
    expenses_skilled: '0',
    expenses_total: '0',
    previous_attendance_closure_date: '',
    wages_deposited_timely: '',
    delay_compensation_provided: '',
    aadhaar_based_payment: '',
    payment_failure_reasons: '',
    workers_have_job_cards: '',
    job_card_records_updated: '',
    work_file_updated: '',
    citizen_information_board: '',
    work_measurement_done: '',
    measurement_book_number: '',
    all_measurements_recorded: '',
    senior_technical_officer_check: '',
    measurement_discrepancy: '',
    discrepancy_details: '',
    work_geotagged: '',
    other_important_matters: '',
    overall_work_quality: '',
    work_utility_feedback: '',
    inspection_date_final: '',
    inspection_location: '',
    inspector_name_final: '',
    inspector_designation_final: '',
    inspector_office: '',
  });
  // (removed explicit edit-toggle) form fields are editable by default
  // Add these 4 state variables together
  const [dropdownData, setDropdownData] = useState<any[]>([])
  const [grampanchayatData, setGrampanchayatData] = useState<string[]>([])
  const [villageData, setVillageData] = useState<string[]>([])
  const [tehsilData, setTehsilsData] = useState<string[]>([])
  const [loadingDropdown, setLoadingDropdown] = useState(false)

  // Load existing inspection data for editing
  const loadExistingInspection = async (id: string) => {
    try {
      setLoading(true);
      console.log('Loading inspection:', id);

      // Fetch inspection data
      const { data: inspection, error: inspectionError } = await supabase
        .from('fims_inspections')
        .select(`
          *,
          fims_inspection_photos (
            id,
            photo_name,
            photo_url,
            description,
            photo_order
          )
        `)
        .eq('id', id)
        .single();

      if (inspectionError) throw inspectionError;

      console.log('Inspection loaded:', inspection);
      setEditingInspection(inspection);

      // Load location data
      setLocation({
        latitude: inspection.latitude,
        longitude: inspection.longitude,
        accuracy: inspection.location_accuracy,
      });
      setLocationName(inspection.location_name || '');

      // Load existing photos
      if (inspection.fims_inspection_photos && inspection.fims_inspection_photos.length > 0) {
        const photoObjs = inspection.fims_inspection_photos
          .sort((a: any, b: any) => (a.photo_order || 0) - (b.photo_order || 0))
          .map((photo: any) => {
            // Use photo_url if available, otherwise construct it from photo_name
            const url = photo.photo_url || supabase.storage
              .from('field-visit-images')
              .getPublicUrl(`inspections/${inspection.id}/${photo.photo_name}`).data.publicUrl;
            console.log('Loading photo:', photo.photo_name, 'URL:', url);
            return { uri: url };
          });
        setPhotos(photoObjs);
        console.log('Loaded photos:', photoObjs.length);
      }

      // Fetch form-specific data from mahatma_gandhi_rastriya_gramin_tapasani_praptra table
      const { data: formData, error: formError } = await supabase
        .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
        .select('*')
        .eq('inspection_id', id)
        .single();

      if (formError && formError.code !== 'PGRST116') {
        console.warn('Form data not found, using defaults');
      }

      if (formData) {
        const mappedFormData: MahatmaGandhiFormData = {
          inspection_date: formData.inspection_date || '',
          inspector_name: formData.officer_name || '',
          inspector_designation: '',
          work_name: formData.work_name || '',
          gram_panchayat: formData.gram_panchayat || '',
          village: formData.village || '',
          tehsil: formData.tehsil || '',
          district: formData.district || '',
          work_type: formData.work_type || '',
          annual_action_plan_included: formData.annual_plan || '',
          annual_action_plan_year: formData.plan_year || '',
          implementation_agency: formData.implementing_agency || '',
          work_code: formData.work_code || '',
          estimated_amount_unskilled: String(formData.unskilled_amount || '0'),
          estimated_amount_skilled: String(formData.skilled_amount || '0'),
          estimated_amount_total: String(formData.total_amount || '0'),
          dsr_department: formData.dsr_department || '',
          dsr_year: formData.dsr_year || '',
          nrega_soft_records_correct: formData.nrega_records || '',
          nrega_soft_form_a: formData.nrega_form_a || '',
          nrega_soft_form_b: formData.nrega_form_b || '',
          work_under_convergence: formData.convergence || '',
          convergence_department: formData.department_name || '',
          convergence_fund_details: formData.fund_details || '',
          mgnrega_unskilled: String(formData.mgnrega_unskilled || '0'),
          mgnrega_skilled: String(formData.mgnrega_skilled || '0'),
          mgnrega_total: String(formData.mgnrega_total || '0'),
          other_dept_unskilled: String(formData.other_dept_unskilled || '0'),
          other_dept_skilled: String(formData.other_dept_skilled || '0'),
          other_dept_total: String(formData.other_dept_total || '0'),
          attendance_register_workers: String(formData.recorded_workers || '0'),
          actual_workers_present: String(formData.present_workers || '0'),
          shelter_for_workers: formData.shelter || '',
          first_aid_kit: formData.first_aid || '',
          drinking_water: formData.drinking_water || '',
          childcare_for_workers_children: formData.child_care || '',
          current_work_status: formData.current_status || '',
          expenses_unskilled: String(formData.expense_unskilled || '0'),
          expenses_skilled: String(formData.expense_skilled || '0'),
          expenses_total: String(formData.expense_total || '0'),
          previous_attendance_closure_date: formData.attendance_close_date || '',
          wages_deposited_timely: formData.wage_deposited || '',
          delay_compensation_provided: formData.delay_compensation || '',
          aadhaar_based_payment: formData.aadhaar_wage || '',
          payment_failure_reasons: formData.wage_not_deposited_reasons || '',
          workers_have_job_cards: formData.job_card_available || '',
          job_card_records_updated: formData.job_card_updated || '',
          work_file_updated: formData.work_file_updated || '',
          citizen_information_board: formData.cib_available || '',
          work_measurement_done: formData.measurement_taken || '',
          measurement_book_number: formData.measurement_book_no || '',
          all_measurements_recorded: formData.all_measurements_recorded || '',
          senior_technical_officer_check: formData.senior_officer_check || '',
          measurement_discrepancy: formData.measurement_discrepancy || '',
          discrepancy_details: formData.discrepancy_details || '',
          work_geotagged: formData.geo_tagging || '',
          other_important_matters: formData.other_important_matters || '',
          overall_work_quality: formData.overall_quality || '',
          work_utility_feedback: formData.utility_feedback || '',
          inspection_date_final: formData.final_date || '',
          inspection_location: formData.final_place || '',
          inspector_name_final: formData.final_officer_name || '',
          inspector_designation_final: formData.final_designation || '',
          inspector_office: formData.final_office || '',
        };
        setFormData(mappedFormData);
      }

      console.log('Inspection data loaded successfully');
    } catch (error) {
      console.error('Error loading inspection:', error);
      Alert.alert('Error', `तपासणी लोड करण्यात अयशस्वी: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Load existing inspection when editing
  useEffect(() => {
    if (isEditMode && inspectionId) {
      loadExistingInspection(inspectionId);
    }
  }, [inspectionId, isEditMode]);

  // Fetch dropdown data
  
useEffect(() => {
  fetchDropdownData()
}, [])

// Add this function before generateInspectionNumber function
const fetchDropdownData = async () => {
  try {
    setLoadingDropdown(true)
    const { data, error } = await supabase
      .from('chandrapur_district')
      .select('Ward_Village_Name, GP_Name, Block_Name')
    
    if (error) throw error
    
    setDropdownData(data || [])
    
    // Extract unique values for dropdowns
    const gps = [...new Set((data || []).map((item: any) => item.GP_Name).filter(Boolean))]
    const villages = [...new Set((data || []).map((item: any) => item.Ward_Village_Name).filter(Boolean))]
    const tehsils = [...new Set((data || []).map((item: any) => item.Block_Name).filter(Boolean))]
    
    setGrampanchayatData(gps)
    setVillageData(villages)
    setTehsilsData(tehsils)
  } catch (error) {
    console.error('Dropdown fetch error:', error)
    Alert.alert('Error', 'Failed to load location data')
  } finally {
    setLoadingDropdown(false)
  }
}

    const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `MGRH-${year}${month}${day}-${time}`;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (
        !formData.inspection_date ||
        !formData.inspector_name ||
        !formData.work_name
      ) {
        Alert.alert('Error', 'कृपया आवश्यक माहिती भरा');
        return;
      }
    }
    if (currentStep === 1 && !location) {
      Alert.alert('Error', 'कृपया स्थान कॅप्चर करा');
      return;
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'स्थान परवानगी नाकारली');
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || undefined,
      });

      Alert.alert('यश', 'स्थान यशस्वीरित्या कॅप्चर केले');
    } catch (error) {
      Alert.alert('Error', 'स्थान मिळवण्यात अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Error', 'जास्तीत जास्त 5 छायाचित्रे अनुमत');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'कॅमेरा परवानगी आवश्यक आहे');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto = {
        uri: result.assets[0].uri,
        meta: {
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
          address: locationName || undefined,
        },
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert('Error', 'जास्तीत जास्त 5 छायाचित्रे अनुमत');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto = {
        uri: result.assets[0].uri,
        meta: {
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
          address: locationName || undefined,
        },
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD format
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  // Helper function to convert all dates in form data to YYYY-MM-DD format
  const getFormDataWithConvertedDates = (): MahatmaGandhiFormData => {
    return {
      ...formData,
      inspection_date: convertDateFormat(formData.inspection_date),
      annual_action_plan_year: formData.annual_action_plan_year, // This is just a year, no conversion needed
      previous_attendance_closure_date: convertDateFormat(formData.previous_attendance_closure_date),
      inspection_date_final: convertDateFormat(formData.inspection_date_final),
    };
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    // Validate required fields
    if (!formData.inspection_date) {
      Alert.alert('Error', 'कृपया तपासणीचा दिनांक निवडा');
      return;
    }
    if (!formData.inspector_name) {
      Alert.alert('Error', 'कृपया तपासणी करणाऱ्या अधिकारीचे नाव प्रविष्ट करा');
      return;
    }
    if (!formData.work_name) {
      Alert.alert('Error', 'कृपया कामाचे नाव प्रविष्ट करा');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'कृपया स्थान कॅप्चर करा');
      return;
    }
    if (!locationName) {
      Alert.alert('Error', 'कृपया स्थानाचे नाव प्रविष्ट करा');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Error', 'कृपया किमान एक छायाचित्र जोडा');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('=== Form Submission Started ===');
      console.log('Draft Mode:', isDraft);
      console.log('User:', user?.id);
      console.log('Category ID:', categoryId);
      console.log('Location:', location);
      console.log('Location Name:', locationName);
      console.log('Photos Count:', photos.length);
      
      // Prepare sanitized data (convert empty strings to null)
      const sanitizedLocationAddress = locationName || null;
      
      const convertedFormData = getFormDataWithConvertedDates();

      if (isEditMode && editingInspection) {
        // Update existing inspection record
        console.log('Updating existing inspection:', editingInspection.id);
        await updateInspection(editingInspection.id, {
          filled_by_name: formData.inspector_name || user?.email || '',
          status: isDraft ? 'draft' : 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: sanitizedLocationAddress,
        });

        // Upsert form data for this inspection
        console.log('Upserting form data for inspection:', editingInspection.id);
        await upsertMahatmaGandhiFormRecord(editingInspection.id, convertedFormData);

        // Upload photos to existing inspection
        console.log('Uploading photos to existing inspection...');
        for (let i = 0; i < photos.length; i++) {
          console.log(`Uploading photo ${i + 1}/${photos.length}`);
          const photoObj = photos[i];
          const photoUri = photoObj.uri;
          const fileExt = (photoUri.split('.').pop() || 'jpg').toLowerCase();
          const photoFileName = `MGNREGA_${editingInspection.id}_${Date.now()}_${i}.${fileExt}`;
          await uploadPhoto(editingInspection.id, photoUri, photoFileName, i + 1, photoObj.meta as any);
        }
        console.log('All photos uploaded for existing inspection');
      } else {
        // Create the base inspection record
        console.log('Creating inspection...');
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: formData.inspector_name || user?.email || '',
          status: isDraft ? 'draft' : 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: sanitizedLocationAddress,
        });
        console.log('Inspection created:', inspection.id);

        // Save the Mahatma Gandhi form data
        console.log('Saving form data...');
        console.log('Converted form data dates:', {
          inspection_date: convertedFormData.inspection_date,
          previous_attendance_closure_date: convertedFormData.previous_attendance_closure_date,
          inspection_date_final: convertedFormData.inspection_date_final,
        });
        await createMahatmaGandhiFormRecord(inspection.id, convertedFormData);
        console.log('Form data saved');

        // Upload photos
        console.log('Uploading photos...');
        for (let i = 0; i < photos.length; i++) {
          console.log(`Uploading photo ${i + 1}/${photos.length}`);
          // Extract file extension from photo URI
          const photoObj = photos[i];
          const photoUri = photoObj.uri;
          const fileExt = (photoUri.split('.').pop() || 'jpg').toLowerCase();
          const photoFileName = `MGNREGA_${inspection.id}_${Date.now()}_${i}.${fileExt}`;
          await uploadPhoto(inspection.id, photoUri, photoFileName, i + 1, photoObj.meta as any);
        }
        console.log('All photos uploaded');
      }

      const message = isDraft ? 'तपासणी मसुदा म्हणून जतन केली' : 'तपासणी यशस्वीरित्या सबमिट केली';
      Alert.alert('यश', message);
      navigation.navigate('CategorySelection');
    } catch (error) {
      console.error('=== Error submitting form ===');
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      Alert.alert('Error', `फॉर्म सबमिट करण्यात अयशस्वी: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = (fieldName: string) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

 const handleDateChange = (event: any, selectedDate?: Date) => {
  setShowDatePicker(Platform.OS === 'ios');

  // FORCE TODAY ONLY - Ignore any other date
  if (currentDateField === 'plannedDate') {
    const todayFormatted = formatDate(new Date());
    setPlannedDate(todayFormatted);
  } else {
    const todayFormatted = formatDate(new Date());
    setFormData({ ...formData, [currentDateField as keyof MahatmaGandhiFormData]: todayFormatted });
  }

  if (Platform.OS === 'android') {
    setShowDatePicker(false);
  }
};


const formatDate = (date: Date) => {
  // Force today's date only
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};


  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date();
  };

 const getDateValue = (fieldName: string): Date => {
  // Always return TODAY only
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight
  return today;
};


  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी योजने अंतर्गत कामांच्या
        तपासणीसाठी प्रपत्र
      </Text>

      <Text style={styles.fieldLabel}>
         तपासणीचा दिनांक *
      </Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker('inspection_date')}
      >
        <Text style={formData.inspection_date ? styles.dateText : styles.datePlaceholder}>
          {formData.inspection_date || 'DD/MM/YYYY'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>
        तपासणी करणाऱ्या अधिकारी-यांचे नाव * 
      </Text>
      <TextInput
        style={styles.input}
        value={formData.inspector_name}
        onChangeText={(text) => setFormData({ ...formData, inspector_name: text })}
        placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>हुद्दा </Text>
      <TextInput
        style={styles.input}
        value={formData.inspector_designation}
        onChangeText={(text) =>
          setFormData({ ...formData, inspector_designation: text })
        }
        placeholder="हुद्दा प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>3] कामाचे नाव * </Text>
      <TextInput
        style={styles.input}
        value={formData.work_name}
        onChangeText={(text) => setFormData({ ...formData, work_name: text })}
        placeholder="कामाचे नाव प्रविष्ट करा"
      />


      <Text style={styles.fieldLabel}>Gram Panchayat/ ग्रामपंचायत</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={formData.gram_panchayat}
          onValueChange={(value) => setFormData({...formData, gram_panchayat: value as string})}
          style={styles.input}
          enabled={!loadingDropdown}
        >
          <Picker.Item label="ग्रामपंचायत प्रविष्ट करा" value="" />
          {grampanchayatData.map((gp, index) => (
            <Picker.Item key={index} label={gp} value={gp} />
          ))}
        </Picker>
      </View>

      {/* <Text style={styles.fieldLabel}>ग्रामपंचायत </Text>
      <TextInput
        style={styles.input}
        value={formData.gram_panchayat}
        onChangeText={(text) =>
          setFormData({ ...formData, gram_panchayat: text })
        }
        placeholder="ग्रामपंचायत प्रविष्ट करा"
      /> */}

      {/* <Text style={styles.fieldLabel}>गाव </Text>
      <TextInput
        style={styles.input}
        value={formData.village}
        onChangeText={(text) => setFormData({ ...formData, village: text })}
        placeholder="गाव प्रविष्ट करा"
      /> */}


      <Text style={styles.fieldLabel}>Village (गाव)</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={formData.village}
          onValueChange={(value) => setFormData({...formData, village: value as string})}
          style={styles.input}
          enabled={!loadingDropdown}
        >
          <Picker.Item label="Select Village" value="" />
          {villageData.map((village, index) => (
            <Picker.Item key={index} label={village} value={village} />
          ))}
        </Picker>
      </View>

          

        <Text style={styles.fieldLabel}>Tehsil/तहसील</Text>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={formData.tehsil}
              onValueChange={(value) => setFormData({...formData, tehsil: value as string})}
              style={styles.input}
              enabled={!loadingDropdown}
            >
              <Picker.Item label="Select Tehsil" value="" />
              {tehsilData.map((tehsil, index) => (
                <Picker.Item key={index} label={tehsil} value={tehsil} />
              ))}
            </Picker>
          </View>

      {/* <Text style={styles.fieldLabel}>तहसील </Text>
      <TextInput
        style={styles.input}
        value={formData.tehsil}
        onChangeText={(text) => setFormData({ ...formData, tehsil: text })}
        placeholder="तहसील प्रविष्ट करा"
      /> */}


        {/* <Text style={styles.fieldLabel}> जिल्हा </Text>
        <View style={[styles.input, styles.disabledInput]}>
        <Text style={styles.districtText}>Chandrapur</Text>
      </View> */}

      <Text style={styles.fieldLabel}>जिल्हा </Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={'CHANDRAPUR'}
        placeholder="जिल्हा प्रविष्ट करा"
      />
    </View>
  );

  const renderLocationDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>स्थान माहिती (Location Information)</Text>

      <Text style={styles.fieldLabel}>स्थानाचे नाव * </Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="स्थानाचे नाव प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>
        नियोजित तारीख 
      </Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker('plannedDate')}
      >
        <Text style={plannedDate ? styles.dateText : styles.datePlaceholder}>
          {plannedDate || 'DD/MM/YYYY'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        <Text style={styles.locationButtonText}>
          {loading ? 'स्थान मिळवत आहे...' : 'सध्याचे स्थान कॅप्चर करा'}
        </Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            अक्षांश (Latitude): {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            रेखांश (Longitude): {location.longitude.toFixed(6)}
          </Text>
          {location.accuracy && (
            <Text style={styles.locationText}>
              अचूकता (Accuracy): {Math.round(location.accuracy)}m
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderMahatmaGandhiForm = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        कामाचा प्रकार आणि नियोजन
      </Text>

      <Text style={styles.fieldLabel}>(अ) कामाचा प्रकार </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setFormData({ ...formData, work_type: 'वैयक्तिक' })}
        >
          <View style={styles.radioCircle}>
            {formData.work_type === 'वैयक्तिक' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>वैयक्तिक</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setFormData({ ...formData, work_type: 'सार्वजनिक' })}
        >
          <View style={styles.radioCircle}>
            {formData.work_type === 'सार्वजनिक' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>सार्वजनिक</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (ब) वार्षिक कृती आराखडा अंतर्गत कामाचा समावेश आहे काय?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, annual_action_plan_included: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.annual_action_plan_included === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, annual_action_plan_included: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.annual_action_plan_included === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (क) वार्षिक कृती आराखडयाचे वर्ष 
      </Text>
      <TextInput
        style={styles.input}
        value={formData.annual_action_plan_year}
        onChangeText={(text) =>
          setFormData({ ...formData, annual_action_plan_year: text })
        }
        placeholder="वर्ष प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>
        4] कार्यान्वयीन यंत्रणेचे नाव 
      </Text>
      <TextInput
        style={styles.input}
        value={formData.implementation_agency}
        onChangeText={(text) =>
          setFormData({ ...formData, implementation_agency: text })
        }
        placeholder="यंत्रणेचे नाव प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>5] कामाचा सांकेतांक </Text>
      <TextInput
        style={styles.input}
        value={formData.work_code}
        onChangeText={(text) => setFormData({ ...formData, work_code: text })}
        placeholder="सांकेतांक प्रविष्ट करा"
      />

      <Text style={styles.sectionTitle}>
        6] अंदाजपत्रकीय रक्कम आणि DSR तपशील (Budget Details and DSR)
      </Text>

      <Text style={styles.fieldLabel}>(अ) अकुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.estimated_amount_unskilled}
        onChangeText={(text) =>
          setFormData({ ...formData, estimated_amount_unskilled: text })
        }
        placeholder="अकुशल रक्कम"
      />

      <Text style={styles.fieldLabel}>कुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.estimated_amount_skilled}
        onChangeText={(text) =>
          setFormData({ ...formData, estimated_amount_skilled: text })
        }
        placeholder="कुशल रक्कम"
      />

      <Text style={styles.fieldLabel}>एकूण </Text>
      <TextInput
        style={styles.input}
        value={formData.estimated_amount_total}
        onChangeText={(text) =>
          setFormData({ ...formData, estimated_amount_total: text })
        }
        placeholder="एकूण रक्कम"
      />

      <Text style={styles.fieldLabel}>(ब) DSR विभाग </Text>
      <TextInput
        style={styles.input}
        value={formData.dsr_department}
        onChangeText={(text) =>
          setFormData({ ...formData, dsr_department: text })
        }
        placeholder="विभाग प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>वर्ष </Text>
      <TextInput
        style={styles.input}
        value={formData.dsr_year}
        onChangeText={(text) => setFormData({ ...formData, dsr_year: text })}
        placeholder="वर्ष प्रविष्ट करा"
      />

      <Text style={styles.sectionTitle}>
        7] NREGA Soft वरील नोंदी (NREGA Soft Records)
      </Text>

      <Text style={styles.fieldLabel}>
        NREGA Soft वरील नोंदी योग्य आहेत काय?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, nrega_soft_records_correct: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.nrega_soft_records_correct === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, nrega_soft_records_correct: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.nrega_soft_records_correct === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (अ) NREGA Soft मधील कामाच्या सर्वसाधारण माहितीचे प्रपत्र - अ
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, nrega_soft_form_a: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.nrega_soft_form_a === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, nrega_soft_form_a: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.nrega_soft_form_a === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (ब) NREGA Soft मधील कामावर साहित्य खर्चाच्या माहितीचे प्रपत्र - ब
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, nrega_soft_form_b: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.nrega_soft_form_b === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, nrega_soft_form_b: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.nrega_soft_form_b === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          (जिल्हा MIS समन्वयक यांनी NREGA Soft वरील प्रपत्र - अ व प्रपत्र - ब
          तपासणी अधिकाऱ्याला उपलब्ध करून द्यावे.)
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        8] अभिसरण तपशील (Convergence Details)
      </Text>

      <Text style={styles.fieldLabel}>काम अभिसरणांतर्गत आहे काय?</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, work_under_convergence: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.work_under_convergence === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, work_under_convergence: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.work_under_convergence === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        असल्यास विभागाचे नाव 
      </Text>
      <TextInput
        style={styles.input}
        value={formData.convergence_department}
        onChangeText={(text) =>
          setFormData({ ...formData, convergence_department: text })
        }
        placeholder="विभागाचे नाव प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>
        अभिसरणांतर्गत निधीचे विवरण 
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.convergence_fund_details}
        onChangeText={(text) =>
          setFormData({ ...formData, convergence_fund_details: text })
        }
        placeholder="निधीचे विवरण प्रविष्ट करा"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.subsectionTitle}>मनरेगा (MGNREGA)</Text>
      <Text style={styles.fieldLabel}>अकुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.mgnrega_unskilled}
        onChangeText={(text) =>
          setFormData({ ...formData, mgnrega_unskilled: text })
        }
      />

      <Text style={styles.fieldLabel}>कुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.mgnrega_skilled}
        onChangeText={(text) =>
          setFormData({ ...formData, mgnrega_skilled: text })
        }
      />

      <Text style={styles.fieldLabel}>एकूण </Text>
      <TextInput
        style={styles.input}
        value={formData.mgnrega_total}
        onChangeText={(text) =>
          setFormData({ ...formData, mgnrega_total: text })
        }
      />

      <Text style={styles.subsectionTitle}>अन्य विभाग </Text>
      <Text style={styles.fieldLabel}>अकुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.other_dept_unskilled}
        onChangeText={(text) =>
          setFormData({ ...formData, other_dept_unskilled: text })
        }
      />

      <Text style={styles.fieldLabel}>कुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.other_dept_skilled}
        onChangeText={(text) =>
          setFormData({ ...formData, other_dept_skilled: text })
        }
      />

      <Text style={styles.fieldLabel}>एकूण </Text>
      <TextInput
        style={styles.input}
        value={formData.other_dept_total}
        onChangeText={(text) =>
          setFormData({ ...formData, other_dept_total: text })
        }
      />

      <Text style={styles.sectionTitle}>
        मजूर आणि हजेरी तपशील (Workers and Attendance Details)
      </Text>

      <Text style={styles.fieldLabel}>
        9] भेटीदरम्यान हजेरीपटावरील नोंद असलेल्या मजुरांची संख्या
      </Text>
      <TextInput
        style={styles.input}
        value={formData.attendance_register_workers}
        onChangeText={(text) =>
          setFormData({ ...formData, attendance_register_workers: text })
        }
        placeholder="संख्या प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>
        10] प्रत्यक्ष कामावर उपस्थित मजुरांची संख्या
      </Text>
      <TextInput
        style={styles.input}
        value={formData.actual_workers_present}
        onChangeText={(text) =>
          setFormData({ ...formData, actual_workers_present: text })
        }
        placeholder="संख्या प्रविष्ट करा"
      />

      <Text style={styles.sectionTitle}>
        11] कामाच्या ठिकाणी मजुरांसाठी असणाऱ्या सुविधा (Worker Facilities)
      </Text>

      <Text style={styles.fieldLabel}>(i) मजुरांसाठी निवारा </Text>
      <TextInput
        style={styles.input}
        value={formData.shelter_for_workers}
        onChangeText={(text) =>
          setFormData({ ...formData, shelter_for_workers: text })
        }
        placeholder="निवारा तपशील प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>
        (ii) प्रथमोपचार पेटी
      </Text>
      <TextInput
        style={styles.input}
        value={formData.first_aid_kit}
        onChangeText={(text) =>
          setFormData({ ...formData, first_aid_kit: text })
        }
        placeholder="प्रथमोपचार पेटी तपशील"
      />

      <Text style={styles.fieldLabel}>(iii) पिण्याचे पाणी </Text>
      <TextInput
        style={styles.input}
        value={formData.drinking_water}
        onChangeText={(text) =>
          setFormData({ ...formData, drinking_water: text })
        }
        placeholder="पिण्याचे पाणी तपशील"
      />

      <Text style={styles.fieldLabel}>
        (iv) मजुरांच्या लहान मुलांसाठी दाई 
      </Text>
      <TextInput
        style={styles.input}
        value={formData.childcare_for_workers_children}
        onChangeText={(text) =>
          setFormData({ ...formData, childcare_for_workers_children: text })
        }
        placeholder="दाई तपशील प्रविष्ट करा"
      />

      <Text style={styles.sectionTitle}>
        कामाची स्थिती आणि खर्च (Work Status and Expenses)
      </Text>

      <Text style={styles.fieldLabel}>
        12] कामाची सद्यस्थिती 
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.current_work_status}
        onChangeText={(text) =>
          setFormData({ ...formData, current_work_status: text })
        }
        placeholder="कामाची सद्यस्थिती वर्णन करा"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.subsectionTitle}>
        13] कामावर आतापर्यंत झालेला खर्च
      </Text>
      <Text style={styles.fieldLabel}>अकुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.expenses_unskilled}
        onChangeText={(text) =>
          setFormData({ ...formData, expenses_unskilled: text })
        }
      />

      <Text style={styles.fieldLabel}>कुशल </Text>
      <TextInput
        style={styles.input}
        value={formData.expenses_skilled}
        onChangeText={(text) =>
          setFormData({ ...formData, expenses_skilled: text })
        }   
      />

      <Text style={styles.fieldLabel}>एकूण </Text>
      <TextInput
        style={styles.input}
        value={formData.expenses_total}
        onChangeText={(text) =>
          setFormData({ ...formData, expenses_total: text })
        }
      />

      <Text style={styles.sectionTitle}>
        14] मजुरी आणि देयक तपशील (Wages and Payment Details)
      </Text>

      <Text style={styles.fieldLabel}>
        (अ) यापूर्वीचा हजेरीपट बंद झाल्याचा दिनांक
      </Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker('previous_attendance_closure_date')}
      >
        <Text style={formData.previous_attendance_closure_date ? styles.dateText : styles.datePlaceholder}>
          {formData.previous_attendance_closure_date || 'DD/MM/YYYY'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>
        (ब) या हजेरीपटाची मजुरी विहित कालावधीत मजुरांच्या खात्यात जमा झाली आहे काय
        ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, wages_deposited_timely: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.wages_deposited_timely === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, wages_deposited_timely: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.wages_deposited_timely === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (क) मजुरी प्रदानास विलंब झाल्यास, विलंब शुल्क प्रदान करण्यात आले काय?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, delay_compensation_provided: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.delay_compensation_provided === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, delay_compensation_provided: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.delay_compensation_provided === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
         आधार आणि जॉब कार्ड तपशील (Aadhaar and Job Card Details)
      </Text>

      <Text style={styles.fieldLabel}>
        15] (अ) मजुरांना आधार क्रमांक आधारित मजुरी प्रदान केली जात आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, aadhaar_based_payment: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.aadhaar_based_payment === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, aadhaar_based_payment: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.aadhaar_based_payment === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (ब) मजुरांच्या खात्यात मजुरी जमा झाली नसल्यास त्याची कारणे काय आहेत ?
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.payment_failure_reasons}
        onChangeText={(text) =>
          setFormData({ ...formData, payment_failure_reasons: text })
        }
        placeholder="कारणे प्रविष्ट करा"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>
        16] (अ) जॉब कार्ड मजुरांकडे आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, workers_have_job_cards: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.workers_have_job_cards === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, workers_have_job_cards: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.workers_have_job_cards === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (ब) जॉब कार्डवरील नोंदी अद्यावत केलेल्या आहेत काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, job_card_records_updated: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.job_card_records_updated === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, job_card_records_updated: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.job_card_records_updated === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
       दस्तऐवजीकरण आणि मोजमाप (Documentation and Measurement)
      </Text>

      <Text style={styles.fieldLabel}>
        17] कामाची वर्क फाईल (Work File/Case Record) अद्यावत आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, work_file_updated: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.work_file_updated === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, work_file_updated: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.work_file_updated === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        18] कामाच्या ठिकाणी Citizen Information Board (CIB) आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, citizen_information_board: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.citizen_information_board === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, citizen_information_board: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.citizen_information_board === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        19] कामाचे मोजमाप घेण्यात आले आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, work_measurement_done: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.work_measurement_done === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, work_measurement_done: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.work_measurement_done === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>(अ) मोजमाप पुस्तिका क्रमांक</Text>
      <TextInput
        style={styles.input}
        value={formData.measurement_book_number}
        onChangeText={(text) =>
          setFormData({ ...formData, measurement_book_number: text })
        }
        placeholder="पुस्तिका क्रमांक प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>
        (ब) अंदाजपत्रकप्रमाणे सर्व बाब निहाय मोजमापाच्या नोंदी घेण्यात आलेल्या
        आहेत काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, all_measurements_recorded: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.all_measurements_recorded === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, all_measurements_recorded: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.all_measurements_recorded === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (क) वरिष्ठ तांत्रिक अधिकाऱ्यांची कामाच्या मापांची आवश्यक तपासणी दाखल केली
        आहे काय?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, senior_technical_officer_check: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.senior_technical_officer_check === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, senior_technical_officer_check: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.senior_technical_officer_check === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (घ) मोजमाप पुस्तिकेतील नोंदी व प्रत्यक्षात माप यामध्ये तफावत आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, measurement_discrepancy: 'होय' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.measurement_discrepancy === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() =>
            setFormData({ ...formData, measurement_discrepancy: 'नाही' })
          }
        >
          <View style={styles.radioCircle}>
            {formData.measurement_discrepancy === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        (ङ) तफावत आढळलेल्या बाब निहाय नमूद करावे
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.discrepancy_details}
        onChangeText={(text) =>
          setFormData({ ...formData, discrepancy_details: text })
        }
        placeholder="तफावत तपशील प्रविष्ट करा"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.sectionTitle}>
       अंतिम मूल्यांकन (Final Assessment)
      </Text>

      <Text style={styles.fieldLabel}>
        20] कामाचे Geo-tagging झालेले आहे काय ?
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setFormData({ ...formData, work_geotagged: 'होय' })}
        >
          <View style={styles.radioCircle}>
            {formData.work_geotagged === 'होय' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>होय</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setFormData({ ...formData, work_geotagged: 'नाही' })}
        >
          <View style={styles.radioCircle}>
            {formData.work_geotagged === 'नाही' && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text style={styles.radioText}>नाही</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>
        21] कामा संदर्भात आढळलेल्या अन्य महत्वाच्या बाबी
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.other_important_matters}
        onChangeText={(text) =>
          setFormData({ ...formData, other_important_matters: text })
        }
        placeholder="महत्वाच्या बाबी प्रविष्ट करा"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>22] कामाच्या सर्वसाधारण गुणवत्ता</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.overall_work_quality}
        onChangeText={(text) =>
          setFormData({ ...formData, overall_work_quality: text })
        }
        placeholder="गुणवत्ता मूल्यांकन प्रविष्ट करा"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>
        23] कामाच्या उपयुक्ततेबाबत अभिप्राय
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.work_utility_feedback}
        onChangeText={(text) =>
          setFormData({ ...formData, work_utility_feedback: text })
        }
        placeholder="उपयुक्ततेबाबत अभिप्राय प्रविष्ट करा"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.fieldLabel}>दिनांक </Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker('inspection_date_final')}
      >
        <Text style={formData.inspection_date_final ? styles.dateText : styles.datePlaceholder}>
          {formData.inspection_date_final || 'DD/MM/YYYY'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>ठिकाण </Text>
      <TextInput
        style={styles.input}
        value={formData.inspection_location}
        onChangeText={(text) =>
          setFormData({ ...formData, inspection_location: text })
        }
        placeholder="ठिकाण प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>तपासणी अधिकारी-याचे नाव</Text>
      <TextInput
        style={styles.input}
        value={formData.inspector_name_final}
        onChangeText={(text) =>
          setFormData({ ...formData, inspector_name_final: text })
        }
        placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>पदनाम </Text>
      <TextInput
        style={styles.input}
        value={formData.inspector_designation_final}
        onChangeText={(text) =>
          setFormData({ ...formData, inspector_designation_final: text })
        }
        placeholder="पदनाम प्रविष्ट करा"
      />

      <Text style={styles.fieldLabel}>कार्यालय </Text>
      <TextInput
        style={styles.input}
        value={formData.inspector_office}
        onChangeText={(text) =>
          setFormData({ ...formData, inspector_office: text })
        }
        placeholder="कार्यालय प्रविष्ट करा"
      />
    </ScrollView>
  );

  const renderPhotoUpload = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        छायाचित्रे अपलोड करा (Upload Photos)
      </Text>
      <Text style={styles.photoSubtitle}>
        महात्मा गांधी रोजगार हमी योजना कामाची छायाचित्रे
      </Text>

      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto} disabled={loading}>
          <Text style={styles.photoButtonText}>कॅमेरा वापरा</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.photoCount}>
        छायाचित्रे: {photos.length}/5
      </Text>

      <ScrollView horizontal style={styles.photoGrid}>
        {photos.map((photoObj, index) => (
          <View key={index} style={styles.photoItem}>
            <Image source={{ uri: photoObj.uri }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderLocationDetails();
      case 2:
        return renderMahatmaGandhiForm();
      case 3:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          महात्मा गांधी रोजगार हमी / MGNREGA
        </Text>
        
        <Text style={styles.stepText}>
          Step {currentStep + 1} of {STEPS.length}
        </Text>
        <Text style={styles.stepName}>{STEPS[currentStep]}</Text>
      </View>

      <ScrollView style={styles.content}>{renderStep()}</ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={handlePrevious}
              disabled={loading}
            >
              <Text style={styles.outlineButtonText}>मागे</Text>
            </TouchableOpacity>
          )}
          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>पुढे</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.submitButtons}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton, styles.halfButton]}
                onPress={() => handleSubmit(true)}
                disabled={loading}
              >
                <Text style={styles.outlineButtonText}>मसुदा जतन करा</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, styles.halfButton]}
                onPress={() => handleSubmit(false)}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>सबमिट करा</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={getDateValue(currentDateField)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          maximumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 26,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
  },
  datePlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  locationButton: {
    backgroundColor: '#059669',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  locationText: {
    fontSize: 13,
    color: '#065f46',
    marginBottom: 4,
  },
  photoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#059669',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  photoCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
  },
  photoItem: {
    marginRight: 12,
    position: 'relative',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#059669',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  dropdownContainer: {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  marginBottom: 16,
},
disabledInput: {
  backgroundColor: '#f9fafb',
  justifyContent: 'center',
},
districtText: {
  fontSize: 14,
  color: '#6b7280',
  padding: 12,
},

});