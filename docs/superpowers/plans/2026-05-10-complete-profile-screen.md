# Complete Profile Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After OTP verification, route new users (`profileCompleted: false`) to a CompleteProfile screen that collects First Name, Last Name, and optional Email (with email OTP verification), then lands them on the home tab.

**Architecture:** `setAuth()` is called immediately after OTP success regardless of `profileCompleted`. `RootNavigator` gains a third branch: `isAuthenticated && !profileCompleted → <CompleteProfileScreen />`. On submit, `setProfileCompleted(true)` flips the flag and the navigator switches to `MainTabNavigator`. All API calls in CompleteProfile are static (no backend yet).

**Tech Stack:** React Native CLI, TypeScript strict, Zustand, react-native-reanimated v3, heroui-native, Uniwind/Tailwind v4, react-navigation native-stack.

---

## Files

| Action | Path                                          | Responsibility                                                                |
| ------ | --------------------------------------------- | ----------------------------------------------------------------------------- |
| Modify | `src/types/api.types.ts`                      | Add `profileCompleted: boolean` to `AuthResponse`                             |
| Modify | `src/store/auth.store.ts`                     | Add `profileCompleted` flag + `setProfileCompleted` action + update `setAuth` |
| Modify | `src/navigation/RootNavigator.tsx`            | Add third routing branch for incomplete profiles                              |
| Create | `src/features/auth/CompleteProfileScreen.tsx` | New profile completion screen                                                 |

---

### Task 1: Add `profileCompleted` to API types

**Files:**

- Modify: `src/types/api.types.ts`

- [ ] **Step 1: Update `AuthResponse` to include `profileCompleted`**

Open `src/types/api.types.ts`. The current `AuthResponse` is:

```typescript
export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
}
```

Replace with:

```typescript
export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
  profileCompleted: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/api.types.ts
git commit -m "feat: add profileCompleted to AuthResponse type"
```

---

### Task 2: Update auth store — add `profileCompleted` state and action

**Files:**

- Modify: `src/store/auth.store.ts`

- [ ] **Step 1: Add `profileCompleted` to `AuthState` interface**

In `src/store/auth.store.ts`, the `AuthState` interface currently ends at `isFirstLaunch`. Add the new field and action after it:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: StoredUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isFirstLaunch: boolean;

  /** True once the user's display name is on file. New users start as false. */
  profileCompleted: boolean;

  setFirstLaunch: (isFirst: boolean) => void;
  /** Marks the profile as filled — triggers RootNavigator to show MainTabNavigator. */
  setProfileCompleted: (value: boolean) => void;
  setAuth: (response: AuthResponse) => void;
  rehydrate: () => void;
  logout: () => void;
}
```

- [ ] **Step 2: Add default value and `setProfileCompleted` action to the store**

In the `create<AuthState>((set) => ({ ... }))` block, add after `isFirstLaunch: true`:

```typescript
  profileCompleted: true,   // default true so rehydrated sessions skip this screen
```

And after `setFirstLaunch`:

```typescript
  setProfileCompleted: (value: boolean) => set({ profileCompleted: value }),
```

- [ ] **Step 3: Update `setAuth` to extract and store `profileCompleted`**

The current `setAuth` destructures `accessToken`, `refreshToken`, and strips `isOtpVerified`. Add `profileCompleted` to the destructure so it is NOT spread into `profileFields` (which maps to `StoredUserProfile`, which does not have this field):

```typescript
  setAuth: (response: AuthResponse) => {
    const {
      accessToken,
      refreshToken,
      profileCompleted,
      // Strip auth-only fields — keep only profile fields in the profile store
      /* eslint-disable @typescript-eslint/no-unused-vars */
      isOtpVerified: _v,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...profileFields
    } = response;

    const profile: StoredUserProfile = profileFields;

    set({
      isAuthenticated: true,
      user:            profile,
      accessToken,
      refreshToken,
      profileCompleted,
    });

    setTimeout(() => {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUserProfile(profile);
    }, 0);
  },
```

- [ ] **Step 4: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/store/auth.store.ts
git commit -m "feat: add profileCompleted flag and setProfileCompleted action to auth store"
```

---

### Task 3: Create `CompleteProfileScreen`

**Files:**

- Create: `src/features/auth/CompleteProfileScreen.tsx`

- [ ] **Step 1: Create the file with the full screen implementation**

