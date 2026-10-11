import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import { inr } from '@/data/orders';
import type { CartBill } from '@/types/checkout.types';

/** One label/amount row. A saving reads in veg green. */
const BillRow = ({
  label,
  amount,
  saving = false,
}: {
  label: string;
  amount: string;
  saving?: boolean;
}) => (
  <View className="flex-row items-center justify-between py-1.5">
    <Text
      variant="fine"
      tone={saving ? 'veg' : 'ink-soft'}
      weight={saving ? '700' : '600'}
    >
      {label}
    </Text>
    <Text
      variant="fine"
      tone={saving ? 'veg' : 'ink-soft'}
      weight={saving ? '700' : '600'}
    >
      {amount}
    </Text>
  </View>
);

/**
 * The live bill. The coupon's discount shows in green, the tip only once
 * there is one, and under the grand total a green line totals what the
 * customer saved.
 */
export const BillCard = ({ bill }: { bill: CartBill }) => {
  return (
    <View className="px-4 pt-3.5">
      <View className="rounded-lg border border-card-hairline bg-surface p-4">
        <Text variant="caption" tone="label" weight="800" className="mb-2">
          Bill details
        </Text>

        <BillRow label="Item total" amount={inr(bill.itemTotal)} />
        <BillRow label="GST & taxes" amount={inr(bill.gst)} />
        <BillRow
          label="Delivery fee"
          amount={bill.deliveryWaived ? 'FREE' : inr(bill.deliveryFee)}
        />
        {bill.packaging > 0 ? (
          <BillRow label="Packaging" amount={inr(bill.packaging)} />
        ) : null}
        {bill.discount > 0 && bill.appliedCoupon ? (
          <BillRow
            label={`Coupon ‘${bill.appliedCoupon}’`}
            amount={`− ${inr(bill.discount)}`}
            saving
          />
        ) : null}
        {bill.tip > 0 ? (
          <BillRow label="Delivery tip" amount={inr(bill.tip)} />
        ) : null}

        <View className="mt-2 flex-row items-center justify-between border-t border-dashed border-receipt-dash pt-3">
          <Text variant="item" weight="800">
            Grand total
          </Text>
          <Text variant="title" weight="800">
            {inr(bill.grandTotal)}
          </Text>
        </View>

        {bill.savings > 0 ? (
          <View className="mt-3 flex-row items-center gap-2 rounded-md bg-veg-tint px-3 py-2">
            <Icon
              icon={Check}
              className="text-veg"
              size={15}
              strokeWidth={2.4}
            />
            <Text variant="fine" tone="veg" weight="800">
              {`You saved ${inr(bill.savings)} on this order!`}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};
