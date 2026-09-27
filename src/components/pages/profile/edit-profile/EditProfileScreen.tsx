import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { FormScreen, Icon, Text, TextField } from '@/components/ui';
import { useProfileStore } from '@/store/profile.store';
import type { ProfileStackParamList } from '@/types/navigation.types';
import { Avatar } from '../components/Avatar';
import { AvatarSheet } from '../components/AvatarSheet';
import { PillButton } from '../components/PillButton';
import { VerifiedChip } from '../components/VerifiedChip';
import { useEditProfile } from './hooks/use-edit-profile';

export const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const avatarId = useProfileStore(state => state.avatarId);
  const setAvatar = useProfileStore(state => state.setAvatar);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    countryCode,
    phoneNumber,
    errors,
    isLoading,
    isSaving,
    hasChanges,
    edit,
    handleSave,
  } = useEditProfile();

  return (
    <View className="flex-1 bg-canvas">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-center gap-3 px-md pb-3.5 bg-surface border-b border-card-hairline"
      >
        <TouchableOpacity
          onPress={navigation.goBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="w-9.5 h-9.5 rounded-md border border-card-hairline items-center justify-center"
        >
          <Icon
            icon={ChevronLeft}
            className="text-ink-strong"
            size={19}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* One Save, at the foot of the form. A second one up here competed
            with it for the same action. */}
        <Text variant="item" weight="800" className="flex-1">
          Edit Profile
        </Text>
      </View>

      <FormScreen contentContainerStyle={styles.content} className="px-md">
        <View className="items-center mb-lg">
          <Avatar
            id={avatarId}
            size={92}
            className="border-2 border-surface shadow-ember-glow mb-3"
          />
          <PillButton
            label="Change avatar"
            variant="ember-outline"
            size="sm"
            onPress={() => setSheetOpen(true)}
          />
        </View>

        <TextField
          label="First name"
          value={firstName}
          onChangeText={edit(setFirstName, 'firstName')}
          placeholder="Your first name"
          error={errors.firstName}
          autoCapitalize="words"
          textContentType="givenName"
          returnKeyType="next"
        />

        <TextField
          label="Last name"
          value={lastName}
          onChangeText={edit(setLastName, 'lastName')}
          placeholder="Your last name"
          error={errors.lastName}
          autoCapitalize="words"
          textContentType="familyName"
          returnKeyType="next"
        />

        {/* Read-only: the phone IS the account here — it is what the OTP was
            sent to, so changing it would be a re-registration, not an edit. */}
        <View className="mb-md">
          <Text variant="caption" tone="muted" className="mb-sm ml-xs">
            Phone
          </Text>
          <View className="flex-row items-center gap-sm h-14 px-md rounded-lg border border-hairline bg-sunken">
            <Text variant="item" tone="muted">
              {countryCode}
            </Text>
            <Text variant="item" tone="ink" className="flex-1">
              {phoneNumber}
            </Text>
            <VerifiedChip />
          </View>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={edit(setEmail, 'email')}
          placeholder="you@email.com"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          // The keyboard's Done key obeys the same rule as the button, so it
          // cannot send a PATCH the button would have refused.
          onSubmitEditing={() => {
            if (hasChanges && !isLoading) handleSave();
          }}
        />

        <PillButton
          label="Save changes"
          size="lg"
          className="w-full mt-sm"
          isLoading={isSaving}
          // Nothing to save until the profile being edited has arrived — a
          // save mid-fetch would send the cached copy back — and nothing to
          // save when the form still matches what the server holds.
          isDisabled={isLoading || !hasChanges}
          onPress={handleSave}
        />
      </FormScreen>

      {isSheetOpen ? (
        <AvatarSheet
          currentId={avatarId}
          onClose={() => setSheetOpen(false)}
          onSave={id => {
            setAvatar(id);
            setSheetOpen(false);
          }}
        />
      ) : null}
    </View>
  );
};

/** Layout-only: room below the last control for the keyboard to rise into. */
const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 48 },
});
