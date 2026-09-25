import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { Icon, Text, TextField } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/store/profile.store';
import { UserService } from '@/services/user.service';
import { useAppToast } from '@/hooks/useAppToast';
import type { ProfileStackParamList } from '@/navigation/ProfileNavigator';
import { Avatar } from './components/Avatar';
import { AvatarSheet } from './components/AvatarSheet';
import { PillButton } from './components/PillButton';
import { VerifiedChip } from './components/VerifiedChip';

/** Deliberately permissive — the server is the authority on deliverability. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const toast = useAppToast();

  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const avatarId = useProfileStore(state => state.avatarId);
  const setAvatar = useProfileStore(state => state.setAvatar);

  const [name, setName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(' '),
  );
  const [email, setEmail] = useState(user?.email ?? '');
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [isSaving, setSaving] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Both checks run before either returns, so a form with two problems
    // reports both rather than one at a time.
    const nextNameError = trimmedName ? undefined : 'Enter your name';
    const nextEmailError =
      !trimmedEmail || EMAIL.test(trimmedEmail)
        ? undefined
        : 'Enter a valid email address';

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    if (nextNameError || nextEmailError) return;

    // "Fazil" → first "Fazil", last ""; "Fazil Saiyed Khan" → first "Fazil",
    // last "Saiyed Khan". One field on screen, two on the wire.
    const [firstName, ...rest] = trimmedName.split(/\s+/);
    const lastName = rest.join(' ');

    setSaving(true);
    try {
      await UserService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: trimmedEmail,
      });

      // Local state only after the server has accepted it, so a failed save
      // never leaves the app showing a name the backend does not have.
      updateUser({ firstName, lastName, email: trimmedEmail });
      navigation.navigate('ProfileMain', { toast: 'Profile saved' });
    } catch {
      toast.error(
        'Could not save your profile',
        'Check your connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  }, [email, name, navigation, toast, updateUser]);

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

        <Text variant="item" weight="800" className="flex-1">
          Edit Profile
        </Text>

        <PillButton
          label="Save"
          size="sm"
          isLoading={isSaving}
          onPress={handleSave}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        className="px-md"
      >
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
          label="Full name"
          value={name}
          onChangeText={setName}
          onFocus={() => setNameError(undefined)}
          placeholder="Your name"
          error={nameError}
          autoCapitalize="words"
          textContentType="name"
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
              {user?.countryCode ?? '+91'}
            </Text>
            <Text variant="item" tone="ink" className="flex-1">
              {user?.phoneNumber ?? ''}
            </Text>
            <VerifiedChip />
          </View>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setEmailError(undefined)}
          placeholder="you@email.com"
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <PillButton
          label="Save changes"
          size="lg"
          className="w-full mt-sm"
          isLoading={isSaving}
          onPress={handleSave}
        />
      </ScrollView>

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
