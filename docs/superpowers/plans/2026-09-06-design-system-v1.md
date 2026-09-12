# JJ's Kitchen Design System v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retheme the entire app to the JJ's Kitchen Design System v1.0 (Charcoal + Ember), with every color, type style, spacing, radius and elevation value resolving from `src/global.css`.

**Architecture:** `src/global.css` holds three layers — a raw palette of the PDF's swatches, a semantic layer that deliberately occupies HeroUI Native's own CSS variable names (so all 39 of its components inherit the theme without wrappers), and a `@theme inline` block exposing everything as Tailwind utilities. A small kit of token-only primitives in `src/components/ui/` covers what HeroUI doesn't. A ratcheting Jest guard enforces that no hardcoded value survives.

**Tech Stack:** React Native 0.85 (CLI), TypeScript strict, Tailwind v4 via Uniwind, HeroUI Native 1.0, Zustand, Reanimated 4, Jest.

**Spec:** `docs/superpowers/specs/2026-09-06-design-system-v1-design.md`

## Global Constraints

- **The PDF is the source of truth.** Implement its values exactly as written. Two known contrast gaps (Muted on Cream 50 at 3.76:1; White on Ember 500 at 3.46:1) are documented in the spec's Contrast audit and are **not** to be "fixed" during implementation.
- **No hex literal may appear anywhere under `src/` except `src/global.css`.** Not in `StyleSheet.create`, not in a `color` prop, not in a constants object.
- **No `dark:` Tailwind variant anywhere.** One palette renders in both device color schemes.
- **No `StyleSheet.create` for anything Tailwind can express** (existing CLAUDE.md rule). Layout-only styles that Tailwind cannot express (e.g. `position: absolute` offsets driven by runtime values) may remain.
- **Weight is selected by font family name** (`font-jakarta-600`), never by `fontWeight`. React Native cannot synthesize weights from a static face.
- **Path alias:** `@/*` → `src/*`.
- **Prettier:** single quotes, trailing commas. Run `npm run lint` before every commit.
- **Bricolage is used at ≥24px only** (PDF section 02). Everything at 20px and below is Plus Jakarta Sans.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/global.css` | **The** source of truth. Raw palette, semantic tokens (incl. HeroUI overrides), `@theme inline` utility exposure. |
| `react-native.config.js` | Points the asset linker at `src/assets/fonts`. |
| `src/assets/fonts/*.ttf` | 9 static font instances + 2 OFL licenses. |
| `__tests__/design-tokens.test.ts` | Ratcheting guard: no hex, no `dark:`, no dead imports. |
| `__tests__/global-css-contract.test.ts` | Asserts every PDF swatch and every HeroUI variable name is present with the exact value. |
| `src/components/ui/Text.tsx` | Type scale as a `variant` prop. The only place font families are named. |
| `src/components/ui/Button.tsx` | 6 button variants over HeroUI `Button`. |
| `src/components/ui/TextField.tsx` | Label + input + error, with focus/error/disabled states. |
| `src/components/ui/OtpInput.tsx` | 6-digit OTP with hidden input and slot rendering. |
| `src/components/ui/Badges.tsx` | `VegBadge`, `RatingBadge`, `Tag`, `SpiceBadge`. |
| `src/components/ui/PriceTag.tsx` | Price, strike-through, Full/Half portion. |
| `src/components/ui/CategoryChip.tsx` | Horizontal filter chip. |
| `src/components/ui/Segmented.tsx` | Takeaway / Dine-in service mode. |
| `src/components/ui/QuantityStepper.tsx` | `ADD` → `− n +`. |
| `src/components/ui/FoodCard.tsx` | List and grid food item card. Replaces `FoodListItem`. |
| `src/components/ui/AppBar.tsx` | `TopAppBar` + `LocationBar`. |
| `src/components/ui/States.tsx` | `EmptyState`, `ErrorState`, `SkeletonCard`. |
| `src/components/ui/OrderTimeline.tsx` | Order status timeline. |
| `src/components/ui/index.ts` | Barrel export. |

**Deleted:** `src/theme/index.ts`, `src/store/theme.store.ts`, `src/features/auth/complete-profile/components/styles.ts`, `src/features/auth/complete-profile/components/GlassInput.tsx`, `src/components/common/FoodListItem.tsx`.

## A note on test strategy

This is a theming migration. The regressions that actually happen are: a hex literal survives somewhere, a token is typo'd, or a `dark:` variant lingers. All three are caught by static analysis of the source tree, which is what Tasks 1 and 3 build — and Task 1's allowlist is the TDD driver for every subsequent task (remove entries → test goes red → do the work → green).

`@testing-library/react-native` is deliberately **not** added. Render-testing that `<Text variant="h1">` produces the string `"font-bricolage-700 text-h1"` asserts the implementation back at itself and would not catch any of the three real failure modes. Visual correctness is verified on device, per task.

---

### Task 1: Ratcheting token guard

Builds the enforcement mechanism first, with every currently-violating file allowlisted so it passes green today. Each later task deletes entries from the allowlist — that deletion is the failing test that drives the work.

**Files:**
- Create: `__tests__/design-tokens.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `ALLOWLIST` array in `__tests__/design-tokens.test.ts` — later tasks remove exact string entries from it.

- [ ] **Step 1: Write the guard test**

Create `__tests__/design-tokens.test.ts`:

```ts
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/**
 * Files that still carry pre-migration hardcoded styling.
 *
 * Every task in the Design System v1.0 migration removes entries from this
 * list. It must reach []. Never add an entry — if a new file needs a color,
 * the color belongs in src/global.css as a token.
 */
const ALLOWLIST: string[] = [
  'components/common/FoodListItem.tsx',
  'components/common/PlaceholderScreen.tsx',
  'components/navigation/CustomTabBar.tsx',
  'features/auth/LoginScreen.tsx',
  'features/auth/OtpVerificationScreen.tsx',
  'features/auth/SplashScreen.tsx',
  'features/auth/complete-profile/EmailStep.tsx',
  'features/auth/complete-profile/NameStep.tsx',
  'features/auth/complete-profile/index.tsx',
  'features/auth/complete-profile/components/GlassInput.tsx',
  'features/auth/complete-profile/components/styles.ts',
  'features/home/HomeScreen.tsx',
  'features/profile/ProfileScreen.tsx',
  'theme/index.ts',
];

/** Directories and files the guard never inspects. */
const SKIP_DIRS = ['assets', 'node_modules'];
const SKIP_FILES = ['global.css', 'uniwind-types.d.ts', 'env.d.ts'];

const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{1,5})?\b/;
const DARK_VARIANT = /(?:^|["'`\s{])dark:/;
const DEAD_IMPORT = /from\s+['"](?:@\/)?(?:\.\.\/)*(?:store\/theme\.store|theme(?:\/index)?)['"]/;

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      collect(path.join(dir, entry.name), out);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (SKIP_FILES.includes(entry.name)) continue;
    out.push(path.join(dir, entry.name));
  }
  return out;
}

/** Source files under src/, plus App.tsx, as paths relative to src/. */
function sourceFiles(): { rel: string; abs: string }[] {
  const files = collect(SRC).map(abs => ({
    rel: path.relative(SRC, abs).split(path.sep).join('/'),
    abs,
  }));
  files.push({ rel: '../App.tsx', abs: path.join(ROOT, 'App.tsx') });
  return files;
}

/** Returns "line-number: line-content" for each line matching pattern. */
function offendingLines(abs: string, pattern: RegExp): string[] {
  return fs
    .readFileSync(abs, 'utf8')
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, n }) => `${n}: ${line.trim()}`);
}

