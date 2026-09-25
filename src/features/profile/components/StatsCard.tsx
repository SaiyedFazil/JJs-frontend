import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import type { ProfileCounts } from '../profile-mock';

interface Stat {
  value: number;
  label: string;
}

/**
 * The three-up strip that straddles the header's bottom edge.
 *
 * It is pulled up into the header by a negative margin, so it must paint
 * above it: `z-10` here, and the header's own decoration stays behind.
 */
export const StatsCard = ({ counts }: { counts: ProfileCounts }) => {
  const stats: Stat[] = [
    { value: counts.orders, label: 'Orders' },
    { value: counts.favourites, label: 'Favourites' },
    { value: counts.addresses, label: 'Saved addresses' },
  ];

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      className="px-md z-10"
      style={styles.overlap}
    >
      <View
        className="flex-row bg-surface border border-card-hairline rounded-xl py-md px-2.5 shadow-lift"
        style={styles.elevation}
      >
        {stats.map((stat, i) => (
          <View key={stat.label} className="flex-1 items-center">
            <Text variant="h2" weight="800">
              {stat.value}
            </Text>
            <Text variant="micro" tone="label" className="mt-1.5">
              {stat.label}
            </Text>

            {/* A hairline between columns, not after the last one. Absolute so
                it cannot take part in the equal three-way split. */}
            {i < stats.length - 1 ? (
              <View
                className="bg-card-hairline"
                style={styles.divider}
                pointerEvents="none"
              />
            ) : null}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

/**
 * Layout-only. The overlap is a runtime-free constant but has no utility
 * (Tailwind has no negative margin token on this scale), and Android draws
 * shadows only from `elevation`, which no class emits — the same exception
 * CustomTabBar documents.
 */
const styles = StyleSheet.create({
  overlap: { marginTop: -38 },
  elevation: {
    ...Platform.select({ android: { elevation: 6 }, default: {} }),
  },
  divider: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -16,
    width: StyleSheet.hairlineWidth * 2,
    height: 32,
  },
});
