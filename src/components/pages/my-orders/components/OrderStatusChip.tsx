import React from 'react';
import { View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import type { OrderStatus } from '@/types/order.types';

/**
 * The small status pill on a past-order card. Delivered reads affirmative in
 * veg green on its tint; cancelled is deliberately neutral (sand, not red) —
 * a cancelled order is a fact, not an error, and the refund line below already
 * carries the reassurance.
 */
const STYLE: Record<
  Exclude<OrderStatus, 'active'>,
  { label: string; ground: string; tone: 'veg' | 'muted'; icon: typeof Check }
> = {
  delivered: {
    label: 'DELIVERED',
    ground: 'bg-veg-tint',
    tone: 'veg',
    icon: Check,
  },
  cancelled: {
    label: 'CANCELLED',
    ground: 'bg-badge',
    tone: 'muted',
    icon: X,
  },
};

export const OrderStatusChip = ({
  status,
}: {
  status: Exclude<OrderStatus, 'active'>;
}) => {
  const s = STYLE[status];
  return (
    <View
      className={`flex-row items-center gap-xs rounded-sm px-sm py-xs ${s.ground}`}
    >
      <Icon
        icon={s.icon}
        className={s.tone === 'veg' ? 'text-veg' : 'text-muted'}
        size={11}
        strokeWidth={3}
      />
      <Text variant="micro" tone={s.tone} weight="800">
        {s.label}
      </Text>
    </View>
  );
};
