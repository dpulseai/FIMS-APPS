import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, updateInspection, uploadPhoto, saveMumbaiHighCourtForm } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'MumbaiNyayalay'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'MumbaiNyayalay'>;

const STEPS = [
  'Basic Info',
  'Location',
  'Inspection Part 1',
  'Inspection Part 2',
  'Inspection Part 3',
  'Photos'
];

export default function MumbaiNyayalayScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId, inspectionId, edit } = route.params as { categoryId: string; inspectionId?: string; edit?: boolean };
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isEditMode] = useState<boolean>(() => Boolean(edit) || !inspectionId);
  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(inspectionId || null);

  // Basic Information
  const [inspectionDate, setInspectionDate] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [talukaName, setTalukaName] = useState('');
  const [centerName, setCenterName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [managementName, setManagementName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [udiseNumber, setUdiseNumber] = useState('');

  // Student and Teacher Data
  const [totalBoys, setTotalBoys] = useState('0');
  const [totalGirls, setTotalGirls] = useState('0');
  const [totalStudents, setTotalStudents] = useState('0');
  const [sanctionedTeachers, setSanctionedTeachers] = useState('0');
  const [workingTeachers, setWorkingTeachers] = useState('0');
  const [vacantTeachers, setVacantTeachers] = useState('0');
  const [sanctionedNonTeaching, setSanctionedNonTeaching] = useState('0');
  const [workingNonTeaching, setWorkingNonTeaching] = useState('0');
  const [vacantNonTeaching, setVacantNonTeaching] = useState('0');

  // 16 Inspection Points - each with status, measures, and feedback
  // 1. Building Construction Year
  const [buildingConstructionYearStatus, setBuildingConstructionYearStatus] = useState('');
  const [buildingConstructionYearMeasures, setBuildingConstructionYearMeasures] = useState('');
  const [buildingConstructionYearFeedback, setBuildingConstructionYearFeedback] = useState('');

  // 2. Building Type Structure
  const [buildingTypeStructureStatus, setBuildingTypeStructureStatus] = useState('');
  const [buildingTypeStructureMeasures, setBuildingTypeStructureMeasures] = useState('');
  const [buildingTypeStructureFeedback, setBuildingTypeStructureFeedback] = useState('');

  // 3. Classrooms Adequate
  const [classroomsAdequateStatus, setClassroomsAdequateStatus] = useState('');
  const [classroomsAdequateMeasures, setClassroomsAdequateMeasures] = useState('');
  const [classroomsAdequateFeedback, setClassroomsAdequateFeedback] = useState('');

  // 4. Separate Toilets
  const [separateToiletsStatus, setSeparateToiletsStatus] = useState('');
  const [separateToiletsMeasures, setSeparateToiletsMeasures] = useState('');
  const [separateToiletsFeedback, setSeparateToiletsFeedback] = useState('');

  // 5. CWSN Toilets
  const [cwsnToiletsStatus, setCwsnToiletsStatus] = useState('');
  const [cwsnToiletsMeasures, setCwsnToiletsMeasures] = useState('');
  const [cwsnToiletsFeedback, setCwsnToiletsFeedback] = useState('');

  // 6. Drinking Water
  const [drinkingWaterStatus, setDrinkingWaterStatus] = useState('');
  const [drinkingWaterMeasures, setDrinkingWaterMeasures] = useState('');
  const [drinkingWaterFeedback, setDrinkingWaterFeedback] = useState('');

  // 7. Boundary Wall
  const [boundaryWallStatus, setBoundaryWallStatus] = useState('');
  const [boundaryWallMeasures, setBoundaryWallMeasures] = useState('');
  const [boundaryWallFeedback, setBoundaryWallFeedback] = useState('');

  // 8. Playground
  const [playgroundStatus, setPlaygroundStatus] = useState('');
  const [playgroundMeasures, setPlaygroundMeasures] = useState('');
  const [playgroundFeedback, setPlaygroundFeedback] = useState('');

  // 9. Kitchen Shed
  const [kitchenShedStatus, setKitchenShedStatus] = useState('');
  const [kitchenShedMeasures, setKitchenShedMeasures] = useState('');
  const [kitchenShedFeedback, setKitchenShedFeedback] = useState('');

  // 10. Ramp Facility
  const [rampFacilityStatus, setRampFacilityStatus] = useState('');
  const [rampFacilityMeasures, setRampFacilityMeasures] = useState('');
  const [rampFacilityFeedback, setRampFacilityFeedback] = useState('');

  // 11. Electricity
  const [electricityStatus, setElectricityStatus] = useState('');
  const [electricityMeasures, setElectricityMeasures] = useState('');
  const [electricityFeedback, setElectricityFeedback] = useState('');

  // 12. Seating Arrangement
  const [seatingArrangementStatus, setSeatingArrangementStatus] = useState('');
  const [seatingArrangementMeasures, setSeatingArrangementMeasures] = useState('');
  const [seatingArrangementFeedback, setSeatingArrangementFeedback] = useState('');

  // 13. Cleanliness
  const [cleanlinessStatus, setCleanlinessStatus] = useState('');
  const [cleanlinessMeasures, setCleanlinessMeasures] = useState('');
  const [cleanlinessFeedback, setCleanlinessFeedback] = useState('');

  // 14. Illegal Use
  const [illegalUseStatus, setIllegalUseStatus] = useState('');
  const [illegalUseMeasures, setIllegalUseMeasures] = useState('');
  const [illegalUseFeedback, setIllegalUseFeedback] = useState('');

  // 15. Encroachment
  const [encroachmentStatus, setEncroachmentStatus] = useState('');
  const [encroachmentMeasures, setEncroachmentMeasures] = useState('');
  const [encroachmentFeedback, setEncroachmentFeedback] = useState('');

  // 16. Notable Work
  const [notableWorkStatus, setNotableWorkStatus] = useState('');
  const [notableWorkMeasures, setNotableWorkMeasures] = useState('');
  const [notableWorkFeedback, setNotableWorkFeedback] = useState('');

  // Inspector Information
  const [inspectorName, setInspectorName] = useState('');
  const [inspectorDesignation, setInspectorDesignation] = useState('');

  // Auto-calculate total students
  useEffect(() => {
    const boys = parseInt(totalBoys) || 0;
    const girls = parseInt(totalGirls) || 0;
    setTotalStudents((boys + girls).toString());
  }, [totalBoys, totalGirls]);

  // Auto-calculate vacant positions
  useEffect(() => {
    const sanctioned = parseInt(sanctionedTeachers) || 0;
    const working = parseInt(workingTeachers) || 0;
    setVacantTeachers(Math.max(0, sanctioned - working).toString());
  }, [sanctionedTeachers, workingTeachers]);

  useEffect(() => {
    const sanctioned = parseInt(sanctionedNonTeaching) || 0;
    const working = parseInt(workingNonTeaching) || 0;
    setVacantNonTeaching(Math.max(0, sanctioned - working).toString());
  }, [sanctionedNonTeaching, workingNonTeaching]);

  // Load existing inspection data
  useEffect(() => {
    if (inspectionId) {
      loadInspectionData();
    }
  }, [inspectionId]);

  const loadInspectionData = async () => {
    try {
      setLoading(true);
      const { data: inspection, error } = await supabase
        .from('fims_inspections')
        .select('*, fims_inspection_photos(*)')
        .eq('id', inspectionId)
        .single();

      if (error) throw error;

      if (inspection) {
        // Load basic data
        if (inspection.location_latitude && inspection.location_longitude) {
          setLocation({
            latitude: inspection.location_latitude,
            longitude: inspection.location_longitude,
            address: inspection.location_address || '',
            accuracy: inspection.location_accuracy || null,
            timestamp: Date.now()
          });
        }

        // Load form data
        const formData = inspection.form_data || {};
        setInspectionDate(formData.inspection_date || '');
        setDistrictName(formData.district_name || '');
        setTalukaName(formData.taluka_name || '');
        setCenterName(formData.center_name || '');
        setSchoolName(formData.school_name || '');
        setManagementName(formData.management_name || '');
        setPrincipalName(formData.principal_name || '');
        setUdiseNumber(formData.udise_number || '');

        // Student and teacher data
        setTotalBoys((formData.total_boys || 0).toString());
        setTotalGirls((formData.total_girls || 0).toString());
        setTotalStudents((formData.total_students || 0).toString());
        setSanctionedTeachers((formData.sanctioned_teachers || 0).toString());
        setWorkingTeachers((formData.working_teachers || 0).toString());
        setVacantTeachers((formData.vacant_teachers || 0).toString());
        setSanctionedNonTeaching((formData.sanctioned_non_teaching || 0).toString());
        setWorkingNonTeaching((formData.working_non_teaching || 0).toString());
        setVacantNonTeaching((formData.vacant_non_teaching || 0).toString());

        // Inspection points
        setBuildingConstructionYearStatus(formData.building_construction_year_status || '');
        setBuildingConstructionYearMeasures(formData.building_construction_year_measures || '');
        setBuildingConstructionYearFeedback(formData.building_construction_year_feedback || '');

        setBuildingTypeStructureStatus(formData.building_type_structure_status || '');
        setBuildingTypeStructureMeasures(formData.building_type_structure_measures || '');
        setBuildingTypeStructureFeedback(formData.building_type_structure_feedback || '');

        setClassroomsAdequateStatus(formData.classrooms_adequate_status || '');
        setClassroomsAdequateMeasures(formData.classrooms_adequate_measures || '');
        setClassroomsAdequateFeedback(formData.classrooms_adequate_feedback || '');

        setSeparateToiletsStatus(formData.separate_toilets_status || '');
        setSeparateToiletsMeasures(formData.separate_toilets_measures || '');
        setSeparateToiletsFeedback(formData.separate_toilets_feedback || '');

        setCwsnToiletsStatus(formData.cwsn_toilets_status || '');
        setCwsnToiletsMeasures(formData.cwsn_toilets_measures || '');
        setCwsnToiletsFeedback(formData.cwsn_toilets_feedback || '');

        setDrinkingWaterStatus(formData.drinking_water_status || '');
        setDrinkingWaterMeasures(formData.drinking_water_measures || '');
        setDrinkingWaterFeedback(formData.drinking_water_feedback || '');

        setBoundaryWallStatus(formData.boundary_wall_status || '');
        setBoundaryWallMeasures(formData.boundary_wall_measures || '');
        setBoundaryWallFeedback(formData.boundary_wall_feedback || '');

        setPlaygroundStatus(formData.playground_status || '');
        setPlaygroundMeasures(formData.playground_measures || '');
        setPlaygroundFeedback(formData.playground_feedback || '');

        setKitchenShedStatus(formData.kitchen_shed_status || '');
        setKitchenShedMeasures(formData.kitchen_shed_measures || '');
        setKitchenShedFeedback(formData.kitchen_shed_feedback || '');

        setRampFacilityStatus(formData.ramp_facility_status || '');
        setRampFacilityMeasures(formData.ramp_facility_measures || '');
        setRampFacilityFeedback(formData.ramp_facility_feedback || '');

        setElectricityStatus(formData.electricity_status || '');
        setElectricityMeasures(formData.electricity_measures || '');
        setElectricityFeedback(formData.electricity_feedback || '');

        setSeatingArrangementStatus(formData.seating_arrangement_status || '');
        setSeatingArrangementMeasures(formData.seating_arrangement_measures || '');
        setSeatingArrangementFeedback(formData.seating_arrangement_feedback || '');

        setCleanlinessStatus(formData.cleanliness_status || '');
        setCleanlinessMeasures(formData.cleanliness_measures || '');
        setCleanlinessFeedback(formData.cleanliness_feedback || '');

        setIllegalUseStatus(formData.illegal_use_status || '');
        setIllegalUseMeasures(formData.illegal_use_measures || '');
        setIllegalUseFeedback(formData.illegal_use_feedback || '');

        setEncroachmentStatus(formData.encroachment_status || '');
        setEncroachmentMeasures(formData.encroachment_measures || '');
        setEncroachmentFeedback(formData.encroachment_feedback || '');

        setNotableWorkStatus(formData.notable_work_status || '');
        setNotableWorkMeasures(formData.notable_work_measures || '');
        setNotableWorkFeedback(formData.notable_work_feedback || '');

        setInspectorName(formData.inspector_name || '');
        setInspectorDesignation(formData.inspector_designation || '');

        // Load photos
        if (inspection.fims_inspection_photos) {
          const photoUrls = inspection.fims_inspection_photos.map((p: any) => p.photo_url);
          setPhotos(photoUrls);
        }
      }
    } catch (error) {
      console.error('Error loading inspection:', error);
      Alert.alert(t('common.error'), 'Failed to load inspection data');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate basic info
      if (!inspectionDate || !districtName || !talukaName || !schoolName) {
        Alert.alert(t('common.error'), 'कृपया सर्व आवश्यक फील्ड भरा (Please fill all required fields)');
        return;
      }
    }
    if (currentStep === 1) {
      // Validate location
      if (!location) {
        Alert.alert(t('common.error'), 'कृपया स्थान कॅप्चर करा (Please capture location)');
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

  const collectFormData = () => {
    return {
      inspection_date: inspectionDate,
      district_name: districtName,
      taluka_name: talukaName,
      center_name: centerName,
      school_name: schoolName,
      management_name: managementName,
      principal_name: principalName,
      udise_number: udiseNumber,
      total_boys: parseInt(totalBoys) || 0,
      total_girls: parseInt(totalGirls) || 0,
      total_students: parseInt(totalStudents) || 0,
      sanctioned_teachers: parseInt(sanctionedTeachers) || 0,
      working_teachers: parseInt(workingTeachers) || 0,
      vacant_teachers: parseInt(vacantTeachers) || 0,
      sanctioned_non_teaching: parseInt(sanctionedNonTeaching) || 0,
      working_non_teaching: parseInt(workingNonTeaching) || 0,
      vacant_non_teaching: parseInt(vacantNonTeaching) || 0,
      building_construction_year_status: buildingConstructionYearStatus,
      building_construction_year_measures: buildingConstructionYearMeasures,
      building_construction_year_feedback: buildingConstructionYearFeedback,
      building_type_structure_status: buildingTypeStructureStatus,
      building_type_structure_measures: buildingTypeStructureMeasures,
      building_type_structure_feedback: buildingTypeStructureFeedback,
      classrooms_adequate_status: classroomsAdequateStatus,
      classrooms_adequate_measures: classroomsAdequateMeasures,
      classrooms_adequate_feedback: classroomsAdequateFeedback,
      separate_toilets_status: separateToiletsStatus,
      separate_toilets_measures: separateToiletsMeasures,
      separate_toilets_feedback: separateToiletsFeedback,
      cwsn_toilets_status: cwsnToiletsStatus,
      cwsn_toilets_measures: cwsnToiletsMeasures,
      cwsn_toilets_feedback: cwsnToiletsFeedback,
      drinking_water_status: drinkingWaterStatus,
      drinking_water_measures: drinkingWaterMeasures,
      drinking_water_feedback: drinkingWaterFeedback,
      boundary_wall_status: boundaryWallStatus,
      boundary_wall_measures: boundaryWallMeasures,
      boundary_wall_feedback: boundaryWallFeedback,
      playground_status: playgroundStatus,
      playground_measures: playgroundMeasures,
      playground_feedback: playgroundFeedback,
      kitchen_shed_status: kitchenShedStatus,
      kitchen_shed_measures: kitchenShedMeasures,
      kitchen_shed_feedback: kitchenShedFeedback,
      ramp_facility_status: rampFacilityStatus,
      ramp_facility_measures: rampFacilityMeasures,
      ramp_facility_feedback: rampFacilityFeedback,
      electricity_status: electricityStatus,
      electricity_measures: electricityMeasures,
      electricity_feedback: electricityFeedback,
      seating_arrangement_status: seatingArrangementStatus,
      seating_arrangement_measures: seatingArrangementMeasures,
      seating_arrangement_feedback: seatingArrangementFeedback,
      cleanliness_status: cleanlinessStatus,
      cleanliness_measures: cleanlinessMeasures,
      cleanliness_feedback: cleanlinessFeedback,
      illegal_use_status: illegalUseStatus,
      illegal_use_measures: illegalUseMeasures,
      illegal_use_feedback: illegalUseFeedback,
      encroachment_status: encroachmentStatus,
      encroachment_measures: encroachmentMeasures,
      encroachment_feedback: encroachmentFeedback,
      notable_work_status: notableWorkStatus,
      notable_work_measures: notableWorkMeasures,
      notable_work_feedback: notableWorkFeedback,
      inspector_name: inspectorName,
      inspector_designation: inspectorDesignation
    };
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      const formData = collectFormData();

      let inspId = createdInspectionId;

      if (inspId) {
        // Update existing
        await updateInspection(inspId, {
          status: 'draft',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
          form_data: formData
        } as any);
      } else {
        // Create new
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: principalName || user?.email || '',
          status: 'draft',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
          form_data: formData
        } as any);
        inspId = inspection.id;
        setCreatedInspectionId(inspId);
      }

      // Save to dedicated Mumbai High Court form table
      await saveMumbaiHighCourtForm(inspId, formData);

      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert(t('common.error'), 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert(t('common.error'), 'कृपया किमान एक फोटो अपलोड करा (Please add at least one photo)');
      return;
    }

    try {
      setLoading(true);
      const formData = collectFormData();

      let inspId = createdInspectionId;

      if (inspId) {
        // Update existing
        await updateInspection(inspId, {
          status: 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
          form_data: formData
        } as any);
      } else {
        // Create new
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: principalName || user?.email || '',
          status: 'submitted',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
          form_data: formData
        } as any);
        inspId = inspection.id;
      }

      // Save to dedicated Mumbai High Court form table
      await saveMumbaiHighCourtForm(inspId, formData);

      // Upload photos
      for (let i = 0; i < photos.length; i++) {
        await uploadPhoto(
          inspId,
          photos[i],
          `mumbai_nyayalay_photo_${i + 1}.jpg`,
          i + 1
        );
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

  const renderBasicInfo = () => (
    <View>
      <Text style={styles.sectionTitle}>मूलभूत माहिती</Text>
      <Text style={styles.sectionSubtitle}>Basic Information</Text>

      <DateInput
        label="तपासणी दिनांक / Inspection Date *"
        value={inspectionDate}
        onChangeDate={setInspectionDate}
        disabled={!isEditMode}
      />

      <Input
        label="जिल्हा नाव / District Name *"
        value={districtName}
        onChangeText={setDistrictName}
        placeholder="जिल्हा नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="तालुक्याचे नाव / Taluka Name *"
        value={talukaName}
        onChangeText={setTalukaName}
        placeholder="तालुक्याचे नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="केंद्राचे नाव / Center Name"
        value={centerName}
        onChangeText={setCenterName}
        placeholder="केंद्राचे नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="शाळेचे नाव / School Name *"
        value={schoolName}
        onChangeText={setSchoolName}
        placeholder="शाळेचे नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="व्यवस्थापनाचे नाव - जिल्हा परिषद / म.न.पा / न.पा. / Management Name"
        value={managementName}
        onChangeText={setManagementName}
        placeholder="व्यवस्थापनाचे नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="मुख्याध्यापकाचे नाव / Principal Name"
        value={principalName}
        onChangeText={setPrincipalName}
        placeholder="मुख्याध्यापकाचे नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="युडायस नं. / UDISE Number"
        value={udiseNumber}
        onChangeText={setUdiseNumber}
        placeholder="युडायस नं. प्रविष्ट करा"
        editable={isEditMode}
      />

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>विद्यार्थी आणि शिक्षक संख्या</Text>
      <Text style={styles.sectionSubtitle}>Student and Teacher Count</Text>

      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, styles.tableCell]}>विवरण</Text>
          <Text style={[styles.tableHeader, styles.tableCell]}>संख्या</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>एकूण मुले / Total Boys</Text>
          <Input
            value={totalBoys}
            onChangeText={setTotalBoys}
            keyboardType="numeric"
            style={styles.tableInput}
            editable={isEditMode}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>एकूण मुली / Total Girls</Text>
          <Input
            value={totalGirls}
            onChangeText={setTotalGirls}
            keyboardType="numeric"
            style={styles.tableInput}
            editable={isEditMode}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>एकूण विद्यार्थी / Total Students</Text>
          <Input
            value={totalStudents}
            editable={false}
            style={[styles.tableInput, styles.readOnlyInput]}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>एकूण मंजूर शिक्षक संख्या / Sanctioned Teachers</Text>
          <Input
            value={sanctionedTeachers}
            onChangeText={setSanctionedTeachers}
            keyboardType="numeric"
            style={styles.tableInput}
            editable={isEditMode}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>कार्यरत शिक्षक संख्या / Working Teachers</Text>
          <Input
            value={workingTeachers}
            onChangeText={setWorkingTeachers}
            keyboardType="numeric"
            style={styles.tableInput}
            editable={isEditMode}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>रिक्त शिक्षक संख्या / Vacant Teachers</Text>
          <Input
            value={vacantTeachers}
            editable={false}
            style={[styles.tableInput, styles.readOnlyInput]}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>एकूण मंजूर शिक्षकेत्तर कर्मचारी संख्या / Sanctioned Non-Teaching</Text>
          <Input
            value={sanctionedNonTeaching}
            onChangeText={setSanctionedNonTeaching}
            keyboardType="numeric"
            style={styles.tableInput}
            editable={isEditMode}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>एकूण कार्यरत शिक्षकेत्तर कर्मचारी संख्या / Working Non-Teaching</Text>
          <Input
            value={workingNonTeaching}
            onChangeText={setWorkingNonTeaching}
            keyboardType="numeric"
            style={styles.tableInput}
            editable={isEditMode}
          />
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>रिक्त शिक्षकेत्तर कर्मचारी संख्या / Vacant Non-Teaching</Text>
          <Input
            value={vacantNonTeaching}
            editable={false}
            style={[styles.tableInput, styles.readOnlyInput]}
          />
        </View>
      </View>
    </View>
  );

  const renderLocationInfo = () => (
    <View>
      <Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text>
      <Text style={styles.sectionSubtitle}>Location Information</Text>
      <LocationPicker
        location={location}
        onLocationChange={setLocation}
        disabled={!isEditMode}
      />
    </View>
  );

  const renderInspectionPoint = (
    title: string,
    status: string,
    setStatus: (value: string) => void,
    measures: string,
    setMeasures: (value: string) => void,
    feedback: string,
    setFeedback: (value: string) => void
  ) => (
    <View style={styles.inspectionPointContainer}>
      <Text style={styles.inspectionPointTitle}>{title}</Text>

      <Input
        label="सध्यस्थिती / Current Status"
        value={status}
        onChangeText={setStatus}
        multiline
        numberOfLines={3}
        placeholder="सध्यस्थिती प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="करावयाच्या उपाययोजना / Measures to be Taken"
        value={measures}
        onChangeText={setMeasures}
        multiline
        numberOfLines={3}
        placeholder="उपाययोजना प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="अभिप्राय / Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={3}
        placeholder="अभिप्राय प्रविष्ट करा"
        editable={isEditMode}
      />
    </View>
  );

  const renderInspectionDetailsPart1 = () => (
    <ScrollView style={styles.inspectionDetailsScroll}>
      <Text style={styles.sectionTitle}>मा. उच्च न्यायालय, मुंबई तपासणी प्रपत्र - भाग 1</Text>
      <Text style={styles.sectionSubtitle}>Hon. High Court, Mumbai Inspection Form - Part 1</Text>

      {renderInspectionPoint(
        '1) शाळा इमारत बांधकाम वर्ष / Building Construction Year',
        buildingConstructionYearStatus,
        setBuildingConstructionYearStatus,
        buildingConstructionYearMeasures,
        setBuildingConstructionYearMeasures,
        buildingConstructionYearFeedback,
        setBuildingConstructionYearFeedback
      )}

      {renderInspectionPoint(
        '2) शाळा बांधकाम प्रकार व स्थिती / Building Type & Structure',
        buildingTypeStructureStatus,
        setBuildingTypeStructureStatus,
        buildingTypeStructureMeasures,
        setBuildingTypeStructureMeasures,
        buildingTypeStructureFeedback,
        setBuildingTypeStructureFeedback
      )}

      {renderInspectionPoint(
        '3) विद्यार्थ्यांच्या प्रमाणात वर्ग खोल्या / Adequate Classrooms',
        classroomsAdequateStatus,
        setClassroomsAdequateStatus,
        classroomsAdequateMeasures,
        setClassroomsAdequateMeasures,
        classroomsAdequateFeedback,
        setClassroomsAdequateFeedback
      )}

      {renderInspectionPoint(
        '4) मुलांसाठी व मुलींसाठी स्वतंत्र स्वच्छतागृह / Separate Toilets',
        separateToiletsStatus,
        setSeparateToiletsStatus,
        separateToiletsMeasures,
        setSeparateToiletsMeasures,
        separateToiletsFeedback,
        setSeparateToiletsFeedback
      )}

      {renderInspectionPoint(
        '5) विशेष गरजा असणाऱ्या विद्यार्थ्यांसाठी (CWSN) स्वच्छतागृह / CWSN Toilets',
        cwsnToiletsStatus,
        setCwsnToiletsStatus,
        cwsnToiletsMeasures,
        setCwsnToiletsMeasures,
        cwsnToiletsFeedback,
        setCwsnToiletsFeedback
      )}

      {renderInspectionPoint(
        '6) पिण्याचे स्वच्छ पाणी व वापरासाठी पाणी / Drinking Water',
        drinkingWaterStatus,
        setDrinkingWaterStatus,
        drinkingWaterMeasures,
        setDrinkingWaterMeasures,
        drinkingWaterFeedback,
        setDrinkingWaterFeedback
      )}
    </ScrollView>
  );

  const renderInspectionDetailsPart2 = () => (
    <ScrollView style={styles.inspectionDetailsScroll}>
      <Text style={styles.sectionTitle}>मा. उच्च न्यायालय, मुंबई तपासणी प्रपत्र - भाग 2</Text>
      <Text style={styles.sectionSubtitle}>Hon. High Court, Mumbai Inspection Form - Part 2</Text>

      {renderInspectionPoint(
        '7) शाळेला संरक्षक भिंत / Boundary Wall',
        boundaryWallStatus,
        setBoundaryWallStatus,
        boundaryWallMeasures,
        setBoundaryWallMeasures,
        boundaryWallFeedback,
        setBoundaryWallFeedback
      )}

      {renderInspectionPoint(
        '8) मुलांना खेळण्यासाठी मैदान / Playground',
        playgroundStatus,
        setPlaygroundStatus,
        playgroundMeasures,
        setPlaygroundMeasures,
        playgroundFeedback,
        setPlaygroundFeedback
      )}

      {renderInspectionPoint(
        '9) किचनशेड / Kitchen Shed',
        kitchenShedStatus,
        setKitchenShedStatus,
        kitchenShedMeasures,
        setKitchenShedMeasures,
        kitchenShedFeedback,
        setKitchenShedFeedback
      )}

      {renderInspectionPoint(
        '10) उताराचा रस्ता (रॅम्प) / Ramp Facility',
        rampFacilityStatus,
        setRampFacilityStatus,
        rampFacilityMeasures,
        setRampFacilityMeasures,
        rampFacilityFeedback,
        setRampFacilityFeedback
      )}

      {renderInspectionPoint(
        '11) शाळेमध्ये लाईटची सोय / Electricity',
        electricityStatus,
        setElectricityStatus,
        electricityMeasures,
        setElectricityMeasures,
        electricityFeedback,
        setElectricityFeedback
      )}
    </ScrollView>
  );

  const renderInspectionDetailsPart3 = () => (
    <ScrollView style={styles.inspectionDetailsScroll}>
      <Text style={styles.sectionTitle}>मा. उच्च न्यायालय, मुंबई तपासणी प्रपत्र - भाग 3</Text>
      <Text style={styles.sectionSubtitle}>Hon. High Court, Mumbai Inspection Form - Part 3</Text>

      {renderInspectionPoint(
        '12) विद्यार्थ्यांना बसण्यासाठी बैठक व्यवस्था / Seating Arrangement',
        seatingArrangementStatus,
        setSeatingArrangementStatus,
        seatingArrangementMeasures,
        setSeatingArrangementMeasures,
        seatingArrangementFeedback,
        setSeatingArrangementFeedback
      )}

      {renderInspectionPoint(
        '13) शाळा व शाळा परिसर स्वच्छता / Cleanliness',
        cleanlinessStatus,
        setCleanlinessStatus,
        cleanlinessMeasures,
        setCleanlinessMeasures,
        cleanlinessFeedback,
        setCleanlinessFeedback
      )}

      {renderInspectionPoint(
        '14) शाळा इमारतींचा/परिसराचा वापर अवैध कामांसाठी / Illegal Use',
        illegalUseStatus,
        setIllegalUseStatus,
        illegalUseMeasures,
        setIllegalUseMeasures,
        illegalUseFeedback,
        setIllegalUseFeedback
      )}

      {renderInspectionPoint(
        '15) शाळेच्या इमारत व जागेवर अतिक्रमण / Encroachment',
        encroachmentStatus,
        setEncroachmentStatus,
        encroachmentMeasures,
        setEncroachmentMeasures,
        encroachmentFeedback,
        setEncroachmentFeedback
      )}

      {renderInspectionPoint(
        '16) भौतिक सुविधा व इतर बाबींबाबत उल्लेखनीय काम / Notable Work',
        notableWorkStatus,
        setNotableWorkStatus,
        notableWorkMeasures,
        setNotableWorkMeasures,
        notableWorkFeedback,
        setNotableWorkFeedback
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>निरीक्षकाची माहिती</Text>
      <Text style={styles.sectionSubtitle}>Inspector Information</Text>

      <Input
        label="निरीक्षकाचे नाव / Inspector Name"
        value={inspectorName}
        onChangeText={setInspectorName}
        placeholder="निरीक्षकाचे नाव प्रविष्ट करा"
        editable={isEditMode}
      />

      <Input
        label="पदनाम / Designation"
        value={inspectorDesignation}
        onChangeText={setInspectorDesignation}
        placeholder="पदनाम प्रविष्ट करा"
        editable={isEditMode}
      />
    </ScrollView>
  );

  const renderPhotos = () => (
    <View>
      <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
      <Text style={styles.sectionSubtitle}>Photo Documentation</Text>
      <PhotoUpload
        photos={photos}
        onPhotosChange={setPhotos}
        disabled={!isEditMode}
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderLocationInfo();
      case 2:
        return renderInspectionDetailsPart1();
      case 3:
        return renderInspectionDetailsPart2();
      case 4:
        return renderInspectionDetailsPart3();
      case 5:
        return renderPhotos();
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
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
              {isEditMode && (
                <>
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
                </>
              )}
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
  },
  contentContainer: {
    padding: 16,
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
  tableContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
    padding: 12,
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontSize: 12,
  },
  tableInput: {
    margin: 4,
    padding: 8,
    minWidth: 80,
    flex: 0,
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
  },
  inspectionPointContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inspectionPointTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  inspectionDetailsScroll: {
    flex: 1,
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
