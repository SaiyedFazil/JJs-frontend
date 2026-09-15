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
