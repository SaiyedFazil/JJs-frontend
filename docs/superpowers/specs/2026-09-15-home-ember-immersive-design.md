# Home screen — Ember Immersive

**Date:** 2026-09-15
**Status:** Approved for planning
**Source design:** Claude Design project `4037f026`, `Home Redesign.dc.html`, variant **1a — Ember Immersive** ("Dark hero · a signature dish leads")
**Supersedes:** the current [HomeScreen](../../../src/features/home/HomeScreen.tsx) (photo banner + chips + two list sections), commit `8353ff9`

---

## 1. What this is

A full replacement of the home screen with the Ember Immersive direction: a dark Ink 900 header, a signature dish as the lead visual, and the rest of the menu delivered as horizontal rails on the cream canvas. The restaurant's real menu (125 dishes across 16 categories) backs it.

The design medium was HTML/CSS. The prototype's structure is not copied; its **visual output** is recreated against the existing design system.

---

## 2. Decisions

These were settled before the spec was written. They constrain everything below.

### D1 — The token layer absorbs the mock's palette; near-duplicates snap

The mock carries ~25 colours. Where one lands within a few percent of an existing token, the **token wins** and the mock's value is discarded. Only genuinely new colours become new tokens.

`src/global.css` remains the only file in the app permitted to contain a hex literal. The allowlist in `__tests__/design-tokens.test.ts` stays empty.

### D2 — The app's four-tab nav replaces the cart FAB

The mock's bottom nav is Home / Saved / Orders / Profile with the cart promoted to a sticky bar. The app's raised ember cart FAB is removed rather than kept alongside it, because two cart affordances stacked at the screen's bottom edge is not what the design intends.

### D3 — The app's type, spacing, radius and elevation scales win over the mock's literal values

Same discipline as D1, applied to every other dimension. The mock was authored in free CSS and uses values like 19px type, 18px padding and 19px radius that have no token. Each snaps to its nearest scale step.

This is load-bearing for one rule in particular: **Bricolage Grotesque is constrained to ≥24px** by the design system (`global.css` §02). The mock sets section headings in Bricolage at 19–20px. Those headings therefore render in **Plus Jakarta Sans at the `title` step**, not in Bricolage. Mapping tables are in §6.

### D4 — Images are deferred behind a component seam

The menu data has no `image` field and the mock's `<image-slot>` is an explicit "fill this later" placeholder. A single `ImageTile` primitive renders a photo when a `uri` is present and a tokenised tile carrying the dish's category emoji when it isn't. Adding real photography later is a data change, not a UI change.

### D5 — Rails are data-driven, not hardcoded

The mock hardcodes five bestseller ids. The rail instead reads `tags.includes('bestseller')`, so the restaurant controls it by editing data. This yields 8 dishes (§5.3).

### D6 — Out of scope

- **Scroll-condensed sticky header.** The mock collapses the dark header to a compact bar past 150px of scroll. Not built.
- **Pure Veg filtering.** The toggle renders in the status strip and is interactive, but does not yet filter the rails. It is wired to local state only, so enabling filtering later is a one-line change per rail.

---

## 3. Token additions

### 3.1 Reused unchanged

| Mock value | Existing token |
| --- | --- |
| `#EC5B13` | `--accent` → `ember` |
| `#CD4A0A` | `--ember-pressed` |
| `#F6A623` | `--saffron-400` → `saffron` |
| `#14100D` | `--hero` |
| `#211811` | `--hero-surface` |
| `#FBE7D6` | `--ember-tint` |
| `#147D3A` | `--veg` |
| `#9E2A1B` | `--non-veg` |
| `#C22A1B` | `--chili` |
| `#E08A00` | `--warning` |
| `#8A7D6C` | `--muted` |
| `#FFFFFF` | `--surface` |
| `#F3ECE1` | `--sunken` |
| `#FBF7F1` | `--canvas` |

