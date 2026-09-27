# `src/` Structure Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise `src/` into the t-genius-user-frontend layout without changing a single behavior, style or string in the app.

**Architecture:**

- The routing layer (navigators) moves to `src/app/`.
- Screens move to `src/components/pages/<feature>/`, with page-local `components/` and `hooks/`.
- Infrastructure moves to `src/lib/`: the API client and per-domain `*-api.ts` modules, MMKV storage and validation.
- Shared types go in `src/types/*.types.ts`, and leaf constants go in `src/constants/`.
- A new Jest architecture test locks the layout in: retired paths, retired imports, single sources of truth and layer rules. Every task starts by extending that test so it fails, then moves code until it passes.

**Tech Stack:** React Native 0.86 CLI, TypeScript (strict), Zustand 5, React Navigation 7, Uniwind/HeroUI Native, Jest 29 (`@react-native/jest-preset`), ESLint and Prettier. The `@/*` alias maps to `src/*` in both `tsconfig.json` and `babel.config.json`.

**Spec:** `docs/superpowers/specs/2026-09-27-src-structure-design.md`. Read it first. Its §4.1 table is the authoritative from → to mapping.

## Global Constraints

- **No behavior change.** No JSX, `className`, style value, user-facing string, timing constant, request body, header or store logic may change. Code is moved, renamed, typed, or extracted verbatim.
- Work on branch `refactor/src-structure`, which already exists (created off `dev`, with the spec committed).
- Every commit must pass the **gate**: `npx tsc --noEmit` with 0 errors, `npx jest` with all tests passing, and `npm run lint` with no errors or warnings. The baseline before Task 1 is 0 tsc errors, 378 of 378 tests and a clean lint.
- Move files with `git mv` (never delete and re-create) so `git log --follow` keeps their history.
- **Naming rules:**
  - Folders are kebab-case.
  - Components and screens are `PascalCase.tsx`.
  - Hooks are `use-kebab-case.ts` and export `useCamelCase`.
  - API modules are `<domain>-api.ts` and export `<domain>Api`.
  - Types are `<domain>.types.ts`, and stores are `<name>.store.ts`.
- **Must not change:**
  - Anything in `src/components/ui/`, `src/data/`, `src/assets/` or `src/global.css`.
  - The paths of `src/global.css`, `src/uniwind-types.d.ts` and `src/assets/fonts` (`metro.config.js` and `react-native.config.js` point at them).
  - `App.tsx` stays at the repo root.
- **No new dependencies.** A dependency change would force `npm run start:reset` and is out of scope.
- **Formatting:** after writing or editing files, run `npx prettier --write` on them before the gate, because Prettier runs inside ESLint.
- **Shell:** use Git Bash, with commands run from the repo root `D:\JJs\JJs-Kitchen-App`. The import-rewrite helper used by several tasks is below. Define it in each shell session where it's needed. It rewrites a quoted specifier everywhere in `src/`, `App.tsx` and `__tests__/`:

  ```bash
  rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
  ```

  Always pass the specifier **with its quotes** (for example `"'@/types/menu'"`). The quotes stop a rewrite from matching a longer path such as `'@/types/menu.types'`.
- **Coordination:** other branches such as `dev-zibran` may still add files under `src/features/`. The architecture test fails loudly if a later merge resurrects a retired path. When that happens, move the file per the spec; do not loosen the test.

## Review Focus

The tests described in each bullet are added to the task that owns the code:

- **Profile-completion routing after login and after relaunch.**
  - `setAuth` trusts the server's `profileCompleted` flag *or* the presence of both names.
  - `rehydrate` ignores the flag and checks the names alone.
  - Whitespace-only names count as missing.
  - The `hasFullName` refactor must keep exactly this asymmetry, or users get bounced into Complete Profile, or skip it. This is pinned by `__tests__/auth-store.test.ts` (Task 2).
- **Logout on a shared device.** Tokens and the chosen avatar must be wiped even when the server's logout call fails. Also pinned by `__tests__/auth-store.test.ts` (Task 2).
- **OTP requests after the `AuthService` → `authApi` rename.**
  - The pre-verify token must still override the stored bearer on verify and resend.
  - Request bodies must stay snake_case.
  - Pinned by `__tests__/auth-api.test.ts` (Task 2).
- **Profile wire mapping.**
  - snake_case must still become camelCase.
  - A `success: false` body must still throw, with the server's message or `'Profile request failed'`.
  - Pinned by `__tests__/user-api.test.ts` (Task 2).
- **A later merge re-creating a retired folder or import** (for example a `dev-zibran` file under `features/`). Pinned permanently by `__tests__/src-structure.test.ts` (Task 1 onward).

