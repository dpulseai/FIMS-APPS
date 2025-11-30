import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { FormsStackParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto, saveRajyaTapasaniForm, getInspectionById, updateInspection, getRajyaTapasaniByInspectionId } from '../../services/fimsService';

import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import Stepper from '../../components/common/Stepper';

type RouteParams = RouteProp<FormsStackParamList, 'RajyaGunwattaNirikshak'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'RajyaGunwattaNirikshak'>;

const STEPS = ['निरीक्षक माहिती', 'स्थान माहिती', 'तपासणी अहवाल', 'फोटो'];

interface RajyaGunwattaFormData {
  state_quality_inspector_name: string;
  state_quality_inspector_designation: string;
  inspection_date: string;
  work_name: string;
  inspector_name: string;
  inspector_designation: string;
  location_name: string;
  address: string;
  planned_date: string;
  latitude: number | null;        
  longitude: number | null;       
  location_accuracy: number | null; 
}

export default function RajyaGunwattaNirikshakScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [photoMetas, setPhotoMetas] = useState<any[]>([]);
  const [existingPhotoMetas, setExistingPhotoMetas] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingInspectionId, setExistingInspectionId] = useState<string | null>(null);

  const { inspectionId } = (route.params || {}) as any;

  const [formData, setFormData] = useState<RajyaGunwattaFormData>({
    state_quality_inspector_name: '',
    state_quality_inspector_designation: '',
    inspection_date: '',
    work_name: '',
    inspector_name: '',
    inspector_designation: '',
    location_name: '',
    address: '',
    planned_date: '',
   latitude: null,
    longitude: null,
    location_accuracy: null,
  });

  const [showInspectionDatePicker, setShowInspectionDatePicker] = useState(false);
  const [showPlannedDatePicker, setShowPlannedDatePicker] = useState(false);

  const updateFormData = (field: keyof RajyaGunwattaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load existing inspection & form if route provides an inspectionId
  const loadExisting = async () => {
    if (!inspectionId) return;
    setLoading(true);
    try {
      const inspection = await getInspectionById(inspectionId);
      const rajya = await getRajyaTapasaniByInspectionId(inspectionId as string);

      if (inspection) {
        setExistingInspectionId(inspectionId as string);
        setIsEditMode(true);
        // populate some location fields
        if (inspection.location_name) updateFormData('location_name', inspection.location_name || '');
        if (inspection.location_latitude !== undefined) updateFormData('latitude', inspection.location_latitude ?? null);
        if (inspection.location_longitude !== undefined) updateFormData('longitude', inspection.location_longitude ?? null);
        if (inspection.location_address) updateFormData('address', inspection.location_address || '');
      }

      if (rajya) {
        // Map rajya_tapasani columns to formData
        updateFormData('state_quality_inspector_name', rajya.inspector_name || '');
        updateFormData('inspection_date', rajya.inspection_date ? String(rajya.inspection_date) : '');
        updateFormData('work_name', rajya.work_name || '');
      }

      // set existing photos if any
      if (inspection && (inspection as any).photos) {
        const inspPhotos = (inspection as any).photos || [];
        setExistingPhotos(inspPhotos);
        // populate existing photo metas if present in saved structure
        const metas = inspPhotos.map((p: any) => {
          if (!p) return null;
          return {
            address: p.address || p.meta?.address || null,
            latitude: p.latitude ?? p.meta?.latitude ?? null,
            longitude: p.longitude ?? p.meta?.longitude ?? null,
          };
        });
        setExistingPhotoMetas(metas);
      }
    } catch (e) {
      console.error('Error loading existing RajyaGunwatta inspection:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (inspectionId) loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectionId]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('परवानगी नाकारली', 'स्थान प्रवेशासाठी परवानगी आवश्यक आहे');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      updateFormData('latitude', loc.coords.latitude);
      updateFormData('longitude', loc.coords.longitude);
      updateFormData('location_accuracy', loc.coords.accuracy);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const fullAddress = geocode && geocode.length > 0 
        ? `${geocode[0].name || ''}, ${geocode[0].street || ''}, ${geocode[0].city || ''}, ${geocode[0].region || ''}, ${geocode[0].postalCode || ''}`
            .replace(/,\s*,/g, ',').trim()
        : '';

      updateFormData('location_name', fullAddress);
      updateFormData('address', fullAddress);

      Alert.alert('यश', 'स्थान यशस्वीरित्या कॅप्चर केले');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('त्रुटी', 'स्थान मिळवताना त्रुटी आली');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if ((photos.length + existingPhotos.length) >= 5) {
      Alert.alert(t('common.error'), 'Maximum 5 photos allowed');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Camera permission is needed');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      // attempt to capture location for this photo
      let meta: any = { address: null, latitude: null, longitude: null };
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          meta.latitude = pos.coords.latitude;
          meta.longitude = pos.coords.longitude;
          try {
            const rev = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            if (rev && rev.length > 0) {
              const r = rev[0];
              const parts: string[] = [];
              if (r.name) parts.push(r.name);
              if (r.street) parts.push(r.street);
              const cityParts: string[] = [];
              if (r.city) cityParts.push(r.city);
              if (r.region) cityParts.push(r.region);
              if (cityParts.length) parts.push(cityParts.join(', '));
              if (r.country) parts.push(r.country);
              meta.address = parts.join(', ');
            }
          } catch (revErr) {
            console.warn('Reverse geocode failed for photo:', revErr);
          }
        }
      } catch (locErr) {
        console.warn('Could not fetch location for photo:', locErr);
      }

      setPhotos([...photos, uri]);
      setPhotoMetas([...photoMetas, meta]);
    }
  };

  const pickImage = async () => {
    // Gallery selection removed for this form; photos must be captured with camera.
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoMetas(photoMetas.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
    setExistingPhotoMetas(existingPhotoMetas.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (
        !formData.state_quality_inspector_name ||
        !formData.inspection_date ||
        !formData.work_name
      ) {
        Alert.alert(t('common.error'), 'कृपया आवश्यक माहिती भरा');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.location_name) {
        Alert.alert(t('common.error'), 'कृपया स्थानाचे नाव भरा');
        return;
      }
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      if (isEditMode && existingInspectionId) {
        // Update inspection metadata
        try {
          await updateInspection(existingInspectionId, {
            status: 'draft',
            location_latitude: formData.latitude ?? undefined,
            location_longitude: formData.longitude ?? undefined,
            location_address: formData.address || undefined,
            filled_by_name: user?.email || undefined,
            form_data: { ...formData },
          } as any);
        } catch (e) {
          console.warn('Could not update inspection for draft:', e);
        }

        // Update form row (preserve existing photos unless removed, and append new ones)
        const combinedPhotosForUpdate = [
          ...existingPhotos.map((p: any, idx: number) => {
            const meta = existingPhotoMetas[idx] || {};
            if (typeof p === 'string') return { name: (p || '').split('/').pop() || `photo_${idx+1}`, uri: p, order: idx + 1, address: meta.address || null, latitude: meta.latitude || null, longitude: meta.longitude || null };
            return { name: p.name || (p.uri || '').split('/').pop() || `photo_${idx+1}`, uri: p.uri || p, order: idx + 1, address: meta.address || p.address || null, latitude: meta.latitude ?? p.latitude ?? null, longitude: meta.longitude ?? p.longitude ?? null };
          }),
          ...photos.map((uri, i) => {
            const meta = photoMetas[i] || {};
            return { name: (uri || '').split('/').pop() || `photo_${existingPhotos.length + i + 1}`, uri, order: existingPhotos.length + i + 1, address: meta.address || null, latitude: meta.latitude || null, longitude: meta.longitude || null };
          }),
        ];

        await saveRajyaTapasaniForm(existingInspectionId, {
          inspector_name: formData.state_quality_inspector_name || formData.inspector_name || '',
          inspection_date: formData.inspection_date || null,
          work_name: formData.work_name || '',
          photos: combinedPhotosForUpdate,
        });

        // Upload any newly-captured photos only (preserve existing uploaded ones)
        for (let i = 0; i < photos.length; i++) {
          try {
            const uri = photos[i];
            if (!uri || /^https?:\/\//i.test(uri)) continue; // skip already uploaded urls
            await uploadPhoto(existingInspectionId, uri, `photo${existingPhotos.length + i + 1}.jpg`, existingPhotos.length + i + 1);
          } catch (e) {
            console.warn('Photo upload failed for draft update:', e);
          }
        }

        Alert.alert(t('common.success'), t('fims.inspectionSaved'));
        navigation.goBack();
      } else {
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: user?.email || '',
          status: 'draft',
          location_name: formData.location_name || null,
          location_latitude: formData.latitude ?? null,
          location_longitude: formData.longitude ?? null,
          location_address: formData.address || null,
          form_data: { ...formData },
        } as any);

        // Save rajya_tapasani form row linked to this inspection
        const combinedPhotosForCreate = [
          ...existingPhotos.map((p: any, idx: number) => {
            const meta = existingPhotoMetas[idx] || {};
            if (typeof p === 'string') return { name: (p || '').split('/').pop() || `photo_${idx+1}`, uri: p, order: idx + 1, address: meta.address || null, latitude: meta.latitude || null, longitude: meta.longitude || null };
            return { name: p.name || (p.uri || '').split('/').pop() || `photo_${idx+1}`, uri: p.uri || p, order: idx + 1, address: meta.address || p.address || null, latitude: meta.latitude ?? p.latitude ?? null, longitude: meta.longitude ?? p.longitude ?? null };
          }),
          ...photos.map((uri, i) => {
            const meta = photoMetas[i] || {};
            return { name: (uri || '').split('/').pop() || `photo_${existingPhotos.length + i + 1}`, uri, order: existingPhotos.length + i + 1, address: meta.address || null, latitude: meta.latitude || null, longitude: meta.longitude || null };
          }),
        ];

        await saveRajyaTapasaniForm(inspection.id, {
          inspector_name: formData.state_quality_inspector_name || formData.inspector_name || '',
          inspection_date: formData.inspection_date || null,
          work_name: formData.work_name || '',
          photos: combinedPhotosForCreate,
        });

        // Optionally upload photos even for draft. Keep behavior same as submit.
        for (let i = 0; i < photos.length; i++) {
          try {
            await uploadPhoto(inspection.id, photos[i], `photo${existingPhotos.length + i + 1}.jpg`, existingPhotos.length + i + 1);
          } catch (e) {
            console.warn('Photo upload failed for draft:', e);
          }
        }

        Alert.alert(t('common.success'), t('fims.inspectionSaved'));
        navigation.goBack();
      }
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert(t('common.error'), 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if ((photos.length + existingPhotos.length) === 0) {
        Alert.alert(t('common.error'), 'कृपया किमान एक फोटो जोडा');
        return;
      }
    try {
      setLoading(true);
      if (isEditMode && existingInspectionId) {
        // Update inspection metadata
        try {
          await updateInspection(existingInspectionId, {
            status: 'submitted',
            location_latitude: formData.latitude ?? undefined,
            location_longitude: formData.longitude ?? undefined,
            location_address: formData.address || undefined,
            filled_by_name: user?.email || undefined,
            form_data: { ...formData },
          } as any);
        } catch (e) {
          console.warn('Could not update inspection metadata:', e);
        }

        // Update form row (preserve existing photos and append new ones)
        const combinedPhotosForUpdateSubmit = [
          ...existingPhotos.map((p: any, idx: number) => {
            if (typeof p === 'string') return { name: (p || '').split('/').pop() || `photo_${idx+1}`, uri: p, order: idx + 1 };
            return { name: p.name || (p.uri || '').split('/').pop() || `photo_${idx+1}`, uri: p.uri || p, order: idx + 1 };
          }),
          ...photos.map((uri, i) => ({ name: (uri || '').split('/').pop() || `photo_${existingPhotos.length + i + 1}`, uri, order: existingPhotos.length + i + 1 })),
        ];

        await saveRajyaTapasaniForm(existingInspectionId, {
          inspector_name: formData.state_quality_inspector_name || formData.inspector_name || '',
          inspection_date: formData.inspection_date || null,
          work_name: formData.work_name || '',
          photos: combinedPhotosForUpdateSubmit,
        });

        // Upload newly-captured photos only (preserve existing uploaded ones)
        for (let i = 0; i < photos.length; i++) {
          const uri = photos[i];
          if (!uri || /^https?:\/\//i.test(uri)) continue; // skip already uploaded urls
          await uploadPhoto(existingInspectionId, uri, `photo${existingPhotos.length + i + 1}.jpg`, existingPhotos.length + i + 1);
        }

        Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
        navigation.navigate('CategorySelection');
      } else {
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: user?.email || '',
          status: 'submitted',
          location_name: formData.location_name || null,
          location_latitude: formData.latitude ?? null,
          location_longitude: formData.longitude ?? null,
          location_address: formData.address || null,
          form_data: { ...formData },
        } as any);

        // Save rajya_tapasani form row linked to this inspection
        const combinedPhotosForCreateSubmit = [
          ...existingPhotos.map((p: any, idx: number) => {
            if (typeof p === 'string') return { name: (p || '').split('/').pop() || `photo_${idx+1}`, uri: p, order: idx + 1 };
            return { name: p.name || (p.uri || '').split('/').pop() || `photo_${idx+1}`, uri: p.uri || p, order: idx + 1 };
          }),
          ...photos.map((uri, i) => ({ name: (uri || '').split('/').pop() || `photo_${existingPhotos.length + i + 1}`, uri, order: existingPhotos.length + i + 1 })),
        ];

        await saveRajyaTapasaniForm(inspection.id, {
          inspector_name: formData.state_quality_inspector_name || formData.inspector_name || '',
          inspection_date: formData.inspection_date || null,
          work_name: formData.work_name || '',
          photos: combinedPhotosForCreateSubmit,
        });

        for (let i = 0; i < photos.length; i++) {
          await uploadPhoto(
            inspection.id,
            photos[i],
            `photo${existingPhotos.length + i + 1}.jpg`,
            existingPhotos.length + i + 1,
          );
        }

        Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
        navigation.navigate('CategorySelection');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(t('common.error'), 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.sectionTitle}>राज्य गुणवत्ता निरीक्षक माहिती (State Quality Inspector Information)</Text>
      </View>
      <Text style={styles.sectionSubtitle}>State Quality Inspector Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>राज्य गुणवत्ता निरीक्षक यांचे नाव *</Text>
        <TextInput
          style={styles.input}
          value={formData.state_quality_inspector_name}
          onChangeText={text => updateFormData('state_quality_inspector_name', text)}
          placeholder="राज्य गुणवत्ता निरीक्षकाचे नाव प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>पदनाम</Text>
        <TextInput
          style={styles.input}
          value={formData.state_quality_inspector_designation}
          onChangeText={text => updateFormData('state_quality_inspector_designation', text)}
          placeholder="पदनाम प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>काम तपासणी दिनांक *</Text>
        <TouchableOpacity onPress={() => setShowInspectionDatePicker(true)} style={styles.input}>
          <Text style={{ color: formData.inspection_date ? '#111' : '#9ca3af' }}>
            {formData.inspection_date || 'Select Date'}
          </Text>
        </TouchableOpacity>
        {showInspectionDatePicker && (
          <DateTimePicker
            value={formData.inspection_date ? new Date(formData.inspection_date) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowInspectionDatePicker(false);
              if (selectedDate) {
                // Disallow selecting previous dates - only allow today or future dates
                const sel = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                const today = new Date();
                const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                if (sel < todayZero) {
                  Alert.alert('Invalid date', 'Previous dates are not allowed for inspection date');
                  return;
                }
                const d = sel.toISOString().split('T')[0];
                updateFormData('inspection_date', d);
              }
            }}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>कामाचे नाव *</Text>
        <TextInput
          style={styles.input}
          value={formData.work_name}
          onChangeText={text => updateFormData('work_name', text)}
          placeholder="कामाचे नाव प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );

  const renderLocationInfo = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.sectionTitle}>स्थान माहिती (Location Information)</Text>
      </View>
      <Text style={styles.sectionSubtitle}>Location Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>स्थानाचे नाव *</Text>
        <TextInput
          style={styles.input}
          value={formData.location_name}
          onChangeText={text => updateFormData('location_name', text)}
          placeholder="स्थानाचे नाव प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>नियोजित दिनांक</Text>
        <TouchableOpacity onPress={() => setShowPlannedDatePicker(true)} style={styles.input}>
          <Text style={{ color: formData.planned_date ? '#111' : '#9ca3af' }}>
            {formData.planned_date || 'YYYY-MM-DD'}
          </Text>
        </TouchableOpacity>
        {showPlannedDatePicker && (
          <DateTimePicker
            value={formData.planned_date ? new Date(formData.planned_date) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPlannedDatePicker(false);
              if (selectedDate) {
                const d = selectedDate.toISOString().split('T')[0];
                updateFormData('planned_date', d);
              }
            }}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GPS Location</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={getCurrentLocation} 
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? 'Loading...' : '📍 Get Current Location'}
          </Text>
        </TouchableOpacity>
        
        {formData.latitude && formData.longitude && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationInfoTitle}>स्थान कॅप्चर केले ✅</Text>
            <Text style={styles.locationInfoText}>
              Lat: {formData.latitude?.toFixed(6) || 'N/A'}
            </Text>
            <Text style={styles.locationInfoText}>
              Lng: {formData.longitude?.toFixed(6) || 'N/A'}
            </Text>
            <Text style={styles.locationInfoText}>
              Accuracy: {formData.location_accuracy ? `${Math.round(formData.location_accuracy)}m` : 'N/A'}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>संपूर्ण पत्ता</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={formData.address}
          onChangeText={text => updateFormData('address', text)}
          placeholder="संपूर्ण पत्ता प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );

  const renderInspectionReport = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.icon}>📝</Text>
        <Text style={styles.sectionTitle}>राज्य गुणवत्ता निरीक्षक यांचा तपासणी अहवाल (State Quality Inspector Inspection Report)</Text>
      </View>
      <Text style={styles.sectionSubtitle}>Inspection Report</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>निरीक्षकाचे नाव</Text>
        <TextInput
          style={styles.input}
          value={formData.inspector_name}
          onChangeText={text => updateFormData('inspector_name', text)}
          placeholder="निरीक्षकाचे नाव प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>पदनाम</Text>
        <TextInput
          style={styles.input}
          value={formData.inspector_designation}
          onChangeText={text => updateFormData('inspector_designation', text)}
          placeholder="पदनाम प्रविष्ट करा"
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );

  const renderPhotoUpload = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.sectionTitle}>फोटो दस्तऐवज</Text>
      </View>
      <Text style={styles.sectionSubtitle}>Photo Documentation</Text>

      <View style={styles.photoUploadSection}>
        <Text style={styles.photoUploadTitle}>फोटो अपलोड करा</Text>
        <Text style={styles.photoUploadInfo}>किमान 1 फोटो, जास्तीत जास्त 5 फोटो परवानगी</Text>
      </View>

      <View style={styles.photoButtons}>
        <TouchableOpacity 
          style={[styles.photoButton, (photos.length + existingPhotos.length) >= 5 && { opacity: 0.5 }, { flex: 1 }] } 
          onPress={takePhoto}
          disabled={(photos.length + existingPhotos.length) >= 5 || loading}
        >
          <Text style={styles.photoButtonText}>📷 कॅमेरा घ्या</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.photoCount}>{existingPhotos.length + photos.length}/5 फोटो निवडले</Text>

      <ScrollView horizontal style={styles.photoScrollView} showsHorizontalScrollIndicator={false}>
        {existingPhotos.map((p, index) => {
          const uri = typeof p === 'string' ? p : (p.uri || p.name || '');
          const meta = existingPhotoMetas[index];
          return (
            <View key={`existing-${index}`} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photoThumbnail} />
              {meta && meta.address ? (
                <Text style={styles.photoMetaText} numberOfLines={1} ellipsizeMode="tail">{meta.address}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeExistingPhoto(index)}
              >
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {photos.map((uri, index) => {
          const meta = photoMetas[index];
          return (
            <View key={`new-${index}`} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photoThumbnail} />
              {meta && meta.address ? (
                <Text style={styles.photoMetaText} numberOfLines={1} ellipsizeMode="tail">{meta.address}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderLocationInfo();
      case 2: return renderInspectionReport();
      case 3: return renderPhotoUpload();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Stepper steps={STEPS} currentStep={currentStep} />
        {renderStep()}
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <TouchableOpacity style={[styles.button, styles.prevButton]} onPress={handlePrevious} disabled={loading}>
              <Text style={styles.buttonText}>मागे</Text>
            </TouchableOpacity>
          )}
          {currentStep < STEPS.length - 1 && (
            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext} disabled={loading}>
              <Text style={styles.buttonText}>पुढे</Text>
            </TouchableOpacity>
          )}
          {currentStep === STEPS.length - 1 && (
            <>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveAsDraft} disabled={loading}>
                <Text style={styles.buttonText}>ड्राफ्ट जतन करा</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.buttonText}>सबमिट करा</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  stepContainer: { 
    marginVertical: 10, 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 24, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#111', marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    paddingHorizontal: 12,
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#111', 
    backgroundColor: '#f9fafb',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  locationInfo: { 
    backgroundColor: '#d1fae5', 
    padding: 16, 
    borderRadius: 8, 
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  locationInfoTitle: { fontSize: 16, fontWeight: '600', color: '#065f46', marginBottom: 8 },
  locationInfoText: { fontSize: 14, color: '#047857', marginBottom: 8 },
  refreshButton: { 
    backgroundColor: '#0d9488', 
    padding: 12, 
    borderRadius: 6, 
    alignItems: 'center', 
    marginTop: 12 
  },
  refreshButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  photoUploadSection: {
    backgroundColor: '#ffffff', 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: '#d1d5db',
    borderRadius: 12, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 20,
  },
  photoUploadTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1f2937', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  photoUploadInfo: { 
    fontSize: 14, 
    color: '#9ca3af', 
    textAlign: 'center',
    fontWeight: '500',
  },
  photoButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  photoButton: { 
    flex: 1, 
    backgroundColor: '#0d9488', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginHorizontal: 6 
  },
  photoButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  photoCount: { 
    textAlign: 'center', 
    fontSize: 16, 
    color: '#0d9488', 
    fontWeight: '600', 
    marginBottom: 16 
  },
  photoScrollView: { maxHeight: 120 },
  photoContainer: { marginRight: 12, position: 'relative' },
  photoThumbnail: { 
    width: 100, 
    height: 100, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#e5e7eb' 
  },
  removePhotoButton: {
    position: 'absolute', 
    top: -8, 
    right: -8, 
    backgroundColor: '#ef4444', 
    borderRadius: 12,
    width: 28, 
    height: 28, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  removePhotoText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  photoMetaText: { maxWidth: 100, fontSize: 11, color: '#374151', marginTop: 6 },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 24, 
    flexWrap: 'wrap' 
  },
  button: { 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    marginVertical: 6,
    flex: 1,
    alignItems: 'center',
    minWidth: 120,
  },
  prevButton: { backgroundColor: '#9ca3af' },
  nextButton: { backgroundColor: '#0d9488' },
  saveButton: { backgroundColor: '#f59e0b' },
  submitButton: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
