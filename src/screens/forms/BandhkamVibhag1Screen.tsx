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

type RouteParams = RouteProp<FormsStackParamList, 'BandhkamVibhag1'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'BandhkamVibhag1'>;

const STEPS = ['मूलभूत माहिती', 'स्थान माहिती', 'बांधकाम तपासणी', 'फोटो'];

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
  const { categoryId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [formData, setFormData] = useState<BandhkamFormData>({
    visit_date: '',
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

      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.contractor_name || user?.email || '',
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
      Alert.alert(t('common.error'), 'Add photo');
      return;
    }

    try {
      setLoading(true);

      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.contractor_name || user?.email || '',
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>मूलभूत माहिती</Text>
            <Text style={styles.sectionSubtitle}>Basic Information</Text>

            <Input
              label="भेट दिनांक *"
              value={formData.visit_date}
              onChangeText={(text) => setFormData({ ...formData, visit_date: text })}
              placeholder="DD-MM-YYYY"
            />

            <Input
              label="मंजूर अंदाजपत्रकानुसार कामाचे नाव *"
              value={formData.work_name}
              onChangeText={(text) => setFormData({ ...formData, work_name: text })}
              placeholder="कामाचे नाव प्रविष्ट करा"
            />

            <Input
              label="लेखाशिर्ष"
              value={formData.account_head}
              onChangeText={(text) => setFormData({ ...formData, account_head: text })}
              placeholder="लेखाशिर्ष प्रविष्ट करा"
            />

            <Input
              label="ठेकेदाराचे नाव"
              value={formData.contractor_name}
              onChangeText={(text) => setFormData({ ...formData, contractor_name: text })}
              placeholder="ठेकेदाराचे नाव प्रविष्ट करा"
            />

            <Input
              label="प्रशासकीय मान्यता क्रमांक"
              value={formData.admin_approval_number}
              onChangeText={(text) => setFormData({ ...formData, admin_approval_number: text })}
              placeholder="मान्यता क्रमांक प्रविष्ट करा"
            />

            <Input
              label="प्रशासकीय मान्यता दिनांक"
              value={formData.admin_approval_date}
              onChangeText={(text) => setFormData({ ...formData, admin_approval_date: text })}
              placeholder="DD-MM-YYYY"
            />

            <Input
              label="प्रशासकीय मान्यता रक्कम"
              value={formData.admin_approval_amount}
              onChangeText={(text) => setFormData({ ...formData, admin_approval_amount: text })}
              placeholder="रक्कम प्रविष्ट करा"
              keyboardType="numeric"
            />

            <Input
              label="तांत्रिक मान्यता क्रमांक"
              value={formData.technical_approval_number}
              onChangeText={(text) => setFormData({ ...formData, technical_approval_number: text })}
              placeholder="तांत्रिक मान्यता क्रमांक प्रविष्ट करा"
            />

            <Input
              label="तांत्रिक मान्यता दिनांक"
              value={formData.technical_approval_date}
              onChangeText={(text) => setFormData({ ...formData, technical_approval_date: text })}
              placeholder="DD-MM-YYYY"
            />

            <Input
              label="रस्त्याची लांबी / इमारतीचे क्षेत्रफळ"
              value={formData.road_length_building_area}
              onChangeText={(text) => setFormData({ ...formData, road_length_building_area: text })}
              placeholder="लांबी/क्षेत्रफळ प्रविष्ट करा"
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
              />

              <Input
                label="कारनामा रक्कम"
                value={formData.contract_amount}
                onChangeText={(text) => setFormData({ ...formData, contract_amount: text })}
                placeholder="रक्कम प्रविष्ट करा"
                keyboardType="numeric"
              />

              <Input
                label="टक्केवारी (कमी / अधिक)"
                value={formData.contract_percentage}
                onChangeText={(text) => setFormData({ ...formData, contract_percentage: text })}
                placeholder="टक्केवारी प्रविष्ट करा"
              />

              <Input
                label="कार्यारंभ आदेश पत्र क्रमांक"
                value={formData.work_start_order_number}
                onChangeText={(text) => setFormData({ ...formData, work_start_order_number: text })}
                placeholder="आदेश पत्र क्रमांक प्रविष्ट करा"
              />

              <Input
                label="कार्यारंभ दिनांक"
                value={formData.work_start_date}
                onChangeText={(text) => setFormData({ ...formData, work_start_date: text })}
                placeholder="DD-MM-YYYY"
              />

              <Input
                label="कामाचा विहित कालावधी (पासून)"
                value={formData.work_duration_from}
                onChangeText={(text) => setFormData({ ...formData, work_duration_from: text })}
                placeholder="DD-MM-YYYY"
              />

              <Input
                label="कामाचा विहित कालावधी (पर्यंत)"
                value={formData.work_duration_to}
                onChangeText={(text) => setFormData({ ...formData, work_duration_to: text })}
                placeholder="DD-MM-YYYY"
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
              />

              <Input
                label="मुदतवाढीची कारणे"
                value={formData.extension_reasons}
                onChangeText={(text) => setFormData({ ...formData, extension_reasons: text })}
                placeholder="कारणे प्रविष्ट करा"
                multiline
                numberOfLines={3}
              />

              <Input
                label="तांत्रिक मान्यता प्राप्त अंदाजपत्रकानुसार कामांचा वाव"
                value={formData.approved_estimate_scope}
                onChangeText={(text) => setFormData({ ...formData, approved_estimate_scope: text })}
                placeholder="कामांचा वाव प्रविष्ट करा"
                multiline
                numberOfLines={3}
              />

              <Input
                label="कामाची सद्यस्थिती (मुख्य बाबी निहाय)"
                value={formData.current_work_status}
                onChangeText={(text) => setFormData({ ...formData, current_work_status: text })}
                placeholder="सद्यस्थिती प्रविष्ट करा"
                multiline
                numberOfLines={4}
              />

              <Input
                label="मोजमाप पुस्तक व पान क्रमांक"
                value={formData.measurement_book_page}
                onChangeText={(text) => setFormData({ ...formData, measurement_book_page: text })}
                placeholder="पुस्तक व पान क्रमांक प्रविष्ट करा"
              />

              <Input
                label="देयकाची सद्यस्थिती व आता पावेतो झालेला"
                value={formData.payment_status}
                onChangeText={(text) => setFormData({ ...formData, payment_status: text })}
                placeholder="देयकाची स्थिती प्रविष्ट करा"
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
              />

              <Input
                label="पदनाम"
                value={formData.inspector_designation}
                onChangeText={(text) => setFormData({ ...formData, inspector_designation: text })}
                placeholder="पदनाम प्रविष्ट करा"
              />

              <Input
                label="तपासणी दिनांक"
                value={formData.inspection_date}
                onChangeText={(text) => setFormData({ ...formData, inspection_date: text })}
                placeholder="DD-MM-YYYY"
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
