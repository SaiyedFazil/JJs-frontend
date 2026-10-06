import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { CompleteProfileScreen } from '@/components/pages/auth/complete-profile/CompleteProfileScreen';
import { useAuthStore } from '@/store/auth.store';
import type { AppStackParamList } from '@/types/navigation.types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * One native stack for the whole session, holding exactly one screen chosen
 * by auth state.
 *
 * NOT three navigators swapped in and out. Every launch renders the Auth flow
 * first — the session rehydrates in an effect — so a signed-in launch, like a
 * sign-in, replaces it. When that replaced one root native stack (Auth) with
 * another (Main), the incoming stack on Android was laid out but never drawn:
 * the app showed only the bare window. Swapping screens inside a stack that
 * stays mounted is the auth-flow pattern React Navigation documents.
 *
 * No animation: the flows used to swap instantly, and should still.
 */
export const RootNavigator = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const profileCompleted = useAuthStore(state => state.profileCompleted);
  const rehydrate = useAuthStore(state => state.rehydrate);

  useEffect(() => {
    rehydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !profileCompleted ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
          />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
