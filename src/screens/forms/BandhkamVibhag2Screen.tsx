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

const STEPS = ['Work Details', 'Inspection', 'Location', 'Photos'];

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
  const [formData, setFormData] = useState({ work_name: '', contractor: '', approved_plan: false, structural_safety: false, on_schedule: false, remarks: '' });

  const handleNext = () => { if (currentStep === 0 && !formData.work_name) { Alert.alert(t('common.error'), 'Fill required'); return; } if (currentStep === 2 && !location) { Alert.alert(t('common.error'), 'Capture location'); return; } if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.contractor || user?.email || '', status: 'draft', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) { Alert.alert(t('common.error'), 'Add photo'); return; }
    try {
      setLoading(true);
      const inspection = await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.contractor || user?.email || '', status: 'submitted', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      for (let i = 0; i < photos.length; i++) { await uploadPhoto(inspection.id, photos[i], `photo${i + 1}.jpg`, i + 1); }
      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (<View><Text style={styles.title}>बांधकाम कामाचे तपशील</Text><Input label="Work Name *" value={formData.work_name} onChangeText={(text) => setFormData({...formData, work_name: text})} /><Input label="Contractor" value={formData.contractor} onChangeText={(text) => setFormData({...formData, contractor: text})} /></View>);
      case 1: return (<View><Text style={styles.title}>Inspection</Text><View style={styles.row}><Text>Approved Plan</Text><Switch value={formData.approved_plan} onValueChange={(val) => setFormData({...formData, approved_plan: val})} /></View><View style={styles.row}><Text>Structural Safety</Text><Switch value={formData.structural_safety} onValueChange={(val) => setFormData({...formData, structural_safety: val})} /></View><View style={styles.row}><Text>On Schedule</Text><Switch value={formData.on_schedule} onValueChange={(val) => setFormData({...formData, on_schedule: val})} /></View><Input label="Remarks" value={formData.remarks} onChangeText={(text) => setFormData({...formData, remarks: text})} multiline /></View>);
      case 2: return (<View><Text style={styles.title}>{t('fims.locationDetails')}</Text><LocationPicker location={location} onLocationChange={setLocation} /></View>);
      case 3: return (<View><Text style={styles.title}>{t('fims.photosSubmit')}</Text><PhotoUpload photos={photos} onPhotosChange={setPhotos} /></View>);
      default: return null;
    }
  };

  return (<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Stepper steps={STEPS} currentStep={currentStep} /><ScrollView style={styles.content}><Card>{renderStep()}</Card></ScrollView><View style={styles.footer}><View style={styles.buttonRow}>{currentStep > 0 && <Button title={t('common.previous')} onPress={handlePrevious} variant="outline" style={styles.button} disabled={loading} />}{currentStep < STEPS.length - 1 ? <Button title={t('common.next')} onPress={handleNext} style={styles.button} disabled={loading} /> : <View style={styles.submitButtons}><Button title={t('fims.saveAsDraft')} onPress={handleSaveAsDraft} variant="outline" style={styles.halfButton} loading={loading} /><Button title={t('fims.submitInspection')} onPress={handleSubmit} style={styles.halfButton} loading={loading} /></View>}</View></View></KeyboardAvoidingView>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f3f4f6' }, content: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 }, row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }, buttonRow: { flexDirection: 'row', justifyContent: 'space-between' }, button: { flex: 1, marginHorizontal: 4 }, submitButtons: { flexDirection: 'row', flex: 1 }, halfButton: { flex: 1, marginHorizontal: 4 } });
