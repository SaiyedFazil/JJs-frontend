/**
 * Mock checkout terms standing in for the API — the Cart screen
 * (spec: Cart.dc.html).
 *
 * The cart prices itself from these: CHARGES, MIN_DELIVERY_ORDER, OFFERS,
 * TIP_PRESETS and DELIVERY. Preserve those signatures when you swap the body.
 * Once the server quotes the bill, the Cart's priceCart() turns into a
 * display of that quote rather than the arithmetic itself.
 */
import type { DeliveryDetails, Offer } from '@/types/checkout.types';
import { SERVICE } from './restaurant';

/** Taxes and fees on top of the items. */
export const CHARGES = {
  /** GST on the item total, before any discount. */
  gstRate: 0.05,
  deliveryFee: 40,
  packaging: 20,
} as const;

/** An order below this item total cannot be placed. */
export const MIN_DELIVERY_ORDER = 199;

/** The rider-tip chips, in rupees. The fourth chip is "Custom". */
export const TIP_PRESETS = [20, 30, 50] as const;

/** The tip a fresh cart starts on — the design's default selection. */
export const DEFAULT_TIP = 20;

/** The most a custom tip can be. */
export const MAX_TIP = 500;

/** The offers sheet, best first — the first is what "Apply coupon" names. */
export const OFFERS: Offer[] = [
  {
    code: 'JJ100',
    description: '₹100 off on orders above ₹599',
    icon: '\u{1F389}',
    rule: { kind: 'flat', amount: 100, minItemTotal: 599 },
  },
  {
    code: 'WELCOME15',
    description: '15% off up to ₹120 · first order',
    icon: '\u{1F525}',
    rule: { kind: 'percent', percent: 15, cap: 120 },
  },
  {
    code: 'FREEDEL',
    description: 'Free delivery on this order',
    icon: '\u{1F6F5}',
    rule: { kind: 'free-delivery' },
  },
];

/** The coupon a fresh cart starts on, applied for the customer. */
export const DEFAULT_COUPON = OFFERS[0].code;

/** The delivery card at the top of the cart: the saved address, and the ETA. */
export const DELIVERY: DeliveryDetails = {
  label: 'Home',
  address: '351 Maison Street, Navrangpura, Ahmedabad 380001',
  eta: `Arrives in ~${SERVICE.etaMinutes} min`,
  distance: `${SERVICE.distanceKm} km away`,
};
