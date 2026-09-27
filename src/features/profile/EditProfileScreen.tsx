import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { FormScreen, Icon, Text, TextField } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/store/profile.store';
import { UserService } from '@/services/user.service';
import { useAppToast } from '@/hooks/useAppToast';
import { EMAIL_REGEX } from '@/lib/validation';
import type { ProfileStackParamList } from '@/types/navigation.types';
import { Avatar } from './components/Avatar';
import { AvatarSheet } from './components/AvatarSheet';
import { PillButton } from './components/PillButton';
import { VerifiedChip } from './components/VerifiedChip';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const toast = useAppToast();

  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const avatarId = useProfileStore(state => state.avatarId);
  const setAvatar = useProfileStore(state => state.setAvatar);

  // Seeded from the session's cached profile so the form is never blank while
  // the GET is in flight; the response then replaces it with server truth.
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [countryCode, setCountryCode] = useState(user?.countryCode ?? '+91');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');

  /**
   * What the server currently holds. "Changed" is measured against this, not
   * against the values the form opened with, so the Save button reflects
   * whether there is anything to send rather than whether anything was typed.
   */
  const [saved, setSaved] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);

  /**
   * Set the moment the user edits anything. A slow GET that lands afterwards
   * refreshes the phone (which they cannot edit anyway) but leaves the text
   * they typed alone — a response overwriting a half-typed name is the classic
   * way a prefill turns into data loss.
   */
  const isDirty = useRef(false);

  // useAppToast builds a new object every render, so it cannot go in the
  // effect's deps without re-running the fetch on every render.
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const profile = await UserService.getProfile();
        if (!isActive) return;

        // The phone is read-only here, so the server's copy always wins.
        setCountryCode(profile.countryCode);
        setPhoneNumber(profile.phoneNumber);

        // The baseline moves to the server's values either way: what counts
        // as an unsaved change is measured against what is stored, not
        // against whatever the form happened to open with.
        setSaved({
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          email: profile.email ?? '',
        });

        if (!isDirty.current) {
          setFirstName(profile.firstName ?? '');
          setLastName(profile.lastName ?? '');
          // A null or missing email is a legitimate state — it renders as the
          // field's empty placeholder rather than the string "null".
          setEmail(profile.email ?? '');
        }

        // Keep the rest of the app in step: the profile header reads the same
        // store, so it stops showing a stale name the moment this returns.
        updateUser({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          countryCode: profile.countryCode,
          phoneNumber: profile.phoneNumber,
        });
      } catch (error: any) {
        if (!isActive) return;
        // Non-fatal: the form stays usable on the cached profile.
        toastRef.current.error(
          'Could not load your profile',
          error?.message ?? 'Showing your last saved details.',
        );
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [updateUser]);

  const edit = useCallback(
    (setter: (value: string) => void, field: keyof FieldErrors) =>
      (value: string) => {
        isDirty.current = true;
        setter(value);
        setErrors(previous =>
          previous[field] ? { ...previous, [field]: undefined } : previous,
        );
      },
    [],
  );

  /**
   * Whether there is anything worth sending. Compared trimmed, so adding a
   * trailing space is not an edit.
   *
   * The avatar is deliberately not part of this: the sheet commits it on its
   * own Save, so it is already stored by the time this screen sees it.
   */
  const hasChanges =
    firstName.trim() !== saved.firstName.trim() ||
    lastName.trim() !== saved.lastName.trim() ||
    email.trim() !== saved.email.trim();

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    // Every check runs before any returns, so a form with three problems
    // reports three rather than one at a time.
    const nextErrors: FieldErrors = {
      firstName: trimmedFirst ? undefined : 'Enter your first name',
      lastName: trimmedLast ? undefined : 'Enter your last name',
      email:
        !trimmedEmail || EMAIL_REGEX.test(trimmedEmail)
          ? undefined
          : 'Enter a valid email address',
    };

    setErrors(nextErrors);
    if (nextErrors.firstName || nextErrors.lastName || nextErrors.email) return;

    setSaving(true);
    try {
      // Email is omitted rather than sent empty: the field is optional, and
      // an empty string is a value the server would have to validate.
      const updated = await UserService.updateProfile({
        first_name: trimmedFirst,
        last_name: trimmedLast,
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
      });

      // Persist what came BACK, not what was sent — the response is the
      // server's record of what it actually stored.
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
      });

      // popTo, NOT navigate. In React Navigation 7 a plain `navigate` only
      // reuses an earlier route when the action carries `pop`, so it PUSHED a
      // second Profile screen on top of this one — and that copy rendered
      // blank, because everything on it enters with a reanimated animation
      // that never runs for a screen mounted mid-transition. popTo unwinds to
      // the instance that is already there, which is what "go back" means.
      navigation.popTo('ProfileMain', { toast: 'Profile saved' });
    } catch (error: any) {
      toast.error(
        'Could not save your profile',
        error?.message ?? 'Check your connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  }, [email, firstName, lastName, navigation, toast, updateUser]);

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
