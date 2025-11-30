import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { StackNavigationProp } from '@react-navigation/stack';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase' // Adjust path based on your file structure
import { createInspection, uploadPhoto } from '../../services/fimsService';
import { useAuth } from '../../hooks/useAuth';

type FormsStackParamList = {
  ZPDarMahinyala: { categoryId: string; inspectionId?: string };
  CategorySelection: undefined;
};

type RouteParams = RouteProp<FormsStackParamList, 'ZPDarMahinyala'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'ZPDarMahinyala'>;


const STEPS = ['मूलभूत माहिती', 'स्थान माहिती', 'प्रकल्प तपशील', 'फोटो'];

interface FormData {
  visit_date: string;
  inspection_date: string;
  inspector_name: string;
  inspector_designation: string;
  location_name: string;
  planned_date: string;
  address: string;
  row_1_district_name: string;
  row_1_project_name: string;
  row_1_total_anganwadi_centers: string;
  row_1_total_supervisors: string;
  row_1_supervisor_target_achieved: string;
  row_1_bavipraa_target_achieved: string;
  row_1_dpo_project_visit_details: string;
  row_1_project_visit_status: string;
  row_1_total_centers_visited: string;
  row_2_district_name: string;
  row_2_project_name: string;
  row_2_total_anganwadi_centers: string;
  row_2_total_supervisors: string;
  row_2_supervisor_target_achieved: string;
  row_2_bavipraa_target_achieved: string;
  row_2_dpo_project_visit_details: string;
  row_2_project_visit_status: string;
  row_2_total_centers_visited: string;
  
  row_3_district_name: string;
  row_3_project_name: string;
  row_3_total_anganwadi_centers: string;
  row_3_total_supervisors: string;
  row_3_supervisor_target_achieved: string;
  row_3_bavipraa_target_achieved: string;
  row_3_dpo_project_visit_details: string;
  row_3_project_visit_status: string;
  row_3_total_centers_visited: string;

  additional_notes: string;
}

