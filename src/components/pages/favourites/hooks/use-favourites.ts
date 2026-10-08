import { useMemo } from 'react';
import type { MenuItem } from '@/types/menu.types';
import { CATEGORIES, byId } from '@/data/menu';
import { useFavouritesStore } from '@/store/favourites.store';

/** One category of saved dishes, holding only the ones that survive the filters. */
export interface FavouritesSection {
  id: string;
  name: string;
  items: MenuItem[];
}

const passesVeg = (item: MenuItem, vegOnly: boolean) => !vegOnly || item.veg;

/**
 * The saved dishes, resolved from the favourites store's dish ids and grouped
 * by category in menu order (the same ordering the Menu tab uses), so the two
 * screens read alike. A category the veg filter empties is dropped.
 *
 * `savedCount` is every saved dish regardless of the veg filter — the top bar
 * reports the collection, not the filtered view. The store holds ids in menu
 * order of hearting; an id with no dish behind it (a stale favourite) is
 * skipped rather than crashing the list.
 */
export const useFavourites = (vegOnly: boolean) => {
  const ids = useFavouritesStore(s => s.ids);

  const saved = useMemo(
    () => ids.map(id => byId[id]).filter((d): d is MenuItem => d != null),
    [ids],
  );

  const sections = useMemo<FavouritesSection[]>(
    () =>
      CATEGORIES.filter(c => c.id !== 'popular')
        .map(c => ({
          id: c.id,
          name: c.name,
          items: saved.filter(d => d.cat === c.id && passesVeg(d, vegOnly)),
        }))
        .filter(s => s.items.length > 0),
    [saved, vegOnly],
  );

  return {
    sections,
    savedCount: saved.length,
    isEmpty: saved.length === 0,
  };
};
