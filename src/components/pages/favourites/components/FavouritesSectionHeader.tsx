import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

/**
 * A saved-section label: the category name in small, tracked uppercase (the
 * `caption` type role). Plainer than the Menu's title-and-rule header — the
 * Favourites list is short and groups read as quiet dividers, not banners.
 */
export const FavouritesSectionHeader = ({ name }: { name: string }) => (
  <View className="px-1 pb-2.5">
    <Text variant="caption" tone="muted">
      {name}
    </Text>
  </View>
);
