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
import { createInspection, updateInspection, uploadPhoto } from '../../services/fimsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  });

  const saveLocally = async (inspectionId: string, data: any) => {
    try {
      const key = `inspection_${inspectionId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));

      const photosKey = `inspection_photos_${inspectionId}`;
      await AsyncStorage.setItem(photosKey, JSON.stringify(photos));
    } catch (error) {
      console.error('Error saving locally:', error);
    }
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
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      await saveLocally(inspection.id, { formData, location, photos });

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

  const renderCheckItem = (label: string, value: boolean, onChange: (val: boolean) => void) => (
    <View style={styles.checkItem}>
      <Text style={styles.checkLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView>
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
          </ScrollView>
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
          <ScrollView>
            <Text style={styles.sectionTitle}>दफ्तर निरीक्षण</Text>
            <Text style={styles.sectionSubtitle}>Office Inspection Checklist</Text>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>पत्र व्यवहार तपशील</Text>
              {renderCheckItem('प्राप्त पत्र नोंदवली गेली आहे', formData.letter_received_logged, (val) =>
                setFormData({ ...formData, letter_received_logged: val })
              )}
              {renderCheckItem('प्राधान्यक्रमाने खातमी केली', formData.letter_priority_disposed, (val) =>
                setFormData({ ...formData, letter_priority_disposed: val })
              )}
              {renderCheckItem('साप्ताहिक अहवाल तयार केला', formData.weekly_report_created, (val) =>
                setFormData({ ...formData, weekly_report_created: val })
              )}
              {renderCheckItem('प्रलंबित नोंदवही राखली आहे', formData.pending_register_maintained, (val) =>
                setFormData({ ...formData, pending_register_maintained: val })
              )}
              {renderCheckItem('स्मरणपत्र वेळेवर पाठवली', formData.reminders_sent_in_time, (val) =>
                setFormData({ ...formData, reminders_sent_in_time: val })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>नोंदवह्या</Text>
              {renderCheckItem('आवश्यक नोंदवह्या आहेत', formData.required_registers, (val) =>
                setFormData({ ...formData, required_registers: val })
              )}
              {renderCheckItem('अद्ययावत नोंदवह्या', formData.updated_registers, (val) =>
                setFormData({ ...formData, updated_registers: val })
              )}
              {renderCheckItem('वेळेवर सादर केली', formData.registers_submitted_on_time, (val) =>
                setFormData({ ...formData, registers_submitted_on_time: val })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.subSectionTitle}>दप्तर रचना</Text>
              {renderCheckItem('सहा गठ्ठी रचना', formData.file_structure_six_bundle, (val) =>
                setFormData({ ...formData, file_structure_six_bundle: val })
              )}
              {renderCheckItem('पोस्ट खातमी गठ्ठीबंधन', formData.post_disposal_bundling, (val) =>
                setFormData({ ...formData, post_disposal_bundling: val })
              )}
              {renderCheckItem('कालावधी विवरणपत्र सादर', formData.periodic_statements_submitted, (val) =>
                setFormData({ ...formData, periodic_statements_submitted: val })
              )}
              {renderCheckItem('कायम सूचना उपलब्ध', formData.permanent_instruction_available, (val) =>
                setFormData({ ...formData, permanent_instruction_available: val })
              )}
              {renderCheckItem('अनुक्रमित सूचना पूर्ण', formData.indexed_instruction_complete, (val) =>
                setFormData({ ...formData, indexed_instruction_complete: val })
              )}
              {renderCheckItem('सरकारी परिपत्रकाने अद्ययावत', formData.updated_by_gov_circular, (val) =>
                setFormData({ ...formData, updated_by_gov_circular: val })
              )}
              {renderCheckItem('फायली वर्गीकृत केल्या', formData.files_classified, (val) =>
                setFormData({ ...formData, files_classified: val })
              )}
              {renderCheckItem('बंधन आणि सबमिशन', formData.binding_and_submission, (val) =>
                setFormData({ ...formData, binding_and_submission: val })
              )}
              {renderCheckItem('खातमी गती समाधानकारक', formData.disposal_speed_satisfactory, (val) =>
                setFormData({ ...formData, disposal_speed_satisfactory: val })
              )}
            </View>

            <Input
              label="तपासणीच्या तुटी / Inspection Issues"
              value={formData.inspection_issues}
              onChangeText={(text) => setFormData({ ...formData, inspection_issues: text })}
              placeholder="Enter any issues found"
              multiline
              numberOfLines={4}
            />

            <Input
              label="कामाचा दर्जा / Work Quality"
              value={formData.work_quality}
              onChangeText={(text) => setFormData({ ...formData, work_quality: text })}
              placeholder="Excellent / Good / Satisfactory / Needs Improvement"
            />
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView contentContainerStyle={styles.photoStepContainer}>
            <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
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
    padding: 16,
  },
  photoStepContainer: {
    minHeight: 400,
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
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkLabel: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
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
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
