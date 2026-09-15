import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/**
 * The design system's type scale (PDF section 02).
 *
 * Bricolage Grotesque carries display sizes; the PDF constrains it to >= 24px,
 * so `title` and below are Plus Jakarta Sans.
 *
 * Weight is carried by the font family name, never by fontWeight — React
 * Native cannot synthesize a weight from a static face.
 */
export type TextVariant =
  'display' | 'h1' | 'h2' | 'title' | 'item' | 'body' | 'caption' | 'fine';

export type TextWeight = '400' | '500' | '600' | '700' | '800';

export type TextTone =
  | 'ink'
  | 'muted'
  | 'ember'
  | 'saffron'
  | 'on-ember'
  | 'on-ember-muted'
  | 'on-hero'
  | 'hero-muted'
  | 'hero-danger'
  | 'closed-foreground'
  | 'veg'
  | 'non-veg'
  | 'chili';

type Family = 'bricolage' | 'jakarta';

const FAMILY: Record<TextVariant, Family> = {
  display: 'bricolage',
  h1: 'bricolage',
  h2: 'bricolage',
  title: 'jakarta',
  item: 'jakarta',
  body: 'jakarta',
  caption: 'jakarta',
  fine: 'jakarta',
};

const SIZE: Record<TextVariant, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  title: 'text-title',
  item: 'text-item',
  body: 'text-body',
  caption: 'text-caption uppercase',
  fine: 'text-fine',
};

const DEFAULT_WEIGHT: Record<TextVariant, TextWeight> = {
  display: '800',
  h1: '700',
  h2: '700',
  title: '700',
  item: '600',
  body: '500',
  caption: '700',
  fine: '500',
};

/**
 * Literal class names, not interpolated: Tailwind extracts classes by scanning
 * source text, so `font-${family}-${weight}` would emit no rule at all.
 * Bricolage ships no 500 face, hence the gap.
 */
const WEIGHT_CLASS: Record<Family, Partial<Record<TextWeight, string>>> = {
  bricolage: {
    '400': 'font-bricolage-400',
    '600': 'font-bricolage-600',
    '700': 'font-bricolage-700',
    '800': 'font-bricolage-800',
  },
  jakarta: {
    '400': 'font-jakarta-400',
    '500': 'font-jakarta-500',
    '600': 'font-jakarta-600',
    '700': 'font-jakarta-700',
    '800': 'font-jakarta-800',
  },
};

const TONE: Record<TextTone, string> = {
  ink: 'text-ink',
  muted: 'text-muted',
  ember: 'text-ember',
  saffron: 'text-saffron',
  'on-ember': 'text-on-ember',
  'on-ember-muted': 'text-on-ember-muted',
  'on-hero': 'text-hero-foreground',
  'hero-muted': 'text-hero-muted',
  'hero-danger': 'text-hero-danger',
  'closed-foreground': 'text-closed-foreground',
  veg: 'text-veg',
  'non-veg': 'text-non-veg',
  chili: 'text-chili',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /**
   * Overrides the variant's default weight. Use this rather than a
   * `font-*` class in className — two family classes on one element is
   * undefined behaviour, since this component does no class merging.
   */
  weight?: TextWeight;
  className?: string;
}

export const Text = ({
  variant = 'body',
  tone = 'ink',
  weight,
  className = '',
  ...rest
}: TextProps) => {
  const family = FAMILY[variant];
  const fontClass =
    WEIGHT_CLASS[family][weight ?? DEFAULT_WEIGHT[variant]] ??
    WEIGHT_CLASS[family][DEFAULT_WEIGHT[variant]];

  return (
    <RNText
      className={`${fontClass} ${SIZE[variant]} ${TONE[tone]} ${className}`.trim()}
      {...rest}
    />
  );
};
