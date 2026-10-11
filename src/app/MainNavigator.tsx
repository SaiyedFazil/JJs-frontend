import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductDetailScreen } from '@/components/pages/product-detail/ProductDetailScreen';
import { MyOrdersScreen } from '@/components/pages/my-orders/MyOrdersScreen';
import { OrderDetailScreen } from '@/components/pages/order-detail/OrderDetailScreen';
import { CartScreen } from '@/components/pages/cart/CartScreen';
import { SettingsScreen } from '@/components/pages/profile/settings/SettingsScreen';
import { NotificationSettingsScreen } from '@/components/pages/profile/settings/notification-settings/NotificationSettingsScreen';
import type { MainStackParamList } from '@/types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * The signed-in app. The tabs are its first screen; anything pushed on top of
 * them — a dish's page, the cart, order history — covers the tab bar, with no
 * per-route hiding.
 */
export const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainTabNavigator} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen
      name="NotificationSettings"
      component={NotificationSettingsScreen}
    />
  </Stack.Navigator>
);
