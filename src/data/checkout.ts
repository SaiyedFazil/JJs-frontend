/**
 * Mock checkout terms standing in for the API — the Cart screen
 * (spec: Cart.dc.html).
 *
 * The cart prices itself from these: CHARGES, MIN_DELIVERY_ORDER, OFFERS,
 * TIP_PRESETS, MODE_DETAILS and upsells(). Preserve those signatures when you
 * swap the body. Once the server quotes the bill, the Cart's priceCart() turns
 * into a display of that quote rather than the arithmetic itself.
 */
import type { MenuItem } from '@/types/menu.types';
import type { ModeDetails, Offer, OrderMode } from '@/types/checkout.types';
import { byId } from './menu';
import { SERVICE } from './restaurant';

/** Taxes and fees on top of the items. */
export const CHARGES = {
  /** GST on the item total, before any discount. */
  gstRate: 0.05,
  deliveryFee: 40,
  /** Delivery and takeaway boxes; dine-in has none. */
  packaging: 20,
} as const;

/** A delivery order below this item total cannot be placed. */
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

/** The ETA strip and details card, per mode. */
export const MODE_DETAILS: Record<OrderMode, ModeDetails> = {
  delivery: {
    etaIcon: '\u{1F6F5}',
    etaTitle: `Delivery in ~${SERVICE.etaMinutes} min`,
    etaNote: `To Navrangpura · ${SERVICE.distanceKm} km away`,
    placeIcon: '\u{1F4CD}',
    placeTitle: 'Delivering to Home',
    placeNote: '351 Maison Street, Navrangpura, Ahmedabad 380001',
    canChangePlace: true,
  },
  takeaway: {
    etaIcon: '\u{1F961}',
    etaTitle: 'Ready for pickup in ~20 min',
    etaNote: 'We’ll notify you when it’s packed',
    placeIcon: '\u{1F961}',
    placeTitle: 'Pickup from JJ’s Kitchen',
    placeNote: 'Shop 4, Linking Road · ready in ~20 min',
    canChangePlace: false,
  },
  dinein: {
    etaIcon: '\u{1F37D}\u{FE0F}',
    etaTitle: 'Table booked for 8:30 PM',
    etaNote: 'Arrive 10 min early to be seated',
    placeIcon: '\u{1F37D}\u{FE0F}',
    placeTitle: 'Dine-in · Table for 2',
    placeNote: 'Today 8:30 PM · JJ’s Kitchen, Linking Road',
    canChangePlace: false,
  },
};

/** The "Complete your meal" rail: a drink, a bread and a salad. */
const UPSELL_IDS = ['sosyo', 'butter-garlic-naan', 'green-salad'];

export const upsells = (): MenuItem[] =>
  UPSELL_IDS.map(id => byId[id]).filter((d): d is MenuItem => d != null);
