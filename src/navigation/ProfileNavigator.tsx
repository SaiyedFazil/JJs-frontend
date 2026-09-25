import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { EditProfileScreen } from '@/features/profile/EditProfileScreen';

/**
 * The Profile tab's own stack.
 *
 * `ProfileMain` takes an optional `toast` param: Edit Profile navigates back
 * with it after a successful save, so the confirmation appears on the screen
 * the change is visible on rather than on the one being dismissed.
 */
export type ProfileStackParamList = {
  ProfileMain: { toast?: string } | undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);
