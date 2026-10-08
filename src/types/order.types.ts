/**
 * Order history types — the My Orders screen (spec: My Orders.dc.html).
 *
 * A single-restaurant history whose one job is to reorder fast, so an order's
 * lines reference real menu dishes by id: that is what lets Reorder drop the
 * same dishes back into the cart, and what gives each thumbnail its cuisine
 * tint and glyph without any order-specific artwork.
 */

/**
 * Where an order is in its life. `active` is the one in progress, pinned at the
 * top with live status; the rest are terminal.
 */
export type OrderStatus = 'active' | 'delivered' | 'cancelled';

/** One dish on an order, enough to re-add it and to draw its thumbnail. */
export interface OrderLine {
  /** A menu dish id (src/data/menu.ts) — how Reorder finds the dish again. */
  dishId: string;
  /** Snapshot of the dish's name as ordered, so history reads right even if the
   *  menu later renames the dish. */
  name: string;
  veg: boolean;
  quantity: number;
  /**
   * Line total (unit price × quantity) in rupees, snapshotted at order time so
   * a later menu re-price never rewrites a settled receipt. Present on the
   * detail view; the list card never prices a line, so it is optional.
   */
  lineTotal?: number;
  /**
   * The customisations chosen for this line, already formatted for display —
   * "Boneless · Medium spice", "Extra house sauce". Absent for a line ordered
   * as-is. The product detail screen is where these get chosen.
   */
  customisations?: string;
}

/** How the order reached the customer. Shapes the status header and the
 *  delivery-vs-pickup card. */
export type Fulfilment = 'delivery' | 'takeaway';

/**
 * The priced breakdown on the receipt. Every figure is in rupees and
 * snapshotted at order time. `coupon`/`discount` and `tip` are present only
 * when they applied.
 */
export interface OrderBill {
  itemTotal: number;
  /** The coupon code applied, e.g. "WELCOME15" — paired with `discount`. */
  coupon?: string;
  /** The rupee value taken off by the coupon. */
  discount?: number;
  gst: number;
  deliveryFee: number;
  packaging: number;
  /** A rider tip, delivery orders only. */
  tip?: number;
  /** The grand total actually charged — equals `total` on the Order. */
  grandTotal: number;
}

/** How the order was settled, for the payment card. */
export interface OrderPayment {
  /** "Paid via UPI", "Refunded to UPI". */
  method: string;
  /** The instrument line — "Google Pay · ₹…8842". */
  detail: string;
  /** A refunded (cancelled) order reads `refunded`; everything else `paid`. */
  state: 'paid' | 'refunded';
}

/** The rider who delivered the order — the delivery card's lower row. */
export interface OrderCourier {
  name: string;
  rating: number;
  /** A short reassurance — "on time". */
  note: string;
}

/**
 * Everything the Order Detail screen shows beyond the list card — the priced
 * bill, how it was paid, where it went and (for delivery) who brought it.
 * Present on a terminal order the detail screen can open; absent orders fall
 * back to a minimal receipt built from the list fields.
 *
 * This is the API seam: when the backend arrives, `orderDetailOf()` maps the
 * wire shape to this, and the screen is unchanged.
 */
export interface OrderDetail {
  fulfilment: Fulfilment;
  /**
   * The header subline — "Delivered on 26 Aug, 8:42 PM · in 38 min",
   * "Cancelled on 26 Aug, 8:15 PM · Restaurant was too busy". Display-ready.
   */
  statusNote: string;
  bill: OrderBill;
  payment: OrderPayment;
  /** A short label for the address card's title — "Home", or the shop name. */
  addressLabel: string;
  /** The full address or pickup line shown beneath the label. */
  address: string;
  /** Present on a delivered order only; pickup and cancelled carry none. */
  courier?: OrderCourier;
}

/** How an order was paid — shown as a line of meta, never actioned. */
export type PaymentMethod = 'UPI' | 'Card' | 'Cash';

/** The live state of the one active order, for the pinned card. */
export interface ActiveOrderProgress {
  /** The headline — "On the way", "Preparing", … */
  stage: string;
  /** "Arriving in ~25 min" and the like. */
  etaLabel: string;
  /** 0–1, how far along the progress bar fills. */
  fraction: number;
}

export interface Order {
  /** Stable id, the key everywhere and what onOpen would address. */
  id: string;
  /** Human reference printed on the card — "JJ2481". */
  ref: string;
  /** Display-ready placement time ("26 Aug, 8:42 PM"). The API sends a stamp. */
  placedAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  /** Total units across every line. */
  itemCount: number;
  /** Amount paid, in rupees. */
  total: number;
  payment: PaymentMethod;
  /**
   * The customer's 1–5 star rating once they have left one. Only a delivered
   * order can be rated; absent means "not rated yet", which is the prompt.
   */
  rating?: number;
  /** Present only on the `active` order. */
  progress?: ActiveOrderProgress;
  /**
   * The receipt-level detail the Order Detail screen renders. Present on the
   * past orders the screen can open; the active order and any thin order fall
   * back to a receipt built from the fields above.
   */
  detail?: OrderDetail;
}

/** The Active / Past segmentation the filter pills select. */
export type OrderFilter = 'all' | 'active' | 'delivered' | 'cancelled';
