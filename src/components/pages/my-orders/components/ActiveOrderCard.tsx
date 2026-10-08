import React, { useEffect } from 'react';
import { Text as RNText, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';
import { Icon, LinearFill, RadialGlow, Text } from '@/components/ui';
import { inr } from '@/data/orders';
import type { Order } from '@/types/order.types';

/** The scooter's pulsing "live" ring — one slow expand-and-fade, forever. */
const PulseBadge = () => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + pulse.value * 2 }],
    opacity: 0.55 * (1 - pulse.value),
  }));

  return (
    <View className="w-8 h-8 items-center justify-center rounded-md bg-ember/20">
      <Animated.View
        pointerEvents="none"
        style={ring}
        className="absolute inset-0 rounded-md bg-ember/30"
      />
      <RNText style={{ fontSize: 15 }}>{'\u{1F6F5}'}</RNText>
    </View>
  );
};

/**
 * The one in-progress order, pinned above the history. Charcoal like the
 * splash and profile header, with an ember bloom in the corner, a live pulse
 * on the courier badge, a progress bar and a Track order button.
 *
 * The item summary and ETA come straight from the order's `progress`; Track is
 * a stub until a live-tracking screen exists (it toasts), like the other
 * forward actions on this screen.
 */
export const ActiveOrderCard = ({
  order,
  onTrack,
}: {
  order: Order;
  onTrack: () => void;
}) => {
  const p = order.progress;
  if (!p) return null;

  const summary = order.lines
    .map(l => (l.quantity > 1 ? `${l.name} ×${l.quantity}` : l.name))
    .join(', ');

  return (
    <View className="mb-lg">
      <Text
        variant="micro"
        tone="ember"
        weight="800"
        className="mb-sm ml-xs uppercase"
      >
        In progress
      </Text>

      <View className="relative overflow-hidden rounded-xl bg-hero p-md">
        {/* Ember bloom bleeding off the top-right corner. */}
        <RadialGlow
          token="ember"
          size={160}
          opacity={0.24}
          style={{ top: -50, right: -30 }}
        />

        <View>
          {/* Courier + stage, and the order ref. */}
          <View className="mb-md flex-row items-center justify-between">
            <View className="flex-row items-center gap-sm">
              <PulseBadge />
              <View>
                <Text variant="item" tone="on-hero" weight="800">
                  {p.stage}
                </Text>
                <Text
                  variant="fine"
                  tone="saffron"
                  weight="600"
                  className="mt-xs"
                >
                  {p.etaLabel}
                </Text>
              </View>
            </View>
            <Text variant="fine" tone="hero-muted" weight="700">
              {`#${order.ref}`}
            </Text>
          </View>

          {/* Progress bar: an ember→saffron fill over a translucent track. */}
          <View className="mb-md h-1.5 overflow-hidden rounded-pill bg-hero-surface">
            <View
              className="h-full overflow-hidden rounded-pill"
              style={{ width: `${Math.round(p.fraction * 100)}%` }}
            >
              <LinearFill from="ember" to="saffron" />
            </View>
          </View>

          {/* One-line item summary. */}
          <View className="mb-md flex-row items-center gap-sm">
            <Icon
              icon={MapPin}
              className="text-non-veg-bright"
              size={15}
              strokeWidth={2}
            />
            <Text
              variant="fine"
              tone="hero-muted-strong"
              weight="600"
              className="flex-1"
            >
              {summary}
            </Text>
          </View>

          {/* Total + meta, and the Track button. */}
          <View className="flex-row items-center gap-md">
            <View className="flex-1">
              <Text variant="item" tone="on-hero" weight="800">
                {inr(order.total)}
              </Text>
              <Text
                variant="micro"
                tone="hero-muted"
                weight="600"
                className="mt-xs"
              >
                {`${order.itemCount} items · paid via ${order.payment}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onTrack}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel={`Track order ${order.ref}`}
              className="flex-row items-center gap-xs rounded-md bg-ember px-lg py-sm shadow-ember-glow"
            >
              <Icon
                icon={MapPin}
                className="text-on-ember"
                size={15}
                strokeWidth={2.2}
                fill="currentColor"
              />
              <Text variant="fine" tone="on-ember" weight="800">
                Track order
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
