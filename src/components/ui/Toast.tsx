import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { Text } from './Text';

/**
 * The add-to-cart confirmation. The caller owns visibility and the dismiss
 * timer; this renders only when mounted.
 *
 * `accent` colours the tick only. Veg green is the default because the first
 * use was "added to cart" — an affirmative about food. Ember is for a
 * confirmation about the app itself, where green would imply a dietary mark.
 */
export const Toast = ({
  message,
  accent = 'veg',
}: {
  message: string;
  accent?: 'veg' | 'ember';
}) => (
  <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut}>
    <View className="flex-row items-center gap-sm bg-hero rounded-md px-md py-sm shadow-e3">
      <View
        className={`w-6 h-6 rounded-pill items-center justify-center ${
          accent === 'ember' ? 'bg-ember' : 'bg-veg'
        }`}
      >
        <Check size={12} className="text-on-ember" strokeWidth={3} />
      </View>
      <Text variant="body" tone="on-hero" className="flex-1">
        {message}
      </Text>
    </View>
  </Animated.View>
);
