import { useMemo } from 'react';
import type { CartBill, Offer } from '@/types/checkout.types';
import { CHARGES, MIN_DELIVERY_ORDER, OFFERS } from '@/data/checkout';
import { inr } from '@/data/orders';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore, type TipChoice } from '@/store/checkout.store';

/** The rupees behind a tip choice. */
export const tipAmount = (choice: TipChoice, customTip: number): number =>
  choice === 'custom' ? customTip : choice;

/**
 * Why `offer` cannot apply to this cart right now — display-ready, for the
 * offers sheet — or null when it can.
 */
export const offerBlocker = (
  offer: Offer,
  itemTotal: number,
): string | null => {
  const { rule } = offer;
  switch (rule.kind) {
    case 'flat':
      return itemTotal >= rule.minItemTotal
        ? null
        : `Add ${inr(rule.minItemTotal - itemTotal)} more to unlock`;
    case 'free-delivery':
    case 'percent':
      return null;
  }
};

/** What `offer` takes off the items. Delivery waivers are not a discount. */
const discountOf = (offer: Offer, itemTotal: number): number => {
  const { rule } = offer;
  switch (rule.kind) {
    case 'flat':
      return Math.min(rule.amount, itemTotal);
    case 'percent':
      return Math.min(Math.round((itemTotal * rule.percent) / 100), rule.cap);
    case 'free-delivery':
      return 0;
  }
};

/**
 * The cart's bill. GST is charged on the item total before any discount,
 * then delivery, packaging and the tip are added. A chosen coupon the cart
 * does not qualify for is simply not in effect — it stays chosen, and
 * applies again once it can.
 */
export const priceCart = ({
  itemTotal,
  coupon,
  tip,
}: {
  itemTotal: number;
  coupon: string | null;
  tip: number;
}): CartBill => {
  const chosen = coupon ? OFFERS.find(o => o.code === coupon) : undefined;
  const offer =
    chosen && offerBlocker(chosen, itemTotal) === null ? chosen : undefined;

  const discount = offer ? discountOf(offer, itemTotal) : 0;
  const deliveryWaived = offer?.rule.kind === 'free-delivery';
  const deliveryFee = deliveryWaived ? 0 : CHARGES.deliveryFee;
  const packaging = CHARGES.packaging;
  const gst = Math.round(itemTotal * CHARGES.gstRate);

  return {
    itemTotal,
    gst,
    deliveryFee,
    deliveryWaived,
    packaging,
    discount,
    tip,
    grandTotal: Math.max(
      0,
      itemTotal + gst + deliveryFee + packaging - discount + tip,
    ),
    savings: discount + (deliveryWaived ? CHARGES.deliveryFee : 0),
    appliedCoupon: offer?.code ?? null,
    shortfall: Math.max(0, MIN_DELIVERY_ORDER - itemTotal),
  };
};

/** The live bill for the cart as it stands, priced on every change. */
export const useCartBill = (): CartBill => {
  const itemTotal = useCartStore(s => s.totalAmount());
  const coupon = useCheckoutStore(s => s.coupon);
  const tip = useCheckoutStore(s => tipAmount(s.tipChoice, s.customTip));

  return useMemo(
    () => priceCart({ itemTotal, coupon, tip }),
    [itemTotal, coupon, tip],
  );
};
