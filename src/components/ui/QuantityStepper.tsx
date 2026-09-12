import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Text } from './Text';

/**
 * PDF section 05 · quantity stepper.
 * Collapses to a single ADD button at zero, expands to − n + above it.
 * Both states share a min width so the row does not reflow on press.
 */
export const QuantityStepper = ({
  quantity,
  onAdd,
  onRemove,
  addLabel = 'ADD',
}: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  addLabel?: string;
}) => {
  if (quantity <= 0) {
    return (
      <TouchableOpacity
        onPress={onAdd}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        className="bg-ember rounded-md px-lg h-10 min-w-24 items-center justify-center shadow-ember-glow"
      >
        <Text variant="caption" tone="on-ember">
          {addLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center justify-between bg-ember rounded-md px-sm h-10 min-w-24 shadow-ember-glow">
      <TouchableOpacity
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className="p-xs"
      >
        <Minus size={16} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
      <Text variant="item" tone="on-ember">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className="p-xs"
      >
        <Plus size={16} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};
