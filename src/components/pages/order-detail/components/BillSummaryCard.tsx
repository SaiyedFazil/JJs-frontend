import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { inr } from '@/data/orders';
import type { OrderBill } from '@/types/order.types';
import { ReceiptCard } from './ReceiptCard';

/** One label/amount row. A discount row reads in veg green with a leading − . */
const BillRow = ({
  label,
  amount,
  discount = false,
}: {
  label: string;
  amount: string;
  discount?: boolean;
}) => (
  <View className="flex-row items-center justify-between py-xs">
    <Text
      variant="fine"
      tone={discount ? 'veg' : 'ink'}
      weight={discount ? '700' : '600'}
    >
      {label}
    </Text>
    <Text
      variant="fine"
      tone={discount ? 'veg' : 'ink'}
      weight={discount ? '700' : '600'}
    >
      {amount}
    </Text>
  </View>
);

/**
 * The priced breakdown. Item total, the coupon discount (when one applied, in
 * green), the taxes and fees, an optional rider tip, then a dashed rule and the
 * grand total. Every figure comes straight from the order's bill.
 */
export const BillSummaryCard = ({ bill }: { bill: OrderBill }) => (
  <ReceiptCard label="Bill summary" className="px-md">
    <BillRow label="Item total" amount={inr(bill.itemTotal)} />
    {bill.coupon && bill.discount ? (
      <BillRow
        label={`Coupon (${bill.coupon})`}
        amount={`− ${inr(bill.discount)}`}
        discount
      />
    ) : null}
    <BillRow label="GST & taxes" amount={inr(bill.gst)} />
    <BillRow label="Delivery fee" amount={inr(bill.deliveryFee)} />
    <BillRow label="Packaging" amount={inr(bill.packaging)} />
    {bill.tip != null ? (
      <BillRow label="Rider tip" amount={inr(bill.tip)} />
    ) : null}

    <View className="mt-sm flex-row items-center justify-between border-t border-dashed border-receipt-dash pt-sm">
      <Text variant="item" tone="ink" weight="800">
        Grand total
      </Text>
      <Text variant="title" tone="ink" weight="800">
        {inr(bill.grandTotal)}
      </Text>
    </View>
  </ReceiptCard>
);
