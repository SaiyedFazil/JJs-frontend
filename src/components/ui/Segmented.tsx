import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';

/** PDF section 05 · segmented control — service mode (Takeaway / Dine-in). */
export const Segmented = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <View className="flex-row bg-sunken rounded-pill p-xs">
    {options.map(option => {
      const isActive = option === value;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          className={`flex-1 items-center justify-center py-sm rounded-pill ${
            isActive ? 'bg-surface shadow-e1' : ''
          }`}
        >
          <Text variant="caption" tone={isActive ? 'ink' : 'muted'}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
