import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, LocationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createInspection, uploadPhoto, saveGrampanchayatInspectionForm } from '../../services/fimsService';
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
  const [photoMetas, setPhotoMetas] = useState<Array<{ latitude?: number; longitude?: number; accuracy?: number }>>([]);
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
  const [srNoGramNidhi, setSrNoGramNidhi] = useState('');
  const [gramNidhiRegisterBalance, setGramNidhiRegisterBalance] = useState('');
  const [gramNidhiBankBalance, setGramNidhiBankBalance] = useState('');
  const [gramNidhiPostBalance, setGramNidhiPostBalance] = useState('');
  const [gramNidhiHandBalance, setGramNidhiHandBalance] = useState('');
  const [gramNidhiCheck, setGramNidhiCheck] = useState('');

  const [srNoWaterSupply, setSrNoWaterSupply] = useState('');
  const [waterSupplyRegisterBalance, setWaterSupplyRegisterBalance] = useState('');
  const [waterSupplyBankBalance, setWaterSupplyBankBalance] = useState('');
  const [waterSupplyPostBalance, setWaterSupplyPostBalance] = useState('');
  const [waterSupplyHandBalance, setWaterSupplyHandBalance] = useState('');
  const [waterSupplyCheck, setWaterSupplyCheck] = useState('');

  // Second table: 17 Funds
  const [srNo14thFinance, setSrNo14thFinance] = useState('');
  const [_14thFinanceRegisterBalance, set14thFinanceRegisterBalance] = useState('');
  const [_14thFinanceBankBalance, set14thFinanceBankBalance] = useState('');
  const [_14thFinancePostBalance, set14thFinancePostBalance] = useState('');
  const [_14thFinanceHandBalance, set14thFinanceHandBalance] = useState('');
  const [_14thFinanceCheck, set14thFinanceCheck] = useState('');

  const [srNoEngGhaYo, setSrNoEngGhaYo] = useState('');
  const [engGhaYoRegisterBalance, setEngGhaYoRegisterBalance] = useState('');
  const [engGhaYoBankBalance, setEngGhaYoBankBalance] = useState('');
  const [engGhaYoPostBalance, setEngGhaYoPostBalance] = useState('');
  const [engGhaYoHandBalance, setEngGhaYoHandBalance] = useState('');
  const [engGhaYoCheck, setEngGhaYoCheck] = useState('');

  const [srNoScDevelopment, setSrNoScDevelopment] = useState('');
  const [scDevelopmentRegisterBalance, setScDevelopmentRegisterBalance] = useState('');
  const [scDevelopmentBankBalance, setScDevelopmentBankBalance] = useState('');
  const [scDevelopmentPostBalance, setScDevelopmentPostBalance] = useState('');
  const [scDevelopmentHandBalance, setScDevelopmentHandBalance] = useState('');
  const [scDevelopmentCheck, setScDevelopmentCheck] = useState('');

  const [srNoLaborDepartment, setSrNoLaborDepartment] = useState('');
  const [laborDeptRegisterBalance, setLaborDeptRegisterBalance] = useState('');
  const [laborDeptBankBalance, setLaborDeptBankBalance] = useState('');
  const [laborDeptPostBalance, setLaborDeptPostBalance] = useState('');
  const [laborDeptHandBalance, setLaborDeptHandBalance] = useState('');
  const [laborDeptCheck, setLaborDeptCheck] = useState('');

  const [srNoThakkarBappa, setSrNoThakkarBappa] = useState('');
  const [thakkarBappaRegisterBalance, setThakkarBappaRegisterBalance] = useState('');
  const [thakkarBappaBankBalance, setThakkarBappaBankBalance] = useState('');
  const [thakkarBappaPostBalance, setThakkarBappaPostBalance] = useState('');
  const [thakkarBappaHandBalance, setThakkarBappaHandBalance] = useState('');
  const [thakkarBappaCheck, setThakkarBappaCheck] = useState('');

  const [srNoGramKoshMoney, setSrNoGramKoshMoney] = useState('');
  const [gramKoshMoneyRegisterBalance, setGramKoshMoneyRegisterBalance] = useState('');
  const [gramKoshMoneyBankBalance, setGramKoshMoneyBankBalance] = useState('');
  const [gramKoshMoneyPostBalance, setGramKoshMoneyPostBalance] = useState('');
  const [gramKoshMoneyHandBalance, setGramKoshMoneyHandBalance] = useState('');
  const [gramKoshMoneyCheck, setGramKoshMoneyCheck] = useState('');

  const [srNoCivicFacilities, setSrNoCivicFacilities] = useState('');
  const [civicFacilitiesRegisterBalance, setCivicFacilitiesRegisterBalance] = useState('');
  const [civicFacilitiesBankBalance, setCivicFacilitiesBankBalance] = useState('');
  const [civicFacilitiesPostBalance, setCivicFacilitiesPostBalance] = useState('');
  const [civicFacilitiesHandBalance, setCivicFacilitiesHandBalance] = useState('');
  const [civicFacilitiesCheck, setCivicFacilitiesCheck] = useState('');

  const [srNoDalitBastiDevelopment, setSrNoDalitBastiDevelopment] = useState('');
  const [dalitBastiRegisterBalance, setDalitBastiRegisterBalance] = useState('');
  const [dalitBastiBankBalance, setDalitBastiBankBalance] = useState('');
  const [dalitBastiPostBalance, setDalitBastiPostBalance] = useState('');
  const [dalitBastiHandBalance, setDalitBastiHandBalance] = useState('');
  const [dalitBastiCheck, setDalitBastiCheck] = useState('');

  const [srNoTantaMuktYojana, setSrNoTantaMuktYojana] = useState('');
  const [tantaMuktRegisterBalance, setTantaMuktRegisterBalance] = useState('');
  const [tantaMuktBankBalance, setTantaMuktBankBalance] = useState('');
  const [tantaMuktPostBalance, setTantaMuktPostBalance] = useState('');
  const [tantaMuktHandBalance, setTantaMuktHandBalance] = useState('');
  const [tantaMuktCheck, setTantaMuktCheck] = useState('');

  const [srNoJanSuvidha, setSrNoJanSuvidha] = useState('');
  const [janSuvidhaRegisterBalance, setJanSuvidhaRegisterBalance] = useState('');
  const [janSuvidhaBankBalance, setJanSuvidhaBankBalance] = useState('');
  const [janSuvidhaPostBalance, setJanSuvidhaPostBalance] = useState('');
  const [janSuvidhaHandBalance, setJanSuvidhaHandBalance] = useState('');
  const [janSuvidhaCheck, setJanSuvidhaCheck] = useState('');

  const [srNoPayka, setSrNoPayka] = useState('');
  const [paykaRegisterBalance, setPaykaRegisterBalance] = useState('');
  const [paykaBankBalance, setPaykaBankBalance] = useState('');
  const [paykaPostBalance, setPaykaPostBalance] = useState('');
  const [paykaHandBalance, setPaykaHandBalance] = useState('');
  const [paykaCheck, setPaykaCheck] = useState('');

  const [srNoPanchayatSamitiYojana, setSrNoPanchayatSamitiYojana] = useState('');
  const [panchayatSamitiRegisterBalance, setPanchayatSamitiRegisterBalance] = useState('');
  const [panchayatSamitiBankBalance, setPanchayatSamitiBankBalance] = useState('');
  const [panchayatSamitiPostBalance, setPanchayatSamitiPostBalance] = useState('');
  const [panchayatSamitiHandBalance, setPanchayatSamitiHandBalance] = useState('');
  const [panchayatSamitiCheck, setPanchayatSamitiCheck] = useState('');

  const [srNoSbm, setSrNoSbm] = useState('');
  const [sbmRegisterBalance, setSbmRegisterBalance] = useState('');
  const [sbmBankBalance, setSbmBankBalance] = useState('');
  const [sbmPostBalance, setSbmPostBalance] = useState('');
  const [sbmHandBalance, setSbmHandBalance] = useState('');
  const [sbmCheck, setSbmCheck] = useState('');

  const [srNoTirthakshetraDevelopmentFund, setSrNoTirthakshetraDevelopmentFund] = useState('');
  const [tirthakshetraRegisterBalance, setTirthakshetraRegisterBalance] = useState('');
  const [tirthakshetraBankBalance, setTirthakshetraBankBalance] = useState('');
  const [tirthakshetraPostBalance, setTirthakshetraPostBalance] = useState('');
  const [tirthakshetraHandBalance, setTirthakshetraHandBalance] = useState('');
  const [tirthakshetraCheck, setTirthakshetraCheck] = useState('');

  const [srNoMinorityDevelopmentFund, setSrNoMinorityDevelopmentFund] = useState('');
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

  // Section 14: Forms tracking
  const [form1, setForm1] = useState('');
  const [form2, setForm2] = useState('');
  const [form3, setForm3] = useState('');
  const [form4, setForm4] = useState('');
  const [form5, setForm5] = useState('');
  const [form6, setForm6] = useState('');
  const [form7, setForm7] = useState('');
  const [form8, setForm8] = useState('');

  // Copy fields
  const [copy1, setCopy1] = useState('');
  const [copy2, setCopy2] = useState('');
  const [copy3, setCopy3] = useState('');
  const [copyToCeo, setCopyToCeo] = useState('');
  const [copyToBdo, setCopyToBdo] = useState('');
  const [copyToSecretary, setCopyToSecretary] = useState('');

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

      // Save grampanchayat inspection form data
      const formData = {
        gram_panchayat_name: gpName,
        panchayat_samiti: psName,
        general_inspection_date: inspectionDate || null,
        general_inspection_place: inspectionPlace,
        inspection_officer_name: officerName,
        inspection_officer_post: officerPost,
        secretary_name: secretaryName,
        secretary_tenure: secretaryTenure,
        monthly_meetings: monthlyMeetings,
        meeting_agenda_up_to_date: agendaUpToDate,
        receipt_up_to_date: receiptUpToDate,
        reassessment_done: reassessmentDone,
        reassessment_action: reassessmentAction,
        resolution_no: resolutionNo,
        resolution_date: resolutionDate || null,
        previous_year_house_tax_arrears: previousYearHouseTaxArrears ? parseFloat(previousYearHouseTaxArrears) : null,
        previous_year_water_tax_arrears: previousYearWaterTaxArrears ? parseFloat(previousYearWaterTaxArrears) : null,
        current_year_house_tax_demand: currentYearHouseTaxDemand ? parseFloat(currentYearHouseTaxDemand) : null,
        current_year_water_tax_demand: currentYearWaterTaxDemand ? parseFloat(currentYearWaterTaxDemand) : null,
        total_house_tax_demand: totalHouseTaxDemand ? parseFloat(totalHouseTaxDemand) : null,
        total_water_tax_demand: totalWaterTaxDemand ? parseFloat(totalWaterTaxDemand) : null,
        total_house_tax_collection: totalHouseTaxCollection ? parseFloat(totalHouseTaxCollection) : null,
        total_water_tax_collection: totalWaterTaxCollection ? parseFloat(totalWaterTaxCollection) : null,
        balance_house_tax_collection: balanceHouseTaxCollection ? parseFloat(balanceHouseTaxCollection) : null,
        balance_water_tax_collection: balanceWaterTaxCollection ? parseFloat(balanceWaterTaxCollection) : null,
        house_tax_percentage: houseTaxPercentage ? parseFloat(houseTaxPercentage) : null,
        water_tax_percentage: waterTaxPercentage ? parseFloat(waterTaxPercentage) : null,
        remarks: remarks,
        gram_panchayat_total_income: gramPanchayatTotalIncome ? parseFloat(gramPanchayatTotalIncome) : null,
        fifteen_percent_amount: fifteenPercentAmount ? parseFloat(fifteenPercentAmount) : null,
        previous_balance: previousBalance ? parseFloat(previousBalance) : null,
        total_expense: totalExpense ? parseFloat(totalExpense) : null,
        expense_till_inspection_date: expenseTillInspectionDate ? parseFloat(expenseTillInspectionDate) : null,
        balance_expense: balanceExpense ? parseFloat(balanceExpense) : null,
        budget_provision: budgetProvision,
        tenders_called: tendersCalled,
        entries_made: entriesMade,
        sr_no_gram_nidhi: srNoGramNidhi,
        gram_nidhi_register_balance: gramNidhiRegisterBalance,
        gram_nidhi_bank_balance: gramNidhiBankBalance,
        gram_nidhi_post_balance: gramNidhiPostBalance,
        gram_nidhi_hand_balance: gramNidhiHandBalance,
        gram_nidhi_check: gramNidhiCheck,
        sr_no_water_supply: srNoWaterSupply,
        water_supply_register_balance: waterSupplyRegisterBalance,
        water_supply_bank_balance: waterSupplyBankBalance,
        water_supply_post_balance: waterSupplyPostBalance,
        water_supply_hand_balance: waterSupplyHandBalance,
        water_supply_check: waterSupplyCheck,
        sr_no_14th_finance_commission: srNo14thFinance,
        _14th_finance_commission_register_balance: _14thFinanceRegisterBalance,
        _14th_finance_commission_bank_balance: _14thFinanceBankBalance,
        _14th_finance_commission_post_balance: _14thFinancePostBalance,
        _14th_finance_commission_hand_balance: _14thFinanceHandBalance,
        _14th_finance_commission_check: _14thFinanceCheck,
        sr_no_eng_gha_yo: srNoEngGhaYo,
        eng_gha_yo_register_balance: engGhaYoRegisterBalance,
        eng_gha_yo_bank_balance: engGhaYoBankBalance,
        eng_gha_yo_post_balance: engGhaYoPostBalance,
        eng_gha_yo_hand_balance: engGhaYoHandBalance,
        eng_gha_yo_check: engGhaYoCheck,
        sr_no_sc_development: srNoScDevelopment,
        sc_development_register_balance: scDevelopmentRegisterBalance,
        sc_development_bank_balance: scDevelopmentBankBalance,
        sc_development_post_balance: scDevelopmentPostBalance,
        sc_development_hand_balance: scDevelopmentHandBalance,
        sc_development_check: scDevelopmentCheck,
        sr_no_labor_department: srNoLaborDepartment,
        labor_department_register_balance: laborDeptRegisterBalance,
        labor_department_bank_balance: laborDeptBankBalance,
        labor_department_post_balance: laborDeptPostBalance,
        labor_department_hand_balance: laborDeptHandBalance,
        labor_department_check: laborDeptCheck,
        sr_no_thakkar_bappa: srNoThakkarBappa,
        thakkar_bappa_register_balance: thakkarBappaRegisterBalance,
        thakkar_bappa_bank_balance: thakkarBappaBankBalance,
        thakkar_bappa_post_balance: thakkarBappaPostBalance,
        thakkar_bappa_hand_balance: thakkarBappaHandBalance,
        thakkar_bappa_check: thakkarBappaCheck,
        sr_no_gram_kosh_money: srNoGramKoshMoney,
        gram_kosh_money_register_balance: gramKoshMoneyRegisterBalance,
        gram_kosh_money_bank_balance: gramKoshMoneyBankBalance,
        gram_kosh_money_post_balance: gramKoshMoneyPostBalance,
        gram_kosh_money_hand_balance: gramKoshMoneyHandBalance,
        gram_kosh_money_check: gramKoshMoneyCheck,
        sr_no_civic_facilities: srNoCivicFacilities,
        civic_facilities_register_balance: civicFacilitiesRegisterBalance,
        civic_facilities_bank_balance: civicFacilitiesBankBalance,
        civic_facilities_post_balance: civicFacilitiesPostBalance,
        civic_facilities_hand_balance: civicFacilitiesHandBalance,
        civic_facilities_check: civicFacilitiesCheck,
        sr_no_dalit_basti_development: srNoDalitBastiDevelopment,
        dalit_basti_development_register_balance: dalitBastiRegisterBalance,
        dalit_basti_development_bank_balance: dalitBastiBankBalance,
        dalit_basti_development_post_balance: dalitBastiPostBalance,
        dalit_basti_development_hand_balance: dalitBastiHandBalance,
        dalit_basti_development_check: dalitBastiCheck,
        sr_no_tanta_mukt_yojana: srNoTantaMuktYojana,
        tanta_mukt_yojana_register_balance: tantaMuktRegisterBalance,
        tanta_mukt_yojana_bank_balance: tantaMuktBankBalance,
        tanta_mukt_yojana_post_balance: tantaMuktPostBalance,
        tanta_mukt_yojana_hand_balance: tantaMuktHandBalance,
        tanta_mukt_yojana_check: tantaMuktCheck,
        sr_no_jan_suvidha: srNoJanSuvidha,
        jan_suvidha_register_balance: janSuvidhaRegisterBalance,
        jan_suvidha_bank_balance: janSuvidhaBankBalance,
        jan_suvidha_post_balance: janSuvidhaPostBalance,
        jan_suvidha_hand_balance: janSuvidhaHandBalance,
        jan_suvidha_check: janSuvidhaCheck,
        sr_no_payka: srNoPayka,
        payka_register_balance: paykaRegisterBalance,
        payka_bank_balance: paykaBankBalance,
        payka_post_balance: paykaPostBalance,
        payka_hand_balance: paykaHandBalance,
        payka_check: paykaCheck,
        sr_no_panchayat_samiti_yojana: srNoPanchayatSamitiYojana,
        panchayat_samiti_yojana_register_balance: panchayatSamitiRegisterBalance,
        panchayat_samiti_yojana_bank_balance: panchayatSamitiBankBalance,
        panchayat_samiti_yojana_post_balance: panchayatSamitiPostBalance,
        panchayat_samiti_yojana_hand_balance: panchayatSamitiHandBalance,
        panchayat_samiti_yojana_check: panchayatSamitiCheck,
        sr_no_sbm: srNoSbm,
        sbm_register_balance: sbmRegisterBalance,
        sbm_bank_balance: sbmBankBalance,
        sbm_post_balance: sbmPostBalance,
        sbm_hand_balance: sbmHandBalance,
        sbm_check: sbmCheck,
        sr_no_tirthakshetra_development_fund: srNoTirthakshetraDevelopmentFund,
        tirthakshetra_development_fund_register_balance: tirthakshetraRegisterBalance,
        tirthakshetra_development_fund_bank_balance: tirthakshetraBankBalance,
        tirthakshetra_development_fund_post_balance: tirthakshetraPostBalance,
        tirthakshetra_development_fund_hand_balance: tirthakshetraHandBalance,
        tirthakshetra_development_fund_check: tirthakshetraCheck,
        sr_no_minority_development_fund: srNoMinorityDevelopmentFund,
        minority_development_fund_register_balance: minorityFundRegisterBalance,
        minority_development_fund_bank_balance: minorityFundBankBalance,
        minority_development_fund_post_balance: minorityFundPostBalance,
        minority_development_fund_hand_balance: minorityFundHandBalance,
        minority_development_fund_check: minorityFundCheck,
        sr_no_egavika: otherSchemes[0]?.schemeName || null,
        egavika_objectives: otherSchemes[0]?.targetsGiven || null,
        egavika_status: otherSchemes[0]?.progressOnDate || null,
        egavika_remarks: otherSchemes[0]?.remarks || null,
        sr_no_biogas: otherSchemes[1]?.schemeName || null,
        biogas_objectives: otherSchemes[1]?.targetsGiven || null,
        biogas_status: otherSchemes[1]?.progressOnDate || null,
        biogas_remarks: otherSchemes[1]?.remarks || null,
        sr_no_smokeless_chul: otherSchemes[2]?.schemeName || null,
        smokeless_chul_objectives: otherSchemes[2]?.targetsGiven || null,
        smokeless_chul_status: otherSchemes[2]?.progressOnDate || null,
        smokeless_chul_remarks: otherSchemes[2]?.remarks || null,
        sr_no_family_welfare: otherSchemes[3]?.schemeName || null,
        family_welfare_objectives: otherSchemes[3]?.targetsGiven || null,
        family_welfare_status: otherSchemes[3]?.progressOnDate || null,
        family_welfare_remarks: otherSchemes[3]?.remarks || null,
        sr_no_alpavachnat: otherSchemes[4]?.schemeName || null,
        alpavachnat_objectives: otherSchemes[4]?.targetsGiven || null,
        alpavachnat_status: otherSchemes[4]?.progressOnDate || null,
        alpavachnat_remarks: otherSchemes[4]?.remarks || null,
        sr_no_6: otherSchemes[5]?.schemeName || null,
        sr_no_6_objectives: otherSchemes[5]?.targetsGiven || null,
        sr_no_6_status: otherSchemes[5]?.progressOnDate || null,
        sr_no_6_remarks: otherSchemes[5]?.remarks || null,
        sr_no_7: otherSchemes[6]?.schemeName || null,
        sr_no_7_objectives: otherSchemes[6]?.targetsGiven || null,
        sr_no_7_status: otherSchemes[6]?.progressOnDate || null,
        sr_no_7_remarks: otherSchemes[6]?.remarks || null,
        sr_no_14_finance_scheme_1: financeCommissionWorks[0]?.schemeName || null,
        _14_finance_scheme_1_type: financeCommissionWorks[0]?.workType || null,
        _14_finance_scheme_1_estimate_amount: financeCommissionWorks[0]?.estimatedAmount ? parseFloat(financeCommissionWorks[0].estimatedAmount) : null,
        _14_finance_scheme_1_grant_received: financeCommissionWorks[0]?.grantReceived ? parseFloat(financeCommissionWorks[0].grantReceived) : null,
        _14_finance_scheme_1_expense: null,
        sr_no_14_finance_scheme_2: financeCommissionWorks[1]?.schemeName || null,
        _14_finance_scheme_2_type: financeCommissionWorks[1]?.workType || null,
        _14_finance_scheme_2_estimate_amount: financeCommissionWorks[1]?.estimatedAmount ? parseFloat(financeCommissionWorks[1].estimatedAmount) : null,
        _14_finance_scheme_2_grant_received: financeCommissionWorks[1]?.grantReceived ? parseFloat(financeCommissionWorks[1].grantReceived) : null,
        _14_finance_scheme_2_expense: null,
        sr_no_14_finance_scheme_3: financeCommissionWorks[2]?.schemeName || null,
        _14_finance_scheme_3_type: financeCommissionWorks[2]?.workType || null,
        _14_finance_scheme_3_estimate_amount: financeCommissionWorks[2]?.estimatedAmount ? parseFloat(financeCommissionWorks[2].estimatedAmount) : null,
        _14_finance_scheme_3_grant_received: financeCommissionWorks[2]?.grantReceived ? parseFloat(financeCommissionWorks[2].grantReceived) : null,
        _14_finance_scheme_3_expense: null,
        sr_no_14_finance_scheme_4: financeCommissionWorks[3]?.schemeName || null,
        _14_finance_scheme_4_type: financeCommissionWorks[3]?.workType || null,
        _14_finance_scheme_4_estimate_amount: financeCommissionWorks[3]?.estimatedAmount ? parseFloat(financeCommissionWorks[3].estimatedAmount) : null,
        _14_finance_scheme_4_grant_received: financeCommissionWorks[3]?.grantReceived ? parseFloat(financeCommissionWorks[3].grantReceived) : null,
        _14_finance_scheme_4_expense: null,
        sr_no_14_finance_scheme_5: financeCommissionWorks[4]?.schemeName || null,
        _14_finance_scheme_5_type: financeCommissionWorks[4]?.workType || null,
        _14_finance_scheme_5_estimate_amount: financeCommissionWorks[4]?.estimatedAmount ? parseFloat(financeCommissionWorks[4].estimatedAmount) : null,
        _14_finance_scheme_5_grant_received: financeCommissionWorks[4]?.grantReceived ? parseFloat(financeCommissionWorks[4].grantReceived) : null,
        _14_finance_scheme_5_expense: null,
        sr_no_14_finance_scheme_6: financeCommissionWorks[5]?.schemeName || null,
        _14_finance_scheme_6_type: financeCommissionWorks[5]?.workType || null,
        _14_finance_scheme_6_estimate_amount: financeCommissionWorks[5]?.estimatedAmount ? parseFloat(financeCommissionWorks[5].estimatedAmount) : null,
        _14_finance_scheme_6_grant_received: financeCommissionWorks[5]?.grantReceived ? parseFloat(financeCommissionWorks[5].grantReceived) : null,
        _14_finance_scheme_6_expense: null,
        sr_no_14_finance_scheme_7: financeCommissionWorks[6]?.schemeName || null,
        _14_finance_scheme_7_type: financeCommissionWorks[6]?.workType || null,
        _14_finance_scheme_7_estimate_amount: financeCommissionWorks[6]?.estimatedAmount ? parseFloat(financeCommissionWorks[6].estimatedAmount) : null,
        _14_finance_scheme_7_grant_received: financeCommissionWorks[6]?.grantReceived ? parseFloat(financeCommissionWorks[6].grantReceived) : null,
        _14_finance_scheme_7_expense: null,
        sr_no_14_finance_scheme_8: financeCommissionWorks[7]?.schemeName || null,
        _14_finance_scheme_8_type: financeCommissionWorks[7]?.workType || null,
        _14_finance_scheme_8_estimate_amount: financeCommissionWorks[7]?.estimatedAmount ? parseFloat(financeCommissionWorks[7].estimatedAmount) : null,
        _14_finance_scheme_8_grant_received: financeCommissionWorks[7]?.grantReceived ? parseFloat(financeCommissionWorks[7].grantReceived) : null,
        _14_finance_scheme_8_expense: null,
        sr_no_14_finance_scheme_9: financeCommissionWorks[8]?.schemeName || null,
        _14_finance_scheme_9_type: financeCommissionWorks[8]?.workType || null,
        _14_finance_scheme_9_estimate_amount: financeCommissionWorks[8]?.estimatedAmount ? parseFloat(financeCommissionWorks[8].estimatedAmount) : null,
        _14_finance_scheme_9_grant_received: financeCommissionWorks[8]?.grantReceived ? parseFloat(financeCommissionWorks[8].grantReceived) : null,
        _14_finance_scheme_9_expense: null,
        sr_no_14_finance_scheme_10: financeCommissionWorks[9]?.schemeName || null,
        _14_finance_scheme_10_type: financeCommissionWorks[9]?.workType || null,
        _14_finance_scheme_10_estimate_amount: financeCommissionWorks[9]?.estimatedAmount ? parseFloat(financeCommissionWorks[9].estimatedAmount) : null,
        _14_finance_scheme_10_grant_received: financeCommissionWorks[9]?.grantReceived ? parseFloat(financeCommissionWorks[9].grantReceived) : null,
        _14_finance_scheme_10_expense: null,
        sr_no_14_finance_scheme_11: financeCommissionWorks[10]?.schemeName || null,
        _14_finance_scheme_11_type: financeCommissionWorks[10]?.workType || null,
        _14_finance_scheme_11_estimate_amount: financeCommissionWorks[10]?.estimatedAmount ? parseFloat(financeCommissionWorks[10].estimatedAmount) : null,
        _14_finance_scheme_11_grant_received: financeCommissionWorks[10]?.grantReceived ? parseFloat(financeCommissionWorks[10].grantReceived) : null,
        _14_finance_scheme_11_expense: null,
        work_start_date_1: gpWorkStartDate || null,
        work_completion_date_1: gpWorkCompletionDate || null,
        progress_status_1: gpWorkCurrentStatus,
        certificate_received_1: gpWorkCertificateReceived,
        remarks_1: gpWorkRemarks,
        inspection_officer_opinion_1: officerOpinion1,
        inspection_officer_opinion_2: officerOpinion2,
        inspection_officer_opinion_3: officerOpinion3,
        inspection_officer_opinion_4: officerOpinion4,
        inspection_officer_opinion_5: officerOpinion5,
        inspection_officer_opinion_6: officerOpinion6,
        inspection_officer_opinion_7: officerOpinion7,
        inspection_officer_opinion_8: officerOpinion8,
        form1: form1,
        form2: form2,
        form3: form3,
        form4: form4,
        form5: form5,
        form6: form6,
        form7: form7,
        form8: form8,
        copy1: copy1,
        copy2: copy2,
        copy3: copy3,
        copy_to_ceo: copyToCeo,
        copy_to_bdo: copyToBdo,
        copy_to_secretary: copyToSecretary,
        filled_by_name: secretaryName || user?.email || '',
      };

      await saveGrampanchayatInspectionForm(inspection.id, formData);

      for (let i = 0; i < photos.length; i++) {
        const meta = photoMetas[i];
        await uploadPhoto(inspection.id, photos[i], `photo${i + 1}.jpg`, i + 1, meta);
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
