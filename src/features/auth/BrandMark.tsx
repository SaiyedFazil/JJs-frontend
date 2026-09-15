import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

type BrandMarkSize = 'sm' | 'lg';

const SIZE: Record<BrandMarkSize, { tile: string; glyph: 'title' | 'h1' }> = {
  sm: { tile: 'w-12 h-12 rounded-lg', glyph: 'title' },
  lg: { tile: 'w-22 h-22 rounded-xl', glyph: 'h1' },
};

/**
 * The auth flow's brand tile: a flame on a faint ember well with an ember
 * hairline. Decorative — the screens name the brand in text.
 */
export const BrandMark = ({ size }: { size: BrandMarkSize }) => (
  <View
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    className={`${SIZE[size].tile} items-center justify-center border border-ember/50 bg-ember/10`}
  >
    <Text variant={SIZE[size].glyph}>🔥</Text>
  </View>
);