export default function ZPDarMahinyalaScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId, inspectionId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photosMetadata, setPhotosMetadata] = useState<Array<{ uri: string; latitude?: number; longitude?: number; date?: string }>>([]);
  const [originalPhotos, setOriginalPhotos] = useState<Array<{ id: number; uri: string; photo_name?: string }>>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<number[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(inspectionId ?? null);

  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showInspectionDatePicker, setShowInspectionDatePicker] = useState(false);
  const [showPlannedDatePicker, setShowPlannedDatePicker] = useState(false);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<FormData>({
    visit_date: '',
    inspection_date: '',
    inspector_name: '',
    inspector_designation: '',
    location_name: '',
    planned_date: getCurrentDate(),
    address: '',
    row_1_district_name: 'CHANDRAPUR',
    row_1_project_name: '',
    row_1_total_anganwadi_centers: '',
    row_1_total_supervisors: '',
    row_1_supervisor_target_achieved: '',
    row_1_bavipraa_target_achieved: '',
    row_1_dpo_project_visit_details: '',
    row_1_project_visit_status: '',
    row_1_total_centers_visited: '',
    row_2_project_visit_status: '',
    row_2_total_centers_visited: '',
    row_2_district_name: 'CHANDRAPUR',
    row_2_project_name: '',
    row_2_total_anganwadi_centers: '',
    row_2_total_supervisors: '',
    row_2_supervisor_target_achieved: '',
    row_2_bavipraa_target_achieved: '',
    row_2_dpo_project_visit_details: '',
    row_3_project_visit_status: '',
    row_3_total_centers_visited: '',
    row_3_district_name: 'CHANDRAPUR',
    row_3_project_name: '',
    row_3_total_anganwadi_centers: '',
    row_3_total_supervisors: '',
    row_3_supervisor_target_achieved: '',
    row_3_bavipraa_target_achieved: '',
    row_3_dpo_project_visit_details: '',
    additional_notes: '',
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Load existing inspection data when editing
  React.useEffect(() => {
    const loadExistingInspection = async () => {
      // console.log('useEffect triggered with editingInspectionId:', editingInspectionId);
      
      if (!editingInspectionId) {
        // console.log('No editingInspectionId, skipping load (new form)');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // console.log('Loading inspection data for ID:', editingInspectionId);

        // Fetch inspection from fims_inspections including related photos
        const { data: inspectionData, error: inspError } = await supabase
          .from('fims_inspections')
          .select(`
            *,
            fims_inspection_photos (
              id,
              photo_name,
              photo_url,
              photo_order
            )
          `)
          .eq('id', editingInspectionId)
          .single();

        // console.log('Inspection data:', inspectionData, 'Error:', inspError);

        if (inspError) {
          console.error('Error fetching inspection:', inspError);
          Alert.alert('Error', 'Failed to load inspection data');
          setLoading(false);
          return;
        }

        // Start with default form data
        let loadedFormData = { ...{
          visit_date: '',
          inspection_date: '',
          inspector_name: '',
          inspector_designation: '',
          location_name: '',
          planned_date: getCurrentDate(),
          address: '',
          row_1_district_name: 'CHANDRAPUR',
          row_1_project_name: '',
          row_1_total_anganwadi_centers: '',
          row_1_total_supervisors: '',
          row_1_supervisor_target_achieved: '',
          row_1_bavipraa_target_achieved: '',
          row_1_dpo_project_visit_details: '',
          row_1_project_visit_status: '',
          row_1_total_centers_visited: '',
          row_2_project_visit_status: '',
          row_2_total_centers_visited: '',
          row_2_district_name: 'CHANDRAPUR',
          row_2_project_name: '',
          row_2_total_anganwadi_centers: '',
          row_2_total_supervisors: '',
          row_2_supervisor_target_achieved: '',
          row_2_bavipraa_target_achieved: '',
          row_2_dpo_project_visit_details: '',
          row_3_project_visit_status: '',
          row_3_total_centers_visited: '',
          row_3_district_name: 'CHANDRAPUR',
          row_3_project_name: '',
          row_3_total_anganwadi_centers: '',
          row_3_total_supervisors: '',
          row_3_supervisor_target_achieved: '',
          row_3_bavipraa_target_achieved: '',
          row_3_dpo_project_visit_details: '',
          additional_notes: '',
        } };

        if (inspectionData) {
          // Load form_data from inspection
          const savedFormData = inspectionData.form_data || {};
          // console.log('Saved form data from inspection:', savedFormData);
          loadedFormData = { ...loadedFormData, ...savedFormData };

          // Set location from inspection
          if (inspectionData.latitude && inspectionData.longitude) {
            setLocation({
              latitude: inspectionData.latitude,
              longitude: inspectionData.longitude,
              accuracy: inspectionData.location_accuracy || undefined,
            });
          }

          // Load photos if present on the inspection
          try {
            if (inspectionData.fims_inspection_photos && inspectionData.fims_inspection_photos.length > 0) {
                const sorted = inspectionData.fims_inspection_photos
                  .slice()
                  .sort((a: any, b: any) => (a.photo_order || 0) - (b.photo_order || 0));

                const photoUrls: string[] = [];
                const original: Array<{ id: number; uri: string; photo_name?: string }> = [];
                const metaArr: Array<{ uri: string; latitude?: number; longitude?: number; date?: string }> = [];

                for (const photo of sorted) {
                  const url = photo.photo_url || supabase.storage
                    .from('field-visit-images')
                    .getPublicUrl(`inspections/${inspectionData.id}/${photo.photo_name}`).data.publicUrl;
                  photoUrls.push(url);
                  original.push({ id: photo.id, uri: url, photo_name: photo.photo_name });

                  // Try to parse description metadata (if saved by upload helper)
                  let lat: number | undefined = undefined;
                  let lon: number | undefined = undefined;
                  let dateStr: string | undefined = undefined;
                  try {
                    if (photo.description) {
                      const desc = typeof photo.description === 'string' ? JSON.parse(photo.description) : photo.description;
                      if (desc && desc.photo_location) {
                        lat = desc.photo_location.latitude ?? undefined;
                        lon = desc.photo_location.longitude ?? undefined;
                      }
                    }
                  } catch (e) {
                    // ignore parse errors
                  }

                  // prefer visit_date or inspection_date from form_data/inspection as photo date
                  const possibleDate = (inspectionData.form_data && inspectionData.form_data.visit_date) || inspectionData.inspection_date || undefined;
                  if (possibleDate) dateStr = possibleDate;

                  metaArr.push({ uri: url, latitude: lat, longitude: lon, date: dateStr });
                }

                setPhotos(photoUrls);
                setOriginalPhotos(original);
                setPhotosMetadata((prev) => {
                  // merge existing captured photos metadata (local) with loaded remote metadata
                  const merged = [...metaArr];
                  // append any local-only metadata entries that don't have a uri match
                  for (const p of prev) {
                    if (!merged.find((m) => m.uri === p.uri)) merged.push(p);
                  }
                  return merged;
                });
                // console.log('Loaded photos for edit:', photoUrls.length);
              }
          } catch (photoErr) {
            console.warn('Failed to load inspection photos:', photoErr);
          }
          // If inspector name was not part of form_data, use filled_by_name from inspection
          if (!loadedFormData.inspector_name && inspectionData.filled_by_name) {
            loadedFormData.inspector_name = inspectionData.filled_by_name;
          }
        }

        // Fetch bhet_praptra records for this inspection
        const { data: bhetData, error: bhetError } = await supabase
          .from('bhet_praptra')
          .select('*')
          .eq('inspection_id', editingInspectionId)
          .order('row_no', { ascending: true });

        // console.log('Bhet praptra data:', bhetData, 'Error:', bhetError);

        if (!bhetError && bhetData && bhetData.length > 0) {
          // Populate form fields from bhet_praptra records
          bhetData.forEach((row: any) => {
            const rowNum = row.row_no || 1;
            loadedFormData[`row_${rowNum}_district_name` as keyof FormData] = row.district_name || '';
            loadedFormData[`row_${rowNum}_project_name` as keyof FormData] = row.project_name || '';
            loadedFormData[`row_${rowNum}_total_anganwadi_centers` as keyof FormData] = String(row.total_anganwadi_centers || '');
            loadedFormData[`row_${rowNum}_total_supervisors` as keyof FormData] = String(row.total_supervisors || '');
            loadedFormData[`row_${rowNum}_supervisor_target_achieved` as keyof FormData] = String(row.supervisors_achieved_centers_count || '');
            loadedFormData[`row_${rowNum}_bavipraa_target_achieved` as keyof FormData] = String(row.bavipra_achieved_centers_count || '');
            loadedFormData[`row_${rowNum}_dpo_project_visit_details` as keyof FormData] = row.dpo_visit_details || '';
            loadedFormData[`row_${rowNum}_project_visit_status` as keyof FormData] = row.project_visit_status || '';
            loadedFormData[`row_${rowNum}_total_centers_visited` as keyof FormData] = String(row.total_centers_visited || '');
          });
          const firstRow = bhetData[0];
          if (!loadedFormData.visit_date && firstRow && firstRow.visit_date) {
            loadedFormData.visit_date = firstRow.visit_date;
          }
          // If inspection_date is not present in form_data, prefer inspection_date from bhet_praptra
          if (!loadedFormData.inspection_date && firstRow && firstRow.inspection_date) {
            loadedFormData.inspection_date = firstRow.inspection_date;
          }
          // If inspector_designation exists in bhet_praptra, use it to populate the form
          if (!loadedFormData.inspector_designation && firstRow && firstRow.inspector_designation) {
            loadedFormData.inspector_designation = firstRow.inspector_designation;
          }
        }

        // console.log('Final loaded form data:', loadedFormData);
        // Set all form data at once
        setFormData(loadedFormData as FormData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading existing inspection:', error);
        Alert.alert('Error', 'Failed to load inspection details');
        setLoading(false);
      }
    };

    loadExistingInspection();
  }, [editingInspectionId]);

  // Date picker handlers
  const onVisitDateChange = (event: any, selectedDate?: Date) => {
    setShowVisitDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      const todayString = getCurrentDate();
      if (selectedDateString === todayString) {
        updateFormData('visit_date', selectedDateString);
      } else {
        Alert.alert('Error', 'केवळ आज चा दिनांक निवडू शकता / Only today\'s date can be selected');
      }
    }
  };

  const onInspectionDateChange = (event: any, selectedDate?: Date) => {
    setShowInspectionDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      const todayString = getCurrentDate();
      if (selectedDateString === todayString) {
        updateFormData('inspection_date', selectedDateString);
      } else {
        Alert.alert('Error', 'केवळ आज चा दिनांक निवडू शकता / Only today\'s date can be selected');
      }
    }
  };

  const onPlannedDateChange = (event: any, selectedDate?: Date) => {
    setShowPlannedDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      const todayString = getCurrentDate();
      if (selectedDateString === todayString) {
        updateFormData('planned_date', selectedDateString);
      } else {
        Alert.alert('Error', 'केवळ आज चा दिनांक निवडू शकता / Only today\'s date can be selected');
      }
    }
  };

  // Take photo using camera with location and date metadata
  const takePhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Error', 'जास्तीत जास्त ५ फोटो परवानगी आहे / Maximum 5 photos allowed');
      return;
    }

    setLoading(true);
    let photoLocation: { latitude?: number; longitude?: number; date?: string } = {};

    try {
      // Capture location first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          photoLocation.latitude = currentLocation.coords.latitude;
          photoLocation.longitude = currentLocation.coords.longitude;
        } catch (locError) {
          console.log('Location capture failed, continuing without location', locError);
        }
      }

      // Add current date
      const now = new Date();
      photoLocation.date = now.toISOString().split('T')[0];

      // Request camera permission
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Error', 'कॅमेरा परवानगी आवश्यक आहे / Camera permission required');
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const photoUri = result.assets[0].uri;
        setPhotos([...photos, photoUri]);
        setPhotosMetadata([...photosMetadata, { uri: photoUri, ...photoLocation }]);
        Alert.alert('Success', 'फोटो यशस्वीरीतेने जोडला गेला / Photo added successfully');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'फोटो घेतल्यात त्रुटी / Failed to take photo');
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    const uri = photos[index];
    // If this was an original (remote) photo, record its id for deletion
    const orig = originalPhotos.find((p) => p.uri === uri);
    if (orig) {
      setRemovedPhotoIds((prev) => [...prev, orig.id]);
      setOriginalPhotos((prev) => prev.filter((p) => p.id !== orig.id));
    }

    setPhotos(photos.filter((_, i) => i !== index));
    setPhotosMetadata(photosMetadata.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 0 && !formData.visit_date) {
      Alert.alert('Error', 'कृपया भेट दिनांक प्रविष्ट करा ');
      return;
    }
    if (currentStep === 1 && !formData.location_name) {
      Alert.alert('Error', 'कृपया स्थानाचे नाव प्रविष्ट करा ');
      return;
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

  // GPS + reverse geocode (address auto-fill)
  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission', 'Location permission denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = currentLocation.coords;
      setLocation({ latitude, longitude, accuracy: accuracy ?? undefined });

      // reverse geocode to human-readable address
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (places && places.length > 0) {
        const p = places[0];
        const addressParts = [
          p.name,
          p.street,
          p.district,
          p.city || p.subregion,
          p.region,
          p.postalCode,
          p.country,
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');
        updateFormData('address', fullAddress);
      }

      Alert.alert(
        'Location',
        `Location captured:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch location');
      console.log('Location error', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload all photos using shared service helper
  const uploadAllPhotos = async (inspectionId: string) => {
    if (photos.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i];
        // Skip already uploaded remote URLs (they're already in storage)
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          continue;
        }
        const metadata = photosMetadata[i];
        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `ZP-Monthly-${inspectionId}-${Date.now()}-${i}.${fileExt}`;
        
        // Use photo metadata location if available, otherwise use form location
        const photoLocation = metadata && (metadata.latitude || metadata.longitude)
          ? { latitude: metadata.latitude, longitude: metadata.longitude, accuracy: undefined }
          : location ?? undefined;
        
        await uploadPhoto(inspectionId, uri, fileName, i + 1, photoLocation);
      }
    } finally {
      setUploading(false);
    }
  };

  // Parse row data for bhetpraptra table (matching website logic exactly)
  const parseRowData = (rowNum: number): any => {
    const prefix = `row_${rowNum}_`;
    const district_Name = formData[`${prefix}district_name` as keyof FormData] as string;
    const project_Name = formData[`${prefix}project_name` as keyof FormData] as string;
    const visitDetails = formData[`${prefix}dpo_project_visit_details` as keyof FormData] as string;
    if (!district_Name && !project_Name) return null;

    // First prefer explicit separated fields (picker + numeric input).
    const explicitStatus = (formData[`${prefix}project_visit_status` as keyof FormData] as string) || '';
    const explicitTotal = (formData[`${prefix}total_centers_visited` as keyof FormData] as string) || '';

    let projectVisitStatus: string | null = null;
    let totalCentersVisited = 0;

    if (explicitStatus) {
      const s = explicitStatus.toLowerCase();
      if (s === 'yes' || s === 'होय') projectVisitStatus = 'yes';
      else if (s === 'no' || s === 'नाही') projectVisitStatus = 'no';
      else projectVisitStatus = explicitStatus;
    }

    if (explicitTotal) {
      totalCentersVisited = parseInt(explicitTotal, 10) || 0;
    }

    // Fallback: if explicit values are not provided, try to parse from details text for backward compatibility
    if ((!projectVisitStatus || totalCentersVisited === 0) && visitDetails) {
      const detailsLower = visitDetails.toLowerCase();
      if (!projectVisitStatus) {
        if (detailsLower.includes('होय') || detailsLower.includes('yes')) projectVisitStatus = 'yes';
        else if (detailsLower.includes('नाही') || detailsLower.includes('no')) projectVisitStatus = 'no';
      }

      if (totalCentersVisited === 0) {
        const numberMatch = visitDetails.match(/\d+/);
        if (numberMatch) totalCentersVisited = parseInt(numberMatch[0], 10);
      }
    }

    // Ensure not-null values for DB constraints
    if (!projectVisitStatus) projectVisitStatus = 'no';

    return {
      row_no: rowNum,
      district_name: district_Name,
      project_name: project_Name,
      total_anganwadi_centers: parseInt(formData[`${prefix}total_anganwadi_centers` as keyof FormData] as string) || 0,
      total_supervisors: parseInt(formData[`${prefix}total_supervisors` as keyof FormData] as string) || 0,
      supervisors_achieved_centers_count: parseInt(formData[`${prefix}supervisor_target_achieved` as keyof FormData] as string) || 0,
      bavipra_achieved_centers_count: parseInt(formData[`${prefix}bavipraa_target_achieved` as keyof FormData] as string) || 0,
      dpo_visit_details: visitDetails,
      project_visit_status: projectVisitStatus,
      total_centers_visited: totalCentersVisited,
    };
  };

  // Generate inspection number (matching website exactly)
  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `ZPM-${year}${month}${day}-${time}`;
  };

  const handleSaveAsDraft = async () => {
    await handleSubmit(true);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'कृपया प्रथम लॉगिन करा / Please login first');
        return;
      }

      const sanitizedInspectionData = {
        category_id: categoryId,
        inspector_id: user.id,
        filled_by_name: (formData.inspector_name && formData.inspector_name.trim() !== '') ? formData.inspector_name : (user.email || null),
        location_name: formData.location_name || null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        location_accuracy: location?.accuracy ?? null,
        address: formData.address || null,
        planned_date: formData.planned_date || null,
        // visit_date is intentionally not included here; it will be stored on bhet_praptra records
        inspection_date: formData.inspection_date || null,
        status: isDraft ? 'draft' : 'submitted',
        form_data: formData,
      };

      let inspectionId: string;

      if (editingInspectionId) {
        // Update existing inspection (use canonical table name/columns)
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({ ...sanitizedInspectionData, updated_at: new Date().toISOString() })
          .eq('id', editingInspectionId)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionId = updateResult.id;

        // Delete existing bhetpraptra records for this inspection (snake_case fk)
        await supabase.from('bhet_praptra').delete().eq('inspection_id', editingInspectionId);
      } else {
        // Create new inspection via shared service
        const created = await createInspection({
          category_id: categoryId,
          inspector_id: user.id,
          filled_by_name: (formData.inspector_name && formData.inspector_name.trim() !== '') ? formData.inspector_name : (user.email || ''),
          status: (isDraft ? 'draft' : 'submitted') as 'draft' | 'submitted',
          location_latitude: sanitizedInspectionData.latitude ?? undefined,
          location_longitude: sanitizedInspectionData.longitude ?? undefined,
          location_address: sanitizedInspectionData.address ?? null,
          location_name: sanitizedInspectionData.location_name ?? null,
        });

        inspectionId = created.id;

        // Save form_data to the newly created inspection
        const { error: formDataError } = await supabase
          .from('fims_inspections')
          .update({
            form_data: formData,
            planned_date: formData.planned_date || null,
            inspection_date: formData.inspection_date || null,
          })
          .eq('id', inspectionId);

        if (formDataError) {
          console.error('Error saving form data:', formDataError);
          throw formDataError;
        }
      }

      // Insert bhetpraptra records for each row (matching website logic)
      const bhetPraptraRecords: any[] = [];
      for (let i = 1; i <= 3; i++) {
        const rowData = parseRowData(i);
        if (rowData) {
          bhetPraptraRecords.push({
            inspection_id: inspectionId,
            visit_date: formData.visit_date || null,
            inspection_date: formData.inspection_date || null,
            inspector_designation: formData.inspector_designation || null,
            ...rowData,
          });
        }
      }

      if (bhetPraptraRecords.length > 0) {
        const { error: bhetError } = await supabase
          .from('bhet_praptra')
          .insert(bhetPraptraRecords);
        if (bhetError) throw bhetError;
      }

      // Ensure fims_inspections.form_data is persisted (diagnostic explicit update)
      try {
        const { data: fdData, error: fdError } = await supabase
          .from('fims_inspections')
          .update({ form_data: formData, planned_date: formData.planned_date || null, inspection_date: formData.inspection_date || null })
          .eq('id', inspectionId);
        if (fdError) {
          console.warn('Could not update fims_inspections.form_data:', fdError);
        } else {
          console.log('fims_inspections.form_data updated for', inspectionId, fdData);
        }
      } catch (e) {
        console.warn('Exception while updating fims_inspections.form_data:', e);
      }

      // If user removed any existing photos while editing, delete those rows from DB
      if (removedPhotoIds && removedPhotoIds.length > 0) {
        try {
          const { error: delErr } = await supabase
            .from('fims_inspection_photos')
            .delete()
            .in('id', removedPhotoIds);
          if (delErr) {
            console.warn('Failed to delete removed photos:', delErr);
          } else {
            console.log('Deleted removed photo ids:', removedPhotoIds);
            // clear removedPhotoIds after successful deletion
            setRemovedPhotoIds([]);
          }
        } catch (e) {
          console.warn('Exception while deleting removed photos:', e);
        }
      }

      // Upload photos if any
      await uploadAllPhotos(inspectionId);

      const isUpdate = !!editingInspectionId;
      const message = isDraft 
        ? isUpdate 
          ? 'मसुदा अपडेट केला गेला / Draft updated successfully'
          : 'मसुदा सेव्ह केला गेला / Draft saved successfully'
        : isUpdate 
          ? 'अपडेट यशस्वी / Updated successfully'
          : 'सबमिट यशस्वी / Submitted successfully';

      Alert.alert('Success', message);
      navigation.goBack();

    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        hint: error?.hint,
      });
      
      // Better error message handling
      let errorMsg = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.hint) {
        errorMsg = error.hint;
      }
      
      Alert.alert('Error', `Failed to ${isDraft ? 'save draft' : 'submit'}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderDateInput = (
    label: string,
    field: keyof FormData,
    onPress: () => void,
    showPicker: boolean,
    onChange: (event: any, date?: Date) => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onPress}>
        <Text style={styles.dateInputText}>{formData[field] || 'तारीख निवडा '}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={new Date(formData[field] || getCurrentDate())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}
    </View>
  );

  const renderInput = (
    label: string,
    field: keyof FormData,
    placeholder: string = '',
    multiline: boolean = false,
    keyboardType: any = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={formData[field] as string}
        onChangeText={(text) => updateFormData(field, text)}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= index && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= index && styles.stepNumberActive,
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                currentStep > index && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.sectionTitle}>
        दर महिन्याला सादर करावयाचे प्रपत्र (जिल्हा परिषद कार्यालयासाठी)
      </Text>
      <Text style={styles.sectionSubtitle}>
        Monthly Report Form (For Zilla Parishad Office)
      </Text>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>मूलभूत माहिती (Basic Information)</Text>

        {renderDateInput(
          'भेट दिनांक  *',
          'visit_date',
          () => setShowVisitDatePicker(true),
          showVisitDatePicker,
          onVisitDateChange
        )}
        {renderDateInput(
          'तपासणी दिनांक ',
          'inspection_date',
          () => setShowInspectionDatePicker(true),
          showInspectionDatePicker,
          onInspectionDateChange
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>
          निरीक्षकाची माहिती (Inspector Information)
        </Text>

        {renderInput('निरीक्षकाचे नाव ', 'inspector_name', 'निरीक्षकाचे नाव प्रविष्ट करा')}
        {renderInput('पदनाम ', 'inspector_designation', 'पदनाम प्रविष्ट करा')}
      </View>
    </ScrollView>
  );

  const renderLocationDetails = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.sectionTitle}>स्थान माहिती (Location Information)</Text>

      {renderInput('स्थानाचे नाव * ', 'location_name', 'स्थानाचे नाव प्रविष्ट करा')}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>GPS Location</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.locationButtonText}>
            {location
              ? 'स्थान कॅप्चर केले / Location Captured'
              : 'सध्याचे स्थान मिळवा / Get Current Location'}
          </Text>
        </TouchableOpacity>
        {location && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              अक्षांश / Latitude: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              रेखांश / Longitude: {location.longitude.toFixed(6)}
            </Text>
            {location.accuracy && (
              <Text style={styles.locationText}>
                अचूकता / Accuracy: {Math.round(location.accuracy)} m
              </Text>
            )}
          </View>
        )}
      </View>

      {renderInput('संपूर्ण पत्ता ', 'address', 'संपूर्ण पत्ता प्रविष्ट करा', true)}
    </ScrollView>
  );

  const renderProjectRow = (rowNum: number) => (
    <View style={styles.projectCard}>
      <Text style={styles.projectTitle}>
        प्रकल्प {rowNum} तपशील (Project {rowNum} Details)
      </Text>

      {renderInput(
        'जिल्ह्याचे नाव ',
        `row_${rowNum}_district_name` as keyof FormData,
        'जिल्ह्याचे नाव प्रविष्ट करा'
      )}

      {renderInput(
        'अधिनस्त ग्रामीण / आदिवासी प्रकल्पाचे नाव ',
        `row_${rowNum}_project_name` as keyof FormData,
        'प्रकल्पाचे नाव प्रविष्ट करा'
      )}

      {renderInput(
        'प्रकल्पांतील अंगणवाडी केंद्रांची एकूण संख्या ',
        `row_${rowNum}_total_anganwadi_centers` as keyof FormData,
        'संख्या प्रविष्ट करा',
        false,
        'numeric'
      )}

      {renderInput(
        'प्रकल्पातील पर्यवेक्षकांची एकूण संख्या ',
        `row_${rowNum}_total_supervisors` as keyof FormData,
        'संख्या प्रविष्ट करा',
        false,
        'numeric'
      )}

      {renderInput(
        'पर्यवेक्षकांनी उद्दिष्ट साध्य केलेल्या अंगणवाडी केंद्रांची संख्या ',
        `row_${rowNum}_supervisor_target_achieved` as keyof FormData,
        'संख्या प्रविष्ट करा',
        false,
        'numeric'
      )}

      {renderInput(
        'बाविप्रअ यांनी उद्दिष्ट साध्य केलेल्या अंगणवाडी केंद्रांची संख्या ',
        `row_${rowNum}_bavipraa_target_achieved` as keyof FormData,
        'संख्या प्रविष्ट करा',
        false,
        'numeric'
      )}

      {/* {renderInput(
        'जिल्हा कार्यक्रम अधिकारी (मबावि) प्रकल्प भेट व अंगणवाडी भेटीचे तपशील ',
        `row_${rowNum}_dpo_project_visit_details` as keyof FormData,
        'प्रकल्प भेट (होय/नाही) व एकूण अंगणवाडी केंद्र भेटीची संख्या',
        true
      )} */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}> जिल्हा कार्यक्रम अधिकारी (मबावि) प्रकल्प भेट(होय/नाही) / Project visit (Yes/No)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData[`row_${rowNum}_project_visit_status` as keyof FormData] as string}
            onValueChange={(val) => updateFormData(`row_${rowNum}_project_visit_status` as keyof FormData, String(val))}
            mode="dropdown"
          >
            <Picker.Item label="निवडा / Select" value="" />
            <Picker.Item label="होय / Yes" value="yes" />
            <Picker.Item label="नाही / No" value="no" />
          </Picker>
        </View>
      </View>

      {renderInput(
        'एकूण अंगणवाडी केंद्र भेटीची संख्या/ Total centers visited',
        `row_${rowNum}_total_centers_visited` as keyof FormData,
        'संख्या प्रविष्ट करा',
        false,
        'numeric'
      )}
    </View>
  );

  const renderProjectDetails = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.sectionTitle}>प्रकल्प तपशील (Project Details)</Text>

      {renderProjectRow(1)}
      {renderProjectRow(2)}
      {renderProjectRow(3)}

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>अतिरिक्त टिप्पण्या (Additional Notes)</Text>
        {renderInput(
          'शासन निर्णयानुसार तपासणी संबंधी टिप्पण्या ',
          'additional_notes',
          'जिल्ह्याच्या अधिनस्त ग्रामीण / आदिवासी प्रकल्पातील संबंधित बाल विकास प्रकल्प अधिकारी व पर्यवेक्षिका यांनी दि. ११/९/२०१२ च्या शासन निर्णयात नमूद केल्याप्रमाणे अंगणवाडी केंद्र तपासणीचे उद्दिष्ट साध्य केलेले आहे व त्याची तपासणी जिल्हा कार्यालयामार्फत करण्यात आलेली आहे.',
          true
        )}
      </View>
    </ScrollView>
  );

  const renderPhotoUpload = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.sectionTitle}>फोटो दस्तऐवजीकरण (Photo Documentation)</Text>

      <View style={styles.photoSection}>
        <Text style={styles.photoDescription}>
          Upload photos related to the monthly ZP report for documentation
        </Text>
        <Text style={styles.photoDescription}>
          मासिक ZP अहवालाशी संबंधित दस्तऐवजीकरणासाठी फोटो अपलोड करा
        </Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={takePhoto}
          disabled={loading || uploading || photos.length >= 5}
        >
          <Text style={styles.uploadButtonText}>📷 कॅमेरा / Camera</Text>
        </TouchableOpacity>

        <Text style={styles.photoNote}>
          Maximum 5 photos allowed / जास्तीत जास्त ५ फोटो परवानगी आहे ({photos.length}/5)
        </Text>

        {uploading && (
          <View style={styles.uploadingIndicator}>
            <Text style={styles.uploadingText}>Uploading photos...</Text>
          </View>
        )}

        {photos.length > 0 && (
          <View style={styles.photosGrid}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoThumbnailContainer}>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
                <Image source={{ uri }} style={styles.photoThumbnail} resizeMode="cover" />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderLocationDetails();
      case 2:
        return renderProjectDetails();
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
        <Text style={styles.headerTitle}>दर महिन्याला सादर करावयाचे प्रपत्र</Text>
        <Text style={styles.headerSubtitle}>ZP Monthly Report Form</Text>
      </View>

      {renderStepIndicator()}

      <View style={styles.stepLabel}>
        <Text style={styles.stepLabelText}>{STEPS[currentStep]}</Text>
      </View>

      <View style={styles.content}>{renderStep()}</View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={handlePrevious}
              disabled={loading || uploading}
            >
              <Text style={styles.buttonOutlineText}>मागील </Text>
            </TouchableOpacity>
          )}

          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleNext}
              disabled={loading || uploading}
            >
              <Text style={styles.buttonPrimaryText}>पुढे </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.submitButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline, styles.halfButton]}
                onPress={handleSaveAsDraft}
                disabled={loading || uploading}
              >
                <Text style={styles.buttonOutlineText}>मसुदा</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, styles.halfButton]}
                onPress={() => handleSubmit(false)}
                disabled={loading || uploading}
              >
                <Text style={styles.buttonPrimaryText}>सबमिट / Submit</Text>
              </TouchableOpacity>
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
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#4f46e5',
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLine: {
    width: 25,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#4f46e5',
  },
  stepLabel: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 0.1,
    paddingVertical: 0.1,
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  projectCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
  photoSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  photoDescription: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoNote: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
  uploadingIndicator: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadingText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '500',
  },
  photosGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  photoThumbnailContainer: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonOutlineText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: '#4f46e5',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
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
});