**Not coverable by Jest** (there's no renderer installed, and native modules are involved), so these are covered by the device pass in Task 8:

- SMS autofill
- The phone-number hint
- OTP auto-submit on the sixth digit
- The resend countdown
- Edit Profile's "typed before the GET landed" protection

---

### Task 1: Architecture guard + foundations (types, constants, validation)

**Files:**
- Create: `__tests__/src-structure.test.ts`
- Rename: `src/types/menu.ts` → `src/types/menu.types.ts`
- Rename: `src/features/profile/avatars.ts` → `src/constants/avatars.ts`
- Create: `src/types/user.types.ts`, `src/types/navigation.types.ts`, `src/constants/layout.ts`, `src/lib/validation.ts`
- Modify: `src/utils/storage.ts`, `src/services/user.service.ts`, `src/store/auth.store.ts`, `src/store/profile.store.ts`, `src/navigation/ProfileNavigator.tsx`, `src/components/navigation/CustomTabBar.tsx`, `src/features/home/HomeScreen.tsx`, `src/features/profile/ProfileScreen.tsx`, `src/features/profile/EditProfileScreen.tsx`, `src/features/profile/components/Avatar.tsx`, `src/features/profile/components/AvatarSheet.tsx`, `src/features/auth/complete-profile/index.tsx`, and every file importing `@/types/menu`

**Interfaces:**
- Produces:
  - `EMAIL_REGEX: RegExp` (`@/lib/validation`)
  - `TAB_BAR_HEIGHT = 94` (`@/constants/layout`)
  - `AvatarPreset`, `AVATARS`, `DEFAULT_AVATAR_ID`, `avatarAt(id)` (`@/constants/avatars`)
  - `StoredUserProfile`, `UserProfile`, `UpdateProfilePayload` (`@/types/user.types`)
  - `AuthStackParamList`, `ProfileStackParamList`, `MainTabParamList` (`@/types/navigation.types`)
  - Menu types at `@/types/menu.types`
  - The architecture test's five tables: `RETIRED_PATHS`, `REQUIRED_PATHS`, `RETIRED_IMPORTS`, `SINGLE_SOURCE` and `LAYER_RULES`. Later tasks append to them.

- [ ] **Step 1: Write the failing architecture test**

Create `__tests__/src-structure.test.ts`:

```ts
import fs from 'fs';
import path from 'path';

/**
 * Architecture guard for the src/ layout.
 * Spec: docs/superpowers/specs/2026-09-27-src-structure-design.md
 *
 * The folder structure is a contract: where a file lives says what it may
 * depend on. tsc proves imports resolve; this proves they point the right
 * way, that each shared value has exactly one home, and that retired
 * locations stay retired when older branches are merged in.
 */
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const TESTS = path.join(ROOT, '__tests__');
const SELF = path.basename(__filename);

/** Locations (relative to src/) the restructure retired. Nothing may reappear there. */
const RETIRED_PATHS: string[] = [
  'types/menu.ts',
  'features/profile/avatars.ts',
];

/** Locations (relative to src/) the structure promises. */
const REQUIRED_PATHS: string[] = [
  'types/menu.types.ts',
  'types/user.types.ts',
  'types/navigation.types.ts',
  'constants/avatars.ts',
  'constants/layout.ts',
  'lib/validation.ts',
];

/** Import specifiers that point at retired locations, however they are spelled. */
const RETIRED_IMPORTS: RegExp[] = [
  /['"][^'"]*types\/menu['"]/,
  /['"][^'"]*features\/profile\/avatars['"]/,
  /['"]\.\.\/avatars['"]/,
  /import type \{ ProfileStackParamList \} from ['"][^'"]*ProfileNavigator['"]/,
];

/** Values and types that must be defined in exactly one file. */
const SINGLE_SOURCE: { what: string; needle: string | RegExp; file: string }[] =
  [
    {
      what: 'the email regex',
      needle: String.raw`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`,
      file: 'lib/validation.ts',
    },
    {
      what: 'TAB_BAR_HEIGHT',
      needle: 'export const TAB_BAR_HEIGHT',
      file: 'constants/layout.ts',
    },
    {
      what: 'StoredUserProfile',
      needle: /interface StoredUserProfile\s*\{/,
      file: 'types/user.types.ts',
    },
    {
      what: 'UserProfile',
      needle: /interface UserProfile\s*\{/,
      file: 'types/user.types.ts',
    },
    {
      what: 'UpdateProfilePayload',
      needle: /interface UpdateProfilePayload\s*\{/,
      file: 'types/user.types.ts',
    },
    {
      what: 'AVATARS',
      needle: /export const AVATARS\b/,
      file: 'constants/avatars.ts',
    },
    {
      what: 'AuthStackParamList',
      needle: /type AuthStackParamList\s*=/,
      file: 'types/navigation.types.ts',
    },
    {
      what: 'ProfileStackParamList',
      needle: /type ProfileStackParamList\s*=/,
      file: 'types/navigation.types.ts',
    },
    {
      what: 'MainTabParamList',
      needle: /type MainTabParamList\s*=/,
      file: 'types/navigation.types.ts',
    },
  ];

/** What each layer (a folder prefix relative to src/) must never import. */
const LAYER_RULES: { layer: string; forbidden: RegExp; why: string }[] = [
  {
    layer: 'store/',
    forbidden: /from\s+['"]@\/(?:app|components|features)\//,
    why: 'stores hold state; UI depends on them, never the reverse',
  },
  {
    layer: 'types/',
    forbidden: /from\s+['"]@\/(?!types\/)/,
    why: 'types are leaves: they may only import other types',
  },
  {
    layer: 'constants/',
    forbidden: /from\s+['"]@\//,
    why: 'constants are leaves',
  },
  {
    layer: 'components/ui/',
    forbidden: /from\s+['"]@\/(?!types\/|constants\/)/,
    why: 'the design-system kit knows nothing about screens, stores or the API',
  },
  {
    layer: 'lib/',
    forbidden: /from\s+['"]@\/(?:app|components|features|store|hooks)\//,
    why: 'lib is infrastructure: it must not reach up into UI or state',
  },
];

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'node_modules') continue;
      collect(path.join(dir, entry.name), out);
      continue;
    }
    if (/\.tsx?$/.test(entry.name)) out.push(path.join(dir, entry.name));
  }
  return out;
}

/** src/**\/*.ts(x) plus the root App.tsx, as paths relative to src/. */
function sourceFiles(): { rel: string; abs: string }[] {
  const files = collect(SRC).map(abs => ({
    rel: path.relative(SRC, abs).split(path.sep).join('/'),
    abs,
  }));
  files.push({ rel: '../App.tsx', abs: path.join(ROOT, 'App.tsx') });
  return files;
}

/** Source files plus every other test (tests import src/ by relative path). */
function importingFiles(): { rel: string; abs: string }[] {
  const tests = fs
    .readdirSync(TESTS)
    .filter(f => /\.tsx?$/.test(f) && f !== SELF)
    .map(f => ({ rel: `../__tests__/${f}`, abs: path.join(TESTS, f) }));
  return [...sourceFiles(), ...tests];
}

function hits(abs: string, pattern: RegExp): string[] {
  return fs
    .readFileSync(abs, 'utf8')
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, n }) => `${n}: ${line.trim()}`);
}

describe('src/ structure', () => {
  it.each(RETIRED_PATHS)('src/%s is retired', rel => {
    expect(fs.existsSync(path.join(SRC, rel))).toBe(false);
  });

  it.each(REQUIRED_PATHS)('src/%s exists', rel => {
    expect(fs.existsSync(path.join(SRC, rel))).toBe(true);
  });

  it.each(RETIRED_IMPORTS)('nothing imports a retired path (%s)', pattern => {
    const offenders = importingFiles().flatMap(({ rel, abs }) =>
      hits(abs, pattern).map(h => `${rel}:${h}`),
    );
    expect(offenders).toEqual([]);
  });

  it.each(SINGLE_SOURCE)('$what is defined only in src/$file', ({ needle, file }) => {
    const owners = sourceFiles()
      .filter(({ abs }) => {
        const src = fs.readFileSync(abs, 'utf8');
        return typeof needle === 'string' ? src.includes(needle) : needle.test(src);
      })
      .map(({ rel }) => rel);
    expect(owners).toEqual([file]);
  });

  it.each(LAYER_RULES)('$layer respects its layer ($why)', ({ layer, forbidden }) => {
    const offenders = sourceFiles()
      .filter(({ rel }) => rel.startsWith(layer))
      .flatMap(({ rel, abs }) => hits(abs, forbidden).map(h => `${rel}:${h}`));
    expect(offenders).toEqual([]);
  });

  it('only the routing layer (src/app/) imports navigators from @/app', () => {
    const offenders = sourceFiles()
      .filter(({ rel }) => !rel.startsWith('app/'))
      .flatMap(({ rel, abs }) =>
        hits(abs, /from\s+['"]@\/app\//).map(h => `${rel}:${h}`),
      );
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails for the right reasons**

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL. The failures should be:
- `src/types/menu.ts is retired` and `src/features/profile/avatars.ts is retired`.
- Every `REQUIRED_PATHS` entry.
- The `types/menu` and `../avatars` import checks.
- Every `SINGLE_SOURCE` row. The email regex has two owners today; TAB_BAR_HEIGHT sits in the tab bar; the types and avatars have no owner in the new location yet.
- The `store/` layer rule, because `profile.store.ts` imports `@/features/profile/avatars`.
- The `ProfileNavigator` type-import check, because `ProfileScreen` and `EditProfileScreen` import `ProfileStackParamList` from the navigator file.

Only the `@/app` check passes at this point, because `src/app/` does not exist yet.

- [ ] **Step 3: Move menu types and avatars**

```bash
git mv src/types/menu.ts src/types/menu.types.ts
mkdir -p src/constants src/lib
git mv src/features/profile/avatars.ts src/constants/avatars.ts
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "'@/types/menu'" "'@/types/menu.types'"
rewrite "'../avatars'" "'@/constants/avatars'"
rewrite "'@/features/profile/avatars'" "'@/constants/avatars'"
```

Then fix the two comments that name the old avatar path:

- In `src/store/profile.store.ts`, replace `/** Index into AVATARS (src/features/profile/avatars.ts). */` with `/** Index into AVATARS (src/constants/avatars.ts). */`.
- In `src/utils/storage.ts`, replace ` * The chosen preset avatar, as an index into AVATARS (src/features/profile).` with ` * The chosen preset avatar, as an index into AVATARS (src/constants/avatars.ts).`.

- [ ] **Step 4: Create `src/lib/validation.ts` and use it in both screens**

```ts
/**
 * Email shape check. Deliberately permissive — the server is the authority on
 * deliverability; this only catches what is obviously not an address.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

In `src/features/profile/EditProfileScreen.tsx`:
- Delete these two lines:
  ```ts
  /** Deliberately permissive — the server is the authority on deliverability. */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  ```
- Add `import { EMAIL_REGEX } from '@/lib/validation';` after the `useAppToast` import.
- Replace `!trimmedEmail || EMAIL.test(trimmedEmail)` with `!trimmedEmail || EMAIL_REGEX.test(trimmedEmail)`.

In `src/features/auth/complete-profile/index.tsx`:
- Delete `const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;` and the blank line after it.
- Add `import { EMAIL_REGEX } from '@/lib/validation';` after the `UserService` import.

- [ ] **Step 5: Create `src/constants/layout.ts` and repoint the tab-bar height**

```ts
/**
 * The custom tab bar's full on-screen footprint, excluding the safe-area
 * inset the dock adds on top via `paddingBottom: insets.bottom + DOCK_GAP`:
 *
 *   dock paddingTop (styles.dock)            10
 *   pill height (PILL_HEIGHT)                72
 *   DOCK_GAP below the pill                  12
 *                                            ---
 *                                            94
 *
 * Screens add insets.bottom to this to clear the pill entirely. The three
 * terms are private to src/components/layout/CustomTabBar.tsx — check this
 * arithmetic against that file before changing either side.
 */
export const TAB_BAR_HEIGHT = 94;
```

In `src/components/navigation/CustomTabBar.tsx`, replace the whole block from the comment line `/**` above ` * The bar's full on-screen footprint, excluding the safe-area inset the dock` down to and including `export const TAB_BAR_HEIGHT = 94;` with:

```ts
/**
 * TAB_BAR_HEIGHT (src/constants/layout.ts) is this bar's footprint:
 * styles.dock paddingTop + PILL_HEIGHT + DOCK_GAP. Change any of the three
 * and update it there.
 */
```

Then run:

```bash
rewrite "import { TAB_BAR_HEIGHT } from '@/components/navigation/CustomTabBar';" "import { TAB_BAR_HEIGHT } from '@/constants/layout';"
```

This rewrites only the two `TAB_BAR_HEIGHT` imports, in `HomeScreen.tsx` and `ProfileScreen.tsx`. `MainTabNavigator.tsx`'s `import { CustomTabBar } …` line is a different string, so it is left alone. Confirm:

Run: `grep -rn "constants/layout\|navigation/CustomTabBar" src`

Expected: exactly three lines. `HomeScreen.tsx` and `ProfileScreen.tsx` import `TAB_BAR_HEIGHT` from `'@/constants/layout'`, and `MainTabNavigator.tsx` imports `CustomTabBar` from `'@/components/navigation/CustomTabBar'`.

- [ ] **Step 6: Create `src/types/user.types.ts` and drop the local copies**

```ts
/**
 * The user profile as the app persists it — matches the fields returned by
 * the OTP verify response. Mirrored in MMKV by src/lib/storage.ts.
 */
export interface StoredUserProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryCode: string;
  phoneNumber: string;
  role: string;
  status: string;
}

/**
 * The profile as the app speaks it: camelCase, and a subset of
 * StoredUserProfile, so it can be handed straight to `updateUser()`.
 */
export interface UserProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryCode: string;
  phoneNumber: string;
}

/** PATCH /user/profile body — snake_case, every field optional. */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}
```

In `src/utils/storage.ts`:
- Delete the `// User Profile — matches the fields returned by the OTP verify response` banner (the 3 comment lines) and the whole `export interface StoredUserProfile { … }` block.
- Add `import type { StoredUserProfile } from '@/types/user.types';` directly under the `createMMKV` import.

In `src/services/user.service.ts`:
- Delete the `export interface UpdateProfilePayload { … }` block, and the `/** The profile as the app speaks it … */` comment plus the `export interface UserProfile { … }` block.
- Change the import block to:
  ```ts
  import apiClient from '@/api/apiClient';
  import { ENDPOINTS } from '@/api/endpoints';
  import { ProfileApiResponse, UserProfilePayload } from '@/types/api.types';
  import type { UpdateProfilePayload, UserProfile } from '@/types/user.types';
  ```

