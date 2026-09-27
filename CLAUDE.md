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
index.js → App.tsx → AppProviders → RootNavigator → AuthNavigator | CompleteProfileScreen | MainTabNavigator
```

`App.tsx` (repo root) renders `src/components/providers/AppProviders.tsx` — `GestureHandlerRootView` → `KeyboardProvider` → `SafeAreaProvider` → `HeroUINativeProvider` — around the status bar and `RootNavigator`.

### Folder Structure

Modelled on the t-genius user frontend. Spec: `docs/superpowers/specs/2026-09-27-src-structure-design.md`. `__tests__/src-structure.test.ts` enforces it — if it fails, move the file; never loosen the test.

```
src/
├── app/                  # routing layer — navigators only, no UI
├── components/
│   ├── ui/               # design-system kit (token-only primitives)
│   ├── layout/           # app chrome — CustomTabBar
│   ├── providers/        # AppProviders
│   ├── custom/           # shared composites — PlaceholderScreen
│   └── pages/<feature>/  # screens: <Name>Screen.tsx, components/, hooks/, <sub-page>/
├── lib/
│   ├── api/              # api-client.ts, endpoints.ts, <domain>/<domain>-api.ts
│   ├── storage.ts        # MMKV
│   └── validation.ts
├── hooks/                # shared hooks — use-*.ts
├── store/                # Zustand — *.store.ts
├── types/                # *.types.ts, including every navigator ParamList
├── constants/            # leaf constants (avatars, layout)
├── data/                 # mock data + image maps (API seams)
└── assets/
```

Naming: folders kebab-case · components/screens `PascalCase.tsx` · hooks `use-kebab-case.ts` exporting `useCamelCase` · API modules `<domain>-api.ts` exporting `<domain>Api` · types `<domain>.types.ts` · stores `<name>.store.ts`.

Dependency direction (enforced on the resolved path, so `@/…` and `../…` spellings are checked alike): `store/` never imports UI; `lib/` never imports UI, stores or hooks; `types/` and `constants/` are leaves; `components/ui/` imports only `types/` and `constants/`; only `lib/api/` touches `api-client`; only `src/app/` and the root `App.tsx` import navigators. A component used by one page lives in that page's `components/`; used by several, it moves to `components/custom/` (or `ui/` if it is a token-only primitive).

### Navigation

All param lists live in `src/types/navigation.types.ts`; screens never import a navigator file.

- `src/app/RootNavigator.tsx` — `AuthNavigator` when signed out, `CompleteProfileScreen` until the profile is complete, otherwise `MainTabNavigator`. "Complete" is decided in `auth.store`: after OTP, the server's `profileCompleted` flag **or** both names on file; after a relaunch, both names only (whitespace counts as missing). `__tests__/auth-store.test.ts` pins this.
- `AuthNavigator` — native stack: Splash → Login → OtpVerification
- `MainTabNavigator` — bottom tabs with `CustomTabBar`: Home, Saved, Orders, Profile (Saved and Orders are placeholders)
- `ProfileNavigator` — the Profile tab's stack: ProfileMain → EditProfile (tab bar hidden on EditProfile)

### State Management

Zustand stores in `src/store/`:

- `auth.store.ts` — session: `isAuthenticated`, `user`, tokens, `profileCompleted`; `setAuth()`, `rehydrate()`, `updateUser()`, `logout()`. Persists to MMKV through `src/lib/storage.ts`.
- `cart.store.ts` — cart items, `totalItems()`, `totalAmount()`, `quantityOf()`
- `profile.store.ts` — device-local avatar choice (`src/constants/avatars.ts`)

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

Auth and profile talk to the real API: `src/lib/api/auth/auth-api.ts` (send/verify/resend OTP, logout) and `src/lib/api/user/user-api.ts` (GET/PATCH `/user/profile`), through the Axios instance in `src/lib/api/api-client.ts`. The planned stack for the rest of the backend integration: TanStack React Query v5 (data sync), Socket.IO Client (real-time orders).

**The home screen is mock-only by design.** Everything it renders comes from `src/data/menu.ts` (125 dishes) and `src/data/restaurant.ts` (hours, rating, ETA, distance). `HomeScreen`'s loading state is a `setTimeout`, not a request. There are no network calls anywhere in `src/components/pages/home/`. The profile screen's counts are mock too (`src/components/pages/profile/hooks/use-profile-counts.ts`).

When the API phase starts, these are the seams:

| Swap                                                                      | Keep                                                                                                                              |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| the bodies of `src/data/menu.ts` and `src/data/restaurant.ts`             | From `menu`: `CATEGORIES`, `byId`, `bestsellers()`, `byCategory()`. From `restaurant`: `isOpenAt()`, `SERVICE`, `OPENS_AT_LABEL`. |
| `HomeScreen`'s `isLoading` `setTimeout`                                   | the `SkeletonRail` it already gates                                                                                               |
| the `require()` values in `src/data/dish-images.ts`, swapped for API URLs | `DISH_IMAGES`' slug keys, and `ImageTile`, which renders either a bundled module or a URL                                         |
| the body of `useProfileCounts`                                            | its `ProfileCounts` return shape                                                                                                  |

`priceOf()` exists in `menu.ts` for deferred portion pricing (not yet active in the home screen) — preserve it during the swap even though the home screen does not yet import it.

New endpoints go in `src/lib/api/endpoints.ts` and a `src/lib/api/<domain>/<domain>-api.ts` module; wire types stay in `src/types/api.types.ts` and are mapped to app types inside the API module.

### Shared Data

Shared mock data lives in `src/data/` (`menu.ts`, `restaurant.ts`) and its types in `src/types/`. Page-only components live in `src/components/pages/<feature>/components/`; anything reusable belongs in `src/components/custom/` or, if it is a token-only primitive, `src/components/ui/`.

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

## After any dependency change, reset the Metro cache

Run `npm run start:reset` (not `npm start`) after anything that rewrites
`node_modules` — `npm install`, `npm ci`, a lockfile bump, a dependency upgrade.

`react-native-worklets` compiles its worklet "unpackers" into JS at build time
via its Babel plugin, and `libworklets.so` evaluates those strings at startup.
The two sides are version-locked. Metro's transform cache is keyed on file
contents, not on the installed plugin version, so after an upgrade it will
happily replay JS built by the _previous_ worklets plugin against the _new_
native library. The mismatch aborts the process on the JS thread before any app
code runs:

```
Fatal signal 6 (SIGABRT) in tid … (mqt_v_js)
Abort message: 'jsi.h: Object facebook::jsi::Value::getObject(Runtime &) &&:
                assertion "isObject()" failed'
  #02 libworklets.so  jsi::Value::getObject
  #03 worklets::UnpackerLoader::installUnpacker
```

It looks like a native/build failure, but the build is fine and Gradle reports
no error — only the JS is stale. `--reset-cache` is the fix; a Gradle clean is
not, and will cost a long rebuild for nothing.
