import React, { useState, useEffect } from 'react';
//import { fetchCategories } from '../../services/fimsService';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Dimensions,
} from 'react-native';

//import { Dimensions } from 'react-native';


import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto, fetchCategories, getInspectionById, updateInspection } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'AnganwadiTapasani'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'AnganwadiTapasani'>;
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;


const STEPS = ['Basic', 'Facilities', 'Equipment', 'Records', 'Schedule', 'Nutrition', 'Health', 'Community', 'Children', 'Location', 'Photos'];

interface AnganwadiFormData {
  // Basic Information
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;

  // Building and Facilities
  building_type: string;
  room_availability: boolean;
  toilet_facility: boolean;
  drinking_water: boolean;
  electricity: boolean;
  kitchen_garden: boolean;
  independent_kitchen: boolean;
  women_health_checkup_space: boolean;

  // Equipment and Materials - Weighing Scales
  weighing_machine: boolean;
  baby_weighing_scale: boolean;
  hammock_weighing_scale: boolean;
  adult_weighing_scale: boolean;
  height_measuring_scale: boolean;

  // Equipment and Materials - General
  first_aid_kit: boolean;
  teaching_materials: boolean;
  toys_available: boolean;
  cooking_utensils: boolean;
  water_storage_containers: boolean;
  medicine_kits: boolean;
  pre_school_kit: boolean;

  // Records and Documentation
  attendance_register: boolean;
  growth_chart_updated: boolean;
  vaccination_records: boolean;
  nutrition_records: boolean;
  all_registers: boolean;
  monthly_progress_reports: boolean;

  // Schedule and Operations
  timetable_available: boolean;
  timetable_followed: boolean;
  supervisor_regular_attendance: boolean;

  // Children Information
  total_registered_children: string;
  children_present_today: string;
  children_0_3_years: string;
  children_3_6_years: string;
  preschool_education_registered: string;
  preschool_education_present: string;

  // Nutrition and Food Services
  hot_meal_served: boolean;
  take_home_ration: boolean;
  monthly_25_days_meals: boolean;
  thr_provided_regularly: boolean;
  food_provider: string;
  supervisor_participation: string;
  food_distribution_decentralized: boolean;
  children_food_taste_preference: string;
  prescribed_protein_calories: boolean;
  prescribed_weight_food: boolean;
  lab_sample_date: string;

  // Health Services
  health_checkup_conducted: boolean;
  immunization_updated: boolean;
  vitamin_a_given: boolean;
  iron_tablets_given: boolean;
  regular_weighing: boolean;
  growth_chart_accuracy: boolean;
  vaccination_health_checkup_regular: boolean;
  vaccination_schedule_awareness: boolean;

  // Community Participation
  village_health_nutrition_planning: string;
  children_attendance_comparison: string;
  preschool_programs_conducted: string;
  community_participation: string;
  committee_member_participation: string;
  home_visits_guidance: string;
  public_opinion_improvement: string;

  // Final Details
  general_observations: string;
  recommendations: string;
  action_required: string;
  suggestions: string;
  visit_date: string;
  inspector_designation: string;
  inspector_name: string;
}

