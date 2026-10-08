/**
 * Mock order history standing in for the API — the My Orders screen
 * (spec: My Orders.dc.html).
 *
 * myOrders(), activeOrder() and inr() are the contract for API integration:
 * preserve these signatures when you swap the body. Each line's `dishId` is a
 * real menu id (src/data/menu.ts), which is the seam that makes Reorder add the
 * same dishes back to the cart and gives every thumbnail its cuisine tint.
 */
import type { Order } from '@/types/order.types';

/** "₹1,049" — grouped in the Indian system, like the design. */
export const inr = (n: number): string => `₹${n.toLocaleString('en-IN')}`;

/**
 * The one order in progress, pinned above the history. A single active order is
 * the design's model — there is no list of them.
 */
const ACTIVE: Order = {
  id: 'o1',
  ref: 'JJ2481',
  placedAt: 'Today, 7:58 PM',
  status: 'active',
  lines: [
    {
      dishId: 'tandoori-chicken',
      name: 'Tandoori Chicken (Half)',
      veg: false,
      quantity: 1,
    },
    { dishId: 'butter-naan', name: 'Butter Naan', veg: true, quantity: 2 },
  ],
  itemCount: 3,
  total: 1049,
  payment: 'UPI',
  progress: {
    stage: 'On the way',
    etaLabel: 'Arriving in ~25 min',
    fraction: 0.68,
  },
};

/**
 * Past orders, newest first. `rating` present means the customer has already
 * rated it; a delivered order with none shows the "Rate this order" prompt. A
 * cancelled order is never rated and shows its refund line instead.
 */
const PAST: Order[] = [
  {
    id: 'o2',
    ref: 'JJ2478',
    placedAt: '26 Aug, 8:42 PM',
    status: 'delivered',
    lines: [
      {
        dishId: 'butter-chicken',
        name: 'Butter Chicken',
        veg: false,
        quantity: 1,
        lineTotal: 499,
        customisations: 'Boneless · Medium spice',
      },
      {
        dishId: 'chicken-sizzler',
        name: 'Chicken Sizzler',
        veg: false,
        quantity: 1,
        lineTotal: 799,
        customisations: 'Extra house sauce',
      },
      {
        dishId: 'gulab-jamun',
        name: 'Gulab Jamun',
        veg: true,
        quantity: 1,
        lineTotal: 99,
      },
    ],
    itemCount: 3,
    total: 1397,
    payment: 'UPI',
    rating: 5,
    detail: {
      fulfilment: 'delivery',
      statusNote: 'Delivered on 26 Aug, 8:42 PM · in 38 min',
      bill: {
        itemTotal: 1397,
        coupon: 'WELCOME15',
        discount: 130,
        gst: 70,
        deliveryFee: 40,
        packaging: 20,
        grandTotal: 1397,
      },
      payment: {
        method: 'Paid via UPI',
        detail: 'Google Pay · ₹…8842',
        state: 'paid',
      },
      addressLabel: 'Home',
      address: '351 Maison Street, Navrangpura, Ahmedabad 380001',
      courier: { name: 'Rahul K.', rating: 4.9, note: 'on time' },
    },
  },
  {
    id: 'o3',
    ref: 'JJ2402',
    placedAt: '19 Aug, 9:10 PM',
    status: 'delivered',
    lines: [
      {
        dishId: 'mutton-burrah',
        name: 'Mutton Burrah',
        veg: false,
        quantity: 1,
        lineTotal: 799,
        customisations: 'Spicy',
      },
      {
        dishId: 'butter-garlic-naan',
        name: 'Butter Garlic Naan',
        veg: true,
        quantity: 3,
        lineTotal: 270,
      },
    ],
    itemCount: 4,
    total: 1069,
    payment: 'Card',
    // Delivered but unrated — the "Rate this order" prompt. A takeaway order,
    // so the detail screen shows "Picked up" and the pickup card (no rider).
    detail: {
      fulfilment: 'takeaway',
      statusNote: 'Collected on 19 Aug, 9:10 PM · Takeaway',
      bill: {
        itemTotal: 1069,
        gst: 53,
        deliveryFee: 0,
        packaging: 20,
        grandTotal: 1069,
        // 1069 + 53 + 0 + 20 − 73 = 1069
        coupon: 'FLAT73',
        discount: 73,
      },
      payment: {
        method: 'Paid via Card',
        detail: 'HDFC Credit · ₹…4421',
        state: 'paid',
      },
      addressLabel: 'Picked up from JJ’s Kitchen',
      address: 'Shop 4, Linking Road, Bandra West · Token #42',
    },
  },
  {
    id: 'o4',
    ref: 'JJ2361',
    placedAt: '12 Aug, 1:20 PM',
    status: 'cancelled',
    lines: [
      {
        dishId: 'chicken-lollipop',
        name: 'Chicken Lollipop',
        veg: false,
        quantity: 1,
        lineTotal: 329,
      },
      {
        dishId: 'veg-hakka-noodles',
        name: 'Veg Hakka Noodles',
        veg: true,
        quantity: 1,
        lineTotal: 249,
      },
    ],
    itemCount: 2,
    total: 578,
    payment: 'UPI',
    detail: {
      fulfilment: 'delivery',
      statusNote: 'Cancelled on 12 Aug, 1:34 PM · Restaurant was too busy',
      // A cancelled order charges no fees; the receipt shows the item total
      // that was authorised and then refunded in full.
      bill: {
        itemTotal: 578,
        gst: 0,
        deliveryFee: 0,
        packaging: 0,
        grandTotal: 578,
      },
      payment: {
        method: 'Refunded to UPI',
        detail: 'Original payment · GPay',
        state: 'refunded',
      },
      addressLabel: 'Home',
      address: '351 Maison Street, Navrangpura, Ahmedabad 380001',
    },
  },
  {
    id: 'o5',
    ref: 'JJ2299',
    placedAt: '5 Aug, 8:05 PM',
    status: 'delivered',
    lines: [
      {
        dishId: 'paneer-butter-masala',
        name: 'Paneer Butter Masala',
        veg: true,
        quantity: 1,
        lineTotal: 349,
      },
      {
        dishId: 'tawa-roti',
        name: 'Tawa Roti',
        veg: true,
        quantity: 4,
        lineTotal: 100,
      },
    ],
    itemCount: 5,
    total: 449,
    payment: 'UPI',
    rating: 4,
    detail: {
      fulfilment: 'delivery',
      statusNote: 'Delivered on 5 Aug, 8:05 PM · in 31 min',
      bill: {
        itemTotal: 449,
        gst: 22,
        deliveryFee: 0,
        packaging: 20,
        grandTotal: 449,
        // 449 + 22 + 0 + 20 − 42 = 449
        coupon: 'FREESHIP',
        discount: 42,
      },
      payment: {
        method: 'Paid via UPI',
        detail: 'PhonePe · ₹…3310',
        state: 'paid',
      },
      addressLabel: 'Home',
      address: '351 Maison Street, Navrangpura, Ahmedabad 380001',
      courier: { name: 'Imran S.', rating: 4.8, note: 'on time' },
    },
  },
];

/** The active order, or null when nothing is in progress. */
export const activeOrder = (): Order | null => ACTIVE;

/** Every order, active first then past, newest first within past. */
export const myOrders = (): Order[] => [ACTIVE, ...PAST];

/**
 * One order by id, or null — how the Order Detail screen resolves its route's
 * `orderId`. Part of the API contract alongside myOrders()/activeOrder():
 * preserve this signature when the backend replaces the mock.
 */
export const orderById = (id: string): Order | null =>
  myOrders().find(o => o.id === id) ?? null;
