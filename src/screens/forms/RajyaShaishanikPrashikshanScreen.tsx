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
} from 'react-native';

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
  // Basic school information
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

  // Teacher information
  sanctioned_posts: number;
  working_posts: number;
  present_teachers: number;

  // Student enrollment and attendance
  class_enrollment: { [key: string]: ClassEnrollment };

  // Khan Academy information
  math_teachers_count: number;
  khan_registered_teachers: number;
  khan_registered_students: number;
  khan_active_students: number;

  // Text responses
  khan_usage_method: string;
  sqdp_prepared: string;
  sqdp_objectives_achieved: string;
  nipun_bharat_verification: string;
  learning_outcomes_assessment: string;

  // Subject-wise learning outcomes
  subject_learning_outcomes: { [key: string]: SubjectOutcome };

  // Officer feedback
  officer_feedback: string;
  innovative_initiatives: string;
  suggested_changes: string;
  srujanrang_articles: string;
  future_articles: string;
  ngo_involvement: string;

  // Materials and technology usage
  materials_usage: { [key: string]: MaterialUsage };

  // Inspector information
  inspector_name: string;
  inspector_designation: string;
  visit_date_inspector: string;

  // Location
  location_name: string;
  planned_date: string;
}

const STEPS = [
  'शाळेची माहिती',
  'स्थान माहिती',
  'शैक्षणिक मूल्यांकन',
  'फोटो',
];

export default function RajyaShaishanikPrashikshanScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const initializeClassData = (): { [key: string]: ClassEnrollment } => {
    const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
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
      materialsData[material] = { available: false, usage_status: '', suggestions: '' };
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
  });

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (currentStep === 0 && !formData.school_name) {
      Alert.alert('त्रुटी', 'कृपया शाळेचे नाव प्रविष्ट करा');
      return;
    }
    if (currentStep === 1 && !formData.location_name) {
      Alert.alert('त्रुटी', 'कृपया स्थान नाव प्रविष्ट करा');
      return;
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    Alert.alert('यश', 'प्रपत्र यशस्वीरित्या सबमिट केले');
  };

  const handleSaveAsDraft = async () => {
    Alert.alert('यश', 'मसुदा जतन केला');
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

  const renderNumberInput = (label: string, value: number, field: string) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value.toString()}
        onChangeText={(text) => updateFormData(field, parseInt(text) || 0)}
        keyboardType="numeric"
      />
    </View>
  );

  const renderSwitchRow = (label: string, value: boolean, field: string) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(val) => updateFormData(field, val)}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={value ? '#2563eb' : '#f3f4f6'}
      />
    </View>
  );

  const renderSchoolBasicInfo = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>राज्य शैक्षणिक संशोधन व प्रशिक्षण परिषद, महाराष्ट्र, पुणे</Text>
      <Text style={styles.sectionSubtitle}>आदर्श शाळा भेट प्रपत्र</Text>
      <Text style={styles.sectionSubtitle}>State Educational Research and Training Council Maharashtra, Pune</Text>
      <Text style={styles.sectionSubtitle}>Ideal School Visit Form</Text>

      {renderInput('भेटीचा दिनांक / Visit Date *', formData.visit_date, 'visit_date', 'YYYY-MM-DD')}
      {renderInput('शाळेचे नाव / School Name *', formData.school_name, 'school_name', 'शाळेचे नाव प्रविष्ट करा')}
      {renderInput('शाळेचा पत्ता / School Address', formData.school_address, 'school_address', 'शाळेचा संपूर्ण पत्ता', undefined, true, 3)}
      {renderInput('मुख्याध्यापकाचे नाव / Principal Name', formData.principal_name, 'principal_name', 'मुख्याध्यापकाचे नाव')}
      {renderInput('मोबाईल क्रमांक / Mobile Number', formData.principal_mobile, 'principal_mobile', '10 अंकी मोबाईल क्रमांक', 'phone-pad')}
      {renderInput('शाळेचा युडायस क्रमांक / UDISE Code', formData.udise_number, 'udise_number', 'UDISE क्रमांक')}
      {renderInput('केंद्र / Center', formData.center, 'center', 'केंद्र प्रविष्ट करा')}
      {renderInput('तालुका / Taluka', formData.taluka, 'taluka', 'तालुका प्रविष्ट करा')}
      {renderInput('जिल्हा / District', formData.district, 'district', 'जिल्हा प्रविष्ट करा')}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>शाळा व्यवस्थापन प्रकार / Management Type</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerValue}>{formData.management_type || 'निवडा'}</Text>
        </View>
      </View>

      <Text style={styles.subsectionTitle}>शाळा सिद्धी / School Achievement</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>स्वयं-मूल्यांकनानुसार श्रेणी / Self Assessment Grade</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerValue}>{formData.school_achievement_self || 'निवडा'}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>बाह्य मूल्यांकनानुसार श्रेणी / External Assessment Grade</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerValue}>{formData.school_achievement_external || 'निवडा'}</Text>
        </View>
      </View>

      <Text style={styles.subsectionTitle}>शाळेतील शिक्षक संख्या / Teacher Information</Text>
      {renderNumberInput('मंजूर पदे / Sanctioned Posts', formData.sanctioned_posts, 'sanctioned_posts')}
      {renderNumberInput('कार्यरत पदे / Working Posts', formData.working_posts, 'working_posts')}
      {renderNumberInput('आज उपस्थित शिक्षक संख्या / Present Teachers', formData.present_teachers, 'present_teachers')}

      <Text style={styles.subsectionTitle}>शाळेतील इयत्तानिहाय पटसंख्या आणि उपस्थिती</Text>
      <Text style={styles.subsectionTitle}>Class-wise Enrollment and Attendance</Text>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((cls) => (
        <View key={cls} style={styles.tableRow}>
          <Text style={styles.tableCell}>वर्ग {cls}</Text>
          <TextInput
            style={styles.tableCellInput}
            value={formData.class_enrollment[cls]?.enrollment.toString() || '0'}
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
            value={formData.class_enrollment[cls]?.attendance.toString() || '0'}
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
      ))}
    </ScrollView>
  );

  const renderLocationDetails = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>स्थान माहिती / Location Information</Text>
      {renderInput('स्थान नाव / Location Name *', formData.location_name, 'location_name', 'स्थान नाव प्रविष्ट करा')}
      {renderInput('नियोजित तारीख / Planned Date', formData.planned_date, 'planned_date', 'YYYY-MM-DD')}

      <TouchableOpacity style={styles.locationButton}>
        <Text style={styles.locationButtonText}>सध्याचे स्थान मिळवा / Get Current Location</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAssessmentForm = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>शैक्षणिक मूल्यांकन प्रपत्र / Educational Assessment Form</Text>

      <Text style={styles.subsectionTitle}>
        SCERTM, पुणे मार्फत गणित ई-साहित्य वापराच्या अनुषंगाने खाण अकॅडमी पोर्टल बाबतची माहिती
      </Text>
      <Text style={styles.subsectionTitle}>Khan Academy Portal Information</Text>

      {renderNumberInput(
        'गणित विषय शिकविणाऱ्या शिक्षकांची संख्या (इयत्ता १ ते १०) / Math Teachers Count (Class 1 to 10)',
        formData.math_teachers_count,
        'math_teachers_count'
      )}
      {renderNumberInput(
        'Khan Academy पोर्टलवर नोंदणी झालेल्या शिक्षकांची संख्या / Registered Teachers on Khan Academy',
        formData.khan_registered_teachers,
        'khan_registered_teachers'
      )}
      {renderNumberInput(
        'Khan Academy पोर्टलवर नोंदणी झालेल्या विद्यार्थ्यांची संख्या / Registered Students on Khan Academy',
        formData.khan_registered_students,
        'khan_registered_students'
      )}
      {renderNumberInput(
        'Khan Academy पोर्टलवर स्वाध्याय सोडवित असलेल्या विद्यार्थ्यांची संख्या / Active Students on Khan Academy',
        formData.khan_active_students,
        'khan_active_students'
      )}

      {renderInput(
        '१. SCERTM, पुणे मार्फत Khan Academy च्या पोर्टलवर उपलब्ध करून दिलेल्या ई साहित्याचा वापर शाळेत कशाप्रकारे केला जातो? / 1. How is Khan Academy e-material used in school?',
        formData.khan_usage_method,
        'khan_usage_method',
        'Khan Academy वापर पद्धती वर्णन करा',
        undefined,
        true,
        4
      )}

      {renderInput(
        '२. शैक्षणिक वर्ष २०२२-२३ मधील SQDP च्या आधारे सन २०२३-२४ साठी सुधारित SQDP तयार केला आहे का? / 2. Has revised SQDP been prepared for 2023-24 based on 2022-23?',
        formData.sqdp_prepared,
        'sqdp_prepared',
        'SQDP तयारी बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '३. २०२२-२३ मधील शाळा गुणवत्ता विकास आराखड्यानुसार (SQDP) ठरविलेली उद्दिष्टे पूर्ण झाली आहेत काय? नसल्यास कारणे द्यावी. / 3. Have SQDP objectives for 2022-23 been achieved? If not, provide reasons.',
        formData.sqdp_objectives_achieved,
        'sqdp_objectives_achieved',
        'SQDP उद्दिष्टे पूर्णता बाबत तपशील',
        undefined,
        true,
        4
      )}

      {renderInput(
        '४. शाळेमध्ये निपुण भारत लक्ष्य पडताळणी प्रपत्र (भाषा व गणित) नुसार पडताळणी झाली का? असल्यास प्रपत्र सोबत जोडावे, नसल्यास शाळेने पडताळणी करून अहवाल प्रपत्र तपासणी अधिकाऱ्याकडे दोन दिवसात सादर करावा. / 4. Has Nipun Bharat verification been done? If yes, attach form. If no, school should submit report within two days.',
        formData.nipun_bharat_verification,
        'nipun_bharat_verification',
        'निपुण भारत पडताळणी बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '५. सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार किती विद्यार्थ्यामध्ये अध्ययन निष्पती दिसून येते (न्यादर्श पद्धतीने कोणत्याही एका वर्गाची, सर्व विषयाची अध्ययन निष्पती तपासावी) / 5. Current learning outcomes assessment by class and subject',
        formData.learning_outcomes_assessment,
        'learning_outcomes_assessment',
        'अध्ययन निष्पती मूल्यांकन तपशील',
        undefined,
        true,
        4
      )}

      <Text style={styles.subsectionTitle}>वर्गनिहाय विषय अध्ययन निष्पती / Subject-wise Learning Outcomes</Text>
      <Text style={styles.infoText}>
        कृपया प्रत्येक वर्गासाठी प्रत्येक विषयात किती विद्यार्थ्यांनी अध्ययन निष्पत्ती प्राप्त केली ते प्रविष्ट करा
      </Text>

      {renderInput(
        '६. शाळा भेट देणाऱ्या अधिकाऱ्यांनी सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार अध्ययन निष्पती तपासल्या नंतर विद्यार्थ्यांच्या संपादणुकीबाबत / विद्यार्थी प्रगती बाबत अभिप्राय द्यावा. / 6. Officer feedback on student progress after assessing learning outcomes',
        formData.officer_feedback,
        'officer_feedback',
        'अधिकाऱ्यांचे अभिप्राय',
        undefined,
        true,
        4
      )}

      {renderInput(
        '७. विद्यार्थ्यामध्ये शैक्षणिक गुणवत्ता निर्माण होण्याकरीता शाळेमध्ये नाविन्यपूर्ण उपक्रम राबविले आहेत का? असल्यास कोणते? / 7. Innovative initiatives implemented in school for educational quality',
        formData.innovative_initiatives,
        'innovative_initiatives',
        'नाविन्यपूर्ण उपक्रमांचे तपशील',
        undefined,
        true,
        4
      )}

      {renderInput(
        '८. विद्यार्थ्यामध्ये शैक्षणिक गुणवत्ता निर्माण होण्याकरिता व सदर शाळा तालुक्यातील इतर शाळांना मार्गदर्शक व्हावी यासाठी भेट देणाऱ्या अधिकाऱ्यांच्या मते शाळेत कोणत्या बदलाची आवश्यकता आहे? / 8. What changes are needed as per visiting officers for school to become a model school?',
        formData.suggested_changes,
        'suggested_changes',
        'सुधारणेसाठी सूचना',
        undefined,
        true,
        4
      )}

      {renderInput(
        '९. सृजनरंग या ई अंकामध्ये शाळेद्वारा लेख तसेच यशोगाथा पाठविले आहे का? असल्यास सृजनरंग या ई अंकामध्ये प्रसिद्ध झाला आहे का / 9. Has school sent articles to Srujanrang e-magazine? If yes, have they been published?',
        formData.srujanrang_articles,
        'srujanrang_articles',
        'सृजनरंग लेख बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '१०. सृजनरंग या पुढील ई अंकांसाठी लेख पाठवले आहेत का? / 10. Have articles been sent for future Srujanrang e-magazine issues?',
        formData.future_articles,
        'future_articles',
        'भविष्यातील लेख बाबत तपशील',
        undefined,
        true,
        3
      )}

      {renderInput(
        '११. शाळेमध्ये काम करत असलेल्या स्वयंसेवी संस्था कार्यरत आहेत? असल्यास कोणत्या विषयाच्या अनुषंगाने काम करत आहेत. / 11. Are NGOs working in the school? If yes, in which subject areas?',
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
      <Text style={styles.subsectionTitle}>Usage of Materials / Technology in Teaching-Learning</Text>
      <Text style={styles.infoText}>
        कृपया प्रत्येक साहित्य/तंत्रज्ञानाची उपलब्धता, वापर स्थिती आणि सूचना नोंदवा
      </Text>

      {Object.keys(formData.materials_usage).map((material, idx) => (
        <View key={material} style={styles.materialCard}>
          <Text style={styles.materialTitle}>
            {idx + 1}. {material}
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>उपलब्ध आहे का? / Available?</Text>
            <Switch
              value={formData.materials_usage[material].available}
              onValueChange={(val) => {
                const newMaterials = { ...formData.materials_usage };
                newMaterials[material] = { ...newMaterials[material], available: val };
                updateFormData('materials_usage', newMaterials);
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.materials_usage[material].available ? '#2563eb' : '#f3f4f6'}
            />
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.materials_usage[material].usage_status}
            onChangeText={(text) => {
              const newMaterials = { ...formData.materials_usage };
              newMaterials[material] = { ...newMaterials[material], usage_status: text };
              updateFormData('materials_usage', newMaterials);
            }}
            placeholder="अध्ययन-अध्यापन प्रक्रियेत वापराची सद्यस्थिती / Current Usage Status"
            multiline
            numberOfLines={2}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.materials_usage[material].suggestions}
            onChangeText={(text) => {
              const newMaterials = { ...formData.materials_usage };
              newMaterials[material] = { ...newMaterials[material], suggestions: text };
              updateFormData('materials_usage', newMaterials);
            }}
            placeholder="सुधारणात्मक सूचना / Improvement Suggestions"
            multiline
            numberOfLines={2}
          />
        </View>
      ))}
    </ScrollView>
  );

  const renderPhotoUpload = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>फोटो दस्तऐवजीकरण / Photo Documentation</Text>

      <TouchableOpacity style={styles.photoButton}>
        <Text style={styles.photoButtonText}>फोटो निवडा / Choose Photos</Text>
      </TouchableOpacity>

      <Text style={styles.subsectionTitle}>निरीक्षण अधिकारी माहिती / Inspector Information</Text>
      {renderInput('निरीक्षण अधिकाऱ्याचे नाव / Inspector Name', formData.inspector_name, 'inspector_name', 'अधिकाऱ्याचे नाव')}
      {renderInput('पदनाम / Designation', formData.inspector_designation, 'inspector_designation', 'पदनाम')}
      {renderInput('भेटीचा दिनांक / Visit Date', formData.visit_date_inspector, 'visit_date_inspector', 'YYYY-MM-DD')}
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
              <Text style={styles.buttonOutlineText}>मागे / Previous</Text>
            </TouchableOpacity>
          )}
          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>पुढे / Next</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.submitButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline, styles.halfButton]}
                onPress={handleSaveAsDraft}
                disabled={loading}
              >
                <Text style={styles.buttonOutlineText}>मसुदा जतन करा / Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, styles.halfButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonPrimaryText}>सबमिट / Submit</Text>
              </TouchableOpacity>
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
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  pickerValue: {
    fontSize: 14,
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
  photoButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 14,
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
});
