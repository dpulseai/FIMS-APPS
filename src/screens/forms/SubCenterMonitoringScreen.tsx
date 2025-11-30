import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, updateInspection, uploadPhoto, getInspectionById } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'SubCenterMonitoring'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'SubCenterMonitoring'>;

const STEPS = [
  'Basic Info',
  'Infrastructure',
  'Human Resources',
  'Equipment',
  'Essential Drugs',
  'Essential Supplies',
  'Service Delivery',
  'Essential Skills',
  'Record Maintenance',
  'Referral Linkages',
  'IEC Display',
  'Monitoring & Findings',
  'Photos'
];

type ChecklistItem = {
  id: string;
  label: string;
  value: string;
  comments?: string;
};

type HumanResource = {
  id: string;
  label: string;
  numbers: string;
  training: string;
  remarks: string;
};

type Equipment = {
  id: string;
  equipment: string;
  availableFunctional: boolean;
  availableNotFunctional: boolean;
  notAvailable: boolean;
  remarks: string;
};

type ServiceDelivery = {
  id: string;
  label: string;
  actual: string;
  expected: string;
  remarks: string;
};

type EssentialSkill = {
  id: string;
  skill: string;
  knowledge: string;
  skillLevel: string;
  remarks: string;
};

type RecordMaintenance = {
  id: string;
  record: string;
  availableUpdated: boolean;
  availableNotMaintained: boolean;
  notAvailable: boolean;
  remarks: string;
};

type ReferralLinkage = {
  id: string;
  modeOfTransport: string;
  womenTransported: string;
  sickInfantsTransported: string;
  freePaid: string;
};

type IECDisplay = {
  id: string;
  material: string;
  available: boolean;
  remarks: string;
};

type MonitoringSupervisor = {
  id: string;
  name: string;
  designation: string;
  dateOfVisit: string;
  sign: string;
};

type KeyFinding = {
  id: number;
  keyFinding: string;
  action: string;
  responsible: string;
  timeline: string;
};

