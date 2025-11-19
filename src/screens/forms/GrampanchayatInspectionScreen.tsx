import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto } from '../../services/fimsService';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhotoUpload from '../../components/PhotoUpload';
import LocationPicker from '../../components/LocationPicker';

type RouteParams = RouteProp<FormsStackParamList, 'GrampanchayatInspection'>;
type NavigationProp = StackNavigationProp<FormsStackParamList, 'GrampanchayatInspection'>;

// const STEPS = [
//   'Basic Info',
//   'Location Info',
//   'Meeting Info',
//   'Cash Book',
//   'Tax Register',
//   'Tax Progress',
//   'Expenditure',
//   'Financial Trans.',
//   'GP Works',
//   'Other Schemes',
//   '14th Finance',
//   'Officer Opinion',
//   'Photos',
//   'Copy'
// ];

const STEPS = [
  'Basic Info',
  'Location Info',
  'Meeting Info',
  'Cash Book',
  'Tax Register',
  'Tax Progress',
  'Expenditure',
  'Financial Trans.',
  'GP Works',
  'Other Schemes',
  'Schemes Progress',
  '14th Finance',
  'Officer Opinion',
  'Photos',
  'Copy'
];

export default function GrampanchayatInspectionScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { categoryId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  // Section 1: Basic Information (मूळ माहिती)
  const [gpName, setGpName] = useState('');
  const [psName, setPsName] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionPlace, setInspectionPlace] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerPost, setOfficerPost] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [secretaryTenure, setSecretaryTenure] = useState('');

  // Section 2: Location (स्थान माहिती) - handled by LocationPicker
  const [locationVisitDate, setLocationVisitDate] = useState('');

  // Section 3: Meeting Information (सभा माहिती)
  const [monthlyMeetings, setMonthlyMeetings] = useState('');
  const [agendaUpToDate, setAgendaUpToDate] = useState('');

  // Section 4: Taxation (Section 8)
  const [receiptUpToDate, setReceiptUpToDate] = useState('');
  const [reassessmentDone, setReassessmentDone] = useState('');
  const [reassessmentAction, setReassessmentAction] = useState('');
  const [resolutionNo, setResolutionNo] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');

  // Section 5 & 6: Cash Book Details (रोकड वहीचा तपशील) - Section 7
  // First table: Gram Nidhi & Water Supply
  const [gramNidhiRegisterBalance, setGramNidhiRegisterBalance] = useState('');
  const [gramNidhiBankBalance, setGramNidhiBankBalance] = useState('');
  const [gramNidhiPostBalance, setGramNidhiPostBalance] = useState('');
  const [gramNidhiHandBalance, setGramNidhiHandBalance] = useState('');
  const [gramNidhiCheck, setGramNidhiCheck] = useState('');

  const [waterSupplyRegisterBalance, setWaterSupplyRegisterBalance] = useState('');
  const [waterSupplyBankBalance, setWaterSupplyBankBalance] = useState('');
  const [waterSupplyPostBalance, setWaterSupplyPostBalance] = useState('');
  const [waterSupplyHandBalance, setWaterSupplyHandBalance] = useState('');
  const [waterSupplyCheck, setWaterSupplyCheck] = useState('');

  // Second table: 17 Funds
  const [_14thFinanceRegisterBalance, set14thFinanceRegisterBalance] = useState('');
  const [_14thFinanceBankBalance, set14thFinanceBankBalance] = useState('');
  const [_14thFinancePostBalance, set14thFinancePostBalance] = useState('');
  const [_14thFinanceHandBalance, set14thFinanceHandBalance] = useState('');
  const [_14thFinanceCheck, set14thFinanceCheck] = useState('');

  const [engGhaYoRegisterBalance, setEngGhaYoRegisterBalance] = useState('');
  const [engGhaYoBankBalance, setEngGhaYoBankBalance] = useState('');
  const [engGhaYoPostBalance, setEngGhaYoPostBalance] = useState('');
  const [engGhaYoHandBalance, setEngGhaYoHandBalance] = useState('');
  const [engGhaYoCheck, setEngGhaYoCheck] = useState('');

  const [scDevelopmentRegisterBalance, setScDevelopmentRegisterBalance] = useState('');
  const [scDevelopmentBankBalance, setScDevelopmentBankBalance] = useState('');
  const [scDevelopmentPostBalance, setScDevelopmentPostBalance] = useState('');
  const [scDevelopmentHandBalance, setScDevelopmentHandBalance] = useState('');
  const [scDevelopmentCheck, setScDevelopmentCheck] = useState('');

  const [laborDeptRegisterBalance, setLaborDeptRegisterBalance] = useState('');
  const [laborDeptBankBalance, setLaborDeptBankBalance] = useState('');
  const [laborDeptPostBalance, setLaborDeptPostBalance] = useState('');
  const [laborDeptHandBalance, setLaborDeptHandBalance] = useState('');
  const [laborDeptCheck, setLaborDeptCheck] = useState('');

  const [thakkarBappaRegisterBalance, setThakkarBappaRegisterBalance] = useState('');
  const [thakkarBappaBankBalance, setThakkarBappaBankBalance] = useState('');
  const [thakkarBappaPostBalance, setThakkarBappaPostBalance] = useState('');
  const [thakkarBappaHandBalance, setThakkarBappaHandBalance] = useState('');
  const [thakkarBappaCheck, setThakkarBappaCheck] = useState('');

  const [gramKoshMoneyRegisterBalance, setGramKoshMoneyRegisterBalance] = useState('');
  const [gramKoshMoneyBankBalance, setGramKoshMoneyBankBalance] = useState('');
  const [gramKoshMoneyPostBalance, setGramKoshMoneyPostBalance] = useState('');
  const [gramKoshMoneyHandBalance, setGramKoshMoneyHandBalance] = useState('');
  const [gramKoshMoneyCheck, setGramKoshMoneyCheck] = useState('');

  const [civicFacilitiesRegisterBalance, setCivicFacilitiesRegisterBalance] = useState('');
  const [civicFacilitiesBankBalance, setCivicFacilitiesBankBalance] = useState('');
  const [civicFacilitiesPostBalance, setCivicFacilitiesPostBalance] = useState('');
  const [civicFacilitiesHandBalance, setCivicFacilitiesHandBalance] = useState('');
  const [civicFacilitiesCheck, setCivicFacilitiesCheck] = useState('');

  const [dalitBastiRegisterBalance, setDalitBastiRegisterBalance] = useState('');
  const [dalitBastiBankBalance, setDalitBastiBankBalance] = useState('');
  const [dalitBastiPostBalance, setDalitBastiPostBalance] = useState('');
  const [dalitBastiHandBalance, setDalitBastiHandBalance] = useState('');
  const [dalitBastiCheck, setDalitBastiCheck] = useState('');

  const [tantaMuktRegisterBalance, setTantaMuktRegisterBalance] = useState('');
  const [tantaMuktBankBalance, setTantaMuktBankBalance] = useState('');
  const [tantaMuktPostBalance, setTantaMuktPostBalance] = useState('');
  const [tantaMuktHandBalance, setTantaMuktHandBalance] = useState('');
  const [tantaMuktCheck, setTantaMuktCheck] = useState('');

  const [janSuvidhaRegisterBalance, setJanSuvidhaRegisterBalance] = useState('');
  const [janSuvidhaBankBalance, setJanSuvidhaBankBalance] = useState('');
  const [janSuvidhaPostBalance, setJanSuvidhaPostBalance] = useState('');
  const [janSuvidhaHandBalance, setJanSuvidhaHandBalance] = useState('');
  const [janSuvidhaCheck, setJanSuvidhaCheck] = useState('');

  const [paykaRegisterBalance, setPaykaRegisterBalance] = useState('');
  const [paykaBankBalance, setPaykaBankBalance] = useState('');
  const [paykaPostBalance, setPaykaPostBalance] = useState('');
  const [paykaHandBalance, setPaykaHandBalance] = useState('');
  const [paykaCheck, setPaykaCheck] = useState('');

  const [panchayatSamitiRegisterBalance, setPanchayatSamitiRegisterBalance] = useState('');
  const [panchayatSamitiBankBalance, setPanchayatSamitiBankBalance] = useState('');
  const [panchayatSamitiPostBalance, setPanchayatSamitiPostBalance] = useState('');
  const [panchayatSamitiHandBalance, setPanchayatSamitiHandBalance] = useState('');
  const [panchayatSamitiCheck, setPanchayatSamitiCheck] = useState('');

  const [sbmRegisterBalance, setSbmRegisterBalance] = useState('');
  const [sbmBankBalance, setSbmBankBalance] = useState('');
  const [sbmPostBalance, setSbmPostBalance] = useState('');
  const [sbmHandBalance, setSbmHandBalance] = useState('');
  const [sbmCheck, setSbmCheck] = useState('');

  const [tirthakshetraRegisterBalance, setTirthakshetraRegisterBalance] = useState('');
  const [tirthakshetraBankBalance, setTirthakshetraBankBalance] = useState('');
  const [tirthakshetraPostBalance, setTirthakshetraPostBalance] = useState('');
  const [tirthakshetraHandBalance, setTirthakshetraHandBalance] = useState('');
  const [tirthakshetraCheck, setTirthakshetraCheck] = useState('');

  const [minorityFundRegisterBalance, setMinorityFundRegisterBalance] = useState('');
  const [minorityFundBankBalance, setMinorityFundBankBalance] = useState('');
  const [minorityFundPostBalance, setMinorityFundPostBalance] = useState('');
  const [minorityFundHandBalance, setMinorityFundHandBalance] = useState('');
  const [minorityFundCheck, setMinorityFundCheck] = useState('');

  // Section 7: Tax Collection Progress (Section 9)
  const [previousYearHouseTaxArrears, setPreviousYearHouseTaxArrears] = useState('');
  const [previousYearWaterTaxArrears, setPreviousYearWaterTaxArrears] = useState('');
  const [currentYearHouseTaxDemand, setCurrentYearHouseTaxDemand] = useState('');
  const [currentYearWaterTaxDemand, setCurrentYearWaterTaxDemand] = useState('');
  const [totalHouseTaxDemand, setTotalHouseTaxDemand] = useState('');
  const [totalWaterTaxDemand, setTotalWaterTaxDemand] = useState('');
  const [totalHouseTaxCollection, setTotalHouseTaxCollection] = useState('');
  const [totalWaterTaxCollection, setTotalWaterTaxCollection] = useState('');
  const [balanceHouseTaxCollection, setBalanceHouseTaxCollection] = useState('');
  const [balanceWaterTaxCollection, setBalanceWaterTaxCollection] = useState('');
  const [houseTaxPercentage, setHouseTaxPercentage] = useState('');
  const [waterTaxPercentage, setWaterTaxPercentage] = useState('');
  const [remarks, setRemarks] = useState('');

  // Section 8: 15% Fund Expenditure (Section 10)
  const [gramPanchayatTotalIncome, setGramPanchayatTotalIncome] = useState('');
  const [fifteenPercentAmount, setFifteenPercentAmount] = useState('');
  const [previousBalance, setPreviousBalance] = useState('');
  const [totalExpense, setTotalExpense] = useState('');
  const [expenseTillInspectionDate, setExpenseTillInspectionDate] = useState('');
  const [balanceExpense, setBalanceExpense] = useState('');

  // Section 9: Financial Transactions (Section 11)
  const [budgetProvision, setBudgetProvision] = useState('');
  const [gpApprovalGiven, setGpApprovalGiven] = useState('');
  const [gpApprovalResolutionNo, setGpApprovalResolutionNo] = useState('');
  const [gpApprovalDate, setGpApprovalDate] = useState('');
  const [tendersCalled, setTendersCalled] = useState('');
  const [entriesMade, setEntriesMade] = useState('');

  // Section 10: GP Works (Section 12) - Detailed fields
  const [gpWorkSerialNo, setGpWorkSerialNo] = useState('');
  const [gpWorkSchemeName, setGpWorkSchemeName] = useState('');
  const [gpWorkType, setGpWorkType] = useState('');
  const [gpWorkEstimatedAmount, setGpWorkEstimatedAmount] = useState('');
  const [gpWorkGrantReceived, setGpWorkGrantReceived] = useState('');
  const [gpWorkExpenditure, setGpWorkExpenditure] = useState('');
  const [gpWorkStartDate, setGpWorkStartDate] = useState('');
  const [gpWorkCompletionDate, setGpWorkCompletionDate] = useState('');
  const [gpWorkCurrentStatus, setGpWorkCurrentStatus] = useState('');
  const [gpWorkCertificateReceived, setGpWorkCertificateReceived] = useState('');
  const [gpWorkRemarks, setGpWorkRemarks] = useState('');

  // Section 11: Other Schemes (Section 13) - Table format
  const [otherSchemes, setOtherSchemes] = useState([
    { schemeName: 'एगाविका', targetsGiven: '', progressOnDate: '', remarks: '' },
    { schemeName: 'बॉयोगॅस', targetsGiven: '', progressOnDate: '', remarks: '' },
    { schemeName: 'निर्धूर चुल', targetsGiven: '', progressOnDate: '', remarks: '' },
    { schemeName: 'कुटुंब कल्याण', targetsGiven: '', progressOnDate: '', remarks: '' },
    { schemeName: 'अल्पवचत', targetsGiven: '', progressOnDate: '', remarks: '' },
    { schemeName: '', targetsGiven: '', progressOnDate: '', remarks: '' },
    { schemeName: '', targetsGiven: '', progressOnDate: '', remarks: '' },
  ]);

  const updateOtherScheme = (index: number, field: string, value: string) => {
    const updatedSchemes = [...otherSchemes];
    updatedSchemes[index] = { ...updatedSchemes[index], [field]: value };
    setOtherSchemes(updatedSchemes);
  };

  // Section 12: 14th Finance Commission (Section 14) - Table format
  const [financeCommissionWorks, setFinanceCommissionWorks] = useState([
    { schemeName: '14 वा वित्त आयोग', workType: 'एल.ई.डी.लाईट खरेदी', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'कचरा कुंडी', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'फर्निचर', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'टि.व्हि.संच खरेदी', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'आपले सरकार सेवा केंद्र खर्च', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'वाटर मिटर', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'सीसीरोड', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'आपले सरकार सेवा केंद्र खर्च', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'फॉगिंग मशीन', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'ग्रांपभवन', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
    { schemeName: 'कंप्युटर', workType: '', estimatedAmount: '', grantReceived: '', remarks: '' },
  ]);

  const updateFinanceCommissionWork = (index: number, field: string, value: string) => {
    const updatedWorks = [...financeCommissionWorks];
    updatedWorks[index] = { ...updatedWorks[index], [field]: value };
    setFinanceCommissionWorks(updatedWorks);
  };

  // Section 13: Officer's Opinion
  const [officerOpinion1, setOfficerOpinion1] = useState('');
  const [officerOpinion2, setOfficerOpinion2] = useState('');
  const [officerOpinion3, setOfficerOpinion3] = useState('');
  const [officerOpinion4, setOfficerOpinion4] = useState('');
  const [officerOpinion5, setOfficerOpinion5] = useState('');
  const [officerOpinion6, setOfficerOpinion6] = useState('');
  const [officerOpinion7, setOfficerOpinion7] = useState('');
  const [officerOpinion8, setOfficerOpinion8] = useState('');

  const handleNext = () => {
    if (currentStep === 0 && !gpName) {
      Alert.alert(t('common.error'), 'कृपया ग्राम पंचायतीचे नाव भरा');
      return;
    }
    if (currentStep === 1 && !location) {
      Alert.alert(t('common.error'), 'कृपया स्थान कॅप्चर करा');
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
      await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: secretaryName || user?.email || '',
        status: 'draft',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });
      Alert.alert(t('common.success'), 'मसुदा यशस्वीरित्या सेव्ह झाला');
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), 'सेव्ह करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert(t('common.error'), 'कृपया किमान एक फोटो अपलोड करा');
      return;
    }
    try {
      setLoading(true);
      const inspection = await createInspection({
        category_id: categoryId,
        inspector_id: user?.id,
        filled_by_name: secretaryName || user?.email || '',
        status: 'submitted',
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address || null,
      });
      for (let i = 0; i < photos.length; i++) {
        await uploadPhoto(inspection.id, photos[i], `photo${i + 1}.jpg`, i + 1);
      }
      Alert.alert(t('common.success'), 'तपासणी यशस्वीरित्या सबमिट झाली');
      navigation.navigate('CategorySelection');
    } catch (error) {
      Alert.alert(t('common.error'), 'सबमिट करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const RadioButton = ({ label, value, selectedValue, onSelect }: any) => (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => onSelect(value)}
    >
      <View style={[styles.radioCircle, selectedValue === value && styles.radioCircleSelected]}>
        {selectedValue === value && <View style={styles.radioDot} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderFundRow = (
    serialNo: string,
    fundName: string,
    registerBalance: string,
    setRegisterBalance: (val: string) => void,
    bankBalance: string,
    setBankBalance: (val: string) => void,
    postBalance: string,
    setPostBalance: (val: string) => void,
    handBalance: string,
    setHandBalance: (val: string) => void,
    check: string,
    setCheck: (val: string) => void
  ) => (
    <View style={styles.tableRow}>
      <Text style={styles.fundName}>{serialNo}. {fundName}</Text>
      <Input
        label="नोंदवहीतील शिल्लक"
        value={registerBalance}
        onChangeText={setRegisterBalance}
        keyboardType="numeric"
        placeholder="0"
      />
      <Input
        label="बँकेतील शिल्लक"
        value={bankBalance}
        onChangeText={setBankBalance}
        keyboardType="numeric"
        placeholder="0"
      />
      <Input
        label="पोस्टातील शिल्लक"
        value={postBalance}
        onChangeText={setPostBalance}
        keyboardType="numeric"
        placeholder="0"
      />
      <Input
        label="हाती असलेली शिल्लक"
        value={handBalance}
        onChangeText={setHandBalance}
        keyboardType="numeric"
        placeholder="0"
      />
      <Input
        label="चेक"
        value={check}
        onChangeText={setCheck}
        placeholder="टिप्पणी"
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <View>
            <Text style={styles.headerTitle}>परिशिष्ट-चार</Text>
            <Text style={styles.headerSubtitle}>(नियम 80 पहा)</Text>
            <Text style={styles.headerSubtitle}>(ख)ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</Text>

            <Text style={styles.sectionTitle}>मूळ माहिती</Text>

            <Text style={styles.questionNumber}>1. ग्राम पंचायतिचे नांव व पंचायत समिती:</Text>
            <Input
              label="ग्राम पंचायतिचे नांव *"
              value={gpName}
              onChangeText={setGpName}
              placeholder="ग्राम पंचायतिचे नांव प्रविष्ट करा"
            />
            <Input
              label="पंचायत समिती"
              value={psName}
              onChangeText={setPsName}
              placeholder="पंचायत समिती प्रविष्ट करा"
            />

            <Text style={styles.questionNumber}>2. (क) सर्वसाधारण तपासणीची तारीख:</Text>
            <DateInput
              label="तारीख"
              value={inspectionDate}
              onChangeDate={setInspectionDate}
              placeholder="तारीख निवडा"
              minimumDate={new Date()}
            />

            <Text style={styles.questionNumber}>2. (ख) सर्वसाधारण तपासणीचे ठिकाण:</Text>
            <Input
              label="ठिकाण"
              value={inspectionPlace}
              onChangeText={setInspectionPlace}
              placeholder="तपासणीचे ठिकाण प्रविष्ट करा"
            />

            <Text style={styles.questionNumber}>3. तपासणी अधिकारीाचे नांव व हुद्दा:</Text>
            <Input
              label="अधिकारीाचे नांव"
              value={officerName}
              onChangeText={setOfficerName}
              placeholder="अधिकारीाचे नांव प्रविष्ट करा"
            />
            <Input
              label="हुद्दा"
              value={officerPost}
              onChangeText={setOfficerPost}
              placeholder="हुद्दा प्रविष्ट करा"
            />

            <Text style={styles.questionNumber}>4. सचिवाचे नांव व कार्यकाळ:</Text>
            <Input
              label="सचिवाचे नांव"
              value={secretaryName}
              onChangeText={setSecretaryName}
              placeholder="सचिवाचे नांव प्रविष्ट करा"
            />
            <Input
              label="कार्यकाळ"
              value={secretaryTenure}
              onChangeText={setSecretaryTenure}
              placeholder="कार्यकाळ प्रविष्ट करा"
            />
          </View>
        );

      case 1: // Location Information
        return (
          <View>
            <Text style={styles.sectionTitle}>स्थान माहिती</Text>
            <DateInput
              label="तारीख"
              value={locationVisitDate}
              onChangeDate={setLocationVisitDate}
              placeholder="तारीख निवडा"
              minimumDate={new Date()}
            />
            <LocationPicker location={location} onLocationChange={setLocation} />
          </View>
        );

      case 2: // Meeting Information
        return (
          <View>
            <Text style={styles.sectionTitle}>सभा माहिती</Text>

            <Text style={styles.questionNumber}>6. मासिक सभा नियमांनुसार नियमितपणे होतात काय ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={monthlyMeetings}
                onSelect={setMonthlyMeetings}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={monthlyMeetings}
                onSelect={setMonthlyMeetings}
              />
            </View>

            <Text style={styles.questionNumber}>सभेची कार्यसूची व सभेची नोंदवही इत्यादी अद्यावत आहे काय ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={agendaUpToDate}
                onSelect={setAgendaUpToDate}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={agendaUpToDate}
                onSelect={setAgendaUpToDate}
              />
            </View>
          </View>
        );

      case 3: // Cash Book Details - Basic Funds
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>(7) रोकड वहीचा तपशील</Text>
            <Text style={styles.subsectionTitle}>मूलभूत निधी</Text>

            {renderFundRow(
              '1',
              'ग्रामनिधी',
              gramNidhiRegisterBalance, setGramNidhiRegisterBalance,
              gramNidhiBankBalance, setGramNidhiBankBalance,
              gramNidhiPostBalance, setGramNidhiPostBalance,
              gramNidhiHandBalance, setGramNidhiHandBalance,
              gramNidhiCheck, setGramNidhiCheck
            )}

            {renderFundRow(
              '2',
              'पाणी पुरवठा',
              waterSupplyRegisterBalance, setWaterSupplyRegisterBalance,
              waterSupplyBankBalance, setWaterSupplyBankBalance,
              waterSupplyPostBalance, setWaterSupplyPostBalance,
              waterSupplyHandBalance, setWaterSupplyHandBalance,
              waterSupplyCheck, setWaterSupplyCheck
            )}

            <Text style={styles.subsectionTitle}>इतर निधी (3-8)</Text>

            {renderFundRow(
              '3',
              '14 वा वित्त आयोग',
              _14thFinanceRegisterBalance, set14thFinanceRegisterBalance,
              _14thFinanceBankBalance, set14thFinanceBankBalance,
              _14thFinancePostBalance, set14thFinancePostBalance,
              _14thFinanceHandBalance, set14thFinanceHandBalance,
              _14thFinanceCheck, set14thFinanceCheck
            )}

            {renderFundRow(
              '4',
              'इं.गा.यो.',
              engGhaYoRegisterBalance, setEngGhaYoRegisterBalance,
              engGhaYoBankBalance, setEngGhaYoBankBalance,
              engGhaYoPostBalance, setEngGhaYoPostBalance,
              engGhaYoHandBalance, setEngGhaYoHandBalance,
              engGhaYoCheck, setEngGhaYoCheck
            )}

            {renderFundRow(
              '5',
              'अ.जा.विकास',
              scDevelopmentRegisterBalance, setScDevelopmentRegisterBalance,
              scDevelopmentBankBalance, setScDevelopmentBankBalance,
              scDevelopmentPostBalance, setScDevelopmentPostBalance,
              scDevelopmentHandBalance, setScDevelopmentHandBalance,
              scDevelopmentCheck, setScDevelopmentCheck
            )}

            {renderFundRow(
              '6',
              'मजगारोहयो',
              laborDeptRegisterBalance, setLaborDeptRegisterBalance,
              laborDeptBankBalance, setLaborDeptBankBalance,
              laborDeptPostBalance, setLaborDeptPostBalance,
              laborDeptHandBalance, setLaborDeptHandBalance,
              laborDeptCheck, setLaborDeptCheck
            )}

            {renderFundRow(
              '7',
              'ठक्कर बाप्पा',
              thakkarBappaRegisterBalance, setThakkarBappaRegisterBalance,
              thakkarBappaBankBalance, setThakkarBappaBankBalance,
              thakkarBappaPostBalance, setThakkarBappaPostBalance,
              thakkarBappaHandBalance, setThakkarBappaHandBalance,
              thakkarBappaCheck, setThakkarBappaCheck
            )}

            {renderFundRow(
              '8',
              'ग्रामकोष पैसा',
              gramKoshMoneyRegisterBalance, setGramKoshMoneyRegisterBalance,
              gramKoshMoneyBankBalance, setGramKoshMoneyBankBalance,
              gramKoshMoneyPostBalance, setGramKoshMoneyPostBalance,
              gramKoshMoneyHandBalance, setGramKoshMoneyHandBalance,
              gramKoshMoneyCheck, setGramKoshMoneyCheck
            )}
          </ScrollView>
        );

      case 4: // Cash Book Details - More Funds
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>(7) रोकड वहीचा तपशील - सुरुवात</Text>
            <Text style={styles.subsectionTitle}>इतर निधी (9-17)</Text>

            {renderFundRow(
              '9',
              'नागरी सुविधा',
              civicFacilitiesRegisterBalance, setCivicFacilitiesRegisterBalance,
              civicFacilitiesBankBalance, setCivicFacilitiesBankBalance,
              civicFacilitiesPostBalance, setCivicFacilitiesPostBalance,
              civicFacilitiesHandBalance, setCivicFacilitiesHandBalance,
              civicFacilitiesCheck, setCivicFacilitiesCheck
            )}

            {renderFundRow(
              '10',
              'दलित वस्ती विकास',
              dalitBastiRegisterBalance, setDalitBastiRegisterBalance,
              dalitBastiBankBalance, setDalitBastiBankBalance,
              dalitBastiPostBalance, setDalitBastiPostBalance,
              dalitBastiHandBalance, setDalitBastiHandBalance,
              dalitBastiCheck, setDalitBastiCheck
            )}

            {renderFundRow(
              '11',
              'तंटा मुक्त योजना',
              tantaMuktRegisterBalance, setTantaMuktRegisterBalance,
              tantaMuktBankBalance, setTantaMuktBankBalance,
              tantaMuktPostBalance, setTantaMuktPostBalance,
              tantaMuktHandBalance, setTantaMuktHandBalance,
              tantaMuktCheck, setTantaMuktCheck
            )}

            {renderFundRow(
              '12',
              'जनसुविधा',
              janSuvidhaRegisterBalance, setJanSuvidhaRegisterBalance,
              janSuvidhaBankBalance, setJanSuvidhaBankBalance,
              janSuvidhaPostBalance, setJanSuvidhaPostBalance,
              janSuvidhaHandBalance, setJanSuvidhaHandBalance,
              janSuvidhaCheck, setJanSuvidhaCheck
            )}

            {renderFundRow(
              '13',
              'पायका',
              paykaRegisterBalance, setPaykaRegisterBalance,
              paykaBankBalance, setPaykaBankBalance,
              paykaPostBalance, setPaykaPostBalance,
              paykaHandBalance, setPaykaHandBalance,
              paykaCheck, setPaykaCheck
            )}

            {renderFundRow(
              '14',
              'प.सं.योजना',
              panchayatSamitiRegisterBalance, setPanchayatSamitiRegisterBalance,
              panchayatSamitiBankBalance, setPanchayatSamitiBankBalance,
              panchayatSamitiPostBalance, setPanchayatSamitiPostBalance,
              panchayatSamitiHandBalance, setPanchayatSamitiHandBalance,
              panchayatSamitiCheck, setPanchayatSamitiCheck
            )}

            {renderFundRow(
              '15',
              'SBM',
              sbmRegisterBalance, setSbmRegisterBalance,
              sbmBankBalance, setSbmBankBalance,
              sbmPostBalance, setSbmPostBalance,
              sbmHandBalance, setSbmHandBalance,
              sbmCheck, setSbmCheck
            )}

            {renderFundRow(
              '16',
              'तीर्थक्षेत्र विकास निधी',
              tirthakshetraRegisterBalance, setTirthakshetraRegisterBalance,
              tirthakshetraBankBalance, setTirthakshetraBankBalance,
              tirthakshetraPostBalance, setTirthakshetraPostBalance,
              tirthakshetraHandBalance, setTirthakshetraHandBalance,
              tirthakshetraCheck, setTirthakshetraCheck
            )}

            {renderFundRow(
              '17',
              'अल्पसंख्यांक विकास निधी',
              minorityFundRegisterBalance, setMinorityFundRegisterBalance,
              minorityFundBankBalance, setMinorityFundBankBalance,
              minorityFundPostBalance, setMinorityFundPostBalance,
              minorityFundHandBalance, setMinorityFundHandBalance,
              minorityFundCheck, setMinorityFundCheck
            )}
          </ScrollView>
        );

      case 5: // Tax Register
        return (
          <View>
            <Text style={styles.sectionTitle}>(8) कर आकारणी माहिती</Text>

            <Text style={styles.questionText}>कराच्या पावती अद्यावत आहे काय ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={receiptUpToDate}
                onSelect={setReceiptUpToDate}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={receiptUpToDate}
                onSelect={setReceiptUpToDate}
              />
            </View>

            <Text style={styles.questionText}>मागील फेर आकारणी केलेली झाली ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={reassessmentDone}
                onSelect={setReassessmentDone}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={reassessmentDone}
                onSelect={setReassessmentDone}
              />
            </View>

            <Input
              label="ठराव क्रमांक"
              value={resolutionNo}
              onChangeText={setResolutionNo}
              placeholder="ठराव क्रमांक प्रविष्ट करा"
            />

            <DateInput
              label="ठराव तारीख"
              value={resolutionDate}
              onChangeDate={setResolutionDate}
              placeholder="तारीख निवडा"
              maximumDate={new Date()}
            />

            <Text style={styles.questionText}>फेर आकारणी करण्यासाठी कार्यवाही चालू आहे किंवा नाही ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={reassessmentAction}
                onSelect={setReassessmentAction}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={reassessmentAction}
                onSelect={setReassessmentAction}
              />
            </View>
          </View>
        );

      case 6: // Progress of Tax Collection
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>(9) तपासणी तारखेस कर वसुलीची प्रगती</Text>

            <Text style={styles.subsectionTitle}>गृहकर</Text>
            <Input
              label="(1) मागील येणे रक्कम"
              value={previousYearHouseTaxArrears}
              onChangeText={setPreviousYearHouseTaxArrears}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(2) चालू वर्षात मागणी"
              value={currentYearHouseTaxDemand}
              onChangeText={setCurrentYearHouseTaxDemand}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(3) एकुण मागणी"
              value={totalHouseTaxDemand}
              onChangeText={setTotalHouseTaxDemand}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(4) एकुण वसूली"
              value={totalHouseTaxCollection}
              onChangeText={setTotalHouseTaxCollection}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(5) शिल्लक वसूली"
              value={balanceHouseTaxCollection}
              onChangeText={setBalanceHouseTaxCollection}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(6) टक्केवारी"
              value={houseTaxPercentage}
              onChangeText={setHouseTaxPercentage}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.subsectionTitle}>पाणीकर</Text>
            <Input
              label="(1) मागील येणे रक्कम"
              value={previousYearWaterTaxArrears}
              onChangeText={setPreviousYearWaterTaxArrears}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(2) चालू वर्षात मागणी"
              value={currentYearWaterTaxDemand}
              onChangeText={setCurrentYearWaterTaxDemand}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(3) एकुण मागणी"
              value={totalWaterTaxDemand}
              onChangeText={setTotalWaterTaxDemand}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(4) एकुण वसूली"
              value={totalWaterTaxCollection}
              onChangeText={setTotalWaterTaxCollection}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(5) शिल्लक वसूली"
              value={balanceWaterTaxCollection}
              onChangeText={setBalanceWaterTaxCollection}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(6) टक्केवारी"
              value={waterTaxPercentage}
              onChangeText={setWaterTaxPercentage}
              keyboardType="numeric"
              placeholder="0"
            />

            <Input
              label="(7) शेरा / टिप्पणी"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              placeholder="टिप्पणी प्रविष्ट करा"
            />
          </ScrollView>
        );

      case 7: // Detail of Expenditure
        return (
          <View>
            <Text style={styles.sectionTitle}>(10) मागास वर्गीयाकरीता राखून ठेवलेल्या 15% निधीच्या खर्चाचा तपशील</Text>

            <Input
              label="(1) ग्राम पंचायतीचे एकुण उत्पन्न"
              value={gramPanchayatTotalIncome}
              onChangeText={setGramPanchayatTotalIncome}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(2) 15% रक्कम"
              value={fifteenPercentAmount}
              onChangeText={setFifteenPercentAmount}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(3) मागील अनुशेष"
              value={previousBalance}
              onChangeText={setPreviousBalance}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(4) करावयाचा एकुण खर्च"
              value={totalExpense}
              onChangeText={setTotalExpense}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(5) तपासणीत्या दिनांक पर्यंत झालेला खर्च"
              value={expenseTillInspectionDate}
              onChangeText={setExpenseTillInspectionDate}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="(6) शिल्लक खर्च"
              value={balanceExpense}
              onChangeText={setBalanceExpense}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        );

      case 8: // Financial Transactions
        return (
          <View>
            <Text style={styles.sectionTitle}>(11) आर्थिक व्यवहारात निर्देशानुसार आलेल्या नियमबाह्यता</Text>

            <Text style={styles.questionText}>(क) कोणत्याही चालू खरेदी करणाऱ्यापूर्वी अंदाजपत्रकात योग्य तरतूद केली आहे काय ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={budgetProvision}
                onSelect={setBudgetProvision}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={budgetProvision}
                onSelect={setBudgetProvision}
              />
            </View>

            <Text style={styles.questionText}>(ख) ग्राम पंचायत खरेदीसाठी मान्यता दिली आहे काय ?</Text>
            <Input
              label="ठराव क्र."
              value={gpApprovalResolutionNo}
              onChangeText={setGpApprovalResolutionNo}
              placeholder="ठराव क्रमांक प्रविष्ट करा"
            />

            <DateInput
              label="दि."
              value={gpApprovalDate}
              onChangeDate={setGpApprovalDate}
              placeholder="तारीख निवडा"
              // maximumDate={new Date()}
            />

            <Text style={styles.questionText}>(ग) खरेदी करण्यासाठी नियमप्रमाणे दरपत्रके मागविली होती काय ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={tendersCalled}
                onSelect={setTendersCalled}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={tendersCalled}
                onSelect={setTendersCalled}
              />
            </View>

            <Text style={styles.questionText}>(घ) खरेदी केलेल्या साहित्याचा नमुना 9,15 व 16 मधील नोंदवहीत नोंदी घेण्यात आल्या आहेत काय ?</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="होय"
                value="होय"
                selectedValue={entriesMade}
                onSelect={setEntriesMade}
              />
              <RadioButton
                label="नाही"
                value="नाही"
                selectedValue={entriesMade}
                onSelect={setEntriesMade}
              />
            </View>
          </View>
        );

      case 9: // GP Works
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>(12) ग्राम पंचायताने स्वतःच्या निधीतून किंवा शासकीय/जिल्हा परिषद योजनेंतर्गत हात घेतलेल्या कामांचा तपशील</Text>

            <View style={styles.tableRow}>
              <Input
                label="अ.क्र."
                value={gpWorkSerialNo}
                onChangeText={setGpWorkSerialNo}
                placeholder="अनुक्रमांक"
                keyboardType="numeric"
              />

              <Input
                label="योजनेचे नांव"
                value={gpWorkSchemeName}
                onChangeText={setGpWorkSchemeName}
                placeholder="योजनेचे नांव प्रविष्ट करा"
              />

              <Input
                label="कामाचा प्रकार"
                value={gpWorkType}
                onChangeText={setGpWorkType}
                placeholder="कामाचा प्रकार प्रविष्ट करा"
              />

              <Input
                label="अंदाजित रक्कम"
                value={gpWorkEstimatedAmount}
                onChangeText={setGpWorkEstimatedAmount}
                keyboardType="numeric"
                placeholder="0"
              />

              <Input
                label="मिळालेले अनुदान"
                value={gpWorkGrantReceived}
                onChangeText={setGpWorkGrantReceived}
                keyboardType="numeric"
                placeholder="0"
              />

              <Input
                label="झालेला खर्च"
                value={gpWorkExpenditure}
                onChangeText={setGpWorkExpenditure}
                keyboardType="numeric"
                placeholder="0"
              />

              <DateInput
                label="काम सुरु झाल्याची तारीख"
                value={gpWorkStartDate}
                onChangeDate={setGpWorkStartDate}
                placeholder="तारीख निवडा"
                // maximumDate={new Date()}
              />

              <DateInput
                label="काम पूर्ण झाल्याची तारीख"
                value={gpWorkCompletionDate}
                onChangeDate={setGpWorkCompletionDate}
                placeholder="तारीख निवडा"
              />

              <Input
                label="प्रगतीवर असलेल्या कामाची सद्य:स्थिती"
                value={gpWorkCurrentStatus}
                onChangeText={setGpWorkCurrentStatus}
                multiline
                numberOfLines={3}
                placeholder="सद्य:स्थिती प्रविष्ट करा"
              />

              <Text style={styles.questionText}>पूर्णत्वाचे प्रमाणपत्र प्राप्त केले किंवा नाही</Text>
              <View style={styles.radioGroup}>
                <RadioButton
                  label="होय"
                  value="होय"
                  selectedValue={gpWorkCertificateReceived}
                  onSelect={setGpWorkCertificateReceived}
                />
                <RadioButton
                  label="नाही"
                  value="नाही"
                  selectedValue={gpWorkCertificateReceived}
                  onSelect={setGpWorkCertificateReceived}
                />
              </View>

              <Input
                label="शेरा"
                value={gpWorkRemarks}
                onChangeText={setGpWorkRemarks}
                multiline
                numberOfLines={3}
                placeholder="शेरा प्रविष्ट करा"
              />
            </View>
          </ScrollView>
        );

      case 10: // Other Schemes
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>(13) ग्राम पंचायतांनी इतर योजनामध्ये केलेली प्रगती</Text>

            {otherSchemes.map((scheme, index) => (
              <View key={index}>
                <Text style={styles.questionNumber}>अ.क्र. {index + 1}</Text>

                <Input
                  label="योजनेचे नाव"
                  value={scheme.schemeName}
                  onChangeText={(value) => updateOtherScheme(index, 'schemeName', value)}
                  placeholder="योजनेचे नाव प्रविष्ट करा"
                  editable={index >= 5}
                />

                <Input
                  label="दिलेली उद्दिष्टे"
                  value={scheme.targetsGiven}
                  onChangeText={(value) => updateOtherScheme(index, 'targetsGiven', value)}
                  placeholder="उद्दिष्टे प्रविष्ट करा"
                />

                <Input
                  label="तपासणीच्या दिनांकास प्रगती"
                  value={scheme.progressOnDate}
                  onChangeText={(value) => updateOtherScheme(index, 'progressOnDate', value)}
                  placeholder="प्रगती प्रविष्ट करा"
                />

                <Input
                  label="शेरा"
                  value={scheme.remarks}
                  onChangeText={(value) => updateOtherScheme(index, 'remarks', value)}
                  placeholder="शेरा प्रविष्ट करा"
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}

            <Text style={styles.helperText}>
              नोंद: एगाविका, बॉयोगॅस, निर्धूर चुल, कुटुंब कल्याण, अल्पवचत इ. योजनांचा तपशील द्यावा.
            </Text>
          </ScrollView>
        );

      case 11: // 14th Finance Commission
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>(14) 14 वा वित्त आयोगामधून हाती घेतलेली कामे व त्याची प्रगती</Text>

            {financeCommissionWorks.map((work, index) => (
              <View key={index}>
                <Text style={styles.questionNumber}>अ.क्र. {index + 1}</Text>

                <Input
                  label="योजनेचे नाव"
                  value={work.schemeName}
                  onChangeText={(value) => updateFinanceCommissionWork(index, 'schemeName', value)}
                  placeholder="योजनेचे नाव प्रविष्ट करा"
                  editable={false}
                />

                <Input
                  label="कामाचा प्रकार"
                  value={work.workType}
                  onChangeText={(value) => updateFinanceCommissionWork(index, 'workType', value)}
                  placeholder="कामाचा प्रकार प्रविष्ट करा"
                />

                <Input
                  label="अंदाजित रक्कम"
                  value={work.estimatedAmount}
                  onChangeText={(value) => updateFinanceCommissionWork(index, 'estimatedAmount', value)}
                  placeholder="अंदाजित रक्कम प्रविष्ट करा"
                  keyboardType="numeric"
                />

                <Input
                  label="मिळालेले अनुदान"
                  value={work.grantReceived}
                  onChangeText={(value) => updateFinanceCommissionWork(index, 'grantReceived', value)}
                  placeholder="मिळालेले अनुदान प्रविष्ट करा"
                  keyboardType="numeric"
                />

                <Input
                  label="झालेला खर्च"
                  value={work.remarks}
                  onChangeText={(value) => updateFinanceCommissionWork(index, 'remarks', value)}
                  placeholder="झालेला खर्च प्रविष्ट करा"
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}

            <Text style={styles.helperText}>
              नोंद: एल.ई.डी.लाईट खरेदी, कचरा कुंडी, फर्निचर, टि.व्हि.संच खरेदी, आपले सरकार सेवा केंद्र खर्च, वाटर मिटर, सीसीरोड, फॉगिंग मशीन, ग्रांपभवन, कंप्युटर इ. कामांचा तपशील द्यावा.
            </Text>
          </ScrollView>
        );

      case 12: // Officer's Opinion
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>तपासणी अधिकार्‍याचा अभिप्राय</Text>

            <Input
              label="1. नमुना - - - - - अपूर्ण आहेत"
              value={officerOpinion1}
              onChangeText={setOfficerOpinion1}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="2."
              value={officerOpinion2}
              onChangeText={setOfficerOpinion2}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="3."
              value={officerOpinion3}
              onChangeText={setOfficerOpinion3}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="4."
              value={officerOpinion4}
              onChangeText={setOfficerOpinion4}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="5."
              value={officerOpinion5}
              onChangeText={setOfficerOpinion5}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="6."
              value={officerOpinion6}
              onChangeText={setOfficerOpinion6}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="7."
              value={officerOpinion7}
              onChangeText={setOfficerOpinion7}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
            <Input
              label="8."
              value={officerOpinion8}
              onChangeText={setOfficerOpinion8}
              placeholder="अभिप्राय प्रविष्ट करा"
            />
          </ScrollView>
        );

      case 13: // Photos
        return (
          <View>
            <Text style={styles.sectionTitle}>फोटो अपलोड</Text>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
          </View>
        );

      case 14: // Copy Section
        return (
          <View>
            <Text style={styles.sectionTitle}>प्रतिलिपी</Text>
            <View style={styles.copySection}>
              <Text style={styles.copyText}>1) मा.मुख्य कार्यकारी अधिकारी जिल्हा परिषद, चंद्रपूर यांना माहितीस सविनय सादर.</Text>
              <Text style={styles.copyText}>2) गट विकास अधिकारी, पंचायत समिती यांना माहितीस सादर.</Text>
              <Text style={styles.copyText}>3) सचिव ग्रामपंचायत यांना माहितीस व उचित कार्यवाहीस अवगत.</Text>
            </View>
            <Text style={styles.infoText}>
              वरील तपशील योग्य आहे याची खात्री करून सबमिट करा.
            </Text>
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
          <View>
            {currentStep > 0 && (
              <Button
                title={t('common.previous')}
                onPress={handlePrevious}
                variant="outline"
                disabled={loading}
              />
            )}
            <View style={styles.submitButtons}>
              <Button
                title="मसुदा सेव्ह करा"
                onPress={handleSaveAsDraft}
                variant="outline"
                loading={loading}
              />
              <Button
                title="तपासणी सबमिट करा"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          </View>
        )}
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    paddingLeft: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#2563eb',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  tableRow: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  copySection: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  copyText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 8,
    lineHeight: 18,
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
    gap: 8,
  },
  button: {
    flex: 1,
  },
  submitButtons: {
    gap: 12,
    marginTop: 12,
  },
});
