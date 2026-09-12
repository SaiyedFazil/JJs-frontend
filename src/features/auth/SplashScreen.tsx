import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet, useWindowDimensions } from 'react-native';
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
import { Text } from '@/components/ui';

const SPLASH_DURATION = 4000;

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

  return (
    <Animated.View
      style={animatedStyle}
      className="w-2 h-2 rounded-pill bg-hero-foreground"
    />
  );
};

/**
 * The splash is the app's one immersive surface: Ink 900, which PDF section 01
 * names for "hero, splash". It is also the only screen that sets a light
 * status bar — everywhere else the canvas is Cream 50.
 */
export const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { height: H } = useWindowDimensions();

  const setFirstLaunch = useAuthStore(state => state.setFirstLaunch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFirstLaunch(false);
      navigation.replace('Login');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [navigation, setFirstLaunch]);

  const dotsBottom = Math.max(60, H * 0.12);

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

      <LottieView
        source={splashAnimation}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />

      <View className="items-center justify-center px-lg">
        <View style={{ height: H * 0.22 }} />
        <Animated.View entering={FadeIn.delay(2600).duration(800)}>
          {/* `caption` already carries the PDF's +14% tracking and uppercase,
              replacing the old hand-tuned letterSpacing arithmetic. */}
          <Text variant="caption" tone="on-hero" className="mt-md opacity-80">
            Taste the perfection
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeIn.delay(2700).duration(500)}
        style={{ bottom: dotsBottom }}
        className="absolute flex-row items-center justify-center gap-sm"
      >
        <LoadingDot index={0} />
        <LoadingDot index={1} />
        <LoadingDot index={2} />
      </Animated.View>
    </Animated.View>
  );
};
