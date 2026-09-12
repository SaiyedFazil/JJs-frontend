# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Run on iOS simulator
npm run ios

# Lint
npm run lint

# Run tests
npm test
```

## Architecture

This is a **React Native CLI** app (v0.85, TypeScript strict mode) for a food ordering mobile experience.

### Entry Point Chain

```
index.js → App.tsx (providers) → RootNavigator → AuthNavigator | MainTabNavigator
```

`App.tsx` wraps everything in `GestureHandlerRootView`, `SafeAreaProvider`, and `HeroUINativeProvider` (which takes the current theme). The theme is driven by `useThemeStore` from Zustand.

### Navigation

- `src/navigation/RootNavigator.tsx` — switches between auth and main flows based on `useAuthStore().isAuthenticated`
- `AuthNavigator` — native stack: Splash → Login → OtpVerification
- `MainTabNavigator` — bottom tabs: Home, Menu, Orders, Profile

### State Management

Zustand stores in `src/store/`:

- `auth.store.ts` — `isAuthenticated`, `login()`, `logout()`, `skipAuth()`
- `cart.store.ts` — cart items, `totalItems()`

### Styling

Tailwind v4 via **Uniwind** (the React Native Tailwind adapter), with **HeroUI Native** on top. CSS entry point is `src/global.css`, configured in `metro.config.js`.

**`src/global.css` is the single source of truth** for every color, type style, spacing, radius and elevation value in the app. It is the only file permitted to contain a hex literal. Change a token there and it changes everywhere.

Design system: **JJ's Kitchen v1.0 (Charcoal + Ember)**. Spec: `docs/superpowers/specs/2026-09-06-design-system-v1-design.md`.

- Canvas `#FBF7F1` · hero/splash `#14100D` · action `#EC5B13`
- Type: Bricolage Grotesque (≥24px) + Plus Jakarta Sans (≤20px), bundled as static instances in `src/assets/fonts/` and linked via `npm run fonts:link`
- **One palette renders in both light and dark device schemes.** There is no theme store, no `dark:` variant, and no `-dark` token.
- Weight is selected by font family name (`font-jakarta-600`), never `fontWeight` — React Native cannot synthesize weights from a static face.
- `global.css` deliberately overrides HeroUI Native's own CSS variables (`--background`, `--accent`, `--field-*`, …). That is what rethemes all of its components at once, so do not wrap or restyle them individually.

Use the `src/components/ui/` primitives (`Text`, `Button`, `TextField`, `OtpInput`, `FoodCard`, `CategoryChip`, `QuantityStepper`, …) rather than restyling from scratch. Use Tailwind utility classes via Uniwind; do not use `StyleSheet.create` unless Tailwind cannot express the style (layout-only cases such as absolute positioning from runtime values).

`npm test` fails the build on any hardcoded hex, any `dark:` variant, or any color utility that does not resolve to a token. Its allowlist is empty and must stay empty — if new code needs a color, add a token to `global.css`.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and `babel.config.json` via `module-resolver`).

### Current State

The app is **UI-only with mock data** — all API calls are simulated with `setTimeout`. No HTTP client is installed yet. The planned stack for the backend integration phase: axios, TanStack React Query v5, Socket.IO Client (real-time orders), MMKV (persistence).

### Feature Folder Convention

Screens live under `src/features/<feature-name>/`. Components shared across features go in `src/components/`. Types will go in `src/types/`.

## Environment

`.env` at project root. `API_URL` and `ENVIRONMENT` are defined there. No `react-native-config` installed yet — when adding env var support, check README for the planned approach.

## Code Quality

ESLint (`@react-native` ruleset) + Prettier (single quotes, trailing commas) + Husky pre-commit hooks. Run `npm run lint` before committing if hooks don't fire.

## Android Requirements

- Java 17 (OpenJDK Temurin) — strictly required by Gradle
- Android Studio Panda 3 (2025.3.3)
- Node ≥ 22.11.0
- Min SDK: API 26 (Android 8.0)

## Android APk

- cd android
- ./gradlew clean
- ./gradlew assembleRelease

## for run in local after apk

- adb uninstall com.jjskitchen.app
- npm run android
