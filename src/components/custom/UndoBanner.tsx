import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Text } from '@/components/ui';

/**
 * The charcoal "<what happened> · UNDO" banner shown briefly after something
 * is removed — a dish un-hearted, a cart line stepped to zero. The caller owns
 * visibility and the dismiss timer; this renders only when mounted. UNDO is
 * saffron — the design-system's highlight on a hero ground, where ember would
 * read as an "add" affordance.
 *
 * `floating` adds the lift for a banner hovering over a list; one sitting in
 * the page's flow, as in the cart, lies flat.
 */
export const UndoBanner = ({
  message,
  undoLabel,
  onUndo,
  floating = false,
}: {
  message: string;
  /** What UNDO says to a screen reader — "Undo removing Butter Naan". */
  undoLabel: string;
  onUndo: () => void;
  floating?: boolean;
}) => (
  <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut}>
    <View
      className={`flex-row items-center gap-sm bg-hero rounded-md px-md py-sm ${
        floating ? 'shadow-e3' : ''
      }`}
    >
      <Text variant="body" tone="on-hero" className="flex-1">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel={undoLabel}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text variant="body" tone="saffron" weight="800">
          UNDO
        </Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
);
