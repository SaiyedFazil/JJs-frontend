# `src/` Structure Refactor — Design

- **Date:** 2026-09-27
- **Branch:** `refactor/src-structure` (off `dev`)
- **Status:** Approved in conversation, section by section. Awaiting review of this written spec.
- **Reference project:** `D:\t-genius\t-genius-frontend\apps\t-genius-user-frontend\src`

## 1. Goal

Reorganise `src/` so it follows the conventions of the t-genius user frontend, making the app easier to understand, maintain and extend. The same mental model will then apply across both projects.

**Hard constraint:** nothing about the app's functionality, logic or design changes. Every change in this spec is one of the following:

- a file move;
- a rename;
- a type-only change;
- a verbatim extraction of existing code into a named module.

No JSX, `className`, style value, user-facing string, timing constant or store logic is rewritten.

## 2. What was wrong with the current structure

| Problem | Where |
| --- | --- |
| API code is spread over three unrelated folders. | `api/`, `services/`, `utils/storage.ts` |
| Navigation param types are copy-pasted or untyped. | `RootStackParamList` is redefined in `LoginScreen` and `OtpVerificationScreen`; `SplashScreen` uses `NavigationProp<any>` |
| Screens import a navigator file to get a type. | `ProfileScreen` and `EditProfileScreen` both import from `navigation/ProfileNavigator` |
| Screens import a component file to get a number. | `TAB_BAR_HEIGHT` is imported from `components/navigation/CustomTabBar` |
| A store depends on a feature folder. | `store/profile.store.ts` imports from `features/profile/avatars` |
| The same regex exists in two places. | Email regex in `EditProfileScreen` and `complete-profile/index.tsx` |
| Screens of around 300 lines mix native side effects with JSX. | OTP (SMS consent, resend timer), Login (phone hint), Edit Profile (fetch, form, save) |
| Types for a single domain live in three places. | `StoredUserProfile` is in `utils/storage`; `UserProfile` and `UpdateProfilePayload` are in `services/user.service` |

## 3. Reference conventions adopted

These conventions are taken from t-genius:

