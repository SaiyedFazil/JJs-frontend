import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
  type SharedValue,
} from 'react-native-reanimated';
import { ShoppingBag } from 'lucide-react-native';
import { Icon, LinearFill, Text } from '@/components/ui';
import { CART_FAB_SIZE } from '@/constants/layout';
import { useCartStore } from '@/store/cart.store';

/** Press feedback, matching the tab buttons beside it. */
const PRESS_SPRING = { damping: 15, stiffness: 300 };
const PRESSED_SCALE = 0.92;

/** An add: the button swells, then settles with a little overshoot. */
const SWELL_SCALE = 1.14;
const SWELL_TIMING = { duration: 130, easing: Easing.out(Easing.quad) };
const SETTLE_SPRING = { damping: 8, stiffness: 220 };
/** A removal: the button dips instead, so the two never read alike. */
const DIP_SCALE = 0.9;
const DIP_TIMING = { duration: 90, easing: Easing.out(Easing.quad) };

/** The bag's shake on an add, in degrees: left, right, a smaller left, rest. */
const SHAKE = [-14, 11, -6];
const SHAKE_STEP_MS = 95;

/** The ember ring that spreads out from the button on an add. */
const RIPPLE_SCALE = 1.8;
const RIPPLE_OPACITY = 0.45;
const RIPPLE_TIMING = { duration: 700, easing: Easing.out(Easing.cubic) };

/** The count badge's own pop when its number changes. */
const BADGE_POP = 1.35;
const BADGE_TIMING = { duration: 120, easing: Easing.out(Easing.quad) };
const BADGE_SPRING = { damping: 7, stiffness: 260 };

const ICON_SIZE = 24;
const MAX_BADGE = 99;

const badgeLabel = (count: number) =>
  count > MAX_BADGE ? `${MAX_BADGE}+` : String(count);

/**
 * Arriving, the tab row parts first and the button rises into the gap a beat
 * later, on a spring with a little overshoot. Leaving runs the other way: the
 * button sinks back into the bar, then the gap closes behind it. The gap
 * itself never springs — tabs that bounce sideways read as a glitch.
 */
const SLOT_OPEN = { duration: 320, easing: Easing.bezier(0.2, 0, 0, 1) };
const SLOT_CLOSE = { duration: 280, easing: Easing.bezier(0.4, 0, 0.2, 1) };
const FAB_ENTER_DELAY = 90;
const FAB_ENTER_SPRING = { damping: 13, stiffness: 190, mass: 0.9 };
const FAB_EXIT = { duration: 200, easing: Easing.in(Easing.quad) };
const SLOT_CLOSE_DELAY = 110;
/** Where the button rises from, and its size there. */
const FAB_HIDDEN_DROP = 28;
const FAB_HIDDEN_SCALE = 0.3;

export interface CartPresence {
  /** Whether the cart holds anything — the button is shown only then. */
  hasItems: boolean;
  /** 0 → 1: how far the row has parted to make room for the button. */
  slot: SharedValue<number>;
  /** 0 → 1, overshooting on the way in: the button's own entrance. */
  fab: SharedValue<number>;
}

/**
 * Whether the tab bar shows the cart, and the two progress values that move
 * it in and out together.
 *
 * Subscribes to emptiness alone, so the bar re-renders only as the cart goes
 * empty ↔ non-empty, never on each add. Starts settled, so a bar mounted
 * over a full cart does not animate in.
 */
export const useCartPresence = (): CartPresence => {
  const hasItems = useCartStore(s => s.totalItems() > 0);
  const slot = useSharedValue(hasItems ? 1 : 0);
  const fab = useSharedValue(hasItems ? 1 : 0);

  useEffect(() => {
    if (hasItems) {
      slot.value = withTiming(1, SLOT_OPEN);
      fab.value = withDelay(FAB_ENTER_DELAY, withSpring(1, FAB_ENTER_SPRING));
    } else {
      fab.value = withTiming(0, FAB_EXIT);
      slot.value = withDelay(SLOT_CLOSE_DELAY, withTiming(0, SLOT_CLOSE));
    }
  }, [hasItems, slot, fab]);

  return { hasItems, slot, fab };
};

/**
 * The cart, docked in the middle of the tab bar and rising above its top
 * edge.
 *
 * It is the only thing in the bar subscribed to the cart, so a change there
 * re-renders this button and nothing else. Every add plays the same short
 * beat on the UI thread — the button swells and settles, the bag shakes, an
 * ember ring spreads out behind it and the badge pops to its new number —
 * while a removal only dips the button, so the two are never confused.
 * Mounting with items already in the cart plays nothing, and neither does
 * the first add or the last removal: there, the button's own entrance and
 * exit (useCartPresence) are the whole story.
 */
