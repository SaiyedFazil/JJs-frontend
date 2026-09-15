import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { OPENS_AT_LABEL } from '@/data/restaurant';

/** Shown only outside service hours. Rendering is the caller's decision. */
export const ClosedStrip = () => (
  <View className="flex-row items-center gap-sm bg-closed px-md py-sm">
    <View className="w-2 h-2 rounded-pill bg-warning" />
    <Text
      variant="fine"
      tone="closed-foreground"
      weight="700"
      className="flex-1"
    >
      {`Currently closed · opens today at ${OPENS_AT_LABEL}. You can browse and schedule an order.`}
    </Text>
  </View>
);