describe('design token guard', () => {
  const files = sourceFiles();

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files.filter(f => !ALLOWLIST.includes(f.rel)))(
    '$rel has no hardcoded hex color',
    ({ rel, abs }) => {
      // Compared as a string so a failure prints the offending line, not just "[]".
      const hits = offendingLines(abs, HEX);
      expect(`${rel}: ${hits.join(' | ')}`).toBe(`${rel}: `);
    },
  );

  it.each(files.filter(f => !ALLOWLIST.includes(f.rel)))(
    '$rel has no dark: variant',
    ({ rel, abs }) => {
      const hits = offendingLines(abs, DARK_VARIANT);
      expect(`${rel}: ${hits.join(' | ')}`).toBe(`${rel}: `);
    },
  );

  it.each(files)('$rel does not import a deleted theme module', ({ rel, abs }) => {
    const hits = offendingLines(abs, DEAD_IMPORT);
    expect(`${rel}: ${hits.join(' | ')}`).toBe(`${rel}: `);
  });

  it('allowlist only names files that exist', () => {
    const missing = ALLOWLIST.filter(
      rel => !fs.existsSync(path.join(SRC, rel)),
    );
    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test — it must pass green**

Run: `npx jest __tests__/design-tokens.test.ts`
Expected: PASS. Every violating file is allowlisted, so only clean files are asserted. If a file you did not expect fails, add it to `ALLOWLIST` **only if** it genuinely predates this migration.

- [ ] **Step 3: Prove the guard actually catches violations**

Temporarily add a hex to a non-allowlisted file:

```bash
echo "// #ABCDEF" >> src/store/cart.store.ts
npx jest __tests__/design-tokens.test.ts
```

Expected: FAIL on `store/cart.store.ts has no hardcoded hex color`.

Now revert:

```bash
git checkout src/store/cart.store.ts
npx jest __tests__/design-tokens.test.ts
```

Expected: PASS. A guard that cannot fail is not a guard — this step is not optional.

- [ ] **Step 4: Commit**

```bash
git add __tests__/design-tokens.test.ts
git commit -m "test: add ratcheting design token guard

Fails on hardcoded hex colors, dark: variants, and imports of the theme
modules being removed. Pre-migration files are allowlisted; the
Design System v1.0 migration empties that list task by task.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Font pipeline

Nine static instances, correctly named so Android (resolves by filename) and iOS (resolves by PostScript name) both land on the same string. Verified: for both families the PostScript name is identical to the filename stem.

**Files:**
- Create: `src/assets/fonts/` (9 `.ttf` + 2 `OFL.txt`)
- Create: `react-native.config.js`
- Modify: `package.json` (add `fonts:link` script)

**Interfaces:**
- Produces: font family strings usable as React Native `fontFamily` values —
  `BricolageGrotesque-Regular`, `BricolageGrotesque-SemiBold`, `BricolageGrotesque-Bold`, `BricolageGrotesque-ExtraBold`,
  `PlusJakartaSans-Regular`, `PlusJakartaSans-Medium`, `PlusJakartaSans-SemiBold`, `PlusJakartaSans-Bold`, `PlusJakartaSans-ExtraBold`.
  Task 3 maps these to `--font-*` tokens; Task 5 consumes those tokens.

- [ ] **Step 1: Download the fonts**

Note the differing default branches: Bricolage is on `main`, Plus Jakarta Sans is on `master`. Use the **default-width, default-optical-size** Bricolage files — not the `12pt` or `Condensed` variants.

```bash
mkdir -p src/assets/fonts

BRI="https://raw.githubusercontent.com/ateliertriay/bricolage/main/fonts/ttf"
for w in Regular SemiBold Bold ExtraBold; do
  curl -sSL -o "src/assets/fonts/BricolageGrotesque-$w.ttf" "$BRI/BricolageGrotesque-$w.ttf"
done
curl -sSL -o src/assets/fonts/BricolageGrotesque-OFL.txt \
  "https://raw.githubusercontent.com/ateliertriay/bricolage/main/OFL.txt"

PJS="https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf"
for w in Regular Medium SemiBold Bold ExtraBold; do
  curl -sSL -o "src/assets/fonts/PlusJakartaSans-$w.ttf" "$PJS/PlusJakartaSans-$w.ttf"
done
curl -sSL -o src/assets/fonts/PlusJakartaSans-OFL.txt \
  "https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/OFL.txt"
```

- [ ] **Step 2: Verify every file is a real font, not an HTML error page**

```bash
ls -la src/assets/fonts/
```

Expected: 9 `.ttf` files, each **> 50,000 bytes**, plus 2 `.txt` files. A file of a few hundred bytes is a GitHub 404 page — re-check the URL and branch before continuing.

Confirm the PostScript names match the filenames (this is what makes iOS work):

```bash
node -e "
const fs=require('fs');
for (const f of fs.readdirSync('src/assets/fonts').filter(x=>x.endsWith('.ttf'))) {
  const b=fs.readFileSync('src/assets/fonts/'+f);
  const num=b.readUInt16BE(4); let off=12,nameOff=0;
  for(let i=0;i<num;i++){ if(b.toString('ascii',off,off+4)==='name') nameOff=b.readUInt32BE(off+8); off+=16; }
  const cnt=b.readUInt16BE(nameOff+2), str=nameOff+b.readUInt16BE(nameOff+4);
  for(let i=0;i<cnt;i++){ const r=nameOff+6+i*12;
    if(b.readUInt16BE(r+6)===6){ const l=b.readUInt16BE(r+8),o=b.readUInt16BE(r+10);
      const ps=b.toString('utf8',str+o,str+o+l).replace(/\0/g,'');
      console.log(ps===f.replace('.ttf','')?'OK  ':'MISMATCH', f, '->', ps); break; } }
}"
```

Expected: nine `OK` lines. Any `MISMATCH` must be resolved before proceeding — it means iOS will not find that face.

- [ ] **Step 3: Create the asset linker config**

Create `react-native.config.js`:

```js
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts'],
};
```

- [ ] **Step 4: Add a link script and run it**

Add to `package.json` `"scripts"`:

```json
"fonts:link": "react-native-asset"
```

Run:

```bash
npx react-native-asset
```

- [ ] **Step 5: Verify the fonts landed in the Android project**

```bash
ls android/app/src/main/assets/fonts/
```

Expected: the same 9 `.ttf` files. If the directory does not exist, `react-native-asset` did not run — copy them manually as a fallback:

```bash
mkdir -p android/app/src/main/assets/fonts
cp src/assets/fonts/*.ttf android/app/src/main/assets/fonts/
```

- [ ] **Step 6: Verify a font actually renders on device**

Temporarily add to the `<Text>` in `src/components/common/PlaceholderScreen.tsx`:

```tsx
<Text style={{ fontFamily: 'BricolageGrotesque-ExtraBold', fontSize: 32 }}>
  Tandoori Nights
</Text>
```

Then:

```bash
adb uninstall com.jjskitchen.app
npm run android
```

Navigate to any placeholder tab. Expected: the text renders in a distinctly geometric, wide display face — clearly not the system default. If it falls back to the system font, the fonts are not linked; do not proceed past this step.

Revert the temporary change:

```bash
git checkout src/components/common/PlaceholderScreen.tsx
```

- [ ] **Step 7: Commit**

```bash
git add src/assets/fonts react-native.config.js package.json android/app/src/main/assets
git commit -m "feat: bundle Bricolage Grotesque and Plus Jakarta Sans

Nine static instances from the upstream OFL repositories. PostScript names
match filenames so Android and iOS resolve identically. Linked via
react-native-asset.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Rewrite `global.css` as the single source of truth

**Files:**
- Modify: `src/global.css` (full rewrite)
- Delete: `src/theme/index.ts`
- Create: `__tests__/global-css-contract.test.ts`
- Modify: `__tests__/design-tokens.test.ts` (remove `theme/index.ts` from `ALLOWLIST`)

**Interfaces:**
- Consumes: font family strings from Task 2.
- Produces: the utility vocabulary every later task uses —
  colors `bg-canvas bg-hero bg-surface bg-sunken bg-ember bg-ember-tint bg-saffron bg-veg bg-non-veg text-ink text-muted text-ember text-veg text-non-veg text-on-ember text-on-hero border-hairline`;
  type `text-display text-h1 text-h2 text-title text-item text-body text-caption`;
  families `font-bricolage-{400,600,700,800} font-jakarta-{400,500,600,700,800}`;
  radius `rounded-{sm,md,lg,xl,sheet,pill}`;
  spacing `{p,m,gap}-{xs,sm,md,lg,xl,2xl}`;
  elevation `shadow-{e1,e2,e3,ember-glow}`.

- [ ] **Step 1: Write the contract test**

Create `__tests__/global-css-contract.test.ts`:

```ts
import fs from 'fs';
import path from 'path';

const CSS = fs.readFileSync(
  path.resolve(__dirname, '../src/global.css'),
  'utf8',
);

/** Reads a custom property's declared value, e.g. varValue('--ink-900'). */
function varValue(name: string): string | null {
  const m = CSS.match(
    new RegExp(`${name.replace(/[-]/g, '\\-')}\\s*:\\s*([^;]+);`),
  );
  return m ? m[1].trim() : null;
}

describe('global.css — PDF palette', () => {
  // Section 01 of the design system PDF, verbatim.
  const SWATCHES: Record<string, string> = {
    '--ink-900': '#14100d',
    '--ink-800': '#211811',
    '--ink-700': '#2e241b',
    '--ink-600': '#4a3d30',
    '--ember-500': '#ec5b13',
    '--ember-600': '#cd4a0a',
    '--saffron-400': '#f6a623',
    '--ember-50': '#fbe7d6',
    '--cream-50': '#fbf7f1',
    '--surface-0': '#ffffff',
    '--sand-100': '#f3ece1',
    '--border-warm': '#e7ddcc',
    '--muted-warm': '#8a7d6c',
    '--veg': '#147d3a',
    '--non-veg': '#9e2a1b',
    '--chili': '#c22a1b',
    '--warning-amber': '#e08a00',
    '--info-teal': '#0e7c86',
  };

  it.each(Object.entries(SWATCHES))('%s is %s', (name, expected) => {
    expect(varValue(name)?.toLowerCase()).toBe(expected);
  });
});

describe('global.css — HeroUI Native contract is overridden', () => {
  // Every variable heroui-native components read. Overriding these is what
  // rethemes the library without per-component wrappers.
  const HEROUI_VARS = [
    '--background',
    '--foreground',
    '--surface',
    '--surface-foreground',
    '--surface-secondary',
    '--surface-tertiary',
    '--overlay',
    '--overlay-foreground',
    '--backdrop',
    '--muted',
    '--default',
    '--default-foreground',
    '--accent',
    '--accent-foreground',
    '--field-background',
    '--field-foreground',
    '--field-placeholder',
    '--field-border',
    '--success',
    '--warning',
    '--danger',
    '--border',
    '--separator',
    '--focus',
    '--link',
    '--radius',
  ];

  it.each(HEROUI_VARS)('%s is defined', name => {
    expect(varValue(name)).not.toBeNull();
  });
});

describe('global.css — no legacy palette survives', () => {
  const RETIRED = ['#170c79', '#8e05c2', '#efe3ca', '#3e065f', '#56b6c6'];

  it.each(RETIRED)('%s is gone', hex => {
    expect(CSS.toLowerCase()).not.toContain(hex);
  });

  it('declares no -dark token variants', () => {
    expect(CSS).not.toMatch(/--[a-z-]+-dark\s*:/);
  });
});

describe('global.css — type scale', () => {
  const STEPS = ['display', 'h1', 'h2', 'title', 'item', 'body', 'caption'];

  it.each(STEPS)('--text-%s has a size and a line height', step => {
    expect(varValue(`--text-${step}`)).not.toBeNull();
    expect(varValue(`--text-${step}--line-height`)).not.toBeNull();
  });

  const FAMILIES = [
    '--font-bricolage-400',
    '--font-bricolage-600',
    '--font-bricolage-700',
    '--font-bricolage-800',
    '--font-jakarta-400',
    '--font-jakarta-500',
    '--font-jakarta-600',
    '--font-jakarta-700',
    '--font-jakarta-800',
  ];

  it.each(FAMILIES)('%s is defined', name => {
    expect(varValue(name)).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest __tests__/global-css-contract.test.ts`
Expected: FAIL — the current `global.css` has none of these tokens and still contains `#170c79`.

- [ ] **Step 3: Rewrite `src/global.css`**

Replace the entire file:

```css
@import 'tailwindcss';
@import 'uniwind';
@import 'heroui-native/styles';

/* Tell Tailwind v4 to scan heroui-native source files for className strings */
@source "../node_modules/heroui-native/src";
@source "../node_modules/heroui-native/lib";

/* ============================================================================
   JJ's Kitchen — Design System v1.0
   Source of truth: "Mobile app design scope.pdf"

   THIS FILE IS THE ONLY PLACE A COLOR, TYPE STYLE, RADIUS, SPACING OR
   ELEVATION VALUE IS ALLOWED TO EXIST. Everything else in the app consumes
   these tokens through Tailwind utilities.

   One palette renders in BOTH light and dark device schemes — there are
   deliberately no `-dark` token variants and no `dark:` variants in the app.

   Layer A  raw palette      the PDF's literal swatches
   Layer B  semantic tokens  meaning, and HeroUI Native's variable contract
   Layer C  @theme inline    exposure as Tailwind utilities
   ========================================================================= */

/* ---------------------------------------------------------------------------
   LAYER A · RAW PALETTE (PDF section 01)
   Never reference these from a component. Layer B is the public surface.
   ------------------------------------------------------------------------ */
:root {
  /* CHARCOAL · immersive & hero surfaces */
  --ink-900: #14100d; /* hero, splash */
  --ink-800: #211811; /* surfaces */
  --ink-700: #2e241b; /* text strong */
  --ink-600: #4a3d30; /* muted / dark */

  /* EMBER & SAFFRON · primary action */
  --ember-500: #ec5b13; /* buttons, active */
  --ember-600: #cd4a0a; /* pressed / hover */
  --saffron-400: #f6a623; /* highlights */
  --ember-50: #fbe7d6; /* tint bg */

  /* NEUTRALS · content surfaces */
  --cream-50: #fbf7f1; /* app canvas */
  --surface-0: #ffffff; /* cards */
  --sand-100: #f3ece1; /* sunken / chips */
  --border-warm: #e7ddcc; /* hairlines */
  --muted-warm: #8a7d6c; /* captions */

  /* FUNCTIONAL · veg / non-veg & semantic tokens */
  --veg: #147d3a;
  --non-veg: #9e2a1b;
  --chili: #c22a1b;
  --warning-amber: #e08a00;
  --info-teal: #0e7c86;
}

/* ---------------------------------------------------------------------------
   LAYER B · SEMANTIC TOKENS

   The names below are NOT arbitrary. Everything from `--background` down to
   `--radius` is the variable contract that heroui-native's 39 components read
   internally. heroui-native declares them inside `@layer theme`; an unlayered
   `:root` block outbids a layered one in the CSS cascade, so redefining them
   here rethemes the entire component library at once — no wrappers, no
   per-component overrides.

   Consequence worth knowing: src/hooks/useAppToast.tsx needs no changes. It
   delegates to HeroUI's success/danger/warning/accent variants and therefore
   inherits this palette for free. That is the pattern to aim for everywhere.
   ------------------------------------------------------------------------ */
:root {
  /* — heroui-native contract — */
  --background: var(--cream-50);
  --foreground: var(--ink-800);

  --surface: var(--surface-0);
  --surface-foreground: var(--ink-800);
  --surface-secondary: var(--sand-100);
  --surface-secondary-foreground: var(--ink-800);
  --surface-tertiary: var(--border-warm);
  --surface-tertiary-foreground: var(--ink-800);

  --overlay: var(--surface-0);
  --overlay-foreground: var(--ink-800);
  --backdrop: rgba(20, 16, 13, 0.45);

  --muted: var(--muted-warm);

  --default: var(--sand-100);
  --default-foreground: var(--ink-800);

  --accent: var(--ember-500);
  --accent-foreground: var(--surface-0);

  --field-background: var(--surface-0);
  --field-foreground: var(--ink-800);
  --field-placeholder: var(--muted-warm);
  --field-border: var(--border-warm);

  --success: var(--veg);
  --success-foreground: var(--surface-0);
  --warning: var(--warning-amber);
  --warning-foreground: var(--ink-900);
  --danger: var(--chili);
  --danger-foreground: var(--surface-0);

  --border: var(--border-warm);
  --separator: var(--border-warm);
  --focus: var(--ember-500);
  --link: var(--ember-500);

  --segment: var(--surface-0);
  --segment-foreground: var(--ink-800);

  --radius: 12px;
  --field-radius: 16px;
  --border-width: 1px;
  --field-border-width: 1px;

  /* — JJ's Kitchen semantics — */
  --canvas: var(--cream-50); /* the app ground */
  --hero: var(--ink-900); /* splash & immersive surfaces */
  --hero-foreground: var(--cream-50);
  --sunken: var(--sand-100); /* chips, wells, skeletons */
  --hairline: var(--border-warm);
  --ink: var(--ink-800); /* body text */
  --ink-strong: var(--ink-700);
  --on-ember: var(--surface-0); /* text on an ember ground */
  --price: var(--ink-800);
  --strike: var(--muted-warm); /* struck-through original price */
  --ember-pressed: var(--ember-600);
  --ember-tint: var(--ember-50);
}

/* ---------------------------------------------------------------------------
   LAYER C · TAILWIND EXPOSURE
   Turns Layer B into the utility vocabulary the app is written in.
   ------------------------------------------------------------------------ */
@theme inline {
  /* — COLOR — */
  --color-canvas: var(--canvas);
  --color-hero: var(--hero);
  --color-hero-foreground: var(--hero-foreground);
  --color-surface: var(--surface);
  --color-surface-foreground: var(--surface-foreground);
  --color-sunken: var(--sunken);
  --color-hairline: var(--hairline);

  --color-ink: var(--ink);
  --color-ink-strong: var(--ink-strong);
  --color-muted: var(--muted);

  --color-ember: var(--accent);
  --color-ember-pressed: var(--ember-pressed);
  --color-ember-tint: var(--ember-tint);
  --color-saffron: var(--saffron-400);
  --color-on-ember: var(--on-ember);

  --color-veg: var(--veg);
  --color-non-veg: var(--non-veg);
  --color-chili: var(--chili);
  --color-warning: var(--warning);
  --color-info: var(--info-teal);

  --color-price: var(--price);
  --color-strike: var(--strike);

  /* — TYPOGRAPHY (PDF section 02) —
     Bricolage Grotesque carries display sizes (>= 24px per the PDF);
     Plus Jakarta Sans carries everything at 20px and below.

     Weight is chosen by FAMILY NAME, never by fontWeight — React Native
     cannot synthesize a weight from a static face. */
  --font-bricolage-400: 'BricolageGrotesque-Regular';
  --font-bricolage-600: 'BricolageGrotesque-SemiBold';
  --font-bricolage-700: 'BricolageGrotesque-Bold';
  --font-bricolage-800: 'BricolageGrotesque-ExtraBold';

  --font-jakarta-400: 'PlusJakartaSans-Regular';
  --font-jakarta-500: 'PlusJakartaSans-Medium';
  --font-jakarta-600: 'PlusJakartaSans-SemiBold';
  --font-jakarta-700: 'PlusJakartaSans-Bold';
  --font-jakarta-800: 'PlusJakartaSans-ExtraBold';

  /* Display · Bricolage 44 / 800 / -3% */
  --text-display: 44px;
  --text-display--line-height: 46px;
  --text-display--letter-spacing: -1.32px;

  /* Heading 1 · Bricolage 32 / 700 */
  --text-h1: 32px;
  --text-h1--line-height: 38px;
  --text-h1--letter-spacing: -0.64px;

  /* Heading 2 · Bricolage 24 / 700 */
  --text-h2: 24px;
  --text-h2--line-height: 30px;
  --text-h2--letter-spacing: -0.24px;

  /* Title · section header · Jakarta 20 / 700 */
  --text-title: 20px;
  --text-title--line-height: 26px;
  --text-title--letter-spacing: -0.2px;

  /* Item name · list title · Jakarta 17 / 600 */
  --text-item: 17px;
  --text-item--line-height: 24px;
  --text-item--letter-spacing: 0px;

  /* Body · descriptions & UI copy · Jakarta 15 / 500 */
  --text-body: 15px;
  --text-body--line-height: 22px;
  --text-body--letter-spacing: 0px;

  /* Caption · labels · meta · Jakarta 12 / 700 / +14% */
  --text-caption: 12px;
  --text-caption--line-height: 16px;
  --text-caption--letter-spacing: 1.68px;

  /* — SPACING (PDF section 03, 4px base) —
     The 4px base keeps numeric utilities (px-6 = 24px) working alongside
     the named steps. */
  --spacing: 4px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* — RADIUS (PDF section 03) — */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-sheet: 28px;
  --radius-pill: 9999px;

  /* — ELEVATION (PDF section 03) — */
  --shadow-e1: 0px 1px 3px rgba(20, 16, 13, 0.06);
  --shadow-e2: 0px 4px 12px rgba(20, 16, 13, 0.1);
  --shadow-e3: 0px -8px 28px rgba(20, 16, 13, 0.14);
  --shadow-ember-glow: 0px 6px 20px rgba(236, 91, 19, 0.32);
}
```

- [ ] **Step 4: Delete the duplicate palette and un-allowlist it**

```bash
git rm src/theme/index.ts
```

In `__tests__/design-tokens.test.ts`, remove `'theme/index.ts',` from `ALLOWLIST`.

- [ ] **Step 5: Run both test suites**

Run: `npx jest __tests__/global-css-contract.test.ts __tests__/design-tokens.test.ts`
Expected: PASS. If a swatch assertion fails, the hex in `global.css` is typo'd — fix `global.css`, never the test.

- [ ] **Step 6: Verify the HeroUI override actually took on device**

The whole architecture rests on unlayered `:root` outbidding HeroUI's `@layer theme`. Confirm it before building on it. Temporarily replace the body of `src/components/common/PlaceholderScreen.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { Button, Chip, Surface } from 'heroui-native';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center gap-md bg-canvas">
    <Surface className="p-lg rounded-lg">
      <Button>{name}</Button>
    </Surface>
    <Chip>Tandoor</Chip>
  </View>
);
```

Then:

```bash
npm start -- --reset-cache
npm run android
```

Expected on a placeholder tab: cream `#FBF7F1` canvas, a white card, and an **ember orange** button — not HeroUI's default blue accent. If the button is blue, the cascade override is not taking; stop and resolve that before any further task (fallback: move the Layer B block into `@layer theme { :root { @variant light { … } @variant dark { … } } }` with identical values in both variants).

Revert:

```bash
git checkout src/components/common/PlaceholderScreen.tsx
```

- [ ] **Step 7: Commit**

```bash
npm run lint
git add src/global.css __tests__ && git rm --cached src/theme/index.ts 2>/dev/null; git add -A
git commit -m "feat: rebuild global.css as the single source of design truth

Three layers: the PDF's raw palette, semantic tokens that override
heroui-native's variable contract, and Tailwind exposure. Deletes the
duplicate palette in src/theme/index.ts. One palette in both color schemes.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Remove dark mode branching

**Files:**
- Modify: `App.tsx`
- Delete: `src/store/theme.store.ts`
- Modify: `src/components/common/PlaceholderScreen.tsx`
- Modify: `__tests__/design-tokens.test.ts` (remove `components/common/PlaceholderScreen.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `bg-canvas`, `text-title`, `text-body`, `font-jakarta-700`, `text-ink`, `text-muted` from Task 3.
- Produces: an `App.tsx` with no theme store and no `dark` class. No later task may reintroduce either.

- [ ] **Step 1: Rewrite `App.tsx`**

```tsx
import './src/global.css';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * The app renders one palette — JJ's Kitchen Design System v1.0 — in both
 * light and dark device color schemes. There is deliberately no theme store
 * and no `dark` class: every token lives in src/global.css with a single
 * value. See docs/superpowers/specs/2026-09-06-design-system-v1-design.md.
 */
function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
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
          <View style={styles.container}>
            {/* Dark glyphs: the canvas is Cream 50 everywhere except the
                splash, which sets its own bar style. */}
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent
            />
            <RootNavigator />
          </View>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
```

- [ ] **Step 2: Delete the theme store**

```bash
git rm src/store/theme.store.ts
```

- [ ] **Step 3: Retokenize `PlaceholderScreen`**

Replace `src/components/common/PlaceholderScreen.tsx`:

```tsx
import React from 'react';
import { View, Text } from 'react-native';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center bg-canvas">
    <Text className="font-jakarta-700 text-title text-ink">{name}</Text>
    <Text className="font-jakarta-500 text-body text-muted mt-sm">
      Coming Soon...
    </Text>
  </View>
);
```

- [ ] **Step 4: Un-allowlist it**

In `__tests__/design-tokens.test.ts`, remove `'components/common/PlaceholderScreen.tsx',` from `ALLOWLIST`.

- [ ] **Step 5: Run the checks**

```bash
npx tsc --noEmit
npm run lint
npx jest
```

Expected: all pass. `tsc` will surface any file still importing the deleted `theme.store` — those are handled in their own tasks, so if one appears, temporarily leave the import and note it; it must be gone by Task 20.

- [ ] **Step 6: Verify on device**

```bash
npm run android
```

Toggle the device between light and dark mode (Android: Settings → Display → Dark theme). Expected: the app looks **identical** in both. Status bar glyphs stay dark and legible.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: render one palette in both color schemes

Removes the theme store, the dark class, and useColorScheme branching from
the app shell. Retokenizes PlaceholderScreen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: `Text` primitive — the type scale

The single place in the app where a font family is named. Every other file uses `variant`.

**Files:**
- Create: `src/components/ui/Text.tsx`
- Create: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: type tokens from Task 3.
- Produces:
  ```ts
  type TextVariant = 'display' | 'h1' | 'h2' | 'title' | 'item' | 'body' | 'caption';
  type TextTone = 'ink' | 'muted' | 'ember' | 'on-ember' | 'on-hero' | 'veg' | 'non-veg' | 'chili';
  interface TextProps extends RNTextProps { variant?: TextVariant; tone?: TextTone; className?: string; }
  const Text: React.FC<TextProps>   // default variant 'body', default tone 'ink'
  ```
  Every later task imports `Text` from `@/components/ui`.

- [ ] **Step 1: Create the primitive**

`src/components/ui/Text.tsx`:

```tsx
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/**
 * The design system's type scale (PDF section 02).
 *
 * Bricolage Grotesque carries display sizes; the PDF constrains it to >= 24px,
 * so `title` and below are Plus Jakarta Sans.
 *
 * Weight is carried by the font family name, never by fontWeight — React
 * Native cannot synthesize a weight from a static face.
 */
export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'title'
  | 'item'
  | 'body'
  | 'caption';

export type TextTone =
  | 'ink'
  | 'muted'
  | 'ember'
  | 'on-ember'
  | 'on-hero'
  | 'veg'
  | 'non-veg'
  | 'chili';

const VARIANT: Record<TextVariant, string> = {
  display: 'font-bricolage-800 text-display',
  h1: 'font-bricolage-700 text-h1',
  h2: 'font-bricolage-700 text-h2',
  title: 'font-jakarta-700 text-title',
  item: 'font-jakarta-600 text-item',
  body: 'font-jakarta-500 text-body',
  caption: 'font-jakarta-700 text-caption uppercase',
};

const TONE: Record<TextTone, string> = {
  ink: 'text-ink',
  muted: 'text-muted',
  ember: 'text-ember',
  'on-ember': 'text-on-ember',
  'on-hero': 'text-hero-foreground',
  veg: 'text-veg',
  'non-veg': 'text-non-veg',
  chili: 'text-chili',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
}

export const Text = ({
  variant = 'body',
  tone = 'ink',
  className = '',
  ...rest
}: TextProps) => (
  <RNText
    className={`${VARIANT[variant]} ${TONE[tone]} ${className}`.trim()}
    {...rest}
  />
);
```

- [ ] **Step 2: Create the barrel**

`src/components/ui/index.ts`:

```ts
export { Text } from './Text';
export type { TextProps, TextVariant, TextTone } from './Text';
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Verify every variant renders on device**

Temporarily replace `src/components/common/PlaceholderScreen.tsx`:

```tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <ScrollView className="flex-1 bg-canvas">
    <View className="p-lg gap-md">
      <Text variant="display">Tandoori</Text>
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="title">Section header</Text>
      <Text variant="item">Chicken Burrah</Text>
      <Text variant="body" tone="muted">
        Charcoal-grilled chicken chops in a smoky yogurt and chilli marinade.
      </Text>
      <Text variant="caption" tone="ember">
        Bestseller · {name}
      </Text>
    </View>
  </ScrollView>
);
```

```bash
npm run android
```

Expected, checked against PDF section 02:
- `display`, `h1`, `h2` are the wide geometric Bricolage face; `title` and below are Jakarta.
- `display` is visibly tighter than default tracking; `caption` is visibly loose and uppercase.
- Body copy is Ink 800 on cream; the caption is ember.

Revert: `git checkout src/components/common/PlaceholderScreen.tsx`

- [ ] **Step 5: Commit**

```bash
npm run lint
git add src/components/ui
git commit -m "feat(ui): add Text primitive carrying the type scale

The only place font families are named. Screens select type by variant.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: `Button` primitive

**Files:**
- Create: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `Text` (Task 5); color/radius/elevation tokens (Task 3).
- Produces:
  ```ts
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
  type ButtonSize = 'md' | 'sm';
  interface ButtonProps {
    label: string; onPress?: () => void; variant?: ButtonVariant; size?: ButtonSize;
    isDisabled?: boolean; isLoading?: boolean; loadingLabel?: string;
    icon?: React.ReactNode; className?: string;
  }
  const Button: React.FC<ButtonProps>
  ```

- [ ] **Step 1: Create the primitive**

`src/components/ui/Button.tsx`:

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Spinner } from 'heroui-native';
import { Text, type TextTone } from './Text';

/** PDF section 05 · Buttons. `disabled` is a state, not a variant. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'sm';

const BASE = 'flex-row items-center justify-center rounded-lg';

const SIZE: Record<ButtonSize, string> = {
  md: 'h-14 px-lg',
  sm: 'h-10 px-md',
};

const SURFACE: Record<ButtonVariant, string> = {
  primary: 'bg-ember shadow-ember-glow',
  secondary: 'bg-surface border border-hairline shadow-e1',
  ghost: 'bg-transparent',
  destructive: 'bg-chili shadow-e1',
};

const LABEL_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'on-ember',
  secondary: 'ink',
  ghost: 'ember',
  destructive: 'on-ember',
};

/** Ember at 30% reads as disabled without introducing a new token. */
const DISABLED_SURFACE = 'bg-sunken border border-hairline';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  loadingLabel,
  icon,
  className = '',
}: ButtonProps) => {
  const inactive = isDisabled || isLoading;
  const surface = inactive ? DISABLED_SURFACE : SURFACE[variant];
  const tone: TextTone = inactive ? 'muted' : LABEL_TONE[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      className={`${BASE} ${SIZE[size]} ${surface} ${className}`.trim()}
    >
      {isLoading ? (
        <View className="flex-row items-center gap-sm">
          <Spinner size="sm" />
          <Text variant="item" tone={tone}>
            {loadingLabel ?? label}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-sm">
          {icon}
          <Text variant="item" tone={tone}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
```

Note the label is `variant="item"` — Jakarta 17/600. That is ≥14px bold, which keeps white-on-ember inside WCAG AA Large (see the spec's Contrast audit).

- [ ] **Step 2: Export it**

Append to `src/components/ui/index.ts`:

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Verify on device**

Temporarily render all states in `PlaceholderScreen`:

```tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button } from '@/components/ui';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <ScrollView className="flex-1 bg-canvas">
    <View className="p-lg gap-md">
      <Button label={`Primary · ${name}`} />
      <Button label="Secondary" variant="secondary" />
      <Button label="Ghost / text" variant="ghost" />
      <Button label="Destructive" variant="destructive" />
      <Button label="Disabled" isDisabled />
      <Button label="Send OTP" isLoading loadingLabel="Sending OTP" />
      <Button label="Call driver" size="sm" variant="secondary" />
    </View>
  </ScrollView>
);
```

```bash
npm run android
```

Expected against PDF section 05: ember primary with a warm glow beneath it, white bordered secondary, text-only ghost in ember, chili destructive, sand disabled with muted label. Revert afterwards.

- [ ] **Step 5: Commit**

```bash
npm run lint
git checkout src/components/common/PlaceholderScreen.tsx
git add src/components/ui
git commit -m "feat(ui): add Button primitive with the PDF's six states

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: `TextField` and `OtpInput`

**Files:**
- Create: `src/components/ui/TextField.tsx`
- Create: `src/components/ui/OtpInput.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `Text` (Task 5).
- Produces:
  ```ts
  interface TextFieldProps {
    label?: string; value: string; onChangeText: (t: string) => void;
    placeholder?: string; error?: string; icon?: React.ReactNode;
    prefix?: string; isDisabled?: boolean; className?: string;
    keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
    autoCapitalize?: 'none' | 'words'; returnKeyType?: 'default' | 'next' | 'done';
    maxLength?: number; onFocus?: () => void; onBlur?: () => void;
    onSubmitEditing?: () => void; textContentType?: string; autoComplete?: string;
  }
  const TextField: React.ForwardRefExoticComponent<TextFieldProps & RefAttributes<RNTextInput>>

  interface OtpInputProps {
    value: string; onChangeText: (t: string) => void; length?: number;  // default 6
    error?: string; autoFocus?: boolean; onFocusChange?: (f: boolean) => void;
  }
  const OtpInput: React.ForwardRefExoticComponent<OtpInputProps & RefAttributes<RNTextInput>>
  ```

- [ ] **Step 1: Create `TextField`**

`src/components/ui/TextField.tsx`:

```tsx
import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from './Text';

/**
 * PDF section 05 · Text fields. Three visual states — idle, focused, error —
 * plus disabled. Colors come from tokens; the focus ring is the ember border.
 */
export interface TextFieldProps
  extends Pick<
    TextInputProps,
    | 'keyboardType'
    | 'autoCapitalize'
    | 'returnKeyType'
    | 'maxLength'
    | 'onSubmitEditing'
    | 'textContentType'
    | 'autoComplete'
    | 'submitBehavior'
  > {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  /** Static leading text, e.g. the "+91" dial code. */
  prefix?: string;
  isDisabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TextField = forwardRef<RNTextInput, TextFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      error,
      icon,
      prefix,
      isDisabled = false,
      className = '',
      onFocus,
      onBlur,
      ...inputProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const border = error
      ? 'border-chili'
      : isFocused
        ? 'border-ember'
        : 'border-hairline';
    const surface = isDisabled ? 'bg-sunken' : 'bg-surface';

    return (
      <View className={`mb-md ${className}`.trim()}>
        {label ? (
          <Text variant="caption" tone="muted" className="mb-sm ml-xs">
            {label}
          </Text>
        ) : null}

        <View
          className={`flex-row items-center h-14 rounded-lg px-md border ${border} ${surface} ${isDisabled ? 'opacity-60' : ''}`}
        >
          {icon ? <View className="mr-sm opacity-60">{icon}</View> : null}
          {prefix ? (
            <Text variant="item" className="mr-sm">
              {prefix}
            </Text>
          ) : null}
          <RNTextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={!isDisabled}
            className="flex-1 font-jakarta-600 text-item text-ink p-0"
            placeholderClassName="text-muted"
            onFocus={() => {
              if (isDisabled) return;
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            {...inputProps}
          />
        </View>

        {error ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text variant="caption" tone="chili" className="mt-sm ml-xs">
              {error}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';
```

If Uniwind does not support `placeholderClassName`, delete that prop and instead read the token once in the primitive — but do **not** inline a hex; that would violate the guard. The supported fallback is `placeholderTextColor` sourced from a `Text`-rendered token is not possible, so prefer keeping `placeholderClassName`; verify in Step 4.

- [ ] **Step 2: Create `OtpInput`**

`src/components/ui/OtpInput.tsx`:

```tsx
import React, { forwardRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Text } from './Text';

/**
 * PDF section 05 · OTP input, 6-digit.
 *
 * A single offscreen TextInput owns the value and the keyboard; the visible
 * slots are presentational. This is what makes SMS autofill work — the OS
 * fills one field, not six.
 */
export interface OtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export const OtpInput = forwardRef<RNTextInput, OtpInputProps>(
  (
    { value, onChangeText, length = 6, error, autoFocus, onFocusChange },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (text: string) => {
      onChangeText(text.replace(/[^0-9]/g, '').slice(0, length));
    };

    return (
      <View>
        <RNTextInput
          ref={ref}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={length}
          autoFocus={autoFocus}
          style={styles.offscreen}
          onFocus={() => {
            setIsFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onFocusChange?.(false);
          }}
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (ref && typeof ref !== 'function') ref.current?.focus();
          }}
          className="flex-row justify-center items-center gap-sm py-sm"
        >
          {Array.from({ length }).map((_, i) => {
            const char = value[i];
            const isActive = isFocused && i === value.length;
            const border = error
              ? 'border-chili'
              : isActive
                ? 'border-ember'
                : char
                  ? 'border-hairline'
                  : 'border-hairline';
            const fill = char ? 'bg-ember-tint' : 'bg-surface';

            return (
              <View
                key={i}
                pointerEvents="none"
                className={`w-11 h-14 rounded-md border items-center justify-center ${border} ${fill}`}
              >
                {char ? (
                  <Animated.View entering={ZoomIn.duration(160)}>
                    <Text variant="h2">{char}</Text>
                  </Animated.View>
                ) : null}
                {isActive ? (
                  <View className="w-0.5 h-6 bg-ember absolute rounded-pill" />
                ) : null}
              </View>
            );
          })}
        </TouchableOpacity>

        {error ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text variant="caption" tone="chili" className="mt-sm text-center">
              {error}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  },
);

OtpInput.displayName = 'OtpInput';

/** Layout-only: keeps the real input focusable but invisible. */
const styles = StyleSheet.create({
  offscreen: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
```

- [ ] **Step 3: Export both**

Append to `src/components/ui/index.ts`:

```ts
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';
export { OtpInput } from './OtpInput';
export type { OtpInputProps } from './OtpInput';
```

- [ ] **Step 4: Type-check and verify on device**

Run: `npx tsc --noEmit` → PASS.

Temporarily render in `PlaceholderScreen`: one `TextField` with a `+91` prefix, one with an `error` set, one `isDisabled`, and an `OtpInput` with `autoFocus`. Confirm against PDF section 05:
- idle border is the warm hairline, focused border is ember, error border is chili with chili caption below;
- typing into the OTP fills slots left to right with an ember-tint ground and a visible ember caret on the next empty slot;
- **the placeholder is muted warm grey, not the platform default blue-grey.** If `placeholderClassName` is unsupported by Uniwind, the placeholder will look wrong — resolve it now, before six screens depend on the component.

Revert `PlaceholderScreen`.

- [ ] **Step 5: Commit**

```bash
npm run lint
git checkout src/components/common/PlaceholderScreen.tsx
git add src/components/ui
git commit -m "feat(ui): add TextField and OtpInput primitives

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Badges and `PriceTag`

**Files:**
- Create: `src/components/ui/Badges.tsx`
- Create: `src/components/ui/PriceTag.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `Text` (Task 5).
- Produces:
  ```ts
  const VegBadge: React.FC<{ isVeg: boolean; size?: number }>          // default size 16
  const RatingBadge: React.FC<{ rating: number; reviews?: number }>
  const Tag: React.FC<{ label: string; tone?: 'ember' | 'saffron' }>   // default 'ember'
  const SpiceBadge: React.FC<{ label?: string }>                        // default 'SPICY'
  const PriceTag: React.FC<{ price: number; strikePrice?: number; size?: 'md' | 'sm' }>
  const PortionPrice: React.FC<{ full: number; half?: number }>
  ```

- [ ] **Step 1: Create `Badges.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text } from './Text';

/** PDF section 05 · the square-outline veg / non-veg marker. */
export const VegBadge = ({
  isVeg,
  size = 16,
}: {
  isVeg: boolean;
  size?: number;
}) => (
  <View
    accessibilityLabel={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    style={{ width: size, height: size }}
    className={`border-2 items-center justify-center rounded-sm ${
      isVeg ? 'border-veg' : 'border-non-veg'
    }`}
  >
    <View
      style={{ width: size * 0.4, height: size * 0.4 }}
      className={`rounded-pill ${isVeg ? 'bg-veg' : 'bg-non-veg'}`}
    />
  </View>
);

/** PDF section 05 · rating pill. */
export const RatingBadge = ({
  rating,
  reviews,
}: {
  rating: number;
  reviews?: number;
}) => (
  <View className="flex-row items-center self-start bg-sunken px-sm py-xs rounded-sm gap-xs">
    <Star size={11} className="text-saffron" fill="currentColor" />
    <Text variant="caption" tone="ink">
      {rating}
      {reviews ? ` (${reviews})` : ''}
    </Text>
  </View>
);

/** PDF section 05 · BESTSELLER-style tag. */
export const Tag = ({
  label,
  tone = 'ember',
}: {
  label: string;
  tone?: 'ember' | 'saffron';
}) => (
  <View
    className={`self-start px-sm py-xs rounded-sm ${
      tone === 'ember' ? 'bg-ember' : 'bg-saffron'
    }`}
  >
    <Text variant="caption" tone={tone === 'ember' ? 'on-ember' : 'ink'}>
      {label}
    </Text>
  </View>
);

/** PDF section 05 · spice marker. */
export const SpiceBadge = ({ label = 'SPICY' }: { label?: string }) => (
  <View className="flex-row items-center self-start bg-ember-tint px-sm py-xs rounded-sm gap-xs">
    <Text variant="caption" tone="ember">
      {`\u{1F336} ${label}`}
    </Text>
  </View>
);
```

- [ ] **Step 2: Create `PriceTag.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

/** Rupee-formatted price. PDF uses the bare symbol with no space. */
const rupees = (amount: number) => `₹${amount}`;

/** PDF section 05 · price, optionally with a struck-through original. */
export const PriceTag = ({
  price,
  strikePrice,
  size = 'md',
}: {
  price: number;
  strikePrice?: number;
  size?: 'md' | 'sm';
}) => (
  <View className="flex-row items-baseline gap-sm">
    <Text variant={size === 'md' ? 'item' : 'body'}>{rupees(price)}</Text>
    {strikePrice ? (
      <Text variant="body" tone="muted" className="line-through">
        {rupees(strikePrice)}
      </Text>
    ) : null}
  </View>
);

/** PDF section 05 · portion price — "Full ₹499  Half ₹279". */
export const PortionPrice = ({
  full,
  half,
}: {
  full: number;
  half?: number;
}) => (
  <View className="flex-row items-center gap-md">
    <View className="flex-row items-baseline gap-xs">
      <Text variant="caption" tone="muted">
        Full
      </Text>
      <Text variant="item">{rupees(full)}</Text>
    </View>
    {half ? (
      <View className="flex-row items-baseline gap-xs">
        <Text variant="caption" tone="muted">
          Half
        </Text>
        <Text variant="item">{rupees(half)}</Text>
      </View>
    ) : null}
  </View>
);
```

- [ ] **Step 3: Export**

Append to `src/components/ui/index.ts`:

```ts
export { VegBadge, RatingBadge, Tag, SpiceBadge } from './Badges';
export { PriceTag, PortionPrice } from './PriceTag';
```

- [ ] **Step 4: Type-check and verify**

Run: `npx tsc --noEmit` → PASS.

Render all six in `PlaceholderScreen` temporarily. Expected against PDF section 05: green-outlined veg square with a green dot, dark-red non-veg equivalent, saffron star on a sand rating pill, ember `BESTSELLER` tag, chilli spice chip, `₹499 ₹560` with the second struck through. Revert.

- [ ] **Step 5: Commit**

```bash
npm run lint
git checkout src/components/common/PlaceholderScreen.tsx
git add src/components/ui
git commit -m "feat(ui): add badge, tag and price primitives

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: `CategoryChip`, `Segmented`, `QuantityStepper`

**Files:**
- Create: `src/components/ui/CategoryChip.tsx`
- Create: `src/components/ui/Segmented.tsx`
- Create: `src/components/ui/QuantityStepper.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `Text` (Task 5).
- Produces:
  ```ts
  const CategoryChip: React.FC<{ label: string; isActive?: boolean; onPress?: () => void }>
  const Segmented: React.FC<{ options: string[]; value: string; onChange: (v: string) => void }>
  const QuantityStepper: React.FC<{
    quantity: number; onAdd: () => void; onRemove: () => void; addLabel?: string;  // default 'ADD'
  }>
  ```

- [ ] **Step 1: Create `CategoryChip.tsx`**

```tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from './Text';

/** PDF section 05 · category chips — All / Tandoor / Starters / … */
export const CategoryChip = ({
  label,
  isActive = false,
  onPress,
}: {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    className={`px-md py-sm rounded-pill border ${
      isActive ? 'bg-ember border-ember' : 'bg-surface border-hairline'
    }`}
  >
    <Text variant="caption" tone={isActive ? 'on-ember' : 'ink'}>
      {label}
    </Text>
  </TouchableOpacity>
);
```

- [ ] **Step 2: Create `Segmented.tsx`**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';

/** PDF section 05 · segmented control — service mode (Takeaway / Dine-in). */
export const Segmented = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <View className="flex-row bg-sunken rounded-pill p-xs">
    {options.map(option => {
      const isActive = option === value;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          className={`flex-1 items-center justify-center py-sm rounded-pill ${
            isActive ? 'bg-surface shadow-e1' : ''
          }`}
        >
          <Text variant="caption" tone={isActive ? 'ink' : 'muted'}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
```

- [ ] **Step 3: Create `QuantityStepper.tsx`**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Text } from './Text';

/**
 * PDF section 05 · quantity stepper.
 * Collapses to a single ADD button at zero, expands to − n + above it.
 */
export const QuantityStepper = ({
  quantity,
  onAdd,
  onRemove,
  addLabel = 'ADD',
}: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  addLabel?: string;
}) => {
  if (quantity <= 0) {
    return (
      <TouchableOpacity
        onPress={onAdd}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        className="bg-ember rounded-md px-lg py-sm items-center justify-center shadow-ember-glow min-w-24"
      >
        <Text variant="caption" tone="on-ember">
          {addLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center bg-ember rounded-md px-sm py-sm shadow-ember-glow min-w-24 justify-between">
      <TouchableOpacity
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className="p-xs"
      >
        <Minus size={16} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
      <Text variant="item" tone="on-ember">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className="p-xs"
      >
        <Plus size={16} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};
```

- [ ] **Step 4: Export**

Append to `src/components/ui/index.ts`:

```ts
export { CategoryChip } from './CategoryChip';
export { Segmented } from './Segmented';
export { QuantityStepper } from './QuantityStepper';
```

- [ ] **Step 5: Type-check, verify, commit**

Run: `npx tsc --noEmit` → PASS.

Verify on device: a chip row with one active (ember fill, white caption), a two-option segmented control with a raised white active pill on sand, and a stepper that switches from `ADD` to `− 1 +` on press without changing width. Revert `PlaceholderScreen`.

```bash
npm run lint
git checkout src/components/common/PlaceholderScreen.tsx
git add src/components/ui
git commit -m "feat(ui): add CategoryChip, Segmented and QuantityStepper

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: `FoodCard` — replaces `FoodListItem`

**Files:**
- Create: `src/components/ui/FoodCard.tsx`
- Delete: `src/components/common/FoodListItem.tsx`
- Modify: `src/components/ui/index.ts`
- Modify: `__tests__/design-tokens.test.ts` (remove `components/common/FoodListItem.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text`, `VegBadge`, `RatingBadge`, `Tag`, `PriceTag`, `QuantityStepper`.
- Produces:
  ```ts
  interface FoodItem {
    id: string; name: string; price: number; rating: number; image: string;
    description?: string; isVeg?: boolean; reviews?: number;
    strikePrice?: number; tag?: string; isSpicy?: boolean;
  }
  interface FoodCardProps {
    item: FoodItem; layout?: 'list' | 'grid';  // default 'list'
    quantity?: number; onAdd?: () => void; onRemove?: () => void;
  }
  const FoodCard: React.FC<FoodCardProps>
  ```
  `HomeScreen` (Task 17) imports `FoodCard` and `FoodItem`.

- [ ] **Step 1: Create the component**

`src/components/ui/FoodCard.tsx`:

```tsx
import React, { memo } from 'react';
import { View, Image } from 'react-native';
import { Text } from './Text';
import { VegBadge, RatingBadge, Tag, SpiceBadge } from './Badges';
import { PriceTag } from './PriceTag';
import { QuantityStepper } from './QuantityStepper';

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  description?: string;
  isVeg?: boolean;
  reviews?: number;
  strikePrice?: number;
  tag?: string;
  isSpicy?: boolean;
}

export interface FoodCardProps {
  item: FoodItem;
  layout?: 'list' | 'grid';
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

/** PDF section 05 · food item card, list and grid layouts. */
export const FoodCard = memo(
  ({
    item,
    layout = 'list',
    quantity = 0,
    onAdd = () => {},
    onRemove = () => {},
  }: FoodCardProps) => {
    if (layout === 'grid') {
      return (
        <View className="bg-surface rounded-lg overflow-hidden shadow-e1 border border-hairline">
          <Image
            source={{ uri: item.image }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="p-md gap-sm">
            <View className="flex-row items-center gap-sm">
              <VegBadge isVeg={!!item.isVeg} size={14} />
              {item.tag ? <Tag label={item.tag} /> : null}
            </View>
            <Text variant="item" numberOfLines={2}>
              {item.name}
            </Text>
            <View className="flex-row items-center justify-between">
              <PriceTag price={item.price} strikePrice={item.strikePrice} />
              <QuantityStepper
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="py-lg flex-row items-start border-b border-hairline">
        <View className="flex-1 pr-md gap-sm">
          <View className="flex-row items-center gap-sm">
            <VegBadge isVeg={!!item.isVeg} />
            {item.tag ? <Tag label={item.tag} /> : null}
            {item.isSpicy ? <SpiceBadge /> : null}
          </View>

          <Text variant="item" numberOfLines={2}>
            {item.name}
          </Text>

          <PriceTag price={item.price} strikePrice={item.strikePrice} />

          <RatingBadge rating={item.rating} reviews={item.reviews} />

          {item.description ? (
            <Text variant="body" tone="muted" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View className="items-center">
          <Image
            source={{ uri: item.image }}
            className="w-32 h-32 rounded-lg"
            resizeMode="cover"
          />
          <View className="-mt-md">
            <QuantityStepper
              quantity={quantity}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          </View>
        </View>
      </View>
    );
  },
);

FoodCard.displayName = 'FoodCard';
```

- [ ] **Step 2: Delete the old component and un-allowlist**

```bash
git rm src/components/common/FoodListItem.tsx
```

Remove `'components/common/FoodListItem.tsx',` from `ALLOWLIST` in `__tests__/design-tokens.test.ts`.

`HomeScreen` still imports `FoodListItem` and will fail to type-check. That is expected and is repaired in Task 17. To keep the tree building in the meantime, in `src/features/home/HomeScreen.tsx` change the import to:

```tsx
import { FoodCard as FoodListItem } from '@/components/ui';
```

and change the two `<FoodListItem item={item} onAdd={…} />` usages to pass the same props (the prop names are compatible). Task 17 rewrites this file properly.

- [ ] **Step 3: Export**

Append to `src/components/ui/index.ts`:

```ts
export { FoodCard } from './FoodCard';
export type { FoodCardProps, FoodItem } from './FoodCard';
```

- [ ] **Step 4: Check**

```bash
npx tsc --noEmit
npx jest
npm run lint
```

Expected: all pass.

- [ ] **Step 5: Verify on device and commit**

`npm run android` → Home tab. Expected: list rows with a veg marker, item name in Jakarta 17/600, ember price, saffron rating pill, muted two-line description, and an ember `ADD` button overlapping the image corner.

```bash
git add -A
git commit -m "feat(ui): replace FoodListItem with tokenized FoodCard

Adds a grid layout alongside the list layout, per PDF section 05.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: `TopAppBar` and `LocationBar`

**Files:**
- Create: `src/components/ui/AppBar.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `Text` (Task 5).
- Produces:
  ```ts
  const TopAppBar: React.FC<{
    title: string; onBack?: () => void; right?: React.ReactNode; onHero?: boolean;  // default false
  }>
  const LocationBar: React.FC<{ label: string; address: string; onPress?: () => void; onHero?: boolean }>
  ```

- [ ] **Step 1: Create `AppBar.tsx`**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { Text } from './Text';

/**
 * PDF section 05 · top app bar.
 * `onHero` flips the content to cream for use over an Ink 900 / photo surface.
 */
export const TopAppBar = ({
  title,
  onBack,
  right,
  onHero = false,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  onHero?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const iconClass = onHero ? 'text-hero-foreground' : 'text-ink';

  return (
    <View
      style={{ paddingTop: insets.top }}
      className={onHero ? 'bg-transparent' : 'bg-canvas'}
    >
      <View className="flex-row items-center justify-between px-lg h-14">
        <View className="flex-row items-center gap-sm flex-1">
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="w-10 h-10 items-center justify-center rounded-md"
            >
              <ChevronLeft size={22} className={iconClass} />
            </TouchableOpacity>
          ) : null}
          <Text
            variant="title"
            tone={onHero ? 'on-hero' : 'ink'}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
};

/** PDF section 05 · location bar — "DELIVER TO · HOME" over the address. */
export const LocationBar = ({
  label,
  address,
  onPress,
  onHero = false,
}: {
  label: string;
  address: string;
  onPress?: () => void;
  onHero?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    className={`px-lg py-sm rounded-pill items-center ${
      onHero ? 'bg-hero/70 border border-hairline/20' : 'bg-surface shadow-e1'
    }`}
  >
    <Text variant="caption" tone={onHero ? 'on-hero' : 'muted'}>
      {label}
    </Text>
    <View className="flex-row items-center gap-sm mt-xs">
      <MapPin size={14} className="text-ember" fill="currentColor" />
      <Text
        variant="item"
        tone={onHero ? 'on-hero' : 'ink'}
        numberOfLines={1}
        className="max-w-48"
      >
        {address}
      </Text>
      <ChevronRight
        size={14}
        className={onHero ? 'text-hero-foreground' : 'text-muted'}
      />
    </View>
  </TouchableOpacity>
);
```

- [ ] **Step 2: Export, check, verify, commit**

Append to `src/components/ui/index.ts`:

```ts
export { TopAppBar, LocationBar } from './AppBar';
```

```bash
npx tsc --noEmit
npm run lint
```

Verify on device that both render correctly over a cream ground and over a dark ground (`onHero`), then:

```bash
git checkout src/components/common/PlaceholderScreen.tsx
git add src/components/ui
git commit -m "feat(ui): add TopAppBar and LocationBar

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: State components and `OrderTimeline`

**Files:**
- Create: `src/components/ui/States.tsx`
- Create: `src/components/ui/OrderTimeline.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `Text` (Task 5), `Button` (Task 6).
- Produces:
  ```ts
  const EmptyState: React.FC<{ title: string; message: string; actionLabel?: string; onAction?: () => void; icon?: React.ReactNode }>
  const ErrorState: React.FC<{ title?: string; message?: string; onRetry?: () => void }>
  const SkeletonCard: React.FC<{ count?: number }>   // default 3
  interface TimelineStep { label: string; detail?: string; time?: string; isDone: boolean; isCurrent?: boolean }
  const OrderTimeline: React.FC<{ steps: TimelineStep[] }>
  ```

- [ ] **Step 1: Create `States.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'heroui-native';
import { Text } from './Text';
import { Button } from './Button';

/** PDF section 05 · empty state. */
export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) => (
  <View className="flex-1 items-center justify-center px-xl gap-md">
    {icon}
    <Text variant="h2" className="text-center">
      {title}
    </Text>
    <Text variant="body" tone="muted" className="text-center">
      {message}
    </Text>
    {actionLabel ? (
      <Button label={actionLabel} onPress={onAction} className="mt-sm" />
    ) : null}
  </View>
);

/** PDF section 05 · error state. */
export const ErrorState = ({
  title = "Couldn't load menu",
  message = 'Check your connection and try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) => (
  <View className="flex-1 items-center justify-center px-xl gap-md">
    <Text variant="h2" className="text-center">
      {title}
    </Text>
    <Text variant="body" tone="muted" className="text-center">
      {message}
    </Text>
    {onRetry ? (
      <Button
        label="Retry"
        variant="secondary"
        onPress={onRetry}
        className="mt-sm"
      />
    ) : null}
  </View>
);

/** PDF section 05 · skeleton loading, shaped like a FoodCard list row. */
export const SkeletonCard = ({ count = 3 }: { count?: number }) => (
  <View className="gap-lg px-lg">
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} className="flex-row items-start gap-md py-md">
        <View className="flex-1 gap-sm">
          <Skeleton className="h-4 w-2/3 rounded-sm" />
          <Skeleton className="h-4 w-1/3 rounded-sm" />
          <Skeleton className="h-3 w-full rounded-sm" />
          <Skeleton className="h-3 w-4/5 rounded-sm" />
        </View>
        <Skeleton className="w-32 h-32 rounded-lg" />
      </View>
    ))}
  </View>
);
```

- [ ] **Step 2: Create `OrderTimeline.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from './Text';

export interface TimelineStep {
  label: string;
  detail?: string;
  time?: string;
  isDone: boolean;
  isCurrent?: boolean;
}

/** PDF section 05 · order status timeline. */
export const OrderTimeline = ({ steps }: { steps: TimelineStep[] }) => (
  <View className="px-lg">
    {steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      const active = step.isDone || step.isCurrent;

      return (
        <View key={step.label} className="flex-row">
          {/* Rail */}
          <View className="items-center mr-md">
            <View
              className={`w-6 h-6 rounded-pill items-center justify-center border-2 ${
                active ? 'bg-ember border-ember' : 'bg-surface border-hairline'
              }`}
            >
              {step.isDone ? (
                <Check size={12} className="text-on-ember" strokeWidth={3} />
              ) : null}
            </View>
            {!isLast ? (
              <View
                className={`w-0.5 flex-1 ${
                  step.isDone ? 'bg-ember' : 'bg-hairline'
                }`}
              />
            ) : null}
          </View>

          {/* Content */}
          <View className={`flex-1 ${isLast ? 'pb-0' : 'pb-lg'}`}>
            <View className="flex-row items-center justify-between">
              <Text variant="item" tone={active ? 'ink' : 'muted'}>
                {step.label}
              </Text>
              {step.time ? (
                <Text variant="caption" tone="muted">
                  {step.time}
                </Text>
              ) : null}
            </View>
            {step.detail ? (
              <Text variant="body" tone="muted" className="mt-xs">
                {step.detail}
              </Text>
            ) : null}
          </View>
        </View>
      );
    })}
  </View>
);
```

- [ ] **Step 3: Export, check, verify, commit**

Append to `src/components/ui/index.ts`:

```ts
export { EmptyState, ErrorState, SkeletonCard } from './States';
export { OrderTimeline } from './OrderTimeline';
export type { TimelineStep } from './OrderTimeline';
```

```bash
npx tsc --noEmit
npm run lint
```

Verify on device against PDF section 05: the empty state's "Your cart is empty / Browse menu", the error state's "Couldn't load menu / Retry", skeleton rows in sand, and a timeline whose completed steps carry ember check circles joined by an ember rail while pending steps are hairline outlines. Revert `PlaceholderScreen`.

```bash
git checkout src/components/common/PlaceholderScreen.tsx
git add src/components/ui
git commit -m "feat(ui): add empty, error, skeleton and timeline components

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: `SplashScreen`

**Files:**
- Modify: `src/features/auth/SplashScreen.tsx`
- Modify: `src/assets/animations/jjs_kitchen_splash.json`
- Modify: `__tests__/design-tokens.test.ts` (remove `features/auth/SplashScreen.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text` (Task 5); `bg-hero`, `text-hero-foreground`.

- [ ] **Step 1: Retune the Lottie fill**

The animation is pure vector with exactly one fill color, `#F5F1E8`. Move it to Cream 50 so the wordmark matches the design system:

```bash
node -e "
const fs=require('fs');
const p='src/assets/animations/jjs_kitchen_splash.json';
const before=fs.readFileSync(p,'utf8');
const d=JSON.parse(before);
let n=0;
(function walk(o){
  if(Array.isArray(o)) return o.forEach(walk);
  if(o&&typeof o==='object'){
    if((o.ty==='fl'||o.ty==='st')&&o.c&&Array.isArray(o.c.k)&&o.c.k.every(x=>typeof x==='number')){
      o.c.k=[0xFB/255,0xF7/255,0xF1/255,1]; n++;
    }
    Object.values(o).forEach(walk);
  }
})(d);
fs.writeFileSync(p, JSON.stringify(d));
console.log('recolored', n, 'fills to Cream 50');
"
```

Expected: `recolored 11 fills to Cream 50`.

- [ ] **Step 2: Rewrite the screen**

Replace `src/features/auth/SplashScreen.tsx`:

```tsx
import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import splashAnimation from '../../assets/animations/jjs_kitchen_splash.json';
import { useAuthStore } from '@/store/auth.store';
import { Text } from '@/components/ui';

const SPLASH_DURATION = 4000;

const LoadingDot = ({ index }: { index: number }) => {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(
      2700 + index * 160,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 480, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
  }, [index, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + value.value * 0.65,
    transform: [{ scale: 0.8 + value.value * 0.45 }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="w-2 h-2 rounded-pill bg-hero-foreground"
    />
  );
};

/**
 * The splash is the app's one immersive surface: Ink 900, per PDF section 01
 * ("hero, splash"). It is also the only screen that sets a light status bar.
 */
export const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { height: H } = useWindowDimensions();

  const setFirstLaunch = useAuthStore(state => state.setFirstLaunch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFirstLaunch(false);
      navigation.replace('Login');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [navigation, setFirstLaunch]);

  const dotsBottom = Math.max(60, H * 0.12);

  return (
    <Animated.View
      exiting={FadeOut.duration(450)}
      style={StyleSheet.absoluteFill}
      className="bg-hero items-center justify-center overflow-hidden"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LottieView
        source={splashAnimation}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />

      <View className="items-center justify-center px-lg">
        <View style={{ height: H * 0.22 }} />
        <Animated.View entering={FadeIn.delay(2600).duration(800)}>
          <Text variant="caption" tone="on-hero" className="mt-md opacity-80">
            Taste the perfection
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeIn.delay(2700).duration(500)}
        style={{ bottom: dotsBottom }}
        className="absolute flex-row items-center justify-center gap-sm"
      >
        <LoadingDot index={0} />
        <LoadingDot index={1} />
        <LoadingDot index={2} />
      </Animated.View>
    </Animated.View>
  );
};
```

The tagline moves to the `caption` variant, which already applies uppercase and the PDF's +14% tracking — replacing the hand-tuned `letterSpacing` math.

- [ ] **Step 3: Un-allowlist and check**

Remove `'features/auth/SplashScreen.tsx',` from `ALLOWLIST`.

```bash
npx tsc --noEmit
npm run lint
npx jest
```

Expected: all pass.

- [ ] **Step 4: Verify on device**

```bash
adb uninstall com.jjskitchen.app
npm run android
```

Expected: charcoal Ink 900 ground, cream wordmark animation, uppercase cream tagline with wide tracking, three cream pulsing dots, light status bar glyphs. The transition into Login fades to the cream canvas.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style(splash): move splash to Ink 900 hero surface

Recolors the Lottie's 11 fills to Cream 50 and replaces hand-tuned tagline
letterSpacing with the caption type token.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: `LoginScreen`

**Files:**
- Modify: `src/features/auth/LoginScreen.tsx`
- Modify: `__tests__/design-tokens.test.ts` (remove `features/auth/LoginScreen.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text`, `Button`, `TextField`.

- [ ] **Step 1: Rewrite the presentation, keep the logic**

All state, effects, `PhoneNumberHintModule` auto-detect, keyboard listeners, `AuthService.sendOtp` and navigation are unchanged. Only the rendered tree and styles change.

Replace the imports block and everything from `return (` to the end of the file:

```tsx
// ── imports ──
import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard,
  Dimensions,
  NativeModules,
} from 'react-native';
import Animated, {
  SlideInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '@/services/auth.service';
import { clearAuthData } from '@/utils/storage';
import { useAppToast } from '@/hooks/useAppToast';
import { Text, Button, TextField } from '@/components/ui';
```

```tsx
  // ── render ──
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-hero"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-canvas"
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero header — Ink 900, collapses when the keyboard opens */}
        <Animated.View
          style={animatedHeaderStyle}
          className="w-full bg-hero items-center justify-center"
        >
          <Animated.View
            entering={FadeInUp.duration(1000)}
            className="items-center gap-md"
          >
            <View className="w-24 h-24 rounded-pill bg-ember items-center justify-center shadow-ember-glow">
              <Text variant="display" tone="on-ember">
                JJ
              </Text>
            </View>
            <Text variant="h1" tone="on-hero">
              JJ's Kitchen
            </Text>
            <Text variant="caption" tone="on-hero" className="opacity-70">
              Dine in & catering
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.duration(600)}
          className="flex-1 bg-canvas rounded-t-sheet px-xl pt-xl shadow-e3"
          style={[{ paddingBottom: insets.bottom + 20 }, animatedCardStyle]}
        >
          <View className="items-center mb-xl gap-lg">
            <View className="w-16 h-1.5 rounded-pill bg-hairline" />
            <Text variant="title" className="text-center">
              Let's start with your phone number
            </Text>
          </View>

          <TextField
            label="Phone number"
            prefix="+91"
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="98765 43210"
            error={error || undefined}
            keyboardType="number-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={10}
            isDisabled={isLoading}
          />

          <Button
            label="Send OTP"
            loadingLabel="Sending OTP"
            onPress={handleContinue}
            isDisabled={!isButtonActive && !isLoading}
            isLoading={isLoading}
          />

          <View className="mt-auto pt-xl pb-md">
            <Text variant="body" tone="muted" className="text-center">
              By continuing, you automatically accept our{'\n'}
              <Text variant="body" className="underline">
                Terms & Conditions
              </Text>
              ,{' '}
              <Text variant="body" className="underline">
                Privacy Policy
              </Text>{' '}
              and{' '}
              <Text variant="body" className="underline">
                Cookies Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/** Layout-only: the ScrollView must be able to grow past the viewport. */
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
```

Delete the now-unused `Text`, `TextInput`, `TouchableOpacity` imports from `react-native`, the `Spinner` import from `heroui-native`, `FadeIn` from reanimated, and every entry in the old `StyleSheet.create` block except `scrollContent`.

The 🍔 emoji is replaced by a `JJ` monogram on an ember disc — the PDF's identity is a wordmark, not a burger.

- [ ] **Step 2: Un-allowlist and check**

Remove `'features/auth/LoginScreen.tsx',` from `ALLOWLIST`.

```bash
npx tsc --noEmit
npm run lint
npx jest
```

- [ ] **Step 3: Verify on device**

`npm run android`. Walk the screen:
- Charcoal hero with an ember monogram; cream sheet with a 28px top radius overlapping it.
- Focus the field → border turns ember. Type 9 digits and submit → chili error text and chili border.
- Type 10 digits → the button becomes ember with a glow; press it → spinner plus "Sending OTP".
- Open the keyboard → the header collapses smoothly, as before.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style(login): retheme to charcoal hero and cream sheet

Replaces the hand-rolled input and button with the TextField and Button
primitives; swaps the burger emoji for the JJ monogram.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: `OtpVerificationScreen`

**Files:**
- Modify: `src/features/auth/OtpVerificationScreen.tsx`
- Modify: `__tests__/design-tokens.test.ts` (remove `features/auth/OtpVerificationScreen.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text`, `Button`, `OtpInput`.

- [ ] **Step 1: Replace the slot rendering with `OtpInput`**

Delete the `renderSlots` function, the `hiddenInput` / `otpRow` styles, and the `isFocused` slot logic — `OtpInput` owns all of it. Keep `inputRef` (the SMS consent effect focuses it) and keep every effect, the resend timer, `AuthService.verifyOtp`, `AuthService.resendOtp` and `setAuth` exactly as they are.

Replace the OTP block with:

```tsx
<View className="items-center mb-sm">
  <OtpInput
    ref={inputRef}
    value={otp}
    onChangeText={text => {
      setOtp(text);
      if (text.length === 6) Keyboard.dismiss();
    }}
    error={error || undefined}
    onFocusChange={setIsFocused}
  />

  {isResending ? (
    <View className="mt-md flex-row items-center justify-center gap-sm">
      <Spinner size="sm" />
      <Text variant="body" tone="ember">
        Sending code...
      </Text>
    </View>
  ) : !canResend ? (
    <View className="mt-md items-center">
      <Text variant="body" tone="muted">
        Resend code in{' '}
        <Text variant="body" tone="ember">
          0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
        </Text>
      </Text>
    </View>
  ) : (
    <Button
      label="Resend OTP"
      variant="ghost"
      size="sm"
      onPress={handleResendOtp}
      isDisabled={isLoading}
      className="mt-md self-center"
    />
  )}
</View>
```

- [ ] **Step 2: Retheme the rest of the screen**

Apply the same treatment as Task 14 — `bg-hero` header, `bg-canvas rounded-t-sheet shadow-e3` sheet, `JJ` monogram on an ember disc with `Verify OTP` as `h1` / `on-hero`.

Replace the phone-number row and its "Change" chip:

```tsx
<View className="items-center mb-sm gap-sm">
  <View className="w-16 h-1.5 rounded-pill bg-hairline" />
  <Text variant="title" className="text-center">
    JJ's Kitchen has sent a 6-digit code to
  </Text>
  <View className="flex-row items-center gap-sm mt-xs">
    <Text variant="item">+91 {phone}</Text>
    <Button
      label="Change"
      variant="secondary"
      size="sm"
      onPress={() => navigation.navigate('Login', { prefillPhone: phone })}
    />
  </View>
</View>
```

Replace the verify button with:

```tsx
<Button
  label="Verify & Login"
  loadingLabel="Verifying..."
  onPress={handleVerify}
  isDisabled={!isButtonActive && !isLoading}
  isLoading={isLoading}
  className="mt-md"
/>
```

Reuse the terms block from Task 14 verbatim. Keep only `scrollContent` and `cardShadow`-free styles — the sheet shadow is now `shadow-e3`.

- [ ] **Step 3: Un-allowlist, check, verify**

Remove `'features/auth/OtpVerificationScreen.tsx',` from `ALLOWLIST`.

```bash
npx tsc --noEmit
npm run lint
npx jest
```

On device, walk the full flow from Login: request an OTP, confirm the six slots fill left to right with an ember caret, confirm **SMS autofill still populates all six digits** (this is the highest-risk regression in this task — `OtpInput` must keep a single real input), let the timer run to zero and confirm the resend ghost button appears, then verify a wrong code shows chili borders and a chili message.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style(otp): retheme and adopt the OtpInput primitive

Preserves the single-input SMS autofill behaviour.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: `complete-profile` restyle

The largest visual change in the migration. The flow is currently violet glassmorphism with a `ChefHat` watermark; the PDF has no glass language.

**Files:**
- Modify: `src/features/auth/complete-profile/index.tsx`
- Modify: `src/features/auth/complete-profile/NameStep.tsx`
- Modify: `src/features/auth/complete-profile/EmailStep.tsx`
- Delete: `src/features/auth/complete-profile/components/GlassInput.tsx`
- Delete: `src/features/auth/complete-profile/components/styles.ts`
- Modify: `__tests__/design-tokens.test.ts` (remove all five `complete-profile` entries from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text`, `Button`, `TextField`, `OtpInput`.
- The `isDarkMode` / `isDark` prop is removed from `NameStep` and `EmailStep`. `EMAIL_REGEX` moves into `index.tsx`.

- [ ] **Step 1: Delete the glass layer**

```bash
git rm src/features/auth/complete-profile/components/GlassInput.tsx
git rm src/features/auth/complete-profile/components/styles.ts
```

Every `GlassInput` usage becomes a `TextField` — the props line up (`label`, `value`, `onChangeText`, `placeholder`, `icon`, `error`, `keyboardType`, `autoCapitalize`, `returnKeyType`, `onFocus`, `onBlur`, `onSubmitEditing`), except `isDark` (deleted) and `disabled` (renamed `isDisabled`).

- [ ] **Step 2: Rewrite `index.tsx`**

Remove `useColorScheme`, `isDarkMode`, the `COLORS` import, and the `styles` import. Move the regex in:

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

Replace the background block. The violet `ChefHat` tile pattern and 400px watermark go; the PDF's canvas is plain Cream 50 with a single sand accent:

```tsx
<View className="flex-1 bg-canvas">
  {/* A single sunken wash instead of the old violet watermark field. */}
  <View className="absolute top-0 left-0 right-0 h-64 bg-sunken rounded-b-sheet" />
```

Replace the header row:

```tsx
<View className="px-xl flex-row items-center justify-between mb-xl">
  {currentStep === 2 ? (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
        setCurrentStep(1);
        setEmail('');
        setShowEmailOtp(false);
        setEmailOtp('');
        setIsOtpFocused(false);
      }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className="w-12 h-12 rounded-lg items-center justify-center bg-surface border border-hairline"
    >
      <ChevronLeft size={20} className="text-ink" />
    </TouchableOpacity>
  ) : (
    <View className="w-12 h-12 rounded-lg items-center justify-center bg-ember-tint">
      <ChefHat size={24} className="text-ember" />
    </View>
  )}

  {currentStep === 2 && (showEmailOtp || email.trim().length > 0) ? (
    <Animated.View entering={FadeIn.duration(250)}>
      <Button
        label="Skip"
        variant="ghost"
        size="sm"
        onPress={handleFinish}
        icon={<ArrowRight size={13} className="text-ember" strokeWidth={2.5} />}
      />
    </Animated.View>
  ) : (
    <View className="flex-row gap-xs">
      {[1, 2].map(s => (
        <View
          key={s}
          className={`h-1.5 rounded-pill ${
            s === currentStep ? 'w-10 bg-ember' : 'w-2 bg-hairline'
          }`}
        />
      ))}
    </View>
  )}
</View>
```

Replace the heading pair:

```tsx
<View className="px-xl flex-1">
  <Animated.View key={currentStep} entering={FadeIn.duration(600)}>
    <Text variant="h1" className="mb-sm">
      {currentStep === 1 ? "Let's get started!" : 'Add your email'}
    </Text>
  </Animated.View>

  <Animated.View
    key={`desc-${currentStep}`}
    entering={FadeIn.delay(100).duration(600)}
  >
    <Text variant="body" tone="muted" className="mb-lg">
      {currentStep === 1
        ? "Welcome to JJ's Kitchen. To provide the best experience, we need your name."
        : 'This is optional, but it helps secure your account and track your orders.'}
    </Text>
  </Animated.View>
```

Drop `isDarkMode` from both the `<NameStep>` and `<EmailStep>` prop lists. Keep the `<StatusBar barStyle="dark-content" />` (the canvas is cream) or remove it entirely, since `App.tsx` already sets it.

- [ ] **Step 3: Rewrite `NameStep.tsx`**

Remove the `isDarkMode` prop from its interface and every usage. Replace both `GlassInput`s with `TextField`, and the continue control with `Button`:

```tsx
<TextField
  label="First name"
  value={firstName}
  onChangeText={setFirstName}
  placeholder="Your first name"
  icon={<User size={18} className="text-muted" />}
  autoCapitalize="words"
  returnKeyType="next"
  onSubmitEditing={() => lastNameInputRef.current?.focus()}
  isDisabled={isLoading}
/>

<TextField
  ref={lastNameInputRef}
  label="Last name"
  value={lastName}
  onChangeText={setLastName}
  placeholder="Your last name"
  icon={<User size={18} className="text-muted" />}
  autoCapitalize="words"
  returnKeyType="done"
  onFocus={handleLastNameFocus}
  onBlur={handleLastNameBlur}
  isDisabled={isLoading}
/>

<Button
  label="Continue"
  loadingLabel="Saving..."
  onPress={handleNextStep}
  isDisabled={!isStep1Valid && !isLoading}
  isLoading={isLoading}
  className="mt-md"
/>
```

- [ ] **Step 4: Rewrite `EmailStep.tsx`**

Remove `isDarkMode` and every `isDarkMode ? … : …` colour ternary. Replace the email `GlassInput` with a `TextField` (`keyboardType="email-address"`, `autoCapitalize="none"`, `icon={<Mail size={18} className="text-muted" />}`), and replace the hand-rolled six-slot email OTP with the `OtpInput` primitive:

```tsx
<OtpInput
  ref={emailOtpRef}
  value={emailOtp}
  onChangeText={setEmailOtp}
  onFocusChange={setIsOtpFocused}
/>
```

Replace the shield/verify row and the finish control with `Text` and `Button`. The "Change email" chip becomes `<Button label="Change email" variant="ghost" size="sm" … />`.

- [ ] **Step 5: Un-allowlist and check**

Remove all five `complete-profile` entries from `ALLOWLIST` (`EmailStep.tsx`, `NameStep.tsx`, `index.tsx`, `components/GlassInput.tsx`, `components/styles.ts`).

```bash
npx tsc --noEmit
npm run lint
npx jest
```

Expected: all pass. `tsc` is the safety net here — it flags every place `isDarkMode` was threaded.

- [ ] **Step 6: Verify the whole flow on device**

Log in through to a fresh profile. Confirm, in order: step 1 with both name fields and the progress dots; focus ring turns ember; Continue is disabled until both names are filled; step 2 shows the back button; typing an email reveals the Skip ghost button; requesting the email OTP shows the six ember-caret slots; Skip and Finish both complete the flow. No violet remains anywhere.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "style(complete-profile): replace glassmorphism with the design system

Deletes GlassInput and the third copy of the palette in components/styles.ts.
Adopts TextField, OtpInput and Button; removes isDarkMode prop threading.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: `HomeScreen`

**Files:**
- Modify: `src/features/home/HomeScreen.tsx`
- Modify: `__tests__/design-tokens.test.ts` (remove `features/home/HomeScreen.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text`, `FoodCard`, `FoodItem`, `CategoryChip`, `LocationBar`, `TextField`.

- [ ] **Step 1: Retype the mock data and swap the categories**

Type the mock arrays as `FoodItem[]` and replace the generic Burger/Pizza/Sushi categories with the PDF's, which are what this restaurant actually serves:

```tsx
import { Text, FoodCard, CategoryChip, LocationBar, type FoodItem } from '@/components/ui';

const CATEGORIES = [
  'All',
  'Tandoor',
  'Starters',
  'Mutton',
  'Seafood',
  'Veg only',
];

const POPULAR_ITEMS: FoodItem[] = [ /* keep the existing objects, add tag: 'BESTSELLER' to the first */ ];
const MOST_ORDERED: FoodItem[] = [ /* keep the existing objects */ ];
```

- [ ] **Step 2: Rewrite the render tree**

```tsx
const SectionHeader = memo(({ title }: { title: string }) => (
  <View className="flex-row justify-between items-center px-lg mb-md">
    <Text variant="title">{title}</Text>
    <TouchableOpacity className="flex-row items-center gap-xs">
      <Text variant="caption" tone="ember">
        View all
      </Text>
      <ChevronRight size={16} className="text-ember" />
    </TouchableOpacity>
  </View>
));

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <ImageBackground
          source={{ uri: '…keep the existing uri…' }}
          style={[styles.banner, { height: BANNER_HEIGHT }]}
          imageStyle={styles.bannerImage}
        >
          {/* Ink 900 scrim keeps the location bar legible over any photo */}
          <View className="absolute inset-0 bg-hero/40" />

          <View
            style={{ paddingTop: insets.top + 10 }}
            className="items-center w-full"
          >
            <LocationBar
              label="Deliver to · Home"
              address="351 Maison Street, Bandra W"
              onHero
            />
          </View>

          <View className="mt-auto px-lg mb-xl">
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder="Search by item name…"
              icon={<Search size={20} className="text-muted" />}
              className="mb-0"
            />
          </View>
        </ImageBackground>

        <View className="mt-xl">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORIES.map((name, index) => (
              <Animated.View key={name} entering={FadeInRight.delay(index * 60)}>
                <CategoryChip
                  label={name}
                  isActive={name === category}
                  onPress={() => setCategory(name)}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        <View className="mt-xl">
          <SectionHeader title="Popular items" />
          <View className="px-lg">
            {POPULAR_ITEMS.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
                <FoodCard item={item} onAdd={() => {}} />
              </Animated.View>
            ))}
          </View>
        </View>

        <View className="mt-xl mb-32">
          <SectionHeader title="Most ordered" />
          <View className="px-lg">
            {MOST_ORDERED.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
                <FoodCard item={item} onAdd={() => {}} />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { width: '100%', justifyContent: 'flex-start' },
  bannerImage: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  categoryScrollContent: { paddingHorizontal: 16, gap: 8 },
});
```

The `CategoryItem` emoji-tile component is deleted — `CategoryChip` replaces it, matching PDF section 05. `console.log` calls in `onAdd` are removed.

- [ ] **Step 3: Un-allowlist, check, verify, commit**

Remove `'features/home/HomeScreen.tsx',` from `ALLOWLIST`.

```bash
npx tsc --noEmit
npm run lint
npx jest
```

On device: hero banner with a legible location pill over a charcoal scrim, a cream search field, a chip row where only the tapped chip is ember, and food rows matching PDF section 05.

```bash
git add -A
git commit -m "style(home): retheme and adopt FoodCard, CategoryChip, LocationBar

Replaces the emoji category tiles with the PDF's category chips and the
generic cuisine list with the restaurant's actual sections.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: `ProfileScreen`

**Files:**
- Modify: `src/features/profile/ProfileScreen.tsx`
- Modify: `__tests__/design-tokens.test.ts` (remove `features/profile/ProfileScreen.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text`, `Tag`.

- [ ] **Step 1: Retokenize the menu configuration**

Every icon in `MENU_SECTIONS` currently carries `className="text-primary dark:text-primary-dark"`; change each to `className="text-ember"`. The logout entry's `color: '#EF4444'` and `color: 'text-red-500'` become `tone: 'chili'` — change the `ProfileMenuItem` interface field from `color?: string` to `tone?: TextTone` and set the logout icon to `className="text-chili"`.

- [ ] **Step 2: Retokenize `MenuItem`**

```tsx
const MenuItem = memo(
  ({ icon, title, subtitle, onPress, tone = 'ink', delay = 0, badge }: MenuItemProps) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        className="flex-row items-center py-md px-xl"
      >
        <View className="w-11 h-11 rounded-lg items-center justify-center bg-ember-tint">
          {icon}
        </View>
        <View className="flex-1 ml-md">
          <Text variant="item" tone={tone}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="muted" className="mt-xs">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? <Tag label={badge} /> : null}
        <ChevronRight size={16} className="text-muted ml-sm" strokeWidth={3} />
      </TouchableOpacity>
    </Animated.View>
  ),
);
```

- [ ] **Step 3: Retokenize the header and footer**

```tsx
<Animated.View
  entering={FadeInUp.duration(800).springify()}
  className="items-center px-lg mb-xl gap-lg"
>
  <View className="w-24 h-24 rounded-pill bg-ember items-center justify-center shadow-ember-glow">
    <Text variant="h1" tone="on-ember">
      {getInitials()}
    </Text>
  </View>

  <View className="items-center gap-sm">
    <Text variant="h2">
      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User Name'}
    </Text>
    <View className="bg-sunken px-md py-sm rounded-pill">
      <Text variant="caption" tone="muted">
        {user?.email || 'Email'}
      </Text>
    </View>
  </View>
</Animated.View>
```

Section titles become `<Text variant="caption" tone="muted" className="px-xl mb-sm">`; the footer rule becomes `bg-hairline` and the version line `<Text variant="caption" tone="muted">`.

- [ ] **Step 4: Un-allowlist, check, verify, commit**

Remove `'features/profile/ProfileScreen.tsx',` from `ALLOWLIST`.

```bash
npx tsc --noEmit
npm run lint
npx jest
```

On device: ember avatar disc with a glow, ember-tint icon tiles, ember badge tags, chili logout row. Confirm the logout confirmation `Alert` still fires and signs out.

```bash
git add -A
git commit -m "style(profile): retheme to the design system palette

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 19: `CustomTabBar`

**Files:**
- Modify: `src/components/navigation/CustomTabBar.tsx`
- Modify: `__tests__/design-tokens.test.ts` (remove `components/navigation/CustomTabBar.tsx` from `ALLOWLIST`)

**Interfaces:**
- Consumes: `Text` (Task 5).

- [ ] **Step 1: Replace the hardcoded icon colors**

`TabIcon` currently hardcodes `'#FF6B35'` and `'#94A3B8'` — neither is in the design system. Icons take a `className` instead. Per PDF section 04, the active tab uses the **filled** icon variant:

```tsx
const TabIcon = memo(({ name, isFocused, cartCount }: TabIconProps) => {
  const className = isFocused ? 'text-ember' : 'text-muted';
  const size = 24;
  const strokeWidth = isFocused ? 2.5 : 1.9; // PDF section 04: 1.9px stroke
  const fill = isFocused ? 'currentColor' : 'none';

  switch (name) {
    case 'Home':
      return <Home size={size} className={className} strokeWidth={strokeWidth} fill={fill} />;
    case 'Saved':
      return <Bookmark size={size} className={className} strokeWidth={strokeWidth} fill={fill} />;
    case 'Cart':
      return (
        <View className="bg-ember p-md rounded-pill -mt-10 shadow-ember-glow">
          <ShoppingBag size={28} className="text-on-ember" strokeWidth={2.5} />
          {cartCount > 0 ? (
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-pill bg-surface items-center justify-center border-2 border-ember">
              <Text variant="caption" tone="ember">
                {cartCount}
              </Text>
            </View>
          ) : null}
        </View>
      );
    case 'Orders':
      return <ClipboardList size={size} className={className} strokeWidth={strokeWidth} fill={fill} />;
    case 'Profile':
      return <User size={size} className={className} strokeWidth={strokeWidth} fill={fill} />;
    default:
      return null;
  }
});
```

- [ ] **Step 2: Retokenize the container**

```tsx
<View
  style={containerStyle}
  className="bg-surface border-t border-hairline rounded-t-sheet shadow-e3"
>
  <View className="flex-row items-center justify-around px-md">
```

And the label:

```tsx
{route.name !== 'Cart' ? (
  <Text variant="caption" tone={isFocused ? 'ember' : 'muted'} className="mt-xs">
    {route.name}
  </Text>
) : null}
```

Reduce `styles` to layout only — drop `shadowColor: '#000'` and the border radii (now Tailwind):

```tsx
const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    paddingTop: 12,
  },
  tabButton: { flex: 1 },
});
```

The `badge` style is deleted — the badge is sized by `w-5 h-5 rounded-pill`.

- [ ] **Step 3: Un-allowlist, check, verify, commit**

Remove `'components/navigation/CustomTabBar.tsx',` from `ALLOWLIST`. `ALLOWLIST` should now be `[]`.

```bash
npx tsc --noEmit
npm run lint
npx jest
```

On device: inactive tabs muted warm grey with 1.9px outline icons, the active tab ember and filled, the floating cart button ember with a glow. Add an item so the cart tab appears and confirm the badge renders.

```bash
git add -A
git commit -m "style(tabbar): retheme to ember active state with filled icons

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 20: Close the ratchet and verify the whole app

**Files:**
- Modify: `__tests__/design-tokens.test.ts`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Assert the allowlist is empty, permanently**

In `__tests__/design-tokens.test.ts`, confirm `ALLOWLIST` is `[]` and add a test that keeps it that way:

```ts
it('allowlist is empty — the migration is complete', () => {
  expect(ALLOWLIST).toEqual([]);
});
```

- [ ] **Step 2: Run the full suite**

```bash
npx tsc --noEmit
npm run lint
npx jest
```

Expected: all three pass with an empty allowlist. If a hex survives somewhere, the guard names the file and line — fix it by adding a token to `global.css` and referencing it, never by re-allowlisting.

- [ ] **Step 3: Confirm the whole system is token-driven**

Prove the core claim of this migration by changing one line. In `src/global.css`, temporarily set:

```css
--ember-500: #0e7c86; /* temporarily teal */
```

```bash
npm start -- --reset-cache
npm run android
```

Expected: **every** button, active chip, active tab, price accent, stepper, glow, focus ring and caret across every screen turns teal. Anything still orange is a hardcoded value the guard missed — find it and tokenize it.

Revert:

```bash
git checkout src/global.css
```

- [ ] **Step 4: Full walkthrough on a clean install**

```bash
adb uninstall com.jjskitchen.app
npm run android
```

Check every screen against the PDF: splash → login → OTP → complete-profile step 1 → step 2 (with and without the email OTP open) → home → profile → tab bar with and without cart items. Then toggle the device into dark mode and confirm **every screen is pixel-identical**.

- [ ] **Step 5: Update `CLAUDE.md`**

Replace the "Styling" section:

```markdown
### Styling

Tailwind v4 via **Uniwind**, with **HeroUI Native** on top. `src/global.css` is the
**single source of truth** for every color, type style, spacing, radius and elevation
value in the app — it is the only file permitted to contain a hex literal.

Design system: JJ's Kitchen v1.0 (Charcoal + Ember). Spec:
`docs/superpowers/specs/2026-09-06-design-system-v1-design.md`.

- Canvas `#FBF7F1` · hero/splash `#14100D` · action `#EC5B13`
- Type: Bricolage Grotesque (>= 24px) + Plus Jakarta Sans (<= 20px), bundled as
  static instances in `src/assets/fonts/`
- **One palette renders in both light and dark device schemes.** There is no theme
  store, no `dark:` variant, and no `-dark` token.
- Weight is selected by font family name (`font-jakarta-600`), never `fontWeight` —
  React Native cannot synthesize weights from a static face.
- Use `src/components/ui/` primitives (`Text`, `Button`, `TextField`, `OtpInput`,
  `FoodCard`, …) rather than restyling from scratch.
- `npx jest __tests__/design-tokens.test.ts` fails the build on any hardcoded hex or
  `dark:` variant. Its allowlist is empty and must stay empty.
```

- [ ] **Step 6: Final commit**

```bash
npm run lint
git add -A
git commit -m "chore: close the design token ratchet

The allowlist is empty: no hardcoded color or dark: variant remains under src/.
Documents the token architecture in CLAUDE.md.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: D1 → Tasks 4, 20; D2 → Task 3; D3 → Task 2; D4 → Task 13; D5 → Task 16; the three-layer `global.css` → Task 3; the type scale → Tasks 3, 5; the component kit table → Tasks 5–12; the migration surface table → Tasks 4, 10, 13–19; the token guard → Tasks 1, 20; manual verification → the device step in every task.

**Deletions accounted for.** `src/theme/index.ts` (Task 3), `src/store/theme.store.ts` (Task 4), `FoodListItem.tsx` (Task 10), `GlassInput.tsx` and `complete-profile/components/styles.ts` (Task 16).

**Allowlist arithmetic.** Task 1 seeds 14 entries, each claimed by exactly one later task:

| Entry | Removed by |
| --- | --- |
| `theme/index.ts` | Task 3 |
| `components/common/PlaceholderScreen.tsx` | Task 4 |
| `components/common/FoodListItem.tsx` | Task 10 |
| `features/auth/SplashScreen.tsx` | Task 13 |
| `features/auth/LoginScreen.tsx` | Task 14 |
| `features/auth/OtpVerificationScreen.tsx` | Task 15 |
| `features/auth/complete-profile/index.tsx` | Task 16 |
| `features/auth/complete-profile/NameStep.tsx` | Task 16 |
| `features/auth/complete-profile/EmailStep.tsx` | Task 16 |
| `features/auth/complete-profile/components/GlassInput.tsx` | Task 16 |
| `features/auth/complete-profile/components/styles.ts` | Task 16 |
| `features/home/HomeScreen.tsx` | Task 17 |
| `features/profile/ProfileScreen.tsx` | Task 18 |
| `components/navigation/CustomTabBar.tsx` | Task 19 |

14 seeded, 14 removed. `ALLOWLIST` reaches `[]` at Task 19, which Task 20 asserts permanently. `src/hooks/useAppToast.tsx` is deliberately absent from the seed list: it holds no hex and rethemes for free via D2.

**Type consistency.** `FoodItem` is defined once (Task 10) and consumed in Task 17. `TextTone` is defined in Task 5 and consumed by `Button` (Task 6) and `ProfileScreen` (Task 18). `TextField`'s disabled prop is `isDisabled` everywhere, including the `GlassInput` migration note in Task 16. `OtpInput`'s `onFocusChange` matches the `setIsFocused` call sites in Tasks 15 and 16.

**Known risk carried forward.** Task 7 flags that `placeholderClassName` may not be supported by Uniwind; it must be resolved inside Task 7, before six screens depend on `TextField`.
