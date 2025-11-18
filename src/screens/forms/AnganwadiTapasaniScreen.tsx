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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto } from '../../services/fimsService';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'AnganwadiTapasani'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'AnganwadiTapasani'>;

const STEPS = ['Basic Info', 'Facilities', 'Equipment', 'Children', 'Location', 'Photos'];

interface AnganwadiFormData {
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;
  building_type: string;
  room_availability: boolean;
  toilet_facility: boolean;
  drinking_water: boolean;
  electricity: boolean;
  weighing_machine: boolean;
  first_aid_kit: boolean;
  teaching_materials: boolean;
  toys_available: boolean;
  total_registered_children: string;
  children_present_today: string;
  hot_meal_served: boolean;
  general_observations: string;
}

export default function AnganwadiTapasaniScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [formData, setFormData] = useState<AnganwadiFormData>({
    anganwadi_name: '',
    anganwadi_number: '',
    supervisor_name: '',
    helper_name: '',
    village_name: '',
    building_type: 'own',
    room_availability: false,
    toilet_facility: false,
    drinking_water: false,
    electricity: false,
    weighing_machine: false,
    first_aid_kit: false,
    teaching_materials: false,
    toys_available: false,
    total_registered_children: '',
    children_present_today: '',
    hot_meal_served: false,
    general_observations: '',
  });

  const updateFormData = (field: keyof AnganwadiFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.anganwadi_name || !formData.supervisor_name) {
        Alert.alert(t('common.error'), 'Please fill in required fields');
        return;
      }
    }

    if (currentStep === 4) {
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

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.supervisor_name,
        status: 'draft',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
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
        filled_by_name: formData.supervisor_name,
        status: 'submitted',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      for (let i = 0; i < photos.length; i++) {
        await uploadPhoto(inspection.id, photos[i], `photo_${i + 1}.jpg`, i + 1);
      }

      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  const renderSwitchRow = (label: string, value: boolean, field: keyof AnganwadiFormData) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(val) => updateFormData(field, val)}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={value ? '#2563eb' : '#f3f4f6'}
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text style={styles.sectionTitle}>अंगणवाडी माहिती</Text>
            <Text style={styles.sectionSubtitle}>Anganwadi Information</Text>

            <Input
              label="अंगणवाडीचे नाव / Anganwadi Name *"
              value={formData.anganwadi_name}
              onChangeText={(text) => updateFormData('anganwadi_name', text)}
              placeholder="Enter anganwadi name"
            />

            <Input
              label="अंगणवाडी क्रमांक / Anganwadi Number"
              value={formData.anganwadi_number}
              onChangeText={(text) => updateFormData('anganwadi_number', text)}
              placeholder="Enter number"
            />

            <Input
              label="पर्यवेक्षकाचे नाव / Supervisor Name *"
              value={formData.supervisor_name}
              onChangeText={(text) => updateFormData('supervisor_name', text)}
              placeholder="Enter supervisor name"
            />

            <Input
              label="सहायकाचे नाव / Helper Name"
              value={formData.helper_name}
              onChangeText={(text) => updateFormData('helper_name', text)}
              placeholder="Enter helper name"
            />

            <Input
              label="गावाचे नाव / Village Name"
              value={formData.village_name}
              onChangeText={(text) => updateFormData('village_name', text)}
              placeholder="Enter village name"
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>सुविधा / Facilities</Text>

            {renderSwitchRow('खोली उपलब्ध / Room Available', formData.room_availability, 'room_availability')}
            {renderSwitchRow('शौचालय सुविधा / Toilet Facility', formData.toilet_facility, 'toilet_facility')}
            {renderSwitchRow('पिण्याचे पाणी / Drinking Water', formData.drinking_water, 'drinking_water')}
            {renderSwitchRow('वीज / Electricity', formData.electricity, 'electricity')}
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>उपकरणे / Equipment</Text>

            {renderSwitchRow('वजन यंत्र / Weighing Machine', formData.weighing_machine, 'weighing_machine')}
            {renderSwitchRow('प्रथमोपचार पेटी / First Aid Kit', formData.first_aid_kit, 'first_aid_kit')}
            {renderSwitchRow('शिकवण साहित्य / Teaching Materials', formData.teaching_materials, 'teaching_materials')}
            {renderSwitchRow('खेळणी / Toys Available', formData.toys_available, 'toys_available')}
            {renderSwitchRow('गरम जेवण / Hot Meal Served', formData.hot_meal_served, 'hot_meal_served')}
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.sectionTitle}>मुलांची माहिती</Text>
            <Text style={styles.sectionSubtitle}>Children Information</Text>

            <Input
              label="एकूण नोंदणीकृत मुले / Total Registered Children"
              value={formData.total_registered_children}
              onChangeText={(text) => updateFormData('total_registered_children', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              label="आज उपस्थित / Present Today"
              value={formData.children_present_today}
              onChangeText={(text) => updateFormData('children_present_today', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              label="सामान्य निरीक्षणे / General Observations"
              value={formData.general_observations}
              onChangeText={(text) => updateFormData('general_observations', text)}
              placeholder="Enter observations"
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text>
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
          </View>
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card>{renderStep()}</Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <Button
              title={t('common.previous')}
              onPress={handlePrevious}
              variant="outline"
              style={styles.button}
              disabled={loading}
            />
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button
              title={t('common.next')}
              onPress={handleNext}
              style={styles.button}
              disabled={loading}
            />
          ) : (
            <View style={styles.submitButtons}>
              <Button
                title={t('fims.saveAsDraft')}
                onPress={handleSaveAsDraft}
                variant="outline"
                style={styles.button}
                loading={loading}
              />
              <Button
                title={t('fims.submitInspection')}
                onPress={handleSubmit}
                style={styles.button}
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
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    marginHorizontal: 4,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    // gap removed - using marginHorizontal instead
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitButtons: {
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 4,
    // gap removed - using marginHorizontal instead
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
