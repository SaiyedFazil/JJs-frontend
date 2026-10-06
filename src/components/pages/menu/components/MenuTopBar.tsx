import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, MapPin, Search, Star, X } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import { SERVICE } from '@/data/restaurant';

/**
 * The charcoal header: back, title, delivery line, rating, and the search
 * field. Unlike the home screen's SearchButton this is a real TextInput —
 * the menu filters in place rather than opening a search screen.
 */
export const MenuTopBar = ({
  address,
  query,
  onChangeQuery,
  onBack,
}: {
  address: string;
  query: string;
  onChangeQuery: (next: string) => void;
  onBack: () => void;
}) => (
  <View className="relative bg-hero px-md pt-md pb-md gap-3.5">
    {/* Fills the iOS overscroll above the header, which would otherwise
        flash the cream canvas when the list is pulled down. */}
    <View
      style={styles.overscroll}
      className="absolute left-0 right-0 bg-hero"
    />

    <View className="flex-row items-center gap-3">
      <TouchableOpacity
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to home"
        className="w-10 h-10 rounded-md border border-hero-hairline-lifted bg-hero-surface items-center justify-center"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Icon
          icon={ChevronLeft}
          className="text-on-hero-chrome"
          size={19}
          strokeWidth={2}
        />
      </TouchableOpacity>

      <View className="flex-1">
        <Text variant="item" tone="on-hero" weight="800">
          Full Menu
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon
            icon={MapPin}
            className="text-ember"
            size={12}
            strokeWidth={2.2}
          />
          <Text
            variant="fine"
            tone="hero-muted"
            weight="600"
            numberOfLines={1}
            className="shrink"
          >
            {`Delivery to ${address} · ${SERVICE.etaMinutes} min`}
          </Text>
        </View>
      </View>

      <View
        accessibilityLabel={`Rated ${SERVICE.rating}`}
        className="flex-row items-center gap-1 bg-hero-surface rounded-sm px-2.5 py-1.5"
      >
        <Icon
          icon={Star}
          className="text-saffron"
          size={12}
          fill="currentColor"
        />
        <Text variant="fine" tone="saffron" weight="800">
          {SERVICE.rating}
        </Text>
      </View>
    </View>

    <View className="flex-row items-center gap-2.5 bg-on-hero-chrome rounded-md px-3.5 h-12">
      <Icon icon={Search} className="text-muted" size={19} strokeWidth={2} />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search dishes…"
        accessibilityLabel="Search dishes"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        className="flex-1 font-jakarta-600 text-body text-ink-strong p-0"
        placeholderTextColorClassName="text-muted"
        cursorColorClassName="text-ember"
        selectionColorClassName="text-ember"
      />
      {query ? (
        <TouchableOpacity
          onPress={() => onChangeQuery('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="w-5.5 h-5.5 rounded-pill bg-border-strong items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            icon={X}
            className="text-ink-soft"
            size={12}
            strokeWidth={2.6}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

/** Layout-only: a charcoal block parked above the header's top edge. */
const styles = StyleSheet.create({
  overscroll: { top: -600, height: 600 },
});
