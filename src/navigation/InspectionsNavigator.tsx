import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { InspectionsStackParamList } from '../types';
import InspectionsListScreen from '../screens/inspections/InspectionsListScreen';
import InspectionDetailScreen from '../screens/inspections/InspectionDetailScreen';

const Stack = createStackNavigator<InspectionsStackParamList>();

export default function InspectionsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InspectionsList"
        component={InspectionsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InspectionDetail"
        component={InspectionDetailScreen}
        options={{
          title: 'Inspection Details',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