export default function AnganwadiTapasaniScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId, inspectionId } = route.params;

  // default visit date: today's date in YYYY-MM-DD
  const todayIso = new Date().toISOString().slice(0, 10);

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    // If this screen was opened with an existing inspectionId, start in read-only mode.
    // Otherwise (creating new), enable editing by default.
    return !route.params?.inspectionId;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoMetas, setPhotoMetas] = useState<Array<{ latitude?: number; longitude?: number; accuracy?: number }>>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [formData, setFormData] = useState<AnganwadiFormData>({
    anganwadi_name: '',
    anganwadi_number: '',
    supervisor_name: '',
    helper_name: '',
    village_name: '',
    building_type: 'own',
    room_availability: false,
    toilet_facility: false,
    drinking_water: false,
    electricity: false,
    kitchen_garden: false,
    independent_kitchen: false,
    women_health_checkup_space: false,
    weighing_machine: false,
    baby_weighing_scale: false,
    hammock_weighing_scale: false,
    adult_weighing_scale: false,
    height_measuring_scale: false,
    first_aid_kit: false,
    teaching_materials: false,
    toys_available: false,
    cooking_utensils: false,
    water_storage_containers: false,
    medicine_kits: false,
    pre_school_kit: false,
    attendance_register: false,
    growth_chart_updated: false,
    vaccination_records: false,
    nutrition_records: false,
    all_registers: false,
    monthly_progress_reports: false,
    timetable_available: false,
    timetable_followed: false,
    supervisor_regular_attendance: false,
    total_registered_children: '',
    children_present_today: '',
    children_0_3_years: '',
    children_3_6_years: '',
    preschool_education_registered: '',
    preschool_education_present: '',
    hot_meal_served: false,
    take_home_ration: false,
    monthly_25_days_meals: false,
    thr_provided_regularly: false,
    food_provider: '',
    supervisor_participation: '',
    food_distribution_decentralized: false,
    children_food_taste_preference: '',
    prescribed_protein_calories: false,
    prescribed_weight_food: false,
    lab_sample_date: '',
    health_checkup_conducted: false,
    immunization_updated: false,
    vitamin_a_given: false,
    iron_tablets_given: false,
    regular_weighing: false,
    growth_chart_accuracy: false,
    vaccination_health_checkup_regular: false,
    vaccination_schedule_awareness: false,
    village_health_nutrition_planning: '',
    children_attendance_comparison: '',
    preschool_programs_conducted: '',
    community_participation: '',
    committee_member_participation: '',
    home_visits_guidance: '',
    public_opinion_improvement: '',
    general_observations: '',
    recommendations: '',
    action_required: '',
    suggestions: '',
    visit_date: todayIso,
    inspector_designation: '',
    inspector_name: '',
  });

  const updateFormData = (field: keyof AnganwadiFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Load existing inspection/form when editing
  useEffect(() => {
    if (!inspectionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const inspection = await getInspectionById(inspectionId);
        if (inspection) {
          setLocation({
            latitude: inspection.location_latitude || 0,
            longitude: inspection.location_longitude || 0,
            accuracy: null,
            address: inspection.location_address || null,
            timestamp: Date.now(),
          });
          if (inspection.photos && inspection.photos.length > 0) {
            const urls = inspection.photos.map((p: any) => p.photo_url);
            setPhotos(urls);
            // Parse photo metadata (description) when available so addresses/icons show
            const metas = inspection.photos.map((p: any) => {
              try {
                const desc = p.description;
                if (!desc) return {} as any;
                const parsed = typeof desc === 'string' ? JSON.parse(desc) : desc;
                if (parsed && parsed.photo_location) {
                  const pl = parsed.photo_location;
                  return { latitude: pl.latitude, longitude: pl.longitude, accuracy: pl.accuracy ?? undefined, address: pl.address ?? pl.name ?? undefined };
                }
                if (typeof parsed === 'string') return { address: parsed } as any;
                if (parsed && parsed.address) return { address: parsed.address } as any;
              } catch (e) {
                // ignore parse errors
              }
              return {} as any;
            });
            setPhotoMetas(metas as any[]);
          }
        }

        const { data: formRows, error: formError } = await supabase
          .from('fims_anganwadi_forms')
          .select('*')
          .eq('inspection_id', inspectionId)
          .single();

        if (!formError && formRows) {
          const { inspection_id: _ignore, ...rest } = formRows;
          // Preserve existing visit_date if present; otherwise keep today's default
          setFormData((prev: any) => ({ ...prev, ...rest, visit_date: rest.visit_date ?? prev.visit_date }));
        }
      } catch (err) {
        console.error('Error loading edit data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [inspectionId]);

  const handleToggleEdit = () => {
    // Toggle edit mode and show a confirmation alert so we can detect presses
    setIsEditMode((prev) => {
      const next = !prev;
      Alert.alert('Edit Mode', next ? 'Editing enabled' : 'Editing disabled');
      return next;
    });
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.anganwadi_name || !formData.supervisor_name || !formData.visit_date) {
        Alert.alert(t('common.error'), 'Please fill in required fields (name, supervisor and visit date)');
        return;
      }
    }

    if (currentStep === 9) {
      if (!location) {
        Alert.alert(t('common.error'), 'Please capture location');
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
        filled_by_name: formData.supervisor_name,
        status: 'draft',
        location_name: location?.address || 'Unknown Location',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      const anganwadiData = {
        inspection_id: inspection.id,
        filled_by_name: formData.supervisor_name || '',
        anganwadi_name: formData.anganwadi_name,
        anganwadi_number: formData.anganwadi_number,
        supervisor_name: formData.supervisor_name,
        helper_name: formData.helper_name,
        village_name: formData.village_name,
        building_type: formData.building_type,
        room_availability: formData.room_availability,
        toilet_facility: formData.toilet_facility,
        drinking_water: formData.drinking_water,
        electricity: formData.electricity,
        kitchen_garden: formData.kitchen_garden,
        independent_kitchen: formData.independent_kitchen,
        women_health_checkup_space: formData.women_health_checkup_space,
        weighing_machine: formData.weighing_machine,
        baby_weighing_scale: formData.baby_weighing_scale,
        hammock_weighing_scale: formData.hammock_weighing_scale,
        adult_weighing_scale: formData.adult_weighing_scale,
        height_measuring_scale: formData.height_measuring_scale,
        first_aid_kit: formData.first_aid_kit,
        teaching_materials: formData.teaching_materials,
        toys_available: formData.toys_available,
        cooking_utensils: formData.cooking_utensils,
        water_storage_containers: formData.water_storage_containers,
        medicine_kits: formData.medicine_kits,
        pre_school_kit: formData.pre_school_kit,
        attendance_register: formData.attendance_register,
        growth_chart_updated: formData.growth_chart_updated,
        vaccination_records: formData.vaccination_records,
        nutrition_records: formData.nutrition_records,
        all_registers: formData.all_registers,
        monthly_progress_reports: formData.monthly_progress_reports,
        timetable_available: formData.timetable_available,
        timetable_followed: formData.timetable_followed,
        supervisor_regular_attendance: formData.supervisor_regular_attendance,
        total_registered_children: parseInt(formData.total_registered_children) || 0,
        children_present_today: parseInt(formData.children_present_today) || 0,
        children_0_3_years: parseInt(formData.children_0_3_years) || 0,
        children_3_6_years: parseInt(formData.children_3_6_years) || 0,
        preschool_education_registered: parseInt(formData.preschool_education_registered) || 0,
        preschool_education_present: parseInt(formData.preschool_education_present) || 0,
        hot_meal_served: formData.hot_meal_served,
        take_home_ration: formData.take_home_ration,
        monthly_25_days_meals: formData.monthly_25_days_meals,
        thr_provided_regularly: formData.thr_provided_regularly,
        food_provider: formData.food_provider,
        supervisor_participation: formData.supervisor_participation,
        food_distribution_decentralized: formData.food_distribution_decentralized,
        children_food_taste_preference: formData.children_food_taste_preference,
        prescribed_protein_calories: formData.prescribed_protein_calories,
        prescribed_weight_food: formData.prescribed_weight_food,
        lab_sample_date: formData.lab_sample_date,
        health_checkup_conducted: formData.health_checkup_conducted,
        immunization_updated: formData.immunization_updated,
        vitamin_a_given: formData.vitamin_a_given,
        iron_tablets_given: formData.iron_tablets_given,
        regular_weighing: formData.regular_weighing,
        growth_chart_accuracy: formData.growth_chart_accuracy,
        vaccination_health_checkup_regular: formData.vaccination_health_checkup_regular,
        vaccination_schedule_awareness: formData.vaccination_schedule_awareness,
        village_health_nutrition_planning: formData.village_health_nutrition_planning,
        children_attendance_comparison: formData.children_attendance_comparison,
        preschool_programs_conducted: formData.preschool_programs_conducted,
        community_participation: formData.community_participation,
        committee_member_participation: formData.committee_member_participation,
        home_visits_guidance: formData.home_visits_guidance,
        public_opinion_improvement: formData.public_opinion_improvement,
        general_observations: formData.general_observations,
        recommendations: formData.recommendations,
        action_required: formData.action_required,
        suggestions: formData.suggestions,
        visit_date: formData.visit_date,
        inspector_designation: formData.inspector_designation,
        inspector_name: formData.inspector_name,
      };

      const { error: formError } = await supabase
        .from('fims_anganwadi_forms')
        .insert(anganwadiData);

      if (formError) {
        console.error('Form insert error:', formError);
        throw formError;
      }

      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert(t('common.error'), 'Failed to save inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert(t('common.error'), 'Please add at least one photo');
      return;
    }

    try {
      setLoading(true);
      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: formData.supervisor_name,
        status: 'submitted',
        location_name: location?.address || 'Unknown Location',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      const anganwadiData = {
        inspection_id: inspection.id,
        filled_by_name: formData.supervisor_name || '',
        anganwadi_name: formData.anganwadi_name,
        anganwadi_number: formData.anganwadi_number,
        supervisor_name: formData.supervisor_name,
        helper_name: formData.helper_name,
        village_name: formData.village_name,
        building_type: formData.building_type,
        room_availability: formData.room_availability,
        toilet_facility: formData.toilet_facility,
        drinking_water: formData.drinking_water,
        electricity: formData.electricity,
        kitchen_garden: formData.kitchen_garden,
        independent_kitchen: formData.independent_kitchen,
        women_health_checkup_space: formData.women_health_checkup_space,
        weighing_machine: formData.weighing_machine,
        baby_weighing_scale: formData.baby_weighing_scale,
        hammock_weighing_scale: formData.hammock_weighing_scale,
        adult_weighing_scale: formData.adult_weighing_scale,
        height_measuring_scale: formData.height_measuring_scale,
        first_aid_kit: formData.first_aid_kit,
        teaching_materials: formData.teaching_materials,
        toys_available: formData.toys_available,
        cooking_utensils: formData.cooking_utensils,
        water_storage_containers: formData.water_storage_containers,
        medicine_kits: formData.medicine_kits,
        pre_school_kit: formData.pre_school_kit,
        attendance_register: formData.attendance_register,
        growth_chart_updated: formData.growth_chart_updated,
        vaccination_records: formData.vaccination_records,
        nutrition_records: formData.nutrition_records,
        all_registers: formData.all_registers,
        monthly_progress_reports: formData.monthly_progress_reports,
        timetable_available: formData.timetable_available,
        timetable_followed: formData.timetable_followed,
        supervisor_regular_attendance: formData.supervisor_regular_attendance,
        total_registered_children: parseInt(formData.total_registered_children) || 0,
        children_present_today: parseInt(formData.children_present_today) || 0,
        children_0_3_years: parseInt(formData.children_0_3_years) || 0,
        children_3_6_years: parseInt(formData.children_3_6_years) || 0,
        preschool_education_registered: parseInt(formData.preschool_education_registered) || 0,
        preschool_education_present: parseInt(formData.preschool_education_present) || 0,
        hot_meal_served: formData.hot_meal_served,
        take_home_ration: formData.take_home_ration,
        monthly_25_days_meals: formData.monthly_25_days_meals,
        thr_provided_regularly: formData.thr_provided_regularly,
        food_provider: formData.food_provider,
        supervisor_participation: formData.supervisor_participation,
        food_distribution_decentralized: formData.food_distribution_decentralized,
        children_food_taste_preference: formData.children_food_taste_preference,
        prescribed_protein_calories: formData.prescribed_protein_calories,
        prescribed_weight_food: formData.prescribed_weight_food,
        lab_sample_date: formData.lab_sample_date,
        health_checkup_conducted: formData.health_checkup_conducted,
        immunization_updated: formData.immunization_updated,
        vitamin_a_given: formData.vitamin_a_given,
        iron_tablets_given: formData.iron_tablets_given,
        regular_weighing: formData.regular_weighing,
        growth_chart_accuracy: formData.growth_chart_accuracy,
        vaccination_health_checkup_regular: formData.vaccination_health_checkup_regular,
        vaccination_schedule_awareness: formData.vaccination_schedule_awareness,
        village_health_nutrition_planning: formData.village_health_nutrition_planning,
        children_attendance_comparison: formData.children_attendance_comparison,
        preschool_programs_conducted: formData.preschool_programs_conducted,
        community_participation: formData.community_participation,
        committee_member_participation: formData.committee_member_participation,
        home_visits_guidance: formData.home_visits_guidance,
        public_opinion_improvement: formData.public_opinion_improvement,
        general_observations: formData.general_observations,
        recommendations: formData.recommendations,
        action_required: formData.action_required,
        suggestions: formData.suggestions,
        visit_date: formData.visit_date,
        inspector_designation: formData.inspector_designation,
        inspector_name: formData.inspector_name,
      };

      const { error: formError } = await supabase
        .from('fims_anganwadi_forms')
        .insert(anganwadiData);

      if (formError) {
        console.error('Form insert error:', formError);
        throw formError;
      }

      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i] || '';
        // Skip already-uploaded remote images (they are stored in DB)
        if (uri.toLowerCase().startsWith('http')) continue;
        const meta = photoMetas[i];
        await uploadPhoto(inspection.id, uri, `photo_${i + 1}.jpg`, i + 1, meta);
      }

      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(t('common.error'), 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  // Save edits for existing inspection/form
  const handleSaveEdits = async () => {
    if (!inspectionId) return;
    try {
      setLoading(true);

      // Update inspection basic fields
      await updateInspection(inspectionId, {
        filled_by_name: formData.supervisor_name,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      const anganwadiData: any = {
        filled_by_name: formData.supervisor_name || '',
        anganwadi_name: formData.anganwadi_name,
        anganwadi_number: formData.anganwadi_number,
        supervisor_name: formData.supervisor_name,
        helper_name: formData.helper_name,
        village_name: formData.village_name,
        building_type: formData.building_type,
        room_availability: formData.room_availability,
        toilet_facility: formData.toilet_facility,
        drinking_water: formData.drinking_water,
        electricity: formData.electricity,
        kitchen_garden: formData.kitchen_garden,
        independent_kitchen: formData.independent_kitchen,
        women_health_checkup_space: formData.women_health_checkup_space,
        weighing_machine: formData.weighing_machine,
        baby_weighing_scale: formData.baby_weighing_scale,
        hammock_weighing_scale: formData.hammock_weighing_scale,
        adult_weighing_scale: formData.adult_weighing_scale,
        height_measuring_scale: formData.height_measuring_scale,
        first_aid_kit: formData.first_aid_kit,
        teaching_materials: formData.teaching_materials,
        toys_available: formData.toys_available,
        cooking_utensils: formData.cooking_utensils,
        water_storage_containers: formData.water_storage_containers,
        medicine_kits: formData.medicine_kits,
        pre_school_kit: formData.pre_school_kit,
        attendance_register: formData.attendance_register,
        growth_chart_updated: formData.growth_chart_updated,
        vaccination_records: formData.vaccination_records,
        nutrition_records: formData.nutrition_records,
        all_registers: formData.all_registers,
        monthly_progress_reports: formData.monthly_progress_reports,
        timetable_available: formData.timetable_available,
        timetable_followed: formData.timetable_followed,
        supervisor_regular_attendance: formData.supervisor_regular_attendance,
        total_registered_children: parseInt(formData.total_registered_children) || 0,
        children_present_today: parseInt(formData.children_present_today) || 0,
        children_0_3_years: parseInt(formData.children_0_3_years) || 0,
        children_3_6_years: parseInt(formData.children_3_6_years) || 0,
        preschool_education_registered: parseInt(formData.preschool_education_registered) || 0,
        preschool_education_present: parseInt(formData.preschool_education_present) || 0,
        hot_meal_served: formData.hot_meal_served,
        take_home_ration: formData.take_home_ration,
        monthly_25_days_meals: formData.monthly_25_days_meals,
        thr_provided_regularly: formData.thr_provided_regularly,
        food_provider: formData.food_provider,
        supervisor_participation: formData.supervisor_participation,
        food_distribution_decentralized: formData.food_distribution_decentralized,
        children_food_taste_preference: formData.children_food_taste_preference,
        prescribed_protein_calories: formData.prescribed_protein_calories,
        prescribed_weight_food: formData.prescribed_weight_food,
        lab_sample_date: formData.lab_sample_date,
        health_checkup_conducted: formData.health_checkup_conducted,
        immunization_updated: formData.immunization_updated,
        vitamin_a_given: formData.vitamin_a_given,
        iron_tablets_given: formData.iron_tablets_given,
        regular_weighing: formData.regular_weighing,
        growth_chart_accuracy: formData.growth_chart_accuracy,
        vaccination_health_checkup_regular: formData.vaccination_health_checkup_regular,
        vaccination_schedule_awareness: formData.vaccination_schedule_awareness,
        village_health_nutrition_planning: formData.village_health_nutrition_planning,
        children_attendance_comparison: formData.children_attendance_comparison,
        preschool_programs_conducted: formData.preschool_programs_conducted,
        community_participation: formData.community_participation,
        committee_member_participation: formData.committee_member_participation,
        home_visits_guidance: formData.home_visits_guidance,
        public_opinion_improvement: formData.public_opinion_improvement,
        general_observations: formData.general_observations,
        recommendations: formData.recommendations,
        action_required: formData.action_required,
        suggestions: formData.suggestions,
        visit_date: formData.visit_date,
        inspector_designation: formData.inspector_designation,
        inspector_name: formData.inspector_name,
      };

      const { error: updateError } = await supabase
        .from('fims_anganwadi_forms')
        .update(anganwadiData)
        .eq('inspection_id', inspectionId);

      if (updateError) {
        // Try insert if update failed (record might not exist)
        const { error: insertError } = await supabase
          .from('fims_anganwadi_forms')
          .insert({ inspection_id: inspectionId, ...anganwadiData });
        if (insertError) throw insertError;
      }

      // Upload any local photos (basic check for non-http URIs)
      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i] || '';
        if (!uri) continue;
        // Skip remote URLs (already uploaded)
        if (uri.toLowerCase().startsWith('http')) continue;
        const meta = photoMetas[i];
        await uploadPhoto(inspectionId, uri, `photo_${i + 1}.jpg`, i + 1, meta);
      }

      Alert.alert(t('common.success'), 'Changes saved');
      setIsEditMode(false);
    } catch (err) {
      console.error('Save edits error:', err);
      Alert.alert(t('common.error'), 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const renderSwitchRow = (label: string, value: boolean, field: keyof AnganwadiFormData) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={isEditMode ? (val) => updateFormData(field, val) : undefined}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={value ? '#2563eb' : '#f3f4f6'}
        disabled={!isEditMode}
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text style={styles.sectionTitle}>अंगणवाडी माहिती</Text>
            <Text style={styles.sectionSubtitle}>Anganwadi Information</Text>

            <Input
              editable={isEditMode}
              label="अंगणवाडीचे नाव *"
              value={formData.anganwadi_name}
              onChangeText={(text) => updateFormData('anganwadi_name', text)}
              placeholder="Enter anganwadi name"
            />

            <Input
              editable={isEditMode}
              label="अंगणवाडी क्रमांक"
              value={formData.anganwadi_number}
              onChangeText={(text) => updateFormData('anganwadi_number', text)}
              placeholder="Enter number"
            />

            <Input
              editable={isEditMode}
              label="पर्यवेक्षकाचे नाव *"
              value={formData.supervisor_name}
              onChangeText={(text) => updateFormData('supervisor_name', text)}
              placeholder="Enter supervisor name"
            />

            <DateInput
              label="भेटीची तारीख / Visit Date *"
              value={formData.visit_date}
              onChangeDate={(d) => updateFormData('visit_date', d)}
              minimumDate={new Date()}
              maximumDate={new Date()}
            />

            <Input
              editable={isEditMode}
              label="सहायकाचे नाव"
              value={formData.helper_name}
              onChangeText={(text) => updateFormData('helper_name', text)}
              placeholder="Enter helper name"
            />

            <Input
              editable={isEditMode}
              label="गावाचे नाव"
              value={formData.village_name}
              onChangeText={(text) => updateFormData('village_name', text)}
              placeholder="Enter village name"
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>सुविधा</Text>
            <Text style={styles.sectionSubtitle}>Facilities Available</Text>


            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>अंगणवाडी इमारत</Text>
              <Text style={styles.inputHint}>[स्वतःची/ भाड्याची/ मोफत/ इमारत नाही]</Text>
              <View style={styles.pickerContainer}>
                {['own', 'rented', 'free', 'no_building'].map((type) => (
                  <Button
                    key={type}
                    title={type === 'own' ? 'स्वतःची' : type === 'rented' ? 'भाड्याची' : type === 'free' ? 'मोफत' : 'इमारत नाही'}
                    onPress={() => updateFormData('building_type', type)}
                    variant={formData.building_type === type ? 'primary' : 'outline'}
                    style={styles.pickerButton}
                    disabled={!isEditMode}
                  />
                ))}
              </View>
            </View>


            {renderSwitchRow('शौचालय', formData.toilet_facility, 'toilet_facility')}
            {renderSwitchRow('स्वतंत्र बंदिस्त किचन / Independent Kitchen', formData.independent_kitchen, 'independent_kitchen')}
            {renderSwitchRow('महिला आरोग्य तपासणी जागा / Women Health Checkup Space', formData.women_health_checkup_space, 'women_health_checkup_space')}
            {renderSwitchRow('विद्युत पुरवठा / Electricity', formData.electricity, 'electricity')}
            {renderSwitchRow('पिण्याचे पाणी / Drinking Water', formData.drinking_water, 'drinking_water')}
            {renderSwitchRow('किचन गार्डन / Kitchen Garden', formData.kitchen_garden, 'kitchen_garden')}
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>२. वजनकाटे उपलब्ध</Text>
            <Text style={styles.sectionSubtitle}>Weighing Scales Available</Text>

            {renderSwitchRow('बेबी वजनकाटे / Baby Weighing Scale', formData.baby_weighing_scale, 'baby_weighing_scale')}
            {renderSwitchRow('हॅमॉक [झोळीचे] वजनकाटे / Hammock Scale', formData.hammock_weighing_scale, 'hammock_weighing_scale')}
            {renderSwitchRow('प्रौढांसाठीचे वजनकाटे / Adult Weighing Scale', formData.adult_weighing_scale, 'adult_weighing_scale')}
            {renderSwitchRow('उंची मापन यंत्र / Height Measuring Scale', formData.height_measuring_scale, 'height_measuring_scale')}

            <Text style={[styles.sectionTitle, styles.marginTop]}>३. अंगणवाडीतील साहित्य उपलब्धता</Text>
            <Text style={styles.sectionSubtitle}>Materials Availability</Text>

            {renderSwitchRow('स्वयंपाकाची भांडी / Cooking Utensils', formData.cooking_utensils, 'cooking_utensils')}
            {renderSwitchRow('पिण्याचे पाणी ठेवण्यासाठी भांडी / Water Storage', formData.water_storage_containers, 'water_storage_containers')}
            {renderSwitchRow('मेडिसिन किट्स / Medicine Kits', formData.medicine_kits, 'medicine_kits')}
            {renderSwitchRow('पूर्व शाले संच / Pre School Kit', formData.pre_school_kit, 'pre_school_kit')}
            {renderSwitchRow('शिकवण साहित्य / Teaching Materials', formData.teaching_materials, 'teaching_materials')}
            {renderSwitchRow('खेळणी / Toys Available', formData.toys_available, 'toys_available')}
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.sectionTitle}>नोंदी आणि दस्तऐवज</Text>
            <Text style={styles.sectionSubtitle}>Records and Documentation</Text>

            {renderSwitchRow('विहित रजिस्टर (सर्व) / All Registers', formData.all_registers, 'all_registers')}
            {renderSwitchRow('छापील मासिक प्रगती अहवाल / Monthly Progress Reports', formData.monthly_progress_reports, 'monthly_progress_reports')}
            {renderSwitchRow('उपस्थिती रजिस्टर / Attendance Register', formData.attendance_register, 'attendance_register')}
            {renderSwitchRow('वृद्धि चार्ट अद्यतनित / Growth Chart Updated', formData.growth_chart_updated, 'growth_chart_updated')}
            {renderSwitchRow('लसीकरण नोंदी / Vaccination Records', formData.vaccination_records, 'vaccination_records')}
            {renderSwitchRow('पोषण नोंदी / Nutrition Records', formData.nutrition_records, 'nutrition_records')}
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.sectionTitle}>४. अंगणवाडी केंद्राचे वेळापत्रक</Text>
            <Text style={styles.sectionSubtitle}>Schedule and Operations</Text>

            {renderSwitchRow('अंगणवाडी केंद्राचे वेळापत्रक आहे काय? / Timetable Available?', formData.timetable_available, 'timetable_available')}
            {renderSwitchRow(' नियमितपणे पाळले जाते काय? / Timetable Followed?', formData.timetable_followed, 'timetable_followed')}
            {renderSwitchRow('सेविका नियमितपणे हजर राहते काय? / Supervisor Regular Attendance?', formData.supervisor_regular_attendance, 'supervisor_regular_attendance')}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.sectionTitle}>५. आहाराविषयी</Text>
            <Text style={styles.sectionSubtitle}>Nutrition and Food Services</Text>

            {renderSwitchRow('१] अंगणवाडी केंद्रात प्रत्येक महिन्याला २५ दिवस सकाळचा नाश्ता व पूरक पोषण आहार पुरविण्यात येतो काय? / 25 Days Meals Per Month', formData.monthly_25_days_meals, 'monthly_25_days_meals')}
            {renderSwitchRow('२] ०–३ वर्षांची बालके, गर्भवती-स्तनदा माता, व तीव्र कमी वजनाच्या बालकांना THR नियमितपणे दिला जातो काय?/ THR Provided Regularly', formData.thr_provided_regularly, 'thr_provided_regularly')}
            {renderSwitchRow('गरम जेवण दिले जाते / Hot Meal Served', formData.hot_meal_served, 'hot_meal_served')}
            {renderSwitchRow('घरगुती शिधा / Take Home Ration', formData.take_home_ration, 'take_home_ration')}

            <Input
              editable={isEditMode}
              label="आहार कोणाकडून दिला जातो / Food Provider"
              value={formData.food_provider}
              onChangeText={(text) => updateFormData('food_provider', text)}
              placeholder="Enter food provider details"
              multiline
              numberOfLines={2}
            />

            <Input
              editable={isEditMode}
              label="सेविकेचा सहभाग / Supervisor Participation"
              value={formData.supervisor_participation}
              onChangeText={(text) => updateFormData('supervisor_participation', text)}
              placeholder="Enter supervisor participation details"
              multiline
              numberOfLines={2}
            />

            {renderSwitchRow('आहार वाटप विकेंद्रित / Food Distribution Decentralized', formData.food_distribution_decentralized, 'food_distribution_decentralized')}

            <Input
              label="मुलांना आहार आवडतो काय? / Children Food Preference"
              value={formData.children_food_taste_preference}
              onChangeText={(text) => updateFormData('children_food_taste_preference', text)}
              placeholder="Enter children's food preference"
              multiline
              numberOfLines={2}
            />

            {renderSwitchRow('निर्धारीत प्रथीणे व उष्मांक असलेला आहार मिळतो काय? / Prescribed Protein & Calories', formData.prescribed_protein_calories, 'prescribed_protein_calories')}
            {renderSwitchRow('निर्धारीत वजनाचा आहार मिळतो काय? / Prescribed Weight Food', formData.prescribed_weight_food, 'prescribed_weight_food')}

            <Input
              editable={isEditMode}
              label="प्रयोगशाळा नमुना तारीख / Lab Sample Date"
              value={formData.lab_sample_date}
              onChangeText={(text) => updateFormData('lab_sample_date', text)}
              placeholder="Enter date"
            />
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.sectionTitle}>९. आरोग्य सेवा</Text>
            <Text style={styles.sectionSubtitle}>Health Services</Text>

            {renderSwitchRow('बालकांचे वजने नियमित वजने घेतली जातात किंवा कसे? / Regular Weighing', formData.regular_weighing, 'regular_weighing')}
            {renderSwitchRow('(वृद्धिपत्रक तपासून) वय व वजन यांची नोंद तपासून पोषण श्रेणी योग्य प्रमाणे दर्शविलेली आहे काय? काही मुलांची प्रत्यक्ष वजने घेऊन तपासणी व खात्री करावी. तसेच वृद्धिपत्रकातील नोंद तपासावी. / Growth Chart Accuracy', formData.growth_chart_accuracy, 'growth_chart_accuracy')}
            {renderSwitchRow('लसीकरण व आरोग्य तपासणी नियमितपणे होते काय? (मागील दोन महिन्याचे रेकॉर्ड तपासावे.) / Vaccination Regular', formData.vaccination_health_checkup_regular, 'vaccination_health_checkup_regular')}
            {renderSwitchRow('लसीकरण दिवसाची माहिती लाभार्थी पालकांना आहे काय? (एक-दोन घरी जाऊन तपासावे) / Vaccination Schedule Awareness', formData.vaccination_schedule_awareness, 'vaccination_schedule_awareness')}
            {renderSwitchRow('आरोग्य तपासणी / Health Checkup Conducted', formData.health_checkup_conducted, 'health_checkup_conducted')}
            {renderSwitchRow('लसीकरण अद्ययावत / Immunization Updated', formData.immunization_updated, 'immunization_updated')}
            {renderSwitchRow('व्हिटॅमिन A दिले / Vitamin A Given', formData.vitamin_a_given, 'vitamin_a_given')}
            {renderSwitchRow('लोह गोळ्या दिल्या / Iron Tablets Given', formData.iron_tablets_given, 'iron_tablets_given')}
          </View>
        );

      case 7:
        return (
          <View>
            <Text style={styles.sectionTitle}>१०. समुदायिक सहभाग</Text>
            <Text style={styles.sectionSubtitle}>Community Participation</Text>

            <Input
              label="गावातील आरोग्य व पोषण नियोजनात सहभाग / Village Health & Nutrition Planning"
              value={formData.village_health_nutrition_planning}
              onChangeText={(text) => updateFormData('village_health_nutrition_planning', text)}
              placeholder="Enter details"
              multiline
              numberOfLines={3}
            />

            <Input
              label="मुलांच्या उपस्थितीची तुलना / Children Attendance Comparison"
              value={formData.children_attendance_comparison}
              onChangeText={(text) => updateFormData('children_attendance_comparison', text)}
              placeholder="Enter comparison details"
              multiline
              numberOfLines={3}
            />

            <Input
              label="समुदायाचा सहभाग / Community Participation"
              value={formData.community_participation}
              onChangeText={(text) => updateFormData('community_participation', text)}
              placeholder="Enter community participation details"
              multiline
              numberOfLines={3}
            />

            <Input
              label="समिती सदस्य सहभाग / Committee Member Participation"
              value={formData.committee_member_participation}
              onChangeText={(text) => updateFormData('committee_member_participation', text)}
              placeholder="Enter committee participation"
              multiline
              numberOfLines={3}
            />

            <Input
              label="घरभेटी मार्गदर्शन / Home Visits Guidance"
              value={formData.home_visits_guidance}
              onChangeText={(text) => updateFormData('home_visits_guidance', text)}
              placeholder="Enter home visit details"
              multiline
              numberOfLines={3}
            />

            <Input
              label="लोक मत सुधारणा / Public Opinion Improvement"
              value={formData.public_opinion_improvement}
              onChangeText={(text) => updateFormData('public_opinion_improvement', text)}
              placeholder="Enter public opinion details"
              multiline
              numberOfLines={3}
            />
          </View>
        );

      case 8:
        return (
          <View>
            <Text style={styles.sectionTitle}>मुलांची माहिती</Text>
            <Text style={styles.sectionSubtitle}>Children Information</Text>

            <Input
              editable={isEditMode}
              label="एकूण नोंदणीकृत मुले / Total Registered Children"
              value={formData.total_registered_children}
              onChangeText={(text) => updateFormData('total_registered_children', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              editable={isEditMode}
              label="आज उपस्थित / Present Today"
              value={formData.children_present_today}
              onChangeText={(text) => updateFormData('children_present_today', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              editable={isEditMode}
              label="०-३ वर्षांची बालके / Children 0-3 Years"
              value={formData.children_0_3_years}
              onChangeText={(text) => updateFormData('children_0_3_years', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              editable={isEditMode}
              label="३-६ वर्षांची बालके / Children 3-6 Years"
              value={formData.children_3_6_years}
              onChangeText={(text) => updateFormData('children_3_6_years', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              editable={isEditMode}
              label="पूर्वशालेय नोंदणी / Preschool Registered"
              value={formData.preschool_education_registered}
              onChangeText={(text) => updateFormData('preschool_education_registered', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              editable={isEditMode}
              label="पूर्वशालेय उपस्थित / Preschool Present"
              value={formData.preschool_education_present}
              onChangeText={(text) => updateFormData('preschool_education_present', text)}
              placeholder="Enter number"
              keyboardType="number-pad"
            />

            <Input
              editable={isEditMode}
              label="पूर्वशालेय कार्यक्रम / Preschool Programs Conducted"
              value={formData.preschool_programs_conducted}
              onChangeText={(text) => updateFormData('preschool_programs_conducted', text)}
              placeholder="Enter program details"
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.sectionTitle, styles.marginTop]}>तपासणी अधिकारी माहिती</Text>
            <Text style={styles.sectionSubtitle}>Inspector Information</Text>

            {isEditMode ? (
              <DateInput
                label="भेटीची तारीख / Visit Date"
                value={formData.visit_date}
                onChangeDate={(d) => updateFormData('visit_date', d)}
                // Restrict selection to today only
                minimumDate={new Date()}
                maximumDate={new Date()}
              />
            ) : (
              <Input
                editable={false}
                label="भेटीची तारीख / Visit Date"
                value={formData.visit_date}
              />
            )}

            <Input
              editable={isEditMode}
              label="तपासणी अधिकारीचे नाव / Inspector Name"
              value={formData.inspector_name}
              onChangeText={(text) => updateFormData('inspector_name', text)}
              placeholder="Enter inspector name"
            />

            <Input
              editable={isEditMode}
              label="तपासणी अधिकारीचे पदनाम / Inspector Designation"
              value={formData.inspector_designation}
              onChangeText={(text) => updateFormData('inspector_designation', text)}
              placeholder="Enter designation"
            />

            <Input
              editable={isEditMode}
              label="सामान्य निरीक्षणे / General Observations"
              value={formData.general_observations}
              onChangeText={(text) => updateFormData('general_observations', text)}
              placeholder="Enter observations"
              multiline
              numberOfLines={4}
            />

            <Input
              editable={isEditMode}
              label="शिफारसी / Recommendations"
              value={formData.recommendations}
              onChangeText={(text) => updateFormData('recommendations', text)}
              placeholder="Enter recommendations"
              multiline
              numberOfLines={4}
            />

            <Input
              editable={isEditMode}
              label="सूचना / Suggestions"
              value={formData.suggestions}
              onChangeText={(text) => updateFormData('suggestions', text)}
              placeholder="Enter suggestions"
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 9:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text>
            <LocationPicker location={location} onLocationChange={isEditMode ? setLocation : () => {}} />
          </View>
        );

      case 10:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
            <PhotoUpload
              photos={photos}
              onPhotosChange={(p) => {
                if (!isEditMode) return;
                setPhotos(p);
                if (photoMetas.length > p.length) setPhotoMetas(photoMetas.slice(0, p.length));
              }}
              photoMetas={photoMetas}
              onPhotoMetaChange={(m) => { if (!isEditMode) return; setPhotoMetas(m); }}
              disabled={!isEditMode}
            />
          </View>
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
      {inspectionId && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12, alignItems: 'flex-end' }}>
          <Button
            title={isEditMode ? (t('common.view') || 'View') : (t('common.edit') || 'Edit')}
            onPress={handleToggleEdit}
            variant="outline"
            style={{ minWidth: 100 }}
          />
        </View>
      )}
      <Stepper steps={STEPS} currentStep={currentStep} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card>{renderStep()}</Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View style={styles.slot}>
            <Button
              title={t('common.previous')}
              onPress={handlePrevious}
              variant="outline"
              style={{ ...styles.button, ...styles.smallButton }}
              disabled={currentStep === 0 || loading}
            />
          </View>

          <View style={styles.slot}>
            {currentStep < STEPS.length - 1 ? (
              <Button
                title={t('common.next')}
                onPress={handleNext}
                style={{ ...styles.button, ...styles.smallButton }}
                disabled={loading}
              />
            ) : inspectionId && isEditMode ? (
              <Button
                title={'Save Changes'}
                onPress={handleSaveEdits}
                style={{ ...styles.button, ...styles.smallButton }}
                loading={loading}
              />
            ) : (
              <Button
                title={t('fims.saveAsDraft')}
                onPress={handleSaveAsDraft}
                variant="outline"
                style={{ ...styles.button, ...styles.smallButton }}
                loading={loading}
              />
            )}
          </View>

          <View style={styles.slot}>
            {currentStep < STEPS.length - 1 ? (
              <Button
                title={''}
                onPress={() => {}}
                variant="outline"
                style={{ ...styles.button, ...styles.smallButton, opacity: 0 }}
                disabled
              />
            ) : inspectionId && isEditMode ? (
              <Button
                title={t('common.cancel') || 'Cancel'}
                onPress={() => setIsEditMode(false)}
                variant="outline"
                style={{ ...styles.button, ...styles.smallButton }}
                disabled={loading}
              />
            ) : (
              <Button
                title={t('fims.submitInspection')}
                onPress={handleSubmit}
                style={{ ...styles.button, ...styles.smallButton }}
                loading={loading}
              />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: isSmallDevice ? 12 : 16,
    paddingBottom: 24,
  },
  card: {
    padding: isSmallDevice ? 12 : 16,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
    fontWeight: '500',
  },
  subsection: {
    marginTop: 16,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    minHeight: 52,
  },
  switchLabel: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    marginRight: 16,
    lineHeight: 20,
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
    alignItems: 'center',
  },
  button: {
    flex: 1,
    minHeight: 44,
    marginHorizontal: 6,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 19,
    minHeight: 36,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slot: {
    width: '32%',
  },
  fullWidthButton: {
    width: '100%',
  },
  submitButtons: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  inputHint: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrapper: {
    width: '48%',
  },
  chipButton: {
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerButton: {
    width: '48%',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  gridItem: {
    flex: 1,
  },
  marginTop: {
    marginTop: 24,
  },
});
