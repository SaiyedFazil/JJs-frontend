import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/auth.store';
import { userApi } from '@/lib/api/user/user-api';
import { EMAIL_REGEX } from '@/lib/validation';
import { useAppToast } from '@/hooks/use-app-toast';
import type { ProfileStackParamList } from '@/types/navigation.types';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Edit Profile's form: seeds from the cached session, refreshes from the
 * server, tracks unsaved changes against what the server holds, validates
 * and saves. The screen renders what this returns; the avatar sheet is UI
 * state and stays with the screen.
 */
export const useEditProfile = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const toast = useAppToast();

  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);

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
        const profile = await userApi.getProfile();
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
      const updated = await userApi.updateProfile({
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

  return {
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
  };
};