### 3.2 Snapped (mock value discarded)

| Mock value(s) | Resolves to | Token |
| --- | --- | --- |
| `#1C1712` | `#211811` | `ink` |
| `#EFE7DA`, `#E0D3BF` | `#E7DDCC` | `hairline` |
| `#F4EADD`, `#F7EFE4` | `#FBF7F1` | `hero-foreground` |
| `#4A4038` | `#4A3D30` | `ink-600` |
| `#9C8F7E` | `#8A7D6C` | `muted` |
| `#9C8B78`, `#C9B9A6`, `#B9A794`, `#E9D9C6` | `#A89A87` | `hero-muted` |
| `#F09080` | `#EF6B58` | `hero-danger` |
| `rgba(10,8,6,α)` | `#14100D` at α | `hero/α` |

### 3.3 New — Layer A (raw palette)

Added under a new `CATEGORY TINTS` block and appended to the existing blocks:

```css
/* CATEGORY TINTS · the menu's cuisine coding (Chicken Tandoor reuses --ember-50) */
--tint-mutton:   #f6e0da;
--tint-seafood:  #ddeef0;
--tint-tawa:     #f7eed6;
--tint-sizzler:  #fbe1d0;
--tint-chinese:  #ede6d6;
--tint-veg:      #e6f0e1;
--tint-bread:    #f1eedf;
--tint-dessert:  #f6e6ec;
--tint-drink:    #e7eef2;
--tint-selected: #ffead9;

/* EMBER & SAFFRON — additions */
--ember-700:  #c8410a;   /* offer-card gradient end */
--ember-100:  #ffe2ce;   /* secondary text on an ember ground */

/* CHARCOAL — addition */
--ink-750:    #38291d;   /* hairlines inside a hero panel */

/* FUNCTIONAL — additions */
--veg-50:     #e6f2ea;   /* Pure Veg switch, on */
--veg-300:    #7bd69b;   /* veg affirmative on charcoal */
--non-veg-300:#ff8f5e;   /* non-veg mark lifted for a photo scrim */
--closed-900: #3a2320;   /* closed-strip ground */
--closed-300: #f6c98a;   /* closed-strip text — 7.1:1 on --closed-900 */
--track-off:  #c9bca6;   /* switch track, off */
```

19 entries. None ends in `-dark`, and none alters the 18 PDF swatches pinned by `__tests__/global-css-contract.test.ts`, so both existing suites stay green unmodified.

### 3.4 New — Layer B (semantic) and Layer C (Tailwind exposure)

Every entry above gets a Layer B alias and a `--color-*` entry in `@theme inline`. Layer C names, which are the utility vocabulary the components are written against:

`tint-tandoor` (aliases `--ember-tint`), `tint-mutton`, `tint-seafood`, `tint-tawa`, `tint-sizzler`, `tint-chinese`, `tint-veg`, `tint-bread`, `tint-dessert`, `tint-drink`, `tint-selected`, `ember-deep`, `on-ember-muted`, `hero-hairline-lifted`, `veg-tint`, `veg-bright`, `non-veg-bright`, `closed`, `closed-foreground`, `switch-track-off`.

(Named `switch-track-off` in the implementation, not `track-off` — the extra prefix disambiguates it from other track-style tokens as the Layer C vocabulary grew. `--track-off` at Layer A is unaffected.)

> `hero-hairline-lifted` (`#38291D`) is deliberately *lighter* than the existing `hero-hairline` (`#2E241B`). It is the border of a card sitting on `hero-surface` inside a spotlight panel, where the darker hairline disappears.

> `__tests__/design-tokens.test.ts` scans for `\b(?:bg|text|border)-([a-z][a-z0-9-]*)` and fails on any utility with no matching `--color-*`. Layer C must therefore be complete before any component referencing these lands.

---

## 4. Gradients

