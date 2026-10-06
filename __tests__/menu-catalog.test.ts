import { MENU, byCategory } from '../src/data/menu';
import {
  HAS_RATINGS,
  buildSections,
  searchMenu,
} from '../src/components/pages/menu/hooks/use-menu-catalog';
import { sectionAt } from '../src/components/pages/menu/hooks/use-scroll-spy';

/**
 * The full menu screen renders straight from these. A dish that falls out of
 * every section, or a section whose tab jumps to nothing, is invisible in a
 * code review and only shows up as a hole on a device.
 */
describe('buildSections', () => {
  it('holds every dish exactly once, with no veg filter', () => {
    const ids = buildSections(false, null).flatMap(s => s.items.map(i => i.id));
    expect(ids).toHaveLength(MENU.length);
    expect(new Set(ids).size).toBe(MENU.length);
  });

  it('leaves out the synthetic Popular rail', () => {
    expect(buildSections(false, null).map(s => s.id)).not.toContain('popular');
  });

  it('keeps menu order within a section when unsorted', () => {
    const tandoor = buildSections(false, null).find(
      s => s.id === 'chicken-tandoor',
    );
    expect(tandoor?.items.map(i => i.id)).toEqual(
      byCategory('chicken-tandoor').map(i => i.id),
    );
  });

  it('Pure Veg drops non-veg dishes and the sections they empty', () => {
    const sections = buildSections(true, null);
    expect(sections.flatMap(s => s.items).every(i => i.veg)).toBe(true);
    expect(sections.map(s => s.id)).not.toContain('seafood');
    expect(sections.every(s => s.items.length > 0)).toBe(true);
  });

  it('sorts by price, low to high', () => {
    for (const section of buildSections(false, 'price')) {
      const prices = section.items.map(i => i.base);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });

  it('floats bestsellers to the top of their section, otherwise in menu order', () => {
    const tandoor = buildSections(false, 'bestseller').find(
      s => s.id === 'chicken-tandoor',
    );
    expect(tandoor?.items.slice(0, 3).map(i => i.id)).toEqual([
      'tandoori-chicken',
      'tandoori-murgh-malai',
      'chicken-burrah',
    ]);
    expect(tandoor?.items[3].id).toBe('tandoori-wings');
  });
});

describe('searchMenu', () => {
  it('matches name or description, ignoring case and padding', () => {
    const names = searchMenu('  TIKKA ', false, null).map(i => i.name);
    expect(names).toContain('Chicken Lasooni Tikka');
    // "tikka" appears only in this dish's description.
    expect(names).toContain('Zafrani Fish');
  });

  it('honours Pure Veg', () => {
    expect(searchMenu('tikka', true, null).every(i => i.veg)).toBe(true);
  });

  it('matches nothing for a blank query', () => {
    expect(searchMenu('   ', false, null)).toEqual([]);
  });
});

it('hides the Rating sort until the data carries ratings', () => {
  expect(HAS_RATINGS).toBe(MENU.some(m => m.rating != null));
});

describe('sectionAt (scroll-spy)', () => {
  const ids = ['a', 'b', 'c'];
  const tops = { a: 0, b: 100, c: 250 };

  it('is null above the first section', () => {
    expect(sectionAt(-1, ids, tops)).toBeNull();
  });

  it('names the last section whose top has passed the line', () => {
    expect(sectionAt(0, ids, tops)).toBe('a');
    expect(sectionAt(99, ids, tops)).toBe('a');
    expect(sectionAt(100, ids, tops)).toBe('b');
    expect(sectionAt(10_000, ids, tops)).toBe('c');
  });

  it('stops at a section that has not been measured yet', () => {
    expect(sectionAt(10_000, ids, { a: 0, c: 250 })).toBe('a');
  });
});
