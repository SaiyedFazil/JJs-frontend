import React from 'react';
import { TouchableOpacity, View, Text as RNText } from 'react-native';
import { Text } from './Text';
import { CATEGORY_TINT, CATEGORY_EMOJI } from './ImageTile';

/** The 64px cuisine tile in the category rail. Spec §5.4. */
export const CategoryTile = ({
  id,
  label,
  isActive = false,
  onPress,
}: {
  id: string;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    className="w-18 items-center gap-sm"
  >
    <View
      className={`w-16 h-16 rounded-xl items-center justify-center border-2 ${
        isActive
          ? 'bg-tint-selected border-ember'
          : `${CATEGORY_TINT[id] ?? 'bg-sunken'} border-transparent`
      }`}
    >
      <RNText style={{ fontSize: 28 }}>
        {CATEGORY_EMOJI[id] ?? '\u{1F37D}'}
      </RNText>
    </View>
    <Text
      variant="fine"
      tone={isActive ? 'ember' : 'ink'}
      numberOfLines={2}
      weight="700"
      className="text-center"
    >
      {label}
    </Text>
  </TouchableOpacity>
);
