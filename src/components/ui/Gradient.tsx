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
 */
const useToken = (name: string): string => {
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
}: {
  from: string;
  to: string;
  diagonal?: boolean;
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
          <Stop offset="0" stopColor={a} />
          <Stop offset="1" stopColor={b} />
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
      style={[{ position: 'absolute', width: size, height: size }, style]}
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
