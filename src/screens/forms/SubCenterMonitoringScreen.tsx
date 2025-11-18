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

type RouteParams = RouteProp<FormsStackParamList, 'SubCenterMonitoring'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'SubCenterMonitoring'>;

const STEPS = ['Center Info', 'Services', 'Records', 'Location', 'Photos'];

export default function SubCenterMonitoringScreen() {
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
    center_name: '',
    anm_name: '',
    staff_present: '',
    immunization_conducted: false,
    anc_checkups: false,
    pnc_visits: false,
    family_planning: false,
    records_updated: false,
    observations: '',
  });

  const handleNext = () => {
    if (currentStep === 0 && !formData.center_name) { Alert.alert(t('common.error'), 'Fill required fields'); return; }
    if (currentStep === 3 && !location) { Alert.alert(t('common.error'), 'Capture location'); return; }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.anm_name || user?.email || '', status: 'draft', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) { Alert.alert(t('common.error'), 'Add photo'); return; }
    try {
      setLoading(true);
      const inspection = await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.anm_name || user?.email || '', status: 'submitted', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      for (let i = 0; i < photos.length; i++) { await uploadPhoto(inspection.id, photos[i], `photo_${i + 1}.jpg`, i + 1); }
      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (<View><Text style={styles.title}>उपकेंद्र माहिती</Text><Input label="Center Name *" value={formData.center_name} onChangeText={(text) => setFormData({...formData, center_name: text})} /><Input label="ANM Name" value={formData.anm_name} onChangeText={(text) => setFormData({...formData, anm_name: text})} /><Input label="Staff Present" value={formData.staff_present} onChangeText={(text) => setFormData({...formData, staff_present: text})} /></View>);
      case 1: return (<View><Text style={styles.title}>Services</Text><View style={styles.row}><Text style={styles.label}>Immunization</Text><Switch value={formData.immunization_conducted} onValueChange={(val) => setFormData({...formData, immunization_conducted: val})} /></View><View style={styles.row}><Text style={styles.label}>ANC Checkups</Text><Switch value={formData.anc_checkups} onValueChange={(val) => setFormData({...formData, anc_checkups: val})} /></View><View style={styles.row}><Text style={styles.label}>PNC Visits</Text><Switch value={formData.pnc_visits} onValueChange={(val) => setFormData({...formData, pnc_visits: val})} /></View></View>);
      case 2: return (<View><Text style={styles.title}>Records</Text><View style={styles.row}><Text style={styles.label}>Family Planning</Text><Switch value={formData.family_planning} onValueChange={(val) => setFormData({...formData, family_planning: val})} /></View><View style={styles.row}><Text style={styles.label}>Records Updated</Text><Switch value={formData.records_updated} onValueChange={(val) => setFormData({...formData, records_updated: val})} /></View><Input label="Observations" value={formData.observations} onChangeText={(text) => setFormData({...formData, observations: text})} multiline numberOfLines={4} /></View>);
      case 3: return (<View><Text style={styles.title}>{t('fims.locationDetails')}</Text><LocationPicker location={location} onLocationChange={setLocation} /></View>);
      case 4: return (<View><Text style={styles.title}>{t('fims.photosSubmit')}</Text><PhotoUpload photos={photos} onPhotosChange={setPhotos} /></View>);
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stepper steps={STEPS} currentStep={currentStep} />
      <ScrollView style={styles.content}><Card>{renderStep()}</Card></ScrollView>
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && <Button title={t('common.previous')} onPress={handlePrevious} variant="outline" style={styles.button} disabled={loading} />}
          {currentStep < STEPS.length - 1 ? <Button title={t('common.next')} onPress={handleNext} style={styles.button} disabled={loading} /> : <View style={styles.submitButtons}><Button title={t('fims.saveAsDraft')} onPress={handleSaveAsDraft} variant="outline" style={styles.halfButton} loading={loading} /><Button title={t('fims.submitInspection')} onPress={handleSubmit} style={styles.halfButton} loading={loading} /></View>}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  label: { fontSize: 14, color: '#374151' },
  footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 4 },
  submitButtons: { flexDirection: 'row', flex: 1 },
  halfButton: { flex: 1, marginHorizontal: 4 },
});
