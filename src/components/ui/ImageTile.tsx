import React from 'react';
import { View, Image, Text as RNText } from 'react-native';

/**
 * Cuisine coding, shared by the category rail and every image placeholder.
 * Keys are MenuCategory ids; every category in src/data/menu.ts appears here,
 * so an unrecognised id is a data bug rather than a silent blank tile.
 */
export const CATEGORY_TINT: Record<string, string> = {
  popular: 'bg-tint-tandoor',
  'chicken-tandoor': 'bg-tint-tandoor',
  'mutton-tandoor': 'bg-tint-mutton',
  seafood: 'bg-tint-seafood',
  tawa: 'bg-tint-tawa',
  'chicken-main': 'bg-tint-tandoor',
  'mutton-main': 'bg-tint-mutton',
  sizzlers: 'bg-tint-sizzler',
  'veg-main': 'bg-tint-veg',
  'nonveg-chinese': 'bg-tint-chinese',
  'veg-chinese': 'bg-tint-chinese',
  soups: 'bg-tint-tawa',
  salad: 'bg-tint-veg',
  bread: 'bg-tint-bread',
  beverages: 'bg-tint-drink',
  desserts: 'bg-tint-dessert',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  popular: '⭐',
  'chicken-tandoor': '\u{1F357}',
  'mutton-tandoor': '\u{1F969}',
  seafood: '\u{1F990}',
  tawa: '\u{1F373}',
  'chicken-main': '\u{1F35B}',
  'mutton-main': '\u{1F35B}',
  sizzlers: '\u{1F525}',
  'veg-main': '\u{1F958}',
  'nonveg-chinese': '\u{1F961}',
  'veg-chinese': '\u{1F961}',
  soups: '\u{1F372}',
  salad: '\u{1F957}',
  bread: '\u{1FAD3}',
  beverages: '\u{1F964}',
  desserts: '\u{1F36E}',
};

export interface ImageTileProps {
  /** A photo URL. Nothing sets this yet — see spec decision D4. */
  uri?: string;
  categoryId: string;
  /** Placeholder glyph size. Numeric like Badges.tsx, not a type token. */
  emojiSize?: number;
}

/**
 * Fills its parent. Shows the photo when there is one, otherwise a tinted
 * tile carrying the cuisine's glyph — so the screen is complete today and
 * real photography is a data change, never a UI change.
 */
export const ImageTile = ({
  uri,
  categoryId,
  emojiSize = 28,
}: ImageTileProps) => {
  if (uri) {
    return (
      <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
    );
  }

  return (
    <View
      accessible={false}
      className={`w-full h-full items-center justify-center ${
        CATEGORY_TINT[categoryId] ?? 'bg-sunken'
      }`}
    >
      <RNText style={{ fontSize: emojiSize }}>
        {CATEGORY_EMOJI[categoryId] ?? '\u{1F37D}'}
      </RNText>
    </View>
  );
};
