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

type RouteParams = RouteProp<FormsStackParamList, 'BandhkamVibhag1'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'BandhkamVibhag1'>;

const STEPS = ['Project Info', 'Progress', 'Quality Check', 'Location', 'Photos'];

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
  const [formData, setFormData] = useState({
    project_name: '',
    contractor_name: '',
    estimated_cost: '',
    work_order_date: '',
    completion_percentage: '',
    quality_satisfactory: false,
    material_quality: false,
    workmanship_quality: false,
    safety_measures: false,
    observations: '',
  });

  const updateFormData = (field: string, value: any) => setFormData({ ...formData, [field]: value });
  const handleNext = () => { if (currentStep === 0 && !formData.project_name) { Alert.alert(t('common.error'), 'Fill required'); return; } if (currentStep === 3 && !location) { Alert.alert(t('common.error'), 'Capture location'); return; } if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.contractor_name || user?.email || '', status: 'draft', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) { Alert.alert(t('common.error'), 'Add photo'); return; }
    try {
      setLoading(true);
      const inspection = await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.contractor_name || user?.email || '', status: 'submitted', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      for (let i = 0; i < photos.length; i++) { await uploadPhoto(inspection.id, photos[i], `photo${i + 1}.jpg`, i + 1); }
      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const renderSwitchRow = (label: string, value: boolean, field: string) => (
    <View style={styles.switchRow}><Text style={styles.switchLabel}>{label}</Text><Switch value={value} onValueChange={(val) => updateFormData(field, val)} trackColor={{ false: '#d1d5db', true: '#93c5fd' }} thumbColor={value ? '#2563eb' : '#f3f4f6'} /></View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (<View><Text style={styles.sectionTitle}>बांधकाम प्रकल्प माहिती</Text><Text style={styles.sectionSubtitle}>Construction Project Information</Text><Input label="प्रकल्पाचे नाव / Project Name *" value={formData.project_name} onChangeText={(text) => updateFormData('project_name', text)} /><Input label="कंत्राटदाराचे नाव / Contractor Name" value={formData.contractor_name} onChangeText={(text) => updateFormData('contractor_name', text)} /><Input label="अंदाजे खर्च / Estimated Cost" value={formData.estimated_cost} onChangeText={(text) => updateFormData('estimated_cost', text)} keyboardType="numeric" /><Input label="कामाचा आदेश दिनांक / Work Order Date" value={formData.work_order_date} onChangeText={(text) => updateFormData('work_order_date', text)} placeholder="DD-MM-YYYY" /></View>);
      case 1: return (<View><Text style={styles.sectionTitle}>प्रगती / Progress</Text><Input label="पूर्ण झालेले % / Completion %" value={formData.completion_percentage} onChangeText={(text) => updateFormData('completion_percentage', text)} keyboardType="numeric" placeholder="0-100" /></View>);
      case 2: return (<View><Text style={styles.sectionTitle}>गुणवत्ता तपासणी / Quality Check</Text>{renderSwitchRow('गुणवत्ता समाधानकारक / Quality Satisfactory', formData.quality_satisfactory, 'quality_satisfactory')}{renderSwitchRow('साहित्य गुणवत्ता / Material Quality', formData.material_quality, 'material_quality')}{renderSwitchRow('कारागिरी / Workmanship', formData.workmanship_quality, 'workmanship_quality')}{renderSwitchRow('सुरक्षा उपाय / Safety Measures', formData.safety_measures, 'safety_measures')}<Input label="निरीक्षणे / Observations" value={formData.observations} onChangeText={(text) => updateFormData('observations', text)} multiline numberOfLines={4} /></View>);
      case 3: return (<View><Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text><LocationPicker location={location} onLocationChange={setLocation} /></View>);
      case 4: return (<View><Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text><PhotoUpload photos={photos} onPhotosChange={setPhotos} /></View>);
      default: return null;
    }
  };

  return (<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Stepper steps={STEPS} currentStep={currentStep} /><ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}><Card>{renderStep()}</Card></ScrollView><View style={styles.footer}><View style={styles.buttonRow}>{currentStep > 0 && <Button title={t('common.previous')} onPress={handlePrevious} variant="outline" style={styles.button} disabled={loading} />}{currentStep < STEPS.length - 1 ? <Button title={t('common.next')} onPress={handleNext} style={styles.button} disabled={loading} /> : <View style={styles.submitButtons}><Button title={t('fims.saveAsDraft')} onPress={handleSaveAsDraft} variant="outline" style={styles.halfButton} loading={loading} /><Button title={t('fims.submitInspection')} onPress={handleSubmit} style={styles.halfButton} loading={loading} /></View>}</View></View></KeyboardAvoidingView>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f3f4f6' }, content: { flex: 1 }, contentContainer: { padding: 16 }, sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 }, sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 }, switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, switchLabel: { fontSize: 14, color: '#374151', flex: 1 }, footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }, buttonRow: { flexDirection: 'row', justifyContent: 'space-between' }, button: { flex: 1, marginHorizontal: 4 }, submitButtons: { flexDirection: 'row', flex: 1 }, halfButton: { flex: 1, marginHorizontal: 4 } });
