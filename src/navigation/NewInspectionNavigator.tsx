import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FormsStackParamList } from '../types';
import CategorySelectionScreen from '../screens/inspections/CategorySelectionScreen';
import FIMSOfficeInspectionScreen from '../screens/forms/FIMSOfficeInspectionScreen';
import AnganwadiTapasaniScreen from '../screens/forms/AnganwadiTapasaniScreen';
import HealthInspectionScreen from '../screens/forms/HealthInspectionScreen';
import BandhkamVibhag1Screen from '../screens/forms/BandhkamVibhag1Screen';
import BandhkamVibhag2Screen from '../screens/forms/BandhkamVibhag2Screen';
import GrampanchayatInspectionScreen from '../screens/forms/GrampanchayatInspectionScreen';
import MahatmaGandhiRojgarHamiScreen from '../screens/forms/MahatmaGandhiRojgarHamiScreen';
import SubCenterMonitoringScreen from '../screens/forms/SubCenterMonitoringScreen';
import MumbaiNyayalayScreen from '../screens/forms/MumbaiNyayalayScreen';
import PahuvaidhakiyaTapasaniScreen from '../screens/forms/PahuvaidhakiyaTapasaniScreen';
import RajyaShaishanikPrashikshanScreen from '../screens/forms/RajyaShaishanikPrashikshanScreen';
import RajyaGunwattaNirikshakScreen from '../screens/forms/RajyaGunwattaNirikshakScreen';
import ZPDarMahinyalaScreen from '../screens/forms/ZPDarMahinyalaScreen';

const Stack = createStackNavigator<FormsStackParamList>();

export default function NewInspectionNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FIMSOfficeInspection" component={FIMSOfficeInspectionScreen} options={{ title: 'Office Inspection' }} />
      <Stack.Screen name="AnganwadiTapasani" component={AnganwadiTapasaniScreen} options={{ title: 'Anganwadi' }} />
      <Stack.Screen name="HealthInspection" component={HealthInspectionScreen} options={{ title: 'Health' }} />
      <Stack.Screen name="SubCenterMonitoring" component={SubCenterMonitoringScreen} options={{ title: 'Sub Center' }} />
      <Stack.Screen name="BandhkamVibhag1" component={BandhkamVibhag1Screen} options={{ title: 'Construction 1' }} />
      <Stack.Screen name="BandhkamVibhag2" component={BandhkamVibhag2Screen} options={{ title: 'Construction 2' }} />
      <Stack.Screen name="GrampanchayatInspection" component={GrampanchayatInspectionScreen} options={{ title: 'Gram Panchayat' }} />
      <Stack.Screen name="MahatmaGandhiRojgarHami" component={MahatmaGandhiRojgarHamiScreen} options={{ title: 'MGNREGA' }} />
      <Stack.Screen name="MumbaiNyayalay" component={MumbaiNyayalayScreen} options={{ title: 'Mumbai High Court' }} />
      <Stack.Screen name="PahuvaidhakiyaTapasani" component={PahuvaidhakiyaTapasaniScreen} options={{ title: 'Veterinary' }} />
      <Stack.Screen name="RajyaShaishanikPrashikshan" component={RajyaShaishanikPrashikshanScreen} options={{ title: 'Education Training' }} />
      <Stack.Screen name="RajyaGunwattaNirikshak" component={RajyaGunwattaNirikshakScreen} options={{ title: 'Quality Inspector' }} />
      <Stack.Screen name="ZPDarMahinyala" component={ZPDarMahinyalaScreen} options={{ title: 'Monthly Report' }} />
    </Stack.Navigator>
  );
}