Create `src/features/auth/CompleteProfileScreen.tsx` with this content:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, {
  SlideInDown,
  FadeInUp,
  FadeIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { useAuthStore } from '@/store/auth.store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.38;
const MIN_HEADER_HEIGHT = 140;
const CARD_OVERLAP = 40;
const MIN_CARD_OVERLAP = 30;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CompleteProfileScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError]   = useState('');
  const [showEmailOtp, setShowEmailOtp]     = useState(false);
  const [emailOtp, setEmailOtp]             = useState('');
  const [isOtpFocused, setIsOtpFocused]     = useState(false);
  const [isLoading, setIsLoading]           = useState(false);

  const emailOtpRef   = useRef<TextInput>(null);
  const insets        = useSafeAreaInsets();
  const setProfileCompleted = useAuthStore((state) => state.setProfileCompleted);

  const headerProgress      = useSharedValue(1);
  const emailVerifyProgress = useSharedValue(0);
  const otpSectionProgress  = useSharedValue(0);

  const isEmailValid    = EMAIL_REGEX.test(email);
  const isEmailFlowActive = showEmailOtp;
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    (!isEmailFlowActive || emailOtp.length === 6);

  // Animate the "Verify Email" button in/out as email validity changes
  useEffect(() => {
    emailVerifyProgress.value = withTiming(isEmailValid ? 1 : 0, { duration: 250 });
    if (!isEmailValid && showEmailOtp) {
      setShowEmailOtp(false);
      setEmailOtp('');
      otpSectionProgress.value = withTiming(0, { duration: 200 });
    }
  // emailVerifyProgress and otpSectionProgress are stable SharedValue refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmailValid]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      headerProgress.value = withTiming(0, { duration: 220 });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      headerProgress.value = withTiming(1, { duration: 220 });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  // headerProgress is a stable SharedValue ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: MIN_HEADER_HEIGHT + headerProgress.value * (HEADER_HEIGHT - MIN_HEADER_HEIGHT),
    overflow: 'hidden' as const,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    marginTop: -(MIN_CARD_OVERLAP + headerProgress.value * (CARD_OVERLAP - MIN_CARD_OVERLAP)),
  }));

  const emailVerifyButtonStyle = useAnimatedStyle(() => ({
    opacity: emailVerifyProgress.value,
    transform: [{ translateY: interpolate(emailVerifyProgress.value, [0, 1], [8, 0]) }],
  }));

  const otpSectionStyle = useAnimatedStyle(() => ({
    opacity: otpSectionProgress.value,
    maxHeight: interpolate(otpSectionProgress.value, [0, 1], [0, 220]),
    overflow: 'hidden' as const,
  }));

  const handleVerifyEmail = () => {
    setShowEmailOtp(true);
    otpSectionProgress.value = withTiming(1, { duration: 300 });
    setTimeout(() => emailOtpRef.current?.focus(), 350);
  };

  const handleSubmit = () => {
    let hasError = false;
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      hasError = true;
    }
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      hasError = true;
    }
    if (hasError) { return; }

    setIsLoading(true);
    // Static — no API yet. Flip flag after brief delay for UX feedback.
    setTimeout(() => {
      setProfileCompleted(true);
    }, 500);
  };

  const renderOtpSlots = () => {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const char     = emailOtp[i];
      const isActive = isOtpFocused && i === emailOtp.length;
      slots.push(
        <View
          key={i}
          className={`w-10 h-12 rounded-xl border-2 justify-center items-center bg-white dark:bg-white/10 ${
            isActive
              ? 'border-primary dark:border-primary-dark'
              : 'border-border dark:border-border-dark'
          }`}
          pointerEvents="none"
        >
          {char ? (
            <Animated.Text
              entering={ZoomIn.duration(200)}
              className="text-xl font-black text-[#170C79] dark:text-white"
            >
              {char}
            </Animated.Text>
          ) : null}
          {isActive && (
            <View className="w-0.5 h-5 bg-primary dark:bg-primary-dark absolute" />
          )}
        </View>
      );
    }
    return slots;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-primary dark:bg-primary-dark"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background dark:bg-background-dark"
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Collapsible Header ─────────────────────────────────────────────── */}
        <Animated.View
          style={animatedHeaderStyle}
          className="w-full bg-primary dark:bg-primary-dark items-center justify-center"
        >
          <Animated.View entering={FadeInUp.duration(900)} className="items-center px-6">
            <View className="w-20 h-20 bg-primary-foreground/20 rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-primary-foreground text-2xl font-black text-center">
              Complete Your Profile
            </Text>
            <Text className="text-primary-foreground/70 text-sm font-medium text-center mt-1">
              Just a few details to get started
            </Text>
          </Animated.View>
        </Animated.View>

        {/* ── Floating Card ──────────────────────────────────────────────────── */}
        <Animated.View
          entering={SlideInDown.duration(600)}
          className="flex-1 bg-surface dark:bg-surface-dark rounded-t-[40px] px-6 pt-8"
          style={[
            styles.cardShadow,
            { paddingBottom: insets.bottom + 40 },
            animatedCardStyle,
          ]}
        >
          {/* Drag handle */}
          <View className="w-14 h-1.5 bg-muted/30 dark:bg-muted-dark/30 rounded-full self-center mb-6" />

          {/* ── First Name ───────────────────────────────────────────────────── */}
          <View className="mb-4">
            <Text className="text-foreground dark:text-foreground-dark font-semibold text-sm mb-1.5">
              First Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (text.trim()) { setFirstNameError(''); }
              }}
              onBlur={() => {
                if (!firstName.trim()) { setFirstNameError('First name is required'); }
              }}
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-white/10 border border-border dark:border-border-dark rounded-2xl px-4 text-foreground dark:text-foreground-dark font-medium"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {firstNameError ? (
              <Animated.Text
                entering={FadeIn.duration(250)}
                className="text-red-500 text-xs font-medium mt-1 ml-1"
              >
                {firstNameError}
              </Animated.Text>
            ) : null}
          </View>

          {/* ── Last Name ────────────────────────────────────────────────────── */}
          <View className="mb-4">
            <Text className="text-foreground dark:text-foreground-dark font-semibold text-sm mb-1.5">
              Last Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (text.trim()) { setLastNameError(''); }
              }}
              onBlur={() => {
                if (!lastName.trim()) { setLastNameError('Last name is required'); }
              }}
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-white/10 border border-border dark:border-border-dark rounded-2xl px-4 text-foreground dark:text-foreground-dark font-medium"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {lastNameError ? (
              <Animated.Text
                entering={FadeIn.duration(250)}
                className="text-red-500 text-xs font-medium mt-1 ml-1"
              >
                {lastNameError}
              </Animated.Text>
            ) : null}
          </View>

          {/* ── Email ───────────────────────────────────────────────────────── */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-sm">
                Email
              </Text>
              <Text className="text-muted dark:text-muted-dark text-xs font-medium">
                Optional
              </Text>
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-white/10 border border-border dark:border-border-dark rounded-2xl px-4 text-foreground dark:text-foreground-dark font-medium"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
            />
            {email.length > 0 && !isEmailValid ? (
              <Animated.Text
                entering={FadeIn.duration(250)}
                className="text-amber-500 text-xs font-medium mt-1 ml-1"
              >
                Please enter a valid email address
              </Animated.Text>
            ) : null}
          </View>

          {/* ── Verify Email button (slides in when email is valid) ─────────── */}
          <Animated.View style={emailVerifyButtonStyle}>
            {isEmailValid && !showEmailOtp ? (
              <TouchableOpacity
                onPress={handleVerifyEmail}
                activeOpacity={0.8}
                className="self-start ml-1 mt-2 bg-primary/10 dark:bg-primary-dark/20 border border-primary/30 dark:border-primary-dark/40 px-4 py-2.5 rounded-xl flex-row items-center"
              >
                <Text className="text-primary dark:text-white text-sm mr-2">✉</Text>
                <Text className="text-primary dark:text-white font-bold text-sm">
                  Verify Email
                </Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>

          {/* ── Email OTP section (animates in after "Verify Email" tap) ──────── */}
          <Animated.View style={otpSectionStyle}>
            <View className="mt-4 pt-4 border-t border-border dark:border-border-dark">
              <Text className="text-foreground/70 dark:text-foreground-dark/70 text-sm font-medium mb-3 text-center leading-5">
                Enter the 6-digit code sent to{'\n'}
                <Text className="text-foreground dark:text-foreground-dark font-bold">
                  {email}
                </Text>
              </Text>

              {/* Hidden TextInput — same pattern as OtpVerificationScreen */}
              <TextInput
                ref={emailOtpRef}
                value={emailOtp}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setEmailOtp(cleaned);
                  if (cleaned.length === 6) { Keyboard.dismiss(); }
                }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                style={styles.hiddenInput}
                onFocus={() => setIsOtpFocused(true)}
                onBlur={() => setIsOtpFocused(false)}
              />

              <TouchableOpacity
                activeOpacity={1}
                onPress={() => emailOtpRef.current?.focus()}
                style={styles.otpRow}
              >
                {renderOtpSlots()}
              </TouchableOpacity>

              <TouchableOpacity
                className="self-center mt-1"
                activeOpacity={0.7}
                onPress={() => {
                  setShowEmailOtp(false);
                  setEmailOtp('');
                  otpSectionProgress.value = withTiming(0, { duration: 200 });
                }}
              >
                <Text className="text-muted dark:text-muted-dark text-xs font-medium underline">
                  Change email
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Submit button ────────────────────────────────────────────────── */}
          <Button
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            isDisabled={!canSubmit}
            className={`h-16 rounded-2xl shadow-lg mt-6 ${
              canSubmit
                ? 'bg-primary dark:bg-primary-dark'
                : 'bg-primary/30 dark:bg-primary-dark/30 shadow-none'
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <Spinner color="white" size="sm" />
                <Text className="text-primary-foreground text-xl font-black ml-3">
                  Saving...
                </Text>
              </View>
            ) : (
              <Text
                className={`text-xl font-black ${
                  canSubmit
                    ? 'text-primary-foreground'
                    : 'text-muted dark:text-muted-dark'
                }`}
              >
                {isEmailFlowActive ? 'Verify & Save' : 'Complete Profile'}
              </Text>
            )}
          </Button>

          {/* Terms footer */}
          <View className="mt-auto pt-8">
            <Text className="text-muted dark:text-muted-dark font-medium text-[10px] text-center leading-4">
              By continuing, you automatically accept our{'\n'}
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">
                Terms & Conditions
              </Text>
              ,{' '}
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">
                Privacy Policy
              </Text>{' '}
              and{' '}
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">
                Cookies Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  input: { height: 52, fontSize: 15 },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    paddingVertical: 8,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/CompleteProfileScreen.tsx
git commit -m "feat: add CompleteProfileScreen with name/email fields and email OTP flow"
```

---

### Task 4: Wire `CompleteProfileScreen` into `RootNavigator`

**Files:**

- Modify: `src/navigation/RootNavigator.tsx`

- [ ] **Step 1: Update `RootNavigator` to add the third routing branch**

Replace the entire content of `src/navigation/RootNavigator.tsx` with:

```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CompleteProfileScreen } from '../features/auth/CompleteProfileScreen';
import { useAuthStore } from '../store/auth.store';

export const RootNavigator = () => {
  const isAuthenticated    = useAuthStore((state) => state.isAuthenticated);
  const profileCompleted   = useAuthStore((state) => state.profileCompleted);
  const rehydrate          = useAuthStore((state) => state.rehydrate);

  useEffect(() => {
    rehydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderNavigator = () => {
    if (!isAuthenticated) { return <AuthNavigator />; }
    if (!profileCompleted) { return <CompleteProfileScreen />; }
    return <MainTabNavigator />;
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
    </NavigationContainer>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/navigation/RootNavigator.tsx
git commit -m "feat: route new users to CompleteProfileScreen when profileCompleted is false"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start Metro and run on Android**

```bash
npm start
# in a second terminal:
npm run android
```

- [ ] **Step 2: Test — `profileCompleted: true` path (existing user)**

The mock `AuthService.verifyOtp` response currently has no `profileCompleted` field. Confirm that after verifying OTP the app goes directly to the home tab (default `profileCompleted: true` in store applies).

- [ ] **Step 3: Temporarily mock `profileCompleted: false` to test new screen**

In `src/services/auth.service.ts` (or wherever the mock response is built), temporarily add `profileCompleted: false` to the mock `verifyOtp` response data. Verify OTP again and confirm the CompleteProfileScreen appears instead of home.

- [ ] **Step 4: Test CompleteProfileScreen interactions**

| Action                                   | Expected result                                                     |
| ---------------------------------------- | ------------------------------------------------------------------- |
| Tap "Complete Profile" with empty fields | First Name and Last Name errors appear                              |
| Fill First Name only, tap button         | Last Name error appears                                             |
| Fill both names, no email                | Button becomes active, label is "Complete Profile"                  |
| Type invalid email (e.g. `abc`)          | Amber warning "Please enter a valid email address"                  |
| Type valid email (`a@b.com`)             | "Verify Email" button slides in below email field                   |
| Tap "Verify Email"                       | 6 OTP slots appear below, keyboard focus moves to hidden OTP input  |
| Enter 6 digits in OTP slots              | Button label changes to "Verify & Save", button becomes active      |
| Tap "Verify & Save"                      | Spinner shows briefly, then app switches to MainTabNavigator (home) |
| Open keyboard                            | Header collapses smoothly                                           |
| Close keyboard                           | Header expands back                                                 |
| Dark mode                                | All surfaces use dark tokens correctly                              |

- [ ] **Step 5: Revert the temporary `profileCompleted: false` mock**

Remove the temporary mock change from `auth.service.ts` so the real API response field drives the behaviour going forward.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: verify complete-profile flow end-to-end"
```
