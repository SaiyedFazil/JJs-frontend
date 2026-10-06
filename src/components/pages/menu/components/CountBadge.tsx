import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

/** The neutral dish count beside a section name, in the list and the index sheet. */
export const CountBadge = ({ count }: { count: number }) => (
  <View className="bg-badge rounded-sm px-sm py-0.5">
    <Text variant="fine" tone="label" weight="700">
      {count}
    </Text>
  </View>
);
