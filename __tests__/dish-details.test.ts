import { MENU, byId } from '../src/data/menu';
import {
  DEFAULT_SPICE,
  PORTION_SERVES,
  dishDetailOf,
} from '../src/data/dish-details';

/**
 * The detail screen's mock content is keyed by slug, like everything else.
 * If a dish is renamed, its write-up must not silently fall off.
 */
const FEATURED = [
  'tandoori-chicken',
  'chicken-malai-cheese-tikka',
  'butter-chicken',
  'mutton-burrah',
  'chicken-sizzler',
  'paneer-butter-masala',
];

describe('dishDetailOf', () => {
  it.each(FEATURED)('%s is on the menu and carries its write-up', id => {
    const item = byId[id];
    expect(item).toBeDefined();

    const detail = dishDetailOf(item);
    expect(detail.rating).toBeDefined();
    expect(detail.reviews.length).toBeGreaterThan(0);
    expect(detail.ingredients.length).toBeGreaterThan(0);
    expect(detail.description).not.toBe(item.desc);
  });

  it('gives every dish a complete page', () => {
    for (const item of MENU) {
      const detail = dishDetailOf(item);
      expect(detail.prepMinutes).toBeGreaterThan(0);
      expect(detail.serves).toMatch(/^Serves /);
      expect(detail.pairings.length).toBeGreaterThan(0);
    }
  });

  it('falls back to the menu copy, with no rating, for a dish not written up', () => {
    const detail = dishDetailOf(byId['chicken-burrah']);
    expect(detail.description).toBe(byId['chicken-burrah'].desc);
    expect(detail.rating).toBeUndefined();
    expect(detail.reviews).toEqual([]);
  });

  it('every pairing resolves to a dish, and never to the dish itself', () => {
    const detail = dishDetailOf(byId['butter-naan']);
    expect(detail.pairings.map(p => p.id)).not.toContain('butter-naan');
    expect(detail.pairings).toHaveLength(4);
    expect(dishDetailOf(byId['tandoori-chicken']).pairings).toHaveLength(5);
  });

  it('offers spice, add-ons and notes on cooked dishes only', () => {
    const cooked = dishDetailOf(byId['butter-chicken']);
    expect(cooked.hasSpiceLevel).toBe(true);
    expect(cooked.addOns.length).toBeGreaterThan(0);
    expect(cooked.takesNotes).toBe(true);

    const drink = dishDetailOf(byId.sosyo);
    expect(drink.hasSpiceLevel).toBe(false);
    expect(drink.addOns).toEqual([]);
    expect(drink.takesNotes).toBe(false);
  });

  it('fills the three gallery frames with the dish photo, or nothing', () => {
    const { gallery } = dishDetailOf(byId['tandoori-chicken']);
    expect(gallery).toHaveLength(3);
    expect(
      gallery.every(photo => photo === byId['tandoori-chicken'].image),
    ).toBe(true);
    expect(dishDetailOf(byId['paneer-butter-masala']).gallery).toEqual([]);
  });

  it('rating breakdowns are whole distributions', () => {
    for (const id of FEATURED) {
      const { breakdown } = dishDetailOf(byId[id]).rating!;
      expect(breakdown.reduce((a, b) => a + b, 0)).toBe(100);
    }
  });
});

describe('constants', () => {
  it('the house spice is one of the levels on offer', () => {
    expect(['mild', 'medium', 'spicy']).toContain(DEFAULT_SPICE);
  });

  it('labels both portion sizes', () => {
    expect(Object.keys(PORTION_SERVES).sort()).toEqual(['full', 'half']);
  });
});
