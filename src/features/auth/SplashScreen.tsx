import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import splashAnimation from '../../assets/animations/jjs_kitchen_splash.json';
import { useAuthStore } from '@/store/auth.store';

const SPLASH_DURATION = 4000;

// Animation duration matches the 4s splash duration (240 frames @ 60fps)
const SPLASH_BACKGROUND = '#0E1A2B';

const LoadingDot = ({ index }: { index: number }) => {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(
      2700 + index * 160,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 480, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
  }, [index, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + value.value * 0.65,
    transform: [{ scale: 0.8 + value.value * 0.45 }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { width: W, height: H } = useWindowDimensions();

  const setFirstLaunch = useAuthStore(state => state.setFirstLaunch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFirstLaunch(false);
      navigation.replace('Login');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [navigation, setFirstLaunch]);

  const minDim = Math.min(W, H);
  const taglineSize = Math.max(12, minDim * 0.035);
  const taglineSpacing = Math.max(4, minDim * 0.015);
  const dotsBottom = Math.max(60, H * 0.12);

  return (
    <Animated.View
      exiting={FadeOut.duration(450)}
      style={[styles.container, { backgroundColor: SPLASH_BACKGROUND }]}
    >
      <LottieView
        source={splashAnimation}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <View style={{ height: H * 0.22 }} />

        <Animated.Text
          entering={FadeIn.delay(2600).duration(800)}
          style={[
            styles.tagline,
            { fontSize: taglineSize, letterSpacing: taglineSpacing },
          ]}
        >
          TASTE THE PERFECTION
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeIn.delay(2700).duration(500)}
        style={[styles.dotsRow, { bottom: dotsBottom }]}
      >
        <LoadingDot index={0} />
        <LoadingDot index={1} />
        <LoadingDot index={2} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tagline: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
});
