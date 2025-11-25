import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
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

type RouteParams = RouteProp<FormsStackParamList, 'BandhkamVibhag2'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'BandhkamVibhag2'>;

const STEPS = ['कामाचे तपशील', 'तपासणी व गुणवत्ता', 'स्थान', 'फोटो'];

export default function BandhkamVibhag2Screen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [formData, setFormData] = useState({
    inspection_date: '',
    work_name: '',
    contractor: '',
    approved_plan: false,
    structural_safety: false,
    on_schedule: false,
    remarks: '',
    officer_1_name: '',
    officer_1_designation: '',
    officer_2_name: '',
    officer_2_designation: '',
    officer_3_name: '',
    officer_3_designation: '',
    officer_4_name: '',
    officer_4_designation: '',
    current_work_status: '',
    work_quality: '',
    liability_period: '',
    inspection_report: '',
    inspector_name: '',
    inspector_designation: ''
  });

  const handleNext = () => {
    if (currentStep === 0 && !formData.work_name) {
      Alert.alert(t('common.error'), 'कृपया कामाचे नाव भरा');
      return;
    }
    if (currentStep === 2 && !location) {
      Alert.alert(t('common.error'), 'कृपया GPS स्थान निवडा');
      return;
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.contractor || user?.email || '',
        status: 'draft',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert(t('common.error'), 'कृपया किमान एक फोटो जोडा');
      return;
    }
    try {
      setLoading(true);

      console.log('Submitting form...');

      // Step 1: Create the inspection
      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: user?.email || '',
        status: 'submitted',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      if (!inspection) {
        Alert.alert(t('common.error'), 'Failed to create inspection.');
        return;
      }

      console.log('Inspection created:', inspection);

      // Step 3: Upload photos
      for (let i = 0; i < photos.length; i++) {
        console.log(`Uploading photo ${i + 1}...`);
        try {
          await uploadPhoto(inspection.id, photos[i], `photo${i + 1}.jpg`, i + 1);
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          Alert.alert(t('common.error'), 'Failed to upload photos.');
          return;
        }
      }

      console.log('Photos uploaded successfully.');

      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      console.error('Error during form submission:', error);
      // TypeScript's catch clause uses `unknown` type; access message safely
      const errMsg = (error && typeof error === 'object' && 'message' in (error as any))
        ? (error as any).message
        : String(error || 'Failed');
      Alert.alert(t('common.error'), errMsg || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text style={styles.title}>बांधकाम विभाग तपासणी प्रपत्र-२</Text>
            <Input
              label="तपासणी दिनांक"
              value={formData.inspection_date}
              onChangeText={(text) => setFormData({ ...formData, inspection_date: text })}
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="कामाचे नाव"
              value={formData.work_name}
              onChangeText={(text) => setFormData({ ...formData, work_name: text })}
            />
            <Text style={{ marginVertical: 12, fontWeight: '600', fontSize: 16 }}>
              उपस्थित अधिकारी / कर्मचारी
            </Text>
            {/* Separate fields for each officer */}
            <View style={{ marginBottom: 8 }}>
              <Input
                label="अधिकारी/कर्मचारी-1 नाव"
                value={formData.officer_1_name}
                onChangeText={(text) => setFormData({ ...formData, officer_1_name: text })}
              />
              <Input
                label="पदनाम"
                value={formData.officer_1_designation}
                onChangeText={(text) => setFormData({ ...formData, officer_1_designation: text })}
              />
            </View>
            <View style={{ marginBottom: 8 }}>
              <Input
                label="अधिकारी/कर्मचारी-2 नाव"
                value={formData.officer_2_name}
                onChangeText={(text) => setFormData({ ...formData, officer_2_name: text })}
              />
              <Input
                label=" पदनाम"
                value={formData.officer_2_designation}
                onChangeText={(text) => setFormData({ ...formData, officer_2_designation: text })}
              />
            </View>
            <View style={{ marginBottom: 8 }}>
              <Input
                label="अधिकारी/कर्मचारी-3 नाव"
                value={formData.officer_3_name}
                onChangeText={(text) => setFormData({ ...formData, officer_3_name: text })}
              />
              <Input
                label=" पदनाम"
                value={formData.officer_3_designation}
                onChangeText={(text) => setFormData({ ...formData, officer_3_designation: text })}
              />
            </View>
            <View style={{ marginBottom: 8 }}>
              <Input
                label="अधिकारी/कर्मचारी-4 नाव"
                value={formData.officer_4_name}
                onChangeText={(text) => setFormData({ ...formData, officer_4_name: text })}
              />
              <Input
                label=" पदनाम"
                value={formData.officer_4_designation}
                onChangeText={(text) => setFormData({ ...formData, officer_4_designation: text })}
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View>
            <Input
              label="कामाची सद्यस्थिती"
              value={formData.current_work_status}
              onChangeText={(text) => setFormData({ ...formData, current_work_status: text })}
              multiline
            />
            <Input
              label="कामाचा दर्जा (उत्तम/चांगला/साधारण/वाईट)"
              value={formData.work_quality}
              onChangeText={(text) => setFormData({ ...formData, work_quality: text })}
            />
            <Input
              label="दोषदायित्व कालावधी"
              value={formData.liability_period}
              onChangeText={(text) => setFormData({ ...formData, liability_period: text })}
            />
            <Input
              label="तपासणी अहवाल"
              value={formData.inspection_report}
              onChangeText={(text) => setFormData({ ...formData, inspection_report: text })}
              multiline
            />
            <Text style={{ marginVertical: 12, fontWeight: '600', fontSize: 16 }}> निरीक्षकाची माहिती</Text>
            <Input
              label="निरीक्षकाचे नाव"
              value={formData.inspector_name}
              onChangeText={(text) => setFormData({ ...formData, inspector_name: text })}
            />
            <Input
              label="पदनाम"
              value={formData.inspector_designation}
              onChangeText={(text) => setFormData({ ...formData, inspector_designation: text })}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.title}>{t('fims.locationDetails')}</Text>
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.title}>{t('fims.photosSubmit')}</Text>
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
      <ScrollView style={styles.content}>
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
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 4 },
  submitButtons: { flexDirection: 'row', flex: 1 },
  halfButton: { flex: 1, marginHorizontal: 4 },
});
