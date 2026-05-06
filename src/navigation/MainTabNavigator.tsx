import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/features/home/HomeScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();

const SavedScreen = () => <PlaceholderScreen name="Saved Items" />;
const CartScreen = () => <PlaceholderScreen name="Your Cart" />;
const OrdersScreen = () => <PlaceholderScreen name="Order History" />;

const renderCustomTabBar = (props: any) => <CustomTabBar {...props} />;

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={renderCustomTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
