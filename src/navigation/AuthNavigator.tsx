import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../features/auth/SplashScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { OtpVerificationScreen } from '../features/auth/OtpVerificationScreen';
import { useAuthStore } from '../store/auth.store';

const Stack = createNativeStackNavigator();

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
