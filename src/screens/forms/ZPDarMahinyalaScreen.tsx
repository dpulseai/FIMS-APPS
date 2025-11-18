import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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

type RouteParams = RouteProp<FormsStackParamList, 'ZPDarMahinyala'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'ZPDarMahinyala'>;

const STEPS = ['Report Details', 'Work Progress', 'Location', 'Photos'];

export default function ZPDarMahinyalaScreen() {
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
    month: '',
    year: '',
    department: '',
    officer_name: '',
    works_completed: '',
    works_in_progress: '',
    budget_utilized: '',
    pending_issues: '',
    achievements: '',
    challenges: '',
    next_month_plan: '',
  });

  const updateFormData = (field: string, value: any) => setFormData({ ...formData, [field]: value });
  const handleNext = () => { if (currentStep === 0 && (!formData.month || !formData.department)) { Alert.alert(t('common.error'), 'Fill required'); return; } if (currentStep === 2 && !location) { Alert.alert(t('common.error'), 'Capture location'); return; } if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.officer_name || user?.email || '', status: 'draft', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) { Alert.alert(t('common.error'), 'Add photo'); return; }
    try {
      setLoading(true);
      const inspection = await createInspection({ category_id: categoryId, inspector_id: user?.id, filled_by_name: formData.officer_name || user?.email || '', status: 'submitted', location_latitude: location?.latitude, location_longitude: location?.longitude, location_address: location?.address || null });
      for (let i = 0; i < photos.length; i++) { await uploadPhoto(inspection.id, photos[i], `photo${i + 1}.jpg`, i + 1); }
      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) { Alert.alert(t('common.error'), 'Failed'); } finally { setLoading(false); }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (<View><Text style={styles.sectionTitle}>झ.प. दरमहिन्याला सादर कार्याचे प्रपत्र</Text><Text style={styles.sectionSubtitle}>ZP Monthly Work Report</Text><Input label="महिना / Month *" value={formData.month} onChangeText={(text) => updateFormData('month', text)} placeholder="January, February..." /><Input label="वर्ष / Year" value={formData.year} onChangeText={(text) => updateFormData('year', text)} placeholder="2025" keyboardType="numeric" /><Input label="विभाग / Department *" value={formData.department} onChangeText={(text) => updateFormData('department', text)} /><Input label="अधिकारी / Officer Name" value={formData.officer_name} onChangeText={(text) => updateFormData('officer_name', text)} /></View>);
      case 1: return (<View><Text style={styles.sectionTitle}>कामाची प्रगती / Work Progress</Text><Input label="पूर्ण कामे / Works Completed" value={formData.works_completed} onChangeText={(text) => updateFormData('works_completed', text)} keyboardType="numeric" /><Input label="प्रगतीपथावर / Works In Progress" value={formData.works_in_progress} onChangeText={(text) => updateFormData('works_in_progress', text)} keyboardType="numeric" /><Input label="बजेट वापर / Budget Utilized %" value={formData.budget_utilized} onChangeText={(text) => updateFormData('budget_utilized', text)} keyboardType="numeric" /><Input label="प्रलंबित मुद्दे / Pending Issues" value={formData.pending_issues} onChangeText={(text) => updateFormData('pending_issues', text)} multiline numberOfLines={3} /><Input label="उपलब्धी / Achievements" value={formData.achievements} onChangeText={(text) => updateFormData('achievements', text)} multiline numberOfLines={3} /><Input label="आव्हाने / Challenges" value={formData.challenges} onChangeText={(text) => updateFormData('challenges', text)} multiline numberOfLines={3} /><Input label="पुढील महिना योजना / Next Month Plan" value={formData.next_month_plan} onChangeText={(text) => updateFormData('next_month_plan', text)} multiline numberOfLines={3} /></View>);
      case 2: return (<View><Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text><LocationPicker location={location} onLocationChange={setLocation} /></View>);
      case 3: return (<View><Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text><PhotoUpload photos={photos} onPhotosChange={setPhotos} /></View>);
      default: return null;
    }
  };

  return (<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Stepper steps={STEPS} currentStep={currentStep} /><ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}><Card>{renderStep()}</Card></ScrollView><View style={styles.footer}><View style={styles.buttonRow}>{currentStep > 0 && <Button title={t('common.previous')} onPress={handlePrevious} variant="outline" style={styles.button} disabled={loading} />}{currentStep < STEPS.length - 1 ? <Button title={t('common.next')} onPress={handleNext} style={styles.button} disabled={loading} /> : <View style={styles.submitButtons}><Button title={t('fims.saveAsDraft')} onPress={handleSaveAsDraft} variant="outline" style={styles.halfButton} loading={loading} /><Button title={t('fims.submitInspection')} onPress={handleSubmit} style={styles.halfButton} loading={loading} /></View>}</View></View></KeyboardAvoidingView>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f3f4f6' }, content: { flex: 1 }, contentContainer: { padding: 16 }, sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 }, sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 }, footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }, buttonRow: { flexDirection: 'row', justifyContent: 'space-between' }, button: { flex: 1, marginHorizontal: 4 }, submitButtons: { flexDirection: 'row', flex: 1 }, halfButton: { flex: 1, marginHorizontal: 4 } });
