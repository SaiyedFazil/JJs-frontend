import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from './Text';

/** PDF section 05 · category chips — All / Tandoor / Starters / … */
export const CategoryChip = ({
  label,
  isActive = false,
  onPress,
}: {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    className={`px-md py-sm rounded-pill border ${
      isActive ? 'bg-ember border-ember' : 'bg-surface border-hairline'
    }`}
  >
    <Text variant="caption" tone={isActive ? 'on-ember' : 'ink'}>
      {label}
    </Text>
  </TouchableOpacity>
);
