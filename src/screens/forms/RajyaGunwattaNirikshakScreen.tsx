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

type RouteParams = RouteProp<FormsStackParamList, 'RajyaGunwattaNirikshak'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'RajyaGunwattaNirikshak'>;

const STEPS = ['Institution Info', 'Quality Standards', 'Compliance', 'Location', 'Photos'];

export default function RajyaGunwattaNirikshakScreen() {
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
    institution_name: '',
    head_name: '',
    quality_standards_met: false,
    documentation_complete: false,
    staff_trained: false,
    infrastructure_adequate: false,
    compliance_satisfactory: false,
    improvement_areas: '',
    recommendations: '',
  });

  const updateFormData = (field: string, value: any) => setFormData({ ...formData, [field]: value });
  const handleNext = () => { if (currentStep === 0 && !formData.institution_name) { Alert.alert(t('common.error'), 'Fill required'); return; } if (currentStep === 3 && !location) { Alert.alert(t('common.error'), 'Capture location'); return; } if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.head_name || user?.email || '', status: 'draft', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) { Alert.alert(t('common.error'), 'Add photo'); return; }
    try {
      setLoading(true);
      const inspection = await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.head_name || user?.email || '', status: 'submitted', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
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
      case 0: return (<View><Text style={styles.sectionTitle}>राज्य गुणवत्ता निरीक्षक</Text><Text style={styles.sectionSubtitle}>State Quality Inspector</Text><Input label="संस्थेचे नाव / Institution Name *" value={formData.institution_name} onChangeText={(text) => updateFormData('institution_name', text)} /><Input label="प्रमुख / Head Name" value={formData.head_name} onChangeText={(text) => updateFormData('head_name', text)} /></View>);
      case 1: return (<View><Text style={styles.sectionTitle}>गुणवत्ता मानके / Quality Standards</Text>{renderSwitchRow('गुणवत्ता मानके पूर्ण / Quality Standards Met', formData.quality_standards_met, 'quality_standards_met')}{renderSwitchRow('दस्तऐवजीकरण / Documentation Complete', formData.documentation_complete, 'documentation_complete')}{renderSwitchRow('प्रशिक्षित कर्मचारी / Staff Trained', formData.staff_trained, 'staff_trained')}{renderSwitchRow('पायाभूत सुविधा / Infrastructure Adequate', formData.infrastructure_adequate, 'infrastructure_adequate')}</View>);
      case 2: return (<View><Text style={styles.sectionTitle}>अनुपालन / Compliance</Text>{renderSwitchRow('अनुपालन समाधानकारक / Compliance Satisfactory', formData.compliance_satisfactory, 'compliance_satisfactory')}<Input label="सुधारणा क्षेत्र / Improvement Areas" value={formData.improvement_areas} onChangeText={(text) => updateFormData('improvement_areas', text)} multiline numberOfLines={3} /><Input label="शिफारसी / Recommendations" value={formData.recommendations} onChangeText={(text) => updateFormData('recommendations', text)} multiline numberOfLines={3} /></View>);
      case 3: return (<View><Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text><LocationPicker location={location} onLocationChange={setLocation} /></View>);
      case 4: return (<View><Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text><PhotoUpload photos={photos} onPhotosChange={setPhotos} /></View>);
      default: return null;
    }
  };

  return (<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Stepper steps={STEPS} currentStep={currentStep} /><ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}><Card>{renderStep()}</Card></ScrollView><View style={styles.footer}><View style={styles.buttonRow}>{currentStep > 0 && <Button title={t('common.previous')} onPress={handlePrevious} variant="outline" style={styles.button} disabled={loading} />}{currentStep < STEPS.length - 1 ? <Button title={t('common.next')} onPress={handleNext} style={styles.button} disabled={loading} /> : <View style={styles.submitButtons}><Button title={t('fims.saveAsDraft')} onPress={handleSaveAsDraft} variant="outline" style={styles.halfButton} loading={loading} /><Button title={t('fims.submitInspection')} onPress={handleSubmit} style={styles.halfButton} loading={loading} /></View>}</View></View></KeyboardAvoidingView>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f3f4f6' }, content: { flex: 1 }, contentContainer: { padding: 16 }, sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 }, sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 }, switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, switchLabel: { fontSize: 14, color: '#374151', flex: 1 }, footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }, buttonRow: { flexDirection: 'row', justifyContent: 'space-between' }, button: { flex: 1, marginHorizontal: 4 }, submitButtons: { flexDirection: 'row', flex: 1 }, halfButton: { flex: 1, marginHorizontal: 4 } });
