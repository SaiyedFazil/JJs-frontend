import React from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  Text as RNText,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import { Text } from './Text';
import { CATEGORY_TINT, CATEGORY_EMOJI } from './ImageTile';

/** The 64px cuisine tile in the category rail. Spec §5.4. */
export const CategoryTile = ({
  id,
  label,
  image,
  isActive = false,
  onPress,
}: {
  id: string;
  label: string;
  /** Cuisine photo. Absent — see category-images.ts — falls back to the glyph. */
  image?: ImageSourcePropType;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    className="w-18 items-center gap-sm"
  >
    <View
      className={`w-16 h-16 rounded-xl items-center justify-center overflow-hidden border-2 ${
        isActive
          ? 'bg-tint-selected border-ember'
          : `${CATEGORY_TINT[id] ?? 'bg-sunken'} border-transparent`
      }`}
    >
      {image ? (
        <Image
          source={image}
          className="w-full h-full"
          resizeMode="cover"
          accessible={false}
        />
      ) : (
        <RNText style={styles.glyph}>
          {CATEGORY_EMOJI[id] ?? '\u{1F37D}'}
        </RNText>
      )}
    </View>
    <Text
      variant="fine"
      tone={isActive ? 'ember' : 'ink'}
      numberOfLines={2}
      weight="700"
      className="text-center"
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/** Layout-only: an emoji glyph has no place on the type scale. */
const styles = StyleSheet.create({
  glyph: { fontSize: 28 },
});
