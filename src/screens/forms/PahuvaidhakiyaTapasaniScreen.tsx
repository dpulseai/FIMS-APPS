import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto, savePahuvaidhakiyaTapasaniForm, getInspectionById } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import DateTimeInput from '../../components/common/DateTimeInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'PahuvaidhakiyaTapasani'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'PahuvaidhakiyaTapasani'>;

const STEPS = [
  'Basic Info',
  'Location',
  'Technical Review',
  'Patient Stats',
  'Surgery Stats',
  'Disease Info',
  'Vaccination',
  'Scheme Progress',
  'Assessment',
  'Photos'
];

export default function PahuvaidhakiyaTapasaniScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId, inspectionId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoMetas, setPhotoMetas] = useState<Array<{ latitude?: number; longitude?: number; accuracy?: number }>>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  // Step 1: Basic Information
  const [instituteNameAddress, setInstituteNameAddress] = useState('');
  const [headNameContact, setHeadNameContact] = useState('');
  const [inspectorNameDesignation, setInspectorNameDesignation] = useState('');
  const [visitDateTime, setVisitDateTime] = useState('');
  const [inspectionPurposeReason, setInspectionPurposeReason] = useState('');

  // Step 3: Technical Work Review
  const [technicalWorkReview, setTechnicalWorkReview] = useState('');
  const [workType, setWorkType] = useState('');
  const [targetCurrentYear, setTargetCurrentYear] = useState('');
  const [achievedMonthEnd, setAchievedMonthEnd] = useState('');
  const [achievedPreviousYearMonthEnd, setAchievedPreviousYearMonthEnd] = useState('');

  // Step 4: Patient Statistics
  const [outpatientsTarget, setOutpatientsTarget] = useState('');
  const [outpatientsCurrentMonth, setOutpatientsCurrentMonth] = useState('');
  const [outpatientsPrevious, setOutpatientsPrevious] = useState('');
  const [inpatientsTarget, setInpatientsTarget] = useState('');
  const [inpatientsCurrentMonth, setInpatientsCurrentMonth] = useState('');
  const [inpatientsPrevious, setInpatientsPrevious] = useState('');
  const [epilepsyPatientsTarget, setEpilepsyPatientsTarget] = useState('');
  const [epilepsyPatientsCurrentMonth, setEpilepsyPatientsCurrentMonth] = useState('');
  const [epilepsyPatientsPrevious, setEpilepsyPatientsPrevious] = useState('');

  // Step 5: Surgery Statistics
  const [castrationHqTarget, setCastrationHqTarget] = useState('');
  const [castrationHqCurrentMonth, setCastrationHqCurrentMonth] = useState('');
  const [castrationHqPrevious, setCastrationHqPrevious] = useState('');
  const [castrationFieldTarget, setCastrationFieldTarget] = useState('');
  const [castrationFieldCurrentMonth, setCastrationFieldCurrentMonth] = useState('');
  const [castrationFieldPrevious, setCastrationFieldPrevious] = useState('');
  const [majorSurgeryHqTarget, setMajorSurgeryHqTarget] = useState('');
  const [majorSurgeryHqCurrentMonth, setMajorSurgeryHqCurrentMonth] = useState('');
  const [majorSurgeryHqPrevious, setMajorSurgeryHqPrevious] = useState('');
  const [majorSurgeryFieldTarget, setMajorSurgeryFieldTarget] = useState('');
  const [majorSurgeryFieldCurrentMonth, setMajorSurgeryFieldCurrentMonth] = useState('');
  const [majorSurgeryFieldPrevious, setMajorSurgeryFieldPrevious] = useState('');
  const [majorSurgeryTotalTarget, setMajorSurgeryTotalTarget] = useState('');
  const [majorSurgeryTotalCurrentMonth, setMajorSurgeryTotalCurrentMonth] = useState('');
  const [majorSurgeryTotalPrevious, setMajorSurgeryTotalPrevious] = useState('');
  const [minorSurgeryHqTarget, setMinorSurgeryHqTarget] = useState('');
  const [minorSurgeryHqCurrentMonth, setMinorSurgeryHqCurrentMonth] = useState('');
  const [minorSurgeryHqPrevious, setMinorSurgeryHqPrevious] = useState('');

  // Step 6: Disease Information
  const [villageName, setVillageName] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [incubationPeriod, setIncubationPeriod] = useState('');
  const [livestockCount, setLivestockCount] = useState('');
  const [affectedCount, setAffectedCount] = useState('');
  const [deaths, setDeaths] = useState('');
  const [vaccinatedCount, setVaccinatedCount] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [villagesWithin10km, setVillagesWithin10km] = useState('');
  const [livestockWithin10km, setLivestockWithin10km] = useState('');
  const [previousEndemicDiseaseInfo, setPreviousEndemicDiseaseInfo] = useState('');
  const [edrSubmissionDate, setEdrSubmissionDate] = useState('');
  const [teamVisitDate, setTeamVisitDate] = useState('');

  // Step 7: Vaccination Program
  const [vaccineType, setVaccineType] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [numberOfAnimalsInProgram, setNumberOfAnimalsInProgram] = useState('');
  const [totalVaccinated, setTotalVaccinated] = useState('');
  const [recentlyVaccinatedDate, setRecentlyVaccinatedDate] = useState('');
  const [receivedVaccinated, setReceivedVaccinated] = useState('');
  const [previousVaccinated, setPreviousVaccinated] = useState('');
  const [totalVaccinatedCount, setTotalVaccinatedCount] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [sinceAprilVaccinated, setSinceAprilVaccinated] = useState('');
  const [reasonNotVaccinated, setReasonNotVaccinated] = useState('');

  // Step 8: Scheme Progress (6 schemes with 4 fields each)
  const [dairyAnimalsTarget, setDairyAnimalsTarget] = useState('');
  const [dairyAnimalsAchievedCurrent, setDairyAnimalsAchievedCurrent] = useState('');
  const [dairyAnimalsAchievedPrevious, setDairyAnimalsAchievedPrevious] = useState('');
  const [dairyAnimalsRemarks, setDairyAnimalsRemarks] = useState('');

  const [goatSheepTarget, setGoatSheepTarget] = useState('');
  const [goatSheepAchievedCurrent, setGoatSheepAchievedCurrent] = useState('');
  const [goatSheepAchievedPrevious, setGoatSheepAchievedPrevious] = useState('');
  const [goatSheepRemarks, setGoatSheepRemarks] = useState('');

  const [poultryShedTarget, setPoultryShedTarget] = useState('');
  const [poultryShedAchievedCurrent, setPoultryShedAchievedCurrent] = useState('');
  const [poultryShedAchievedPrevious, setPoultryShedAchievedPrevious] = useState('');
  const [poultryShedRemarks, setPoultryShedRemarks] = useState('');

  const [pigGroupTarget, setPigGroupTarget] = useState('');
  const [pigGroupAchievedCurrent, setPigGroupAchievedCurrent] = useState('');
  const [pigGroupAchievedPrevious, setPigGroupAchievedPrevious] = useState('');
  const [pigGroupRemarks, setPigGroupRemarks] = useState('');

  const [oneDayChicksTarget, setOneDayChicksTarget] = useState('');
  const [oneDayChicksAchievedCurrent, setOneDayChicksAchievedCurrent] = useState('');
  const [oneDayChicksAchievedPrevious, setOneDayChicksAchievedPrevious] = useState('');
  const [oneDayChicksRemarks, setOneDayChicksRemarks] = useState('');

  const [doubleYolkEggsTarget, setDoubleYolkEggsTarget] = useState('');
  const [doubleYolkEggsAchievedCurrent, setDoubleYolkEggsAchievedCurrent] = useState('');
  const [doubleYolkEggsAchievedPrevious, setDoubleYolkEggsAchievedPrevious] = useState('');
  const [doubleYolkEggsRemarks, setDoubleYolkEggsRemarks] = useState('');

  // Step 9: Assessment and Instructions
  const [generalTechnicalAssessment, setGeneralTechnicalAssessment] = useState('');
  const [givenInstructions, setGivenInstructions] = useState('');

  // Additional fields from database schema
  // Artificial Insemination - Primary
  const [aiPrimaryForeignTarget, setAiPrimaryForeignTarget] = useState('');
  const [aiPrimaryForeignCurrentMonth, setAiPrimaryForeignCurrentMonth] = useState('');
  const [aiPrimaryForeignPrevious, setAiPrimaryForeignPrevious] = useState('');
  const [aiPrimaryHybridTarget, setAiPrimaryHybridTarget] = useState('');
  const [aiPrimaryHybridCurrentMonth, setAiPrimaryHybridCurrentMonth] = useState('');
  const [aiPrimaryHybridPrevious, setAiPrimaryHybridPrevious] = useState('');
  const [aiPrimaryLocalTarget, setAiPrimaryLocalTarget] = useState('');
  const [aiPrimaryLocalCurrentMonth, setAiPrimaryLocalCurrentMonth] = useState('');
  const [aiPrimaryLocalPrevious, setAiPrimaryLocalPrevious] = useState('');
  const [aiPrimaryBuffaloTarget, setAiPrimaryBuffaloTarget] = useState('');
  const [aiPrimaryBuffaloCurrentMonth, setAiPrimaryBuffaloCurrentMonth] = useState('');
  const [aiPrimaryBuffaloPrevious, setAiPrimaryBuffaloPrevious] = useState('');
  const [aiPrimaryTotalTarget, setAiPrimaryTotalTarget] = useState('');
  const [aiPrimaryTotalCurrentMonth, setAiPrimaryTotalCurrentMonth] = useState('');
  const [aiPrimaryTotalPrevious, setAiPrimaryTotalPrevious] = useState('');

  // Born Calves
  const [bornCalvesCowHybridTarget, setBornCalvesCowHybridTarget] = useState('');
  const [bornCalvesCowHybridCurrentMonth, setBornCalvesCowHybridCurrentMonth] = useState('');
  const [bornCalvesCowHybridPrevious, setBornCalvesCowHybridPrevious] = useState('');
  const [bornCalvesCowLocalTarget, setBornCalvesCowLocalTarget] = useState('');
  const [bornCalvesCowLocalCurrentMonth, setBornCalvesCowLocalCurrentMonth] = useState('');
  const [bornCalvesCowLocalPrevious, setBornCalvesCowLocalPrevious] = useState('');
  const [bornCalvesBuffaloTarget, setBornCalvesBuffaloTarget] = useState('');
  const [bornCalvesBuffaloCurrentMonth, setBornCalvesBuffaloCurrentMonth] = useState('');
  const [bornCalvesBuffaloPrevious, setBornCalvesBuffaloPrevious] = useState('');
  const [bornCalvesTotalTarget, setBornCalvesTotalTarget] = useState('');
  const [bornCalvesTotalCurrentMonth, setBornCalvesTotalCurrentMonth] = useState('');
  const [bornCalvesTotalPrevious, setBornCalvesTotalPrevious] = useState('');

  // Calved Cows
  const [calvedCowsHybridTarget, setCalvedCowsHybridTarget] = useState('');
  const [calvedCowsHybridCurrentMonth, setCalvedCowsHybridCurrentMonth] = useState('');
  const [calvedCowsHybridPrevious, setCalvedCowsHybridPrevious] = useState('');
  const [calvedCowsLocalTarget, setCalvedCowsLocalTarget] = useState('');
  const [calvedCowsLocalCurrentMonth, setCalvedCowsLocalCurrentMonth] = useState('');
  const [calvedCowsLocalPrevious, setCalvedCowsLocalPrevious] = useState('');
  const [calvedBuffaloesTarget, setCalvedBuffaloesTarget] = useState('');
  const [calvedBuffaloesCurrentMonth, setCalvedBuffaloesCurrentMonth] = useState('');
  const [calvedBuffaloesPrevious, setCalvedBuffaloesPrevious] = useState('');

  // Pregnancy Examination
  const [pregnancyExamCowTarget, setPregnancyExamCowTarget] = useState('');
  const [pregnancyExamCowCurrentMonth, setPregnancyExamCowCurrentMonth] = useState('');
  const [pregnancyExamCowPrevious, setPregnancyExamCowPrevious] = useState('');
  const [pregnancyExamBuffaloTarget, setPregnancyExamBuffaloTarget] = useState('');
  const [pregnancyExamBuffaloCurrentMonth, setPregnancyExamBuffaloCurrentMonth] = useState('');
  const [pregnancyExamBuffaloPrevious, setPregnancyExamBuffaloPrevious] = useState('');
  const [pregnancyExamTotalTarget, setPregnancyExamTotalTarget] = useState('');
  const [pregnancyExamTotalCurrentMonth, setPregnancyExamTotalCurrentMonth] = useState('');
  const [pregnancyExamTotalPrevious, setPregnancyExamTotalPrevious] = useState('');

  // Infertility Animals Examination
  const [infertilityExamCowTarget, setInfertilityExamCowTarget] = useState('');
  const [infertilityExamCowCurrentMonth, setInfertilityExamCowCurrentMonth] = useState('');
  const [infertilityExamCowPrevious, setInfertilityExamCowPrevious] = useState('');
  const [infertilityExamBuffaloTarget, setInfertilityExamBuffaloTarget] = useState('');
  const [infertilityExamBuffaloCurrentMonth, setInfertilityExamBuffaloCurrentMonth] = useState('');
  const [infertilityExamBuffaloPrevious, setInfertilityExamBuffaloPrevious] = useState('');
  const [infertilityExamTotalTarget, setInfertilityExamTotalTarget] = useState('');
  const [infertilityExamTotalCurrentMonth, setInfertilityExamTotalCurrentMonth] = useState('');
  const [infertilityExamTotalPrevious, setInfertilityExamTotalPrevious] = useState('');

  // Patients Average Daily Attendance (with target, current_month, previous)
  const [patientsAvgDailyAttendanceTarget, setPatientsAvgDailyAttendanceTarget] = useState('');
  const [patientsAvgDailyAttendanceCurrentMonth, setPatientsAvgDailyAttendanceCurrentMonth] = useState('');
  const [patientsAvgDailyAttendancePrevious, setPatientsAvgDailyAttendancePrevious] = useState('');

  // Collected Service Fees (with target, current_month, previous)
  const [collectedServiceFeesTarget, setCollectedServiceFeesTarget] = useState('');
  const [collectedServiceFeesCurrentMonth, setCollectedServiceFeesCurrentMonth] = useState('');
  const [collectedServiceFeesPrevious, setCollectedServiceFeesPrevious] = useState('');

  // Load existing inspection data when editing
  useEffect(() => {
    if (!inspectionId) return;

    const loadExistingInspection = async () => {
      setLoading(true);
      try {
        const inspection = await getInspectionById(inspectionId);
        if (!inspection) return;

        // Load location data
        setLocation({
          latitude: inspection.location_latitude || 0,
          longitude: inspection.location_longitude || 0,
          accuracy: null,
          address: inspection.location_address || null,
          timestamp: Date.now(),
        });

        // Load photos
        if (inspection.photos && inspection.photos.length > 0) {
          setPhotos(inspection.photos.map((p: any) => p.photo_url));
          try {
            const metas = inspection.photos.map((p: any) => {
              if (!p.description) return {};
              try {
                const parsed = JSON.parse(p.description);
                return parsed?.photo_location || {};
              } catch (e) {
                return {};
              }
            });
            setPhotoMetas(metas);
          } catch (e) {
            console.warn('Could not parse photo metas from inspection photos', e);
          }
        }

        // Load form data from veterinary_inspection_report_form table
        const { data: formRows, error: formErr } = await supabase
          .from('veterinary_inspection_report_form')
          .select('*')
          .eq('inspection_id', inspectionId)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (formErr) {
          console.error('Error loading veterinary inspection report form data:', formErr);
          return;
        }

        const formData = Array.isArray(formRows) && formRows.length > 0 ? formRows[0] : null;

        if (formData) {
          // Basic Information
          setInstituteNameAddress(formData.institute_name_address || '');
          setHeadNameContact(formData.head_name_contact || '');
          setInspectorNameDesignation(formData.inspector_name_designation || '');
          setVisitDateTime(formData.visit_date_time || '');
          setInspectionPurposeReason(formData.inspection_purpose_reason || '');

          // Technical Work Review
          setTechnicalWorkReview(formData.technical_work_review || '');
          setWorkType(formData.work_type || '');
          setTargetCurrentYear(formData.target_current_year || '');
          setAchievedMonthEnd(formData.achieved_month_end || '');
          setAchievedPreviousYearMonthEnd(formData.achieved_previous_year_month_end || '');

          // Patient Statistics
          setOutpatientsTarget(formData.outpatients_target?.toString() || '');
          setOutpatientsCurrentMonth(formData.outpatients_current_month?.toString() || '');
          setOutpatientsPrevious(formData.outpatients_previous?.toString() || '');
          setInpatientsTarget(formData.inpatients_target?.toString() || '');
          setInpatientsCurrentMonth(formData.inpatients_current_month?.toString() || '');
          setInpatientsPrevious(formData.inpatients_previous?.toString() || '');
          setEpilepsyPatientsTarget(formData.epilepsy_patients_target?.toString() || '');
          setEpilepsyPatientsCurrentMonth(formData.epilepsy_patients_current_month?.toString() || '');
          setEpilepsyPatientsPrevious(formData.epilepsy_patients_previous?.toString() || '');

          // Surgery Statistics
          setCastrationHqTarget(formData.castration_headquarters_target?.toString() || '');
          setCastrationHqCurrentMonth(formData.castration_headquarters_current_month?.toString() || '');
          setCastrationHqPrevious(formData.castration_headquarters_previous?.toString() || '');
          setCastrationFieldTarget(formData.castration_field_target?.toString() || '');
          setCastrationFieldCurrentMonth(formData.castration_field_current_month?.toString() || '');
          setCastrationFieldPrevious(formData.castration_field_previous?.toString() || '');
          setMajorSurgeryHqTarget(formData.major_surgery_headquarters_target?.toString() || '');
          setMajorSurgeryHqCurrentMonth(formData.major_surgery_headquarters_current_month?.toString() || '');
          setMajorSurgeryHqPrevious(formData.major_surgery_headquarters_previous?.toString() || '');
          setMajorSurgeryFieldTarget(formData.major_surgery_field_target?.toString() || '');
          setMajorSurgeryFieldCurrentMonth(formData.major_surgery_field_current_month?.toString() || '');
          setMajorSurgeryFieldPrevious(formData.major_surgery_field_previous?.toString() || '');
          setMajorSurgeryTotalTarget(formData.major_surgery_total_target?.toString() || '');
          setMajorSurgeryTotalCurrentMonth(formData.major_surgery_total_current_month?.toString() || '');
          setMajorSurgeryTotalPrevious(formData.major_surgery_total_previous?.toString() || '');
          setMinorSurgeryHqTarget(formData.minor_surgery_headquarters_target?.toString() || '');
          setMinorSurgeryHqCurrentMonth(formData.minor_surgery_headquarters_current_month?.toString() || '');
          setMinorSurgeryHqPrevious(formData.minor_surgery_headquarters_previous?.toString() || '');

          // Disease Information
          setVillageName(formData.village_name || '');
          setDiseaseName(formData.disease_name || '');
          setIncubationPeriod(formData.incubation_period || '');
          setLivestockCount(formData.livestock_count?.toString() || '');
          setAffectedCount(formData.affected_count?.toString() || '');
          setDeaths(formData.deaths?.toString() || '');
          setVaccinatedCount(formData.vaccinated_count?.toString() || '');
          setActionsTaken(formData.actions_taken || '');
          setVillagesWithin10km(formData.villages_within_10km?.toString() || '');
          setLivestockWithin10km(formData.livestock_within_10km || '');
          setPreviousEndemicDiseaseInfo(formData.previous_endemic_disease_info || '');
          setEdrSubmissionDate(formData.edr_submission_date || '');
          setTeamVisitDate(formData.team_visit_date || '');

          // Vaccination Program
          setVaccineType(formData.vaccine_type || '');
          setVaccineName(formData.vaccine_name || '');
          setNumberOfAnimalsInProgram(formData.number_of_animals_in_program || '');
          setTotalVaccinated(formData.total_vaccinated || '');
          setRecentlyVaccinatedDate(formData.recently_vaccinated_date || '');
          setReceivedVaccinated(formData.received_vaccinated || '');
          setPreviousVaccinated(formData.previous_vaccinated || '');
          setTotalVaccinatedCount(formData.total_vaccinated_count || '');
          setVaccinationDate(formData.vaccination_date || '');
          setSinceAprilVaccinated(formData.since_april_vaccinated || '');
          setReasonNotVaccinated(formData.reason_not_vaccinated || '');

          // Scheme Progress
          setDairyAnimalsTarget(formData.dairy_animals_group_distribution_target_current_year || '');
          setDairyAnimalsAchievedCurrent(formData.dairy_animals_group_distribution_achieved_current_year || '');
          setDairyAnimalsAchievedPrevious(formData.dairy_animals_group_distribution_achieved_previous_year || '');
          setDairyAnimalsRemarks(formData.dairy_animals_group_distribution_remarks || '');
          setGoatSheepTarget(formData.goat_sheep_group_distribution_target_current_year || '');
          setGoatSheepAchievedCurrent(formData.goat_sheep_group_distribution_achieved_current_year || '');
          setGoatSheepAchievedPrevious(formData.goat_sheep_group_distribution_achieved_previous_year || '');
          setGoatSheepRemarks(formData.goat_sheep_group_distribution_remarks || '');
          setPoultryShedTarget(formData.poultry_shed_construction_target_current_year || '');
          setPoultryShedAchievedCurrent(formData.poultry_shed_construction_achieved_current_year || '');
          setPoultryShedAchievedPrevious(formData.poultry_shed_construction_achieved_previous_year || '');
          setPoultryShedRemarks(formData.poultry_shed_construction_remarks || '');
          setPigGroupTarget(formData.pig_group_distribution_target_current_year || '');
          setPigGroupAchievedCurrent(formData.pig_group_distribution_achieved_current_year || '');
          setPigGroupAchievedPrevious(formData.pig_group_distribution_achieved_previous_year || '');
          setPigGroupRemarks(formData.pig_group_distribution_remarks || '');
          setOneDayChicksTarget(formData.one_day_old_chicks_distribution_target_current_year || '');
          setOneDayChicksAchievedCurrent(formData.one_day_old_chicks_distribution_achieved_current_year || '');
          setOneDayChicksAchievedPrevious(formData.one_day_old_chicks_distribution_achieved_previous_year || '');
          setOneDayChicksRemarks(formData.one_day_old_chicks_distribution_remarks || '');
          setDoubleYolkEggsTarget(formData.double_yolk_eggs_distribution_target_current_year || '');
          setDoubleYolkEggsAchievedCurrent(formData.double_yolk_eggs_distribution_achieved_current_year || '');
          setDoubleYolkEggsAchievedPrevious(formData.double_yolk_eggs_distribution_achieved_previous_year || '');
          setDoubleYolkEggsRemarks(formData.double_yolk_eggs_distribution_remarks || '');

          // Assessment and Instructions
          setGeneralTechnicalAssessment(formData.general_technical_assessment || '');
          setGivenInstructions(formData.given_instructions || '');

          // Artificial Insemination - Primary
          setAiPrimaryForeignTarget(formData.artificial_insemination_primary_foreign_target?.toString() || '');
          setAiPrimaryForeignCurrentMonth(formData.artificial_insemination_primary_foreign_current_month?.toString() || '');
          setAiPrimaryForeignPrevious(formData.artificial_insemination_primary_foreign_previous?.toString() || '');
          setAiPrimaryHybridTarget(formData.artificial_insemination_primary_hybrid_target?.toString() || '');
          setAiPrimaryHybridCurrentMonth(formData.artificial_insemination_primary_hybrid_current_month?.toString() || '');
          setAiPrimaryHybridPrevious(formData.artificial_insemination_primary_hybrid_previous?.toString() || '');
          setAiPrimaryLocalTarget(formData.artificial_insemination_primary_local_target?.toString() || '');
          setAiPrimaryLocalCurrentMonth(formData.artificial_insemination_primary_local_current_month?.toString() || '');
          setAiPrimaryLocalPrevious(formData.artificial_insemination_primary_local_previous?.toString() || '');
          setAiPrimaryBuffaloTarget(formData.artificial_insemination_primary_buffalo_target?.toString() || '');
          setAiPrimaryBuffaloCurrentMonth(formData.artificial_insemination_primary_buffalo_current_month?.toString() || '');
          setAiPrimaryBuffaloPrevious(formData.artificial_insemination_primary_buffalo_previous?.toString() || '');
          setAiPrimaryTotalTarget(formData.artificial_insemination_primary_total_target?.toString() || '');
          setAiPrimaryTotalCurrentMonth(formData.artificial_insemination_primary_total_current_month?.toString() || '');
          setAiPrimaryTotalPrevious(formData.artificial_insemination_primary_total_previous?.toString() || '');

          // Born Calves
          setBornCalvesCowHybridTarget(formData.born_calves_cow_hybrid_target?.toString() || '');
          setBornCalvesCowHybridCurrentMonth(formData.born_calves_cow_hybrid_current_month?.toString() || '');
          setBornCalvesCowHybridPrevious(formData.born_calves_cow_hybrid_previous?.toString() || '');
          setBornCalvesCowLocalTarget(formData.born_calves_cow_local_target?.toString() || '');
          setBornCalvesCowLocalCurrentMonth(formData.born_calves_cow_local_current_month?.toString() || '');
          setBornCalvesCowLocalPrevious(formData.born_calves_cow_local_previous?.toString() || '');
          setBornCalvesBuffaloTarget(formData.born_calves_buffalo_target?.toString() || '');
          setBornCalvesBuffaloCurrentMonth(formData.born_calves_buffalo_current_month?.toString() || '');
          setBornCalvesBuffaloPrevious(formData.born_calves_buffalo_previous?.toString() || '');
          setBornCalvesTotalTarget(formData.born_calves_total_target?.toString() || '');
          setBornCalvesTotalCurrentMonth(formData.born_calves_total_current_month?.toString() || '');
          setBornCalvesTotalPrevious(formData.born_calves_total_previous?.toString() || '');

          // Calved Cows
          setCalvedCowsHybridTarget(formData.calved_cows_hybrid_target?.toString() || '');
          setCalvedCowsHybridCurrentMonth(formData.calved_cows_hybrid_current_month?.toString() || '');
          setCalvedCowsHybridPrevious(formData.calved_cows_hybrid_previous?.toString() || '');
          setCalvedCowsLocalTarget(formData.calved_cows_local_target?.toString() || '');
          setCalvedCowsLocalCurrentMonth(formData.calved_cows_local_current_month?.toString() || '');
          setCalvedCowsLocalPrevious(formData.calved_cows_local_previous?.toString() || '');
          setCalvedBuffaloesTarget(formData.calved_buffaloes_target?.toString() || '');
          setCalvedBuffaloesCurrentMonth(formData.calved_buffaloes_current_month?.toString() || '');
          setCalvedBuffaloesPrevious(formData.calved_buffaloes_previous?.toString() || '');

          // Pregnancy Examination
          setPregnancyExamCowTarget(formData.pregnancy_examination_cow_target?.toString() || '');
          setPregnancyExamCowCurrentMonth(formData.pregnancy_examination_cow_current_month?.toString() || '');
          setPregnancyExamCowPrevious(formData.pregnancy_examination_cow_previous?.toString() || '');
          setPregnancyExamBuffaloTarget(formData.pregnancy_examination_buffalo_target?.toString() || '');
          setPregnancyExamBuffaloCurrentMonth(formData.pregnancy_examination_buffalo_current_month?.toString() || '');
          setPregnancyExamBuffaloPrevious(formData.pregnancy_examination_buffalo_previous?.toString() || '');
          setPregnancyExamTotalTarget(formData.pregnancy_examination_total_target?.toString() || '');
          setPregnancyExamTotalCurrentMonth(formData.pregnancy_examination_total_current_month?.toString() || '');
          setPregnancyExamTotalPrevious(formData.pregnancy_examination_total_previous?.toString() || '');

          // Infertility Animals Examination
          setInfertilityExamCowTarget(formData.infertility_animals_examination_cow_target?.toString() || '');
          setInfertilityExamCowCurrentMonth(formData.infertility_animals_examination_cow_current_month?.toString() || '');
          setInfertilityExamCowPrevious(formData.infertility_animals_examination_cow_previous?.toString() || '');
          setInfertilityExamBuffaloTarget(formData.infertility_animals_examination_buffalo_target?.toString() || '');
          setInfertilityExamBuffaloCurrentMonth(formData.infertility_animals_examination_buffalo_current_month?.toString() || '');
          setInfertilityExamBuffaloPrevious(formData.infertility_animals_examination_buffalo_previous?.toString() || '');
          setInfertilityExamTotalTarget(formData.infertility_animals_examination_total_target?.toString() || '');
          setInfertilityExamTotalCurrentMonth(formData.infertility_animals_examination_total_current_month?.toString() || '');
          setInfertilityExamTotalPrevious(formData.infertility_animals_examination_total_previous?.toString() || '');

          // Patients Average Daily Attendance
          setPatientsAvgDailyAttendanceTarget(formData.patients_average_daily_attendance_target?.toString() || '');
          setPatientsAvgDailyAttendanceCurrentMonth(formData.patients_average_daily_attendance_current_month?.toString() || '');
          setPatientsAvgDailyAttendancePrevious(formData.patients_average_daily_attendance_previous?.toString() || '');

          // Collected Service Fees
          setCollectedServiceFeesTarget(formData.collected_service_fees_target?.toString() || '');
          setCollectedServiceFeesCurrentMonth(formData.collected_service_fees_current_month?.toString() || '');
          setCollectedServiceFeesPrevious(formData.collected_service_fees_previous?.toString() || '');
        }
      } catch (error) {
        console.error('Error loading inspection data:', error);
        Alert.alert(t('common.error'), 'Failed to load inspection data');
      } finally {
        setLoading(false);
      }
    };

    loadExistingInspection();
  }, [inspectionId]);

  const handleNext = () => {
    // Validate Step 0: Basic Information - All fields required
    if (currentStep === 0) {
      if (!instituteNameAddress || !instituteNameAddress.trim()) {
        Alert.alert(t('common.error'), 'Please fill institution name and address');
        return;
      }
      if (!headNameContact || !headNameContact.trim()) {
        Alert.alert(t('common.error'), 'Please fill head\'s name and contact');
        return;
      }
      if (!inspectorNameDesignation || !inspectorNameDesignation.trim()) {
        Alert.alert(t('common.error'), 'Please fill inspector\'s name and designation');
        return;
      }
      if (!visitDateTime || !visitDateTime.trim()) {
        Alert.alert(t('common.error'), 'Please fill visit date and time');
        return;
      }
      if (!inspectionPurposeReason || !inspectionPurposeReason.trim()) {
        Alert.alert(t('common.error'), 'Please fill inspection purpose');
        return;
      }
    }

    // Validate Step 1: Location required
    if (currentStep === 1 && !location) {
      Alert.alert(t('common.error'), 'Please capture location');
      return;
    }

    // Validate Step 5: Disease Information - Date fields required
    if (currentStep === 5) {
      if (!edrSubmissionDate || !edrSubmissionDate.trim()) {
        Alert.alert(t('common.error'), 'Please fill EDR submission date');
        return;
      }
      if (!teamVisitDate || !teamVisitDate.trim()) {
        Alert.alert(t('common.error'), 'Please fill team visit date');
        return;
      }
    }

    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: inspectorNameDesignation || user?.email || '',
        status: 'draft',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null
      });

      // Save all form data to pahuvaidhakiya_tapasani table
      await savePahuvaidhakiyaTapasaniForm(inspection.id, {
        // Basic Information
        institute_name_address: instituteNameAddress,
        head_name_contact: headNameContact,
        inspector_name_designation: inspectorNameDesignation,
        visit_date_time: visitDateTime,
        inspection_purpose_reason: inspectionPurposeReason,

        // Technical Work Review
        technical_work_review: technicalWorkReview,
        work_type: workType,
        target_current_year: targetCurrentYear,
        achieved_month_end: achievedMonthEnd,
        achieved_previous_year_month_end: achievedPreviousYearMonthEnd,

        // Patient Statistics
        outpatients_target: outpatientsTarget ? parseInt(outpatientsTarget) : 0,
        outpatients_current_month: outpatientsCurrentMonth ? parseInt(outpatientsCurrentMonth) : 0,
        outpatients_previous: outpatientsPrevious ? parseInt(outpatientsPrevious) : 0,
        inpatients_target: inpatientsTarget ? parseInt(inpatientsTarget) : 0,
        inpatients_current_month: inpatientsCurrentMonth ? parseInt(inpatientsCurrentMonth) : 0,
        inpatients_previous: inpatientsPrevious ? parseInt(inpatientsPrevious) : 0,
        epilepsy_patients_target: epilepsyPatientsTarget ? parseInt(epilepsyPatientsTarget) : 0,
        epilepsy_patients_current_month: epilepsyPatientsCurrentMonth ? parseInt(epilepsyPatientsCurrentMonth) : 0,
        epilepsy_patients_previous: epilepsyPatientsPrevious ? parseInt(epilepsyPatientsPrevious) : 0,

        // Surgery Statistics
        castration_headquarters_target: castrationHqTarget ? parseInt(castrationHqTarget) : 0,
        castration_headquarters_current_month: castrationHqCurrentMonth ? parseInt(castrationHqCurrentMonth) : 0,
        castration_headquarters_previous: castrationHqPrevious ? parseInt(castrationHqPrevious) : 0,
        castration_field_target: castrationFieldTarget ? parseInt(castrationFieldTarget) : 0,
        castration_field_current_month: castrationFieldCurrentMonth ? parseInt(castrationFieldCurrentMonth) : 0,
        castration_field_previous: castrationFieldPrevious ? parseInt(castrationFieldPrevious) : 0,
        major_surgery_headquarters_target: majorSurgeryHqTarget ? parseInt(majorSurgeryHqTarget) : 0,
        major_surgery_headquarters_current_month: majorSurgeryHqCurrentMonth ? parseInt(majorSurgeryHqCurrentMonth) : 0,
        major_surgery_headquarters_previous: majorSurgeryHqPrevious ? parseInt(majorSurgeryHqPrevious) : 0,
        major_surgery_field_target: majorSurgeryFieldTarget ? parseInt(majorSurgeryFieldTarget) : 0,
        major_surgery_field_current_month: majorSurgeryFieldCurrentMonth ? parseInt(majorSurgeryFieldCurrentMonth) : 0,
        major_surgery_field_previous: majorSurgeryFieldPrevious ? parseInt(majorSurgeryFieldPrevious) : 0,
        major_surgery_total_target: majorSurgeryTotalTarget ? parseInt(majorSurgeryTotalTarget) : 0,
        major_surgery_total_current_month: majorSurgeryTotalCurrentMonth ? parseInt(majorSurgeryTotalCurrentMonth) : 0,
        major_surgery_total_previous: majorSurgeryTotalPrevious ? parseInt(majorSurgeryTotalPrevious) : 0,
        minor_surgery_headquarters_target: minorSurgeryHqTarget ? parseInt(minorSurgeryHqTarget) : 0,
        minor_surgery_headquarters_current_month: minorSurgeryHqCurrentMonth ? parseInt(minorSurgeryHqCurrentMonth) : 0,
        minor_surgery_headquarters_previous: minorSurgeryHqPrevious ? parseInt(minorSurgeryHqPrevious) : 0,

        // Disease Information
        village_name: villageName,
        disease_name: diseaseName,
        incubation_period: incubationPeriod,
        livestock_count: livestockCount ? parseInt(livestockCount) : 0,
        affected_count: affectedCount ? parseInt(affectedCount) : 0,
        deaths: deaths ? parseInt(deaths) : 0,
        vaccinated_count: vaccinatedCount ? parseInt(vaccinatedCount) : 0,
        actions_taken: actionsTaken,
        villages_within_10km: villagesWithin10km ? parseInt(villagesWithin10km) : 0,
        livestock_within_10km: livestockWithin10km,
        previous_endemic_disease_info: previousEndemicDiseaseInfo,
        edr_submission_date: edrSubmissionDate || '1900-01-01',
        team_visit_date: teamVisitDate || '1900-01-01',

        // Vaccination Program
        vaccine_type: vaccineType,
        vaccine_name: vaccineName,
        number_of_animals_in_program: numberOfAnimalsInProgram,
        total_vaccinated: totalVaccinated,
        recently_vaccinated_date: recentlyVaccinatedDate || '',
        received_vaccinated: receivedVaccinated,
        previous_vaccinated: previousVaccinated,
        total_vaccinated_count: totalVaccinatedCount,
        vaccination_date: vaccinationDate || '',
        since_april_vaccinated: sinceAprilVaccinated,
        reason_not_vaccinated: reasonNotVaccinated,

        // Scheme Progress
        dairy_animals_group_distribution_target_current_year: dairyAnimalsTarget,
        dairy_animals_group_distribution_achieved_current_year: dairyAnimalsAchievedCurrent,
        dairy_animals_group_distribution_achieved_previous_year: dairyAnimalsAchievedPrevious,
        dairy_animals_group_distribution_remarks: dairyAnimalsRemarks,
        goat_sheep_group_distribution_target_current_year: goatSheepTarget,
        goat_sheep_group_distribution_achieved_current_year: goatSheepAchievedCurrent,
        goat_sheep_group_distribution_achieved_previous_year: goatSheepAchievedPrevious,
        goat_sheep_group_distribution_remarks: goatSheepRemarks,
        poultry_shed_construction_target_current_year: poultryShedTarget,
        poultry_shed_construction_achieved_current_year: poultryShedAchievedCurrent,
        poultry_shed_construction_achieved_previous_year: poultryShedAchievedPrevious,
        poultry_shed_construction_remarks: poultryShedRemarks,
        pig_group_distribution_target_current_year: pigGroupTarget,
        pig_group_distribution_achieved_current_year: pigGroupAchievedCurrent,
        pig_group_distribution_achieved_previous_year: pigGroupAchievedPrevious,
        pig_group_distribution_remarks: pigGroupRemarks,
        one_day_old_chicks_distribution_target_current_year: oneDayChicksTarget,
        one_day_old_chicks_distribution_achieved_current_year: oneDayChicksAchievedCurrent,
        one_day_old_chicks_distribution_achieved_previous_year: oneDayChicksAchievedPrevious,
        one_day_old_chicks_distribution_remarks: oneDayChicksRemarks,
        double_yolk_eggs_distribution_target_current_year: doubleYolkEggsTarget,
        double_yolk_eggs_distribution_achieved_current_year: doubleYolkEggsAchievedCurrent,
        double_yolk_eggs_distribution_achieved_previous_year: doubleYolkEggsAchievedPrevious,
        double_yolk_eggs_distribution_remarks: doubleYolkEggsRemarks,

        // Assessment and Instructions
        general_technical_assessment: generalTechnicalAssessment,
        given_instructions: givenInstructions,

        // Artificial Insemination - Primary
        artificial_insemination_primary_foreign_target: aiPrimaryForeignTarget ? parseInt(aiPrimaryForeignTarget) : 0,
        artificial_insemination_primary_foreign_current_month: aiPrimaryForeignCurrentMonth ? parseInt(aiPrimaryForeignCurrentMonth) : 0,
        artificial_insemination_primary_foreign_previous: aiPrimaryForeignPrevious ? parseInt(aiPrimaryForeignPrevious) : 0,
        artificial_insemination_primary_hybrid_target: aiPrimaryHybridTarget ? parseInt(aiPrimaryHybridTarget) : 0,
        artificial_insemination_primary_hybrid_current_month: aiPrimaryHybridCurrentMonth ? parseInt(aiPrimaryHybridCurrentMonth) : 0,
        artificial_insemination_primary_hybrid_previous: aiPrimaryHybridPrevious ? parseInt(aiPrimaryHybridPrevious) : 0,
        artificial_insemination_primary_local_target: aiPrimaryLocalTarget ? parseInt(aiPrimaryLocalTarget) : 0,
        artificial_insemination_primary_local_current_month: aiPrimaryLocalCurrentMonth ? parseInt(aiPrimaryLocalCurrentMonth) : 0,
        artificial_insemination_primary_local_previous: aiPrimaryLocalPrevious ? parseInt(aiPrimaryLocalPrevious) : 0,
        artificial_insemination_primary_buffalo_target: aiPrimaryBuffaloTarget ? parseInt(aiPrimaryBuffaloTarget) : 0,
        artificial_insemination_primary_buffalo_current_month: aiPrimaryBuffaloCurrentMonth ? parseInt(aiPrimaryBuffaloCurrentMonth) : 0,
        artificial_insemination_primary_buffalo_previous: aiPrimaryBuffaloPrevious ? parseInt(aiPrimaryBuffaloPrevious) : 0,
        artificial_insemination_primary_total_target: aiPrimaryTotalTarget ? parseInt(aiPrimaryTotalTarget) : 0,
        artificial_insemination_primary_total_current_month: aiPrimaryTotalCurrentMonth ? parseInt(aiPrimaryTotalCurrentMonth) : 0,
        artificial_insemination_primary_total_previous: aiPrimaryTotalPrevious ? parseInt(aiPrimaryTotalPrevious) : 0,

        // Born Calves
        born_calves_cow_hybrid_target: bornCalvesCowHybridTarget ? parseInt(bornCalvesCowHybridTarget) : 0,
        born_calves_cow_hybrid_current_month: bornCalvesCowHybridCurrentMonth ? parseInt(bornCalvesCowHybridCurrentMonth) : 0,
        born_calves_cow_hybrid_previous: bornCalvesCowHybridPrevious ? parseInt(bornCalvesCowHybridPrevious) : 0,
        born_calves_cow_local_target: bornCalvesCowLocalTarget ? parseInt(bornCalvesCowLocalTarget) : 0,
        born_calves_cow_local_current_month: bornCalvesCowLocalCurrentMonth ? parseInt(bornCalvesCowLocalCurrentMonth) : 0,
        born_calves_cow_local_previous: bornCalvesCowLocalPrevious ? parseInt(bornCalvesCowLocalPrevious) : 0,
        born_calves_buffalo_target: bornCalvesBuffaloTarget ? parseInt(bornCalvesBuffaloTarget) : 0,
        born_calves_buffalo_current_month: bornCalvesBuffaloCurrentMonth ? parseInt(bornCalvesBuffaloCurrentMonth) : 0,
        born_calves_buffalo_previous: bornCalvesBuffaloPrevious ? parseInt(bornCalvesBuffaloPrevious) : 0,
        born_calves_total_target: bornCalvesTotalTarget ? parseInt(bornCalvesTotalTarget) : 0,
        born_calves_total_current_month: bornCalvesTotalCurrentMonth ? parseInt(bornCalvesTotalCurrentMonth) : 0,
        born_calves_total_previous: bornCalvesTotalPrevious ? parseInt(bornCalvesTotalPrevious) : 0,

        // Calved Cows
        calved_cows_hybrid_target: calvedCowsHybridTarget ? parseInt(calvedCowsHybridTarget) : 0,
        calved_cows_hybrid_current_month: calvedCowsHybridCurrentMonth ? parseInt(calvedCowsHybridCurrentMonth) : 0,
        calved_cows_hybrid_previous: calvedCowsHybridPrevious ? parseInt(calvedCowsHybridPrevious) : 0,
        calved_cows_local_target: calvedCowsLocalTarget ? parseInt(calvedCowsLocalTarget) : 0,
        calved_cows_local_current_month: calvedCowsLocalCurrentMonth ? parseInt(calvedCowsLocalCurrentMonth) : 0,
        calved_cows_local_previous: calvedCowsLocalPrevious ? parseInt(calvedCowsLocalPrevious) : 0,
        calved_buffaloes_target: calvedBuffaloesTarget ? parseInt(calvedBuffaloesTarget) : 0,
        calved_buffaloes_current_month: calvedBuffaloesCurrentMonth ? parseInt(calvedBuffaloesCurrentMonth) : 0,
        calved_buffaloes_previous: calvedBuffaloesPrevious ? parseInt(calvedBuffaloesPrevious) : 0,

        // Pregnancy Examination
        pregnancy_examination_cow_target: pregnancyExamCowTarget ? parseInt(pregnancyExamCowTarget) : 0,
        pregnancy_examination_cow_current_month: pregnancyExamCowCurrentMonth ? parseInt(pregnancyExamCowCurrentMonth) : 0,
        pregnancy_examination_cow_previous: pregnancyExamCowPrevious ? parseInt(pregnancyExamCowPrevious) : 0,
        pregnancy_examination_buffalo_target: pregnancyExamBuffaloTarget ? parseInt(pregnancyExamBuffaloTarget) : 0,
        pregnancy_examination_buffalo_current_month: pregnancyExamBuffaloCurrentMonth ? parseInt(pregnancyExamBuffaloCurrentMonth) : 0,
        pregnancy_examination_buffalo_previous: pregnancyExamBuffaloPrevious ? parseInt(pregnancyExamBuffaloPrevious) : 0,
        pregnancy_examination_total_target: pregnancyExamTotalTarget ? parseInt(pregnancyExamTotalTarget) : 0,
        pregnancy_examination_total_current_month: pregnancyExamTotalCurrentMonth ? parseInt(pregnancyExamTotalCurrentMonth) : 0,
        pregnancy_examination_total_previous: pregnancyExamTotalPrevious ? parseInt(pregnancyExamTotalPrevious) : 0,

        // Infertility Animals Examination
        infertility_animals_examination_cow_target: infertilityExamCowTarget ? parseInt(infertilityExamCowTarget) : 0,
        infertility_animals_examination_cow_current_month: infertilityExamCowCurrentMonth ? parseInt(infertilityExamCowCurrentMonth) : 0,
        infertility_animals_examination_cow_previous: infertilityExamCowPrevious ? parseInt(infertilityExamCowPrevious) : 0,
        infertility_animals_examination_buffalo_target: infertilityExamBuffaloTarget ? parseInt(infertilityExamBuffaloTarget) : 0,
        infertility_animals_examination_buffalo_current_month: infertilityExamBuffaloCurrentMonth ? parseInt(infertilityExamBuffaloCurrentMonth) : 0,
        infertility_animals_examination_buffalo_previous: infertilityExamBuffaloPrevious ? parseInt(infertilityExamBuffaloPrevious) : 0,
        infertility_animals_examination_total_target: infertilityExamTotalTarget ? parseInt(infertilityExamTotalTarget) : 0,
        infertility_animals_examination_total_current_month: infertilityExamTotalCurrentMonth ? parseInt(infertilityExamTotalCurrentMonth) : 0,
        infertility_animals_examination_total_previous: infertilityExamTotalPrevious ? parseInt(infertilityExamTotalPrevious) : 0,

        // Patients Average Daily Attendance
        patients_average_daily_attendance_target: patientsAvgDailyAttendanceTarget ? parseInt(patientsAvgDailyAttendanceTarget) : 0,
        patients_average_daily_attendance_current_month: patientsAvgDailyAttendanceCurrentMonth ? parseInt(patientsAvgDailyAttendanceCurrentMonth) : 0,
        patients_average_daily_attendance_previous: patientsAvgDailyAttendancePrevious ? parseInt(patientsAvgDailyAttendancePrevious) : 0,

        // Collected Service Fees
        collected_service_fees_target: collectedServiceFeesTarget ? parseInt(collectedServiceFeesTarget) : 0,
        collected_service_fees_current_month: collectedServiceFeesCurrentMonth ? parseInt(collectedServiceFeesCurrentMonth) : 0,
        collected_service_fees_previous: collectedServiceFeesPrevious ? parseInt(collectedServiceFeesPrevious) : 0,
      });

      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save inspection');
      console.error('Save draft error:', error);
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
        filled_by_name: inspectorNameDesignation || user?.email || '',
        status: 'submitted',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null
      });

      // Save all form data to pahuvaidhakiya_tapasani table
      await savePahuvaidhakiyaTapasaniForm(inspection.id, {
        // Basic Information
        institute_name_address: instituteNameAddress,
        head_name_contact: headNameContact,
        inspector_name_designation: inspectorNameDesignation,
        visit_date_time: visitDateTime,
        inspection_purpose_reason: inspectionPurposeReason,

        // Technical Work Review
        technical_work_review: technicalWorkReview,
        work_type: workType,
        target_current_year: targetCurrentYear,
        achieved_month_end: achievedMonthEnd,
        achieved_previous_year_month_end: achievedPreviousYearMonthEnd,

        // Patient Statistics
        outpatients_target: outpatientsTarget ? parseInt(outpatientsTarget) : 0,
        outpatients_current_month: outpatientsCurrentMonth ? parseInt(outpatientsCurrentMonth) : 0,
        outpatients_previous: outpatientsPrevious ? parseInt(outpatientsPrevious) : 0,
        inpatients_target: inpatientsTarget ? parseInt(inpatientsTarget) : 0,
        inpatients_current_month: inpatientsCurrentMonth ? parseInt(inpatientsCurrentMonth) : 0,
        inpatients_previous: inpatientsPrevious ? parseInt(inpatientsPrevious) : 0,
        epilepsy_patients_target: epilepsyPatientsTarget ? parseInt(epilepsyPatientsTarget) : 0,
        epilepsy_patients_current_month: epilepsyPatientsCurrentMonth ? parseInt(epilepsyPatientsCurrentMonth) : 0,
        epilepsy_patients_previous: epilepsyPatientsPrevious ? parseInt(epilepsyPatientsPrevious) : 0,

        // Surgery Statistics
        castration_headquarters_target: castrationHqTarget ? parseInt(castrationHqTarget) : 0,
        castration_headquarters_current_month: castrationHqCurrentMonth ? parseInt(castrationHqCurrentMonth) : 0,
        castration_headquarters_previous: castrationHqPrevious ? parseInt(castrationHqPrevious) : 0,
        castration_field_target: castrationFieldTarget ? parseInt(castrationFieldTarget) : 0,
        castration_field_current_month: castrationFieldCurrentMonth ? parseInt(castrationFieldCurrentMonth) : 0,
        castration_field_previous: castrationFieldPrevious ? parseInt(castrationFieldPrevious) : 0,
        major_surgery_headquarters_target: majorSurgeryHqTarget ? parseInt(majorSurgeryHqTarget) : 0,
        major_surgery_headquarters_current_month: majorSurgeryHqCurrentMonth ? parseInt(majorSurgeryHqCurrentMonth) : 0,
        major_surgery_headquarters_previous: majorSurgeryHqPrevious ? parseInt(majorSurgeryHqPrevious) : 0,
        major_surgery_field_target: majorSurgeryFieldTarget ? parseInt(majorSurgeryFieldTarget) : 0,
        major_surgery_field_current_month: majorSurgeryFieldCurrentMonth ? parseInt(majorSurgeryFieldCurrentMonth) : 0,
        major_surgery_field_previous: majorSurgeryFieldPrevious ? parseInt(majorSurgeryFieldPrevious) : 0,
        major_surgery_total_target: majorSurgeryTotalTarget ? parseInt(majorSurgeryTotalTarget) : 0,
        major_surgery_total_current_month: majorSurgeryTotalCurrentMonth ? parseInt(majorSurgeryTotalCurrentMonth) : 0,
        major_surgery_total_previous: majorSurgeryTotalPrevious ? parseInt(majorSurgeryTotalPrevious) : 0,
        minor_surgery_headquarters_target: minorSurgeryHqTarget ? parseInt(minorSurgeryHqTarget) : 0,
        minor_surgery_headquarters_current_month: minorSurgeryHqCurrentMonth ? parseInt(minorSurgeryHqCurrentMonth) : 0,
        minor_surgery_headquarters_previous: minorSurgeryHqPrevious ? parseInt(minorSurgeryHqPrevious) : 0,

        // Disease Information
        village_name: villageName,
        disease_name: diseaseName,
        incubation_period: incubationPeriod,
        livestock_count: livestockCount ? parseInt(livestockCount) : 0,
        affected_count: affectedCount ? parseInt(affectedCount) : 0,
        deaths: deaths ? parseInt(deaths) : 0,
        vaccinated_count: vaccinatedCount ? parseInt(vaccinatedCount) : 0,
        actions_taken: actionsTaken,
        villages_within_10km: villagesWithin10km ? parseInt(villagesWithin10km) : 0,
        livestock_within_10km: livestockWithin10km,
        previous_endemic_disease_info: previousEndemicDiseaseInfo,
        edr_submission_date: edrSubmissionDate || '1900-01-01',
        team_visit_date: teamVisitDate || '1900-01-01',

        // Vaccination Program
        vaccine_type: vaccineType,
        vaccine_name: vaccineName,
        number_of_animals_in_program: numberOfAnimalsInProgram,
        total_vaccinated: totalVaccinated,
        recently_vaccinated_date: recentlyVaccinatedDate || '',
        received_vaccinated: receivedVaccinated,
        previous_vaccinated: previousVaccinated,
        total_vaccinated_count: totalVaccinatedCount,
        vaccination_date: vaccinationDate || '',
        since_april_vaccinated: sinceAprilVaccinated,
        reason_not_vaccinated: reasonNotVaccinated,

        // Scheme Progress
        dairy_animals_group_distribution_target_current_year: dairyAnimalsTarget,
        dairy_animals_group_distribution_achieved_current_year: dairyAnimalsAchievedCurrent,
        dairy_animals_group_distribution_achieved_previous_year: dairyAnimalsAchievedPrevious,
        dairy_animals_group_distribution_remarks: dairyAnimalsRemarks,
        goat_sheep_group_distribution_target_current_year: goatSheepTarget,
        goat_sheep_group_distribution_achieved_current_year: goatSheepAchievedCurrent,
        goat_sheep_group_distribution_achieved_previous_year: goatSheepAchievedPrevious,
        goat_sheep_group_distribution_remarks: goatSheepRemarks,
        poultry_shed_construction_target_current_year: poultryShedTarget,
        poultry_shed_construction_achieved_current_year: poultryShedAchievedCurrent,
        poultry_shed_construction_achieved_previous_year: poultryShedAchievedPrevious,
        poultry_shed_construction_remarks: poultryShedRemarks,
        pig_group_distribution_target_current_year: pigGroupTarget,
        pig_group_distribution_achieved_current_year: pigGroupAchievedCurrent,
        pig_group_distribution_achieved_previous_year: pigGroupAchievedPrevious,
        pig_group_distribution_remarks: pigGroupRemarks,
        one_day_old_chicks_distribution_target_current_year: oneDayChicksTarget,
        one_day_old_chicks_distribution_achieved_current_year: oneDayChicksAchievedCurrent,
        one_day_old_chicks_distribution_achieved_previous_year: oneDayChicksAchievedPrevious,
        one_day_old_chicks_distribution_remarks: oneDayChicksRemarks,
        double_yolk_eggs_distribution_target_current_year: doubleYolkEggsTarget,
        double_yolk_eggs_distribution_achieved_current_year: doubleYolkEggsAchievedCurrent,
        double_yolk_eggs_distribution_achieved_previous_year: doubleYolkEggsAchievedPrevious,
        double_yolk_eggs_distribution_remarks: doubleYolkEggsRemarks,

        // Assessment and Instructions
        general_technical_assessment: generalTechnicalAssessment,
        given_instructions: givenInstructions,

        // Artificial Insemination - Primary
        artificial_insemination_primary_foreign_target: aiPrimaryForeignTarget ? parseInt(aiPrimaryForeignTarget) : 0,
        artificial_insemination_primary_foreign_current_month: aiPrimaryForeignCurrentMonth ? parseInt(aiPrimaryForeignCurrentMonth) : 0,
        artificial_insemination_primary_foreign_previous: aiPrimaryForeignPrevious ? parseInt(aiPrimaryForeignPrevious) : 0,
        artificial_insemination_primary_hybrid_target: aiPrimaryHybridTarget ? parseInt(aiPrimaryHybridTarget) : 0,
        artificial_insemination_primary_hybrid_current_month: aiPrimaryHybridCurrentMonth ? parseInt(aiPrimaryHybridCurrentMonth) : 0,
        artificial_insemination_primary_hybrid_previous: aiPrimaryHybridPrevious ? parseInt(aiPrimaryHybridPrevious) : 0,
        artificial_insemination_primary_local_target: aiPrimaryLocalTarget ? parseInt(aiPrimaryLocalTarget) : 0,
        artificial_insemination_primary_local_current_month: aiPrimaryLocalCurrentMonth ? parseInt(aiPrimaryLocalCurrentMonth) : 0,
        artificial_insemination_primary_local_previous: aiPrimaryLocalPrevious ? parseInt(aiPrimaryLocalPrevious) : 0,
        artificial_insemination_primary_buffalo_target: aiPrimaryBuffaloTarget ? parseInt(aiPrimaryBuffaloTarget) : 0,
        artificial_insemination_primary_buffalo_current_month: aiPrimaryBuffaloCurrentMonth ? parseInt(aiPrimaryBuffaloCurrentMonth) : 0,
        artificial_insemination_primary_buffalo_previous: aiPrimaryBuffaloPrevious ? parseInt(aiPrimaryBuffaloPrevious) : 0,
        artificial_insemination_primary_total_target: aiPrimaryTotalTarget ? parseInt(aiPrimaryTotalTarget) : 0,
        artificial_insemination_primary_total_current_month: aiPrimaryTotalCurrentMonth ? parseInt(aiPrimaryTotalCurrentMonth) : 0,
        artificial_insemination_primary_total_previous: aiPrimaryTotalPrevious ? parseInt(aiPrimaryTotalPrevious) : 0,

        // Born Calves
        born_calves_cow_hybrid_target: bornCalvesCowHybridTarget ? parseInt(bornCalvesCowHybridTarget) : 0,
        born_calves_cow_hybrid_current_month: bornCalvesCowHybridCurrentMonth ? parseInt(bornCalvesCowHybridCurrentMonth) : 0,
        born_calves_cow_hybrid_previous: bornCalvesCowHybridPrevious ? parseInt(bornCalvesCowHybridPrevious) : 0,
        born_calves_cow_local_target: bornCalvesCowLocalTarget ? parseInt(bornCalvesCowLocalTarget) : 0,
        born_calves_cow_local_current_month: bornCalvesCowLocalCurrentMonth ? parseInt(bornCalvesCowLocalCurrentMonth) : 0,
        born_calves_cow_local_previous: bornCalvesCowLocalPrevious ? parseInt(bornCalvesCowLocalPrevious) : 0,
        born_calves_buffalo_target: bornCalvesBuffaloTarget ? parseInt(bornCalvesBuffaloTarget) : 0,
        born_calves_buffalo_current_month: bornCalvesBuffaloCurrentMonth ? parseInt(bornCalvesBuffaloCurrentMonth) : 0,
        born_calves_buffalo_previous: bornCalvesBuffaloPrevious ? parseInt(bornCalvesBuffaloPrevious) : 0,
        born_calves_total_target: bornCalvesTotalTarget ? parseInt(bornCalvesTotalTarget) : 0,
        born_calves_total_current_month: bornCalvesTotalCurrentMonth ? parseInt(bornCalvesTotalCurrentMonth) : 0,
        born_calves_total_previous: bornCalvesTotalPrevious ? parseInt(bornCalvesTotalPrevious) : 0,

        // Calved Cows
        calved_cows_hybrid_target: calvedCowsHybridTarget ? parseInt(calvedCowsHybridTarget) : 0,
        calved_cows_hybrid_current_month: calvedCowsHybridCurrentMonth ? parseInt(calvedCowsHybridCurrentMonth) : 0,
        calved_cows_hybrid_previous: calvedCowsHybridPrevious ? parseInt(calvedCowsHybridPrevious) : 0,
        calved_cows_local_target: calvedCowsLocalTarget ? parseInt(calvedCowsLocalTarget) : 0,
        calved_cows_local_current_month: calvedCowsLocalCurrentMonth ? parseInt(calvedCowsLocalCurrentMonth) : 0,
        calved_cows_local_previous: calvedCowsLocalPrevious ? parseInt(calvedCowsLocalPrevious) : 0,
        calved_buffaloes_target: calvedBuffaloesTarget ? parseInt(calvedBuffaloesTarget) : 0,
        calved_buffaloes_current_month: calvedBuffaloesCurrentMonth ? parseInt(calvedBuffaloesCurrentMonth) : 0,
        calved_buffaloes_previous: calvedBuffaloesPrevious ? parseInt(calvedBuffaloesPrevious) : 0,

        // Pregnancy Examination
        pregnancy_examination_cow_target: pregnancyExamCowTarget ? parseInt(pregnancyExamCowTarget) : 0,
        pregnancy_examination_cow_current_month: pregnancyExamCowCurrentMonth ? parseInt(pregnancyExamCowCurrentMonth) : 0,
        pregnancy_examination_cow_previous: pregnancyExamCowPrevious ? parseInt(pregnancyExamCowPrevious) : 0,
        pregnancy_examination_buffalo_target: pregnancyExamBuffaloTarget ? parseInt(pregnancyExamBuffaloTarget) : 0,
        pregnancy_examination_buffalo_current_month: pregnancyExamBuffaloCurrentMonth ? parseInt(pregnancyExamBuffaloCurrentMonth) : 0,
        pregnancy_examination_buffalo_previous: pregnancyExamBuffaloPrevious ? parseInt(pregnancyExamBuffaloPrevious) : 0,
        pregnancy_examination_total_target: pregnancyExamTotalTarget ? parseInt(pregnancyExamTotalTarget) : 0,
        pregnancy_examination_total_current_month: pregnancyExamTotalCurrentMonth ? parseInt(pregnancyExamTotalCurrentMonth) : 0,
        pregnancy_examination_total_previous: pregnancyExamTotalPrevious ? parseInt(pregnancyExamTotalPrevious) : 0,

        // Infertility Animals Examination
        infertility_animals_examination_cow_target: infertilityExamCowTarget ? parseInt(infertilityExamCowTarget) : 0,
        infertility_animals_examination_cow_current_month: infertilityExamCowCurrentMonth ? parseInt(infertilityExamCowCurrentMonth) : 0,
        infertility_animals_examination_cow_previous: infertilityExamCowPrevious ? parseInt(infertilityExamCowPrevious) : 0,
        infertility_animals_examination_buffalo_target: infertilityExamBuffaloTarget ? parseInt(infertilityExamBuffaloTarget) : 0,
        infertility_animals_examination_buffalo_current_month: infertilityExamBuffaloCurrentMonth ? parseInt(infertilityExamBuffaloCurrentMonth) : 0,
        infertility_animals_examination_buffalo_previous: infertilityExamBuffaloPrevious ? parseInt(infertilityExamBuffaloPrevious) : 0,
        infertility_animals_examination_total_target: infertilityExamTotalTarget ? parseInt(infertilityExamTotalTarget) : 0,
        infertility_animals_examination_total_current_month: infertilityExamTotalCurrentMonth ? parseInt(infertilityExamTotalCurrentMonth) : 0,
        infertility_animals_examination_total_previous: infertilityExamTotalPrevious ? parseInt(infertilityExamTotalPrevious) : 0,

        // Patients Average Daily Attendance
        patients_average_daily_attendance_target: patientsAvgDailyAttendanceTarget ? parseInt(patientsAvgDailyAttendanceTarget) : 0,
        patients_average_daily_attendance_current_month: patientsAvgDailyAttendanceCurrentMonth ? parseInt(patientsAvgDailyAttendanceCurrentMonth) : 0,
        patients_average_daily_attendance_previous: patientsAvgDailyAttendancePrevious ? parseInt(patientsAvgDailyAttendancePrevious) : 0,

        // Collected Service Fees
        collected_service_fees_target: collectedServiceFeesTarget ? parseInt(collectedServiceFeesTarget) : 0,
        collected_service_fees_current_month: collectedServiceFeesCurrentMonth ? parseInt(collectedServiceFeesCurrentMonth) : 0,
        collected_service_fees_previous: collectedServiceFeesPrevious ? parseInt(collectedServiceFeesPrevious) : 0,
      });

      // Upload photos with metadata
      for (let i = 0; i < photos.length; i++) {
        const photoUri = photos[i];
        // Skip if photo is already uploaded (starts with http:// or https://)
        if (photoUri.toLowerCase().startsWith('http://') || photoUri.toLowerCase().startsWith('https://')) {
          console.log('Skipping already uploaded photo:', photoUri);
          continue;
        }
        const meta = photoMetas[i];
        await uploadPhoto(inspection.id, photoUri, `photo${i + 1}.jpg`, i + 1, meta);
      }

      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to submit inspection');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <View>
            <Text style={styles.sectionTitle}>मूलभूत माहिती</Text>
            {/* <Text style={styles.sectionSubtitle}>Basic Institution Information</Text> */}
            <Input
              label="संस्थेचे नाव व पत्ता *"
              value={instituteNameAddress}
              onChangeText={setInstituteNameAddress}
              multiline
              numberOfLines={3}
            />
            <Input
              // label="प्रमुखाचे नाव व संपर्क / Head's Name & Contact"
              label="प्रमुखाचे नाव व संपर्क *"
              value={headNameContact}
              onChangeText={setHeadNameContact}
            />
            <Input
              // label="निरीक्षकाचे नाव व पदनाम / Inspector's Name & Designation"
              label="निरीक्षकाचे नाव व पदनाम *"
              value={inspectorNameDesignation}
              onChangeText={setInspectorNameDesignation}
            />
            <DateTimeInput
              // label="भेट दिनांक व वेळ / Visit Date & Time"
              label="भेट दिनांक व वेळ *"
              value={visitDateTime}
              onChangeDateTime={setVisitDateTime}
              placeholder="YYYY-MM-DD HH:MM"
            />
            <View>
              {/* <Text style={styles.pickerLabel}>तपासणीचा उद्देश / Inspection Purpose *</Text> */}
              <Text style={styles.pickerLabel}>तपासणीचा उद्देश *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={inspectionPurposeReason}
                  onValueChange={(value) => setInspectionPurposeReason(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="तपासणीचा उद्देश निवडा" value="" />
                  <Picker.Item label="नियमित तपासणी" value="नियमित तपासणी" />
                  <Picker.Item label="रोग तपासणी" value="रोग तपासणी" />
                  <Picker.Item label="लसीकरण कार्यक्रम" value="लसीकरण कार्यक्रम" />
                  <Picker.Item label="तक्रार तपासणी" value="तक्रार तपासणी" />
                  <Picker.Item label="इतर" value="इतर" />
                </Picker>
              </View>
            </View>
          </View>
        );

      case 1: // Location Details
        return (
          <View>
            <Text style={styles.sectionTitle}>स्थान तपशील</Text>
            <Text style={styles.sectionSubtitle}>Location Information</Text>
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );

      case 2: // Technical Work Review
        return (
          <View>
            <Text style={styles.sectionTitle}>तांत्रिक कामाचा आढावा</Text>
            <Text style={styles.sectionSubtitle}>Technical Work Review</Text>
            <Input
              label="तांत्रिक कामाचा आढावा / Technical Work Review"
              value={technicalWorkReview}
              onChangeText={setTechnicalWorkReview}
              multiline
              numberOfLines={4}
            />
            <Input
              label="कामाचा प्रकार"
              value={workType}
              onChangeText={setWorkType}
            />
            <Input
              label="चालू वर्षाचे लक्ष्य "
              value={targetCurrentYear}
              onChangeText={setTargetCurrentYear}
            />
            <Input
              label="महिना अखेरपर्यंत साध्य"
              value={achievedMonthEnd}
              onChangeText={setAchievedMonthEnd}
            />
            <Input
              label="मागील वर्षी महिना अखेरपर्यंत साध्य"
              value={achievedPreviousYearMonthEnd}
              onChangeText={setAchievedPreviousYearMonthEnd}
            />
          </View>
        );

      case 3: // Patient Statistics
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>रुग्ण आकडेवारी</Text>
            <Text style={styles.sectionSubtitle}>Patient Statistics</Text>

            <Text style={styles.subSectionTitle}>बाह्यरुग्ण / Outpatients</Text>
            <Input label="लक्ष्य" value={outpatientsTarget} onChangeText={setOutpatientsTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={outpatientsCurrentMonth} onChangeText={setOutpatientsCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={outpatientsPrevious} onChangeText={setOutpatientsPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>अंतर्रुग्ण / Inpatients</Text>
            <Input label="लक्ष्य" value={inpatientsTarget} onChangeText={setInpatientsTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={inpatientsCurrentMonth} onChangeText={setInpatientsCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={inpatientsPrevious} onChangeText={setInpatientsPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>अपस्मार रुग्ण / Epilepsy Patients</Text>
            <Input label="लक्ष्य" value={epilepsyPatientsTarget} onChangeText={setEpilepsyPatientsTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={epilepsyPatientsCurrentMonth} onChangeText={setEpilepsyPatientsCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={epilepsyPatientsPrevious} onChangeText={setEpilepsyPatientsPrevious} keyboardType="numeric" />
          </ScrollView>
        );

      case 4: // Surgery Statistics
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>शस्त्रक्रिया आकडेवारी</Text>
            <Text style={styles.sectionSubtitle}>Surgery Statistics</Text>

            <Text style={styles.subSectionTitle}>नपुंसकीकरण - मुख्यालय / Castration - HQ</Text>
            <Input label="लक्ष्य" value={castrationHqTarget} onChangeText={setCastrationHqTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={castrationHqCurrentMonth} onChangeText={setCastrationHqCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={castrationHqPrevious} onChangeText={setCastrationHqPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>नपुंसकीकरण - शेत / Castration - Field</Text>
            <Input label="लक्ष्य" value={castrationFieldTarget} onChangeText={setCastrationFieldTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={castrationFieldCurrentMonth} onChangeText={setCastrationFieldCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={castrationFieldPrevious} onChangeText={setCastrationFieldPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>मोठी शस्त्रक्रिया - मुख्यालय / Major Surgery - HQ</Text>
            <Input label="लक्ष्य" value={majorSurgeryHqTarget} onChangeText={setMajorSurgeryHqTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={majorSurgeryHqCurrentMonth} onChangeText={setMajorSurgeryHqCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={majorSurgeryHqPrevious} onChangeText={setMajorSurgeryHqPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>मोठी शस्त्रक्रिया - शेत / Major Surgery - Field</Text>
            <Input label="लक्ष्य" value={majorSurgeryFieldTarget} onChangeText={setMajorSurgeryFieldTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={majorSurgeryFieldCurrentMonth} onChangeText={setMajorSurgeryFieldCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={majorSurgeryFieldPrevious} onChangeText={setMajorSurgeryFieldPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>मोठी शस्त्रक्रिया - एकूण / Major Surgery - Total</Text>
            <Input label="लक्ष्य" value={majorSurgeryTotalTarget} onChangeText={setMajorSurgeryTotalTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={majorSurgeryTotalCurrentMonth} onChangeText={setMajorSurgeryTotalCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={majorSurgeryTotalPrevious} onChangeText={setMajorSurgeryTotalPrevious} keyboardType="numeric" />

            <Text style={styles.subSectionTitle}>छोटी शस्त्रक्रिया - मुख्यालय / Minor Surgery - HQ</Text>
            <Input label="लक्ष्य" value={minorSurgeryHqTarget} onChangeText={setMinorSurgeryHqTarget} keyboardType="numeric" />
            <Input label="चालू महिना" value={minorSurgeryHqCurrentMonth} onChangeText={setMinorSurgeryHqCurrentMonth} keyboardType="numeric" />
            <Input label="मागील" value={minorSurgeryHqPrevious} onChangeText={setMinorSurgeryHqPrevious} keyboardType="numeric" />
          </ScrollView>
        );

      case 5: // Disease Information
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>रोग माहिती</Text>
            <Text style={styles.sectionSubtitle}>Disease Information</Text>
            <Input label="गावाचे नाव " value={villageName} onChangeText={setVillageName} />
            <Input label="रोगाचे नाव" value={diseaseName} onChangeText={setDiseaseName} />
            <Input label="उद्भव कालावधी" value={incubationPeriod} onChangeText={setIncubationPeriod} />
            <Input label="पशुधन संख्या" value={livestockCount} onChangeText={setLivestockCount} keyboardType="numeric" />
            <Input label="बाधित संख्या" value={affectedCount} onChangeText={setAffectedCount} keyboardType="numeric" />
            <Input label="मृत्यू" value={deaths} onChangeText={setDeaths} keyboardType="numeric" />
            <Input label="लसीकरण संख्या" value={vaccinatedCount} onChangeText={setVaccinatedCount} keyboardType="numeric" />
            <Input label="घेतलेल्या कृती" value={actionsTaken} onChangeText={setActionsTaken} multiline numberOfLines={3} />
            <Input label="१० किमी परिसरातील गावे" value={villagesWithin10km} onChangeText={setVillagesWithin10km} keyboardType="numeric" />
            <Input label="१० किमी परिसरातील पशुधन" value={livestockWithin10km} onChangeText={setLivestockWithin10km} />
            <Input label="मागील स्थानिक रोग माहिती" value={previousEndemicDiseaseInfo} onChangeText={setPreviousEndemicDiseaseInfo} multiline numberOfLines={3} />
            <DateInput label="EDR सबमिशन दिनांक" value={edrSubmissionDate} onChangeDate={setEdrSubmissionDate} placeholder="YYYY-MM-DD" />
            <DateInput label="टीम भेट दिनांक" value={teamVisitDate} onChangeDate={setTeamVisitDate} placeholder="YYYY-MM-DD" />
          </ScrollView>
        );

      case 6: // Vaccination Program
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>लसीकरण कार्यक्रम</Text>
            <Text style={styles.sectionSubtitle}>Vaccination Program</Text>
            <Input label="लसीचा प्रकार" value={vaccineType} onChangeText={setVaccineType} />
            <Input label="लसीचे नाव" value={vaccineName} onChangeText={setVaccineName} />
            <Input label="कार्यक्रमातील जनावरे" value={numberOfAnimalsInProgram} onChangeText={setNumberOfAnimalsInProgram} />
            <Input label="एकूण लसीकरण" value={totalVaccinated} onChangeText={setTotalVaccinated} />
            <DateInput label="अलीकडील लसीकरण तारीख" value={recentlyVaccinatedDate} onChangeDate={setRecentlyVaccinatedDate} placeholder="YYYY-MM-DD" />
            <Input label="प्राप्त लसीकरण" value={receivedVaccinated} onChangeText={setReceivedVaccinated} />
            <Input label="मागील लसीकरण" value={previousVaccinated} onChangeText={setPreviousVaccinated} />
            <Input label="एकूण लसीकरण संख्या" value={totalVaccinatedCount} onChangeText={setTotalVaccinatedCount} />
            <DateInput label="लसीकरण तारीख" value={vaccinationDate} onChangeDate={setVaccinationDate} placeholder="YYYY-MM-DD" />
            <Input label="एप्रिलपासून लसीकरण" value={sinceAprilVaccinated} onChangeText={setSinceAprilVaccinated} />
            <Input label="लसीकरण न केल्याचे कारण" value={reasonNotVaccinated} onChangeText={setReasonNotVaccinated} multiline numberOfLines={3} />
          </ScrollView>
        );

      case 7: // Scheme Progress
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>योजना प्रगती</Text>
            <Text style={styles.sectionSubtitle}>Scheme Progress</Text>

            <Text style={styles.subSectionTitle}>दुधारू जनावरांचे गट वितरण / Dairy Animals Group Distribution</Text>
            <Input label="चालू वर्षाचे लक्ष्य " value={dairyAnimalsTarget} onChangeText={setDairyAnimalsTarget} />
            <Input label="चालू वर्षी साध्य" value={dairyAnimalsAchievedCurrent} onChangeText={setDairyAnimalsAchievedCurrent} />
            <Input label="मागील वर्षी साध्य" value={dairyAnimalsAchievedPrevious} onChangeText={setDairyAnimalsAchievedPrevious} />
            <Input label="शेरा" value={dairyAnimalsRemarks} onChangeText={setDairyAnimalsRemarks} />

            <Text style={styles.subSectionTitle}>शेळी/मेंढी गट वितरण / Goat/Sheep Group Distribution</Text>
            <Input label="चालू वर्षाचे लक्ष्य" value={goatSheepTarget} onChangeText={setGoatSheepTarget} />
            <Input label="चालू वर्षी साध्य" value={goatSheepAchievedCurrent} onChangeText={setGoatSheepAchievedCurrent} />
            <Input label="मागील वर्षी साध्य" value={goatSheepAchievedPrevious} onChangeText={setGoatSheepAchievedPrevious} />
            <Input label="शेरा" value={goatSheepRemarks} onChangeText={setGoatSheepRemarks} />

            <Text style={styles.subSectionTitle}>कुक्कुटपालन शेड बांधकाम / Poultry Shed Construction</Text>
            <Input label="चालू वर्षाचे लक्ष्य" value={poultryShedTarget} onChangeText={setPoultryShedTarget} />
            <Input label="चालू वर्षी साध्य" value={poultryShedAchievedCurrent} onChangeText={setPoultryShedAchievedCurrent} />
            <Input label="मागील वर्षी साध्य" value={poultryShedAchievedPrevious} onChangeText={setPoultryShedAchievedPrevious} />
            <Input label="शेरा" value={poultryShedRemarks} onChangeText={setPoultryShedRemarks} />

            <Text style={styles.subSectionTitle}>डुकर गट वितरण / Pig Group Distribution</Text>
            <Input label="चालू वर्षाचे लक्ष्य" value={pigGroupTarget} onChangeText={setPigGroupTarget} />
            <Input label="चालू वर्षी साध्य" value={pigGroupAchievedCurrent} onChangeText={setPigGroupAchievedCurrent} />
            <Input label="मागील वर्षी साध्य" value={pigGroupAchievedPrevious} onChangeText={setPigGroupAchievedPrevious} />
            <Input label="शेरा" value={pigGroupRemarks} onChangeText={setPigGroupRemarks} />

            <Text style={styles.subSectionTitle}>एक दिवसांचे चिमणी वितरण / One Day Old Chicks Distribution</Text>
            <Input label="चालू वर्षाचे लक्ष्य" value={oneDayChicksTarget} onChangeText={setOneDayChicksTarget} />
            <Input label="चालू वर्षी साध्य" value={oneDayChicksAchievedCurrent} onChangeText={setOneDayChicksAchievedCurrent} />
            <Input label="मागील वर्षी साध्य" value={oneDayChicksAchievedPrevious} onChangeText={setOneDayChicksAchievedPrevious} />
            <Input label="शेरा" value={oneDayChicksRemarks} onChangeText={setOneDayChicksRemarks} />

            <Text style={styles.subSectionTitle}>दुहेरी जर्दी अंडे वितरण / Double Yolk Eggs Distribution</Text>
            <Input label="चालू वर्षाचे लक्ष्य" value={doubleYolkEggsTarget} onChangeText={setDoubleYolkEggsTarget} />
            <Input label="चालू वर्षी साध्य" value={doubleYolkEggsAchievedCurrent} onChangeText={setDoubleYolkEggsAchievedCurrent} />
            <Input label="मागील वर्षी साध्य" value={doubleYolkEggsAchievedPrevious} onChangeText={setDoubleYolkEggsAchievedPrevious} />
            <Input label="शेरा" value={doubleYolkEggsRemarks} onChangeText={setDoubleYolkEggsRemarks} />
          </ScrollView>
        );

      case 8: // Assessment and Instructions
        return (
          <View>
            <Text style={styles.sectionTitle}>मूल्यांकन आणि सूचना</Text>
            <Text style={styles.sectionSubtitle}>Assessment and Instructions</Text>
            <Input
              label="सामान्य तांत्रिक मूल्यांकन *"
              value={generalTechnicalAssessment}
              onChangeText={setGeneralTechnicalAssessment}
              multiline
              numberOfLines={6}
            />
            <Input
              label="दिलेल्या सूचना *"
              value={givenInstructions}
              onChangeText={setGivenInstructions}
              multiline
              numberOfLines={6}
            />
          </View>
        );

      case 9: // Photos
        return (
          <View>
            <Text style={styles.sectionTitle}>फोटो</Text>
            <Text style={styles.sectionSubtitle}>Photo Documentation</Text>
            <PhotoUpload
              photos={photos}
              onPhotosChange={(p) => {
                setPhotos(p);
                if (photoMetas.length > p.length) setPhotoMetas(photoMetas.slice(0, p.length));
              }}
              photoMetas={photoMetas}
              onPhotoMetaChange={setPhotoMetas}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stepper steps={STEPS} currentStep={currentStep} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card>{renderStep()}</Card>
      </ScrollView>
      <View style={styles.footer}>
        {currentStep < STEPS.length - 1 ? (
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <Button
                title='मागील'
                onPress={handlePrevious}
                variant="outline"
                style={styles.button}
                disabled={loading}
              />
            )}
            <Button
              title='पुढे'
              onPress={handleNext}
              style={styles.button}
              disabled={loading}
            />
          </View>
        ) : (
          <View style={styles.submitButtons}>
            <Button
              title="तपासणी सबमिट करा"
              onPress={handleSubmit}
              loading={loading}
            />
            <Button
              title="मसुदा सेव्ह करा"
              onPress={handleSaveAsDraft}
              variant="outline"
              loading={loading}
            />
            {currentStep > 0 && (
              <Button
                title='मागील'
                onPress={handlePrevious}
                variant="outline"
                disabled={loading}
              />
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  subSectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  switchLabel: { fontSize: 14, color: '#374151', flex: 1 },
  footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  button: { flex: 1 },
  submitButtons: { gap: 12, marginTop: 12 },
  pickerLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 16 },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#ffffff', overflow: 'hidden' },
  picker: { height: 50 }
});
