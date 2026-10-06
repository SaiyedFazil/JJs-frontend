import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ImageTile, ScrimFill, Text } from '@/components/ui';

/**
 * The full-bleed photo header. It runs up under the status bar, and the body
 * below overlaps its bottom edge, so the caller sizes it.
 *
 * Paging is native — slides sized to the window with `pagingEnabled` — so the
 * swipe stays on the UI thread and never fights the page's vertical scroll.
 * One photo (or none) has nothing to page through: no pager, no dots.
 */
export const DishGallery = ({
  photos,
  categoryId,
  height,
  isSoldOut,
}: {
  photos: ImageSourcePropType[];
  categoryId: string;
  height: number;
  isSoldOut: boolean;
}) => {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setPage(current => (current === next ? current : next));
    },
    [width],
  );

  return (
    // Layout-only: the height comes from the window and the status-bar inset.
    <View style={{ height }} className="bg-hero">
      {photos.length > 1 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {photos.map((photo, i) => (
            <View key={i} style={{ width, height }}>
              <ImageTile source={photo} categoryId={categoryId} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ImageTile source={photos[0]} categoryId={categoryId} emojiSize={88} />
      )}

      <ScrimFill strength="soft" />

      {photos.length > 1 ? (
        <View
          className="absolute left-0 right-0 bottom-8.5 flex-row justify-center gap-1.5"
          accessibilityLabel={`Photo ${page + 1} of ${photos.length}`}
        >
          {photos.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-pill ${
                i === page ? 'w-5 bg-saffron' : 'w-1.5 bg-surface/50'
              }`}
            />
          ))}
        </View>
      ) : null}

      {isSoldOut ? (
        <View className="absolute inset-0 bg-hero/55 items-center justify-center">
          <View className="bg-hero border border-hero-hairline-lifted rounded-md px-5 py-3">
            <Text variant="caption" tone="hero-chrome" weight="800">
              Sold out today
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};
