import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../store/auth.store';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rehydrate        = useAuthStore((state) => state.rehydrate);

  /**
   * Restore the persisted session on every app boot.
   * This runs synchronously before the first render cycle completes,
   * so there is no flash of the login screen for returning users.
   */
  useEffect(() => {
    rehydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
