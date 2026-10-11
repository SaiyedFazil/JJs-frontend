import { create } from 'zustand';
import type { AddOn, PortionSize, SpiceLevel } from '@/types/menu.types';

/** What the customer chose on the product detail screen. */
export interface CartItemOptions {
  portion?: PortionSize;
  spice?: SpiceLevel;
  addOns: AddOn[];
  notes?: string;
}

export interface CartItem {
  /**
   * The line's id. A dish added as-is from a list uses its dish id; a
   * customised one gets an id of its own, so two configurations of the same
   * dish stay two lines.
   */
  id: string;
  name: string;
  /** Per unit, add-ons included. */
  price: number;
  quantity: number;
  /** Optional: menu items carry no photography yet. */
  image?: string;
  /** The dish behind a customised line, whose `id` is not a dish id. */
  dishId?: string;
  options?: CartItemOptions;
}

/** What a caller supplies — quantity is the store's business. */
export type CartLine = Omit<CartItem, 'quantity'>;

interface CartState {
  items: CartItem[];
  /** Adds `quantity` (default 1) to the line, creating it if absent. */
  addItem: (item: CartLine, quantity?: number) => void;
  /** Decrements by one, dropping the line at zero. */
  decrementItem: (id: string) => void;
  /** Removes the whole line regardless of quantity. */
  removeItem: (id: string) => void;
  /**
   * Puts back a line removed a moment ago, at the position it held — the
   * cart's Undo. Merges instead if the same line has been added since.
   */
  restoreItem: (item: CartItem, index: number) => void;
  /**
   * Swaps line `id` for `line` × `quantity`, in its place — how a dish opened
   * from a cart line's Edit replaces the configuration it was opened from.
   * Merges into the other line when the new configuration is already in the
   * cart, so one plate never shows as two lines.
   */
  replaceItem: (id: string, line: CartLine, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
  quantityOf: (id: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item, quantity = 1) =>
    set(state => {
      const existing = state.items.find(i => i.id === item.id);
      return {
        items: existing
          ? state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...state.items, { ...item, quantity }],
      };
    }),

  decrementItem: id =>
    set(state => ({
      items: state.items
        .map(i => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter(i => i.quantity > 0),
    })),

  removeItem: id =>
    set(state => ({ items: state.items.filter(i => i.id !== id) })),

  restoreItem: (item, index) =>
    set(state => {
      if (state.items.some(i => i.id === item.id)) {
        return {
          items: state.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          ),
        };
      }
      const items = [...state.items];
      items.splice(Math.min(index, items.length), 0, item);
      return { items };
    }),

  replaceItem: (id, line, quantity) =>
    set(state => {
      const index = state.items.findIndex(i => i.id === id);
      const rest = state.items.filter(i => i.id !== id);
      if (line.id !== id && rest.some(i => i.id === line.id)) {
        return {
          items: rest.map(i =>
            i.id === line.id ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      rest.splice(index === -1 ? rest.length : index, 0, {
        ...line,
        quantity,
      });
      return { items: rest };
    }),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),

  totalAmount: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),

  quantityOf: id => get().items.find(i => i.id === id)?.quantity ?? 0,
}));
