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

export type TextTone =
  | 'ink'
  | 'muted'
  | 'ember'
  | 'on-ember'
  | 'on-hero'
  | 'hero-muted'
  | 'hero-danger'
  | 'veg'
  | 'non-veg'
  | 'chili';

const VARIANT: Record<TextVariant, string> = {
  display: 'font-bricolage-800 text-display',
  h1: 'font-bricolage-700 text-h1',
  h2: 'font-bricolage-700 text-h2',
  title: 'font-jakarta-700 text-title',
  item: 'font-jakarta-600 text-item',
  body: 'font-jakarta-500 text-body',
  caption: 'font-jakarta-700 text-caption uppercase',
  fine: 'font-jakarta-500 text-fine',
};

const TONE: Record<TextTone, string> = {
  ink: 'text-ink',
  muted: 'text-muted',
  ember: 'text-ember',
  'on-ember': 'text-on-ember',
  'on-hero': 'text-hero-foreground',
  'hero-muted': 'text-hero-muted',
  'hero-danger': 'text-hero-danger',
  veg: 'text-veg',
  'non-veg': 'text-non-veg',
  chili: 'text-chili',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
}

export const Text = ({
  variant = 'body',
  tone = 'ink',
  className = '',
  ...rest
}: TextProps) => (
  <RNText
    className={`${VARIANT[variant]} ${TONE[tone]} ${className}`.trim()}
    {...rest}
  />
);