| t-genius | Role | Adopted here as |
| --- | --- | --- |
| `app/` | Routing layer, kept thin | `src/app/`, containing the navigators (the React Native equivalent of Next's route folder) |
| `components/pages/<feature>/` | Page content per feature, with `components/`, `hooks/` and sub-page folders | `src/components/pages/<feature>/` |
| `components/ui/` | Primitives | `src/components/ui/` (unchanged) |
| `components/layout/` | App chrome | `src/components/layout/` |
| `components/providers/` | Context providers | `src/components/providers/` |
| `components/custom/` | Shared composites | `src/components/custom/` |
| `lib/api/<domain>/<domain>-api.ts` | One API module per domain | Same |
| `lib/axios.ts`, `lib/utils/`, `lib/validation.ts` | Infrastructure | `lib/api/api-client.ts`, `lib/storage.ts`, `lib/validation.ts` |
| `hooks/use-*.ts` | Shared hooks | Same |
| `types/<domain>.types.ts` | Types per domain | Same |
| `constants/` | App-wide constants | Same |

**Naming rules:**

- Folders use kebab-case.
- Components and screens use `PascalCase.tsx`.
- Hook files use `use-kebab-case.ts` and export `useCamelCase`.
- API modules are named `<domain>-api.ts` and export a `<domain>Api` object.
- Type files are named `<domain>.types.ts`.
- Stores are named `<name>.store.ts`.
- `components/ui/` keeps its existing PascalCase files. Renaming 25 working primitives would add churn and no value.

## 4. Target tree

```
App.tsx                            # stays at root: index.js imports it and the token guard scans it
src/
├── app/                           # routing layer — navigators only, no UI
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── ProfileNavigator.tsx
├── components/
│   ├── ui/                        # design-system kit — UNCHANGED
│   ├── layout/
│   │   └── CustomTabBar.tsx
│   ├── providers/
│   │   └── AppProviders.tsx
│   ├── custom/
│   │   └── PlaceholderScreen.tsx
│   └── pages/
│       ├── auth/
│       │   ├── components/BrandMark.tsx
│       │   ├── splash/SplashScreen.tsx
│       │   ├── login/
│       │   │   ├── LoginScreen.tsx
│       │   │   └── hooks/use-phone-number-hint.ts
│       │   ├── otp-verification/
│       │   │   ├── OtpVerificationScreen.tsx
│       │   │   └── hooks/
│       │   │       ├── use-resend-timer.ts
│       │   │       └── use-sms-otp-autofill.ts
│       │   └── complete-profile/
│       │       ├── CompleteProfileScreen.tsx
│       │       └── components/
│       │           ├── NameStep.tsx
│       │           └── EmailStep.tsx
│       ├── home/
│       │   ├── HomeScreen.tsx
│       │   └── components/        # the 10 existing home components, unchanged
│       └── profile/
│           ├── ProfileScreen.tsx
│           ├── edit-profile/
│           │   ├── EditProfileScreen.tsx
│           │   └── hooks/use-edit-profile.ts
│           ├── components/        # the 9 existing profile components, unchanged
│           └── hooks/use-profile-counts.ts
├── lib/
│   ├── api/
│   │   ├── api-client.ts
│   │   ├── endpoints.ts
│   │   ├── auth/auth-api.ts
│   │   └── user/user-api.ts
│   ├── storage.ts
│   └── validation.ts
├── hooks/
│   └── use-app-toast.ts
├── store/
│   ├── auth.store.ts
│   ├── cart.store.ts
│   └── profile.store.ts
├── types/
│   ├── api.types.ts
│   ├── menu.types.ts
│   ├── user.types.ts
│   └── navigation.types.ts
├── constants/
│   ├── avatars.ts
│   └── layout.ts
├── data/                          # UNCHANGED — mock data and image maps (the documented API seams)
├── assets/                        # UNCHANGED
├── global.css                     # UNCHANGED path (metro.config.js)
├── env.d.ts                       # UNCHANGED
└── uniwind-types.d.ts             # UNCHANGED path (metro.config.js)
```

The following folders are removed once they are empty: `src/api/`, `src/services/`, `src/utils/`, `src/navigation/`, `src/features/`, `src/components/common/` and `src/components/navigation/`.

### 4.1 Complete file mapping

| From (`src/…`) | To (`src/…`) | Content change |
| --- | --- | --- |
| `navigation/RootNavigator.tsx` | `app/RootNavigator.tsx` | Imports |
| `navigation/AuthNavigator.tsx` | `app/AuthNavigator.tsx` | Imports; typed with `AuthStackParamList` |
| `navigation/MainTabNavigator.tsx` | `app/MainTabNavigator.tsx` | Imports; typed with `MainTabParamList` |
| `navigation/ProfileNavigator.tsx` | `app/ProfileNavigator.tsx` | Imports; `ProfileStackParamList` moves out to `types/` |
| `components/navigation/CustomTabBar.tsx` | `components/layout/CustomTabBar.tsx` | `TAB_BAR_HEIGHT` moves to `constants/layout.ts` and is imported back |
| `components/common/PlaceholderScreen.tsx` | `components/custom/PlaceholderScreen.tsx` | None |
| — (from `App.tsx`) | `components/providers/AppProviders.tsx` | New file; content lifted from `App.tsx` |
| `features/auth/BrandMark.tsx` | `components/pages/auth/components/BrandMark.tsx` | None |
| `features/auth/SplashScreen.tsx` | `components/pages/auth/splash/SplashScreen.tsx` | Imports; navigation typed |
| `features/auth/LoginScreen.tsx` | `components/pages/auth/login/LoginScreen.tsx` | Imports; navigation typed; phone-hint hook extracted |
| `features/auth/OtpVerificationScreen.tsx` | `components/pages/auth/otp-verification/OtpVerificationScreen.tsx` | Imports; navigation typed; two hooks extracted |
| `features/auth/complete-profile/index.tsx` | `components/pages/auth/complete-profile/CompleteProfileScreen.tsx` | Imports; `EMAIL_REGEX` imported |
| `features/auth/complete-profile/NameStep.tsx` | `components/pages/auth/complete-profile/components/NameStep.tsx` | Imports |
| `features/auth/complete-profile/EmailStep.tsx` | `components/pages/auth/complete-profile/components/EmailStep.tsx` | Imports |
| `features/home/HomeScreen.tsx` | `components/pages/home/HomeScreen.tsx` | Imports |
| `features/home/components/*` (10) | `components/pages/home/components/*` | Imports |
| `features/profile/ProfileScreen.tsx` | `components/pages/profile/ProfileScreen.tsx` | Imports |
| `features/profile/EditProfileScreen.tsx` | `components/pages/profile/edit-profile/EditProfileScreen.tsx` | Imports; logic extracted to a hook |
| `features/profile/components/*` (9) | `components/pages/profile/components/*` | Imports |
| `features/profile/profile-mock.ts` | `components/pages/profile/hooks/use-profile-counts.ts` | None |
| `features/profile/avatars.ts` | `constants/avatars.ts` | None |
| `api/apiClient.ts` | `lib/api/api-client.ts` | Imports |
| `api/endpoints.ts` | `lib/api/endpoints.ts` | None |
| `services/auth.service.ts` | `lib/api/auth/auth-api.ts` | `AuthService` → `authApi`; imports |
| `services/user.service.ts` | `lib/api/user/user-api.ts` | `UserService` → `userApi`; two types move to `types/user.types.ts` |
| `utils/storage.ts` | `lib/storage.ts` | `StoredUserProfile` moves to `types/user.types.ts` |
| `hooks/useAppToast.tsx` | `hooks/use-app-toast.ts` | None (the file contains no JSX) |
| `types/menu.ts` | `types/menu.types.ts` | None |
| — | `types/user.types.ts` | New file, made of moved types |
| — | `types/navigation.types.ts` | New file |
| — | `constants/layout.ts` | New file, made of a moved constant |
| — | `lib/validation.ts` | New file, made of a de-duplicated constant |

`components/ui/*`, `data/*`, `assets/*`, `store/cart.store.ts`, `store/profile.store.ts` (imports only), `types/api.types.ts`, `global.css`, `env.d.ts` and `uniwind-types.d.ts` keep their paths.

## 5. Behavior-preserving refactors

### A. Single sources of truth

**A1. `types/navigation.types.ts`**

```ts
export type AuthStackParamList = {
  Splash: undefined;
  Login: { prefillPhone?: string } | undefined;
  OtpVerification: { phone: string; authToken: string };
};

export type ProfileStackParamList = {
  ProfileMain: { toast?: string } | undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Saved: undefined;
  Orders: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
```

- `Login` gains `| undefined` because it is the initial route and receives no params. The existing code already reads `route.params?.prefillPhone`, so the type now matches the runtime.
- The navigators use these types in `createNativeStackNavigator<…>()` and `createBottomTabNavigator<…>()`.
- The screens drop their private `RootStackParamList` copies and `NavigationProp<any>`.
- The `ProfileStackParamList` doc comment moves with the type.
- This change is type-only and emits no runtime code.

**A2. `lib/validation.ts`**

- Exports `EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- The "deliberately permissive — the server is the authority on deliverability" comment moves with it.
- The two existing copies are byte-identical.

**A3. `constants/layout.ts`**

- Exports `TAB_BAR_HEIGHT = 94`, with its explanatory comment.
- `CustomTabBar`, `HomeScreen` and `ProfileScreen` import it from here.

**A4. `constants/avatars.ts`**

- `AvatarPreset`, `AVATARS`, `DEFAULT_AVATAR_ID` and `avatarAt` move here verbatim.
- The move removes the `store/` → `features/` dependency.

**A5. `types/user.types.ts`**

- Contains `StoredUserProfile` (from storage), and `UserProfile` and `UpdateProfilePayload` (from the user service), with their comments.
- The wire types (`UserProfilePayload`, `ProfileApiResponse`, `ApiResponse`, `AuthResponse`) stay in `api.types.ts`.

**A6. `hasFullName(profile)` in `auth.store.ts`**

- A private, unexported helper that returns `Boolean(hasFirstName) && Boolean(hasLastName)`, using the existing trim-and-length checks.
- `setAuth` keeps `Boolean(profileCompleted) || hasFullName(profile)`.
- `rehydrate` keeps `hasFullName(profile)`.
- The boolean expressions are unchanged; they are only factored out.

### B. API layer

- `authApi` keeps the same four methods as `AuthService`: `sendOtp`, `verifyOtp`, `resendOtp` and `logout`.
- `userApi` keeps the same two methods as `UserService`: `getProfile` and `updateProfile`.
- Endpoints, headers, `fromWire`, `unwrap` and the interceptors are unchanged.
- `api-client.ts` keeps `export default apiClient`.
- Every call site is updated: the Login, OTP, Complete Profile and Edit Profile screens, and `auth.store`.

### C. Hook extractions

In every extraction the hook body is the original code, moved verbatim. The only differences are that its inputs arrive as parameters and its outputs are returned.

| Hook | Contract | Carried over exactly |
| --- | --- | --- |
| `useResendTimer()` | Returns `{ resendTimer, canResend, startResendTimer }` | 60s start, 1000ms interval, `timerRef`, the start-on-mount effect, and the clear-on-unmount cleanup |
| `useSmsOtpAutofill(onCode: (code: string) => void)` | Android only; no return value | `SmsRetrieverModule` start, `onSmsReceived` and `onSmsTimeout` listeners, the `/\d{6}/` match, `Keyboard.dismiss()`, the console logs, and removing subscriptions plus `stopSmsRetriever?.()` on unmount. The screen passes a callback that calls `setOtp`. |
| `usePhoneNumberHint({ skip, onNumber })` | Android only; no return value | The `PhoneNumberHintModule` guard, skip when prefilled, the 500ms delay, stripping non-digits, the `>= 10` check, `slice(-10)`, the console log, and clearing the timeout on unmount |
| `useEditProfile()` | Returns every value and handler the JSX currently reads | All state, the `isDirty` and `toastRef` refs, the GET effect with its `isActive` guard, `edit()`, `hasChanges` and `handleSave`, moved as one block. The screen keeps only JSX and navigation. |

Two details keep the OTP split safe:

- The OTP screen's keyboard-hide listener and its 800ms autofocus stay in the screen, as a mount effect of their own.
- Splitting the original single mount effect into two mount effects changes only the order in which listeners are registered on mount. Nothing observable depends on that order.

### D. Providers

- `AppProviders({ children })` renders the provider stack, moved verbatim with its comments and `StyleSheet`, around `children`:
  - `GestureHandlerRootView`
  - `KeyboardProvider` (all three flags)
  - `SafeAreaProvider`
  - `HeroUINativeProvider` (same config)
  - `View` (`flex: 1`)
- `App.tsx` keeps `import './src/global.css'` and renders `<AppProviders>`, wrapping `<StatusBar …/>` and `<RootNavigator/>`.
- The rendered element tree is identical.

### Explicitly out of scope

- Any change to `components/ui/`, including deleting the roughly 15 primitives nothing imports yet (`FoodCard`, `OrderTimeline`, …). They are part of the design-system kit.
- Any change to `data/` or `global.css`.
- Renaming any exported component.
- Further decomposition of `HomeScreen`, `ProfileScreen` or `CompleteProfileScreen`, which are already composed from components.
- Route-name constants, React Query and new barrels.

## 6. Execution

The work happens on branch `refactor/src-structure` as eight commits. Each commit is independently green.

1. **Foundations:** `types/` (user, navigation, `menu` → `menu.types`), `constants/`, `lib/validation.ts`
2. **`lib/` layer:** API client, endpoints, `auth-api`, `user-api`, storage, and `hasFullName` in `auth.store`; delete `api/`, `services/` and `utils/`
3. **Hooks:** `use-app-toast.ts`
4. **Components:** `layout/`, `custom/` and `providers/`, and slim `App.tsx`
5. **Auth pages:** move the auth screens, then extract the three auth hooks
6. **Home pages:** move only
7. **Profile pages:** move the profile screens, extract `use-edit-profile`, and add `use-profile-counts`; delete `features/`
8. **Routing and docs:** `app/` navigators (typed), `CLAUDE.md` and the memory notes

- Files are moved with `git mv`, so `git log --follow` keeps their history.
- Where practical, moves and content edits go in separate commits, so moved files diff as clean renames.

## 7. Verification

**Baseline, measured on `dev` at `3ccd692` before any change:**

- `tsc --noEmit` reports 0 errors.
- Jest passes 378 of 378 tests across 4 suites.
- ESLint is clean.

**Gates after every commit:**

1. `npx tsc --noEmit` reports 0 errors. This catches every stale import and navigation-type mismatch.
2. `npm test` passes 378 of 378. The design-token guard walks `src/` recursively, so the new folders are scanned automatically; neither allowlist changes.
3. `npm run lint` is clean.
4. `grep` finds no remaining import of `@/features`, `@/services`, `@/api/`, `@/utils/`, `@/navigation`, `components/common` or `components/navigation`, in `src/`, `App.tsx` or `__tests__/`.

**Final gate, a manual device pass:**

- Run `npm run start:reset`, then `npm run android`, and walk through each flow:
  1. Splash
  2. Login, including the phone-number hint
  3. OTP: auto-verify on the sixth digit, resend countdown and resend, SMS autofill, and back to Login with the phone prefilled
  4. Complete profile, both steps
  5. Home
  6. Profile
  7. Edit profile: load, dirty-edit during load, validation, save, and the return toast
  8. Avatar sheet
  9. Logout
- These flows depend on native modules and timers that no automated test covers, and that is exactly where the hook extractions land. The user's sign-off on this pass is the acceptance criterion.

**Limit of the guarantee:** the repo has no screen-render or navigation tests. "Behavior unchanged" therefore rests on three things: the typecheck, the verbatim nature of every move, and the device pass.

## 8. Documentation

- **`CLAUDE.md`:**
  - Rewrite Architecture, Entry Point Chain, Navigation, State Management, Feature Folder Convention, Current State and Dish Photography to use the new paths and naming rules.
  - Correct the stale claim that the app is "UI-only, all API calls simulated": auth and profile already call the real API, while home and profile counts remain mock.
- **Memory notes** (`home-is-mock-until-api-phase`, `imagetile-defers-photography`): repoint any `src/` paths.
- **`docs/superpowers/plans/*` and `docs/superpowers/specs/*` (earlier dates):** left untouched. They are dated historical records.
