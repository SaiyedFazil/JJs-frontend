import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '@/components/pages/auth/splash/SplashScreen';
import { LoginScreen } from '@/components/pages/auth/login/LoginScreen';
import { OtpVerificationScreen } from '@/components/pages/auth/otp-verification/OtpVerificationScreen';
import { useAuthStore } from '@/store/auth.store';
import type { AuthStackParamList } from '@/types/navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const isFirstLaunch = useAuthStore(state => state.isFirstLaunch);

  return (
    <Stack.Navigator
      initialRouteName={isFirstLaunch ? 'Splash' : 'Login'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
};
