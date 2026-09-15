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
