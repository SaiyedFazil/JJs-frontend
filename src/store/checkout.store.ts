import { create } from 'zustand';
import { DEFAULT_COUPON, DEFAULT_TIP } from '@/data/checkout';

/** A preset tip in rupees (0 for none), or the customer's own figure. */
export type TipChoice = number | 'custom';

/**
 * The choices made on the Cart screen around its lines — the coupon and the
 * rider tip. Kept here rather than in the screen so a trip back to the menu
 * for one more dish does not reset them. In memory, like the cart.
 */
interface CheckoutState {
  /** The coupon chosen. It is priced only while the cart qualifies for it. */
  coupon: string | null;
  tipChoice: TipChoice;
  /** The amount behind the Custom chip, kept when another chip is picked. */
  customTip: number;
  setCoupon: (code: string | null) => void;
  setTipChoice: (choice: TipChoice) => void;
  setCustomTip: (amount: number) => void;
  reset: () => void;
}

const INITIAL = {
  coupon: DEFAULT_COUPON as string | null,
  tipChoice: DEFAULT_TIP as TipChoice,
  customTip: 0,
};

export const useCheckoutStore = create<CheckoutState>(set => ({
  ...INITIAL,
  setCoupon: coupon => set({ coupon }),
  setTipChoice: tipChoice => set({ tipChoice }),
  setCustomTip: customTip => set({ customTip }),
  reset: () => set(INITIAL),
}));
