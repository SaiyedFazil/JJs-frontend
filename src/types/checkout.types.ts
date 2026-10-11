/**
 * Checkout types — the Cart screen (spec: Cart.dc.html).
 *
 * The cart's lines live in cart.store; these describe everything priced or
 * chosen around them: where the food is going, the offers on the table, and
 * the bill those add up to. Every order is delivered.
 */

/** What an offer takes off, and on what condition. */
export type OfferRule =
  /** A fixed amount off once the items reach `minItemTotal`. */
  | { kind: 'flat'; amount: number; minItemTotal: number }
  /** A share of the items, never more than `cap`. */
  | { kind: 'percent'; percent: number; cap: number }
  /** Waives the delivery fee. */
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
 * Where the order is going and when it should arrive: the delivery card at
 * the top of the cart. Display-ready copy.
 */
export interface DeliveryDetails {
  /** The saved address's name — "Home". */
  label: string;
  address: string;
  /** "Arrives in ~30 min". */
  eta: string;
  /** "2.1 km away". */
  distance: string;
}

/** The bill the cart quotes. Every figure is in rupees. */
export interface CartBill {
  itemTotal: number;
  gst: number;
  /** 0 when an offer waived it. */
  deliveryFee: number;
  /** The fee was waived by an offer — the row reads FREE rather than vanishing. */
  deliveryWaived: boolean;
  packaging: number;
  /** What the coupon in effect took off the items. */
  discount: number;
  /** The rider tip. */
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
  /** How far the order is below the delivery minimum; 0 when it can be placed. */
  shortfall: number;
}
