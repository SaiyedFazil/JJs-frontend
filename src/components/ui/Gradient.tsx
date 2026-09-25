import React, { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

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
 * SVG ids are document-global in react-native-svg, so two instances sharing a
 * literal id would cross-paint. useId gives a stable unique one; its colons
 * are illegal in an SVG id and must be stripped.
 */
const useGradientId = (prefix: string): string => {
  const raw = useId();
  return `${prefix}${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
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

/**
 * Bottom-up photo scrim. Three stops of one colour at falling opacity, so a
 * dish name stays legible over any photograph.
 */
export const ScrimFill = ({ token = 'hero' }: { token?: string }) => {
  const color = useToken(`--color-${token}`);
  const id = useGradientId('sf');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0.06" stopColor={color} stopOpacity={0.92} />
          <Stop offset="0.52" stopColor={color} stopOpacity={0.2} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

/**
 * The light sweeping across a pane of glass.
 *
 * Distinct from LinearFill, which runs edge to edge at a constant rate: real
 * glass catches light in a concentrated band near the lit edge and falls off
 * fast, so this front-loads its stops. Without that asymmetry the surface
 * reads as flat translucent plastic rather than something with a curved,
 * polished face.
 */
export const GlassSheen = () => {
  const lit = useToken('--color-glass-sheen');
  const fade = useToken('--color-glass-sheen-fade');
  const id = useGradientId('gs');

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="0%" x2="55%" y2="100%">
          <Stop offset="0" stopColor={lit} />
          <Stop offset="0.34" stopColor={fade} />
          <Stop offset="1" stopColor={fade} />
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
