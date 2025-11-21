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
  inspector_name: string;
  inspector_designation: string;
  supervisor_remarks: string;
  supervisor_signature: string;
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
    inspector_name: '',
    inspector_designation: '',
    supervisor_remarks: '',
    supervisor_signature: '',
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
              placeholder="विभागाचे नाव प्रविष्ट करा"
            />

            <Input
              label="कर्मचाऱ्याचे नाव / Employee Name *"
              value={formData.employee_name}
              onChangeText={(text) => setFormData({ ...formData, employee_name: text })}
              placeholder="कर्मचाऱ्याचे नाव प्रविष्ट करा"
            />

            <Input
              label="पदनाम / Designation"
              value={formData.designation}
              onChangeText={(text) => setFormData({ ...formData, designation: text })}
              placeholder="पदनाम प्रविष्ट करा"
            />

            <Input
              label="टेबल क्रमांक / Table Number"
              value={formData.table_number}
              onChangeText={(text) => setFormData({ ...formData, table_number: text })}
              placeholder="टेबल क्रमांक प्रविष्ट करा"
              keyboardType="number-pad"
            />

            <Input
              label="कार्यरत असण्याची तारीख / Date of Joining"
              value={formData.date_of_joining}
              onChangeText={(text) => setFormData({ ...formData, date_of_joining: text })}
              placeholder="DD-MM-YYYY"
            />

            <Input
              label="हाताळलेले कामाचे स्वरूप / Work Nature"
              value={formData.work_nature}
              onChangeText={(text) => setFormData({ ...formData, work_nature: text })}
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
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );

      case 2:
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>दफ्तर निरीक्षण प्रपत्र</Text>
            <Text style={styles.sectionSubtitle}>Office Inspection Form</Text>

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
                placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
              />

              <Input
                label="पदनाम / Designation"
                value={formData.inspector_designation}
                onChangeText={(text) => setFormData({ ...formData, inspector_designation: text })}
                placeholder="पदनाम प्रविष्ट करा"
              />

              <Input
                label="कार्यालय प्रमुखाचे अभिप्राय"
                value={formData.supervisor_remarks}
                onChangeText={(text) => setFormData({ ...formData, supervisor_remarks: text })}
                placeholder="कार्यालय प्रमुखाचे अभिप्राय प्रविष्ट करा"
                multiline
                numberOfLines={4}
              />

              <Input
                label="कार्यालय प्रमुखाची स्वाक्षरी"
                value={formData.supervisor_signature}
                onChangeText={(text) => setFormData({ ...formData, supervisor_signature: text })}
                placeholder="स्वाक्षरी प्रविष्ट करा"
              />
            </View>
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
});
