import React, { memo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LayoutAnimationConfig,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { Minus, Plus, Trash2, type LucideIcon } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

const PRESS_SPRING = { damping: 15, stiffness: 320 };
const PRESSED_SCALE = 0.82;
const COUNT_MS = 180;
const SWAP_MS = 160;

/** One round face of the stepper, shrinking a little under the finger. */
const StepButton = ({
  icon,
  iconKey,
  label,
  onPress,
}: {
  icon: LucideIcon;
  /** Changes when the glyph does, so the new one zooms in. */
  iconKey: string;
  label: string;
  onPress: () => void;
}) => {
  const press = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(PRESSED_SCALE, PRESS_SPRING);
      }}
      onPressOut={() => {
        press.value = withSpring(1, PRESS_SPRING);
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        className="w-8 h-8 items-center justify-center rounded-pill"
        style={style}
      >
        <Animated.View key={iconKey} entering={ZoomIn.duration(SWAP_MS)}>
          <Icon
            icon={icon}
            className="text-ember"
            size={15}
            strokeWidth={2.6}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

/**
 * The cart line's − n + : a soft ember pill. At one, the minus becomes a bin,
 * because the next tap takes the line out (the screen offers Undo). The
 * count rolls up as it rises and down as it falls.
 *
 * Its own rather than the shared QuantityControl, which the product page
 * keeps as it is.
 */
export const LineStepper = memo(
  ({
    quantity,
    name,
    onIncrement,
    onDecrement,
  }: {
    quantity: number;
    name: string;
    onIncrement: () => void;
    onDecrement: () => void;
  }) => {
    // Which way the count moved, derived during render: React's own pattern
    // for state that follows a prop, with no effect and no extra frame.
    const [seen, setSeen] = useState({ quantity, rising: true });
    if (seen.quantity !== quantity) {
      setSeen({ quantity, rising: quantity > seen.quantity });
    }

    const isLast = quantity === 1;

    return (
      <View className="flex-row items-center h-9 px-0.5 rounded-pill border border-ember bg-ember-wash">
        {/* Nothing animates as the screen opens; only later changes do. */}
        <LayoutAnimationConfig skipEntering>
          <StepButton
            icon={isLast ? Trash2 : Minus}
            iconKey={isLast ? 'remove' : 'minus'}
            label={isLast ? `Remove ${name}` : `Remove one ${name}`}
            onPress={onDecrement}
          />
          <View
            className="w-6 h-full items-center justify-center overflow-hidden"
            accessible
            accessibilityLabel={`Quantity ${quantity}`}
          >
            <Animated.View
              key={quantity}
              entering={(seen.rising ? FadeInUp : FadeInDown).duration(
                COUNT_MS,
              )}
            >
              <Text variant="body" weight="800" tone="ember-pressed">
                {quantity}
              </Text>
            </Animated.View>
          </View>
          <StepButton
            icon={Plus}
            iconKey="plus"
            label={`Add one ${name}`}
            onPress={onIncrement}
          />
        </LayoutAnimationConfig>
      </View>
    );
  },
);

LineStepper.displayName = 'LineStepper';
