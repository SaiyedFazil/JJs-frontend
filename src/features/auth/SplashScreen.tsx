import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useCSSVariable } from 'uniwind';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/auth.store';
import { Text } from '@/components/ui';
import { BrandMark } from './BrandMark';

const SPLASH_DURATION = 4000;
const RING_SIZE = 24;
const RING_STROKE = 2.5;

/**
 * Soft ember light from above and a saffron ember-bed below. SVG gradient
 * stops need a literal color, so both are resolved from the tokens at runtime.
 */
const EmberGlow = () => {
  const { width: W, height: H } = useWindowDimensions();
  const [ember, saffron] = useCSSVariable(['--color-ember', '--color-saffron']);

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient
          id="top"
          cx={W * 0.45}
          cy={H * 0.06}
          r={W * 0.62}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={String(ember)} stopOpacity={0.38} />
          <Stop offset="1" stopColor={String(ember)} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          id="bottom"
          cx={W * 0.22}
          cy={H * 0.98}
          r={W * 0.55}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={String(saffron)} stopOpacity={0.14} />
          <Stop offset="1" stopColor={String(saffron)} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={W} height={H} fill="url(#top)" />
      <Rect width={W} height={H} fill="url(#bottom)" />
    </Svg>
  );
};

/** An ember arc turning on a faint ember track. */
const SpinnerRing = () => {
  const ember = String(useCSSVariable('--color-ember'));
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Animated.View
      style={animatedStyle}
      className="mt-xl"
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={ember}
          strokeOpacity={0.25}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={ember}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.3} ${circumference}`}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * The splash is the entry to the immersive Ink 900 auth flow (spec D6): the
 * brand tile, wordmark and a loading ring over a soft ember glow.
 */
export const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const setFirstLaunch = useAuthStore(state => state.setFirstLaunch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFirstLaunch(false);
      navigation.replace('Login');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [navigation, setFirstLaunch]);

  return (
    <Animated.View
      exiting={FadeOut.duration(450)}
      style={StyleSheet.absoluteFill}
      className="bg-hero items-center justify-center overflow-hidden"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <EmberGlow />

      <Animated.View
        entering={FadeIn.duration(700)}
        className="items-center px-lg"
      >
        <BrandMark size="lg" />
        <Text variant="h1" tone="on-hero" className="mt-lg">
          JJ
          <Text variant="h1" tone="ember">
            '
          </Text>
          s Kitchen
        </Text>
        <Text variant="caption" tone="hero-muted" className="mt-sm">
          Dine in & catering
        </Text>
        <SpinnerRing />
      </Animated.View>
    </Animated.View>
  );
};
