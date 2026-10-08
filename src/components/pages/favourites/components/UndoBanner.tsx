import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Text } from '@/components/ui';

/**
 * The charcoal "Removed X from favourites · UNDO" banner shown briefly after a
 * dish is un-hearted. The caller owns visibility and the dismiss timer; this
 * renders only when mounted. UNDO is saffron — the design-system's highlight
 * on a hero ground, where ember would read as an "add" affordance.
 */
export const UndoBanner = ({
  name,
  onUndo,
}: {
  name: string;
  onUndo: () => void;
}) => (
  <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut}>
    <View className="flex-row items-center gap-sm bg-hero rounded-md px-md py-sm shadow-e3">
      <Text variant="body" tone="on-hero" className="flex-1">
        {`Removed ${name} from favourites`}
      </Text>
      <TouchableOpacity
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel={`Undo removing ${name}`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text variant="body" tone="saffron" weight="800">
          UNDO
        </Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
);