`react-native-svg` is already a dependency. Five gradients in the mock become one helper module, `src/components/ui/Gradient.tsx`, exporting two components that render an absolutely-positioned `<Svg>` behind their container's content:

| Export | Used by | Mock source |
| --- | --- | --- |
| `LinearFill` | offer card, avatar tile, hero photo scrim | `linear-gradient(…)` |
| `RadialGlow` | dark header, sizzler spotlight | `radial-gradient(circle, rgba(236,91,19,.25), transparent 62%)` |

Both take token-resolved colours as props; neither contains a hex.

The hero photo scrim is `LinearFill` bottom→top with stops `hero` @ 0.92 / 6%, `hero` @ 0.2 / 52%, transparent / 100%.

---

## 5. Data

### 5.1 Module layout

- `src/types/menu.ts` — `MenuItem`, `MenuCategory`, `Portion`
- `src/data/menu.ts` — the menu, ported from the supplied `menu-data.js`

The port is **verbatim**: same 125 `raw` entries, same `slug()` implementation, same `MENU` / `byId` / `POPULAR` / `priceOf()` exports. Ids must not drift — the whole screen addresses dishes by slug.

```ts
export interface MenuItem {
  id: string;              // slug(name)
  name: string;
  desc?: string;
  price?: number;          // absent when portion is present
  portion?: { full: number; half: number };
  base: number;            // representative price — portion.full ?? price
  veg: boolean;
  cat: MenuCategory['id'];
  popular?: boolean;
  tags: ('bestseller' | 'spicy' | 'chefs')[];
  soldOut?: boolean;
  mrp?: boolean;
  image?: string;          // reserved for D4; nothing sets it yet
}
```

### 5.2 Fields the mock has no treatment for

Your data carries two flags the prototype ignores. Both get defined behaviour rather than being dropped:

- **`soldOut`** (Paneer Tikka Masala) — the card dims to 55% opacity, the ADD control is replaced by a non-interactive `SOLD OUT` label in `muted`, and the card is not pressable.
- **`mrp`** (the three beverages) — the price renders as `MRP ₹20` rather than `₹20`.

### 5.3 What fills each surface

| Surface | Selector | Result |
| --- | --- | --- |
| Signature hero | `byId['tandoori-chicken']` | Tandoori Chicken, ₹499 full / ₹279 half — matches the mock's "₹499 · Full / Half" exactly |
| Bestsellers rail | `tags.includes('bestseller')` | Tandoori Chicken, Tandoori Murgh Malai, Chicken Burrah, Mutton Burrah, Butter Chicken, Mutton Rogan Josh, Paneer Butter Masala, Chicken Sizzler (8) |
| Sizzler spotlight | `cat === 'sizzlers'` | Veg Sizzler, Chicken Sizzler, Mutton BBQ Sizzler (3) |
| Reorder row | fixed mock order | Butter Chicken, Butter Garlic Naan ×2 |

### 5.4 Category rail

Ten categories, in the mock's order, labelled with each category's own `short` name:

| `cat` id | Label | Tint | Emoji |
| --- | --- | --- | --- |
| `chicken-tandoor` | Tandoor | `tint-tandoor` | 🍗 |
| `mutton-tandoor` | Mutton | `tint-mutton` | 🥩 |
| `seafood` | Seafood | `tint-seafood` | 🦐 |
| `tawa` | Tawa | `tint-tawa` | 🍳 |
| `sizzlers` | Sizzlers | `tint-sizzler` | 🔥 |
| `nonveg-chinese` | Chinese | `tint-chinese` | 🥡 |
| `veg-main` | Veg MC | `tint-veg` | 🥘 |
| `bread` | Breads | `tint-bread` | 🫓 |
| `desserts` | Desserts | `tint-dessert` | 🍮 |
| `beverages` | Drinks | `tint-drink` | 🥤 |

