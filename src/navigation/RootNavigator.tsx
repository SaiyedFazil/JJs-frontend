import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CompleteProfileScreen } from '../features/auth/complete-profile';
import { useAuthStore } from '../store/auth.store';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const profileCompleted = useAuthStore(state => state.profileCompleted);
  const rehydrate = useAuthStore(state => state.rehydrate);

  useEffect(() => {
    rehydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }
    if (!profileCompleted) {
      return <CompleteProfileScreen />;
    }
    return <MainTabNavigator />;
  };

  return <NavigationContainer>{renderNavigator()}</NavigationContainer>;
};
