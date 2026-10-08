import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from '@react-navigation/native';
import { HomeScreen } from '@/components/pages/home/HomeScreen';
import { MenuScreen } from '@/components/pages/menu/MenuScreen';
import { FavouritesScreen } from '@/components/pages/favourites/FavouritesScreen';
import { CustomTabBar } from '@/components/layout/CustomTabBar';
import type { MainTabParamList } from '@/types/navigation.types';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderCustomTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} />
);

/**
 * Screens inside a tab's stack that own the whole viewport.
 *
 * CustomTabBar honours `display: 'none'` here the way the default bar does,
 * so this is the one place that decides it — the screen itself stays unaware
 * of the navigator it happens to be mounted in.
 */
const FULL_SCREEN_ROUTES = ['EditProfile'];

const HIDDEN = { display: 'none' } as const;

const tabBarVisibility = ({
  route,
}: {
  route: RouteProp<MainTabParamList, 'Profile'>;
}) => {
  const focused = getFocusedRouteNameFromRoute(route);
  return {
    tabBarStyle:
      focused && FULL_SCREEN_ROUTES.includes(focused) ? HIDDEN : undefined,
  };
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={renderCustomTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Favourites" component={FavouritesScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={tabBarVisibility}
      />
    </Tab.Navigator>
  );
};