The same id→emoji map backs `ImageTile`'s empty state (D4), extended to cover the six categories not in the rail: `soups` 🍲, `salad` 🥗, `chicken-main` 🍛, `mutton-main` 🍛, `veg-chinese` 🥡, `popular` ⭐.

### 5.5 Open / closed

The mock exposes "closed" as a demo toggle. Here it is computed, so the strip reflects reality:

```ts
// src/data/restaurant.ts
export const HOURS = { open: 12, close: 23 };   // 12:00 PM – 11:00 PM
export const isOpenAt = (d: Date) => d.getHours() >= HOURS.open && d.getHours() < HOURS.close;
```

Closed copy: `Currently closed · opens today at 12:00 PM. You can browse and schedule an order.`

---

## 6. Scale mappings (D3)

### 6.1 Type

| Mock | Renders as | Note |
| --- | --- | --- |
| Bricolage 800 26px — hero dish name | `h2` + `font-bricolage-800` (24px) | |
| Bricolage 800 22px — offer headline | `h2` + `font-bricolage-800` (24px) | |
| Bricolage 700/800 19–20px — section headings, "Special Sizzlers" | `title` (Jakarta 20/700) | **Not Bricolage** — below the ≥24px floor |
| Jakarta 700 15px — header address | `item` (17/600) | |
| Jakarta 700/800 13–14px — dish name, price | `body` (15/500), with `font-jakarta-800` on prices | |
| Jakarta 700/800 10–11px, uppercase + tracked | `caption` (12/700, uppercase) | Exact fit — "SIGNATURE", "DELIVER TO · HOME", "FIRST ORDER", "ORDER AGAIN", "SERVED SPITTING HOT" |
| Jakarta 700 11–12px, sentence case | `fine` (12/500) + `font-jakarta-700` | "See all", "Pure Veg", card labels — `caption` is unusable here because it forces uppercase |

### 6.2 Spacing

