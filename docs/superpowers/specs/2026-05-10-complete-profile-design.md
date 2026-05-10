# Complete Profile Screen — Design Spec
Date: 2026-05-10

## Overview
After OTP verification, the API returns `profileCompleted: boolean`. When `false`, show a CompleteProfile screen to collect First Name, Last Name, and optional Email (with email OTP verification). When `true`, go directly to home.

## Auth Flow (Option B — Auth First)
`setAuth()` is called immediately regardless of `profileCompleted`. `RootNavigator` reads `profileCompleted` from the store and routes accordingly:

- `!isAuthenticated` → AuthNavigator
- `isAuthenticated && !profileCompleted` → CompleteProfileScreen (standalone, no tabs, no back)
- `isAuthenticated && profileCompleted` → MainTabNavigator

## State Changes

### `api.types.ts`
Add `profileCompleted: boolean` to `AuthResponse`.

### `auth.store.ts`
- Add `profileCompleted: boolean` to `AuthState` (default `true` so rehydrated sessions go straight to home)
- Add `setProfileCompleted(value: boolean)` action
- `setAuth()` reads `profileCompleted` from response and stores it

### `RootNavigator.tsx`
Add third branch: `isAuthenticated && !profileCompleted` renders `<CompleteProfileScreen />` inside `NavigationContainer`.

## CompleteProfile Screen

### Layout
Matches Login/OTP floating-card pattern:
- Collapsible brand-color header (animated on keyboard show/hide)
- Icon + title "Complete Your Profile"
- Floating white card (`rounded-t-[40px]`, card shadow)

### Fields
1. **First Name** — required, validates on blur, error shown inline
2. **Last Name** — required, validates on blur, error shown inline
3. **Email** — optional; live regex validation; when valid email typed, "Verify Email" button animates in; tapping it reveals 6 OTP slots below the field
4. **Email OTP slots** — same slot style as OtpVerificationScreen; 6-digit hidden TextInput pattern

### Button
- Label: "Complete Profile" (no email flow) / "Verify & Save" (email OTP active)
- Disabled until: firstName + lastName filled; if email OTP started, all 6 OTP digits also required
- On press (static): calls `setProfileCompleted(true)` → RootNavigator re-renders → MainTabNavigator

### Animations
- `SlideInDown` on card mount
- `FadeInUp` on header content
- `FadeIn`/height animation for email verify button and OTP slots

## Files Changed
- `src/types/api.types.ts` — add `profileCompleted`
- `src/store/auth.store.ts` — add flag + action
- `src/navigation/RootNavigator.tsx` — add third branch
- `src/features/auth/CompleteProfileScreen.tsx` — new screen (created)
