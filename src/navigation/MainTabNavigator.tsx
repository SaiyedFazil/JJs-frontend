import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../store/auth.store';

const Tab = createBottomTabNavigator();

const HomeScreen = () => (
  <View className="flex-1 items-center justify-center bg-gray-50">
    <Text className="text-xl font-bold">Home</Text>
  </View>
);

const MenuScreen = () => (
  <View className="flex-1 items-center justify-center bg-gray-50">
    <Text className="text-xl font-bold">Menu</Text>
  </View>
);

const OrdersScreen = () => (
  <View className="flex-1 items-center justify-center bg-gray-50">
    <Text className="text-xl font-bold">Orders</Text>
  </View>
);

const ProfileScreen = () => {
  const logout = useAuthStore((state) => state.logout);
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-xl font-bold mb-4">Profile</Text>
      <Button title="Logout" onPress={logout} color="#C1292E" />
    </View>
  );
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF6B35' }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
