# Ember Immersive Home Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the JJ's Kitchen home screen with the Ember Immersive design — a dark Ink 900 header, a signature dish hero, and the real 140-dish menu delivered as horizontal rails on the cream canvas.

**Architecture:** Three layers, built bottom-up. First a pure data layer (`src/data/`) and token layer (`src/global.css`) with real tests. Then reusable primitives in `src/components/ui/`. Then home-only composition in `src/features/home/components/`, assembled by a thin `HomeScreen`. Colour, type, spacing, radius and elevation resolve exclusively through Tailwind utilities backed by `global.css` — no component contains a literal value.

**Tech Stack:** React Native 0.85 (TypeScript strict) · Uniwind (Tailwind v4 for RN) · HeroUI Native · Zustand · react-native-svg · react-native-reanimated · lucide-react-native · Jest

**Spec:** [`docs/superpowers/specs/2026-09-15-home-ember-immersive-design.md`](../specs/2026-09-15-home-ember-immersive-design.md)

## Global Constraints

- **`src/global.css` is the only file in the repo permitted to contain a hex literal.** `__tests__/design-tokens.test.ts` fails the build on any hex anywhere under `src/` or in `App.tsx`. Its `ALLOWLIST` is empty and must stay empty.
- **No `dark:` variants and no `-dark` token names.** One palette renders in both device colour schemes.
- **Weight is selected by font family name** (`font-jakarta-600`), never by `fontWeight` — React Native cannot synthesize a weight from a static face.
- **Bricolage Grotesque is floored at 24px.** Anything smaller uses Plus Jakarta Sans. This is why section headings render as `title` (Jakarta 20/700), not in Bricolage at the mock's 19px. Spec decision D3.
- **Every colour utility must resolve to a `--color-*` entry in `global.css`.** `design-tokens.test.ts` scans for `\b(?:bg|text|border)-([a-z][a-z0-9-]*)` and fails on any name with no matching token. Task 1 must land before any task that consumes a new token.
- **Use Tailwind utilities, not `StyleSheet.create`,** except where Tailwind genuinely cannot express the style — absolute positioning from runtime values, and fixed pixel sizes passed as props. Existing precedent: `Badges.tsx` sizes with `style={{ width: size }}`.
- **Path alias:** `@/*` → `src/*`.
- **Verification commands:** `npm test` · `npm run lint` · `npx tsc --noEmit`.

### Testing reality

`@testing-library/react-native` is **not** installed, and `__tests__/App.test.tsx` is skipped with a documented explanation: rendering this component tree under Jest requires a complete Reanimated 4 stub plus coverage of heroui-native's internal animation hooks, which the team deliberately deferred as separate work.

Consequently:

- **Tasks 1–4 (tokens, data, hours, store) are pure and get real TDD cycles.** Zustand stores are testable through `useCartStore.getState()` with no renderer.
- **Tasks 5–17 (components) have no render-test path.** They are gated on `npx tsc --noEmit`, `npm run lint`, and the token guards in `npm test`, plus the on-device check in Task 18.

Do not add `@testing-library/react-native` as part of this plan. If you want component render tests, that is its own plan.

### Spec refinement adopted here

Spec §3.3 names the ten new cuisine tints `--tint-mutton`, `--tint-seafood` and so on in Layer A. Layer A is the raw palette and Layer B is where meaning is assigned, so this plan names them by hue in Layer A (`--clay-50`, `--mist-50`, …) and maps cuisine → hue in Layer B. **The Layer C names components consume are exactly as the spec lists them**, so nothing downstream shifts.

---

### Task 1: Token layer

Adds 19 raw entries plus their semantic aliases and Tailwind exposure. Everything after this depends on it.

