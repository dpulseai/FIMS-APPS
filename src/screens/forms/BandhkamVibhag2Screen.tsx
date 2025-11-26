import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto, getInspectionById, updateInspection } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
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
  const { categoryId, inspectionId, edit } = route.params as { categoryId: string; inspectionId?: string; edit?: boolean };
  const [currentStep, setCurrentStep] = useState(0);
  // Today's date for inspection_date (YYYY-MM-DD)
  const todayIso = new Date().toISOString().slice(0, 10);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photoMetas, setPhotoMetas] = useState<Array<{ latitude?: number; longitude?: number; accuracy?: number; address?: string }>>([]);
  const [photoIds, setPhotoIds] = useState<Array<string | undefined>>([]);
  const [photoUrlToId, setPhotoUrlToId] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(() => Boolean(edit) || Boolean(inspectionId));
  const [workQualityModalVisible, setWorkQualityModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    inspection_date: todayIso,
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
      if (isEditMode && inspectionId) {
        await updateInspection(inspectionId, {
          status: 'draft',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
          filled_by_name: formData.contractor || user?.email || '',
        });
      } else {
        await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: formData.contractor || user?.email || '',
          status: 'draft',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
      }
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

      // Step 1: Create or update the inspection
      let inspection: any = null;
      if (isEditMode && inspectionId) {
        inspection = await updateInspection(inspectionId, {
          status: 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
          filled_by_name: user?.email || '',
        });
        if (!inspection) {
          Alert.alert(t('common.error'), 'Failed to update inspection.');
          return;
        }
      } else {
        inspection = await createInspection({
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
      }

      console.log('Inspection (create/update) result:', inspection);

      // Step 3: persist form data to fims_inspections.form_data and bandhakam_vibhag2
      try {
        // update fims_inspections.form_data so web UI can read the values
        const { data: fdData, error: fdError } = await supabase
          .from('fims_inspections')
          .update({ form_data: formData })
          .eq('id', inspection.id)
          .select()
          .single();
        if (fdError) {
          console.warn('Could not update fims_inspections.form_data', fdError);
        } else {
          console.log('Updated fims_inspections.form_data for', inspection.id, fdData?.id);
        }

        // Build officers array
        const officersArray = [
          formData.officer_1_name && formData.officer_1_designation ? { name: formData.officer_1_name, designation: formData.officer_1_designation } : null,
          formData.officer_2_name && formData.officer_2_designation ? { name: formData.officer_2_name, designation: formData.officer_2_designation } : null,
          formData.officer_3_name && formData.officer_3_designation ? { name: formData.officer_3_name, designation: formData.officer_3_designation } : null,
          formData.officer_4_name && formData.officer_4_designation ? { name: formData.officer_4_name, designation: formData.officer_4_designation } : null,
        ].filter((o) => o !== null);

        const inspectorDetails = {
          name: formData.inspector_name || '',
          designation: formData.inspector_designation || '',
        };

        // Ensure NOT NULL fields are at least empty strings (DB expects NOT NULL)
        const payload: any = {
          inspection_id: inspection.id,
          inspection_date: formData.inspection_date || todayIso,
          officers: officersArray,
          current_work_status: formData.current_work_status || '',
          work_quality: formData.work_quality || '',
          liability_period: formData.liability_period || '',
          report_work_name: formData.work_name || '',
          detailed_report: formData.inspection_report || '',
          Inspector_details: JSON.stringify(inspectorDetails),
          location_details: location?.address || null,
          Present_Officers: officersArray.map((o: any) => o.name).filter(Boolean).join(', ')
        };

        console.log('bandhakam_vibhag2 payload:', payload);

        // Check if a row already exists for this inspection_id
        const { data: existingRow, error: selectErr } = await supabase
          .from('bandhakam_vibhag2')
          .select('id')
          .eq('inspection_id', inspection.id)
          .maybeSingle();

        if (selectErr) {
          console.warn('Error checking existing bandhakam_vibhag2 row:', selectErr);
        }

        let dbRes: any = null;
        if (existingRow && existingRow.id) {
          // update: use .select() (array) to avoid .single() errors when multiple rows exist
          const { data: updateData, error: updateErr } = await supabase
            .from('bandhakam_vibhag2')
            .update(payload)
            .eq('inspection_id', inspection.id)
            .select();

          if (updateErr) {
            dbRes = { data: null, error: updateErr };
          } else if (Array.isArray(updateData) && updateData.length > 0) {
            // use first row
            dbRes = { data: updateData[0], error: null };
          } else {
            // no rows updated (perhaps duplicate/missing) — fall back to insert
            console.warn('Update affected 0 rows, falling back to insert');
            const { data: insertData, error: insertErr } = await supabase
              .from('bandhakam_vibhag2')
              .insert(payload)
              .select();
            if (insertErr) dbRes = { data: null, error: insertErr };
            else dbRes = { data: Array.isArray(insertData) && insertData.length > 0 ? insertData[0] : insertData, error: null };
          }
        } else {
          // insert
          const { data: insertData, error: insertErr } = await supabase
            .from('bandhakam_vibhag2')
            .insert(payload)
            .select();
          if (insertErr) dbRes = { data: null, error: insertErr };
          else dbRes = { data: Array.isArray(insertData) && insertData.length > 0 ? insertData[0] : insertData, error: null };
        }

        if (dbRes.error) {
          console.error('bandhakam_vibhag2 db error:', dbRes.error);
          Alert.alert(t('common.error'), `Failed to save form data: ${dbRes.error.message || JSON.stringify(dbRes.error)}`);
          return;
        }

        console.log('bandhakam_vibhag2 saved:', dbRes.data);
      } catch (err) {
        console.warn('Error saving bandhakam_vibhag2 data', err);
        Alert.alert(t('common.error'), `Failed to save bandhakam form: ${String(err)}`);
        return;
      }

      // Step 4: Upload photos
      for (let i = 0; i < photos.length; i++) {
        console.log(`Uploading photo ${i + 1}...`);
        try {
          const uri = photos[i];
          const meta = photoMetas && photoMetas[i] ? photoMetas[i] : undefined;

          // If photo is already a remote URL (previously uploaded), don't attempt re-upload.
          // Instead update its DB row description if we have the photo id.
          const isRemote = typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://'));
          const existingId = photoIds && photoIds[i];
          if (isRemote) {
            if (existingId) {
              // update description with photo meta
              try {
                const desc = meta ? JSON.stringify({ photo_location: meta }) : null;
                const { error: updErr } = await supabase
                  .from('fims_inspection_photos')
                  .update({ description: desc })
                  .eq('id', existingId);
                if (updErr) console.warn('Could not update existing photo description', updErr);
              } catch (e) {
                console.warn('Failed updating photo description for existing remote photo', e);
              }
            } else {
              console.log('Skipping remote photo without DB id:', uri);
            }
            continue;
          }

          // Local photo: upload to storage then insert photo row
          await uploadPhoto(inspection.id, uri, `photo${i + 1}.jpg`, i + 1, meta);
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
            <DateInput
              label="तपासणी दिनांक"
              value={formData.inspection_date}
              onChangeDate={(date) => setFormData({ ...formData, inspection_date: date })}
              minimumDate={new Date(todayIso)}
              maximumDate={new Date(todayIso)}
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
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>कामाचा दर्जा (उत्तम/चांगला/साधारण/वाईट)</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setWorkQualityModalVisible(true)}
              >
                <Text style={formData.work_quality ? styles.selectText : styles.selectPlaceholder}>
                  {formData.work_quality || 'दर्जा निवडा'}
                </Text>
              </TouchableOpacity>

              <Modal
                visible={workQualityModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setWorkQualityModalVisible(false)}
              >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setWorkQualityModalVisible(false)}>
                  <View style={styles.modalContent}>
                    {['उत्तम', 'चांगला', 'साधारण', 'वाईट'].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.optionItem}
                        onPress={() => {
                          setFormData({ ...formData, work_quality: opt });
                          setWorkQualityModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
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
            <PhotoUpload
              photos={photos}
              onPhotosChange={(newPhotos) => handlePhotosChange(newPhotos)}
              photoMetas={photoMetas}
              onPhotoMetaChange={setPhotoMetas}
            />
          </View>
        );
      default:
        return null;
    }
  };

  // Load inspection and bandhakam_vibhag2 form when editing
  React.useEffect(() => {
    if (!isEditMode || !inspectionId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const insp = await getInspectionById(inspectionId);
        if (cancelled) return;
          if (insp) {
          if (insp.location_latitude && insp.location_longitude) {
            setLocation({ latitude: insp.location_latitude, longitude: insp.location_longitude, accuracy: null, address: insp.location_address || null, timestamp: Date.now() });
          }
          if (Array.isArray(insp.photos) && insp.photos.length > 0) {
              const urls = insp.photos.map((p: any) => p.photo_url);
              setPhotos(urls);
              // attempt to parse photo metas
              const metas = insp.photos.map((p: any) => {
                try {
                  const d = p.description;
                  if (!d) return {};
                  const parsed = typeof d === 'string' ? JSON.parse(d) : d;
                  return parsed.photo_location || {};
                } catch (e) {
                  return {};
                }
              });
              setPhotoMetas(metas as any);
              // build id map and ids array so we can update existing photo rows later
              const urlToId: Record<string, string> = {};
              const ids: Array<string | undefined> = [];
              insp.photos.forEach((p: any) => {
                if (p && p.photo_url) {
                  urlToId[p.photo_url] = p.id;
                }
              });
              urls.forEach((u: string) => ids.push(urlToId[u]));
              setPhotoUrlToId(urlToId);
              setPhotoIds(ids);
          }
        }

        // load bandhakam_vibhag2 row if present
        try {
          const { data: row, error } = await supabase.from('bandhakam_vibhag2').select('*').eq('inspection_id', inspectionId).maybeSingle();
          if (!error && row) {
            // map row fields into formData
            const newForm: any = { ...formData };
            newForm.inspection_date = row.inspection_date ? row.inspection_date.slice(0,10) : newForm.inspection_date;
            newForm.current_work_status = row.current_work_status || '';
            newForm.work_quality = row.work_quality || '';
            newForm.liability_period = row.liability_period || '';
            newForm.work_name = row.report_work_name || '';
            newForm.inspection_report = row.detailed_report || '';
            // parse officers array into individual fields
            if (Array.isArray(row.officers)) {
              (row.officers as any[]).forEach((o: any, idx: number) => {
                const n = idx + 1;
                newForm[`officer_${n}_name`] = o?.name || '';
                newForm[`officer_${n}_designation`] = o?.designation || '';
              });
            }
            // inspector details may be JSON/string
            try {
              const insp = row.Inspector_details ? (typeof row.Inspector_details === 'string' ? JSON.parse(row.Inspector_details) : row.Inspector_details) : null;
              if (insp) {
                newForm.inspector_name = insp.name || '';
                newForm.inspector_designation = insp.designation || '';
              }
            } catch (e) {
              // ignore
            }

            setFormData(newForm);
          }
        } catch (e) {
          console.warn('Could not load bandhakam_vibhag2 row', e);
        }
      } catch (e) {
        console.warn('Error loading inspection for edit', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [isEditMode, inspectionId]);

  // Keep photoIds in sync when photos array changes (PhotoUpload calls onPhotosChange)
  const handlePhotosChange = (newPhotos: string[]) => {
    // build new mapping for ids based on known url->id map
    const newIds = newPhotos.map((p) => {
      if (photoUrlToId[p]) return photoUrlToId[p];
      return undefined;
    });
    setPhotos(newPhotos);
    setPhotoIds(newIds);
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
  selectInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  selectText: { fontSize: 16, color: '#1f2937' },
  selectPlaceholder: { fontSize: 16, color: '#9ca3af' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionText: { fontSize: 16, color: '#111827' },
});
