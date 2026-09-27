import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pencil } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon, Text, RadialGlow, LinearFill, useToken } from '@/components/ui';
import { Avatar } from './Avatar';
import { VerifiedChip } from './VerifiedChip';
import { PillButton } from './PillButton';

/**
 * The charcoal header: identity on a warm gradient, with the ember bloom
 * bleeding off the top-right corner.
 *
 * Its bottom padding is deliberately deep — the stats card is pulled up 38px
 * into it, and that padding is what keeps the "Edit profile" button clear of
 * the overlap.
 */
export const ProfileHeader = ({
  name,
  phone,
  email,
  avatarId,
  isEmailVerified,
  onEditAvatar,
  onEditProfile,
}: {
  name: string;
  phone: string;
  email: string | null;
  avatarId: number;
  isEmailVerified: boolean;
  onEditAvatar: () => void;
  onEditProfile: () => void;
}) => {
  const insets = useSafeAreaInsets();

  // Both stops, resolved by their LAYER B names rather than the `--color-*`
  // ones LinearFill looks up by default.
  //
  // Layer C lives in `@theme inline`, which inlines those names into the
  // utilities instead of declaring them, so only some reach the runtime
  // variable table — `--color-ember` does, `--color-hero` does not. Layer A
  // and Layer B are ordinary `:root` declarations and are all there.
  //
  // Getting this wrong is not a no-op: `useToken` returns the string
  // 'transparent' for a name it cannot find, and SVG reads that as opaque
  // BLACK, so a missing stop paints instead of disappearing. That is exactly
  // why this header rendered flat black with no warm corner.
  const charcoal = useToken('--hero');
  const emberEnd = useToken('--hero-ember');

  return (
    <View
      style={{ paddingTop: insets.top + 24 }}
      className="relative overflow-hidden bg-hero px-lg pb-15"
    >
      {/* Charcoal for the first 40% of the diagonal, then warming toward the
          ember end — the flat run is what stops it reading as a two-tone
          band. See LinearFill's `start`. */}
      <LinearFill
        from="hero"
        to="hero-ember"
        fromColor={charcoal}
        toColor={emberEnd}
        diagonal
        start={0.4}
      />
      <RadialGlow size={230} opacity={0.32} style={styles.glow} />

      <Animated.View entering={FadeInDown.duration(420)}>
        <Text variant="title" tone="on-hero" className="mb-lg">
          Profile
        </Text>

        <View className="flex-row items-center gap-md">
          <View>
            <Avatar
              id={avatarId}
              size={78}
              className="border-2 border-hero-ring shadow-ember-glow"
            />

            {/* Sits ON the avatar's edge, so its border is the header's own
                ground — that dark ring is what separates the two circles. */}
            <TouchableOpacity
              onPress={onEditAvatar}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Change avatar"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-pill bg-on-hero-chrome border-2 border-hero items-center justify-center"
            >
              <Icon
                icon={Pencil}
                className="text-hero"
                size={13}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text variant="h2" weight="800" tone="on-hero" numberOfLines={1}>
              {name}
            </Text>
            <Text
              variant="fine"
              weight="600"
              tone="hero-muted-strong"
              className="mt-1.5"
            >
              {phone}
            </Text>

            <View className="flex-row items-center gap-1.5 mt-1">
              <Text
                variant="fine"
                weight="600"
                tone="hero-muted-strong"
                numberOfLines={1}
                className="shrink"
              >
                {email ?? 'Add your email'}
              </Text>
              {isEmailVerified ? <VerifiedChip surface="hero" /> : null}
            </View>
          </View>
        </View>

        <PillButton
          label="Edit profile"
          variant="hero-glass"
          size="sm"
          className="w-full mt-5"
          icon={
            <Icon
              icon={Pencil}
              className="text-on-hero-chrome"
              size={15}
              strokeWidth={2}
            />
          }
          onPress={onEditProfile}
        />
      </Animated.View>
    </View>
  );
};

/** Layout-only: the glow bleeds past the header's top-right corner by design. */
const styles = StyleSheet.create({
  glow: { top: -70, right: -50 },
});
