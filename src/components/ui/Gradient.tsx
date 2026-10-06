import React, { useId } from 'react';
import {
  StyleSheet,
  View,
  processColor,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useCSSVariable, useResolveClassNames } from 'uniwind';

/**
 * SVG paints with colour values, not class names, so these are the one place
 * a token is read at runtime rather than applied as a utility. No hex literal
 * appears here — useCSSVariable resolves the Layer C token from global.css.
 *
 * PASS A LAYER A OR LAYER B NAME ('--hero', '--ember-500'), not a Layer C
 * '--color-*' one. Layer C lives in `@theme inline`, which inlines those names
 * into the utilities rather than declaring them, so only some of them reach
 * the runtime variable table: '--color-ember' is there, '--color-hero' is not.
 * Layer A and B are ordinary `:root` declarations and are all present.
 *
 * Getting it wrong does not fail quietly: an unknown name returns the string
 * 'transparent', and SVG reads that as opaque BLACK — so the paint turns black
 * rather than disappearing. That is what made the profile header render as a
 * flat black slab.
 */
export const useToken = (name: string): string => {
  const value = useCSSVariable(name);
  return typeof value === 'string' ? value : 'transparent';
};

/**
 * The colour a literal text utility resolves to: 'text-ember' → its value.
 *
 * For a colour that must reach a prop as a STRING (an SVG stop, BlurView's
 * overlayColor, a Reanimated interpolation) when the token is named nowhere
 * else in a className. useToken cannot see such a token — it is not in the
 * runtime variable table — but resolving the class has no such gap; see
 * Icon.tsx, which hit exactly that.
 *
 * Pass a literal ("text-glass-sheen"), never an interpolated name: Tailwind
 * emits only the classes it finds in the source text.
 */
export const useClassColor = (className: string): string | undefined => {
  const style = useResolveClassNames(className);
  return typeof style.color === 'string' ? style.color : undefined;
};

/**
 * SVG ids are document-global in react-native-svg, so two instances sharing a
 * literal id would cross-paint. useId gives a stable unique one; its colons
 * are illegal in an SVG id and must be stripped.
 */
const useGradientId = (prefix: string): string => {
  const raw = useId();
  return `${prefix}${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
};

/**
 * A colour's alpha, 0–1, for a Stop's stopOpacity. See GlassSheen for why a
 * translucent stop needs it. An unresolved colour counts as opaque, which is
 * what react-native-svg would have assumed anyway.
 */
const alphaOf = (color: string | undefined): number => {
  const argb = color ? processColor(color) : null;
  if (typeof argb !== 'number') return 1;
  // processColor packs 0xAARRGGBB, which arrives negative on Android once
  // the alpha byte's top bit is set; normalised to unsigned, the top byte is
  // the alpha.
  const unsigned = argb < 0 ? argb + 2 ** 32 : argb;
  return Math.floor(unsigned / 2 ** 24) / 255;
};

/** Two-stop linear fill. `diagonal` runs 135°, otherwise left→right. */
export const LinearFill = ({
  from,
  to,
  diagonal = false,
  start = 0,
  end = 1,
  fromColor,
  toColor,
}: {
  from: string;
  to: string;
  diagonal?: boolean;
  /**
   * An already-resolved colour, which wins over the token of the same end.
   * For a stop whose colour no className names — see `useClassColor`.
   */
  fromColor?: string;
  toColor?: string;
  /**
   * Where each colour lands, 0–1. The defaults put them at the very ends, so
   * the fill ramps across the whole box.
   *
   * Pushing `start` out holds the first colour flat before the ramp begins;
   * pushing `end` past 1 means the second colour is never fully reached, so
   * only part of the ramp is visible. That is how the profile header keeps its
   * charcoal for the top 40% and then warms towards — but never arrives at —
   * the ember end, which is what stops it reading as a two-tone band.
   */
  start?: number;
  end?: number;
}) => {
  const a = useToken(`--color-${from}`);
  const b = useToken(`--color-${to}`);
  const id = useGradientId('lf');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0%"
          y1="0%"
          x2="100%"
          y2={diagonal ? '100%' : '0%'}
        >
          <Stop offset={start} stopColor={fromColor ?? a} />
          <Stop offset={end} stopColor={toColor ?? b} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

/** [offset from the bottom edge, opacity] for each stop of a ScrimFill. */
const SCRIM_STOPS: Record<'strong' | 'soft', [number, number][]> = {
  strong: [
    [0.06, 0.92],
    [0.52, 0.2],
    [1, 0],
  ],
  soft: [
    [0, 0.45],
    [0.3, 0],
  ],
};

/**
 * Bottom-up photo scrim. Stops of one colour at falling opacity, so a dish
 * name stays legible over any photograph.
 *
 * `strong` carries type laid over the photo. `soft` only darkens the bottom
 * third — enough for a pager's dots, without dimming a photo that is the
 * point of the screen.
 */
export const ScrimFill = ({
  token = 'hero',
  strength = 'strong',
}: {
  token?: string;
  strength?: 'strong' | 'soft';
}) => {
  const color = useToken(`--color-${token}`);
  const id = useGradientId('sf');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="100%" x2="0%" y2="0%">
          {SCRIM_STOPS[strength].map(([offset, opacity]) => (
            <Stop
              key={offset}
              offset={offset}
              stopColor={color}
              stopOpacity={opacity}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

/**
 * The gloss on a pane of glass, lit from above.
 *
 * Three stops rather than LinearFill's two: bright along the top edge, a soft
 * body by the middle, gone by the bottom. Two stops would ramp at a constant
 * rate and read as a flat translucent wash; the mid stop is what concentrates
 * the light near the lit edge, the way a curved, polished face catches it.
 *
 * Colours come from useClassColor, not useToken: these tokens appear in no
 * className, so useToken would get 'transparent' back — which SVG paints as
 * black.
 *
 * Each stop passes its token's alpha again as stopOpacity, because
 * react-native-svg discards the alpha inside a stopColor and takes opacity
 * from stopOpacity alone, which defaults to 1. Without it every stop of these
 * translucent tokens rendered as opaque white, and the sheen covered the
 * tab bar's glass with a solid white sheet.
 */
export const GlassSheen = () => {
  const lit = useClassColor('text-glass-sheen');
  const soft = useClassColor('text-glass-sheen-soft');
  const fade = useClassColor('text-glass-sheen-fade');
  const id = useGradientId('gs');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor={lit} stopOpacity={alphaOf(lit)} />
          <Stop offset="0.5" stopColor={soft} stopOpacity={alphaOf(soft)} />
          <Stop offset="1" stopColor={fade} stopOpacity={alphaOf(fade)} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

/**
 * The ember bloom behind the dark header and the sizzler spotlight. Sized and
 * positioned by the caller through `style`, because it deliberately bleeds
 * past its container's edge.
 */
export const RadialGlow = ({
  token = 'ember',
  opacity = 0.25,
  size,
  style,
}: {
  token?: string;
  opacity?: number;
  size: number;
  style?: StyleProp<ViewStyle>;
}) => {
  const color = useToken(`--color-${token}`);
  const id = useGradientId('rg');

  return (
    <View
      pointerEvents="none"
      style={[styles.glow, { width: size, height: size }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.62" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
};

/**
 * Layout-only. The glow is taken out of flow so it can bleed past its
 * container's edge; its size and offset stay inline because both are runtime
 * values the caller supplies.
 */
const styles = StyleSheet.create({
  glow: { position: 'absolute' },
});
