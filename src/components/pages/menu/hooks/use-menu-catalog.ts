import { useMemo } from 'react';
import type { MenuCategory, MenuItem } from '@/types/menu.types';
import { CATEGORIES, MENU, byCategory } from '@/data/menu';

export type MenuSort = 'bestseller' | 'price' | 'rating';

/** One category of the full menu, holding only the dishes that survive the filters. */
export interface MenuSection {
  id: MenuCategory['id'];
  name: string;
  items: MenuItem[];
}

/** The same rule as the home screen's bestseller rail: a tag, not a hardcoded list. */
export const isBestseller = (item: MenuItem) =>
  item.tags.includes('bestseller');

/**
 * Nothing sets `rating` yet (see menu.types.ts), so the Rating sort hides
 * itself rather than sorting by nothing. It appears on its own once the data
 * carries ratings.
 */
export const HAS_RATINGS = MENU.some(m => m.rating != null);

const ORDER: Record<MenuSort, (a: MenuItem, b: MenuItem) => number> = {
  bestseller: (a, b) => Number(isBestseller(b)) - Number(isBestseller(a)),
  price: (a, b) => a.base - b.base,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
};

/** Stable, so dishes that tie keep their menu order. */
export const sortItems = (items: MenuItem[], sort: MenuSort | null) =>
  sort ? [...items].sort(ORDER[sort]) : items;

const passesVeg = (item: MenuItem, vegOnly: boolean) => !vegOnly || item.veg;

/**
 * Every category in menu order, minus the synthetic 'popular' rail (its dishes
 * already sit in their own sections). A category the veg filter empties is
 * dropped, so its tab disappears with it rather than jumping nowhere.
 */
export const buildSections = (
  vegOnly: boolean,
  sort: MenuSort | null,
): MenuSection[] =>
  CATEGORIES.filter(c => c.id !== 'popular')
    .map(c => ({
      id: c.id,
      name: c.name,
      items: sortItems(
        byCategory(c.id).filter(m => passesVeg(m, vegOnly)),
        sort,
      ),
    }))
    .filter(s => s.items.length > 0);

/** Name or description, case-insensitive. An empty query matches nothing. */
export const searchMenu = (
  query: string,
  vegOnly: boolean,
  sort: MenuSort | null,
): MenuItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sortItems(
    MENU.filter(
      m =>
        passesVeg(m, vegOnly) &&
        (m.name.toLowerCase().includes(q) ||
          (m.desc?.toLowerCase().includes(q) ?? false)),
    ),
    sort,
  );
};

export const useMenuCatalog = ({
  query,
  vegOnly,
  sort,
}: {
  query: string;
  vegOnly: boolean;
  sort: MenuSort | null;
}) => {
  const sections = useMemo(() => buildSections(vegOnly, sort), [vegOnly, sort]);
  const results = useMemo(
    () => searchMenu(query, vegOnly, sort),
    [query, vegOnly, sort],
  );
  const dishCount = useMemo(
    () => sections.reduce((n, s) => n + s.items.length, 0),
    [sections],
  );

  return {
    sections,
    results,
    dishCount,
    isSearching: query.trim().length > 0,
  };
};