export default function SubCenterMonitoringScreen() {
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

  // Basic Information
  const [district, setDistrict] = useState('');
  const [blockName, setBlockName] = useState('');
  const [scName, setScName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [catchmentPopulation, setCatchmentPopulation] = useState('');
  const [totalVillages, setTotalVillages] = useState('');
  const [distanceFromPHC, setDistanceFromPHC] = useState('');
  const [lastVisit, setLastVisit] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [monitorName, setMonitorName] = useState('');
  const [staffAvailable, setStaffAvailable] = useState('');
  const [staffNotAvailable, setStaffNotAvailable] = useState('');
  const [generalComments, setGeneralComments] = useState('');

  // Section arrays
  const [infrastructure, setInfrastructure] = useState<ChecklistItem[]>([]);
  const [humanResources, setHumanResources] = useState<HumanResource[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [essentialDrugs, setEssentialDrugs] = useState<ChecklistItem[]>([]);
  const [essentialSupplies, setEssentialSupplies] = useState<ChecklistItem[]>([]);
  const [serviceDelivery, setServiceDelivery] = useState<ServiceDelivery[]>([]);
  const [essentialSkills, setEssentialSkills] = useState<EssentialSkill[]>([]);
  const [recordMaintenance, setRecordMaintenance] = useState<RecordMaintenance[]>([]);
  const [referralLinkages, setReferralLinkages] = useState<ReferralLinkage[]>([]);
  const [iecDisplay, setIecDisplay] = useState<IECDisplay[]>([]);
  const [monitoringSupervisors, setMonitoringSupervisors] = useState<MonitoringSupervisor[]>([]);
  const [keyFindings, setKeyFindings] = useState<KeyFinding[]>([]);

  // Initialize default data
  useEffect(() => {
    if (!inspectionId && infrastructure.length === 0) {
      setInfrastructure([
        { id: "1.1", label: "Sub-centre located near a main habitation", value: "", comments: "" },
        { id: "1.2", label: "Functioning in Govt. building", value: "", comments: "" },
        { id: "1.3", label: "Building in good condition", value: "", comments: "" },
        { id: "1.4", label: "Electricity with functional power back up", value: "", comments: "" },
        { id: "1.5", label: "Running 24*7 water supply", value: "", comments: "" },
        { id: "1.6", label: "ANM quarter available", value: "", comments: "" },
        { id: "1.7", label: "ANM residing at SC", value: "", comments: "" },
        { id: "1.8", label: "Functional labour room", value: "", comments: "" },
        { id: "1.9", label: "Functional and clean toilet attached to labour room", value: "", comments: "" },
        { id: "1.10", label: "Functional New Born Care Corner", value: "", comments: "" },
        { id: "1.11", label: "General cleanliness in the facility", value: "", comments: "" },
        { id: "1.12", label: "Availability of complain / suggestion box", value: "", comments: "" },
        { id: "1.13", label: "BMW mechanism", value: "", comments: "" },
      ]);

      setHumanResources([
        { id: '2.1', label: 'CHO', numbers: '', training: '', remarks: '' },
        { id: '2.2', label: 'ANM', numbers: '', training: '', remarks: '' },
        { id: '2.3', label: '2nd ANM', numbers: '', training: '', remarks: '' },
        { id: '2.4', label: 'MPW – Male', numbers: '', training: '', remarks: '' },
        { id: '2.5', label: 'Assistant', numbers: '', training: '', remarks: '' },
      ]);

      setEquipment([
        { id: '3.1', equipment: 'Equipment for Haemoglobin Estimation', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.2', equipment: 'Blood sugar testing kits', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.3', equipment: 'BP Instrument and Stethoscope', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.4', equipment: 'Delivery equipment', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.5', equipment: 'Neonatal ambu bag', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.6', equipment: 'Adult weighing machine', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.7', equipment: 'Infant / New born weighing machine', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.8', equipment: 'Needle & Hub Cutter', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' },
        { id: '3.9', equipment: 'Colour coded bins', availableFunctional: false, availableNotFunctional: false, notAvailable: false, remarks: '' }
      ]);

      setEssentialDrugs([
        { id: "4.1", label: "IFA tablets", value: "", comments: "" },
        { id: "4.2", label: "IFA syrup with dispenser", value: "", comments: "" },
        { id: "4.3", label: "Vit A syrup", value: "", comments: "" },
        { id: "4.4", label: "ORS packets", value: "", comments: "" },
        { id: "4.5", label: "Zinc tablets", value: "", comments: "" },
        { id: "4.6", label: "Inj Magnesium Sulphate", value: "", comments: "" },
        { id: "4.7", label: "Inj Oxytocin", value: "", comments: "" },
        { id: "4.8", label: "Gentamycin inj. 40 mg", value: "", comments: "" },
        { id: "4.9", label: "Antibiotics (specify)", value: "", comments: "" },
        { id: "4.10", label: "Drugs for common ailments (PCM, anti-allergic)", value: "", comments: "" },
        { id: "4.11", label: "Syrup Calcium with Phosphate 200ml", value: "", comments: "" },
        { id: "4.12", label: "Cotrimazole 100mg Vaginal Pessaries", value: "", comments: "" },
        { id: "4.13", label: "Fluconazole Tab. 150mg", value: "", comments: "" },
        { id: "4.14", label: "Albendazole Tab 400mg", value: "", comments: "" },
        { id: "4.15", label: "Albendazole Susp. 200mg/5ml", value: "", comments: "" },
        { id: "4.16", label: "Anti-hypertensive drugs", value: "", comments: "" },
        { id: "4.17", label: "Anti-diabetic drugs", value: "", comments: "" },
        { id: "4.18", label: "Glucostrip", value: "", comments: "" },
        { id: "4.19", label: "Calcium Carbonate Tab + Vit D3", value: "", comments: "" },
      ]);

      setEssentialSupplies([
        { id: "5.1", label: "Pregnancy testing Kits", value: "", comments: "" },
        { id: "5.2", label: "Urine albumin and sugar testing kit", value: "", comments: "" },
        { id: "5.3", label: "OCPs", value: "", comments: "" },
        { id: "5.4", label: "EC pills", value: "", comments: "" },
        { id: "5.5", label: "IUCDs", value: "", comments: "" },
        { id: "5.6", label: "Sanitary napkins", value: "", comments: "" },
      ]);

      setServiceDelivery([
        { id: '6.1', label: 'Number of estimated pregnancies', actual: '', expected: '', remarks: '' },
        { id: '6.2', label: 'Percentage of women registered in first trimester', actual: '', expected: '', remarks: '' },
        { id: '6.3', label: 'Percentage of 4 ANC checkups', actual: '', expected: '', remarks: '' },
        { id: '6.4', label: 'Pregnant women given IFA', actual: '', expected: '', remarks: '' },
        { id: '6.5', label: 'Deliveries conducted at SC', actual: '', expected: '', remarks: '' },
        { id: '6.6', label: 'Deliveries conducted at home', actual: '', expected: '', remarks: '' },
        { id: '6.7', label: 'Neonates with breastfeeding within one hour', actual: '', expected: '', remarks: '' },
      ]);

      setEssentialSkills([
        { id: '7.1', skill: 'Correctly measure BP', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.2', skill: 'Correctly measure haemoglobin', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.3', skill: 'Correctly measure urine albumin and protein', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.4', skill: 'Identify high risk pregnancy', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.5', skill: 'Awareness on mechanisms for referral', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.6', skill: 'Correct use of partograph', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.7', skill: 'Provide essential newborn care', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.8', skill: 'Correctly insert IUCD', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.9', skill: 'Correctly administer vaccine', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.10', skill: 'Adherence to IMEP protocols', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.11', skill: 'Segregation of wastes in colour coded bins', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.12', skill: 'Guidance for breast feeding method', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.13', skill: 'Identify signs of Pneumonia and dehydration', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.14', skill: 'Awareness on Immunization Schedule', knowledge: '', skillLevel: '', remarks: '' },
        { id: '7.15', skill: 'Awareness on site of administration of vaccine', knowledge: '', skillLevel: '', remarks: '' },
      ]);

      setRecordMaintenance([
        { id: '8.1', record: 'Untied funds expenditure (Rs.10,000)', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.2', record: 'Annual maintenance grant (Rs.10,000)', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.3', record: 'Payments under JSY', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.4', record: 'VHSNC plan', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.5', record: 'VHSNC meeting minutes and action taken', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.6', record: 'Eligible couple register', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.7', record: 'MCH register (as per GOI)', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.8', record: 'Delivery Register as per GOI format', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.9', record: 'Stock register', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.10', record: 'Due lists', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.11', record: 'MCP cards', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.12', record: 'Referral Registers (in and out)', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.13', record: 'List of families with 0-6 years children', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.14', record: 'Line listing of severely anaemic pregnant women', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.15', record: 'Line list of SAM, MAM Children', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.16', record: 'Updated Micro plan', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.17', record: 'Vaccine supply for each session day', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
        { id: '8.18', record: 'Due list from RCH Portal', availableUpdated: false, availableNotMaintained: false, notAvailable: false, remarks: '' },
      ]);

      setReferralLinkages([
        { id: '9.1', modeOfTransport: 'Home to facility', womenTransported: '', sickInfantsTransported: '', freePaid: '' },
        { id: '9.2', modeOfTransport: 'Inter facility', womenTransported: '', sickInfantsTransported: '', freePaid: '' },
        { id: '9.3', modeOfTransport: 'Facility to Home (drop back)', womenTransported: '', sickInfantsTransported: '', freePaid: '' },
      ]);

      setIecDisplay([
        { id: '10.1', material: 'Approach roads have directions to the sub centre', available: false, remarks: '' },
        { id: '10.2', material: 'Citizen Charter', available: false, remarks: '' },
        { id: '10.3', material: 'Timings of the Sub Centre', available: false, remarks: '' },
        { id: '10.4', material: 'Visit schedule of ANMs', available: false, remarks: '' },
        { id: '10.5', material: 'Area distribution of the ANMs / VHNSC plan', available: false, remarks: '' },
        { id: '10.6', material: 'SBA Protocol Posters', available: false, remarks: '' },
        { id: '10.7', material: 'Immunization Schedule', available: false, remarks: '' },
        { id: '10.8', material: 'List of services provided at SC', available: false, remarks: '' },
        { id: '10.9', material: 'Display of JSY benefits', available: false, remarks: '' },
        { id: '10.10', material: 'Display of referral transport facility', available: false, remarks: '' },
      ]);

      setMonitoringSupervisors([
        { id: '11.1', name: '', designation: '', dateOfVisit: '', sign: '' },
        { id: '11.2', name: '', designation: '', dateOfVisit: '', sign: '' },
        { id: '11.3', name: '', designation: '', dateOfVisit: '', sign: '' },
        { id: '11.4', name: '', designation: '', dateOfVisit: '', sign: '' },
        { id: '11.5', name: '', designation: '', dateOfVisit: '', sign: '' },
      ]);

      setKeyFindings([
        { id: 1, keyFinding: '', action: '', responsible: '', timeline: '' },
        { id: 2, keyFinding: '', action: '', responsible: '', timeline: '' },
        { id: 3, keyFinding: '', action: '', responsible: '', timeline: '' },
        { id: 4, keyFinding: '', action: '', responsible: '', timeline: '' },
        { id: 5, keyFinding: '', action: '', responsible: '', timeline: '' },
      ]);
    }
  }, [inspectionId, infrastructure.length]);

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
        }

        // Load form data from sub_centre_monitoring_checklist table
        const { data: formRows, error: formErr } = await supabase
          .from('sub_centre_monitoring_checklist')
          .select('*')
          .eq('inspection_id', inspectionId)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (formErr) {
          console.error('Error loading sub center form data:', formErr);
          return;
        }

        const formData = Array.isArray(formRows) && formRows.length > 0 ? formRows[0] : null;

        if (formData) {
          setDistrict(formData.district || '');
          setBlockName(formData.block_name || '');
          setScName(formData.sc_name || '');
          setFacilityName(formData.facility_name || '');
          setCatchmentPopulation(formData.catchment_population || '');
          setTotalVillages(formData.total_villages || '');
          setDistanceFromPHC(formData.distance_from_phc || '');
          setLastVisit(formData.last_visit || '');
          setDate(formData.date || '');
          setMonitorName(formData.monitor_name || '');
          setStaffAvailable(formData.staff_available || '');
          setStaffNotAvailable(formData.staff_not_available || '');
          setGeneralComments(formData.general_comments || '');

          if (formData.infrastructure) setInfrastructure(formData.infrastructure);
          if (formData.human_resources) setHumanResources(formData.human_resources);
          if (formData.equipment) setEquipment(formData.equipment);
          if (formData.essential_drugs) setEssentialDrugs(formData.essential_drugs);
          if (formData.essential_supplies) setEssentialSupplies(formData.essential_supplies);
          if (formData.service_delivery) setServiceDelivery(formData.service_delivery);
          if (formData.essential_skills) setEssentialSkills(formData.essential_skills);
          if (formData.record_maintenance) setRecordMaintenance(formData.record_maintenance);
          if (formData.referral_linkages) setReferralLinkages(formData.referral_linkages);
          if (formData.iec_display) setIecDisplay(formData.iec_display);
          if (formData.monitoring_supervisors) setMonitoringSupervisors(formData.monitoring_supervisors);
          if (formData.key_findings) setKeyFindings(formData.key_findings);
        }
      } catch (error) {
        console.error('Error loading inspection:', error);
        Alert.alert(t('common.error'), 'Failed to load inspection data');
      } finally {
        setLoading(false);
      }
    };

    loadExistingInspection();
  }, [inspectionId, t]);

  const handleNext = () => {
    if (currentStep === 0 && !scName) {
      Alert.alert(t('common.error'), 'Please enter Sub Centre Name');
      return;
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

  const saveSubCenterMonitoringForm = async (inspectionId: string, formData: any): Promise<void> => {
    try {
      // Check if a form already exists for this inspection
      const { data: existingForms, error: fetchError } = await supabase
        .from('sub_centre_monitoring_checklist')
        .select('id')
        .eq('inspection_id', inspectionId);

      if (fetchError) throw fetchError;

      if (existingForms && existingForms.length > 0) {
        // Update existing form (updates all matching rows to handle duplicates)
        const { error } = await supabase
          .from('sub_centre_monitoring_checklist')
          .update(formData)
          .eq('inspection_id', inspectionId);

        if (error) throw error;
      } else {
        // Insert new form
        const { error } = await supabase
          .from('sub_centre_monitoring_checklist')
          .insert({
            inspection_id: inspectionId,
            ...formData,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving sub center monitoring form:', error);
      throw error;
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);

      // Determine inspection ID to use
      let inspectionIdToUse = inspectionId;

      if (inspectionIdToUse) {
        // Update existing inspection
        await updateInspection(inspectionIdToUse, {
          filled_by_name: monitorName || user?.email || '',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
      } else {
        // Create new inspection
        const inspection = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: monitorName || user?.email || '',
          status: 'draft',
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          location_address: location?.address || null,
        });
        inspectionIdToUse = inspection.id;
      }

      // Save form data
      const formPayload = {
        category_id: categoryId,
        user_id: user?.id,
        district,
        block_name: blockName,
        sc_name: scName,
        facility_name: facilityName,
        catchment_population: catchmentPopulation,
        total_villages: totalVillages,
        distance_from_phc: distanceFromPHC,
        last_visit: lastVisit || null,
        date: date || new Date().toISOString().split('T')[0],
        monitor_name: monitorName,
        staff_available: staffAvailable,
        staff_not_available: staffNotAvailable,
        infrastructure,
        human_resources: humanResources,
        equipment,
        essential_drugs: essentialDrugs,
        essential_supplies: essentialSupplies,
        service_delivery: serviceDelivery,
        essential_skills: essentialSkills,
        record_maintenance: recordMaintenance,
        referral_linkages: referralLinkages,
        iec_display: iecDisplay,
        monitoring_supervisors: monitoringSupervisors,
        key_findings: keyFindings,
        general_comments: generalComments,
      };

      await saveSubCenterMonitoringForm(inspectionIdToUse, formPayload);

      // Upload photos if any
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          await uploadPhoto(inspectionIdToUse, photos[i], `photo_${i + 1}.jpg`, i + 1);
        }
      }

      Alert.alert(t('common.success'), 'Draft saved successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert(t('common.error'), 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!scName) {
      Alert.alert(t('common.error'), 'Please enter Sub Centre Name');
      return;
    }

    if (!location) {
      Alert.alert(t('common.error'), 'Please capture location');
      return;
    }

    try {
      setLoading(true);

      let inspectionResult;

      if (inspectionId) {
        // Update existing inspection
        inspectionResult = await updateInspection(inspectionId, {
          status: 'submitted',
          location_latitude: location.latitude,
          location_longitude: location.longitude,
          location_address: location.address || null,
        });
      } else {
        // Create new inspection
        inspectionResult = await createInspection({
          category_id: categoryId,
          inspector_id: user?.id,
          filled_by_name: monitorName || user?.email || '',
          status: 'submitted',
          location_latitude: location.latitude,
          location_longitude: location.longitude,
          location_address: location.address || null,
        });
      }

      // Save form data
      const formPayload = {
        category_id: categoryId,
        user_id: user?.id,
        district,
        block_name: blockName,
        sc_name: scName,
        facility_name: facilityName,
        catchment_population: catchmentPopulation,
        total_villages: totalVillages,
        distance_from_phc: distanceFromPHC,
        last_visit: lastVisit || null,
        date: date || new Date().toISOString().split('T')[0],
        monitor_name: monitorName,
        staff_available: staffAvailable,
        staff_not_available: staffNotAvailable,
        infrastructure,
        human_resources: humanResources,
        equipment,
        essential_drugs: essentialDrugs,
        essential_supplies: essentialSupplies,
        service_delivery: serviceDelivery,
        essential_skills: essentialSkills,
        record_maintenance: recordMaintenance,
        referral_linkages: referralLinkages,
        iec_display: iecDisplay,
        monitoring_supervisors: monitoringSupervisors,
        key_findings: keyFindings,
        general_comments: generalComments,
      };

      await saveSubCenterMonitoringForm(inspectionResult.id, formPayload);

      // Upload photos
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          await uploadPhoto(inspectionResult.id, photos[i], `photo_${i + 1}.jpg`, i + 1);
        }
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

  const updateChecklistItem = (items: ChecklistItem[], setItems: (items: ChecklistItem[]) => void, index: number, field: 'value' | 'comments', value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const updateEquipmentItem = (index: number, field: keyof Equipment, value: any) => {
    const updated = [...equipment];
    if (field === 'availableFunctional' || field === 'availableNotFunctional' || field === 'notAvailable') {
      if (value) {
        updated[index] = {
          ...updated[index],
          availableFunctional: field === 'availableFunctional',
          availableNotFunctional: field === 'availableNotFunctional',
          notAvailable: field === 'notAvailable',
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEquipment(updated);
  };

  const renderChecklistTable = (items: ChecklistItem[], setItems: (items: ChecklistItem[]) => void, title: string) => (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.itemLabel}>{item.id}. {item.label}</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Status:</Text>
            <View style={styles.radioGroup}>
              {['Yes', 'No', 'N/A'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioButton}
                  onPress={() => updateChecklistItem(items, setItems, index, 'value', option)}
                  disabled={!isEditMode}
                >
                  <View style={[styles.radioOuter, item.value === option && styles.radioOuterSelected]}>
                    {item.value === option && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Input
            label="Comments"
            value={item.comments || ''}
            onChangeText={(text) => updateChecklistItem(items, setItems, index, 'comments', text)}
            placeholder="Enter comments"
            editable={isEditMode}
          />
        </View>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <View>
            <Text style={styles.headerTitle}>Sub Centre Monitoring Checklist</Text>
            <Text style={styles.headerSubtitle}>उपकेंद्र निरीक्षण यादी</Text>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Input
              label="District"
              value={district}
              onChangeText={setDistrict}
              placeholder="Enter district"
              editable={isEditMode}
            />
            <Input
              label="Block Name"
              value={blockName}
              onChangeText={setBlockName}
              placeholder="Enter block name"
              editable={isEditMode}
            />
            <Input
              label="Sub Centre Name *"
              value={scName}
              onChangeText={setScName}
              placeholder="Enter sub centre name"
              editable={isEditMode}
            />
            <Input
              label="Facility Name"
              value={facilityName}
              onChangeText={setFacilityName}
              placeholder="Enter facility name"
              editable={isEditMode}
            />
            <Input
              label="Catchment Population"
              value={catchmentPopulation}
              onChangeText={setCatchmentPopulation}
              placeholder="Enter population"
              keyboardType="numeric"
              editable={isEditMode}
            />
            <Input
              label="Total Villages"
              value={totalVillages}
              onChangeText={setTotalVillages}
              placeholder="Enter number of villages"
              keyboardType="numeric"
              editable={isEditMode}
            />
            <Input
              label="Distance from PHC (km)"
              value={distanceFromPHC}
              onChangeText={setDistanceFromPHC}
              placeholder="Enter distance"
              keyboardType="numeric"
              editable={isEditMode}
            />
            <DateInput
              label="Last Visit Date"
              value={lastVisit}
              onChangeDate={setLastVisit}
              placeholder="Select last visit date"
            />
            <DateInput
              label="Current Visit Date"
              value={date}
              onChangeDate={setDate}
              placeholder="Select current visit date"
              minimumDate={new Date()}
            />
            <Input
              label="Monitor Name"
              value={monitorName}
              onChangeText={setMonitorName}
              placeholder="Enter monitor name"
              editable={isEditMode}
            />
            <Input
              label="Staff Available"
              value={staffAvailable}
              onChangeText={setStaffAvailable}
              placeholder="Enter staff available"
              multiline
              numberOfLines={2}
              editable={isEditMode}
            />
            <Input
              label="Staff Not Available"
              value={staffNotAvailable}
              onChangeText={setStaffNotAvailable}
              placeholder="Enter staff not available"
              multiline
              numberOfLines={2}
              editable={isEditMode}
            />
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );

      case 1: // Infrastructure
        return renderChecklistTable(infrastructure, setInfrastructure, 'Section 1: Infrastructure');

      case 2: // Human Resources
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 2: Human Resources</Text>
            {humanResources.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.label}</Text>
                <Input
                  label="Numbers"
                  value={item.numbers}
                  onChangeText={(text) => {
                    const updated = [...humanResources];
                    updated[index].numbers = text;
                    setHumanResources(updated);
                  }}
                  keyboardType="numeric"
                  editable={isEditMode}
                />
                <Input
                  label="Training"
                  value={item.training}
                  onChangeText={(text) => {
                    const updated = [...humanResources];
                    updated[index].training = text;
                    setHumanResources(updated);
                  }}
                  editable={isEditMode}
                />
                <Input
                  label="Remarks"
                  value={item.remarks}
                  onChangeText={(text) => {
                    const updated = [...humanResources];
                    updated[index].remarks = text;
                    setHumanResources(updated);
                  }}
                  editable={isEditMode}
                />
              </View>
            ))}
          </View>
        );

      case 3: // Equipment
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 3: Equipment</Text>
            {equipment.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.equipment}</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => updateEquipmentItem(index, 'availableFunctional', !item.availableFunctional)}
                    disabled={!isEditMode}
                  >
                    <View style={[styles.checkbox, item.availableFunctional && styles.checkboxChecked]}>
                      {item.availableFunctional && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Available & Functional</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => updateEquipmentItem(index, 'availableNotFunctional', !item.availableNotFunctional)}
                    disabled={!isEditMode}
                  >
                    <View style={[styles.checkbox, item.availableNotFunctional && styles.checkboxChecked]}>
                      {item.availableNotFunctional && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Available Not Functional</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => updateEquipmentItem(index, 'notAvailable', !item.notAvailable)}
                    disabled={!isEditMode}
                  >
                    <View style={[styles.checkbox, item.notAvailable && styles.checkboxChecked]}>
                      {item.notAvailable && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Not Available</Text>
                  </TouchableOpacity>
                </View>
                <Input
                  label="Remarks"
                  value={item.remarks}
                  onChangeText={(text) => updateEquipmentItem(index, 'remarks', text)}
                  editable={isEditMode}
                />
              </View>
            ))}
          </View>
        );

      case 4: // Essential Drugs
        return renderChecklistTable(essentialDrugs, setEssentialDrugs, 'Section 4: Essential Drugs');

      case 5: // Essential Supplies
        return renderChecklistTable(essentialSupplies, setEssentialSupplies, 'Section 5: Essential Supplies');

      case 6: // Service Delivery
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 6: Service Delivery</Text>
            {serviceDelivery.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.label}</Text>
                <Input
                  label="Actual"
                  value={item.actual}
                  onChangeText={(text) => {
                    const updated = [...serviceDelivery];
                    updated[index].actual = text;
                    setServiceDelivery(updated);
                  }}
                  keyboardType="numeric"
                  editable={isEditMode}
                />
                <Input
                  label="Expected"
                  value={item.expected}
                  onChangeText={(text) => {
                    const updated = [...serviceDelivery];
                    updated[index].expected = text;
                    setServiceDelivery(updated);
                  }}
                  keyboardType="numeric"
                  editable={isEditMode}
                />
                <Input
                  label="Remarks"
                  value={item.remarks}
                  onChangeText={(text) => {
                    const updated = [...serviceDelivery];
                    updated[index].remarks = text;
                    setServiceDelivery(updated);
                  }}
                  editable={isEditMode}
                />
              </View>
            ))}
          </View>
        );

      case 7: // Essential Skills
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 7: Essential Skills</Text>
            {essentialSkills.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.skill}</Text>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Knowledge:</Text>
                  <View style={styles.radioGroup}>
                    {['Yes', 'No', 'Partial'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioButton}
                        onPress={() => {
                          const updated = [...essentialSkills];
                          updated[index].knowledge = option;
                          setEssentialSkills(updated);
                        }}
                        disabled={!isEditMode}
                      >
                        <View style={[styles.radioOuter, item.knowledge === option && styles.radioOuterSelected]}>
                          {item.knowledge === option && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Skill Level:</Text>
                  <View style={styles.radioGroup}>
                    {['Excellent', 'Good', 'Average', 'Poor', 'N/A'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioButton}
                        onPress={() => {
                          const updated = [...essentialSkills];
                          updated[index].skillLevel = option;
                          setEssentialSkills(updated);
                        }}
                        disabled={!isEditMode}
                      >
                        <View style={[styles.radioOuter, item.skillLevel === option && styles.radioOuterSelected]}>
                          {item.skillLevel === option && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Input
                  label="Remarks"
                  value={item.remarks}
                  onChangeText={(text) => {
                    const updated = [...essentialSkills];
                    updated[index].remarks = text;
                    setEssentialSkills(updated);
                  }}
                  editable={isEditMode}
                />
              </View>
            ))}
          </View>
        );

      case 8: // Record Maintenance
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 8: Record Maintenance</Text>
            {recordMaintenance.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.record}</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => {
                      const updated = [...recordMaintenance];
                      if (!item.availableUpdated) {
                        updated[index] = {
                          ...updated[index],
                          availableUpdated: true,
                          availableNotMaintained: false,
                          notAvailable: false
                        };
                      } else {
                        updated[index].availableUpdated = false;
                      }
                      setRecordMaintenance(updated);
                    }}
                    disabled={!isEditMode}
                  >
                    <View style={[styles.checkbox, item.availableUpdated && styles.checkboxChecked]}>
                      {item.availableUpdated && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Available & Updated</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => {
                      const updated = [...recordMaintenance];
                      if (!item.availableNotMaintained) {
                        updated[index] = {
                          ...updated[index],
                          availableUpdated: false,
                          availableNotMaintained: true,
                          notAvailable: false
                        };
                      } else {
                        updated[index].availableNotMaintained = false;
                      }
                      setRecordMaintenance(updated);
                    }}
                    disabled={!isEditMode}
                  >
                    <View style={[styles.checkbox, item.availableNotMaintained && styles.checkboxChecked]}>
                      {item.availableNotMaintained && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Available Not Maintained</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => {
                      const updated = [...recordMaintenance];
                      if (!item.notAvailable) {
                        updated[index] = {
                          ...updated[index],
                          availableUpdated: false,
                          availableNotMaintained: false,
                          notAvailable: true
                        };
                      } else {
                        updated[index].notAvailable = false;
                      }
                      setRecordMaintenance(updated);
                    }}
                    disabled={!isEditMode}
                  >
                    <View style={[styles.checkbox, item.notAvailable && styles.checkboxChecked]}>
                      {item.notAvailable && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Not Available</Text>
                  </TouchableOpacity>
                </View>
                <Input
                  label="Remarks"
                  value={item.remarks}
                  onChangeText={(text) => {
                    const updated = [...recordMaintenance];
                    updated[index].remarks = text;
                    setRecordMaintenance(updated);
                  }}
                  editable={isEditMode}
                />
              </View>
            ))}
          </View>
        );

      case 9: // Referral Linkages
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 9: Referral Linkages</Text>
            {referralLinkages.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.modeOfTransport}</Text>
                <Input
                  label="Women Transported"
                  value={item.womenTransported}
                  onChangeText={(text) => {
                    const updated = [...referralLinkages];
                    updated[index].womenTransported = text;
                    setReferralLinkages(updated);
                  }}
                  keyboardType="numeric"
                  editable={isEditMode}
                />
                <Input
                  label="Sick Infants Transported"
                  value={item.sickInfantsTransported}
                  onChangeText={(text) => {
                    const updated = [...referralLinkages];
                    updated[index].sickInfantsTransported = text;
                    setReferralLinkages(updated);
                  }}
                  keyboardType="numeric"
                  editable={isEditMode}
                />
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Free/Paid:</Text>
                  <View style={styles.radioGroup}>
                    {['Free', 'Paid'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioButton}
                        onPress={() => {
                          const updated = [...referralLinkages];
                          updated[index].freePaid = option;
                          setReferralLinkages(updated);
                        }}
                        disabled={!isEditMode}
                      >
                        <View style={[styles.radioOuter, item.freePaid === option && styles.radioOuterSelected]}>
                          {item.freePaid === option && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 10: // IEC Display
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 10: IEC Display</Text>
            {iecDisplay.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. {item.material}</Text>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    const updated = [...iecDisplay];
                    updated[index].available = !updated[index].available;
                    setIecDisplay(updated);
                  }}
                  disabled={!isEditMode}
                >
                  <View style={[styles.checkbox, item.available && styles.checkboxChecked]}>
                    {item.available && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Available</Text>
                </TouchableOpacity>
                <Input
                  label="Remarks"
                  value={item.remarks}
                  onChangeText={(text) => {
                    const updated = [...iecDisplay];
                    updated[index].remarks = text;
                    setIecDisplay(updated);
                  }}
                  editable={isEditMode}
                />
              </View>
            ))}
          </View>
        );

      case 11: // Monitoring & Findings
        return (
          <View>
            <Text style={styles.sectionTitle}>Section 11: Monitoring Supervisors</Text>
            {monitoringSupervisors.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. Supervisor {index + 1}</Text>
                <Input
                  label="Name"
                  value={item.name}
                  onChangeText={(text) => {
                    const updated = [...monitoringSupervisors];
                    updated[index].name = text;
                    setMonitoringSupervisors(updated);
                  }}
                  placeholder="Enter name"
                  editable={isEditMode}
                />
                <Input
                  label="Designation"
                  value={item.designation}
                  onChangeText={(text) => {
                    const updated = [...monitoringSupervisors];
                    updated[index].designation = text;
                    setMonitoringSupervisors(updated);
                  }}
                  placeholder="Enter designation"
                  editable={isEditMode}
                />
                <DateInput
                  label="Date of Visit"
                  value={item.dateOfVisit}
                  onChangeDate={(date) => {
                    const updated = [...monitoringSupervisors];
                    updated[index].dateOfVisit = date;
                    setMonitoringSupervisors(updated);
                  }}
                  placeholder="Select date"
                  minimumDate={new Date()}
                />
                <Input
                  label="Signature"
                  value={item.sign}
                  onChangeText={(text) => {
                    const updated = [...monitoringSupervisors];
                    updated[index].sign = text;
                    setMonitoringSupervisors(updated);
                  }}
                  placeholder="Enter signature"
                  editable={isEditMode}
                />
              </View>
            ))}

            <Text style={styles.sectionTitle}>Section 12: Key Findings</Text>
            {keyFindings.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.itemLabel}>{item.id}. Finding {item.id}</Text>
                <Input
                  label="Key Finding"
                  value={item.keyFinding}
                  onChangeText={(text) => {
                    const updated = [...keyFindings];
                    updated[index].keyFinding = text;
                    setKeyFindings(updated);
                  }}
                  placeholder="Enter key finding"
                  multiline
                  numberOfLines={2}
                  editable={isEditMode}
                />
                <Input
                  label="Action Required"
                  value={item.action}
                  onChangeText={(text) => {
                    const updated = [...keyFindings];
                    updated[index].action = text;
                    setKeyFindings(updated);
                  }}
                  placeholder="Enter action required"
                  multiline
                  numberOfLines={2}
                  editable={isEditMode}
                />
                <Input
                  label="Responsible Person"
                  value={item.responsible}
                  onChangeText={(text) => {
                    const updated = [...keyFindings];
                    updated[index].responsible = text;
                    setKeyFindings(updated);
                  }}
                  placeholder="Enter responsible person"
                  editable={isEditMode}
                />
                <Input
                  label="Timeline"
                  value={item.timeline}
                  onChangeText={(text) => {
                    const updated = [...keyFindings];
                    updated[index].timeline = text;
                    setKeyFindings(updated);
                  }}
                  placeholder="Enter timeline"
                  editable={isEditMode}
                />
              </View>
            ))}

            <Text style={styles.sectionTitle}>General Comments</Text>
            <Input
              label="Overall Comments & Recommendations"
              value={generalComments}
              onChangeText={setGeneralComments}
              placeholder="Enter overall comments and recommendations..."
              multiline
              numberOfLines={6}
              editable={isEditMode}
            />
          </View>
        );

      case 12: // Photos
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
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
      <ScrollView style={styles.content}>
        <Card>{renderStep()}</Card>
      </ScrollView>
      <View style={styles.footer}>
        {currentStep < STEPS.length - 1 ? (
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
            <Button
              title={t('common.next')}
              onPress={handleNext}
              style={styles.button}
              disabled={loading}
            />
          </View>
        ) : (
          <View style={styles.submitButtons}>
            <Button
              title={t('fims.submitInspection')}
              onPress={handleSubmit}
              loading={loading}
            />
            <Button
              title={t('fims.saveAsDraft')}
              onPress={handleSaveAsDraft}
              variant="outline"
              loading={loading}
            />
            {currentStep > 0 && (
              <Button
                title={t('common.previous')}
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
  content: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, fontWeight: '600', color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12, marginTop: 16 },
  tableRow: { backgroundColor: '#f9fafb', padding: 12, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  itemLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  pickerContainer: { marginVertical: 8 },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  radioButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  radioOuterSelected: { borderColor: '#3b82f6' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6' },
  radioText: { fontSize: 14, color: '#374151' },
  checkboxGroup: { marginVertical: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  checkboxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkmark: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  checkboxLabel: { fontSize: 14, color: '#374151', flex: 1 },
  footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 4 },
  submitButtons: { flexDirection: 'column', gap: 8 },
});