In `src/store/auth.store.ts`:
- Remove `StoredUserProfile,` from the `'@/utils/storage'` import list.
- Add `import type { StoredUserProfile } from '@/types/user.types';` under it.

- [ ] **Step 7: Create `src/types/navigation.types.ts` and adopt `ProfileStackParamList`**

```ts
import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Every navigator's param list, in one place. Screens import their types
 * from here — never from a navigator file — so the routing layer (src/app/)
 * stays the only thing that knows how screens are wired together.
 */

/** Signed-out flow: Splash → Login → OtpVerification. */
export type AuthStackParamList = {
  Splash: undefined;
  /** Initial route, so it may arrive with no params at all. */
  Login: { prefillPhone?: string } | undefined;
  OtpVerification: { phone: string; authToken: string };
};

/**
 * The Profile tab's own stack.
 *
 * `ProfileMain` takes an optional `toast` param: Edit Profile navigates back
 * with it after a successful save, so the confirmation appears on the screen
 * the change is visible on rather than on the one being dismissed.
 */
export type ProfileStackParamList = {
  ProfileMain: { toast?: string } | undefined;
  EditProfile: undefined;
};

/** Signed-in bottom tabs. */
export type MainTabParamList = {
  Home: undefined;
  Saved: undefined;
  Orders: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
```

In `src/navigation/ProfileNavigator.tsx`, replace the doc comment and `export type ProfileStackParamList = { … };` block (everything from `/**` down to the closing `};` of the type) with nothing, and add this import after the `EditProfileScreen` import:

```ts
import type { ProfileStackParamList } from '@/types/navigation.types';
```

Then:

```bash
rewrite "import type { ProfileStackParamList } from '@/navigation/ProfileNavigator';" "import type { ProfileStackParamList } from '@/types/navigation.types';"
```

- [ ] **Step 8: Format and run the gate**

```bash
npx prettier --write __tests__/src-structure.test.ts src/types src/constants src/lib src/utils/storage.ts src/services/user.service.ts src/store src/navigation src/components/navigation src/features
npx tsc --noEmit && npx jest && npm run lint
```

Expected: tsc exits 0. Jest passes everything, now more than 378 tests because the new structure test adds rows. Lint is clean. If `src-structure` still fails, its message names the file and line. Fix that file; never edit the test tables to make it pass.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor(structure): single homes for types, constants and validation

Adds the src/ architecture guard. Menu types become menu.types.ts; user
and navigation types, the email regex, TAB_BAR_HEIGHT and the avatar
presets each get exactly one home, so the profile store no longer
depends on a feature folder. No behavior change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `lib/` layer — API client, per-domain API modules, storage; `hasFullName`

**Files:**
- Rename: `src/api/apiClient.ts` → `src/lib/api/api-client.ts`
- Rename: `src/api/endpoints.ts` → `src/lib/api/endpoints.ts`
- Rename: `src/services/auth.service.ts` → `src/lib/api/auth/auth-api.ts`
- Rename: `src/services/user.service.ts` → `src/lib/api/user/user-api.ts`
- Rename: `src/utils/storage.ts` → `src/lib/storage.ts`
- Modify: `src/store/auth.store.ts` (the `hasFullName` helper), `src/types/api.types.ts` (one comment), `__tests__/src-structure.test.ts`, and every importer
- Create: `__tests__/auth-store.test.ts`, `__tests__/auth-api.test.ts`, `__tests__/user-api.test.ts`

**Interfaces:**
- Consumes: `StoredUserProfile`, `UserProfile` and `UpdateProfilePayload` from `@/types/user.types` (Task 1).
- Produces:
  - `authApi` (from `@/lib/api/auth/auth-api`):
    - `sendOtp(countryCode: string, phoneNumber: string)`
    - `verifyOtp(otp: string, preVerifyToken: string)`
    - `resendOtp(preVerifyToken: string)`
    - `logout()`
  - `userApi` (from `@/lib/api/user/user-api`):
    - `getProfile(): Promise<UserProfile>`
    - `updateProfile(payload: UpdateProfilePayload): Promise<UserProfile>`
  - `apiClient`: the default export of `@/lib/api/api-client`.
  - `ENDPOINTS` from `@/lib/api/endpoints`.
  - The MMKV helpers from `@/lib/storage`, with the same names as before: `storage`, `StorageKeys`, `get/setAccessToken`, `get/setRefreshToken`, `get/setUserProfile`, `get/setAvatarId`, `clearAuthData` and `hasActiveSession`.

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'api',`, `'services',` and `'utils',`
- Append to `REQUIRED_PATHS`: `'lib/api/api-client.ts',`, `'lib/api/endpoints.ts',`, `'lib/api/auth/auth-api.ts',`, `'lib/api/user/user-api.ts',` and `'lib/storage.ts',`
- Append to `RETIRED_IMPORTS`: `/['"]@\/(?:api|services|utils)\//,` and `/['"][^'"]*src\/(?:api|services|utils)\//,`

Then add this table and test below `LAYER_RULES`:

```ts
/** Identifiers retired by a rename. */
const RETIRED_IDENTIFIERS: RegExp[] = [/\bAuthService\b/, /\bUserService\b/];
```

Add this test inside the `describe` block:

```ts
  it.each(RETIRED_IDENTIFIERS)('no source uses the retired name %s', pattern => {
    const offenders = importingFiles().flatMap(({ rel, abs }) =>
      hits(abs, pattern).map(h => `${rel}:${h}`),
    );
    expect(offenders).toEqual([]);
  });

  it('only lib/api/ talks to the HTTP client directly', () => {
    const offenders = sourceFiles()
      .filter(({ rel }) => !rel.startsWith('lib/api/'))
      .flatMap(({ rel, abs }) =>
        hits(abs, /from\s+['"][^'"]*api-client['"]/).map(h => `${rel}:${h}`),
      );
    expect(offenders).toEqual([]);
  });
```

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL.
- The `api`, `services` and `utils` paths still exist.
- The five `lib/` paths are missing.
- `AuthService` and `UserService` are still in use.
- `@/services/…` and `@/utils/…` imports remain.

- [ ] **Step 2: Move the files**

```bash
mkdir -p src/lib/api/auth src/lib/api/user
git mv src/api/apiClient.ts src/lib/api/api-client.ts
git mv src/api/endpoints.ts src/lib/api/endpoints.ts
git mv src/services/auth.service.ts src/lib/api/auth/auth-api.ts
git mv src/services/user.service.ts src/lib/api/user/user-api.ts
git mv src/utils/storage.ts src/lib/storage.ts
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "'@/api/apiClient'" "'@/lib/api/api-client'"
rewrite "'@/api/endpoints'" "'@/lib/api/endpoints'"
rewrite "'@/services/auth.service'" "'@/lib/api/auth/auth-api'"
rewrite "'@/services/user.service'" "'@/lib/api/user/user-api'"
rewrite "'@/utils/storage'" "'@/lib/storage'"
grep -rlw "AuthService" src | xargs -r sed -i 's#\bAuthService\b#authApi#g'
grep -rlw "UserService" src | xargs -r sed -i 's#\bUserService\b#userApi#g'
find src -type d -empty -delete
```

Then fix the four comments that still name something that no longer exists:

- `src/types/api.types.ts`: in the line ` * user.service should see this shape — it maps to UserProfile there.`, change `user.service` to `user-api`.
- `src/lib/api/auth/auth-api.ts`: change the header comment line ` * Auth Service` to ` * Auth API`.
- `src/lib/api/user/user-api.ts`: change the header comment line ` * User Service` to ` * User API`.
- `src/features/profile/profile-mock.ts` (it moves in Task 7): change `is still commented out in src/api/endpoints.ts.` to `is still commented out in src/lib/api/endpoints.ts.`

Run: `grep -rn "src/api\|src/services\|src/utils\|auth\.service\|user\.service\|apiClient'" src App.tsx`

Expected: no output.

- [ ] **Step 3: Run the gate**

```bash
npx prettier --write src/lib src/store src/types src/features src/navigation __tests__/src-structure.test.ts
npx tsc --noEmit && npx jest && npm run lint
```

Expected: all green, including `src-structure`.

- [ ] **Step 4: Pin today's auth-store behavior (characterization test)**

Create `__tests__/auth-store.test.ts`:

