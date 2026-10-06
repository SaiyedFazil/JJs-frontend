import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { CountBadge } from './CountBadge';

/**
 * A section's name, count and trailing rule.
 *
 * Rendered twice per stuck section: once in the list, and once as the overlay
 * MenuScreen pins under the tab rail. The two must stay pixel-identical — the
 * overlay takes over from the in-list copy at the moment they coincide, so
 * any difference shows as a jump.
 */
export const MenuSectionHeader = ({
  name,
  count,
}: {
  name: string;
  count: number;
}) => (
  <View className="flex-row items-center gap-sm bg-canvas px-md pt-md pb-sm">
    <Text variant="title" numberOfLines={1} className="shrink">
      {name}
    </Text>
    <CountBadge count={count} />
    <View className="flex-1 h-px bg-card-hairline" />
  </View>
);
