# JJ's Kitchen — Design System v1.0 Migration

**Date:** 2026-09-06
**Status:** Approved for planning
**Source of truth:** `Mobile app design scope.pdf` (JJ's Kitchen Design System v1.0)

## Problem

The app ships an indigo/beige/purple palette (`#170C79`, `#EFE3CA`, `#8E05C2`) that has no
relationship to the approved design system. The PDF specifies a Charcoal + Ember identity with a
Bricolage Grotesque / Plus Jakarta Sans type pairing, none of which exists in the codebase.

Three structural problems block a clean retheme:

1. **Tokens are not the source of truth.** 80 hardcoded color literals live across 13 files, and
   9 files use `StyleSheet.create` with baked-in hex. Changing `global.css` today changes only
   part of the app.
2. **The palette is duplicated and drifting.** `src/theme/index.ts` holds a second, divergent copy
   of the palette (it defines `accent: '#56B6C6'`, a teal that appears nowhere in `global.css`).
3. **No font pipeline exists.** There is no `fontFamily` anywhere, no `react-native.config.js`, and
   no fonts directory. All type currently renders in the platform default face.

## Goals

- Every color, type style, spacing, radius and elevation value in the app resolves from
  `src/global.css`. Changing a token there changes the app everywhere.
- The app matches the PDF's Charcoal + Ember identity, type pairing, and component kit.
- A regression guard prevents hardcoded values from creeping back in.

## Non-goals

- New product screens (menu, cart, checkout, tracking). This pass rethemes what exists and
  builds the primitives those future screens will be assembled from.
- Backend integration. The app stays UI-only with mock data.
- The driver app and admin dashboard from the PDF's "Next steps" section.

## Decisions

### D1 — One palette, identical in light and dark

The PDF defines a single warm light system and does not specify a dark theme. Per explicit user
direction, the app renders the PDF palette regardless of the device color scheme.

Consequences:

- `App.tsx` stops applying the `dark` class. HeroUI Native therefore always resolves its
  `@variant light` block, with our tokens layered on top.
- All 135 `dark:` variant occurrences across 14 files are removed.
- `src/store/theme.store.ts` is deleted — `themeMode` would control nothing observable.
- `src/theme/index.ts` is deleted — the duplicate palette.
- `useColorScheme()` usage in `complete-profile/index.tsx` is removed, along with the `isDark` /
  `isDarkMode` prop threaded down into `NameStep`, `EmailStep`, and `GlassInput`.
- `StatusBar` is fixed to `dark-content` (dark glyphs on the cream canvas). The splash screen,
  which is an Ink 900 immersive surface, is the one exception and uses `light-content`.

### D2 — Override HeroUI Native's variable contract rather than wrapping its components

HeroUI Native (39 components, already the project's component library per CLAUDE.md) reads its
own CSS custom properties: `--background`, `--foreground`, `--surface`, `--surface-secondary`,
`--surface-tertiary`, `--overlay`, `--backdrop`, `--muted`, `--default`, `--accent`,
`--field-background`, `--field-foreground`, `--field-placeholder`, `--field-border`, `--success`,
`--warning`, `--danger`, `--border`, `--separator`, `--focus`, `--link`, `--radius`.

It declares these inside `@layer theme { :root { @variant light { … } } }`. Unlayered `:root`
declarations win over layered ones in the CSS cascade, so redefining these names in a plain
`:root` block rethemes every HeroUI component at once.

This is not speculative: the current `global.css` already overrides `--background`, `--surface`,
`--foreground`, `--muted` and `--border` this way, and the app renders the custom beige rather
than HeroUI's default gray. The mechanism is proven in this codebase.

Consequence: `useAppToast` needs no changes at all. It delegates to HeroUI's `variant`
(`success` / `danger` / `warning` / `accent`), so it inherits the new palette automatically. This
is the pattern the whole migration aims for.

### D3 — Static font instances from upstream OFL repositories

Google Fonts serves both families as variable fonts only. React Native resolves `fontFamily` by
filename on Android and by PostScript name on iOS; a single variable file does not map reliably to
discrete weights on either platform.

Both families publish correctly-named static instances upstream under the SIL Open Font License:

- Bricolage Grotesque — `github.com/ateliertriay/bricolage`, `fonts/ttf/`
- Plus Jakarta Sans — `github.com/tokotype/PlusJakartaSans`, `fonts/ttf/`

Nine files are bundled: Bricolage Grotesque 400/600/700/800 and Plus Jakarta Sans
400/500/600/700/800. `OFL.txt` for each family ships alongside them.

Note: Bricolage's `fonts/ttf/` also contains `12pt` and `Condensed` optical/width variants. Only
the default-width, default-optical-size files (`BricolageGrotesque-Bold.ttf`, not
`BricolageGrotesque12ptCondensed-Bold.ttf`) are used.

### D4 — Splash keeps its Lottie, changes its ground

`src/assets/animations/jjs_kitchen_splash.json` is pure vector: 12 layers, zero image assets, and
exactly one fill color — `#F5F1E8`, a warm cream, on a transparent background. It currently sits on
a `#0E1A2B` navy container that the PDF does not contain.

The container becomes Ink 900 (`#14100D`, which the PDF names for "hero, splash") and the Lottie
fill is retuned to Cream 50 (`#FBF7F1`). This is exactly the PDF's hero treatment — cream wordmark
on charcoal — and requires no re-authoring of the animation.

### D5 — complete-profile is restyled, not recolored

The `complete-profile` flow (5 files, ~1000 lines) is a violet glassmorphism design: `#8B7FD4`,
`#EDEAF9`, `#F7F5FF`, `#D8D4F0`, animated `interpolateColor` borders, translucent glass surfaces,
and a `ChefHat` watermark pattern at 3% opacity. The PDF has no glass language.

This flow is restyled to charcoal-and-ember surfaces. `GlassInput` becomes `TextField` from the
component kit, `components/styles.ts` (which holds the `COLORS` constant object — the third copy
of the palette) is deleted, and the focus/error/disabled animation is preserved but driven by
tokens.

## Architecture

### `src/global.css` — three layers

**Layer A — raw palette.** The PDF's swatches, named as the PDF names them. Referenced only by
Layer B, never by a component.

| Group | Tokens |
| --- | --- |
| Charcoal | `--ink-900 #14100D` · `--ink-800 #211811` · `--ink-700 #2E241B` · `--ink-600 #4A3D30` |
| Ember & Saffron | `--ember-500 #EC5B13` · `--ember-600 #CD4A0A` · `--saffron-400 #F6A623` · `--ember-50 #FBE7D6` |
| Neutrals | `--cream-50 #FBF7F1` · `--surface-0 #FFFFFF` · `--sand-100 #F3ECE1` · `--border-warm #E7DDCC` · `--muted-warm #8A7D6C` |
| Functional | `--veg #147D3A` · `--non-veg #9E2A1B` · `--chili #C22A1B` · `--warning-amber #E08A00` · `--info-teal #0E7C86` |

**Layer B — semantic tokens.** Maps Layer A onto meaning, and deliberately occupies HeroUI
Native's variable names so its components inherit the theme (see D2). Includes both the HeroUI
contract and JJ's-specific names (`--canvas`, `--hero`, `--sunken`, `--hairline`, `--price`,
`--strike`).

**Layer C — `@theme inline`.** Exposes Layer B as Tailwind utilities, plus the PDF's scales.

- Colors: `bg-canvas`, `bg-hero`, `bg-sunken`, `text-ember`, `text-veg`, `border-hairline`, …
- Spacing (4px base): `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 32` · `2xl 48`
- Radius: `sm 8` · `md 12` · `lg 16` · `xl 20` · `sheet 28` · `pill 9999`
- Elevation: `e1` (card) · `e2` (raised) · `e3` (sheet) · `ember-glow`

### Typography

Each type step is a single `--text-*` token carrying size, line height and letter spacing
together, so one utility class yields a complete, correct type style.

| Utility | Family | Size / weight / tracking |
| --- | --- | --- |
| `text-display` | Bricolage | 44 / 800 / −3% |
| `text-h1` | Bricolage | 32 / 700 |
| `text-h2` | Bricolage | 24 / 700 |
| `text-title` | Jakarta | 20 / 700 |
| `text-item` | Jakarta | 17 / 600 |
| `text-body` | Jakarta | 15 / 500 |
| `text-caption` | Jakarta | 12 / 700 / +14%, uppercase |

The PDF constrains Bricolage to ≥24px; the split above honors that — everything at 20px and
below is Jakarta.

Weight is selected by font family name (`font-jakarta-600`), not by `fontWeight`, because React
Native cannot synthesize weights from a static face. The `Text` primitive encapsulates this so no
screen has to think about it.

### `src/components/ui/` — the component kit

HeroUI Native covers most of PDF section 05 once its tokens are overridden. Custom primitives fill
the gaps. Every primitive is token-only — no hex literal, no magic number.

| Primitive | Basis |
| --- | --- |
| `Text` | custom — variant per the type scale table |
| `Button` | HeroUI `Button` + variant map (primary, secondary, ghost, destructive, disabled, small) |
| `TextField`, `OtpInput` | HeroUI `Input` / `InputOTP` + `Label` + `FieldError` |
| `VegBadge`, `RatingBadge`, `Tag`, `SpiceBadge` | custom |
| `PriceTag` | custom — strike-through and Full/Half portion variants |
| `CategoryChip` | HeroUI `Chip` |
| `QuantityStepper` | custom — `ADD` initial state and `− n +` active state |
| `Segmented` | HeroUI `Tabs` |
| `FoodCard` | custom — list and grid layouts; replaces `FoodListItem` |
| `TopAppBar`, `LocationBar` | custom |
| `OrderTimeline` | custom |
| `EmptyState`, `ErrorState`, `SkeletonCard` | custom + HeroUI `Skeleton` |

### Migration surface

| File | Change |
| --- | --- |
| `src/global.css` | rewritten — the three layers above |
| `react-native.config.js` | new — asset linking |
| `src/assets/fonts/` | new — 9 TTFs + 2 OFL licenses |
| `src/components/ui/` | new — the kit above |
| `App.tsx` | drop `dark` class, drop theme store, fix StatusBar |
| `src/store/theme.store.ts` | deleted |
| `src/theme/index.ts` | deleted |
| `src/features/auth/complete-profile/components/styles.ts` | deleted |
| `src/features/auth/complete-profile/components/GlassInput.tsx` | deleted, replaced by `TextField` |
| `SplashScreen`, `LoginScreen`, `OtpVerificationScreen` | retokenized |
| `complete-profile/{index,NameStep,EmailStep}` | restyled per D5 |
| `HomeScreen`, `ProfileScreen`, `PlaceholderScreen` | retokenized |
| `FoodListItem` | replaced by `FoodCard` |
| `CustomTabBar` | retokenized — active tab Ember 500, inactive Muted |
| `useAppToast` | unchanged (inherits via D2) |

## Testing

| Check | Command |
| --- | --- |
| Types | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Unit | `npm test` |
| Token guard | `npm test` (new suite, see below) |
| Device | `npm run android` on a clean install |

**Token guard.** A new Jest suite walks `src/` and `App.tsx` and fails on:

1. any hex color literal outside `src/global.css`,
2. any `dark:` Tailwind variant,
3. any import of the deleted `theme.store` / `theme/index` modules.

Allowances: `src/assets/` (the Lottie JSON) and the fonts directory are skipped. This is what keeps
"one file drives everything" true after this pass, rather than only during it.

**Manual verification.** Every screen is checked on device against the PDF: splash, login, OTP,
complete-profile step 1, complete-profile step 2 with and without the email OTP open, home,
profile, and the tab bar with and without cart items.

## Risks

| Risk | Mitigation |
| --- | --- |
| Uniwind may not honor unlayered-over-layered cascade for HeroUI tokens | Verified first, before any screen work — the current `global.css` already relies on this behavior |
| Uniwind may not support Tailwind v4 `--text-*` composite tokens (size + leading + tracking) | Verified in the same early task; fallback is discrete tokens composed inside the `Text` primitive |
| `react-native-asset` may not wire fonts into the existing Android project cleanly | Font rendering confirmed on device before any screen is restyled |
| Ember 500 on Cream 50 is 3.24:1 — below WCAG AA for body text | Ember is used for actions, icons and large type only; body text is Ink 800 on Cream 50 (16.35:1). Enforced by the `Text` primitive's defaults |
| `complete-profile` restyle is the largest visual change and could regress its animations | Focus/error/disabled interpolation behavior is preserved; the flow is walked end to end on device |

## Contrast audit

Measured against the PDF's own token assignments:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| Ink 800 on Cream 50 (body) | 16.35:1 | AAA |
| Cream 50 on Ink 900 (hero) | 17.73:1 | AAA |
| Ember 500 on Ink 900 | 5.47:1 | AA |
| Chili on Cream 50 | 5.40:1 | AA |
| Veg on Cream 50 | 4.89:1 | AA |
| Muted on Cream 50 (captions) | 3.76:1 | **fails AA** |
| White on Ember 500 (primary button) | 3.46:1 | **fails AA**, passes AA Large |
| Ember 500 on Cream 50 | 3.24:1 | fails AA, passes AA Large — acceptable, used for large type and icons only |

Two of these are gaps in the source design, not in the implementation:

1. **Muted `#8A7D6C` on Cream 50 is 3.76:1**, and the PDF assigns Muted to captions at 12px —
   the size that most needs contrast. Darkening Muted to roughly `#6F6354` reaches 4.5:1 while
   staying in the same warm family.
2. **White on Ember 500 is 3.46:1**, and the PDF's primary button is white on Ember. It passes
   AA Large (3:1), which covers bold text at 14px and above, so a bold ≥14px button label is
   compliant. A 12px caption-style label on an Ember button would not be.

**This spec implements the PDF as written.** Both values are single-token changes in Layer A if
you decide to close the gaps; nothing else in the system moves.