```ts
import type { AuthResponse } from '../src/types/api.types';
import type { StoredUserProfile } from '../src/types/user.types';

jest.mock('../src/lib/storage', () => ({
  clearAuthData: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  getUserProfile: jest.fn(),
  setAccessToken: jest.fn(),
  setRefreshToken: jest.fn(),
  setUserProfile: jest.fn(),
  getAvatarId: jest.fn(() => null),
  setAvatarId: jest.fn(),
}));

const mockLogout = jest.fn();
jest.mock('../src/lib/api/auth/auth-api', () => ({
  authApi: { logout: () => mockLogout() },
}));

import * as storage from '../src/lib/storage';
import { useAuthStore } from '../src/store/auth.store';
import { useProfileStore } from '../src/store/profile.store';
import { DEFAULT_AVATAR_ID } from '../src/constants/avatars';

const profile: StoredUserProfile = {
  id: 1,
  firstName: 'Asha',
  lastName: 'Rao',
  email: null,
  countryCode: '+91',
  phoneNumber: '9999999999',
  role: 'user',
  status: 'active',
};

const verified = (
  overrides: Partial<AuthResponse> = {},
): AuthResponse => ({
  ...profile,
  isOtpVerified: true,
  accessToken: 'access',
  refreshToken: 'refresh',
  profileCompleted: false,
  ...overrides,
});

const GUEST = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isFirstLaunch: true,
  profileCompleted: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState(GUEST);
});

afterEach(() => jest.useRealTimers());

describe('setAuth — profile completion after OTP', () => {
  it('counts both names as complete even when the server flag is false', () => {
    useAuthStore.getState().setAuth(verified());
    expect(useAuthStore.getState().profileCompleted).toBe(true);
  });

  it('treats a whitespace-only name as missing', () => {
    useAuthStore.getState().setAuth(verified({ lastName: '   ' }));
    expect(useAuthStore.getState().profileCompleted).toBe(false);
  });

  it('trusts the server flag when a name is missing', () => {
    useAuthStore
      .getState()
      .setAuth(verified({ firstName: null, profileCompleted: true }));
    expect(useAuthStore.getState().profileCompleted).toBe(true);
  });

  it('keeps only profile fields on the user', () => {
    useAuthStore.getState().setAuth(verified());
    expect(useAuthStore.getState().user).toEqual(profile);
    expect(useAuthStore.getState().accessToken).toBe('access');
  });

  it('persists to storage on the next tick, not synchronously', () => {
    jest.useFakeTimers();
    useAuthStore.getState().setAuth(verified());
    expect(storage.setAccessToken).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(storage.setAccessToken).toHaveBeenCalledWith('access');
    expect(storage.setRefreshToken).toHaveBeenCalledWith('refresh');
    expect(storage.setUserProfile).toHaveBeenCalledWith(profile);
  });
});

describe('rehydrate — profile completion after relaunch', () => {
  it('restores a session whose profile has both names', () => {
    jest.mocked(storage.getAccessToken).mockReturnValue('access');
    jest.mocked(storage.getUserProfile).mockReturnValue(profile);
    useAuthStore.getState().rehydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().profileCompleted).toBe(true);
  });

  it('judges completion by names alone', () => {
    jest.mocked(storage.getAccessToken).mockReturnValue('access');
    jest
      .mocked(storage.getUserProfile)
      .mockReturnValue({ ...profile, lastName: null });
    useAuthStore.getState().rehydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().profileCompleted).toBe(false);
  });

  it('stays a guest when no token is stored', () => {
    jest.mocked(storage.getAccessToken).mockReturnValue(undefined);
    jest.mocked(storage.getUserProfile).mockReturnValue(profile);
    useAuthStore.getState().rehydrate();
    expect(useAuthStore.getState()).toMatchObject(GUEST);
  });
});

describe('logout', () => {
  it('wipes the session and the avatar even when the server call fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockLogout.mockRejectedValue(new Error('offline'));
    useAuthStore.getState().setAuth(verified());
    useProfileStore.getState().setAvatar(5);

    await useAuthStore.getState().logout();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(storage.clearAuthData).toHaveBeenCalledTimes(1);
    expect(useProfileStore.getState().avatarId).toBe(DEFAULT_AVATAR_ID);
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isFirstLaunch: false,
    });
    warn.mockRestore();
  });
});
```

Run: `npx jest __tests__/auth-store.test.ts`

Expected: PASS, 9 tests. This test pins the *current* logic, which is why it runs before the refactor.

- [ ] **Step 5: Prove the pin bites**

In `src/store/auth.store.ts`, `setAuth`, temporarily change `Boolean(profileCompleted) ||` to `Boolean(profileCompleted) &&`.

Run: `npx jest __tests__/auth-store.test.ts`

Expected: FAIL. At least `counts both names as complete even when the server flag is false` fails.

Undo that one edit by hand, changing `&&` back to `||`. Do **not** use `git checkout` here, because it would also discard Step 2's uncommitted import edits to that file. Then run `npx jest __tests__/auth-store.test.ts` again and expect it to PASS.

- [ ] **Step 6: Refactor to `hasFullName` (spec A6)**

In `src/store/auth.store.ts`, add this directly above the `// Store` banner, after the `AuthState` interface:

```ts
/**
 * True when both names are on file. Whitespace-only counts as missing: the
 * complete-profile flow trims before saving, so a blank-looking name is one
 * the user never actually gave.
 */
const hasFullName = (profile: StoredUserProfile): boolean => {
  const hasFirstName =
    profile.firstName && profile.firstName.trim().length > 0;
  const hasLastName = profile.lastName && profile.lastName.trim().length > 0;
  return Boolean(hasFirstName) && Boolean(hasLastName);
};
```

In `setAuth`, replace:

```ts
    const hasFirstName =
      profile.firstName && profile.firstName.trim().length > 0;
    const hasLastName = profile.lastName && profile.lastName.trim().length > 0;
    const isProfileComplete =
      Boolean(profileCompleted) ||
      (Boolean(hasFirstName) && Boolean(hasLastName));
```

with:

```ts
    const isProfileComplete =
      Boolean(profileCompleted) || hasFullName(profile);
```

In `rehydrate`, replace:

```ts
    if (token && profile) {
      const hasFirstName =
        profile.firstName && profile.firstName.trim().length > 0;
      const hasLastName =
        profile.lastName && profile.lastName.trim().length > 0;
      const isProfileComplete = Boolean(hasFirstName) && Boolean(hasLastName);

      set({
        isAuthenticated: true,
        user: profile,
        accessToken: token,
        refreshToken: refresh ?? null,
        profileCompleted: isProfileComplete,
      });
    }
```

with:

```ts
    if (token && profile) {
      set({
        isAuthenticated: true,
        user: profile,
        accessToken: token,
        refreshToken: refresh ?? null,
        profileCompleted: hasFullName(profile),
      });
    }
```

Run: `npx jest __tests__/auth-store.test.ts`

Expected: PASS, 9 tests.

- [ ] **Step 7: Pin the API modules' request and response contracts**

Create `__tests__/auth-api.test.ts`:

```ts
const mockPost = jest.fn();
jest.mock('../src/lib/api/api-client', () => ({
  __esModule: true,
  default: { post: (...args: unknown[]) => mockPost(...args) },
}));

import { authApi } from '../src/lib/api/auth/auth-api';

const body = { status: true, data: { authToken: 'next' } };

beforeEach(() => {
  mockPost.mockReset();
  mockPost.mockResolvedValue({ data: body });
});

it('sendOtp posts snake_case phone fields and returns the body', async () => {
  await expect(authApi.sendOtp('+91', '9999999999')).resolves.toEqual(body);
  expect(mockPost).toHaveBeenCalledWith('/user/auth/create', {
    country_code: '+91',
    phone_number: '9999999999',
  });
});

it('verifyOtp sends the pre-verify token as the bearer', async () => {
  await authApi.verifyOtp('123456', 'pre');
  expect(mockPost).toHaveBeenCalledWith(
    '/user/auth/verify-otp',
    { otp: '123456' },
    { headers: { Authorization: 'Bearer pre' } },
  );
});

it('resendOtp sends the pre-verify token as the bearer', async () => {
  await authApi.resendOtp('pre');
  expect(mockPost).toHaveBeenCalledWith(
    '/user/auth/resend-otp',
    {},
    { headers: { Authorization: 'Bearer pre' } },
  );
});

it('logout posts an empty body', async () => {
  await authApi.logout();
  expect(mockPost).toHaveBeenCalledWith('/user/auth/logout', {});
});
```

Create `__tests__/user-api.test.ts`:

```ts
const mockGet = jest.fn();
const mockPatch = jest.fn();
jest.mock('../src/lib/api/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}));

import { userApi } from '../src/lib/api/user/user-api';

const wire = {
  id: 7,
  first_name: 'Asha',
  last_name: 'Rao',
  email: null,
  country_code: '+91',
  phone_number: '9999999999',
};

const app = {
  id: 7,
  firstName: 'Asha',
  lastName: 'Rao',
  email: null,
  countryCode: '+91',
  phoneNumber: '9999999999',
};

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

it('getProfile maps the snake_case payload to UserProfile', async () => {
  mockGet.mockResolvedValue({ data: { success: true, data: wire } });
  await expect(userApi.getProfile()).resolves.toEqual(app);
  expect(mockGet).toHaveBeenCalledWith('/user/profile');
});

it('refuses a success:false body with the server message', async () => {
  mockGet.mockResolvedValue({
    data: { success: false, message: 'Nope', data: wire },
  });
  await expect(userApi.getProfile()).rejects.toThrow('Nope');
});

it('refuses a success:false body with a default message', async () => {
  mockGet.mockResolvedValue({ data: { success: false, data: wire } });
  await expect(userApi.getProfile()).rejects.toThrow('Profile request failed');
});

it('updateProfile PATCHes the payload verbatim and returns the server copy', async () => {
  mockPatch.mockResolvedValue({
    data: { success: true, data: { ...wire, first_name: 'Asha K' } },
  });
  await expect(
    userApi.updateProfile({ first_name: 'Asha', last_name: 'Rao' }),
  ).resolves.toEqual({ ...app, firstName: 'Asha K' });
  expect(mockPatch).toHaveBeenCalledWith('/user/profile', {
    first_name: 'Asha',
    last_name: 'Rao',
  });
});
```

Run: `npx jest __tests__/auth-api.test.ts __tests__/user-api.test.ts`

Expected: PASS, 8 tests.

- [ ] **Step 8: Format, run the gate, commit**

```bash
npx prettier --write src/store/auth.store.ts __tests__
npx tsc --noEmit && npx jest && npm run lint
git add -A
git commit -m "refactor(lib): API client, per-domain API modules and storage under lib/

api/, services/ and utils/storage move under lib/, t-genius style:
AuthService -> authApi, UserService -> userApi, same methods, bodies and
headers. auth.store's duplicated name check becomes hasFullName().
Characterization tests pin the store's completion/logout rules and both
API modules' request and response contracts. No behavior change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Shared hook naming — `use-app-toast.ts`

**Files:**
- Rename: `src/hooks/useAppToast.tsx` → `src/hooks/use-app-toast.ts`
- Modify: `__tests__/src-structure.test.ts`, plus the importers (`LoginScreen`, `OtpVerificationScreen` and `EditProfileScreen`)

**Interfaces:**
- Produces: `useAppToast()` and `AppToastOptions` from `@/hooks/use-app-toast`. The export names are unchanged.

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'hooks/useAppToast.tsx',`
- Append to `REQUIRED_PATHS`: `'hooks/use-app-toast.ts',`
- Append to `RETIRED_IMPORTS`: `/['"]@\/hooks\/useAppToast['"]/,`

