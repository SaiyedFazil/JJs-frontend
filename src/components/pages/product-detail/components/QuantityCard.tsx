import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { QuantityControl } from './QuantityControl';

export const QuantityCard = ({
  unitPrice,
  quantity,
  canDecrement,
  onIncrement,
  onDecrement,
}: {
  /** One plate with its add-ons, so "each" × quantity is the bar's total. */
  unitPrice: number;
  quantity: number;
  canDecrement: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}) => (
  <View className="flex-row items-center justify-between bg-surface border border-card-hairline rounded-lg px-4 py-3.5 mb-6">
    <View>
      <Text variant="body" weight="800">
        Quantity
      </Text>
      <Text variant="fine" tone="label" weight="600" className="mt-0.5">
        {`₹${unitPrice} each`}
      </Text>
    </View>
    <QuantityControl
      quantity={quantity}
      canDecrement={canDecrement}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
    />
  </View>
);