**Files:**
- Modify: `src/global.css`
- Test: `__tests__/global-css-contract.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: the Layer C utility names every later task uses — `bg-tint-tandoor`, `bg-tint-mutton`, `bg-tint-seafood`, `bg-tint-tawa`, `bg-tint-sizzler`, `bg-tint-chinese`, `bg-tint-veg`, `bg-tint-bread`, `bg-tint-dessert`, `bg-tint-drink`, `bg-tint-selected`, `bg-ember-deep`, `text-on-ember-muted`, `border-hero-hairline-lifted`, `bg-veg-tint`, `text-veg-bright`, `border-non-veg-bright`, `bg-closed`, `text-closed-foreground`, `bg-switch-track-off`

- [ ] **Step 1: Write the failing test**

Append to `__tests__/global-css-contract.test.ts`:

```ts
describe('global.css — Ember Immersive additions (spec 2026-09-15)', () => {
  const RAW: Record<string, string> = {
    '--clay-50': '#f6e0da',
    '--mist-50': '#ddeef0',
    '--wheat-50': '#f7eed6',
    '--flame-50': '#fbe1d0',
    '--oat-50': '#ede6d6',
    '--leaf-50': '#e6f0e1',
    '--linen-50': '#f1eedf',
    '--rose-50': '#f6e6ec',
    '--ice-50': '#e7eef2',
    '--ember-25': '#ffead9',
    '--ember-700': '#c8410a',
    '--ember-100': '#ffe2ce',
    '--ink-750': '#38291d',
    '--veg-50': '#e6f2ea',
    '--veg-300': '#7bd69b',
    '--non-veg-300': '#ff8f5e',
    '--closed-900': '#3a2320',
    '--closed-300': '#f6c98a',
    '--track-off': '#c9bca6',
  };

  it.each(Object.entries(RAW))('%s is %s', (name, expected) => {
    expect(varValue(name)?.toLowerCase()).toBe(expected);
  });

  // Layer C is what components actually consume. design-tokens.test.ts fails
  // on any utility with no --color-* entry, so these must all exist.
  const EXPOSED = [
    'tint-tandoor', 'tint-mutton', 'tint-seafood', 'tint-tawa', 'tint-sizzler',
    'tint-chinese', 'tint-veg', 'tint-bread', 'tint-dessert', 'tint-drink',
    'tint-selected', 'ember-deep', 'on-ember-muted', 'hero-hairline-lifted',
    'veg-tint', 'veg-bright', 'non-veg-bright', 'closed', 'closed-foreground',
    'switch-track-off',
  ];

  it.each(EXPOSED)('--color-%s is exposed to Tailwind', name => {
    expect(varValue(`--color-${name}`)).not.toBeNull();
  });

  it('the cuisine tints are named by hue in Layer A, by cuisine in Layer B', () => {
    expect(varValue('--tint-mutton')).toBe('var(--clay-50)');
    expect(varValue('--tint-tandoor')).toBe('var(--ember-50)');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx jest __tests__/global-css-contract.test.ts`
Expected: FAIL — every new assertion reports `null` because the tokens do not exist yet.

- [ ] **Step 3: Add Layer A entries**

In `src/global.css`, inside the existing `:root` block under `LAYER A`:

Append to the `EMBER & SAFFRON` group:

```css
  --ember-700: #c8410a; /* offer-card gradient end */
  --ember-100: #ffe2ce; /* secondary text on an ember ground */
  --ember-25: #ffead9; /* selected category tile */
```

Append to the `CHARCOAL` group:

```css
  --ink-750: #38291d; /* hairline on a card inside a hero panel */
```

Append to the `FUNCTIONAL` group:

```css
  --veg-50: #e6f2ea; /* Pure Veg switch, on */
  --veg-300: #7bd69b; /* veg affirmative on charcoal */
  --non-veg-300: #ff8f5e; /* non-veg mark lifted for a photo scrim */
  --closed-900: #3a2320; /* closed-strip ground */
  --closed-300: #f6c98a; /* closed-strip text — 7.1:1 on Closed 900 */
  --track-off: #c9bca6; /* switch track, off */
```

Add a new group after `FUNCTIONAL`:

```css
  /* CUISINE TINTS · pastel grounds for the category rail and image
     placeholders. Named by hue here; Layer B assigns the cuisine. */
  --clay-50: #f6e0da;
  --mist-50: #ddeef0;
  --wheat-50: #f7eed6;
  --flame-50: #fbe1d0;
  --oat-50: #ede6d6;
  --leaf-50: #e6f0e1;
  --linen-50: #f1eedf;
  --rose-50: #f6e6ec;
  --ice-50: #e7eef2;
```

- [ ] **Step 4: Add Layer B entries**

At the end of the `— JJ's Kitchen semantics —` group in the second `:root` block:

```css
  /* — Ember Immersive home (spec 2026-09-15) — */
  --ember-deep: var(--ember-700); /* the far end of the offer gradient */
  --on-ember-muted: var(--ember-100); /* secondary copy on ember */
  --hero-hairline-lifted: var(--ink-750); /* LIGHTER than --hero-hairline:
     the border of a card on --hero-surface, where Ink 700 disappears */
  --veg-tint: var(--veg-50);
  --veg-bright: var(--veg-300); /* veg affirmative on charcoal */
  --non-veg-bright: var(--non-veg-300); /* the mark over a photo scrim */
  --closed: var(--closed-900);
  --closed-foreground: var(--closed-300);
  --switch-track-off: var(--track-off);

  /* Cuisine coding: the category rail and every image placeholder */
  --tint-tandoor: var(--ember-50);
  --tint-mutton: var(--clay-50);
  --tint-seafood: var(--mist-50);
  --tint-tawa: var(--wheat-50);
  --tint-sizzler: var(--flame-50);
  --tint-chinese: var(--oat-50);
  --tint-veg: var(--leaf-50);
  --tint-bread: var(--linen-50);
  --tint-dessert: var(--rose-50);
  --tint-drink: var(--ice-50);
  --tint-selected: var(--ember-25);
```

- [ ] **Step 5: Add Layer C entries**

In the `@theme inline` block, at the end of the `— COLOR —` group:

```css
  --color-ember-deep: var(--ember-deep);
  --color-on-ember-muted: var(--on-ember-muted);
  --color-hero-hairline-lifted: var(--hero-hairline-lifted);
  --color-veg-tint: var(--veg-tint);
  --color-veg-bright: var(--veg-bright);
  --color-non-veg-bright: var(--non-veg-bright);
  --color-closed: var(--closed);
  --color-closed-foreground: var(--closed-foreground);
  --color-switch-track-off: var(--switch-track-off);

  --color-tint-tandoor: var(--tint-tandoor);
  --color-tint-mutton: var(--tint-mutton);
  --color-tint-seafood: var(--tint-seafood);
  --color-tint-tawa: var(--tint-tawa);
  --color-tint-sizzler: var(--tint-sizzler);
  --color-tint-chinese: var(--tint-chinese);
  --color-tint-veg: var(--tint-veg);
  --color-tint-bread: var(--tint-bread);
  --color-tint-dessert: var(--tint-dessert);
  --color-tint-drink: var(--tint-drink);
  --color-tint-selected: var(--tint-selected);
```

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS. The 18 pinned PDF swatches are untouched, no token name ends in `-dark`, and the new Layer C entries satisfy the utility-resolution guard.

- [ ] **Step 7: Commit**

```bash
git add src/global.css __tests__/global-css-contract.test.ts
git commit -m "feat(tokens): add the Ember Immersive palette

19 raw entries behind semantic aliases: ten cuisine tints for the
category rail, a lifted hero hairline for cards inside a spotlight
panel, and the closed-strip, Pure Veg and on-ember pairs.

Cuisine tints are named by hue in Layer A and by cuisine in Layer B,
so the raw palette stays a palette."
```

---

### Task 2: Menu data and restaurant hours

Ports the supplied `menu-data.js` to TypeScript verbatim, and computes open/closed instead of faking it.

**Files:**
- Create: `src/types/menu.ts`
- Create: `src/data/menu.ts`
- Create: `src/data/restaurant.ts`
- Test: `__tests__/menu-data.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `MenuItem`, `MenuCategory`, `Portion` (types)
  - `CATEGORIES: MenuCategory[]`, `MENU: MenuItem[]`, `byId: Record<string, MenuItem>`, `POPULAR: MenuItem[]`
  - `priceOf(item: MenuItem, portion?: 'full' | 'half'): number`
  - `bestsellers(): MenuItem[]`, `byCategory(cat: string): MenuItem[]`
  - `HOURS: { open: number; close: number }`, `isOpenAt(d: Date): boolean`, `OPENS_AT_LABEL: string`

- [ ] **Step 1: Write the failing test**

Create `__tests__/menu-data.test.ts`:

```ts
import { MENU, byId, CATEGORIES, priceOf, bestsellers, byCategory } from '../src/data/menu';
import { isOpenAt, HOURS } from '../src/data/restaurant';

/**
 * The home screen addresses dishes by slug. Renaming a dish silently changes
 * its slug and empties whatever surface referenced it — nothing else catches
 * that, which is the whole reason this suite exists.
 */
describe('menu ids the home screen depends on', () => {
  it.each(['tandoori-chicken', 'butter-chicken', 'butter-garlic-naan'])(
    '%s resolves',
    id => {
      expect(byId[id]).toBeDefined();
    },
  );

  it('the signature hero dish is sold Full/Half at ₹499/₹279', () => {
    const hero = byId['tandoori-chicken'];
    expect(hero.portion).toEqual({ full: 499, half: 279 });
    expect(hero.base).toBe(499);
  });
});

describe('rail selectors', () => {
  it('bestsellers returns exactly the eight tagged dishes', () => {
    expect(bestsellers().map(i => i.id)).toEqual([
      'tandoori-chicken',
      'tandoori-murgh-malai',
      'chicken-burrah',
      'mutton-burrah',
      'butter-chicken',
      'mutton-rogan-josh',
      'paneer-butter-masala',
      'chicken-sizzler',
    ]);
  });

  it('the sizzler spotlight holds exactly three dishes', () => {
    expect(byCategory('sizzlers').map(i => i.id)).toEqual([
      'veg-sizzler',
      'chicken-sizzler',
      'mutton-bbq-sizzler',
    ]);
  });
});

describe('data integrity', () => {
  it('every item belongs to a declared category', () => {
    const ids = new Set(CATEGORIES.map(c => c.id));
    const orphans = MENU.filter(i => !ids.has(i.cat)).map(i => i.id);
    expect(orphans).toEqual([]);
  });

  it('every id is unique', () => {
    expect(new Set(MENU.map(i => i.id)).size).toBe(MENU.length);
  });

  it('every item has a usable representative price', () => {
    expect(MENU.filter(i => !(i.base > 0)).map(i => i.id)).toEqual([]);
  });
});

describe('priceOf', () => {
  it('returns the flat price when there is no portion', () => {
    expect(priceOf(byId['chicken-burrah'])).toBe(419);
  });

  it('defaults a portioned dish to full', () => {
    expect(priceOf(byId['tandoori-chicken'])).toBe(499);
  });

  it('returns the half price when asked', () => {
    expect(priceOf(byId['tandoori-chicken'], 'half')).toBe(279);
  });
});

describe('opening hours', () => {
  const at = (h: number) => new Date(2026, 8, 15, h, 0, 0);

  it('is closed before opening', () => {
    expect(isOpenAt(at(HOURS.open - 1))).toBe(false);
  });

  it('is open on the hour it opens', () => {
    expect(isOpenAt(at(HOURS.open))).toBe(true);
  });

  it('is closed on the hour it closes', () => {
    expect(isOpenAt(at(HOURS.close))).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx jest __tests__/menu-data.test.ts`
Expected: FAIL — `Cannot find module '../src/data/menu'`.

- [ ] **Step 3: Write the types**

Create `src/types/menu.ts`:

```ts
/** A dish sold in two sizes. Full is the representative price. */
export interface Portion {
  full: number;
  half: number;
}

export interface MenuCategory {
  id: string;
  /** Full name, for a category screen header. */
  name: string;
  /** Rail label — "Tandoor" rather than "Chicken Tandoor". */
  short: string;
}

export type MenuTag = 'bestseller' | 'spicy' | 'chefs';

export interface MenuItem {
  /** slug(name) — stable, and how every surface addresses a dish. */
  id: string;
  name: string;
  desc?: string;
  /** Absent when `portion` is present. */
  price?: number;
  portion?: Portion;
  /** Representative price: portion.full when portioned, else price. */
  base: number;
  veg: boolean;
  cat: MenuCategory['id'];
  popular?: boolean;
  tags: MenuTag[];
  soldOut?: boolean;
  /** Priced at MRP — renders as "MRP ₹20". */
  mrp?: boolean;
  /** Reserved. Nothing sets this yet; ImageTile falls back to a tinted tile. */
  image?: string;
}
```

- [ ] **Step 4: Write the menu module**

Create `src/data/menu.ts`.

**The source is committed at [`docs/design/menu-data.js`](../../design/menu-data.js)** — the handoff bundle's file, unmodified. Read it and port every one of its 125 `raw` entries **verbatim**: same names, prices, `veg`, `cat`, `desc`, `tags`, `popular`, `soldOut`, `mrp`.

Do not reorder. `bestsellers()` and `byCategory()` return source order and the tests above assert exact arrays.

The scaffolding around the data:

```ts
import type { MenuCategory, MenuItem, MenuTag } from '@/types/menu';

export const CATEGORIES: MenuCategory[] = [
  { id: 'popular', name: 'Popular', short: 'Popular' },
  { id: 'chicken-tandoor', name: 'Chicken Tandoor', short: 'Tandoor' },
  { id: 'mutton-tandoor', name: 'Mutton Tandoor', short: 'Mutton' },
  { id: 'seafood', name: 'Sea Food', short: 'Seafood' },
  { id: 'tawa', name: "JJ's Tawa Junction", short: 'Tawa' },
  { id: 'chicken-main', name: 'Main Course · Chicken', short: 'Chicken' },
  { id: 'mutton-main', name: 'Main Course · Mutton', short: 'Mutton MC' },
  { id: 'sizzlers', name: 'Special Sizzlers', short: 'Sizzlers' },
  { id: 'veg-main', name: 'Veg Main Course', short: 'Veg MC' },
  { id: 'nonveg-chinese', name: 'Non-Veg Chinese', short: 'Chinese' },
  { id: 'veg-chinese', name: 'Veg Chinese', short: 'Veg Chinese' },
  { id: 'soups', name: 'Soups', short: 'Soups' },
  { id: 'salad', name: 'Salad & Papad', short: 'Salad' },
  { id: 'bread', name: 'Roti / Bread', short: 'Breads' },
  { id: 'beverages', name: 'Beverages', short: 'Drinks' },
  { id: 'desserts', name: 'Desserts', short: 'Desserts' },
];

/** The shape of a `raw` row before `id`, `tags` and `base` are derived. */
type RawItem = Omit<MenuItem, 'id' | 'base' | 'tags'> & { tags?: MenuTag[] };

const raw: RawItem[] = [
  // SOUPS
  { name: 'Hot & Sour Soup', price: 200, veg: true, cat: 'soups', desc: 'Peppery, tangy broth with shredded veg.' },
  // … the remaining 124 rows, verbatim from docs/design/menu-data.js,
  //     in source order. Do not abbreviate or reorder. …
];

/** Identical to the design bundle's slug(). Ids must not drift. */
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const MENU: MenuItem[] = raw.map(it => ({
  tags: [],
  ...it,
  id: slug(it.name),
  base: it.portion ? it.portion.full : (it.price as number),
}));

export const byId: Record<string, MenuItem> = Object.fromEntries(
  MENU.map(m => [m.id, m]),
);

export const POPULAR = MENU.filter(m => m.popular);

export const priceOf = (item: MenuItem, portion?: 'full' | 'half'): number =>
  item.portion
    ? portion === 'half'
      ? item.portion.half
      : item.portion.full
    : (item.price as number);

/**
 * The bestseller rail, driven by data rather than a hardcoded id list, so the
 * restaurant controls it by editing this file. Spec decision D5.
 */
export const bestsellers = (): MenuItem[] =>
  MENU.filter(m => m.tags.includes('bestseller'));

export const byCategory = (cat: string): MenuItem[] =>
  MENU.filter(m => m.cat === cat);
```

> The `tags: []` default must come **before** the spread, so a row's own `tags` overrides it. `id` and `base` come **after**, so they always derive. This mirrors the original file exactly.

- [ ] **Step 5: Write the restaurant module**

Create `src/data/restaurant.ts`:

```ts
/**
 * Service hours. The home screen's closed strip is computed from these rather
 * than toggled, so it reflects reality — which means it does not appear at all
 * between open and close.
 */
export const HOURS = { open: 12, close: 23 } as const;

export const OPENS_AT_LABEL = '12:00 PM';

export const isOpenAt = (d: Date): boolean => {
  const h = d.getHours();
  return h >= HOURS.open && h < HOURS.close;
};

/** Mock delivery metadata for the status strip. */
export const SERVICE = {
  rating: 4.8,
  etaMinutes: 30,
  distanceKm: 2.1,
} as const;
```

- [ ] **Step 6: Run the tests**

Run: `npx jest __tests__/menu-data.test.ts`
Expected: PASS, all 18 assertions. If `bestsellers` returns a different count, a `tags` array was mistyped during the port — fix the data, not the test.

- [ ] **Step 7: Typecheck and commit**

```bash
npx tsc --noEmit
git add src/types/menu.ts src/data/menu.ts src/data/restaurant.ts __tests__/menu-data.test.ts
git commit -m "feat(data): port the real JJ's Kitchen menu

125 dishes across 16 categories, with the design bundle's slug()
preserved exactly so ids stay stable. Rails select by tag and
category rather than hardcoded id lists.

Opening hours are computed, so the closed strip reflects the
actual time instead of a demo toggle."
```

---

### Task 3: Cart store

Three additive changes. `removeItem` deletes a whole line, which a quantity stepper cannot use.

**Files:**
- Modify: `src/store/cart.store.ts`
- Test: `__tests__/cart-store.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `useCartStore` with `addItem(item)`, `decrementItem(id)`, `removeItem(id)`, `clearCart()`, `totalItems()`, `totalAmount()`, `quantityOf(id)`. `CartItem.image` becomes optional.

- [ ] **Step 1: Write the failing test**

Create `__tests__/cart-store.test.ts`:

```ts
import { useCartStore } from '../src/store/cart.store';

const line = { id: 'tandoori-chicken', name: 'Tandoori Chicken', price: 499 };

beforeEach(() => useCartStore.getState().clearCart());

describe('addItem', () => {
  it('adds a new line at quantity 1', () => {
    useCartStore.getState().addItem(line);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(1);
  });

  it('increments an existing line rather than duplicating it', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(line);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(2);
  });
});

describe('decrementItem', () => {
  it('decrements by one', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(line);
    useCartStore.getState().decrementItem(line.id);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(1);
  });

  it('drops the line at zero', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().decrementItem(line.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('is a no-op for an id not in the cart', () => {
    useCartStore.getState().decrementItem('not-here');
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('totals', () => {
  it('totalAmount multiplies price by quantity across lines', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem({ id: 'butter-garlic-naan', name: 'Butter Garlic Naan', price: 90 });
    expect(useCartStore.getState().totalAmount()).toBe(1088);
    expect(useCartStore.getState().totalItems()).toBe(3);
  });

  it('is zero on an empty cart', () => {
    expect(useCartStore.getState().totalAmount()).toBe(0);
  });
});

describe('quantityOf', () => {
  it('returns 0 for an absent id', () => {
    expect(useCartStore.getState().quantityOf('not-here')).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx jest __tests__/cart-store.test.ts`
Expected: FAIL — `decrementItem is not a function`.

- [ ] **Step 3: Rewrite the store**

Replace `src/store/cart.store.ts` entirely:

```ts
import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  /** Optional: menu items carry no photography yet. */
  image?: string;
}

/** What a caller supplies — quantity is the store's business. */
export type CartLine = Omit<CartItem, 'quantity'>;

interface CartState {
  items: CartItem[];
  addItem: (item: CartLine) => void;
  /** Decrements by one, dropping the line at zero. */
  decrementItem: (id: string) => void;
  /** Removes the whole line regardless of quantity. */
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
  quantityOf: (id: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: item =>
    set(state => {
      const existing = state.items.find(i => i.id === item.id);
      return {
        items: existing
          ? state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...state.items, { ...item, quantity: 1 }],
      };
    }),

  decrementItem: id =>
    set(state => ({
      items: state.items
        .map(i => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter(i => i.quantity > 0),
    })),

  removeItem: id => set(state => ({ items: state.items.filter(i => i.id !== id) })),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),

  totalAmount: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),

  quantityOf: id => get().items.find(i => i.id === id)?.quantity ?? 0,
}));
```

- [ ] **Step 4: Run the tests**

Run: `npx jest __tests__/cart-store.test.ts`
Expected: PASS, all 9 assertions.

- [ ] **Step 5: Verify no existing caller broke**

Run: `npx tsc --noEmit`
Expected: clean. `CustomTabBar.tsx` calls `totalItems()`, which is unchanged. Task 16 removes that call entirely.

- [ ] **Step 6: Commit**

```bash
git add src/store/cart.store.ts __tests__/cart-store.test.ts
git commit -m "feat(cart): add decrementItem, totalAmount and quantityOf

A quantity stepper needs to decrement a line, not delete it, and the
cart bar needs a rupee total. image becomes optional — menu items
carry no photography yet."
```

---

### Task 4: Gradient primitives

Five gradients in the design. SVG props take colour values, not `className`, so these resolve tokens through `useCSSVariable` — which keeps the hex rule intact.

**Files:**
- Create: `src/components/ui/Gradient.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `LinearFill({ from, to, diagonal? })`, `ScrimFill({ token? })`, `RadialGlow({ token?, opacity?, size })` — all render an absolutely-positioned, non-interactive `<Svg>` behind their parent's content. Parent must be `relative overflow-hidden`.

- [ ] **Step 1: Write the component**

Create `src/components/ui/Gradient.tsx`:

```tsx
import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

/**
 * SVG paints with colour values, not class names, so these are the one place
 * a token is read at runtime rather than applied as a utility. No hex literal
 * appears here — useCSSVariable resolves the Layer C token from global.css.
 */
const useToken = (name: string): string => {
  const value = useCSSVariable(name);
  return typeof value === 'string' ? value : 'transparent';
};

/**
 * SVG ids are document-global in react-native-svg, so two instances sharing a
 * literal id would cross-paint. useId gives a stable unique one; its colons
 * are illegal in an SVG id and must be stripped.
 */
const useGradientId = (prefix: string): string => {
  const raw = useId();
  return `${prefix}${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
};

/** Two-stop linear fill. `diagonal` runs 135°, otherwise left→right. */
export const LinearFill = ({
  from,
  to,
  diagonal = false,
}: {
  from: string;
  to: string;
  diagonal?: boolean;
}) => {
  const a = useToken(`--color-${from}`);
  const b = useToken(`--color-${to}`);
  const id = useGradientId('lf');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0%"
          y1="0%"
          x2="100%"
          y2={diagonal ? '100%' : '0%'}
        >
          <Stop offset="0" stopColor={a} />
          <Stop offset="1" stopColor={b} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

/**
 * Bottom-up photo scrim. Three stops of one colour at falling opacity, so a
 * dish name stays legible over any photograph.
 */
export const ScrimFill = ({ token = 'hero' }: { token?: string }) => {
  const color = useToken(`--color-${token}`);
  const id = useGradientId('sf');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0.06" stopColor={color} stopOpacity={0.92} />
          <Stop offset="0.52" stopColor={color} stopOpacity={0.2} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

/**
 * The ember bloom behind the dark header and the sizzler spotlight. Sized and
 * positioned by the caller through `style`, because it deliberately bleeds
 * past its container's edge.
 */
export const RadialGlow = ({
  token = 'ember',
  opacity = 0.25,
  size,
  style,
}: {
  token?: string;
  opacity?: number;
  size: number;
  style?: object;
}) => {
  const color = useToken(`--color-${token}`);
  const id = useGradientId('rg');

  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.62" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
};
```

- [ ] **Step 2: Export it**

Add to `src/components/ui/index.ts`:

```ts
export { LinearFill, ScrimFill, RadialGlow } from './Gradient';
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: all clean. The token guard confirms the file carries no hex.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Gradient.tsx src/components/ui/index.ts
git commit -m "feat(ui): add SVG gradient primitives

SVG paints with values rather than class names, so these resolve
tokens through useCSSVariable — the one runtime token read in the
app, and still no hex outside global.css.

Gradient ids are per-instance: react-native-svg treats them as
document-global, so a shared literal id cross-paints."
```

---

### Task 5: ImageTile

The `<image-slot>` equivalent. Spec decision D4 — imagery is deferred behind this seam.

**Files:**
- Create: `src/components/ui/ImageTile.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `MenuCategory` from `@/types/menu`
- Produces: `ImageTile({ uri?, categoryId, emojiSize? })`, plus `CATEGORY_TINT: Record<string, string>` and `CATEGORY_EMOJI: Record<string, string>` — both re-used by `CategoryTile` in Task 8.

- [ ] **Step 1: Write the component**

Create `src/components/ui/ImageTile.tsx`:

```tsx
import React from 'react';
import { View, Image, Text as RNText } from 'react-native';

/**
 * Cuisine coding, shared by the category rail and every image placeholder.
 * Keys are MenuCategory ids; every category in src/data/menu.ts appears here,
 * so an unrecognised id is a data bug rather than a silent blank tile.
 */
export const CATEGORY_TINT: Record<string, string> = {
  popular: 'bg-tint-tandoor',
  'chicken-tandoor': 'bg-tint-tandoor',
  'mutton-tandoor': 'bg-tint-mutton',
  seafood: 'bg-tint-seafood',
  tawa: 'bg-tint-tawa',
  'chicken-main': 'bg-tint-tandoor',
  'mutton-main': 'bg-tint-mutton',
  sizzlers: 'bg-tint-sizzler',
  'veg-main': 'bg-tint-veg',
  'nonveg-chinese': 'bg-tint-chinese',
  'veg-chinese': 'bg-tint-chinese',
  soups: 'bg-tint-tawa',
  salad: 'bg-tint-veg',
  bread: 'bg-tint-bread',
  beverages: 'bg-tint-drink',
  desserts: 'bg-tint-dessert',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  popular: '⭐',
  'chicken-tandoor': '\u{1F357}',
  'mutton-tandoor': '\u{1F969}',
  seafood: '\u{1F990}',
  tawa: '\u{1F373}',
  'chicken-main': '\u{1F35B}',
  'mutton-main': '\u{1F35B}',
  sizzlers: '\u{1F525}',
  'veg-main': '\u{1F958}',
  'nonveg-chinese': '\u{1F961}',
  'veg-chinese': '\u{1F961}',
  soups: '\u{1F372}',
  salad: '\u{1F957}',
  bread: '\u{1FAD3}',
  beverages: '\u{1F964}',
  desserts: '\u{1F36E}',
};

export interface ImageTileProps {
  /** A photo URL. Nothing sets this yet — see spec decision D4. */
  uri?: string;
  categoryId: string;
  /** Placeholder glyph size. Numeric like Badges.tsx, not a type token. */
  emojiSize?: number;
}

/**
 * Fills its parent. Shows the photo when there is one, otherwise a tinted
 * tile carrying the cuisine's glyph — so the screen is complete today and
 * real photography is a data change, never a UI change.
 */
export const ImageTile = ({ uri, categoryId, emojiSize = 28 }: ImageTileProps) => {
  if (uri) {
    return (
      <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
    );
  }

  return (
    <View
      accessible={false}
      className={`w-full h-full items-center justify-center ${
        CATEGORY_TINT[categoryId] ?? 'bg-sunken'
      }`}
    >
      <RNText style={{ fontSize: emojiSize }}>
        {CATEGORY_EMOJI[categoryId] ?? '\u{1F37D}'}
      </RNText>
    </View>
  );
};
```

> `RNText` rather than the design system `Text`: this is a glyph, not typography. Routing it through `Text` would impose a family and a tracked letter-spacing on an emoji.

- [ ] **Step 2: Export it**

Add to `src/components/ui/index.ts`:

```ts
export { ImageTile, CATEGORY_TINT, CATEGORY_EMOJI } from './ImageTile';
export type { ImageTileProps } from './ImageTile';
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/components/ui/ImageTile.tsx src/components/ui/index.ts
git commit -m "feat(ui): add ImageTile, the image-slot seam

Renders a photo when one exists and a cuisine-tinted glyph tile when
it does not, so the home screen ships complete and real photography
becomes a data change rather than a UI change."
```

---

### Task 6: Extend Text, Segmented, QuantityStepper and VegBadge

Four existing primitives gain variants. All changes are additive — every current call site keeps its behaviour.

**Files:**
- Modify: `src/components/ui/Text.tsx`
- Modify: `src/components/ui/Segmented.tsx`
- Modify: `src/components/ui/QuantityStepper.tsx`
- Modify: `src/components/ui/Badges.tsx`

**Interfaces:**
- Consumes: `Surface` from `./surface`
- Produces:
  - `Text({ variant, tone, weight?, className })` — `weight` overrides the variant's default; `TextTone` gains `saffron`, `on-ember-muted`, `closed-foreground`
  - `Segmented({ options, value, onChange, surface? })` — `options` becomes `{ value, label }[]`
  - `QuantityStepper({ quantity, onAdd, onRemove, addLabel?, variant?, size? })`
  - `VegBadge({ isVeg, size?, tone? })` with `tone: 'default' | 'bright'`

> Two additions beyond spec §7.1, both forced by the design:
>
> 1. **`Text` needs a `weight` prop.** The design sets a 13px dish name at 700 and a 14px price at 800, but every type variant bundles one family-and-weight class. Overriding via `className="font-jakarta-700"` would put *two* font-family classes on one element, and `Text` does no class merging, so which wins is undefined. `weight` replaces the class instead of fighting it.
> 2. **`VegBadge` needs a `bright` tone.** The signature hero's mark sits on a photo scrim where `--non-veg` goes muddy; `non-veg-bright` is the token that exists for exactly that.

- [ ] **Step 1: Rewrite Text**

Replace `src/components/ui/Text.tsx`:

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
  'display' | 'h1' | 'h2' | 'title' | 'item' | 'body' | 'caption' | 'fine';

export type TextWeight = '400' | '500' | '600' | '700' | '800';

export type TextTone =
  | 'ink'
  | 'muted'
  | 'ember'
  | 'saffron'
  | 'on-ember'
  | 'on-ember-muted'
  | 'on-hero'
  | 'hero-muted'
  | 'hero-danger'
  | 'closed-foreground'
  | 'veg'
  | 'non-veg'
  | 'chili';

type Family = 'bricolage' | 'jakarta';

const FAMILY: Record<TextVariant, Family> = {
  display: 'bricolage',
  h1: 'bricolage',
  h2: 'bricolage',
  title: 'jakarta',
  item: 'jakarta',
  body: 'jakarta',
  caption: 'jakarta',
  fine: 'jakarta',
};

const SIZE: Record<TextVariant, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  title: 'text-title',
  item: 'text-item',
  body: 'text-body',
  caption: 'text-caption uppercase',
  fine: 'text-fine',
};

const DEFAULT_WEIGHT: Record<TextVariant, TextWeight> = {
  display: '800',
  h1: '700',
  h2: '700',
  title: '700',
  item: '600',
  body: '500',
  caption: '700',
  fine: '500',
};

/**
 * Literal class names, not interpolated: Tailwind extracts classes by scanning
 * source text, so `font-${family}-${weight}` would emit no rule at all.
 * Bricolage ships no 500 face, hence the gap.
 */
const WEIGHT_CLASS: Record<Family, Partial<Record<TextWeight, string>>> = {
  bricolage: {
    '400': 'font-bricolage-400',
    '600': 'font-bricolage-600',
    '700': 'font-bricolage-700',
    '800': 'font-bricolage-800',
  },
  jakarta: {
    '400': 'font-jakarta-400',
    '500': 'font-jakarta-500',
    '600': 'font-jakarta-600',
    '700': 'font-jakarta-700',
    '800': 'font-jakarta-800',
  },
};

const TONE: Record<TextTone, string> = {
  ink: 'text-ink',
  muted: 'text-muted',
  ember: 'text-ember',
  saffron: 'text-saffron',
  'on-ember': 'text-on-ember',
  'on-ember-muted': 'text-on-ember-muted',
  'on-hero': 'text-hero-foreground',
  'hero-muted': 'text-hero-muted',
  'hero-danger': 'text-hero-danger',
  'closed-foreground': 'text-closed-foreground',
  veg: 'text-veg',
  'non-veg': 'text-non-veg',
  chili: 'text-chili',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /**
   * Overrides the variant's default weight. Use this rather than a
   * `font-*` class in className — two family classes on one element is
   * undefined behaviour, since this component does no class merging.
   */
  weight?: TextWeight;
  className?: string;
}

export const Text = ({
  variant = 'body',
  tone = 'ink',
  weight,
  className = '',
  ...rest
}: TextProps) => {
  const family = FAMILY[variant];
  const fontClass =
    WEIGHT_CLASS[family][weight ?? DEFAULT_WEIGHT[variant]] ??
    WEIGHT_CLASS[family][DEFAULT_WEIGHT[variant]];

  return (
    <RNText
      className={`${fontClass} ${SIZE[variant]} ${TONE[tone]} ${className}`.trim()}
      {...rest}
    />
  );
};
```

> The `??` fallback matters: `weight="500"` on a Bricolage variant has no face, and silently falling back to the variant's default beats emitting `undefined` as a class name.

- [ ] **Step 2: Rewrite Segmented**

`options` changes from `string[]` to `{ value, label }[]` so service modes can carry an id (`dinein`) separate from their label (`Dine-in`). Replace `src/components/ui/Segmented.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import type { Surface } from './surface';

export interface SegmentedOption {
  value: string;
  label: string;
}

const TRACK: Record<Surface, string> = {
  canvas: 'bg-sunken rounded-pill p-xs',
  hero: 'bg-hero-foreground/10 border border-hero-foreground/10 rounded-md p-xs gap-xs',
};

const ACTIVE: Record<Surface, string> = {
  canvas: 'bg-surface shadow-e1 rounded-pill',
  hero: 'bg-ember rounded-md',
};

/** PDF section 05 · segmented control. `hero` is the service-mode switch. */
export const Segmented = ({
  options,
  value,
  onChange,
  surface = 'canvas',
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  surface?: Surface;
}) => (
  <View className={`flex-row ${TRACK[surface]}`}>
    {options.map(option => {
      const isActive = option.value === value;
      const ground = isActive ? ACTIVE[surface] : '';
      const tone = isActive
        ? surface === 'hero'
          ? 'on-ember'
          : 'ink'
        : surface === 'hero'
          ? 'hero-muted'
          : 'muted';

      return (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          className={`flex-1 items-center justify-center py-sm ${ground}`}
        >
          <Text variant="caption" tone={tone}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
```

- [ ] **Step 3: Fix the existing Segmented call site**

Run: `npx tsc --noEmit`

The compiler will name any file passing `string[]`. Convert each to `{ value, label }[]` — for a plain list, `['Takeaway','Dine-in'].map(s => ({ value: s, label: s }))` preserves the previous behaviour exactly. If no call site is reported, nothing consumed it yet; continue.

- [ ] **Step 4: Extend QuantityStepper**

Replace `src/components/ui/QuantityStepper.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Text } from './Text';

export type StepperVariant = 'solid' | 'outline';
export type StepperSize = 'md' | 'sm';

const ADD_GROUND: Record<StepperVariant, string> = {
  solid: 'bg-ember shadow-ember-glow',
  outline: 'bg-surface border-2 border-ember',
};

const SIZING: Record<StepperSize, { add: string; bar: string; icon: number }> = {
  md: { add: 'px-lg h-10 min-w-24', bar: 'px-sm h-10 min-w-24', icon: 16 },
  sm: { add: 'px-md h-8 min-w-16', bar: 'px-xs h-8 min-w-16', icon: 13 },
};

/**
 * PDF section 05 · quantity stepper.
 * Collapses to a single ADD button at zero, expands to − n + above it.
 * Both states share a min width so the row does not reflow on press.
 */
export const QuantityStepper = ({
  quantity,
  onAdd,
  onRemove,
  addLabel = 'ADD',
  variant = 'solid',
  size = 'md',
}: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  addLabel?: string;
  variant?: StepperVariant;
  size?: StepperSize;
}) => {
  const s = SIZING[size];

  if (quantity <= 0) {
    return (
      <TouchableOpacity
        onPress={onAdd}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        className={`rounded-md items-center justify-center ${ADD_GROUND[variant]} ${s.add}`}
      >
        <Text variant="caption" tone={variant === 'solid' ? 'on-ember' : 'ember'}>
          {addLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`flex-row items-center justify-between bg-ember rounded-md shadow-ember-glow ${s.bar}`}
    >
      <TouchableOpacity
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className="p-xs"
      >
        <Minus size={s.icon} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
      <Text variant={size === 'md' ? 'item' : 'caption'} tone="on-ember">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className="p-xs"
      >
        <Plus size={s.icon} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};
```

- [ ] **Step 5: Extend VegBadge**

In `src/components/ui/Badges.tsx`, replace the `VegBadge` export:

```tsx
/** PDF section 05 · the square-outline veg / non-veg marker. */
export const VegBadge = ({
  isVeg,
  size = 16,
  tone = 'default',
}: {
  isVeg: boolean;
  size?: number;
  /** `bright` lifts the mark for a photo scrim, where --non-veg goes muddy. */
  tone?: 'default' | 'bright';
}) => {
  const border =
    isVeg
      ? 'border-veg'
      : tone === 'bright'
        ? 'border-non-veg-bright'
        : 'border-non-veg';
  const dot =
    isVeg ? 'bg-veg' : tone === 'bright' ? 'bg-non-veg-bright' : 'bg-non-veg';

  return (
    <View
      accessibilityLabel={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      style={{ width: size, height: size }}
      className={`border-2 items-center justify-center rounded-sm ${border}`}
    >
      <View
        style={{ width: size * 0.4, height: size * 0.4 }}
        className={`rounded-pill ${dot}`}
      />
    </View>
  );
};
```

- [ ] **Step 6: Export the new types**

In `src/components/ui/index.ts`, replace the `Text` and `Segmented` export lines and add the stepper types:

```ts
export { Text } from './Text';
export type { TextProps, TextVariant, TextTone, TextWeight } from './Text';

export { Segmented } from './Segmented';
export type { SegmentedOption } from './Segmented';

export { QuantityStepper } from './QuantityStepper';
export type { StepperVariant, StepperSize } from './QuantityStepper';
```

- [ ] **Step 7: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/components/ui/Text.tsx src/components/ui/Segmented.tsx src/components/ui/QuantityStepper.tsx src/components/ui/Badges.tsx src/components/ui/index.ts
git commit -m "feat(ui): add weight, hero, outline and bright variants

Text gains a weight prop: the design needs a 13px name at 700 and a
14px price at 800, and overriding the variant's family class from
className would put two font-family classes on one element with no
merge step to resolve them. It also gains the saffron,
on-ember-muted and closed-foreground tones the new palette exposes.

Segmented gains a hero surface for the service-mode switch and takes
{value,label} options so an id can differ from its label.
QuantityStepper gains an outline/sm form for rail cards. VegBadge
gains a bright tone for marks over a photo scrim."
```

---

### Task 7: DishCard

One component covers both rail cards: the 166px light card and the 150px card on `hero-surface`.

**Files:**
- Create: `src/components/ui/DishCard.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `MenuItem` (Task 2), `ImageTile` (Task 5), `QuantityStepper`/`VegBadge` (Task 6)
- Produces: `DishCard({ item, quantity, onAdd, onRemove, surface?, showRating? })`

- [ ] **Step 1: Write the component**

Create `src/components/ui/DishCard.tsx`:

```tsx
import React, { memo } from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu';
import { Text } from './Text';
import { VegBadge } from './Badges';
import { ImageTile } from './ImageTile';
import { QuantityStepper } from './QuantityStepper';
import type { Surface } from './surface';

export interface DishCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  /** `canvas` = the bestseller rail. `hero` = inside a spotlight panel. */
  surface?: Surface;
  showRating?: boolean;
}

const CARD: Record<Surface, string> = {
  canvas: 'w-40 bg-surface border border-hairline rounded-xl overflow-hidden shadow-e2',
  hero: 'w-36 bg-hero-surface border border-hero-hairline-lifted rounded-lg overflow-hidden',
};

const IMAGE_HEIGHT: Record<Surface, string> = {
  canvas: 'h-28',
  hero: 'h-24',
};

/** A mock rating, stable per dish — the menu carries no ratings yet. */
const ratingFor = (item: MenuItem) => (4.3 + ((item.name.length % 6) * 0.1)).toFixed(1);

/** The horizontal-rail dish card. Spec §7.2. */
export const DishCard = memo(
  ({
    item,
    quantity,
    onAdd,
    onRemove,
    surface = 'canvas',
    showRating = false,
  }: DishCardProps) => {
    const onHero = surface === 'hero';

    return (
      <View className={`${CARD[surface]} ${item.soldOut ? 'opacity-50' : ''}`}>
        <View className={`relative w-full ${IMAGE_HEIGHT[surface]}`}>
          <ImageTile categoryId={item.cat} uri={item.image} emojiSize={30} />

          <View className="absolute top-sm left-sm bg-surface rounded-sm p-0.5 shadow-e1">
            <VegBadge isVeg={item.veg} size={13} />
          </View>

          {showRating ? (
            <View className="absolute bottom-sm left-sm flex-row items-center gap-xs bg-veg px-xs py-0.5 rounded-sm">
              <Star size={9} className="text-on-ember" fill="currentColor" />
              <Text variant="caption" tone="on-ember">
                {ratingFor(item)}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="p-sm gap-sm">
          <Text
            variant="body"
            tone={onHero ? 'on-hero' : 'ink'}
            numberOfLines={2}
            weight="700"
            className="min-h-10"
          >
            {item.name}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text
              variant="body"
              tone={onHero ? 'ember' : 'ink'}
              weight="800"
            >
              {item.mrp ? `MRP ₹${item.base}` : `₹${item.base}`}
            </Text>

            {item.soldOut ? (
              <Text variant="caption" tone="muted">
                SOLD OUT
              </Text>
            ) : (
              <QuantityStepper
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
                variant="outline"
                size="sm"
              />
            )}
          </View>
        </View>
      </View>
    );
  },
);

DishCard.displayName = 'DishCard';
```

> The price uses `₹` rather than a literal `₹` so the source stays ASCII, matching `PriceTag.tsx`'s existing `rupees()` helper.

- [ ] **Step 2: Export it**

```ts
export { DishCard } from './DishCard';
export type { DishCardProps } from './DishCard';
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/components/ui/DishCard.tsx src/components/ui/index.ts
git commit -m "feat(ui): add DishCard for the horizontal rails

One component covers the light bestseller card and the dark card
inside the sizzler spotlight. soldOut dims the card and replaces the
stepper; mrp items price as 'MRP ₹20'."
```

---

### Task 8: CategoryTile, VegSwitch and SearchButton

Three small interactive primitives.

**Files:**
- Create: `src/components/ui/CategoryTile.tsx`
- Create: `src/components/ui/VegSwitch.tsx`
- Create: `src/components/ui/SearchButton.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `CATEGORY_TINT`, `CATEGORY_EMOJI` (Task 5)
- Produces: `CategoryTile({ id, label, isActive, onPress })`, `VegSwitch({ value, onChange })`, `SearchButton({ placeholder, onPress })`

- [ ] **Step 1: Write CategoryTile**

```tsx
import React from 'react';
import { TouchableOpacity, View, Text as RNText } from 'react-native';
import { Text } from './Text';
import { CATEGORY_TINT, CATEGORY_EMOJI } from './ImageTile';

/** The 64px cuisine tile in the category rail. Spec §5.4. */
export const CategoryTile = ({
  id,
  label,
  isActive = false,
  onPress,
}: {
  id: string;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    className="w-18 items-center gap-sm"
  >
    <View
      className={`w-16 h-16 rounded-xl items-center justify-center border-2 ${
        isActive
          ? 'bg-tint-selected border-ember'
          : `${CATEGORY_TINT[id] ?? 'bg-sunken'} border-transparent`
      }`}
    >
      <RNText style={{ fontSize: 28 }}>{CATEGORY_EMOJI[id] ?? '\u{1F37D}'}</RNText>
    </View>
    <Text
      variant="fine"
      tone={isActive ? 'ember' : 'ink'}
      numberOfLines={2}
      weight="700"
      className="text-center"
    >
      {label}
    </Text>
  </TouchableOpacity>
);
```

- [ ] **Step 2: Write VegSwitch**

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from './Text';

/**
 * The Pure Veg pill. Interactive, but does not filter yet — spec decision D6.
 * The knob is absolutely positioned from a runtime value, which Tailwind
 * cannot express, so it uses an inline offset like Badges.tsx does.
 */
export const VegSwitch = ({
  value,
  onChange,
  label = 'Pure Veg',
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    activeOpacity={0.8}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    accessibilityLabel={label}
    className={`flex-row items-center gap-sm rounded-pill border-2 px-sm py-xs ${
      value ? 'bg-veg-tint border-veg' : 'bg-surface border-hairline'
    }`}
  >
    <View
      className={`w-7 h-4 rounded-pill justify-center ${
        value ? 'bg-veg' : 'bg-switch-track-off'
      }`}
    >
      <View
        style={{ left: value ? 14 : 2 }}
        className="absolute w-3 h-3 rounded-pill bg-surface"
      />
    </View>
    <Text variant="fine" tone={value ? 'veg' : 'muted'} weight="700">
      {label}
    </Text>
  </TouchableOpacity>
);
```

- [ ] **Step 3: Write SearchButton**

```tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { Text } from './Text';

/**
 * Looks like a field, behaves like a button: tapping it opens search rather
 * than raising a keyboard in the header. Deliberately NOT a TextInput.
 */
export const SearchButton = ({
  placeholder = 'Search dishes…',
  onPress,
}: {
  placeholder?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="search"
    accessibilityLabel={placeholder}
    className="w-full flex-row items-center gap-sm bg-hero-foreground rounded-md px-md py-sm h-12"
  >
    <Search size={19} className="text-muted" strokeWidth={2} />
    <Text variant="body" tone="muted">
      {placeholder}
    </Text>
  </TouchableOpacity>
);
```

- [ ] **Step 4: Export all three**

```ts
export { CategoryTile } from './CategoryTile';
export { VegSwitch } from './VegSwitch';
export { SearchButton } from './SearchButton';
```

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/components/ui/CategoryTile.tsx src/components/ui/VegSwitch.tsx src/components/ui/SearchButton.tsx src/components/ui/index.ts
git commit -m "feat(ui): add CategoryTile, VegSwitch and SearchButton"
```

---

### Task 9: CartBar, Toast and SkeletonRail

The three floating/overlay pieces.

**Files:**
- Create: `src/components/ui/CartBar.tsx`
- Create: `src/components/ui/Toast.tsx`
- Modify: `src/components/ui/States.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: nothing beyond existing primitives
- Produces: `CartBar({ count, total, onPress })`, `Toast({ message })`, `SkeletonRail({ cards? })`

- [ ] **Step 1: Write CartBar**

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Text } from './Text';

/** The sticky ember cart bar. Rendered only when the cart is non-empty. */
export const CartBar = ({
  count,
  total,
  onPress,
}: {
  count: number;
  total: number;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    accessibilityRole="button"
    accessibilityLabel={`View cart, ${count} items, ${total} rupees`}
    className="flex-row items-center justify-between bg-ember rounded-lg px-md py-sm shadow-ember-glow"
  >
    <View className="flex-row items-center gap-sm">
      <View className="bg-surface/20 rounded-sm px-sm py-xs">
        <Text variant="caption" tone="on-ember">
          {count}
        </Text>
      </View>
      <View>
        <Text variant="body" tone="on-ember" weight="800">
          {`₹${total}`}
        </Text>
        <Text variant="fine" tone="on-ember" className="opacity-80">
          plus taxes
        </Text>
      </View>
    </View>

    <View className="flex-row items-center gap-xs">
      <Text variant="body" tone="on-ember" weight="800">
        View cart
      </Text>
      <ArrowRight size={17} className="text-on-ember" strokeWidth={2.4} />
    </View>
  </TouchableOpacity>
);
```

- [ ] **Step 2: Write Toast**

```tsx
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { Text } from './Text';

/**
 * The add-to-cart confirmation. The caller owns visibility and the dismiss
 * timer; this renders only when mounted.
 */
export const Toast = ({ message }: { message: string }) => (
  <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut}>
    <View className="flex-row items-center gap-sm bg-hero rounded-md px-md py-sm shadow-e3">
      <View className="w-6 h-6 rounded-pill bg-veg items-center justify-center">
        <Check size={12} className="text-on-ember" strokeWidth={3} />
      </View>
      <Text variant="body" tone="on-hero" className="flex-1">
        {message}
      </Text>
    </View>
  </Animated.View>
);
```

- [ ] **Step 3: Add SkeletonRail**

Append to `src/components/ui/States.tsx`:

```tsx
/** Loading placeholder shaped like a horizontal dish rail. */
export const SkeletonRail = ({ cards = 3 }: { cards?: number }) => (
  <View className="px-md gap-md">
    <Skeleton className="h-4 w-2/5 rounded-sm" />
    <View className="flex-row gap-md">
      {Array.from({ length: cards }).map((_, i) => (
        <View key={i} className="w-40 gap-sm">
          <Skeleton className="w-full h-28 rounded-xl" />
          <Skeleton className="h-3 w-4/5 rounded-sm" />
          <Skeleton className="h-3 w-1/2 rounded-sm" />
        </View>
      ))}
    </View>
  </View>
);
```

- [ ] **Step 4: Export**

```ts
export { CartBar } from './CartBar';
export { Toast } from './Toast';
export { EmptyState, ErrorState, SkeletonCard, SkeletonRail } from './States';
```

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/components/ui/CartBar.tsx src/components/ui/Toast.tsx src/components/ui/States.tsx src/components/ui/index.ts
git commit -m "feat(ui): add CartBar, Toast and SkeletonRail"
```

---

### Task 10: HomeHeader

The dark Ink 900 header: location, actions, service modes, search.

**Files:**
- Create: `src/features/home/components/HomeHeader.tsx`

**Interfaces:**
- Consumes: `Segmented`/`SegmentedOption` (Task 6), `SearchButton` (Task 8), `RadialGlow`/`LinearFill` (Task 4)
- Produces: `HomeHeader({ address, serviceMode, onServiceModeChange, onSearch, hasUnread? })`, `SERVICE_MODES: SegmentedOption[]`

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronDown } from 'lucide-react-native';
import {
  Text,
  Segmented,
  SearchButton,
  RadialGlow,
  LinearFill,
  type SegmentedOption,
} from '@/components/ui';

export const SERVICE_MODES: SegmentedOption[] = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'dinein', label: 'Dine-in' },
];

export const HomeHeader = ({
  address,
  serviceMode,
  onServiceModeChange,
  onSearch,
  hasUnread = true,
}: {
  address: string;
  serviceMode: string;
  onServiceModeChange: (value: string) => void;
  onSearch?: () => void;
  hasUnread?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 16 }}
      className="relative overflow-hidden bg-hero px-md pb-md gap-md"
    >
      {/* Bleeds past the top-right corner, as in the design. */}
      <RadialGlow size={240} style={{ top: -90, right: -50 }} />

      <View className="flex-row items-center justify-between">
        <View>
          <Text variant="caption" tone="ember">
            Deliver to · Home
          </Text>
          <View className="flex-row items-center gap-xs mt-xs">
            <Text variant="item" tone="on-hero" numberOfLines={1} className="max-w-56">
              {address}
            </Text>
            <ChevronDown size={15} className="text-hero-muted" strokeWidth={2.4} />
          </View>
        </View>

        <View className="flex-row gap-sm">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="w-10 h-10 rounded-md bg-hero-surface items-center justify-center"
          >
            <Bell size={19} className="text-hero-foreground" strokeWidth={1.9} />
            {hasUnread ? (
              <View className="absolute top-2 right-2 w-2 h-2 rounded-pill bg-ember border border-hero-surface" />
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            className="relative overflow-hidden w-10 h-10 rounded-md items-center justify-center"
          >
            <LinearFill from="ember" to="saffron" diagonal />
            <Text variant="item" tone="on-ember">
              A
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Segmented
        options={SERVICE_MODES}
        value={serviceMode}
        onChange={onServiceModeChange}
        surface="hero"
      />

      <SearchButton onPress={onSearch} />
    </View>
  );
};
```

> `Text variant="caption"` uppercases, so "Deliver to · Home" is written in sentence case and rendered uppercase by the variant. Do not pre-uppercase the string.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/features/home/components/HomeHeader.tsx
git commit -m "feat(home): add the dark Ink 900 header"
```

---

### Task 11: SignatureHero and ClosedStrip

**Files:**
- Create: `src/features/home/components/SignatureHero.tsx`
- Create: `src/features/home/components/ClosedStrip.tsx`

**Interfaces:**
- Consumes: `MenuItem`, `OPENS_AT_LABEL` (Task 2); `ImageTile` (Task 5); `ScrimFill` (Task 4); `VegBadge` (Task 6)
- Produces: `SignatureHero({ item, onAdd })`, `ClosedStrip()`

- [ ] **Step 1: Write SignatureHero**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu';
import { Text, ImageTile, ScrimFill, VegBadge } from '@/components/ui';

/** The lead visual: one signature dish, full-bleed, with an ADD on the photo. */
export const SignatureHero = ({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: () => void;
}) => (
  <View className="px-md pt-md">
    <View className="relative h-56 rounded-xl overflow-hidden shadow-e3">
      <ImageTile categoryId={item.cat} uri={item.image} emojiSize={64} />
      <ScrimFill />

      <View className="absolute top-md left-md flex-row gap-xs">
        <View className="bg-ember rounded-sm px-sm py-xs">
          <Text variant="caption" tone="on-ember">
            Signature
          </Text>
        </View>
        <View className="flex-row items-center gap-xs bg-hero/60 rounded-sm px-sm py-xs">
          <Star size={10} className="text-saffron" fill="currentColor" />
          <Text variant="caption" tone="saffron">
            4.8
          </Text>
        </View>
      </View>

      <View className="absolute left-md right-md bottom-md flex-row items-end justify-between gap-md">
        <View className="flex-1">
          <View className="flex-row items-center gap-xs mb-xs">
            <VegBadge isVeg={item.veg} size={14} tone="bright" />
            <Text variant="fine" tone="hero-muted" weight="700">
              Smoky · Charcoal-grilled
            </Text>
          </View>

          <Text
            variant="h2"
            tone="on-hero"
            numberOfLines={1}
            weight="800"
          >
            {item.name}
          </Text>

          <View className="flex-row items-baseline gap-xs mt-xs">
            <Text variant="body" tone="ember" weight="800">
              {`₹${item.base}`}
            </Text>
            {item.portion ? (
              <Text variant="fine" tone="hero-muted">
                · Full / Half
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name}`}
          className="bg-ember rounded-md px-md h-11 items-center justify-center shadow-ember-glow"
        >
          <Text variant="caption" tone="on-ember">
            Add +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
```

- [ ] **Step 2: Write ClosedStrip**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { OPENS_AT_LABEL } from '@/data/restaurant';

/** Shown only outside service hours. Rendering is the caller's decision. */
export const ClosedStrip = () => (
  <View className="flex-row items-center gap-sm bg-closed px-md py-sm">
    <View className="w-2 h-2 rounded-pill bg-warning" />
    <Text variant="fine" tone="closed-foreground" weight="700" className="flex-1">
      {`Currently closed · opens today at ${OPENS_AT_LABEL}. You can browse and schedule an order.`}
    </Text>
  </View>
);
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/features/home/components/SignatureHero.tsx src/features/home/components/ClosedStrip.tsx
git commit -m "feat(home): add the signature hero and closed strip"
```

---

### Task 12: OffersRail and StatusStrip

**Files:**
- Create: `src/features/home/components/OffersRail.tsx`
- Create: `src/features/home/components/StatusStrip.tsx`

**Interfaces:**
- Consumes: `LinearFill` (Task 4), `VegSwitch` (Task 8), `SERVICE` (Task 2)
- Produces: `OffersRail()`, `StatusStrip({ isOpen, isVegOnly, onVegChange })`

- [ ] **Step 1: Write OffersRail**

```tsx
import React from 'react';
import { View, ScrollView, StyleSheet, Text as RNText } from 'react-native';
import { Text, LinearFill } from '@/components/ui';

const OfferCode = ({ code, tone }: { code: string; tone: 'ember' | 'saffron' }) => (
  <View
    className={`self-start rounded-sm px-sm py-0.5 ${
      tone === 'ember' ? 'bg-surface/25' : 'bg-saffron/20'
    }`}
  >
    <Text variant="caption" tone={tone === 'ember' ? 'on-ember' : 'saffron'}>
      {code}
    </Text>
  </View>
);

/** Two promo cards, horizontally scrollable. */
export const OffersRail = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.rail}
  >
    <View className="relative overflow-hidden w-64 rounded-lg p-md gap-xs">
      <LinearFill from="ember" to="ember-deep" />
      <RNText style={styles.glyph}>{'\u{1F525}'}</RNText>
      <Text variant="caption" tone="on-ember-muted">
        First order
      </Text>
      <Text variant="h2" tone="on-ember" weight="800">
        15% OFF
      </Text>
      <View className="flex-row items-center gap-xs">
        <Text variant="fine" tone="on-ember-muted">
          Code
        </Text>
        <OfferCode code="WELCOME15" tone="ember" />
      </View>
    </View>

    <View className="relative overflow-hidden w-64 bg-hero rounded-lg p-md gap-xs">
      <RNText style={styles.glyph}>{'\u{1F362}'}</RNText>
      <Text variant="caption" tone="saffron">
        Free delivery
      </Text>
      <Text variant="h2" tone="on-hero" weight="800">
        {'On ₹599+'}
      </Text>
      <View className="flex-row items-center gap-xs">
        <Text variant="fine" tone="hero-muted">
          Code
        </Text>
        <OfferCode code="FREEDEL" tone="saffron" />
      </View>
    </View>
  </ScrollView>
);

/** Layout-only: rail padding, and a glyph bled past the card's bottom edge. */
const styles = StyleSheet.create({
  rail: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  glyph: {
    position: 'absolute',
    right: 10,
    bottom: -16,
    fontSize: 56,
    opacity: 0.9,
  },
});
```

- [ ] **Step 2: Write StatusStrip**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text, VegSwitch } from '@/components/ui';
import { SERVICE } from '@/data/restaurant';

export const StatusStrip = ({
  isOpen,
  isVegOnly,
  onVegChange,
}: {
  isOpen: boolean;
  isVegOnly: boolean;
  onVegChange: (next: boolean) => void;
}) => (
  <View className="px-md">
    <View className="flex-row items-center gap-sm bg-surface border border-hairline rounded-lg px-md py-sm">
      <View className="flex-row items-center gap-xs">
        <View className={`w-2 h-2 rounded-pill ${isOpen ? 'bg-veg' : 'bg-chili'}`} />
        <Text variant="fine" tone={isOpen ? 'veg' : 'chili'} weight="700">
          {isOpen ? 'Open now' : 'Closed'}
        </Text>
      </View>

      <View className="w-px h-4 bg-hairline" />

      <View className="flex-row items-center gap-xs">
        <Star size={13} className="text-veg" fill="currentColor" />
        <Text variant="fine" tone="ink" weight="700">
          {SERVICE.rating}
        </Text>
      </View>

      <Text variant="fine" tone="muted">
        {`· ${SERVICE.etaMinutes} min · ${SERVICE.distanceKm} km`}
      </Text>

      <View className="ml-auto">
        <VegSwitch value={isVegOnly} onChange={onVegChange} />
      </View>
    </View>
  </View>
);
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/features/home/components/OffersRail.tsx src/features/home/components/StatusStrip.tsx
git commit -m "feat(home): add the offers rail and status strip"
```

---

### Task 13: CategoryRail and BestsellerRail

**Files:**
- Create: `src/features/home/components/CategoryRail.tsx`
- Create: `src/features/home/components/BestsellerRail.tsx`
- Create: `src/features/home/components/SectionHeader.tsx`

**Interfaces:**
- Consumes: `CATEGORIES`/`bestsellers` (Task 2), `CategoryTile` (Task 8), `DishCard` (Task 7)
- Produces: `SectionHeader({ title, actionLabel?, onAction? })`, `CategoryRail({ activeId, onSelect })`, `BestsellerRail({ quantityOf, onAdd, onRemove, onSeeAll })`, `RAIL_CATEGORY_IDS: string[]`

- [ ] **Step 1: Write SectionHeader**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';

/**
 * `title` is Jakarta 20/700, NOT Bricolage: the design system floors
 * Bricolage at 24px and the mock set these at 19px. Spec decision D3.
 */
export const SectionHeader = ({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View className="flex-row items-baseline justify-between px-md pb-md">
    <Text variant="title">{title}</Text>
    {actionLabel ? (
      <TouchableOpacity onPress={onAction} accessibilityRole="button">
        <Text variant="fine" tone="ember" weight="700">
          {actionLabel}
        </Text>
      </TouchableOpacity>
    ) : null}
  </View>
);
```

- [ ] **Step 2: Write CategoryRail**

```tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { CategoryTile } from '@/components/ui';
import { CATEGORIES } from '@/data/menu';
import { SectionHeader } from './SectionHeader';

/** The ten cuisines the design surfaces, in its order. Spec §5.4. */
export const RAIL_CATEGORY_IDS = [
  'chicken-tandoor',
  'mutton-tandoor',
  'seafood',
  'tawa',
  'sizzlers',
  'nonveg-chinese',
  'veg-main',
  'bread',
  'desserts',
  'beverages',
];

const RAIL = RAIL_CATEGORY_IDS.map(id => {
  const category = CATEGORIES.find(c => c.id === id);
  if (!category) throw new Error(`Unknown category in the home rail: ${id}`);
  return category;
});

export const CategoryRail = ({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
}) => (
  <View className="pt-lg">
    <SectionHeader title="What are you craving?" />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
    >
      {RAIL.map(category => (
        <CategoryTile
          key={category.id}
          id={category.id}
          label={category.short}
          isActive={activeId === category.id}
          onPress={() => onSelect(category.id)}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  rail: { paddingHorizontal: 16, gap: 14 },
});
```

- [ ] **Step 3: Write BestsellerRail**

```tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { MenuItem } from '@/types/menu';
import { DishCard } from '@/components/ui';
import { bestsellers } from '@/data/menu';
import { SectionHeader } from './SectionHeader';

const ITEMS = bestsellers();

export const BestsellerRail = ({
  quantityOf,
  onAdd,
  onRemove,
  onSeeAll,
}: {
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  onSeeAll?: () => void;
}) => (
  <View className="pt-lg">
    <SectionHeader title="Bestsellers" actionLabel="See all" onAction={onSeeAll} />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
    >
      {ITEMS.map(item => (
        <DishCard
          key={item.id}
          item={item}
          showRating
          quantity={quantityOf(item.id)}
          onAdd={() => onAdd(item)}
          onRemove={() => onRemove(item)}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  rail: { paddingHorizontal: 16, gap: 13, paddingBottom: 8 },
});
```

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/features/home/components/SectionHeader.tsx src/features/home/components/CategoryRail.tsx src/features/home/components/BestsellerRail.tsx
git commit -m "feat(home): add the category and bestseller rails

Section headings render in Plus Jakarta Sans at the title step, not
in Bricolage: the mock set them at 19px and the design system floors
Bricolage at 24px. Spec decision D3."
```

---

### Task 14: SizzlerSpotlight and ReorderRow

**Files:**
- Create: `src/features/home/components/SizzlerSpotlight.tsx`
- Create: `src/features/home/components/ReorderRow.tsx`

**Interfaces:**
- Consumes: `byCategory` (Task 2), `DishCard` (Task 7), `RadialGlow` (Task 4)
- Produces: `SizzlerSpotlight({ quantityOf, onAdd, onRemove })`, `ReorderRow({ onReorder })`

- [ ] **Step 1: Write SizzlerSpotlight**

```tsx
import React from 'react';
import { View, ScrollView, StyleSheet, Text as RNText } from 'react-native';
import type { MenuItem } from '@/types/menu';
import { Text, DishCard, RadialGlow } from '@/components/ui';
import { byCategory } from '@/data/menu';

const ITEMS = byCategory('sizzlers');

export const SizzlerSpotlight = ({
  quantityOf,
  onAdd,
  onRemove,
}: {
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
}) => (
  <View className="px-md pt-lg">
    <View className="relative overflow-hidden bg-hero rounded-xl p-md">
      <RadialGlow size={200} opacity={0.28} style={{ top: -70, right: -40 }} />

      <View className="flex-row items-center justify-between mb-md">
        <View>
          <Text variant="caption" tone="saffron">
            Served spitting hot
          </Text>
          <Text variant="title" tone="on-hero" className="mt-xs">
            Special Sizzlers
          </Text>
        </View>
        <RNText style={styles.flame}>{'\u{1F525}'}</RNText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {ITEMS.map(item => (
          <DishCard
            key={item.id}
            item={item}
            surface="hero"
            quantity={quantityOf(item.id)}
            onAdd={() => onAdd(item)}
            onRemove={() => onRemove(item)}
          />
        ))}
      </ScrollView>
    </View>
  </View>
);

const styles = StyleSheet.create({
  rail: { gap: 12 },
  flame: { fontSize: 26 },
});
```

- [ ] **Step 2: Write ReorderRow**

```tsx
import React from 'react';
import { View, TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { byId } from '@/data/menu';

/** The previous order the mock replays. */
export const LAST_ORDER = [
  { id: 'butter-chicken', quantity: 1 },
  { id: 'butter-garlic-naan', quantity: 2 },
];

const SUMMARY = LAST_ORDER.map(line => {
  const item = byId[line.id];
  return line.quantity > 1 ? `${item.name} ×${line.quantity}` : item.name;
}).join(', ');

export const ReorderRow = ({ onReorder }: { onReorder: () => void }) => (
  <View className="px-md pt-md">
    <View className="flex-row items-center gap-md bg-surface border border-dashed border-hairline rounded-lg px-md py-sm">
      <View className="w-11 h-11 rounded-md bg-ember-tint items-center justify-center">
        <RNText style={styles.glyph}>{'\u{1F37D}'}</RNText>
      </View>

      <View className="flex-1">
        <Text variant="caption" tone="muted">
          Order again
        </Text>
        <Text variant="fine" tone="ink" weight="700" numberOfLines={1} className="mt-xs">
          {SUMMARY}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onReorder}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Reorder your last order"
        className="bg-hero rounded-md px-md h-10 items-center justify-center"
      >
        <Text variant="caption" tone="on-hero">
          Reorder
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({ glyph: { fontSize: 22 } });
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add src/features/home/components/SizzlerSpotlight.tsx src/features/home/components/ReorderRow.tsx
git commit -m "feat(home): add the sizzler spotlight and reorder row"
```

---

### Task 15: HomeScreen composition

Replaces the current screen entirely.

**Files:**
- Modify: `src/features/home/HomeScreen.tsx` (full replacement)

**Interfaces:**
- Consumes: every component from Tasks 4–14, `useCartStore` (Task 3), `byId`/`priceOf`/`isOpenAt` (Task 2)
- Produces: `HomeScreen` — the default Home tab screen

- [ ] **Step 1: Replace the screen**

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { MenuItem } from '@/types/menu';
import { CartBar, Toast, SkeletonRail } from '@/components/ui';
import { useCartStore } from '@/store/cart.store';
import { byId } from '@/data/menu';
import { isOpenAt } from '@/data/restaurant';
import { TAB_BAR_HEIGHT } from '@/components/navigation/CustomTabBar';
import { HomeHeader } from './components/HomeHeader';
import { ClosedStrip } from './components/ClosedStrip';
import { SignatureHero } from './components/SignatureHero';
import { OffersRail } from './components/OffersRail';
import { StatusStrip } from './components/StatusStrip';
import { CategoryRail } from './components/CategoryRail';
import { BestsellerRail } from './components/BestsellerRail';
import { SizzlerSpotlight } from './components/SizzlerSpotlight';
import { ReorderRow, LAST_ORDER } from './components/ReorderRow';

const ADDRESS = '351 Maison Street, Bandra W';
const SIGNATURE = byId['tandoori-chicken'];
const TOAST_MS = 1900;
/** Mock latency, matching the app's existing setTimeout convention. */
const LOAD_MS = 900;

export const HomeScreen = () => {
  const [serviceMode, setServiceMode] = useState('delivery');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const quantityOf = useCartStore(s => s.quantityOf);
  // Subscribing to the derived values is what re-renders this screen on every
  // cart change; quantityOf above is a stable reference that reads current
  // state, so the rails recompute during that same render pass.
  const count = useCartStore(s => s.totalItems());
  const total = useCartStore(s => s.totalAmount());

  const isOpen = isOpenAt(new Date());

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => {
    const load = setTimeout(() => setIsLoading(false), LOAD_MS);
    return () => {
      clearTimeout(load);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleAdd = useCallback(
    (item: MenuItem) => {
      addItem({ id: item.id, name: item.name, price: item.base });
      showToast(`${item.name} added to cart`);
    },
    [addItem, showToast],
  );

  const handleRemove = useCallback(
    (item: MenuItem) => decrementItem(item.id),
    [decrementItem],
  );

  const handleReorder = useCallback(() => {
    LAST_ORDER.forEach(line => {
      const item = byId[line.id];
      for (let i = 0; i < line.quantity; i++) {
        addItem({ id: item.id, name: item.name, price: item.base });
      }
    });
    showToast('Your last order is back in the cart');
  }, [addItem, showToast]);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HomeHeader
          address={ADDRESS}
          serviceMode={serviceMode}
          onServiceModeChange={setServiceMode}
        />

        {!isOpen ? <ClosedStrip /> : null}

        <SignatureHero item={SIGNATURE} onAdd={() => handleAdd(SIGNATURE)} />
        <OffersRail />
        <StatusStrip
          isOpen={isOpen}
          isVegOnly={isVegOnly}
          onVegChange={setIsVegOnly}
        />

        {isLoading ? (
          <View className="pt-lg">
            <SkeletonRail />
          </View>
        ) : (
          <>
            <CategoryRail activeId={activeCategory} onSelect={setActiveCategory} />
            <BestsellerRail
              quantityOf={quantityOf}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
            <SizzlerSpotlight
              quantityOf={quantityOf}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
            <ReorderRow onReorder={handleReorder} />
          </>
        )}
      </ScrollView>

      {/* Floating above the scroll view, clear of the tab bar. */}
      <View
        style={{ bottom: TAB_BAR_HEIGHT + 12 }}
        className="absolute left-md right-md gap-sm"
        pointerEvents="box-none"
      >
        {toast ? <Toast message={toast} /> : null}
        {count > 0 ? <CartBar count={count} total={total} /> : null}
      </View>
    </View>
  );
};

/** Layout-only: bottom clearance for the tab bar and the cart bar. */
const styles = StyleSheet.create({
  content: { paddingBottom: 170 },
});
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: one error — `TAB_BAR_HEIGHT` is not exported from `CustomTabBar` yet. Task 16 adds it. Proceed to Task 16 and return here.

- [ ] **Step 3: Commit after Task 16 passes**

Hold this commit until `npx tsc --noEmit` is clean. Then:

```bash
git add src/features/home/HomeScreen.tsx
git commit -m "feat(home): compose the Ember Immersive home screen"
```

---

### Task 16: Remove the cart FAB from the tab bar

Spec decision D2.

**Files:**
- Modify: `src/navigation/MainTabNavigator.tsx`
- Modify: `src/components/navigation/CustomTabBar.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `TAB_BAR_HEIGHT: number` exported from `CustomTabBar`, consumed by `HomeScreen`

- [ ] **Step 1: Drop the Cart tab**

In `src/navigation/MainTabNavigator.tsx`, delete the `CartScreen` const and its `<Tab.Screen name="Cart" … />`, leaving Home / Saved / Orders / Profile.

- [ ] **Step 2: Strip the FAB from CustomTabBar**

In `src/components/navigation/CustomTabBar.tsx`:

1. Delete the `case 'Cart':` branch of `TabIcon` (the raised ember bag, its `-mt-10` offset and the count badge).
2. Delete `cartCount` from `TabIconProps` and from the `<TabIcon>` call site.
3. Delete the `useCartStore` import, the `cartItemsCount` / `hasItemsInCart` lines, and the `if (route.name === 'Cart' && !hasItemsInCart) return null;` guard.
4. Delete the `ShoppingBag` import and the `route.name !== 'Cart'` condition around the label, so every tab always shows its label.
5. Export the height the cart bar positions against:

```tsx
/** The bar's own height, excluding the safe-area inset the navigator adds. */
export const TAB_BAR_HEIGHT = 72;
```

- [ ] **Step 3: Verify the whole app typechecks**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: all clean, including `HomeScreen.tsx` from Task 15.

- [ ] **Step 4: Commit both tasks**

```bash
git add src/navigation/MainTabNavigator.tsx src/components/navigation/CustomTabBar.tsx src/features/home/HomeScreen.tsx
git commit -m "feat(nav): replace the cart FAB with the sticky cart bar

The design promotes the cart to a bar showing count and total, which
the FAB's badge could not. Two cart affordances stacked at the screen
bottom is not what the design intends, so the FAB goes. Spec D2."
```

---

### Task 17: Documentation

`CLAUDE.md` describes state that is no longer true.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Correct the stale claims**

In the `### Current State` section, `axios`, `react-native-mmkv` and `react-native-config` are all installed already — verify with `node -e "console.log(Object.keys(require('./package.json').dependencies))"` and rewrite the paragraph to say only TanStack Query and Socket.IO remain planned.

In the `## Environment` section, delete "No `react-native-config` installed yet".

- [ ] **Step 2: Document the new structure**

Add to `### Feature Folder Convention`:

```markdown
Shared mock data lives in `src/data/` (`menu.ts`, `restaurant.ts`) and its
types in `src/types/`. Home-only composition components live in
`src/features/home/components/`; anything reusable belongs in
`src/components/ui/`.
```

- [ ] **Step 3: Record the mock-data boundary**

The home screen is deliberately 100% mock — no HTTP, no query client, no socket. The API
integration is a separate later phase, and the next person needs to know both that this is
intentional and where the seams are. Add to `### Current State`:

```markdown
**The home screen is mock-only by design.** Everything it renders comes from
`src/data/menu.ts` (125 dishes) and `src/data/restaurant.ts` (hours, rating,
ETA, distance). `HomeScreen`'s loading state is a `setTimeout`, not a request.
There are no network calls anywhere in `src/features/home/`.

When the API phase starts, these are the seams:

| Swap | Keep |
| --- | --- |
| the bodies of `src/data/menu.ts` and `src/data/restaurant.ts` | their exported signatures — `byId`, `bestsellers()`, `byCategory()`, `priceOf()`, `isOpenAt()` — which every section imports |
| `HomeScreen`'s `isLoading` `setTimeout` | the `SkeletonRail` it already gates |
| `MenuItem.image`, declared and unset | `ImageTile`, which already renders a photo when a `uri` exists |
```

- [ ] **Step 4: Mark the mock modules at their source**

A note in `CLAUDE.md` is easy to miss when you are looking at the file itself. Put a header
comment on each of `src/data/menu.ts` and `src/data/restaurant.ts` saying it is mock data
standing in for an API, and that the exported function signatures are the contract a real
client should preserve. Keep it to a few lines, matching the comment style already used in
`src/components/ui/index.ts`.

Do not restructure either module — this step adds comments only.

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add CLAUDE.md src/data/menu.ts src/data/restaurant.ts
git commit -m "docs: correct stale notes and mark the mock-data boundary

axios, react-native-mmkv and react-native-config are installed despite
CLAUDE.md saying otherwise; only TanStack Query and Socket.IO remain
planned.

The home screen is mock-only on purpose and the API work is a later
phase, so CLAUDE.md now names the swap seams and both data modules say
at their head that they stand in for an API."
```

---

### Task 18: Final verification

- [ ] **Step 1: Run everything**

```bash
npm test
npm run lint
npx tsc --noEmit
```

Expected: all three clean. `npm test` must include the token guard, the CSS contract (with the new Ember Immersive block), the menu data suite and the cart store suite.

- [ ] **Step 2: Confirm the hex guard actually covered the new code**

Run: `npx jest __tests__/design-tokens.test.ts -t "hardcoded hex"`
Expected: PASS for every new file. A failure names the file and line — move the colour into `global.css` as a token; do not add an allowlist entry.

- [ ] **Step 3: Run it on a device**

```bash
npm start
npm run android
```

Check against the design:
1. Dark header with the ember bloom bleeding off the top-right; service tabs switch; search is a button, not a keyboard.
2. Signature hero shows Tandoori Chicken at ₹499 with "· Full / Half".
3. `ADD` anywhere raises the cart bar with a live count and rupee total, and a dark toast naming the dish that clears after ~2s.
4. Adding twice turns that card's ADD into a `− 2 +` stepper; decrementing to zero returns it to ADD and drops the cart bar.
5. Bestsellers shows 8 cards, Special Sizzlers 3 on the dark panel.
6. Reorder adds three lines (Butter Chicken, Butter Garlic Naan ×2).
7. Bottom nav has exactly four tabs and no floating cart button.
8. The closed strip appears only outside 12:00–23:00 — to check it mid-service, temporarily widen `HOURS` in `src/data/restaurant.ts`, then revert.
9. Skeleton rail is visible for the first ~900ms.

- [ ] **Step 4: Check both device colour schemes**

Switch the device between light and dark mode. The screen must look **identical** — one palette renders in both, and any difference means a `dark:` variant or a system colour slipped in.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore(home): verify the Ember Immersive build"
```
