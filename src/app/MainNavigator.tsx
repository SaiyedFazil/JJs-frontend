import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductDetailScreen } from '@/components/pages/product-detail/ProductDetailScreen';
import type { MainStackParamList } from '@/types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * The signed-in app. The tabs are its first screen; anything pushed on top of
 * them — a dish's page — covers the tab bar, with no per-route hiding.
 */
export const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainTabNavigator} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);