Add this test inside the `describe` block:

```ts
  it('hook files are named use-kebab-case.ts', () => {
    const offenders = sourceFiles()
      .filter(({ rel }) => /(^|\/)hooks\//.test(rel))
      .map(({ rel }) => rel)
      .filter(rel => !/^use-[a-z0-9-]+\.ts$/.test(path.posix.basename(rel)));
    expect(offenders).toEqual([]);
  });
```

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL. `useAppToast.tsx` breaks the naming rule, and its import is retired.

- [ ] **Step 2: Rename and repoint**

The file contains no JSX, so `.ts` is correct; tsc confirms it.

```bash
git mv src/hooks/useAppToast.tsx src/hooks/use-app-toast.ts
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "'@/hooks/useAppToast'" "'@/hooks/use-app-toast'"
```

- [ ] **Step 3: Gate and commit**

```bash
npx prettier --write __tests__/src-structure.test.ts
npx tsc --noEmit && npx jest && npm run lint
git add -A
git commit -m "refactor(hooks): name the toast hook use-app-toast.ts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: all green before committing.

---

### Task 4: `components/` — layout, custom, providers; slim `App.tsx`

**Files:**
- Rename: `src/components/navigation/CustomTabBar.tsx` → `src/components/layout/CustomTabBar.tsx`
- Rename: `src/components/common/PlaceholderScreen.tsx` → `src/components/custom/PlaceholderScreen.tsx`
- Create: `src/components/providers/AppProviders.tsx`
- Modify: `App.tsx`, `src/navigation/MainTabNavigator.tsx` and `__tests__/src-structure.test.ts`

**Interfaces:**
- Produces:
  - `AppProviders({ children }: { children: React.ReactNode })`.
  - `CustomTabBar` from `@/components/layout/CustomTabBar`.
  - `PlaceholderScreen({ name })` from `@/components/custom/PlaceholderScreen`.

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'components/navigation',` and `'components/common',`
- Append to `REQUIRED_PATHS`: `'components/layout/CustomTabBar.tsx',`, `'components/custom/PlaceholderScreen.tsx',` and `'components/providers/AppProviders.tsx',`
- Append to `RETIRED_IMPORTS`: `/['"][^'"]*components\/(?:navigation|common)\//,`

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL on those rows.

- [ ] **Step 2: Move the two components**

```bash
mkdir -p src/components/layout src/components/custom src/components/providers
git mv src/components/navigation/CustomTabBar.tsx src/components/layout/CustomTabBar.tsx
git mv src/components/common/PlaceholderScreen.tsx src/components/custom/PlaceholderScreen.tsx
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "'@/components/navigation/CustomTabBar'" "'@/components/layout/CustomTabBar'"
rewrite "'@/components/common/PlaceholderScreen'" "'@/components/custom/PlaceholderScreen'"
find src -type d -empty -delete
```

- [ ] **Step 3: Create `src/components/providers/AppProviders.tsx`**

The provider stack is moved verbatim from `App.tsx`, with its comments:

```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

/**
 * Every app-wide provider, outermost first. App.tsx renders the app inside
 * this and nothing else, so the order the app depends on lives in one place.
 */
export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={styles.container}>
    {/* Keyboard geometry, read from the native window insets rather than
        from a window resize — which is what this app needs, because it
        draws edge-to-edge and `adjustResize` is a no-op in that mode.
        Every form uses it through components/ui/FormScreen.

        All three flags are ON to protect the edge-to-edge setup: without
        them the provider would take the translucent bars back, and the
        hero header and floating tab bar both depend on drawing under
        them. See AppTheme in android/app/src/main/res/values/styles.xml. */}
    <KeyboardProvider
      statusBarTranslucent
      navigationBarTranslucent
      preserveEdgeToEdge
    >
      <SafeAreaProvider>
        <HeroUINativeProvider
          config={{
            devInfo: { stylingPrinciples: false },
            toast: {
              defaultProps: {
                placement: 'top',
                isSwipeable: true,
              },
              insets: { bottom: 12, left: 16, right: 16 },
            },
          }}
        >
          <View style={styles.container}>{children}</View>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

- [ ] **Step 4: Slim `App.tsx`**

Replace the whole file with the following. The rendered tree is identical: the same providers, then `View` → `StatusBar` and `RootNavigator`.

```tsx
import './src/global.css';
import React from 'react';
import { StatusBar } from 'react-native';
import { AppProviders } from './src/components/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * The app renders one palette — JJ's Kitchen Design System v1.0 — in both
 * light and dark device color schemes. There is deliberately no theme store
 * and no `dark` class: every token lives in src/global.css with a single
 * value. See docs/superpowers/specs/2026-09-06-design-system-v1-design.md.
 */
