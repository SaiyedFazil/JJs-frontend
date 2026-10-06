import { create } from 'zustand';

/**
 * Dishes the customer has hearted, by dish id. In memory, like the cart —
 * the Favourites tab is still a placeholder, and this is what it will read.
 */
interface FavouritesState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useFavouritesStore = create<FavouritesState>(set => ({
  ids: [],

  toggle: id =>
    set(state => ({
      ids: state.ids.includes(id)
        ? state.ids.filter(i => i !== id)
        : [...state.ids, id],
    })),
}));
