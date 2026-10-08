import { useMemo } from 'react';
import type { Order, OrderFilter } from '@/types/order.types';
import { activeOrder, myOrders } from '@/data/orders';

/**
 * The filter pills, in bar order. 'all' shows the active order plus every past
 * order; the rest narrow to one status. 'active' shows only the pinned card.
 */
export const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

/** The uppercase heading over the past list, per filter. */
const PAST_HEADING: Record<OrderFilter, string> = {
  all: 'PAST ORDERS',
  active: 'PAST ORDERS',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

/** A delivered order the customer has not rated yet — the prompt's condition. */
export const isUnrated = (order: Order): boolean =>
  order.status === 'delivered' && order.rating == null;

/** Which past orders a filter keeps. 'active' keeps none (it hides the list). */
export const pastFor = (orders: Order[], filter: OrderFilter): Order[] => {
  const past = orders.filter(o => o.status !== 'active');
  switch (filter) {
    case 'delivered':
      return past.filter(o => o.status === 'delivered');
    case 'cancelled':
      return past.filter(o => o.status === 'cancelled');
    case 'active':
      return [];
    default:
      return past;
  }
};

/** The active card shows for 'all' and 'active'; a status filter hides it. */
export const activeShownFor = (filter: OrderFilter): boolean =>
  filter === 'all' || filter === 'active';

export interface OrdersView {
  /** The pinned order, or null — present only when the filter shows it. */
  active: Order | null;
  past: Order[];
  pastHeading: string;
  /** No active card and no past rows survived the filter. */
  isEmptyInFilter: boolean;
}

/**
 * The My Orders view model: the active order (when the filter shows it) and the
 * past orders that survive the filter, plus the two flags the screen branches
 * on. `ratings` overrides the stored rating so a just-rated order updates
 * without touching the mock — the seam the API's optimistic update will use.
 *
 * Mock-only in the same sense as the Menu: the orders come from
 * src/data/orders.ts, which is where the API swap lands.
 */
export const useOrders = (
  filter: OrderFilter,
  ratings: Record<string, number>,
): OrdersView =>
  useMemo(() => {
    const withRatings = myOrders().map(o =>
      ratings[o.id] != null ? { ...o, rating: ratings[o.id] } : o,
    );

    const rawActive = activeOrder();
    const active =
      rawActive && activeShownFor(filter)
        ? (withRatings.find(o => o.id === rawActive.id) ?? rawActive)
        : null;

    const past = pastFor(withRatings, filter);

    return {
      active,
      past,
      pastHeading: PAST_HEADING[filter],
      isEmptyInFilter: !active && past.length === 0,
    };
  }, [filter, ratings]);
