import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Text } from './Text';

export type StepperVariant = 'solid' | 'outline';
export type StepperSize = 'md' | 'sm';

const ADD_GROUND: Record<StepperVariant, string> = {
  solid: 'bg-ember shadow-ember-glow',
  outline: 'bg-surface border-2 border-ember',
};

const SIZING: Record<StepperSize, { add: string; bar: string; icon: number }> =
  {
    md: { add: 'px-lg h-10 min-w-24', bar: 'px-sm h-10 min-w-24', icon: 16 },
    sm: { add: 'px-md h-8 min-w-16', bar: 'px-xs h-8 min-w-16', icon: 13 },
  };

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
  variant = 'solid',
  size = 'md',
}: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  addLabel?: string;
  variant?: StepperVariant;
  size?: StepperSize;
}) => {
  const s = SIZING[size];

  if (quantity <= 0) {
    return (
      <TouchableOpacity
        onPress={onAdd}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        className={`rounded-md items-center justify-center ${ADD_GROUND[variant]} ${s.add}`}
      >
        <Text
          variant="caption"
          tone={variant === 'solid' ? 'on-ember' : 'ember'}
        >
          {addLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`flex-row items-center justify-between bg-ember rounded-md shadow-ember-glow ${s.bar}`}
    >
      <TouchableOpacity
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className="p-xs"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Minus size={s.icon} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
      <Text variant={size === 'md' ? 'item' : 'caption'} tone="on-ember">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className="p-xs"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Plus size={s.icon} className="text-on-ember" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};
