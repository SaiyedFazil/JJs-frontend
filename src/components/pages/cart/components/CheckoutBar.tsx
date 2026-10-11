import React from 'react';
import { TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { ArrowRight, CircleAlert } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import { MIN_DELIVERY_ORDER } from '@/data/checkout';
import { inr } from '@/data/orders';
import type { CartBill } from '@/types/checkout.types';

/**
 * The sticky footer: the grand total beside Proceed to Pay. A delivery order
 * under the minimum gets a red note above, and the button goes dead — the
 * same sand-and-label treatment as a sold-out dish's bar. The bar owns the
 * bottom safe-area inset so the button never sits under the home indicator.
 */
export const CheckoutBar = ({
  bill,
  bottomInset,
  onPay,
  onLayout,
}: {
  bill: CartBill;
  bottomInset: number;
  onPay: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) => {
  const canPay = bill.shortfall === 0;

  return (
    <View
      onLayout={onLayout}
      // Layout-only: the gesture-bar inset is a runtime value.
      style={{ paddingBottom: bottomInset + 16 }}
      className="border-t border-card-hairline bg-surface px-4 pt-3 shadow-e3"
    >
      {canPay ? null : (
        <View className="mb-2.5 flex-row items-center gap-2 rounded-md bg-tile-chili px-3 py-2">
          <Icon
            icon={CircleAlert}
            className="text-chili"
            size={14}
            strokeWidth={2.2}
          />
          <Text variant="micro" tone="chili" weight="700" className="flex-1">
            {`Add ${inr(bill.shortfall)} more to place your delivery order`}
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-3">
        <View>
          <Text variant="title" weight="800">
            {inr(bill.grandTotal)}
          </Text>
          <Text variant="micro" tone="label" weight="600">
            {canPay ? 'Grand total' : `Minimum ${inr(MIN_DELIVERY_ORDER)}`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPay}
          disabled={!canPay}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={
            canPay
              ? `Proceed to pay ${inr(bill.grandTotal)}`
              : 'Add more items to place a delivery order'
          }
          accessibilityState={{ disabled: !canPay }}
          className={`h-13 flex-1 flex-row items-center justify-center gap-2 rounded-lg ${
            canPay ? 'bg-ember shadow-ember-glow' : 'bg-sunken'
          }`}
        >
          <Text
            variant="body"
            weight="800"
            tone={canPay ? 'on-ember' : 'label'}
          >
            {canPay ? 'Proceed to Pay' : 'Add more items'}
          </Text>
          {canPay ? (
            <Icon
              icon={ArrowRight}
              className="text-on-ember"
              size={17}
              strokeWidth={2.4}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};
