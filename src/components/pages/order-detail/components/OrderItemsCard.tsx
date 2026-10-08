import React from 'react';
import { View } from 'react-native';
import { Text, VegBadge } from '@/components/ui';
import { inr } from '@/data/orders';
import type { OrderLine } from '@/types/order.types';
import { ReceiptCard } from './ReceiptCard';

/**
 * The ordered lines, receipt-style: each row leads with the veg/non-veg mark,
 * then the quantity, the dish name and any customisation, and the line total
 * on the right. Rows are fenced by hairlines, the last one flush.
 *
 * A line with no `lineTotal` (a thin order from before pricing was captured)
 * simply shows no price — the row still reads.
 */
export const OrderItemsCard = ({ lines }: { lines: OrderLine[] }) => (
  <ReceiptCard label={`${lines.length} items`}>
    {lines.map((line, i) => (
      <View
        key={`${line.dishId}-${i}`}
        className={`flex-row gap-sm py-sm ${
          i === lines.length - 1 ? '' : 'border-b border-row-divider'
        }`}
      >
        <View className="mt-px">
          <VegBadge isVeg={line.veg} size={18} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-baseline gap-xs">
            <Text variant="micro" tone="muted" weight="700">
              {`${line.quantity}×`}
            </Text>
            <Text variant="fine" tone="ink" weight="700" className="flex-1">
              {line.name}
            </Text>
          </View>
          {line.customisations ? (
            <Text variant="micro" tone="label" weight="500" className="mt-xs">
              {line.customisations}
            </Text>
          ) : null}
        </View>

        {line.lineTotal != null ? (
          <Text variant="fine" tone="ink" weight="800">
            {inr(line.lineTotal)}
          </Text>
        ) : null}
      </View>
    ))}
  </ReceiptCard>
);