export const CartFab = memo(
  ({
    onPress,
    visible,
    shown,
  }: {
    onPress: () => void;
    /** Takes touches and screen-reader focus only while true. */
    visible: boolean;
    /** The entrance progress from useCartPresence. */
    shown: SharedValue<number>;
  }) => {
    const count = useCartStore(s => s.totalItems());
    const previous = useRef(count);

    const press = useSharedValue(1);
    const bump = useSharedValue(1);
    const tilt = useSharedValue(0);
    /** 0 → 1 across one ripple; at rest it sits at 1, fully faded. */
    const ripple = useSharedValue(1);
    const badgePop = useSharedValue(1);

    useEffect(() => {
      const before = previous.current;
      previous.current = count;
      if (count === before || before === 0 || count === 0) return;

      if (count > before) {
        bump.value = withSequence(
          withTiming(SWELL_SCALE, SWELL_TIMING),
          withSpring(1, SETTLE_SPRING),
        );
        tilt.value = withSequence(
          ...SHAKE.map(deg => withTiming(deg, { duration: SHAKE_STEP_MS })),
          withSpring(0, SETTLE_SPRING),
        );
        ripple.value = withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, RIPPLE_TIMING),
        );
        badgePop.value = withSequence(
          withTiming(BADGE_POP, BADGE_TIMING),
          withSpring(1, BADGE_SPRING),
        );
      } else {
        bump.value = withSequence(
          withTiming(DIP_SCALE, DIP_TIMING),
          withSpring(1, PRESS_SPRING),
        );
      }
    }, [count, bump, tilt, ripple, badgePop]);

    // Rises out of the bar as it grows; fully opaque well before full size, so
    // the spring's overshoot is seen as a pop rather than a fade.
    const presenceStyle = useAnimatedStyle(() => ({
      opacity: interpolate(shown.value, [0, 0.4], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: (1 - shown.value) * FAB_HIDDEN_DROP },
        { scale: FAB_HIDDEN_SCALE + (1 - FAB_HIDDEN_SCALE) * shown.value },
      ],
    }));
    const buttonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: bump.value * press.value }],
    }));
    const bagStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${tilt.value}deg` }],
    }));
    const rippleStyle = useAnimatedStyle(() => ({
      opacity: RIPPLE_OPACITY * (1 - ripple.value),
      transform: [{ scale: 1 + (RIPPLE_SCALE - 1) * ripple.value }],
    }));
    const badgeStyle = useAnimatedStyle(() => ({
      transform: [{ scale: badgePop.value }],
    }));

    const onPressIn = useCallback(() => {
      press.value = withSpring(PRESSED_SCALE, PRESS_SPRING);
    }, [press]);
    const onPressOut = useCallback(() => {
      press.value = withSpring(1, PRESS_SPRING);
    }, [press]);

    const accessibilityLabel =
      count > 0
        ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
        : 'Cart, empty';

    return (
      <Animated.View
        pointerEvents={visible ? 'box-none' : 'none'}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={[styles.anchor, presenceStyle]}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 rounded-pill bg-ember"
          style={rippleStyle}
        />
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Opens your cart"
        >
          {/* The glow lives on this unclipped view; the clip below would cut
            it away, as it does the tab bar's own shadow. */}
          <Animated.View
            className="rounded-pill shadow-ember-glow"
            style={[styles.button, buttonStyle]}
          >
            <View className="flex-1 rounded-pill overflow-hidden border-4 border-surface items-center justify-center">
              <LinearFill from="ember" to="ember-deep" diagonal />
              <Animated.View style={bagStyle}>
                <Icon
                  icon={ShoppingBag}
                  className="text-on-ember"
                  size={ICON_SIZE}
                  strokeWidth={2.2}
                />
              </Animated.View>
            </View>

            {count > 0 ? (
              <Animated.View
                entering={ZoomIn.springify().damping(12).stiffness(220)}
                exiting={ZoomOut.duration(160)}
                style={styles.badge}
              >
                <Animated.View
                  className="min-w-5 h-5 px-1 rounded-pill bg-hero border-2 border-surface items-center justify-center"
                  style={badgeStyle}
                >
                  <Text variant="micro" tone="on-hero" weight="800">
                    {badgeLabel(count)}
                  </Text>
                </Animated.View>
              </Animated.View>
            ) : null}
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  },
);

CartFab.displayName = 'CartFab';

/**
 * Layout-only: the button's diameter is a layout constant shared with the
 * tab bar's geometry, and the badge hangs off its corner by a fixed amount.
 */
const styles = StyleSheet.create({
  /** Holds the ripple and the button on the same centre. */
  anchor: {
    width: CART_FAB_SIZE,
    height: CART_FAB_SIZE,
  },
  button: {
    width: CART_FAB_SIZE,
    height: CART_FAB_SIZE,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
  },
});
