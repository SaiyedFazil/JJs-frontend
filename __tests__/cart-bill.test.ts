import {
  offerBlocker,
  priceCart,
  tipAmount,
} from '../src/components/pages/cart/hooks/use-cart-bill';
import {
  DEFAULT_COUPON,
  MODE_DETAILS,
  OFFERS,
  upsells,
} from '../src/data/checkout';

const offer = (code: string) => OFFERS.find(o => o.code === code)!;

/**
 * The cart's bill is money on a screen: a fee that leaks into the wrong mode
 * or a coupon that applies when it should not is a wrong charge, not a
 * cosmetic bug. These pin the rules the Cart design states.
 */
describe('priceCart', () => {
  it('prices the design’s default delivery cart', () => {
    // Tandoori Chicken (Half) 279 + Butter Chicken 499 + 2 × Butter Naan 80
    // + Gulab Jamun 99, with JJ100 and a ₹20 tip.
    const bill = priceCart({
      itemTotal: 1037,
      mode: 'delivery',
      coupon: 'JJ100',
      tip: 20,
    });
    expect(bill).toMatchObject({
      itemTotal: 1037,
      gst: 52,
      deliveryFee: 40,
      packaging: 20,
      discount: 100,
      tip: 20,
      grandTotal: 1037 + 52 + 40 + 20 - 100 + 20,
      savings: 100,
      appliedCoupon: 'JJ100',
      shortfall: 0,
    });
  });

  it('drops delivery and the tip for takeaway, and packaging too for dine-in', () => {
    const takeaway = priceCart({
      itemTotal: 1000,
      mode: 'takeaway',
      coupon: null,
      tip: 50,
    });
    expect(takeaway).toMatchObject({ deliveryFee: 0, packaging: 20, tip: 0 });
    expect(takeaway.grandTotal).toBe(1000 + 50 + 20);

    const dinein = priceCart({
      itemTotal: 1000,
      mode: 'dinein',
      coupon: null,
      tip: 50,
    });
    expect(dinein).toMatchObject({ deliveryFee: 0, packaging: 0, tip: 0 });
    expect(dinein.grandTotal).toBe(1000 + 50);
  });

  it('holds a chosen coupon out of effect while the cart is under its minimum', () => {
    const bill = priceCart({
      itemTotal: 500,
      mode: 'delivery',
      coupon: 'JJ100',
      tip: 0,
    });
    expect(bill.discount).toBe(0);
    expect(bill.appliedCoupon).toBeNull();
  });

  it('caps a percentage offer', () => {
    expect(
      priceCart({
        itemTotal: 400,
        mode: 'takeaway',
        coupon: 'WELCOME15',
        tip: 0,
      }).discount,
    ).toBe(60);
    expect(
      priceCart({
        itemTotal: 2000,
        mode: 'takeaway',
        coupon: 'WELCOME15',
        tip: 0,
      }).discount,
    ).toBe(120);
  });

  it('waives delivery for FREEDEL, as a saving rather than a discount', () => {
    const bill = priceCart({
      itemTotal: 300,
      mode: 'delivery',
      coupon: 'FREEDEL',
      tip: 0,
    });
    expect(bill).toMatchObject({
      deliveryFee: 0,
      deliveryWaived: true,
      discount: 0,
      savings: 40,
      appliedCoupon: 'FREEDEL',
    });
  });

  it('does not apply FREEDEL to an order with no delivery', () => {
    const bill = priceCart({
      itemTotal: 300,
      mode: 'takeaway',
      coupon: 'FREEDEL',
      tip: 0,
    });
    expect(bill.appliedCoupon).toBeNull();
    expect(bill.savings).toBe(0);
  });

  it('reports how far a delivery order is below the minimum', () => {
    expect(
      priceCart({ itemTotal: 99, mode: 'delivery', coupon: null, tip: 0 })
        .shortfall,
    ).toBe(100);
    expect(
      priceCart({ itemTotal: 99, mode: 'takeaway', coupon: null, tip: 0 })
        .shortfall,
    ).toBe(0);
  });

  it('ignores a coupon code that is not on offer', () => {
    const bill = priceCart({
      itemTotal: 1000,
      mode: 'delivery',
      coupon: 'NOPE',
      tip: 0,
    });
    expect(bill.discount).toBe(0);
    expect(bill.appliedCoupon).toBeNull();
  });
});

describe('offerBlocker', () => {
  it('says how much more a minimum-spend offer needs', () => {
    expect(offerBlocker(offer('JJ100'), 479, 'delivery')).toBe(
      'Add ₹120 more to unlock',
    );
    expect(offerBlocker(offer('JJ100'), 599, 'delivery')).toBeNull();
  });

  it('keeps a delivery waiver to delivery orders', () => {
    expect(offerBlocker(offer('FREEDEL'), 300, 'dinein')).not.toBeNull();
    expect(offerBlocker(offer('FREEDEL'), 300, 'delivery')).toBeNull();
  });
});

describe('tipAmount', () => {
  it('reads a preset as itself and Custom as the custom figure', () => {
    expect(tipAmount(30, 75)).toBe(30);
    expect(tipAmount('custom', 75)).toBe(75);
  });
});

describe('checkout data', () => {
  it('has unique offer codes, and the default coupon is one of them', () => {
    const codes = OFFERS.map(o => o.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain(DEFAULT_COUPON);
  });

  it('every upsell id is a real dish', () => {
    expect(upsells().map(d => d.id)).toEqual([
      'sosyo',
      'butter-garlic-naan',
      'green-salad',
    ]);
  });

  it('only delivery has a place the customer can change', () => {
    expect(MODE_DETAILS.delivery.canChangePlace).toBe(true);
    expect(MODE_DETAILS.takeaway.canChangePlace).toBe(false);
    expect(MODE_DETAILS.dinein.canChangePlace).toBe(false);
  });
});
