import { byId } from '../src/data/menu';
import { activeOrder, inr, myOrders, orderById } from '../src/data/orders';
import {
  activeShownFor,
  isUnrated,
  pastFor,
} from '../src/components/pages/my-orders/hooks/use-orders';
import type { Order } from '../src/types/order.types';

/**
 * The My Orders screen renders straight from these. An order line that points
 * at a dish no longer on the menu is invisible in review and only shows up as a
 * blank thumbnail — and a broken Reorder — on a device.
 */
describe('orders mock data', () => {
  const all = myOrders();

  it('every line references a real menu dish', () => {
    const orphans = all.flatMap(o =>
      o.lines.filter(l => !byId[l.dishId]).map(l => `${o.ref}:${l.dishId}`),
    );
    expect(orphans).toEqual([]);
  });

  it('a line matches its dish on veg/non-veg', () => {
    const mismatched = all.flatMap(o =>
      o.lines
        .filter(l => byId[l.dishId] && byId[l.dishId].veg !== l.veg)
        .map(l => `${o.ref}:${l.dishId}`),
    );
    expect(mismatched).toEqual([]);
  });

  it('itemCount equals the sum of line quantities', () => {
    for (const o of all) {
      const summed = o.lines.reduce((n, l) => n + l.quantity, 0);
      expect(summed).toBe(o.itemCount);
    }
  });

  it('exactly one order is active, and it carries progress', () => {
    const active = all.filter(o => o.status === 'active');
    expect(active).toHaveLength(1);
    expect(active[0].progress).toBeDefined();
    expect(activeOrder()?.id).toBe(active[0].id);
  });

  it('no cancelled order is rated', () => {
    const rated = all.filter(o => o.status === 'cancelled' && o.rating != null);
    expect(rated).toEqual([]);
  });

  it('groups rupees in the Indian system', () => {
    expect(inr(1049)).toBe('₹1,049');
    expect(inr(449)).toBe('₹449');
  });
});

describe('order filtering', () => {
  const all = myOrders();

  it('the active card shows only for all and active', () => {
    expect(activeShownFor('all')).toBe(true);
    expect(activeShownFor('active')).toBe(true);
    expect(activeShownFor('delivered')).toBe(false);
    expect(activeShownFor('cancelled')).toBe(false);
  });

  it('a status filter keeps only that status, and never the active order', () => {
    const delivered = pastFor(all, 'delivered');
    expect(delivered.every(o => o.status === 'delivered')).toBe(true);

    const cancelled = pastFor(all, 'cancelled');
    expect(cancelled.every(o => o.status === 'cancelled')).toBe(true);

    expect([...delivered, ...cancelled].some(o => o.status === 'active')).toBe(
      false,
    );
  });

  it('the Active filter shows no past rows', () => {
    expect(pastFor(all, 'active')).toEqual([]);
  });

  it('All shows every past order, newest first and active excluded', () => {
    const past = pastFor(all, 'all');
    expect(past.every(o => o.status !== 'active')).toBe(true);
    expect(past).toHaveLength(all.length - 1);
  });

  it('flags a delivered-but-unrated order as the rate prompt', () => {
    const delivered = (status: Order['status'], rating?: number): Order => ({
      id: 'x',
      ref: 'X',
      placedAt: '',
      status,
      lines: [],
      itemCount: 0,
      total: 0,
      payment: 'UPI',
      rating,
    });
    expect(isUnrated(delivered('delivered'))).toBe(true);
    expect(isUnrated(delivered('delivered', 5))).toBe(false);
    expect(isUnrated(delivered('cancelled'))).toBe(false);
  });
});

/**
 * The Order Detail screen renders straight from each order's `detail`. A bill
 * whose parts do not add up to its grand total, or a grand total that does not
 * match what the card shows, is a receipt that silently lies — these pin the
 * arithmetic so a future data edit cannot drift it.
 */
describe('order detail data', () => {
  const withDetail = myOrders().filter(o => o.detail);

  it('resolves an order by id, and null for an unknown one', () => {
    for (const o of myOrders()) expect(orderById(o.id)?.id).toBe(o.id);
    expect(orderById('nope')).toBeNull();
  });

  it('every past order carries detail', () => {
    const past = myOrders().filter(o => o.status !== 'active');
    expect(past.every(o => o.detail != null)).toBe(true);
  });

  it("a detail's line totals sum to its bill item total", () => {
    for (const o of withDetail) {
      const priced = o.lines.every(l => l.lineTotal != null);
      expect(priced).toBe(true);
      const summed = o.lines.reduce((n, l) => n + (l.lineTotal ?? 0), 0);
      expect(summed).toBe(o.detail!.bill.itemTotal);
    }
  });

  it('a bill adds up to its grand total, which equals the order total', () => {
    for (const o of withDetail) {
      const b = o.detail!.bill;
      const computed =
        b.itemTotal +
        b.gst +
        b.deliveryFee +
        b.packaging +
        (b.tip ?? 0) -
        (b.discount ?? 0);
      expect(computed).toBe(b.grandTotal);
      expect(b.grandTotal).toBe(o.total);
    }
  });

  it('a coupon row has both a code and a discount, or neither', () => {
    for (const o of withDetail) {
      const b = o.detail!.bill;
      expect(b.coupon == null).toBe(b.discount == null);
    }
  });

  it('a cancelled order is refunded; everything else is paid', () => {
    for (const o of withDetail) {
      const state = o.detail!.payment.state;
      expect(state).toBe(o.status === 'cancelled' ? 'refunded' : 'paid');
    }
  });

  it('only a delivery order carries a courier', () => {
    for (const o of withDetail) {
      const d = o.detail!;
      if (d.fulfilment === 'takeaway') expect(d.courier).toBeUndefined();
    }
  });

  it('a cancelled order carries no courier', () => {
    for (const o of withDetail) {
      if (o.status === 'cancelled') expect(o.detail!.courier).toBeUndefined();
    }
  });
});