function App() {
  return (
    <AppProviders>
      {/* Dark glyphs: the canvas is Cream 50 everywhere except the
          splash, which sets its own bar style. */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
```

- [ ] **Step 5: Gate and commit**

```bash
npx prettier --write App.tsx src/components/providers __tests__/src-structure.test.ts
npx tsc --noEmit && npx jest && npm run lint
git add -A
git commit -m "refactor(components): layout/, custom/ and providers/; App.tsx renders AppProviders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: all green before committing. The design-token guard still scans `App.tsx` and the new `providers/` file.

---

### Task 5: Auth pages → `components/pages/auth/` + three native-side-effect hooks

**Files:**
- Rename: `src/features/auth/BrandMark.tsx` → `src/components/pages/auth/components/BrandMark.tsx`
- Rename: `src/features/auth/SplashScreen.tsx` → `src/components/pages/auth/splash/SplashScreen.tsx`
- Rename: `src/features/auth/LoginScreen.tsx` → `src/components/pages/auth/login/LoginScreen.tsx`
- Rename: `src/features/auth/OtpVerificationScreen.tsx` → `src/components/pages/auth/otp-verification/OtpVerificationScreen.tsx`
- Rename: `src/features/auth/complete-profile/index.tsx` → `src/components/pages/auth/complete-profile/CompleteProfileScreen.tsx`
- Rename: `src/features/auth/complete-profile/NameStep.tsx` → `src/components/pages/auth/complete-profile/components/NameStep.tsx`
- Rename: `src/features/auth/complete-profile/EmailStep.tsx` → `src/components/pages/auth/complete-profile/components/EmailStep.tsx`
- Create:
  - `src/components/pages/auth/login/hooks/use-phone-number-hint.ts`
  - `src/components/pages/auth/otp-verification/hooks/use-resend-timer.ts`
  - `src/components/pages/auth/otp-verification/hooks/use-sms-otp-autofill.ts`
- Modify: `src/navigation/AuthNavigator.tsx`, `src/navigation/RootNavigator.tsx` and `__tests__/src-structure.test.ts`

**Interfaces:**
- Consumes: `AuthStackParamList` (Task 1), `authApi` (Task 2), `useAppToast` (Task 3) and `EMAIL_REGEX` (Task 1).
- Produces:
  - `usePhoneNumberHint({ skip: boolean; onNumber: (phone: string) => void }): void`
  - `useResendTimer(): { resendTimer: number; canResend: boolean; startResendTimer: () => void }`
  - `useSmsOtpAutofill(onCode: (code: string) => void): void`
  - `CompleteProfileScreen` from `@/components/pages/auth/complete-profile/CompleteProfileScreen`

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'features/auth',`
- Append to `REQUIRED_PATHS`:
  ```ts
  'components/pages/auth/components/BrandMark.tsx',
  'components/pages/auth/splash/SplashScreen.tsx',
  'components/pages/auth/login/LoginScreen.tsx',
  'components/pages/auth/login/hooks/use-phone-number-hint.ts',
  'components/pages/auth/otp-verification/OtpVerificationScreen.tsx',
  'components/pages/auth/otp-verification/hooks/use-resend-timer.ts',
  'components/pages/auth/otp-verification/hooks/use-sms-otp-autofill.ts',
  'components/pages/auth/complete-profile/CompleteProfileScreen.tsx',
  'components/pages/auth/complete-profile/components/NameStep.tsx',
  'components/pages/auth/complete-profile/components/EmailStep.tsx',
  ```
- Append to `RETIRED_IMPORTS`: `/['"][^'"]*features\/auth/,`
- Append to `RETIRED_IDENTIFIERS`: `/\bRootStackParamList\b/,` and `/NativeStackNavigationProp<any>/,`

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL on those rows.

- [ ] **Step 2: Move the auth files and fix their relative imports**

```bash
mkdir -p src/components/pages/auth/components src/components/pages/auth/splash src/components/pages/auth/login/hooks src/components/pages/auth/otp-verification/hooks src/components/pages/auth/complete-profile/components
git mv src/features/auth/BrandMark.tsx src/components/pages/auth/components/BrandMark.tsx
git mv src/features/auth/SplashScreen.tsx src/components/pages/auth/splash/SplashScreen.tsx
git mv src/features/auth/LoginScreen.tsx src/components/pages/auth/login/LoginScreen.tsx
git mv src/features/auth/OtpVerificationScreen.tsx src/components/pages/auth/otp-verification/OtpVerificationScreen.tsx
git mv src/features/auth/complete-profile/index.tsx src/components/pages/auth/complete-profile/CompleteProfileScreen.tsx
git mv src/features/auth/complete-profile/NameStep.tsx src/components/pages/auth/complete-profile/components/NameStep.tsx
git mv src/features/auth/complete-profile/EmailStep.tsx src/components/pages/auth/complete-profile/components/EmailStep.tsx
find src -type d -empty -delete
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "from './BrandMark'" "from '../components/BrandMark'"
rewrite "from './NameStep'" "from './components/NameStep'"
rewrite "from './EmailStep'" "from './components/EmailStep'"
rewrite "'../features/auth/SplashScreen'" "'@/components/pages/auth/splash/SplashScreen'"
rewrite "'../features/auth/LoginScreen'" "'@/components/pages/auth/login/LoginScreen'"
rewrite "'../features/auth/OtpVerificationScreen'" "'@/components/pages/auth/otp-verification/OtpVerificationScreen'"
rewrite "'../features/auth/complete-profile'" "'@/components/pages/auth/complete-profile/CompleteProfileScreen'"
```

Run: `npx tsc --noEmit`

Expected: 0 errors. The move is complete before any content changes.

- [ ] **Step 3: Type the auth stack**

In `src/navigation/AuthNavigator.tsx`:
- Add `import type { AuthStackParamList } from '@/types/navigation.types';` after the `auth.store` import.
- Replace `const Stack = createNativeStackNavigator();` with `const Stack = createNativeStackNavigator<AuthStackParamList>();`

In `src/components/pages/auth/splash/SplashScreen.tsx`:
- Add `import type { AuthStackParamList } from '@/types/navigation.types';` after the `@/components/ui` import.
- Replace `useNavigation<NativeStackNavigationProp<any>>()` with `useNavigation<NativeStackNavigationProp<AuthStackParamList>>()`.

In both `LoginScreen.tsx` and `OtpVerificationScreen.tsx`:
- Delete the local block:
  ```ts
  type RootStackParamList = {
    Login: { prefillPhone?: string };
    OtpVerification: { phone: string; authToken: string };
  };
  ```
  along with the blank line after it.
- Add `import type { AuthStackParamList } from '@/types/navigation.types';` after the `@/components/ui` import.
- Replace every `RootStackParamList` with `AuthStackParamList`. There are two occurrences per file: the `NativeStackNavigationProp<…>` and the `RouteProp<…, 'Login' | 'OtpVerification'>`.

- [ ] **Step 4: Create `use-phone-number-hint.ts` and use it in Login**

`src/components/pages/auth/login/hooks/use-phone-number-hint.ts`:

```ts
import { useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

const { PhoneNumberHintModule } = NativeModules;

interface PhoneNumberHintOptions {
  /** True when a number is already on screen — e.g. coming back from OTP. */
  skip: boolean;
  /** Receives the last 10 digits of the number the user picked. */
  onNumber: (phone: string) => void;
}

/**
 * Auto-detect phone number on mount (Android only).
 *
 * Shows the Google Phone Number Hint picker automatically when the login
 * screen loads — same UX as WhatsApp, PhonePe, Cred, etc. Skipped if the
 * user already has a phone (e.g. coming back from the OTP screen).
 *
 * Mount-only by contract: `skip` and `onNumber` are read once, so a later
 * prefill or a new callback identity never re-opens the picker. Pass a
 * stable function such as a state setter.
 */
export const usePhoneNumberHint = ({
  skip,
  onNumber,
}: PhoneNumberHintOptions) => {
  useEffect(() => {
    if (Platform.OS !== 'android' || !PhoneNumberHintModule) return;
    if (skip) return; // already have a number

    // Small delay so the Activity is fully mounted and idle (no animations)
    const timer = setTimeout(async () => {
      try {
        const phoneNumber: string =
          await PhoneNumberHintModule.requestPhoneNumberHint();
        if (phoneNumber) {
          const cleaned = phoneNumber.replace(/[^0-9]/g, '');
          if (cleaned.length >= 10) {
            onNumber(cleaned.slice(-10));
          }
        }
      } catch (err: any) {
        // User dismissed or no SIM numbers — perfectly fine, they'll type manually
        console.log('[PhoneHint] auto-detect:', err?.message);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
```

In `src/components/pages/auth/login/LoginScreen.tsx`:
- Delete `const { PhoneNumberHintModule } = NativeModules;` and the blank line after it.
- Remove `NativeModules,` from the `react-native` import list.
- Add `import { usePhoneNumberHint } from './hooks/use-phone-number-hint';` after the `BrandMark` import.
- Replace the whole second effect with a single call. That's everything from the comment line `// ── Auto-detect phone number on mount (Android only) ──────────────────` through the effect's closing `}, []);`, including its `eslint-disable-next-line` comment.

  ```ts
    usePhoneNumberHint({
      skip: Boolean(route.params?.prefillPhone),
      onNumber: setPhone,
    });
  ```

  The first effect, which calls `clearAuthData()`, stays exactly where it is. Both are mount effects, in the same order as before.

- [ ] **Step 5: Create `use-resend-timer.ts`**

`src/components/pages/auth/otp-verification/hooks/use-resend-timer.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

/** Seconds before "Resend code" becomes available again. */
const RESEND_SECONDS = 60;

/**
 * The OTP screen's resend countdown. Starts on mount, ticks once a second,
 * flips `canResend` at zero, and is cleared on unmount.
 */
export const useResendTimer = () => {
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Resets and starts the 60-second countdown. */
  const startResendTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(RESEND_SECONDS);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer on mount; clean up on unmount.
  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startResendTimer]);

  return { resendTimer, canResend, startResendTimer };
};
```

- [ ] **Step 6: Create `use-sms-otp-autofill.ts`**

`src/components/pages/auth/otp-verification/hooks/use-sms-otp-autofill.ts`:

```ts
import { useEffect } from 'react';
import {
  Keyboard,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const { SmsRetrieverModule } = NativeModules;

/**
 * Android SMS User Consent API — no hash needed, shows the native consent
 * dialog. When the user taps "Allow", the first 6-digit run in the message
 * is handed to `onCode` and the keyboard is dismissed. The listener window
 * is five minutes; it is torn down on unmount.
 *
 * Mount-only by contract: `onCode` is read once. Pass a stable function such
 * as a state setter.
 */
export const useSmsOtpAutofill = (onCode: (code: string) => void) => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let smsEventEmitter: NativeEventEmitter | null = null;
    let smsReceivedSub: ReturnType<NativeEventEmitter['addListener']> | null =
      null;
    let smsTimeoutSub: ReturnType<NativeEventEmitter['addListener']> | null =
      null;

    const startSmsListener = async () => {
      try {
        // Start the User Consent listener (5-minute window)
        await SmsRetrieverModule.startSmsRetriever();
        console.log('📡 SMS User Consent listener started');

        smsEventEmitter = new NativeEventEmitter(SmsRetrieverModule);

        // Fired when user taps "Allow" on the native consent dialog
        smsReceivedSub = smsEventEmitter.addListener(
          'onSmsReceived',
          (event: { message?: string }) => {
            console.log('📲 SMS User Consent received:', event?.message);
            if (event?.message) {
              const otpMatch = event.message.match(/\d{6}/);
              if (otpMatch && otpMatch[0]) {
                console.log('✅ OTP auto-filled:', otpMatch[0]);
                onCode(otpMatch[0]);
                Keyboard.dismiss();
              }
            }
          },
        );

        smsTimeoutSub = smsEventEmitter.addListener('onSmsTimeout', () => {
          console.log('⏰ SMS User Consent timed out');
        });
      } catch (err) {
        console.log('SMS User Consent error:', err);
      }
    };

    startSmsListener();

    return () => {
      smsReceivedSub?.remove();
      smsTimeoutSub?.remove();
      SmsRetrieverModule.stopSmsRetriever?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
```

- [ ] **Step 7: Use both hooks in the OTP screen**

In `src/components/pages/auth/otp-verification/OtpVerificationScreen.tsx`:

1. Remove `NativeModules,` and `NativeEventEmitter,` from the `react-native` import list.
2. Delete these two lines and the blank line between them:
   ```ts
   // ── Native modules ────────────────────────────────────────────────────────────
   const { SmsRetrieverModule } = NativeModules;
   ```
3. Add these two imports after the `AuthStackParamList` import:
   ```ts
   import { useResendTimer } from './hooks/use-resend-timer';
   import { useSmsOtpAutofill } from './hooks/use-sms-otp-autofill';
   ```
4. Delete these three state lines and the `timerRef` line:
   ```ts
     const [resendTimer, setResendTimer] = useState(60);
     const [canResend, setCanResend] = useState(false);
     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
   ```
   In their place, directly after `const [authToken, setAuthToken] = useState(route.params.authToken);`, add:
   ```ts
     const { resendTimer, canResend, startResendTimer } = useResendTimer();
   ```
5. Delete the `startResendTimer` `useCallback` block (from `/** Resets and starts the 60-second countdown. */` to its closing `}, []);`) and the following `// Start timer on mount; clean up on unmount.` effect.
6. Replace the whole keyboard, focus and SMS effect (from `useEffect(() => {` with `const hideSubscription = …` through its closing `}, []);`) with:
   ```ts
     useEffect(() => {
       const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
         inputRef.current?.blur();
       });

       const timer = setTimeout(() => {
         inputRef.current?.focus();
       }, 800);

       return () => {
         hideSubscription.remove();
         clearTimeout(timer);
       };
     }, []);

     useSmsOtpAutofill(setOtp);
   ```

`handleVerify`, the auto-submit effect, `handleResendOtp` (which still calls `startResendTimer()`), `renderStatus` and the JSX are unchanged. Effects still register in the original order: timer, keyboard and focus, SMS, auto-submit.

- [ ] **Step 8: Gate and commit**

```bash
npx prettier --write src/components/pages/auth src/navigation __tests__/src-structure.test.ts
npx tsc --noEmit && npx jest && npm run lint
git add -A
git commit -m "refactor(auth): auth screens under components/pages/auth, typed stack, side effects in hooks

Splash/Login/OTP/Complete Profile move to per-page folders. Screens use
AuthStackParamList instead of private copies. The phone-number hint,
resend countdown and SMS consent listener move verbatim into
use-phone-number-hint, use-resend-timer and use-sms-otp-autofill.
No behavior change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: all green before committing. If lint reports `react-hooks/exhaustive-deps` in either new hook, the `eslint-disable-next-line` comment has become separated from the `}, []);` line. It must sit on the line directly above that closing line.

---

### Task 6: Home page → `components/pages/home/`

**Files:**
- Rename: `src/features/home/` (the whole folder, including `components/`) → `src/components/pages/home/`
- Modify: `src/navigation/MainTabNavigator.tsx` and `__tests__/src-structure.test.ts`

**Interfaces:**
- Produces: `HomeScreen` from `@/components/pages/home/HomeScreen`. Its internal imports (`./components/*`) are unchanged.

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'features/home',`
- Append to `REQUIRED_PATHS`: `'components/pages/home/HomeScreen.tsx',` and `'components/pages/home/components/SectionHeader.tsx',`
- Append to `RETIRED_IMPORTS`: `/['"][^'"]*features\/home/,`

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL on those rows.

- [ ] **Step 2: Move the folder and repoint the navigator**

```bash
git mv src/features/home src/components/pages/home
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "'@/features/home/HomeScreen'" "'@/components/pages/home/HomeScreen'"
find src -type d -empty -delete
```

In `src/components/pages/home/HomeScreen.tsx`, the comment inside the JSX, ` footprint — TAB_BAR_HEIGHT plus its bottom safe-area inset. */}`, needs no change.

Run: `grep -rn "features/home" src CLAUDE.md`

Expected: the only hits are in `CLAUDE.md`, which Task 8 rewrites.

- [ ] **Step 3: Gate and commit**

```bash
npx prettier --write __tests__/src-structure.test.ts
npx tsc --noEmit && npx jest && npm run lint
git add -A
git commit -m "refactor(home): home screen under components/pages/home

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: all green before committing.

---

### Task 7: Profile pages → `components/pages/profile/` + `useEditProfile`

**Files:**
- Rename: `src/features/profile/ProfileScreen.tsx` → `src/components/pages/profile/ProfileScreen.tsx`
- Rename: `src/features/profile/components/` → `src/components/pages/profile/components/`
- Rename: `src/features/profile/EditProfileScreen.tsx` → `src/components/pages/profile/edit-profile/EditProfileScreen.tsx`
- Rename: `src/features/profile/profile-mock.ts` → `src/components/pages/profile/hooks/use-profile-counts.ts`
- Create: `src/components/pages/profile/edit-profile/hooks/use-edit-profile.ts`
- Modify: `src/navigation/ProfileNavigator.tsx`, `src/components/pages/profile/components/StatsCard.tsx` and `__tests__/src-structure.test.ts`

**Interfaces:**
- Consumes: `userApi` (Task 2), `EMAIL_REGEX` (Task 1), `useAppToast` (Task 3) and `ProfileStackParamList` (Task 1).
- Produces:
  - `useProfileCounts(): ProfileCounts` and `ProfileCounts` from `…/profile/hooks/use-profile-counts`.
  - `useEditProfile()` from `…/profile/edit-profile/hooks/use-edit-profile`, returning `{ firstName, setFirstName, lastName, setLastName, email, setEmail, countryCode, phoneNumber, errors, isLoading, isSaving, hasChanges, edit, handleSave }`.

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'features',`
- Append to `REQUIRED_PATHS`:
  ```ts
  'components/pages/profile/ProfileScreen.tsx',
  'components/pages/profile/components/StatsCard.tsx',
  'components/pages/profile/hooks/use-profile-counts.ts',
  'components/pages/profile/edit-profile/EditProfileScreen.tsx',
  'components/pages/profile/edit-profile/hooks/use-edit-profile.ts',
  ```
- Append to `RETIRED_IMPORTS`: `/['"][^'"]*features\//,` and `/['"][^'"]*profile-mock['"]/,`

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL on those rows.

- [ ] **Step 2: Move the profile files and fix relative imports**

```bash
mkdir -p src/components/pages/profile/hooks src/components/pages/profile/edit-profile/hooks
git mv src/features/profile/ProfileScreen.tsx src/components/pages/profile/ProfileScreen.tsx
git mv src/features/profile/components src/components/pages/profile/components
git mv src/features/profile/EditProfileScreen.tsx src/components/pages/profile/edit-profile/EditProfileScreen.tsx
git mv src/features/profile/profile-mock.ts src/components/pages/profile/hooks/use-profile-counts.ts
find src -type d -empty -delete
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "from './profile-mock'" "from './hooks/use-profile-counts'"
rewrite "from '../profile-mock'" "from '../hooks/use-profile-counts'"
rewrite "'@/features/profile/ProfileScreen'" "'@/components/pages/profile/ProfileScreen'"
rewrite "'@/features/profile/EditProfileScreen'" "'@/components/pages/profile/edit-profile/EditProfileScreen'"
```

In `src/components/pages/profile/edit-profile/EditProfileScreen.tsx`, change the four `./components/…` imports to `../components/…`:

```ts
import { Avatar } from '../components/Avatar';
import { AvatarSheet } from '../components/AvatarSheet';
import { PillButton } from '../components/PillButton';
import { VerifiedChip } from '../components/VerifiedChip';
```

Run: `npx tsc --noEmit`

Expected: 0 errors. `ls src/features` should fail with "No such file or directory".

- [ ] **Step 3: Create `use-edit-profile.ts` (moved verbatim)**

`src/components/pages/profile/edit-profile/hooks/use-edit-profile.ts`:

```ts
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
```

Before moving on, diff the hook against the screen's current body:

Run: `diff <(sed -n '/const toast = useAppToast/,/}, \[email, firstName/p' src/components/pages/profile/edit-profile/EditProfileScreen.tsx) <(sed -n '/const toast = useAppToast/,/}, \[email, firstName/p' src/components/pages/profile/edit-profile/hooks/use-edit-profile.ts)`

Expected: the output shows exactly three removed (`<`) lines and nothing else:
- `const avatarId = useProfileStore(state => state.avatarId);`
- `const setAvatar = useProfileStore(state => state.setAvatar);`
- `const [isSheetOpen, setSheetOpen] = useState(false);`

Any other difference means a logic line was altered in the move. Fix the hook to match the screen.

- [ ] **Step 4: Reduce `EditProfileScreen` to JSX plus the avatar sheet**

In `src/components/pages/profile/edit-profile/EditProfileScreen.tsx`, replace everything from the first line of the file down to (not including) `  return (` with:

```tsx
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

```

The JSX from `  return (` to the end of the file, including the trailing `styles`, stays exactly as it is.

Run: `git add -A && git diff --cached -M HEAD -- src/features/profile/EditProfileScreen.tsx src/components/pages/profile/edit-profile/EditProfileScreen.tsx`

Expected: the file shows as a rename. Every changed line is above `return (`, and nothing from `return (` down has changed.

- [ ] **Step 5: Gate and commit**

```bash
npx prettier --write src/components/pages/profile src/navigation __tests__/src-structure.test.ts
npx tsc --noEmit && npx jest && npm run lint
git add -A
git commit -m "refactor(profile): profile screens under components/pages/profile, form logic in useEditProfile

ProfileScreen, its components and Edit Profile move to per-page folders.
profile-mock becomes hooks/use-profile-counts (still mock, same seam).
Edit Profile's fetch/edit/validate/save move verbatim into
useEditProfile; the screen keeps the JSX and the avatar sheet.
src/features/ is gone. No behavior change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: all green before committing.

---

### Task 8: Routing layer → `src/app/`, typed tabs, docs, final verification

**Files:**
- Rename: `src/navigation/{RootNavigator,AuthNavigator,MainTabNavigator,ProfileNavigator}.tsx` → `src/app/`
- Modify: `App.tsx`, `src/app/MainTabNavigator.tsx`, `src/app/RootNavigator.tsx`, `src/app/AuthNavigator.tsx`, `CLAUDE.md` and `__tests__/src-structure.test.ts`

**Interfaces:**
- Consumes: `MainTabParamList` (Task 1), `CustomTabBar` (Task 4), `HomeScreen` (Task 6) and `ProfileNavigator` (Task 7's screens).
- Produces: `RootNavigator` from `./src/app/RootNavigator`, the only thing `App.tsx` renders inside `AppProviders`.

- [ ] **Step 1: Extend the architecture test so it fails**

In `__tests__/src-structure.test.ts`:
- Append to `RETIRED_PATHS`: `'navigation',`
- Append to `REQUIRED_PATHS`: `'app/RootNavigator.tsx',`, `'app/AuthNavigator.tsx',`, `'app/MainTabNavigator.tsx',` and `'app/ProfileNavigator.tsx',`
- Append to `RETIRED_IMPORTS`: `/['"]@\/navigation\//,` and `/['"][^'"]*src\/navigation\//,`

Run: `npx jest __tests__/src-structure.test.ts`

Expected: FAIL on those rows.

- [ ] **Step 2: Move the navigators**

```bash
git mv src/navigation src/app
rewrite() { grep -rlF -- "$1" src App.tsx __tests__ 2>/dev/null | xargs -r sed -i "s#$1#$2#g"; }
rewrite "'./src/navigation/RootNavigator'" "'./src/app/RootNavigator'"
rewrite "'../store/auth.store'" "'@/store/auth.store'"
rewrite "'@/navigation/ProfileNavigator'" "'./ProfileNavigator'"
```

Run: `grep -rn "from '\.\./" src/app`

Expected: no output. Every import in `src/app/` is now `@/…` or `./…`.

- [ ] **Step 3: Type the tab navigator**

In `src/app/MainTabNavigator.tsx`, replace the import block and the declarations above `export const MainTabNavigator` with:

```tsx
import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from '@react-navigation/native';
import { HomeScreen } from '@/components/pages/home/HomeScreen';
import { PlaceholderScreen } from '@/components/custom/PlaceholderScreen';
import { CustomTabBar } from '@/components/layout/CustomTabBar';
import type { MainTabParamList } from '@/types/navigation.types';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const SavedScreen = () => <PlaceholderScreen name="Saved Items" />;
const OrdersScreen = () => <PlaceholderScreen name="Order History" />;

const renderCustomTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} />
);

/**
 * Screens inside a tab's stack that own the whole viewport.
 *
 * CustomTabBar honours `display: 'none'` here the way the default bar does,
 * so this is the one place that decides it — the screen itself stays unaware
 * of the navigator it happens to be mounted in.
 */
const FULL_SCREEN_ROUTES = ['EditProfile'];

const HIDDEN = { display: 'none' } as const;

const tabBarVisibility = ({
  route,
}: {
  route: RouteProp<MainTabParamList, 'Profile'>;
}) => {
  const focused = getFocusedRouteNameFromRoute(route);
  return {
    tabBarStyle:
      focused && FULL_SCREEN_ROUTES.includes(focused) ? HIDDEN : undefined,
  };
};
```

`export const MainTabNavigator = () => { … }` below it is unchanged.

Run: `npx tsc --noEmit`

Expected: 0 errors.

- [ ] **Step 4: Rewrite the stale sections of `CLAUDE.md`**

In `CLAUDE.md`, replace everything from the line `### Entry Point Chain` down to (not including) the line `### Styling` with:

````markdown
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

Dependency direction (enforced): `store/` never imports UI; `lib/` never imports UI, stores or hooks; `types/` and `constants/` are leaves; `components/ui/` imports only `types/` and `constants/`; only `lib/api/` touches `api-client`; only `src/app/` imports from `@/app`. A component used by one page lives in that page's `components/`; used by several, it moves to `components/custom/` (or `ui/` if it is a token-only primitive).

### Navigation

All param lists live in `src/types/navigation.types.ts`; screens never import a navigator file.

- `src/app/RootNavigator.tsx` — `AuthNavigator` when signed out, `CompleteProfileScreen` until both names are on file, otherwise `MainTabNavigator`
- `AuthNavigator` — native stack: Splash → Login → OtpVerification
- `MainTabNavigator` — bottom tabs with `CustomTabBar`: Home, Saved, Orders, Profile (Saved and Orders are placeholders)
- `ProfileNavigator` — the Profile tab's stack: ProfileMain → EditProfile (tab bar hidden on EditProfile)

### State Management

Zustand stores in `src/store/`:

- `auth.store.ts` — session: `isAuthenticated`, `user`, tokens, `profileCompleted`; `setAuth()`, `rehydrate()`, `updateUser()`, `logout()`. Persists to MMKV through `src/lib/storage.ts`.
- `cart.store.ts` — cart items, `totalItems()`, `totalAmount()`, `quantityOf()`
- `profile.store.ts` — device-local avatar choice (`src/constants/avatars.ts`)
````

Then, still in `CLAUDE.md`, replace everything from the line `### Current State` down to (not including) `### Dish Photography` with:

````markdown
### Current State

Auth and profile talk to the real API: `src/lib/api/auth/auth-api.ts` (send/verify/resend OTP, logout) and `src/lib/api/user/user-api.ts` (GET/PATCH `/user/profile`), through the Axios instance in `src/lib/api/api-client.ts`. The planned stack for the rest of the backend integration: TanStack React Query v5 (data sync), Socket.IO Client (real-time orders).

**The home screen is mock-only by design.** Everything it renders comes from `src/data/menu.ts` (125 dishes) and `src/data/restaurant.ts` (hours, rating, ETA, distance). `HomeScreen`'s loading state is a `setTimeout`, not a request. There are no network calls anywhere in `src/components/pages/home/`. The profile screen's counts are mock too (`src/components/pages/profile/hooks/use-profile-counts.ts`).

When the API phase starts, these are the seams:

| Swap | Keep |
| --- | --- |
| the bodies of `src/data/menu.ts` and `src/data/restaurant.ts` | From `menu`: `CATEGORIES`, `byId`, `bestsellers()`, `byCategory()`. From `restaurant`: `isOpenAt()`, `SERVICE`, `OPENS_AT_LABEL`. |
| `HomeScreen`'s `isLoading` `setTimeout` | the `SkeletonRail` it already gates |
| the `require()` values in `src/data/dish-images.ts`, swapped for API URLs | `DISH_IMAGES`' slug keys, and `ImageTile`, which renders either a bundled module or a URL |
| the body of `useProfileCounts` | its `ProfileCounts` return shape |

`priceOf()` exists in `menu.ts` for deferred portion pricing (not yet active in the home screen) — preserve it during the swap even though the home screen does not yet import it.

New endpoints go in `src/lib/api/endpoints.ts` and a `src/lib/api/<domain>/<domain>-api.ts` module; wire types stay in `src/types/api.types.ts` and are mapped to app types inside the API module.

### Shared Data

Shared mock data lives in `src/data/` (`menu.ts`, `restaurant.ts`) and its types in `src/types/`. Page-only components live in `src/components/pages/<feature>/components/`; anything reusable belongs in `src/components/custom/` or, if it is a token-only primitive, `src/components/ui/`.
````

The `### Styling` and `### Path Alias` sections sit between the two replaced ranges and stay as they are. The second replacement also retires the old `### Feature Folder Convention` section, which `### Folder Structure` and `### Shared Data` now cover.

Run: `grep -nE "src/(features|services|navigation|utils)/|src/api/|components/(common|navigation)/|useThemeStore|skipAuth|Home, Menu, Orders" CLAUDE.md`

Expected: no output.

The two memory notes (`home-is-mock-until-api-phase.md` and `imagetile-defers-photography.md`) name only `src/data/*` and `src/components/ui/ImageTile.tsx`. Both paths are unchanged, so no edit is needed. Confirm with `grep -n "features\|services\|navigation/" "C:/Users/MohammedFazil-PC/.claude/projects/d--JJs-JJs-Kitchen-App/memory/"*.md`, which should print nothing.

- [ ] **Step 5: Full gate + final sweep**

```bash
npx prettier --write App.tsx src/app __tests__/src-structure.test.ts CLAUDE.md
npx tsc --noEmit && npx jest && npm run lint
grep -rnE "@/(features|services|utils|navigation)/|@/api/|components/(common|navigation)/|src/(features|services|utils|navigation|api)/" src App.tsx __tests__ --include=*.ts --include=*.tsx | grep -v src-structure.test.ts
find src -type d -empty
git status --short
```

Expected:
- tsc exits 0.
- Jest passes. That's the 378 baseline tests plus the new `src-structure`, `auth-store`, `auth-api` and `user-api` tests.
- Lint is clean.
- The grep prints nothing, and `find` prints nothing.
- `git status` lists only this task's changes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(app): navigators become the src/app routing layer; docs for the new structure

navigation/ -> app/, the tab navigator is typed with MainTabParamList,
and App.tsx renders ./src/app/RootNavigator. CLAUDE.md now documents the
t-genius-style layout, naming and dependency rules, and corrects the
stale theme-store, tab-list and all-mock claims. No behavior change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Device pass (human sign-off, the acceptance criterion)**

The moves change module paths, so Metro's haste map must be rebuilt:

```bash
npm run start:reset
```

In a second terminal:

```bash
npm run android
```

Hand this checklist to the user, and do not mark the plan complete until they confirm each item:

1. Fresh install, or clear app data. The splash plays about 4s and lands on Login.
2. Android: the phone-number hint picker opens about 0.5s after Login appears. Picking a number fills its last 10 digits. Dismissing it leaves the field empty with no error.
3. "Send code" on 10 digits shows the success toast and opens OTP with the number shown as `+91 XXXXX XXXXX`.
4. OTP: the countdown runs `Resend in 0:59` … `0:00`, then "Resend code" appears. Tapping it shows "Sending code...", then the toast, and the countdown restarts at 0:59.
5. OTP: the keyboard auto-focuses after about 0.8s. On Android an SMS consent dialog appears, and "Allow" fills the 6 digits and auto-verifies.
6. OTP: typing the 6th digit auto-verifies. A wrong code shows the error, and editing the code re-arms auto-verify.
7. OTP back chevron: returns to Login with the phone prefilled, and the hint picker does **not** open.
8. New account: Complete Profile, step 1 (names) then step 2 (email, Skip). This lands on Home.
9. Home: rails load after the skeleton, the cart bar clears the floating tab bar, and the tab bar shows Home, Saved, Orders, Profile.
10. Profile: header, stats (5 / 8 / 3), the rows, and the notifications badge (2).
11. Edit Profile:
    - The tab bar is hidden.
    - The fields prefill and then refresh from the server.
    - Typing before the refresh lands keeps the typed text.
    - Invalid email shows an error.
    - Save returns to Profile with a "Profile saved" toast.
12. Avatar sheet from Profile and from Edit Profile: picking and saving updates the avatar everywhere.
13. Logout from Profile → Login. Sign in again: the avatar is back to the default flame.
14. Kill and relaunch while signed in. You land on Home, not Login and not Complete Profile.

If any item differs from `dev`, stop and use superpowers:systematic-debugging on that item. The fix belongs in the task that touched that code.
