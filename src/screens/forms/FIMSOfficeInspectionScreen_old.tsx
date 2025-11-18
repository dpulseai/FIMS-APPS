import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, updateInspection, uploadPhoto } from '../../services/fimsService';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'FIMSOfficeInspection'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'FIMSOfficeInspection'>;

const STEPS = ['Employee Info', 'Location Details', 'Office Inspection', 'Photos & Submit'];

interface OfficeFormData {
  department_name: string;
  employee_name: string;
  designation: string;
  table_number: string;
  date_of_joining: string;
  work_nature: string;
}

export default function FIMSOfficeInspectionScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [formData, setFormData] = useState<OfficeFormData>({
    department_name: '',
    employee_name: '',
    designation: '',
    table_number: '',
    date_of_joining: '',
    work_nature: '',
  });

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

    if (currentStep === 2) {
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

      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.employee_name,
        status: 'draft',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

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
          <View>
            <Text style={styles.sectionTitle}>कर्मचाऱ्याची माहिती</Text>
            <Text style={styles.sectionSubtitle}>Employee Information</Text>

            <Input
              label="विभागाचे नाव / Department Name *"
              value={formData.department_name}
              onChangeText={(text) => setFormData({ ...formData, department_name: text })}
              placeholder="Enter department name"
            />

            <Input
              label="कर्मचाऱ्याचे नाव / Employee Name *"
              value={formData.employee_name}
              onChangeText={(text) => setFormData({ ...formData, employee_name: text })}
              placeholder="Enter employee name"
            />

            <Input
              label="पदनाम / Designation"
              value={formData.designation}
              onChangeText={(text) => setFormData({ ...formData, designation: text })}
              placeholder="Enter designation"
            />

            <Input
              label="टेबल क्रमांक / Table Number"
              value={formData.table_number}
              onChangeText={(text) => setFormData({ ...formData, table_number: text })}
              placeholder="Enter table number"
              keyboardType="number-pad"
            />

            <Input
              label="कार्यारंभ दिनांक / Date of Joining"
              value={formData.date_of_joining}
              onChangeText={(text) => setFormData({ ...formData, date_of_joining: text })}
              placeholder="DD-MM-YYYY"
            />

            <Input
              label="कामाचे स्वरूप / Work Nature"
              value={formData.work_nature}
              onChangeText={(text) => setFormData({ ...formData, work_nature: text })}
              placeholder="Enter work nature"
              multiline
              numberOfLines={3}
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text>
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>दफ्तर निरीक्षण</Text>
            <Text style={styles.sectionSubtitle}>Office Inspection</Text>
            <Text style={styles.infoText}>
              Office inspection checklist will be added here. This is a simplified demo version.
            </Text>
          </View>
        );

      case 3:
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
                style={styles.halfButton}
                loading={loading}
              />
              <Button
                title={t('fims.submitInspection')}
                onPress={handleSubmit}
                style={styles.halfButton}
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
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 32,
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
  },
  submitButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});
