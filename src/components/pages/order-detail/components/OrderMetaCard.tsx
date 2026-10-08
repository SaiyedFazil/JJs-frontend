import React from 'react';
import { View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import type { Fulfilment } from '@/types/order.types';
import { ReceiptCard } from './ReceiptCard';

/**
 * The restaurant row — a charcoal logo tile with the brand flame, the kitchen
 * name, the order ref and placement time, and a mode tag that reads DELIVERY
 * or TAKEAWAY.
 */
export const OrderMetaCard = ({
  meta,
  fulfilment,
}: {
  /** "#JJ2481 · 26 Aug, 8:42 PM". */
  meta: string;
  fulfilment: Fulfilment;
}) => (
  <ReceiptCard>
    <View className="flex-row items-center gap-sm">
      <View className="w-11 h-11 items-center justify-center rounded-md bg-hero">
        <Icon
          icon={Flame}
          className="text-ember"
          size={22}
          fill="currentColor"
        />
      </View>
      <View className="flex-1">
        <Text variant="body" tone="ink" weight="800">
          JJ's Kitchen
        </Text>
        <Text variant="micro" tone="label" weight="600" className="mt-xs">
          {meta}
        </Text>
      </View>
      <View className="rounded-sm bg-ember-tint px-sm py-xs">
        <Text variant="micro" tone="ember-pressed" weight="800">
          {fulfilment === 'takeaway' ? 'TAKEAWAY' : 'DELIVERY'}
        </Text>
      </View>
    </View>
  </ReceiptCard>
);
