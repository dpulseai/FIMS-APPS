import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto } from '../../services/fimsService';
import { supabase } from '../../services/supabase';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'HealthInspection'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'HealthInspection'>;

const STEPS = [
  'Basic Info',
  'Questions 1-9',
  'Questions 10-18',
  'Questions 19-27',
  'Programs 1-50',
  'Programs 51-100',
  'Programs 101-150',
  'Location',
  'Photos'
];

interface ProgramData {
  program: string;
  target: string;
  achieved: string;
  percentage: string;
}

export default function HealthInspectionScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  // Basic Information
  const [locationName, setLocationName] = useState('');
  const [plannedDate, setPlannedDate] = useState('');

  // 27 Questions (Yes/No)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  // 150 Programs Data
  const [programsData, setProgramsData] = useState<ProgramData[]>([
    { program: 'राष्ट्रीय कुटुंब कल्याण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'पुरुष नसबंदी शस्त्रक्रिया', target: '', achieved: '', percentage: '' },
    { program: 'स्त्री नसबंदी शस्त्रक्रिया', target: '', achieved: '', percentage: '' },
    { program: 'एकुण शस्त्रक्रिया', target: '', achieved: '', percentage: '' },
    { program: 'IUCD', target: '', achieved: '', percentage: '' },
    { program: 'PPIUCD', target: '', achieved: '', percentage: '' },
    { program: '2) राष्ट्रीय माताबाल संगोपन कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण गरोदर माता नोंदणी', target: '', achieved: '', percentage: '' },
    { program: '१२ आठवडयाच्या आत नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'गरोदर माता १८० लोहगोळया', target: '', achieved: '', percentage: '' },
    { program: 'गरोदर माता ३६० कॅल्शियम गोळया', target: '', achieved: '', percentage: '' },
    { program: 'गरोदर माता ४ वेळा तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण अतिजोखमीच्या माता नोंद', target: '', achieved: '', percentage: '' },
    { program: 'गर्भपात', target: '', achieved: '', percentage: '' },
    { program: 'वैद्यकिय गर्भपात', target: '', achieved: '', percentage: '' },
    { program: 'एकुण प्रसूती', target: '', achieved: '', percentage: '' },
    { program: 'संस्थात्मक प्रसूती', target: '', achieved: '', percentage: '' },
    { program: 'घरी झालेली प्रसूती', target: '', achieved: '', percentage: '' },
    { program: 'एकुण जिवंत जन्म', target: '', achieved: '', percentage: '' },
    { program: '२.५ किलोग्रामपेक्षा कमी वजनाचे बालक', target: '', achieved: '', percentage: '' },
    { program: '3) आर आय', target: '', achieved: '', percentage: '' },
    { program: 'लसीकरण विभाग', target: '', achieved: '', percentage: '' },
    { program: 'बिसीजी', target: '', achieved: '', percentage: '' },
    { program: 'विटॅमीन के', target: '', achieved: '', percentage: '' },
    { program: 'पेंन्टॅवॅलंट १', target: '', achieved: '', percentage: '' },
    { program: 'ओपीव्ही १', target: '', achieved: '', percentage: '' },
    { program: 'पेंन्टॅवॅलंट ३', target: '', achieved: '', percentage: '' },
    { program: 'ओपीव्ही ३', target: '', achieved: '', percentage: '' },
    { program: 'आयपीव्ही १', target: '', achieved: '', percentage: '' },
    { program: 'आयपीव्ही २', target: '', achieved: '', percentage: '' },
    { program: 'रोटाव्हायरस ३', target: '', achieved: '', percentage: '' },
    { program: 'पिसीव्ही १', target: '', achieved: '', percentage: '' },
    { program: 'पिसीव्ही २', target: '', achieved: '', percentage: '' },
    { program: 'संपुर्ण लसीकरण (एम आर १)', target: '', achieved: '', percentage: '' },
    { program: 'एम आर २', target: '', achieved: '', percentage: '' },
    { program: 'डिपीटी बुस्टर', target: '', achieved: '', percentage: '' },
    { program: 'पोलिओ बुस्टर', target: '', achieved: '', percentage: '' },
    { program: 'टीडी १० वर्ष', target: '', achieved: '', percentage: '' },
    { program: 'टीडी १६ वर्ष', target: '', achieved: '', percentage: '' },
    { program: 'वि.पी.डी', target: '', achieved: '', percentage: '' },
    { program: 'ए.ई.एफ.आय', target: '', achieved: '', percentage: '' },
    { program: 'एएनसी टीडी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आरोग्य सेवा सत्रांची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आयोजित सत्रे', target: '', achieved: '', percentage: '' },
    { program: 'एकुण सॅम बालके', target: '', achieved: '', percentage: '' },
    { program: 'एकुण मॅम बालके', target: '', achieved: '', percentage: '' },
    { program: '4) चाईल्ड हेल्थ', target: '', achieved: '', percentage: '' },
    { program: '० ते १ वर्षातील बालमृत्यू', target: '', achieved: '', percentage: '' },
    { program: '१ ते ५ वर्षातील बालमृत्यू', target: '', achieved: '', percentage: '' },
    { program: 'व्हिसीबल बर्थ डिफेक्ट', target: '', achieved: '', percentage: '' },
    { program: '5) मॅटर्नल हेल्थ', target: '', achieved: '', percentage: '' },
    { program: 'मॅटर्नल डेथ', target: '', achieved: '', percentage: '' },
    { program: 'प्रसुती कक्ष', target: '', achieved: '', percentage: '' },
    { program: 'ए.एम.बी कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'भरती प्रक्रिया/डिस्चार्ज कार्ड', target: '', achieved: '', percentage: '' },
    { program: 'JSSK कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'JSY कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: '6) RISE APP', target: '', achieved: '', percentage: '' },
    { program: '7) RCH Portal', target: '', achieved: '', percentage: '' },
    { program: '8) सुधारित राष्ट्रीय क्षयरोग नियंत्रण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण संशयित क्षयरोग नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'संशयित क्षयरुग्णाची थुकी नमूना तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एक्स रे तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले क्षयरुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'निक्क्षय पोर्टलवर क्षयरुग्णांची नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'लाभार्थ्याला DBT लाभ देण्यात आला आहे काय', target: '', achieved: '', percentage: '' },
    { program: 'उपचार सुरु केलेले क्षयरुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण मृत्यू झालेले क्षयरुग्ण', target: '', achieved: '', percentage: '' },
    { program: '9) राष्ट्रीय कुष्ठरोग दूरिकरण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'संशयित कुष्ठरुग्ण नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण क्रियाशिल रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'पीबी', target: '', achieved: '', percentage: '' },
    { program: 'एमबी', target: '', achieved: '', percentage: '' },
    { program: 'उपचार सुरु केलेले कुष्ठरुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'आरएफटी झालेले कुष्ठरुग्ण', target: '', achieved: '', percentage: '' },
    { program: '10) राष्ट्रीय किटकजन्य आजार नियंत्रण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'बाहयरुग्ण विभागात एकुण नवीन नोंदणी झालेल रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण रक्त नमूना गोळा केलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'हिवताप आढळलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'पीव्हि', target: '', achieved: '', percentage: '' },
    { program: 'पीएफ', target: '', achieved: '', percentage: '' },
    { program: 'एकुण उपचार केलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण मृत्यू झालेले हिवताप रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'प्रा.आ.केंद्रामार्फत अंडवृध्दि शिबीराचे आयोजन', target: '', achieved: '', percentage: '' },
    { program: 'हत्तीरोग क्लिनिक व पायधूनी कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'पायधूनी किट वाटप', target: '', achieved: '', percentage: '' },
    { program: 'एकुण संशयित रुग्णाची डेंग्यू नमूना तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण डेंग्यूचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण डेंग्यू रुग्णाचा मृत्यू', target: '', achieved: '', percentage: '' },
    { program: '11) एकात्मिक साथरोग सर्व्हेक्षण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण उपकेंद्राची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'एकुण भरलेले एस फार्म', target: '', achieved: '', percentage: '' },
    { program: 'एकुण भरलेले पी फार्म', target: '', achieved: '', percentage: '' },
    { program: 'एकुण भरलेले एल फार्म', target: '', achieved: '', percentage: '' },
    { program: 'एकुण पाणी नमूने तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'दूषीत आढळलेले पाणी नमूने', target: '', achieved: '', percentage: '' },
    { program: 'एकुण ब्लिचिंग पावडर नमूने तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'दूषीत आढळलेले ब्लिचिंग पावडर नमूने', target: '', achieved: '', percentage: '' },
    { program: 'हिरवे कार्ड देण्यात आलेल्या ग्रामपचांयतीची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'पिवळे कार्ड देण्यात आलेल्या ग्रामपचांयतीची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'लाल कार्ड देण्यात आलेल्या ग्रामपचांयतीची संख्या', target: '', achieved: '', percentage: '' },
    { program: '12) राष्ट्रीय असांसर्गिक रोग नियंत्रण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले रक्तदाबाचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले मधुमेह रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण तोंडाच्या कर्करोगाचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण स्तनाच्या कर्करोगाचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण गर्भाशयाच्या कर्करोगाचे रुग्ण', target: '', achieved: '', percentage: '' }
  ]);

  const questions = [
    { num: 1, text: 'ओपीडी मध्ये आवश्यक उपकरणे व साधनसामुग्री उपलब्ध आहे काय ?' },
    { num: 2, text: 'नोंदणी प्रक्रियेदरम्यान रुग्णांना नोंदणी क्रमांक तसेच संपुर्ण तपशिल लिहीला जातो काय ?' },
    { num: 3, text: 'ओपीडी स्लिपमध्ये रुग्णांचा इतिहास, तक्रारी, तात्पुरते निदान नोंदविले जातात काय ?' },
    { num: 4, text: 'गरोदर मातेसाठी औषधीची सुविधा उपलब्ध आहे काय ?' },
    { num: 5, text: 'दररोज लागणारे उपकरणे व अत्यावश्यक औषधांची यादी आहे काय ?' },
    { num: 6, text: 'PIH (Pregnancy induced Hypertension) ची लक्षणे व त्यादरम्यान करण्याच्या उपायाबाबत माहीती आहे काय व त्याबाबत किट उपलब्ध आहे काय ?' },
    { num: 7, text: 'लसीकरण बाबत संपुर्ण माहीती आहे काय ? आयएलआर चे तापमान नोदींचे रजिस्टर उपलब्ध आहे काय ?' },
    { num: 8, text: 'Emergency Drug tray मधील औषधाच्या Expiry date चा चार्ट अद्यावत करण्यात येतो काय ?' },
    { num: 9, text: 'आरोग्य सेविकेचे एनएसएसके, आयुसीडी, एसबीए (Skill Birth Attendant) प्रशिक्षण घेऊन याबाबत कौशल्य प्राप्त केले आहे ?' },
    { num: 10, text: 'कुटुंब कल्याण कार्यक्रमामधील पाळणा लांबविण्याकरिता अंतरा, छाया संस्थेमध्ये उपलब्ध आहे काय, तसेच आयुसिडी व पीपीआययुसीडी बसविल्या जातात काय ?' },
    { num: 11, text: 'PMMVY, JSY, MVM, MAY ई योजने अंतर्गत प्रा.आ.केंद्र स्तरावर लाभार्थ्यांची नोंदणी व रजिस्टर अद्यावत ठेवण्यात आलेले आहे काय ? लाभार्थ्यांना विहित वेळेत आर्थीक लाभ देण्यात आला आहे काय ?' },
    { num: 12, text: 'दर महिन्याचे २८ ते ३० तारखेला उपकेंद्र स्तरावर, १ तारखेला प्रा. आ.केंद्र स्तरावर HMIS Data Validation Meeting नियमित घेतली जाते काय ?' },
    { num: 13, text: 'BMW/IMEP चे वर्गीकरणाबाबत माहीती अवगत आहे काय असल्यास त्यानुसार पिवळी व लाल बकेट तसेच निळा व पांढरा बॉक्समध्ये वर्गीकरण करता येते काय ? Biomedical waste साठी संस्था रजिस्टर्ड आहे काय ?' },
    { num: 14, text: 'Emergency Drug tray मध्ये ठेवण्यात येणाऱ्या औषधीबाबत वापर करण्याबाबतची माहीती आहे काय ?' },
    { num: 15, text: 'संस्थेतील प्रसाधन गृहे स्वच्छ आहे काय. स्वच्छतेची चेकलिस्ट लावण्यात आलेली आहे काय ?' },
    { num: 16, text: 'वयोवृध्द रुणांकरिता रुग्णालयात प्रवेश करतांना हातधरण्याकरिता रॅम्प (Ramp) व हॅडंल (Handle) उपलब्धआहे काय ?' },
    { num: 17, text: 'कार्यक्रमाबाबत देण्यात येणाऱ्या सुविधेबाबत माहीती त्यामध्ये विषयाबाबत समुपदेशन करणे व त्याबाबतची माहीती ठळकपणे प्रदर्शित करण्यात आली आहे काय ?' },
    { num: 18, text: 'प्रा.आ.केंद्र स्तरावर CRS Software मध्ये Online जन्म म≡त्युच्या नोंदी करुन लाभार्थ्यांना प्रमाणपत्र दिल्या जाते काय ?' },
    { num: 19, text: 'प्रा.आ. केद्रस्तरावर Biomedical Waste, Fire extinguisher वापराबाबत कर्मचाऱ्यांचे प्रशिक्षण झाले आहे ?' },
    { num: 20, text: 'संस्थेतील विविध विभागाचे मुल्यमापन चॅकलिस्ट नुसार करण्याचा कृती आराखडा उपलब्ध आहे काय व त्यानुसार कार्यवाही करण्यात येते काय ?' },
    { num: 21, text: 'विविध राष्ट्रीय कार्यक्रमाचे रेकॉर्ड अद्यावत आहे काय ?' },
    { num: 22, text: 'आरोग्य केंद्रातील तपासणी करिता लागणारे उपकरणे व साधनसामुग्री वापरण्याबाबत व त्याची काळजी घेण्याबाबत माहीती आहे काय ?' },
    { num: 23, text: 'आरोग्य केंद्रातील संस्थेत संदर्भ सेवा देणे आवश्यक असल्यास त्याबाबत ज्या संस्थेत रुग्ण संदर्भित होणार आहे त्या संस्थेला आधिच कळविणे गरजेचे आहे त्याबाबत आरोग्य सेविकेला माहीती आहे काय ?' },
    { num: 24, text: 'रेफर आऊट आणि रेफर इन रजिस्टर अद्यावत ठेवणे (Refferal Audit) याबाबत कर्मचाऱ्यांना माहिती आहे काय ?)' },
    { num: 25, text: '५ आर विषयी आरोग्य सेविकेला माहीती आहे काय ? ज्यामध्ये Right Patient, Right Drug, Right Route, Right time, Right documentation' },
    { num: 26, text: 'एनसीडी कार्यक्रमानुसार Hypertension, Blood Sugar Cervical cancer इत्यादी आजाराबाबत तपासणी केली जाते काय व त्याबाबत गोषवारा संस्थेत उपलब्ध आहे काय ?' },
    { num: 27, text: 'प्रा.आ.केंद्रात गप्पीमासे पैदास केंद्रे कार्यरत आहे काय ?' }
  ];

  const handleRadioChange = (questionNum: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionNum]: value }));
  };

  const handleProgramChange = (index: number, field: 'target' | 'achieved' | 'percentage', value: string) => {
    setProgramsData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep === 0 && !locationName) {
      Alert.alert(t('common.error'), 'कृपया स्थान नाव भरा / Please fill location name');
      return;
    }
    if (currentStep === 7 && !location) {
      Alert.alert(t('common.error'), 'Please capture location');
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
      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: user?.email || '',
        status: 'draft',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      // Save form data to health_inspection_form table
      const formData: any = {
        inspection_id: inspection.id,
        programs_data: programsData,
      };

      // Add all 27 questions
      for (let i = 1; i <= 27; i++) {
        formData[`q${i}`] = answers[i] || '';
      }

      const { error: formError } = await supabase
        .from('health_inspection_form')
        .insert(formData);

      if (formError) throw formError;

      Alert.alert(t('common.success'), t('fims.inspectionSaved'));
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(t('common.error'), 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert(t('common.error'), 'Add at least one photo');
      return;
    }
    try {
      setLoading(true);
      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: user?.email || '',
        status: 'submitted',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });

      // Save form data to health_inspection_form table
      const formData: any = {
        inspection_id: inspection.id,
        programs_data: programsData,
      };

      // Add all 27 questions
      for (let i = 1; i <= 27; i++) {
        formData[`q${i}`] = answers[i] || '';
      }

      const { error: formError } = await supabase
        .from('health_inspection_form')
        .insert(formData);

      if (formError) throw formError;

      // Upload photos with metadata
      for (let i = 0; i < photos.length; i++) {
        await uploadPhoto(inspection.id, photos[i], `photo_${i + 1}.jpg`, i + 1);
      }

      Alert.alert(t('common.success'), t('fims.inspectionSubmitted'));
      navigation.navigate('CategorySelection');
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(t('common.error'), 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const renderRadioButton = (questionNum: number, value: string, label: string) => {
    const isSelected = answers[questionNum] === value;
    return (
      <TouchableOpacity
        style={styles.radioButton}
        onPress={() => handleRadioChange(questionNum, value)}
      >
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderQuestion = (question: { num: number; text: string }) => (
    <View key={question.num} style={styles.questionContainer}>
      <Text style={styles.questionText}>{`${question.num}. ${question.text}`}</Text>
      <View style={styles.radioGroup}>
        {renderRadioButton(question.num, 'होय', 'होय (Yes)')}
        {renderRadioButton(question.num, 'नाही', 'नाही (No)')}
      </View>
    </View>
  );

  const renderProgramRow = (program: ProgramData, index: number) => (
    <View key={index} style={styles.programRow}>
      <Text style={styles.programName}>{program.program}</Text>
      <View style={styles.programInputs}>
        <Input
          label="लक्ष्य / Target"
          value={program.target}
          onChangeText={(text) => handleProgramChange(index, 'target', text)}
          keyboardType="number-pad"
          containerStyle={styles.programInput}
        />
        <Input
          label="साध्य / Achieved"
          value={program.achieved}
          onChangeText={(text) => handleProgramChange(index, 'achieved', text)}
          keyboardType="number-pad"
          containerStyle={styles.programInput}
        />
        <Input
          label="टक्केवारी / %"
          value={program.percentage}
          onChangeText={(text) => handleProgramChange(index, 'percentage', text)}
          keyboardType="number-pad"
          containerStyle={styles.programInput}
        />
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text style={styles.sectionTitle}>मूळ माहिती</Text>
            <Text style={styles.sectionSubtitle}>Basic Information</Text>
            <Input
              label="स्थान नाव / Location Name *"
              value={locationName}
              onChangeText={setLocationName}
            />
            <DateInput
              label="नियोजित तारीख / Planned Date"
              value={plannedDate}
              onChangeDate={setPlannedDate}
            />
          </View>
        );
      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>प्रश्न १-९</Text>
            <Text style={styles.sectionSubtitle}>Questions 1-9</Text>
            {questions.slice(0, 9).map(renderQuestion)}
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>प्रश्न १०-१८</Text>
            <Text style={styles.sectionSubtitle}>Questions 10-18</Text>
            {questions.slice(9, 18).map(renderQuestion)}
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.sectionTitle}>प्रश्न १९-२७</Text>
            <Text style={styles.sectionSubtitle}>Questions 19-27</Text>
            {questions.slice(18, 27).map(renderQuestion)}
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.sectionTitle}>राष्ट्रीय कार्यक्रम १-५०</Text>
            <Text style={styles.sectionSubtitle}>National Programs 1-50</Text>
            {programsData.slice(0, 50).map((program, index) => renderProgramRow(program, index))}
          </View>
        );
      case 5:
        return (
          <View>
            <Text style={styles.sectionTitle}>राष्ट्रीय कार्यक्रम ५१-१००</Text>
            <Text style={styles.sectionSubtitle}>National Programs 51-100</Text>
            {programsData.slice(50, 100).map((program, index) => renderProgramRow(program, index + 50))}
          </View>
        );
      case 6:
        return (
          <View>
            <Text style={styles.sectionTitle}>राष्ट्रीय कार्यक्रम १०१-१५०</Text>
            <Text style={styles.sectionSubtitle}>National Programs 101-150</Text>
            {programsData.slice(100, 110).map((program, index) => renderProgramRow(program, index + 100))}
          </View>
        );
      case 7:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text>
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );
      case 8:
        return (
          <View>
            <Text style={styles.sectionTitle}>{t('fims.photosSubmit')}</Text>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
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
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <Button title={t('common.previous')} onPress={handlePrevious} variant="outline" style={styles.button} disabled={loading} />
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button title={t('common.next')} onPress={handleNext} style={styles.button} disabled={loading} />
          ) : (
            <View style={styles.submitButtons}>
              <Button title={t('fims.saveAsDraft')} onPress={handleSaveAsDraft} variant="outline" style={styles.halfButton} loading={loading} />
              <Button title={t('fims.submitInspection')} onPress={handleSubmit} style={styles.halfButton} loading={loading} />
            </View>
          )}
        </View>
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
  questionContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  questionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2563eb',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  programRow: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  programName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  programInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  programInput: {
    flex: 1,
  },
  footer: { backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 4 },
  submitButtons: { flexDirection: 'row', flex: 1 },
  halfButton: { flex: 1, marginHorizontal: 4 },
});
