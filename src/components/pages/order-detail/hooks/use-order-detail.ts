import { useMemo } from 'react';
import type {
  Order,
  OrderBill,
  OrderDetail,
  OrderPayment,
} from '@/types/order.types';

/**
 * Which immersive ground the status header wears. A settled order (delivered
 * or picked up) reads green; a cancelled one reads brown. The hue is the
 * verdict, legible before a word of the subline.
 */
export type StatusTheme = 'settled' | 'void';

/** The resolved, render-ready header for the status band. */
export interface StatusHeader {
  theme: StatusTheme;
  title: string;
  /** The subline — a timestamp, or a cancellation reason. */
  note: string;
}

/**
 * The receipt the Order Detail screen draws, normalised so the screen never
 * branches on whether the mock carried a full `detail`. A thin order (one with
 * no `detail`) still renders a coherent receipt built from its list fields.
 */
export interface OrderReceipt {
  order: Order;
  header: StatusHeader;
  bill: OrderBill;
  payment: OrderPayment;
  fulfilment: OrderDetail['fulfilment'];
  statusNote: string;
  addressLabel: string;
  address: string;
  courier?: OrderDetail['courier'];
  /** A cancelled order: no rating, no reorder-as-"reorder" (it is "order again"). */
  isCancelled: boolean;
  /** True once the order has a rating — the rated confirmation shows. */
  isRated: boolean;
  /** The star value to seed the stars with (the stored or just-left rating). */
  rating: number;
}

/** The header title for each terminal state and fulfilment. */
const titleFor = (
  order: Order,
  fulfilment: OrderDetail['fulfilment'],
): string => {
  if (order.status === 'cancelled') return 'Order cancelled';
  return fulfilment === 'takeaway' ? 'Picked up' : 'Delivered';
};

/**
 * Build a bill from the list fields when the mock carried none — item total
 * from the order's total, no fees broken out. Keeps the screen renderable for
 * any order, including ones added before `detail` existed.
 */
const fallbackBill = (order: Order): OrderBill => ({
  itemTotal: order.total,
  gst: 0,
  deliveryFee: 0,
  packaging: 0,
  grandTotal: order.total,
});

const fallbackPayment = (order: Order): OrderPayment => ({
  method:
    order.status === 'cancelled'
      ? `Refunded to ${order.payment}`
      : `Paid via ${order.payment}`,
  detail: 'Original payment',
  state: order.status === 'cancelled' ? 'refunded' : 'paid',
});

/**
 * The Order Detail view model. `ratingOverride` is this session's just-left
 * rating (keyed by order id in the screen), which wins over the stored one —
 * the seam the API's optimistic update will use, mirroring My Orders.
 *
 * Mock-only in the same sense as the rest: the order comes from
 * src/data/orders.ts via the screen; here we only normalise it.
 */
export const useOrderDetail = (
  order: Order,
  ratingOverride?: number,
): OrderReceipt =>
  useMemo(() => {
    const detail = order.detail;
    const fulfilment = detail?.fulfilment ?? 'delivery';
    const bill = detail?.bill ?? fallbackBill(order);
    const payment = detail?.payment ?? fallbackPayment(order);
    const isCancelled = order.status === 'cancelled';

    const rating = ratingOverride ?? order.rating ?? 0;

    const header: StatusHeader = {
      theme: isCancelled ? 'void' : 'settled',
      title: titleFor(order, fulfilment),
      note:
        detail?.statusNote ??
        (isCancelled ? 'This order was cancelled' : order.placedAt),
    };

    return {
      order,
      header,
      bill,
      payment,
      fulfilment,
      statusNote: header.note,
      addressLabel: detail?.addressLabel ?? 'Delivery address',
      address: detail?.address ?? '',
      courier: detail?.courier,
      isCancelled,
      // A cancelled order is never rated; everything else is rated once rating > 0.
      isRated: !isCancelled && rating > 0,
      rating,
    };
  }, [order, ratingOverride]);
