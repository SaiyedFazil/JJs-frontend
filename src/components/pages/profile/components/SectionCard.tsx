import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/ui';

/**
 * A labelled group of rows: the label sits outside the card, on the canvas,
 * and the rows sit in a single white slab that clips them to its radius.
 */
export const SectionCard = ({
  label,
  delay = 0,
  children,
}: {
  label: string;
  delay?: number;
  children: React.ReactNode;
}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(420).springify()}
    className="mb-4.5"
  >
    <Text variant="caption" weight="800" tone="label" className="mb-2.5 ml-1">
      {label}
    </Text>

    {/* overflow-hidden is load-bearing: it clips the first and last rows'
        corners to the card's radius, which is what makes the stack read as
        one slab instead of rows behind a rounded frame. */}
    <View className="bg-surface border border-card-hairline rounded-lg overflow-hidden">
      {children}
    </View>
  </Animated.View>
);