Mock 16px → `md` · 18px and 20px → `md` (18 is not expressible on the 4px base; rounding up to `lg`/24 breaks the rails' rhythm) · 14px → `md` · 8px → `sm` · 4px → `xs` · the 130px bottom spacer → `mb-32` (128px).

### 6.3 Radius

8 → `sm` · 9–13 → `md` · 14–16 → `lg` · 18–20 → `xl` · 999 → `pill`.

### 6.4 Elevation

| Mock | Token |
| --- | --- |
| `0 1px 3px rgba(0,0,0,.2)` | `shadow-e1` |
| `0 6px 16px rgba(20,16,13,.06)` | `shadow-e2` |
| `0 12px 28px rgba(20,16,13,.18)`, `0 10px 24px rgba(20,16,13,.3)` | `shadow-e3` |
| `0 6px 16px rgba(236,91,19,.4)`, `0 12px 28px rgba(236,91,19,.4)` | `shadow-ember-glow` |

---

## 7. Components

### 7.1 Extended

| File | Change |
| --- | --- |
| `ui/Segmented.tsx` | `surface?: 'canvas' \| 'hero'`. On `hero`: translucent cream track, `md` radius, ember active fill, `hero-muted` inactive label. Existing call sites unaffected. |
| `ui/QuantityStepper.tsx` | `variant?: 'solid' \| 'outline'` and `size?: 'md' \| 'sm'`. The rail cards use `outline`+`sm` (white ground, ember hairline, ember label); the stepper stays a solid ember pill. |
| `ui/States.tsx` | `SkeletonRail` — heading bar plus three 150px card skeletons, built on heroui-native `Skeleton` as `SkeletonCard` already is. |
| `ui/index.ts` | Re-export everything new. |

### 7.2 New — `src/components/ui/`

Reusable beyond this screen.

| Component | Contract |
| --- | --- |
| `ImageTile` | `{ uri?, categoryId, className, radius }` — photo, else tinted tile + emoji (D4) |
| `DishCard` | `{ item, quantity, onAdd, onRemove, surface }` — `canvas` = 166px light card in the mock, implemented as `w-40` (160px); `hero` = 150px card in the mock, implemented as `w-36` (144px), on `hero-surface` with a `hero-hairline-lifted` border. Both snap to the nearest scale step under D3's own rule rather than the mock's literal px. One component, both mock cards. |
| `CategoryTile` | `{ id, label, emoji, tint, isActive, onPress }` — 64px tile, 2px ember ring + `tint-selected` when active |
| `VegSwitch` | `{ value, onChange }` — the Pure Veg pill toggle |
| `SearchButton` | `{ placeholder, onPress }` — a *button* that looks like a field, not a `TextInput` |
| `CartBar` | `{ count, total, onPress }` — the sticky ember bar |
| `Toast` | `{ message, visible }` — dark bar, green check, enters on translate+fade |
| `Gradient` | `LinearFill`, `RadialGlow` (§4) |

`CategoryChip` is left in place; the Menu tab still uses the pill form.

### 7.3 New — `src/features/home/components/`

Composition, home-only: `HomeHeader`, `SignatureHero`, `OffersRail`, `StatusStrip`, `CategoryRail`, `BestsellerRail`, `SizzlerSpotlight`, `ReorderRow`, `ClosedStrip`.

`HomeScreen.tsx` reduces to state plus composition.

---

## 8. Screen composition

Top to bottom inside one vertical `ScrollView` on `bg-canvas`:

1. **`HomeHeader`** — `bg-hero`, `RadialGlow` bleeding off the top-right. Location block ("DELIVER TO · HOME" in `caption`/`ember` over the address in `item`/`hero-foreground` + chevron), then a bell tile (`hero-surface`, ember unread dot ringed in `hero-surface`) and an avatar tile (`LinearFill` ember→saffron). Below: `Segmented surface="hero"` for Delivery / Takeaway / Dine-in, then `SearchButton` on a `hero-foreground` ground.
2. **`ClosedStrip`** — only when `!isOpenAt(now)`. `bg-closed`, `warning` dot, `closed-foreground` text.
3. **`SignatureHero`** — `xl`-radius card, 230px, `shadow-e3`. `ImageTile` under a `LinearFill` scrim. Top-left: `SIGNATURE` tag + rating chip on `hero/60`. Bottom: `non-veg-bright` mark, spice line, dish name in `h2`/Bricolage 800, `₹499` in `saffron` with `· Full / Half` in `hero-muted`, and an ember `ADD +` carrying `shadow-ember-glow`.
4. **`OffersRail`** — horizontal, two cards. First: `LinearFill` ember→`ember-deep`, headline in `h2`, code chip on a translucent white ground. Second: `bg-hero`, saffron label, code chip on translucent saffron.
5. **`StatusStrip`** — white, `lg` radius, `hairline` border. Open/closed dot + label, divider, `veg` star + 4.8, `· 30 min · 2.1 km` in `muted`, `VegSwitch` pushed right.
6. **`SkeletonRail`** while loading, otherwise 7–10.
7. **`CategoryRail`** — `title` heading "What are you craving?" over ten `CategoryTile`s.
8. **`BestsellerRail`** — `title` heading "Bestsellers 🔥" + "See all", eight `DishCard surface="canvas"`.
9. **`SizzlerSpotlight`** — `bg-hero` panel, `xl` radius, `RadialGlow`, `caption` eyebrow "SERVED SPITTING HOT" in saffron over `title` "Special Sizzlers", a static flame glyph (implemented as static, not animated — a deliberate omission; React Native emoji/text animation wasn't worth the complexity for a decorative flourish), three `DishCard surface="hero"`.
10. **`ReorderRow`** — white, **dashed** `hairline` border, `ember-tint` icon tile, `caption` "ORDER AGAIN" over a single ellipsised line, dark `Reorder` button.
11. Bottom spacer clearing the tab bar and cart bar.

Floating above the scroll view: `CartBar` (when the cart is non-empty) and `Toast`.

---

## 9. State

### 9.1 Cart store

`src/store/cart.store.ts` gains three things, all additive:

- `decrementItem(id)` — decrements by one and removes the line at zero. Today's `removeItem` deletes the whole line, which the stepper cannot use.
- `totalAmount()` — sum of `price × quantity`, for the cart bar.
- `image` on `CartItem` becomes optional — menu items have none (D4).

### 9.2 Screen-local

| State | Purpose |
| --- | --- |
| `serviceMode` | `'delivery' \| 'takeaway' \| 'dinein'`, default `delivery` |
| `activeCategory` | `MenuCategory['id'] \| null` |
| `isLoading` | true for 900ms on mount, matching the app's existing mock-latency convention |
| `isVegOnly` | drives `VegSwitch` only (D6) |
| `toast` | `string \| null`, cleared after 1900ms |

The toast timer is held in a ref and cleared on unmount.

### 9.3 Interactions

- **ADD** on hero or any card → `addItem`, `DishCard` swaps to a stepper, `CartBar` rises, toast reads `{name} added to cart`.
- **Reorder** → adds Butter Chicken and Butter Garlic Naan ×2, one toast.
- **Category tile** → sets `activeCategory` (ring + `tint-selected`). Navigation to a filtered menu is out of scope.
- **Search / See all / cart bar** → no-ops pending their screens.

---

## 10. Navigation

`MainTabNavigator.tsx` drops the `Cart` screen → Home / Saved / Orders / Profile.

`CustomTabBar.tsx` loses the `Cart` branch of `TabIcon` (the raised ember FAB and its badge) and the `route.name === 'Cart'` guards in the map. `useCartStore` is no longer read there.

A shared `TAB_BAR_HEIGHT` constant positions `CartBar` directly above the bar, replacing the mock's magic `bottom: 74px`.

---

## 11. Testing

The existing guards cover the new code with no modification:

- `design-tokens.test.ts` — fails on any hex, any `dark:` variant, and any colour utility with no `--color-*`. This is what enforces §3.4.
- `global-css-contract.test.ts` — pins the 18 PDF swatches and the HeroUI variable contract.

One new suite, `__tests__/menu-data.test.ts`:

1. Every id the screen addresses by slug resolves in `byId` — `tandoori-chicken`, `butter-chicken`, `butter-garlic-naan`. This is the failure mode nothing else catches: renaming a dish silently changes its slug and empties the hero.
2. `tags.includes('bestseller')` returns exactly 8 dishes.
3. `cat === 'sizzlers'` returns exactly 3.
4. Every `cat` on every item exists in `CATEGORIES`.
5. Every category in the rail has a tint and an emoji.

---

## 12. Out of scope

- Scroll-condensed sticky header (D6)
- Pure Veg filtering (D6) — toggle renders and is interactive; rails do not filter
- Real photography (D4)
- Destination screens for search, "See all", category tiles and the cart bar
- Portion (Full / Half) selection — ADD uses `base`, the full-portion price
- Any backend work; the screen stays UI-only on mock data

### The mock-data boundary is deliberate

The home screen renders entirely from `src/data/menu.ts` and `src/data/restaurant.ts`, and
its loading state is a `setTimeout`. That is the intended state until the API phase, not a
stopgap to be quietly replaced mid-build. The modules are shaped so the swap is a body
change behind stable signatures:

| Swapped later | Preserved |
| --- | --- |
| the bodies of both data modules | `byId`, `bestsellers()`, `byCategory()`, `priceOf()`, `isOpenAt()` — what every section imports |
| `HomeScreen`'s `isLoading` timer | the `SkeletonRail` it gates |
| `MenuItem.image`, declared and unset | `ImageTile`, which renders a photo the moment a `uri` exists (D4) |

Nothing in `src/features/home/` may make a network call while this spec governs.
