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

The app is **UI-only with mock data** — all API calls are simulated with `setTimeout`. Installed: `axios`, `react-native-mmkv`, and `react-native-config`. The planned stack for the backend integration phase: TanStack React Query v5 (data sync), Socket.IO Client (real-time orders).

**The home screen is mock-only by design.** Everything it renders comes from `src/data/menu.ts` (125 dishes) and `src/data/restaurant.ts` (hours, rating, ETA, distance). `HomeScreen`'s loading state is a `setTimeout`, not a request. There are no network calls anywhere in `src/features/home/`.

When the API phase starts, these are the seams:

| Swap | Keep |
| --- | --- |
| the bodies of `src/data/menu.ts` and `src/data/restaurant.ts` | From `menu`: `CATEGORIES`, `byId`, `bestsellers()`, `byCategory()`. From `restaurant`: `isOpenAt()`, `SERVICE`, `OPENS_AT_LABEL`. |
| `HomeScreen`'s `isLoading` `setTimeout` | the `SkeletonRail` it already gates |
| the `require()` values in `src/data/dish-images.ts`, swapped for API URLs | `DISH_IMAGES`' slug keys, and `ImageTile`, which renders either a bundled module or a URL |

`priceOf()` exists in `menu.ts` for deferred portion pricing (not yet active in the home screen) — preserve it during the swap even though the home screen does not yet import it.

### Feature Folder Convention

Screens live under `src/features/<feature-name>/`. Components shared across features go in `src/components/`. Types will go in `src/types/`.

Shared mock data lives in `src/data/` (`menu.ts`, `restaurant.ts`) and its types in `src/types/`. Home-only composition components live in `src/features/home/components/`; anything reusable belongs in `src/components/ui/`.

### Dish Photography

Photos are bundled in `src/assets/images/` and mapped to dishes by slug id in `src/data/dish-images.ts`. `menu.ts` attaches them in its `MENU.map`, so a dish's `image` is set purely by adding a key to that map.

Only a few dishes are shot. Anything absent from `DISH_IMAGES` renders `ImageTile`'s tinted cuisine tile instead, so an unphotographed dish is a complete card rather than a hole — never add a placeholder image for one.

Metro only bundles `jpg`, `jpeg`, `png`, `webp` and `gif`. `.avif` and `.jfif` are **not** in `assetExts`: convert them before adding, or the bundler silently fails to resolve the `require()`.

## Environment

`.env` at project root. `API_URL` and `ENVIRONMENT` are defined there.

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
