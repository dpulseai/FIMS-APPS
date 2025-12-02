import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[RootNavigator] Auth state - loading:', loading, 'user:', user ? 'logged in' : 'not logged in');
  }, [loading, user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {loading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : user ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
