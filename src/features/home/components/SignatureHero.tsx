import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Star } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu';
import { Text, ImageTile, ScrimFill, VegBadge } from '@/components/ui';

/** The screen's horizontal gutter, `px-md` on the rail. Spec §4 spacing. */
const GUTTER = 16;

/** One slide: the full-bleed photo panel that used to be the whole component. */
const SignatureSlide = ({
  item,
  width,
  onAdd,
}: {
  item: MenuItem;
  width: number;
  onAdd: () => void;
}) => (
  // Layout-only: a paged slide must be exactly the viewport's usable width,
  // which is a runtime value Tailwind cannot express.
  <View style={{ width }}>
    <View className="relative h-56 rounded-xl overflow-hidden shadow-e3">
      <ImageTile categoryId={item.cat} source={item.image} emojiSize={64} />
      <ScrimFill />

      <View className="absolute top-md left-md flex-row gap-xs">
        <View className="bg-ember rounded-sm px-sm py-xs">
          <Text variant="caption" tone="on-ember">
            Signature
          </Text>
        </View>
        <View className="flex-row items-center gap-xs bg-hero/60 rounded-sm px-sm py-xs">
          <Star size={10} className="text-saffron" fill="currentColor" />
          <Text variant="caption" tone="saffron">
            4.8
          </Text>
        </View>
      </View>

      <View className="absolute left-md right-md bottom-md flex-row items-end justify-between gap-md">
        <View className="flex-1">
          <View className="flex-row items-center gap-xs mb-xs">
            <VegBadge isVeg={item.veg} size={14} tone="bright" />
            <Text variant="fine" tone="hero-muted" weight="700">
              Smoky · Charcoal-grilled
            </Text>
          </View>

          <Text variant="h2" tone="on-hero" numberOfLines={1} weight="800">
            {item.name}
          </Text>

          <View className="flex-row items-baseline gap-xs mt-xs">
            <Text variant="body" tone="ember" weight="800">
              {`₹${item.base}`}
            </Text>
            {item.portion ? (
              <Text variant="fine" tone="hero-muted">
                · Full / Half
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name}`}
          className="bg-ember rounded-md px-md h-11 items-center justify-center shadow-ember-glow"
        >
          <Text variant="caption" tone="on-ember">
            Add +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

/**
 * The lead visual: signature dishes as a swipeable, page-snapped carousel.
 *
 * Paging is native (`pagingEnabled` + slides sized to the viewport), so the
 * swipe stays on the UI thread and never fights the vertical ScrollView that
 * wraps the whole home screen.
 */
export const SignatureHero = ({
  items,
  onAdd,
}: {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = screenWidth - GUTTER * 2;
  const [page, setPage] = useState(0);
  /** The distance from one slide's left edge to the next: width plus the gap. */
  const pitch = slideWidth + GUTTER;
  // Read inside a scroll handler that must stay referentially stable — it
  // fires every frame, and a new identity each render would thrash the
  // native scroll subscription.
  const pitchRef = useRef(pitch);
  pitchRef.current = pitch;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / pitchRef.current);
      setPage(current => (current === next ? current : next));
    },
    [],
  );

  if (items.length === 0) return null;

  // A lone signature has nothing to swipe between, so it renders as the plain
  // panel it was before — no pager, no dots.
  if (items.length === 1) {
    return (
      <View className="px-md pt-md">
        <SignatureSlide
          item={items[0]}
          width={slideWidth}
          onAdd={() => onAdd(items[0])}
        />
      </View>
    );
  }

  return (
    <View className="pt-md">
      <ScrollView
        horizontal
        // Not `pagingEnabled`: that snaps to whole-viewport multiples, which
        // the gutter offsets us from. snapToInterval snaps to the real slide
        // pitch — slide width plus the gap between two slides.
        snapToInterval={pitch}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.pager}
      >
        {items.map(item => (
          <SignatureSlide
            key={item.id}
            item={item}
            width={slideWidth}
            onAdd={() => onAdd(item)}
          />
        ))}
      </ScrollView>

      <View
        className="flex-row items-center justify-center gap-xs pt-sm"
        accessibilityRole="tablist"
        accessibilityLabel={`Signature dish ${page + 1} of ${items.length}`}
      >
        {items.map((item, i) => (
          <View
            key={item.id}
            className={`h-1.5 rounded-full ${
              i === page ? 'w-4 bg-ember' : 'w-1.5 bg-hairline'
            }`}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * Layout-only: the pager's gutter is padding rather than a margin so the first
 * and last slides still snap flush to the page boundary.
 */
const styles = StyleSheet.create({
  pager: { paddingHorizontal: GUTTER, gap: GUTTER },
});
