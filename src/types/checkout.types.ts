/**
 * Checkout types — the Cart screen (spec: Cart.dc.html).
 *
 * The cart's lines live in cart.store; these describe everything priced or
 * chosen around them: how the food reaches the customer, the offers on the
 * table, and the bill those add up to.
 */

/** How the order reaches the customer. Only delivery has a rider to tip. */
export type OrderMode = 'delivery' | 'takeaway' | 'dinein';

/** What an offer takes off, and on what condition. */
export type OfferRule =
  /** A fixed amount off once the items reach `minItemTotal`. */
  | { kind: 'flat'; amount: number; minItemTotal: number }
  /** A share of the items, never more than `cap`. */
  | { kind: 'percent'; percent: number; cap: number }
  /** Waives the delivery fee — so it means nothing for takeaway or dine-in. */
  | { kind: 'free-delivery' };

export interface Offer {
  /** What the customer types or taps — "JJ100". */
  code: string;
  /** Display-ready — "₹100 off on orders above ₹599". */
  description: string;
  /** An emoji for the offer's tile. */
  icon: string;
  rule: OfferRule;
}

/**
 * Where and when, for one mode: the ETA strip at the top of the cart and the
 * details card at the bottom. Display-ready copy.
 */
export interface ModeDetails {
  etaIcon: string;
  etaTitle: string;
  etaNote: string;
  placeIcon: string;
  placeTitle: string;
  placeNote: string;
  /** A delivery address can be changed; a pickup counter or a booked table cannot. */
  canChangePlace: boolean;
}

/** The bill the cart quotes. Every figure is in rupees. */
export interface CartBill {
  itemTotal: number;
  gst: number;
  /** Delivery orders only; 0 otherwise, and 0 when an offer waived it. */
  deliveryFee: number;
  /** The fee was waived by an offer — the row reads FREE rather than vanishing. */
  deliveryWaived: boolean;
  /** Delivery and takeaway; dine-in is served on plates. */
  packaging: number;
  /** What the coupon in effect took off the items. */
  discount: number;
  /** The rider tip actually charged — delivery orders only. */
  tip: number;
  grandTotal: number;
  /** The discount plus any waived delivery fee: the "You saved" figure. */
  savings: number;
  /**
   * The coupon in effect: the one the customer chose, if this cart qualifies
   * for it right now. A chosen coupon the cart has dropped below stays chosen
   * and comes back into effect once the cart qualifies again.
   */
  appliedCoupon: string | null;
  /** How far a delivery order is below the minimum; 0 when it can be placed. */
  shortfall: number;
}
