import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { createAdarshaShalaForm } from '../../services/fimsService';

interface ClassEnrollment {
  enrollment: number;
  attendance: number;
}

interface SubjectOutcome {
  [subject: string]: number;
}

interface MaterialUsage {
  available: boolean;
  usage_status: string;
  suggestions: string;
}

interface FormData {
  visit_date: string;
  school_name: string;
  school_address: string;
  principal_name: string;
  principal_mobile: string;
  udise_number: string;
  center: string;
  taluka: string;
  district: string;
  management_type: string;
  school_achievement_self: string;
  school_achievement_external: string;
  sanctioned_posts: number;
  working_posts: number;
  present_teachers: number;
  class_enrollment: { [key: string]: ClassEnrollment };
  math_teachers_count: number;
  khan_registered_teachers: number;
  khan_registered_students: number;
  khan_active_students: number;
  khan_usage_method: string;
  sqdp_prepared: string;
  sqdp_objectives_achieved: string;
  nipun_bharat_verification: string;
  learning_outcomes_assessment: string;
  subject_learning_outcomes: { [key: string]: SubjectOutcome };
  officer_feedback: string;
  innovative_initiatives: string;
  suggested_changes: string;
  srujanrang_articles: string;
  future_articles: string;
  ngo_involvement: string;
  materials_usage: { [key: string]: MaterialUsage };
  inspector_name: string;
  inspector_designation: string;
  visit_date_inspector: string;
  location_name: string;
  planned_date: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
}

const STEPS = [
  'शाळेची माहिती',
  'स्थान माहिती',
  'शैक्षणिक मूल्यांकन',
  'फोटो',
];

const MANAGEMENT_TYPES = [
  'शासकीय',
  'अनुदानित',
  'खाजगी',
  'स्थानिक स्वराज्य संस्था',
];

const GRADE_OPTIONS = ['A', 'B', 'C', 'D'];

export default function RajyaShaishanikPrashikshanScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState('');
  const [showManagementPicker, setShowManagementPicker] = useState(false);
  const [showSelfGradePicker, setShowSelfGradePicker] = useState(false);
  const [showExternalGradePicker, setShowExternalGradePicker] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const initializeClassData = (): { [key: string]: ClassEnrollment } => {
    const classes = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ];
    const classData: { [key: string]: ClassEnrollment } = {};
    classes.forEach((cls) => {
      classData[cls] = { enrollment: 0, attendance: 0 };
    });
    return classData;
  };

  const initializeSubjectData = (): { [key: string]: SubjectOutcome } => {
    const classes = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const subjects = [
      'मराठी',
      'गणित',
      'इंग्रजी',
      'प.अ./विज्ञान',
      'इतिहास',
      'भूगोल',
      'हिंदी',
      'शा.शि.',
      'कार्यनुभव',
    ];
    const subjectData: { [key: string]: SubjectOutcome } = {};
    classes.forEach((cls) => {
      subjectData[cls] = {};
      subjects.forEach((subject) => {
        subjectData[cls][subject] = 0;
      });
    });
    return subjectData;
  };

  const initializeMaterialsData = (): { [key: string]: MaterialUsage } => {
    const materials = [
      'मराठी/उर्दू विषय साहित्य पेटी',
      'गणित विषय साहित्य पेटी',
      'इंग्रजी विषय साहित्य पेटी',
      'DIKSHA APP',
      'तंत्रज्ञान / ई-साधने',
      'स्वनिर्मित ई-साधने',
      'विज्ञानविषयक साहित्य',
      'क्रीडा साहित्य',
      'रोबोटिक्स लॅब',
      'डिजिटल वर्गखोली',
      'व्हर्चुअल क्लासरूम',
      'इतर अध्ययन-अध्यापन साहित्य',
      'NGO कडून प्राप्त साहित्य',
    ];
    const materialsData: { [key: string]: MaterialUsage } = {};
    materials.forEach((material) => {
      materialsData[material] = {
        available: false,
        usage_status: '',
        suggestions: '',
      };
    });
    return materialsData;
  };

  const [formData, setFormData] = useState<FormData>({
    visit_date: '',
    school_name: '',
    school_address: '',
    principal_name: '',
    principal_mobile: '',
    udise_number: '',
    center: '',
    taluka: '',
    district: '',
    management_type: '',
    school_achievement_self: '',
    school_achievement_external: '',
    sanctioned_posts: 0,
    working_posts: 0,
    present_teachers: 0,
    class_enrollment: initializeClassData(),
    math_teachers_count: 0,
    khan_registered_teachers: 0,
    khan_registered_students: 0,
    khan_active_students: 0,
    khan_usage_method: '',
    sqdp_prepared: '',
    sqdp_objectives_achieved: '',
    nipun_bharat_verification: '',
    learning_outcomes_assessment: '',
    subject_learning_outcomes: initializeSubjectData(),
    officer_feedback: '',
    innovative_initiatives: '',
    suggested_changes: '',
    srujanrang_articles: '',
    future_articles: '',
    ngo_involvement: '',
    materials_usage: initializeMaterialsData(),
    inspector_name: '',
    inspector_designation: '',
    visit_date_inspector: '',
    location_name: '',
    planned_date: '',
    latitude: null,
    longitude: null,
    location_accuracy: null,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && currentDateField) {
      // Use ISO date format YYYY-MM-DD for Postgres compatibility
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFormData(currentDateField, formattedDate);
    }
  };

  const openDatePicker = (field: string) => {
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('परवानगी नाकारली', 'स्थान प्रवेशासाठी परवानगी आवश्यक आहे');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      updateFormData('latitude', location.coords.latitude);
      updateFormData('longitude', location.coords.longitude);
      updateFormData('location_accuracy', location.coords.accuracy);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const fullAddress = `${address.name || ''}, ${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.postalCode || ''}`.replace(/,\s*,/g, ',').trim();
        updateFormData('location_name', fullAddress);
      }

      Alert.alert('यश', 'स्थान यशस्वीरित्या कॅप्चर केले');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('त्रुटी', 'स्थान मिळवताना त्रुटी आली');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('परवानगी नाकारली', 'फोटो निवडण्यासाठी परवानगी आवश्यक आहे');
        return;
      }

      if (uploadedPhotos.length >= 5) {
        Alert.alert('मर्यादा', 'तुम्ही जास्तीत जास्त 5 फोटो अपलोड करू शकता');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - uploadedPhotos.length,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
        Alert.alert('यश', `${newPhotos.length} फोटो निवडले`);
      }
    } catch (error) {
      console.error('Error picking photos:', error);
      Alert.alert('त्रुटी', 'फोटो निवडताना त्रुटी आली');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('परवानगी नाकारली', 'कॅमेरा वापरण्यासाठी परवानगी आवश्यक आहे');
        return;
      }

      if (uploadedPhotos.length >= 5) {
        Alert.alert('मर्यादा', 'तुम्ही जास्तीत जास्त 5 फोटो अपलोड करू शकता');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadedPhotos([...uploadedPhotos, result.assets[0].uri]);
        Alert.alert('यश', 'फोटो कॅप्चर केला');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('त्रुटी', 'फोटो कॅप्चर करताना त्रुटी आली');
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 0 && !formData.school_name) {
      Alert.alert('त्रुटी', 'कृपया शाळेचे नाव प्रविष्ट करा');
      return;
    }
    if (currentStep === 1 && !formData.location_name) {
      Alert.alert('त्रुटी', 'कृपया स्थान मिळवा');
      return;
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Build payload matching adarsha_shala table columns
      const classDataArray = ['1','2','3','4','5','6','7','8'].map(cls => ({
        class: cls,
        boys: 0,
        girls: 0,
        total: formData.class_enrollment[cls]?.enrollment || 0
      }));

      const subjectPerformance = [
        {
          subject: 'Marathi',
          class_1: formData.subject_learning_outcomes['1']?.['मराठी'] || 0,
          class_2: formData.subject_learning_outcomes['2']?.['मराठी'] || 0,
          class_3: formData.subject_learning_outcomes['3']?.['मराठी'] || 0,
          class_4: formData.subject_learning_outcomes['4']?.['मराठी'] || 0,
          class_5: formData.subject_learning_outcomes['5']?.['मराठी'] || 0,
          class_6: formData.subject_learning_outcomes['6']?.['मराठी'] || 0,
          class_7: formData.subject_learning_outcomes['7']?.['मराठी'] || 0,
          class_8: formData.subject_learning_outcomes['8']?.['मराठी'] || 0,
        },
        {
          subject: 'English',
          class_1: formData.subject_learning_outcomes['1']?.['इंग्रजी'] || 0,
          class_2: formData.subject_learning_outcomes['2']?.['इंग्रजी'] || 0,
          class_3: formData.subject_learning_outcomes['3']?.['इंग्रजी'] || 0,
          class_4: formData.subject_learning_outcomes['4']?.['इंग्रजी'] || 0,
          class_5: formData.subject_learning_outcomes['5']?.['इंग्रजी'] || 0,
          class_6: formData.subject_learning_outcomes['6']?.['इंग्रजी'] || 0,
          class_7: formData.subject_learning_outcomes['7']?.['इंग्रजी'] || 0,
          class_8: formData.subject_learning_outcomes['8']?.['इंग्रजी'] || 0,
        },
        {
          subject: 'Math',
          class_1: formData.subject_learning_outcomes['1']?.['गणित'] || 0,
          class_2: formData.subject_learning_outcomes['2']?.['गणित'] || 0,
          class_3: formData.subject_learning_outcomes['3']?.['गणित'] || 0,
          class_4: formData.subject_learning_outcomes['4']?.['गणित'] || 0,
          class_5: formData.subject_learning_outcomes['5']?.['गणित'] || 0,
          class_6: formData.subject_learning_outcomes['6']?.['गणित'] || 0,
          class_7: formData.subject_learning_outcomes['7']?.['गणित'] || 0,
          class_8: formData.subject_learning_outcomes['8']?.['गणित'] || 0,
        },
        {
          subject: 'Science',
          class_1: formData.subject_learning_outcomes['1']?.['प.अ./विज्ञान'] || 0,
          class_2: formData.subject_learning_outcomes['2']?.['प.अ./विज्ञान'] || 0,
          class_3: formData.subject_learning_outcomes['3']?.['प.अ./विज्ञान'] || 0,
          class_4: formData.subject_learning_outcomes['4']?.['प.अ./विज्ञान'] || 0,
          class_5: formData.subject_learning_outcomes['5']?.['प.अ./विज्ञान'] || 0,
          class_6: formData.subject_learning_outcomes['6']?.['प.अ./विज्ञान'] || 0,
          class_7: formData.subject_learning_outcomes['7']?.['प.अ./विज्ञान'] || 0,
          class_8: formData.subject_learning_outcomes['8']?.['प.अ./विज्ञान'] || 0,
        },
        {
          subject: 'Social Studies',
          class_1: formData.subject_learning_outcomes['1']?.['इतिहास'] || 0,
          class_2: formData.subject_learning_outcomes['2']?.['इतिहास'] || 0,
          class_3: formData.subject_learning_outcomes['3']?.['इतिहास'] || 0,
          class_4: formData.subject_learning_outcomes['4']?.['इतिहास'] || 0,
          class_5: formData.subject_learning_outcomes['5']?.['इतिहास'] || 0,
          class_6: formData.subject_learning_outcomes['6']?.['इतिहास'] || 0,
          class_7: formData.subject_learning_outcomes['7']?.['इतिहास'] || 0,
          class_8: formData.subject_learning_outcomes['8']?.['इतिहास'] || 0,
        },
      ];

      const materialUsageArray = Object.keys(formData.materials_usage).map(key => ({
        material: key,
        available: formData.materials_usage[key].available || false,
        usage: formData.materials_usage[key].usage_status || '',
        suggestions: formData.materials_usage[key].suggestions || ''
      }));

      const payload: any = {
        visit_date: formData.visit_date || new Date().toISOString().split('T')[0],
        school_name: formData.school_name || '',
        school_address: formData.school_address || null,
        principal_name: formData.principal_name || null,
        principal_mobile_no: formData.principal_mobile ? parseInt(formData.principal_mobile) : null,
        udise_code: formData.udise_number || null,
        center: formData.center || null,
        taluka: formData.taluka || null,
        district: formData.district || null,
        management_type: formData.management_type || null,
        self_assessment_grade: formData.school_achievement_self || null,
        external_assessment_grade: formData.school_achievement_external || null,
        sanctioned_posts: formData.sanctioned_posts || 0,
        working_posts: formData.working_posts || 0,
        present_teachers: formData.present_teachers || 0,
        math_teachers_count: formData.math_teachers_count || 0,
        registered_teachers: formData.khan_registered_teachers || 0,
        registered_students: formData.khan_registered_students || 0,
        active_students: formData.khan_active_students || 0,
        question1: formData.khan_usage_method || null,
        question2: formData.sqdp_prepared || null,
        question3: formData.sqdp_objectives_achieved || null,
        question4: formData.nipun_bharat_verification || null,
        question5: formData.learning_outcomes_assessment || null,
        question6: formData.officer_feedback || null,
        question7: formData.innovative_initiatives || null,
        question8: formData.suggested_changes || null,
        question9: formData.srujanrang_articles || null,
        question10: formData.future_articles || null,
        question11: formData.ngo_involvement || null,
        class_data: JSON.stringify(classDataArray),
        subject_performance: JSON.stringify(subjectPerformance),
        material_usage: JSON.stringify(materialUsageArray),
        inspector_name: formData.inspector_name || null,
        inspector_designation: formData.inspector_designation || null,
        visit_date_inspector: formData.visit_date_inspector || null,
      };

      await createAdarshaShalaForm(payload);

      Alert.alert('यश', 'प्रपत्र यशस्वीरित्या सबमिट केले');
      // Optionally reset or navigate back
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('त्रुटी', 'प्रपत्र सबमिट करताना त्रुटी आली');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setLoading(true);
    try {
      const payload: any = {
        visit_date: formData.visit_date || new Date().toISOString().split('T')[0],
        school_name: formData.school_name || '',
        class_data: JSON.stringify(['1','2','3','4','5','6','7','8'].map(cls => ({ class: cls, boys: 0, girls: 0, total: formData.class_enrollment[cls]?.enrollment || 0 }))),
        subject_performance: JSON.stringify([]),
        material_usage: JSON.stringify([]),
      };

      await createAdarshaShalaForm(payload);
      Alert.alert('यश', 'मसुदा जतन केला');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('त्रुटी', 'मसुदा जतन करताना त्रुटी आली');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    field: string,
    placeholder?: string,
    keyboardType?: any,
    multiline?: boolean,
    numberOfLines?: number
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={(text) => updateFormData(field, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );

  const renderDateInput = (label: string, value: string, field: string) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker(field)}
      >
        <Text style={styles.dateText}>
          {value || 'dd-mm-yyyy'}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNumberInput = (label: string, value: number, field: string) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value === 0 ? '' : value.toString()}
        onChangeText={(text) => updateFormData(field, parseInt(text) || 0)}
        keyboardType="numeric"
        placeholder="0"
      />
    </View>
  );

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    options: string[],
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionItem}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>बंद करा / Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSchoolBasicInfo = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        राज्य शैक्षणिक संशोधन व प्रशिक्षण परिषद, महाराष्ट्र, पुणे
      </Text>
      <Text style={styles.sectionSubtitle}>आदर्श शाळा भेट प्रपत्र</Text>
      <Text style={styles.sectionSubtitle}>
        State Educational Research and Training Council Maharashtra, Pune
      </Text>

      {renderDateInput('भेटीचा दिनांक  *', formData.visit_date, 'visit_date')}
      {renderInput(
        'शाळेचे नाव *',
        formData.school_name,
        'school_name',
        'शाळेचे नाव प्रविष्ट करा'
      )}
      {renderInput(
        'शाळेचा पत्ता ',
        formData.school_address,
        'school_address',
        'शाळेचा संपूर्ण पत्ता',
        undefined,
        true,
        3
      )}
      {renderInput(
        'मुख्याध्यापकाचे नाव ',
        formData.principal_name,
        'principal_name',
        'मुख्याध्यापकाचे नाव'
      )}
      {renderInput(
        'मोबाईल क्रमांक ',
        formData.principal_mobile,
        'principal_mobile',
        '10 अंकी मोबाईल क्रमांक',
        'phone-pad'
      )}
      {renderInput(
        'शाळेचा युडायस क्रमांक ',
        formData.udise_number,
        'udise_number',
        'UDISE क्रमांक'
      )}
      {renderInput('केंद्र ', formData.center, 'center', 'केंद्र प्रविष्ट करा')}
      {renderInput('तालुका ', formData.taluka, 'taluka', 'तालुका प्रविष्ट करा')}
      {renderInput('जिल्हा ', formData.district, 'district', 'जिल्हा प्रविष्ट करा')}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          शाळा व्यवस्थापन प्रकार
        </Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowManagementPicker(true)}
        >
          <Text style={styles.pickerValue}>
            {formData.management_type || 'निवडा'}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subsectionTitle}>
        शाळा सिद्धी (School Achievement)
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          स्वयं-मूल्यांकनानुसार श्रेणी
        </Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowSelfGradePicker(true)}
        >
          <Text style={styles.pickerValue}>
            {formData.school_achievement_self || 'निवडा'}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          बाह्य मूल्यांकनानुसार श्रेणी
        </Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowExternalGradePicker(true)}
        >
          <Text style={styles.pickerValue}>
            {formData.school_achievement_external || 'निवडा'}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subsectionTitle}>
        शाळेतील शिक्षक संख्या (Teacher Information)
      </Text>
      {renderNumberInput(
        'मंजूर पदे ',
        formData.sanctioned_posts,
        'sanctioned_posts'
      )}
      {renderNumberInput(
        'कार्यरत पदे ',
        formData.working_posts,
        'working_posts'
      )}
      {renderNumberInput(
        'आज उपस्थित शिक्षक संख्या ',
        formData.present_teachers,
        'present_teachers'
      )}

      <Text style={styles.subsectionTitle}>
        शाळेतील इयत्तानिहाय पटसंख्या आणि उपस्थिती
      </Text>
      <Text style={styles.subsectionTitle}>
        Class-wise Enrollment and Attendance
      </Text>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(
        (cls) => (
          <View key={cls} style={styles.tableRow}>
            <Text style={styles.tableCell}>वर्ग {cls}</Text>
            <TextInput
              style={styles.tableCellInput}
              value={
                formData.class_enrollment[cls]?.enrollment === 0
                  ? ''
                  : formData.class_enrollment[cls]?.enrollment.toString() || ''
              }
              onChangeText={(text) => {
                const newEnrollment = { ...formData.class_enrollment };
                newEnrollment[cls] = {
                  ...newEnrollment[cls],
                  enrollment: parseInt(text) || 0,
                };
                updateFormData('class_enrollment', newEnrollment);
              }}
              keyboardType="numeric"
              placeholder="पटसंख्या"
            />
            <TextInput
              style={styles.tableCellInput}
              value={
                formData.class_enrollment[cls]?.attendance === 0
                  ? ''
                  : formData.class_enrollment[cls]?.attendance.toString() || ''
              }
              onChangeText={(text) => {
                const newEnrollment = { ...formData.class_enrollment };
                newEnrollment[cls] = {
                  ...newEnrollment[cls],
                  attendance: parseInt(text) || 0,
                };
                updateFormData('class_enrollment', newEnrollment);
              }}
              keyboardType="numeric"
              placeholder="उपस्थिती"
            />
          </View>
        )
      )}
    </ScrollView>
  );

  const renderLocationDetails = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        स्थान माहिती
      </Text>
      {renderInput(
        'स्थान नाव  *',
        formData.location_name,
        'location_name',
        'स्थान नाव प्रविष्ट करा'
      )}
      {renderDateInput('नियोजित तारीख ', formData.planned_date, 'planned_date')}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        <Text style={styles.locationButtonText}>
          {loading ? 'स्थान मिळवत आहे...' : 'सध्याचे स्थान मिळवा / Get Current Location'}
        </Text>
      </TouchableOpacity>

      {formData.latitude && formData.longitude && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationInfoTitle}>स्थान कॅप्चर केले</Text>
          <Text style={styles.locationInfoText}>अक्षांश: {formData.latitude.toFixed(6)}</Text>
          <Text style={styles.locationInfoText}>रेखांश: {formData.longitude.toFixed(6)}</Text>
          {formData.location_accuracy && (
            <Text style={styles.locationInfoText}>
              अचूकता: {Math.round(formData.location_accuracy)}m
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderAssessmentForm = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        शैक्षणिक मूल्यांकन प्रपत्र
      </Text>

      <Text style={styles.subsectionTitle}>
        SCERT महाराष्ट्र, पुणे मार्फत गणित ई-साहित्य वापराच्या अनुषंगाने खाण अकॅडमी पोर्टल बाबतची माहिती
      </Text>

      {renderNumberInput(
        'गणित विषय शिकविणाऱ्या शिक्षकांची संख्या (इयत्ता १ ते १०)',
        formData.math_teachers_count,
        'math_teachers_count'
      )}
      {renderNumberInput(
        'Khan Academy पोर्टलवर नोंदणी झालेल्या शिक्षकांची संख्या. ',
        formData.khan_registered_teachers,
        'khan_registered_teachers'
      )}
      {renderNumberInput(
        'Khan Academy पोर्टलवर नोंदणी झालेल्या विद्यार्थ्यांची संख्या.',
        formData.khan_registered_students,
        'khan_registered_students'
      )}
      {renderNumberInput(
        'Khan Academy पोर्टलवर स्वाध्याय सोडवित असलेल्या विद्यार्थ्यांची संख्या. ',
        formData.khan_active_students,
        'khan_active_students'
      )}

      {renderInput(
        '१. SCERT महाराष्ट्र, पुणे मार्फत Khan Academy च्या पोर्टलवर उपलब्ध करून दिलेल्या ई साहित्याचा वापर शाळेत कशाप्रकारे केला जातो? ',
        formData.khan_usage_method,
        'khan_usage_method',
        'Khan Academy वापर पद्धती वर्णन करा.',
        undefined,
        true,
        4
      )}

      {renderInput(
        '२. शैक्षणिक वर्ष २०२२-२३ मधील SQDP (School Quality Development Plan) च्या आधारे सन २०२३-२४ साठी सुधारित SQDP तयार केला आहे का? ',
        formData.sqdp_prepared,
        'sqdp_prepared',
        'SQDP तयारी बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '३. २०२२-२३ मधील शाळा गुणवत्ता विकास आराखड्यानुसार (SQDP) ठरविलेली उद्दिष्टे पूर्ण झाली आहेत काय? नसल्यास कारणे द्यावी.',
        formData.sqdp_objectives_achieved,
        'sqdp_objectives_achieved',
        'SQDP उद्दिष्टे पूर्णता बाबत तपशील',
        undefined,
        true,
        4
      )}

      {renderInput(
        '४. शाळेमध्ये निपुण भारत लक्ष्य पडताळणी प्रपत्र (भाषा व गणित) नुसार पडताळणी झाली का? असल्यास प्रपत्र सोबत जोडावे, नसल्यास शाळेने पडताळणी करून अहवाल प्रपत्र तपासणी अधिकाऱ्याकडे दोन दिवसात सादर करावा.',
        formData.nipun_bharat_verification,
        'nipun_bharat_verification',
        'निपुण भारत पडताळणी बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '५. सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार किती विद्यार्थ्यामध्ये अध्ययन निष्पती दिसून येते (न्यादर्श पद्धतीने कोणत्याही एका वर्गाची, सर्व विषयाची अध्ययन निष्पती तपासावी). ',
        formData.learning_outcomes_assessment,
        'learning_outcomes_assessment',
        'अध्ययन निष्पती मूल्यांकन तपशील',
        undefined,
        true,
        4
      )}

      <Text style={styles.subsectionTitle}>
        वर्गनिहाय विषय अध्ययन निष्पती
      </Text>
      <Text style={styles.infoText}>
        (कृपया प्रत्येक वर्गासाठी प्रत्येक विषयात किती विद्यार्थ्यांनी अध्ययन निष्पत्ती प्राप्त केली ते प्रविष्ट करा ).
      </Text>

      {['1', '2', '3', '4', '5', '6', '7', '8'].map((cls) => (
        <View key={cls} style={styles.subjectTableContainer}>
          <Text style={styles.subjectTableTitle}>वर्ग {cls} </Text>
          <View style={styles.subjectGrid}>
            {[
              'मराठी',
              'गणित',
              'इंग्रजी',
              'प.अ./विज्ञान',
              'इतिहास',
              'भूगोल',
              'हिंदी',
              'शा.शि.',
              'कार्यनुभव',
            ].map((subject) => (
              <View key={subject} style={styles.subjectRow}>
                <Text style={styles.subjectLabel}>{subject}</Text>
                <TextInput
                  style={styles.subjectInput}
                  value={
                    formData.subject_learning_outcomes[cls]?.[subject] === 0
                      ? ''
                      : formData.subject_learning_outcomes[cls]?.[subject]?.toString() || ''
                  }
                  onChangeText={(text) => {
                    const newOutcomes = { ...formData.subject_learning_outcomes };
                    if (!newOutcomes[cls]) {
                      newOutcomes[cls] = {};
                    }
                    newOutcomes[cls][subject] = parseInt(text) || 0;
                    updateFormData('subject_learning_outcomes', newOutcomes);
                  }}
                  keyboardType="numeric"
                  placeholder="संख्या"
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      {renderInput(
        '६. शाळा भेट देणाऱ्या अधिकाऱ्यांनी सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार अध्ययन निष्पती तपासल्या नंतर विद्यार्थ्यांच्या संपादणुकीबाबत / विद्यार्थी प्रगती बाबत अभिप्राय द्यावा. ',
        formData.officer_feedback,
        'officer_feedback',
        'अधिकाऱ्यांचे अभिप्राय',
        undefined,
        true,
        4
      )}

      {renderInput(
        '७. विद्यार्थ्यामध्ये शैक्षणिक गुणवत्ता निर्माण होण्याकरीता शाळेमध्ये नाविन्यपूर्ण उपक्रम राबविले आहेत का? असल्यास कोणते? ',
        formData.innovative_initiatives,
        'innovative_initiatives',
        'नाविन्यपूर्ण उपक्रमांचे तपशील',
        undefined,
        true,
        4
      )}

      {renderInput(
        '८. विद्यार्थ्यामध्ये शैक्षणिक गुणवत्ता निर्माण होण्याकरिता व सदर शाळा तालुक्यातील इतर शाळांना मार्गदर्शक व्हावी यासाठी भेट देणाऱ्या अधिकाऱ्यांच्या मते शाळेत कोणत्या बदलाची आवश्यकता आहे? ',
        formData.suggested_changes,
        'suggested_changes',
        'सुधारणेसाठी सूचना',
        undefined,
        true,
        4
      )}

      {renderInput(
        '९. सृजनरंग या ई अंकामध्ये शाळेद्वारा लेख तसेच यशोगाथा पाठविले आहे का? असल्यास सृजनरंग या ई अंकामध्ये प्रसिद्ध झाला आहे का? ',
        formData.srujanrang_articles,
        'srujanrang_articles',
        'सृजनरंग लेख बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '१०. सृजनरंग या पुढील ई अंकांसाठी लेख पाठवले आहेत का? ',
        formData.future_articles,
        'future_articles',
        'भविष्यातील लेख बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '११. शाळेमध्ये काम करत असलेल्या स्वयंसेवी संस्था कार्यरत आहेत? असल्यास कोणत्या विषयाच्या अनुषंगाने काम करत आहेत.',
        formData.ngo_involvement,
        'ngo_involvement',
        'स्वयंसेवी संस्था बाबत तपशील',
        undefined,
        true,
        3
      )}

      <Text style={styles.subsectionTitle}>
        शाळेतील साहित्याचा / तंत्रज्ञानाचा अध्ययन-अध्यापनात वापर
      </Text>

      <Text style={styles.infoText}>
        (कृपया प्रत्येक साहित्य/तंत्रज्ञानाची उपलब्धता, वापर स्थिती आणि सूचना नोंदवा).
      </Text>

      {Object.keys(formData.materials_usage).map((material, idx) => (
        <View key={material} style={styles.materialCard}>
          <Text style={styles.materialTitle}>
            {idx + 1}. {material}
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              उपलब्ध आहे का?
            </Text>
            <Switch
              value={formData.materials_usage[material].available}
              onValueChange={(val) => {
                const newMaterials = { ...formData.materials_usage };
                newMaterials[material] = {
                  ...newMaterials[material],
                  available: val,
                };
                updateFormData('materials_usage', newMaterials);
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={
                formData.materials_usage[material].available
                  ? '#2563eb'
                  : '#f3f4f6'
              }
            />
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.materials_usage[material].usage_status}
            onChangeText={(text) => {
              const newMaterials = { ...formData.materials_usage };
              newMaterials[material] = {
                ...newMaterials[material],
                usage_status: text,
              };
              updateFormData('materials_usage', newMaterials);
            }}
            placeholder="अध्ययन-अध्यापन प्रक्रियेत वापराची सद्यस्थिती "
            multiline
            numberOfLines={2}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.materials_usage[material].suggestions}
            onChangeText={(text) => {
              const newMaterials = { ...formData.materials_usage };
              newMaterials[material] = {
                ...newMaterials[material],
                suggestions: text,
              };
              updateFormData('materials_usage', newMaterials);
            }}
            placeholder="सुधारणात्मक सूचना "
            multiline
            numberOfLines={2}
          />
        </View>
      ))}
    </ScrollView>
  );

  const renderPhotoUpload = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        फोटो दस्तऐवजीकरण  (Upload photo)
      </Text>

      <View style={styles.photoButtonContainer}>
        <TouchableOpacity
          style={[styles.photoButton, styles.photoButtonPrimary]}
          onPress={handlePhotoUpload}
        >
          <Text style={styles.photoButtonText}>📷 फोटो निवडा (Choose Photos)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.photoButton, styles.photoButtonSecondary]}
          onPress={handleCameraCapture}
        >
          <Text style={styles.photoButtonText}>📸 कॅमेरा वापरा (Use Camera)</Text>
        </TouchableOpacity>
      </View>

      {uploadedPhotos.length > 0 && (
        <View style={styles.photoGrid}>
          <Text style={styles.photoGridTitle}>
            निवडलेले फोटो ({uploadedPhotos.length}/5)
          </Text>
          {uploadedPhotos.map((uri, index) => (
            <View key={index} style={styles.photoItem}>
              <Image source={{ uri }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.photoRemoveButton}
                onPress={() => removePhoto(index)}
              >
                <Text style={styles.photoRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.subsectionTitle}>
        निरीक्षण अधिकारी माहिती
      </Text>
      {renderInput(
        'निरीक्षण अधिकाऱ्याचे नाव ',
        formData.inspector_name,
        'inspector_name',
        'अधिकाऱ्याचे नाव'
      )}
      {renderInput(
        'पदनाम ',
        formData.inspector_designation,
        'inspector_designation',
        'पदनाम'
      )}
      {renderDateInput('भेटीचा दिनांक ', formData.visit_date_inspector, 'visit_date_inspector')}
    </ScrollView>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderSchoolBasicInfo();
      case 1:
        return renderLocationDetails();
      case 2:
        return renderAssessmentForm();
      case 3:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>राज्य शैक्षणिक प्रशिक्षण</Text>
        <Text style={styles.headerSubtitle}>State Educational Training</Text>
        <View style={styles.stepIndicator}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= index && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= index && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.stepLabel}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.content}>{renderStep()}</View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={handlePrevious}
              disabled={loading}
            >
              <Text style={styles.buttonOutlineText}>मागे</Text>
            </TouchableOpacity>
          )}
          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>पुढे</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.submitButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonOutline,
                  styles.halfButton,
                ]}
                onPress={handleSaveAsDraft}
                disabled={loading}
              >
                <Text style={styles.buttonOutlineText}>मसुदा जतन करा</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, styles.halfButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonPrimaryText}>सबमिट</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}

      {renderPickerModal(
        showManagementPicker,
        () => setShowManagementPicker(false),
        MANAGEMENT_TYPES,
        (value) => updateFormData('management_type', value),
        'शाळा व्यवस्थापन प्रकार निवडा'
      )}

      {renderPickerModal(
        showSelfGradePicker,
        () => setShowSelfGradePicker(false),
        GRADE_OPTIONS,
        (value) => updateFormData('school_achievement_self', value),
        'स्वयं-मूल्यांकन श्रेणी निवडा'
      )}

      {renderPickerModal(
        showExternalGradePicker,
        () => setShowExternalGradePicker(false),
        GRADE_OPTIONS,
        (value) => updateFormData('school_achievement_external', value),
        'बाह्य मूल्यांकन श्रेणी निवडा'
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#10b981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  calendarIcon: {
    fontSize: 20,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  tableCellInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    marginLeft: 4,
  },
  subjectTableContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subjectTableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  subjectGrid: {
    gap: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  subjectLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  subjectInput: {
    width: 80,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#15803d',
    marginBottom: 4,
  },
  photoButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  photoButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonPrimary: {
    backgroundColor: '#10b981',
  },
  photoButtonSecondary: {
    backgroundColor: '#3b82f6',
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoGrid: {
    marginBottom: 24,
  },
  photoGridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  photoItem: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoRemoveText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  materialCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonPrimary: {
    backgroundColor: '#10b981',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonOutlineText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  halfButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
