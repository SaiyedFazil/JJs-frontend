import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { Text } from './Text';

/**
 * PDF section 05 · top app bar.
 * `onHero` flips the content to cream for use over an Ink 900 / photo surface.
 */
export const TopAppBar = ({
  title,
  onBack,
  right,
  onHero = false,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  onHero?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const iconClass = onHero ? 'text-hero-foreground' : 'text-ink';

  return (
    <View
      style={{ paddingTop: insets.top }}
      className={onHero ? 'bg-transparent' : 'bg-canvas'}
    >
      <View className="flex-row items-center justify-between px-lg h-14">
        <View className="flex-row items-center gap-sm flex-1">
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="w-10 h-10 items-center justify-center rounded-md"
            >
              <ChevronLeft size={22} className={iconClass} />
            </TouchableOpacity>
          ) : null}
          <Text
            variant="title"
            tone={onHero ? 'on-hero' : 'ink'}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
};

/** PDF section 05 · location bar — "DELIVER TO · HOME" over the address. */
export const LocationBar = ({
  label,
  address,
  onPress,
  onHero = false,
}: {
  label: string;
  address: string;
  onPress?: () => void;
  onHero?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={`${label}. ${address}`}
    className={`px-lg py-sm rounded-pill items-center ${
      onHero ? 'bg-hero/70 border border-hairline/20' : 'bg-surface shadow-e1'
    }`}
  >
    <Text variant="caption" tone={onHero ? 'on-hero' : 'muted'}>
      {label}
    </Text>
    <View className="flex-row items-center gap-sm mt-xs">
      <MapPin size={14} className="text-ember" fill="currentColor" />
      <Text
        variant="item"
        tone={onHero ? 'on-hero' : 'ink'}
        numberOfLines={1}
        className="max-w-48"
      >
        {address}
      </Text>
      <ChevronRight
        size={14}
        className={onHero ? 'text-hero-foreground' : 'text-muted'}
      />
    </View>
  </TouchableOpacity>
);
