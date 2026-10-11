import { create } from 'zustand';
import type { OrderMode } from '@/types/checkout.types';
import { DEFAULT_COUPON, DEFAULT_TIP } from '@/data/checkout';

/** A preset tip in rupees (0 for none), or the customer's own figure. */
export type TipChoice = number | 'custom';

/**
 * The choices made on the Cart screen around its lines — mode, coupon, tip and
 * a note for the kitchen. Kept here rather than in the screen so a trip back to
 * the menu for one more dish does not reset them. In memory, like the cart.
 */
interface CheckoutState {
  mode: OrderMode;
  /** The coupon chosen. It is priced only while the cart qualifies for it. */
  coupon: string | null;
  tipChoice: TipChoice;
  /** The amount behind the Custom chip, kept when another chip is picked. */
  customTip: number;
  instructions: string;
  setMode: (mode: OrderMode) => void;
  setCoupon: (code: string | null) => void;
  setTipChoice: (choice: TipChoice) => void;
  setCustomTip: (amount: number) => void;
  setInstructions: (text: string) => void;
  reset: () => void;
}

const INITIAL = {
  mode: 'delivery' as OrderMode,
  coupon: DEFAULT_COUPON as string | null,
  tipChoice: DEFAULT_TIP as TipChoice,
  customTip: 0,
  instructions: '',
};

export const useCheckoutStore = create<CheckoutState>(set => ({
  ...INITIAL,
  setMode: mode => set({ mode }),
  setCoupon: coupon => set({ coupon }),
  setTipChoice: tipChoice => set({ tipChoice }),
  setCustomTip: customTip => set({ customTip }),
  setInstructions: instructions => set({ instructions }),
  reset: () => set(INITIAL),
}));
