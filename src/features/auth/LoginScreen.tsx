import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard,
  Dimensions,
  NativeModules,
} from 'react-native';
import Animated, {
  SlideInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '@/services/auth.service';
import { clearAuthData } from '@/utils/storage';
import { useAppToast } from '@/hooks/useAppToast';
import { Text, Button, TextField } from '@/components/ui';

const { PhoneNumberHintModule } = NativeModules;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;
const MIN_HEADER_HEIGHT = 200;
const CARD_OVERLAP = 48;
const MIN_CARD_OVERLAP = 34; // keep the sheet's rounded corners visible

type RootStackParamList = {
  Login: { prefillPhone?: string };
  OtpVerification: { phone: string; authToken: string };
};

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();

  const [phone, setPhone] = useState(route.params?.prefillPhone || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toast = useAppToast();

  const headerProgress = useSharedValue(1);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height:
      MIN_HEADER_HEIGHT +
      headerProgress.value * (HEADER_HEIGHT - MIN_HEADER_HEIGHT),
    overflow: 'hidden' as const,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    marginTop: -(
      MIN_CARD_OVERLAP +
      headerProgress.value * (CARD_OVERLAP - MIN_CARD_OVERLAP)
    ),
  }));

  useEffect(() => {
    // Proactively clear stale auth data to prevent token conflicts during login
    clearAuthData();

    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      headerProgress.value = withTiming(0, { duration: 220 });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      headerProgress.value = withTiming(1, { duration: 220 });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [headerProgress]);

  // ── Auto-detect phone number on mount (Android only) ──────────────────
  // Shows the Google Phone Number Hint picker automatically when the
  // login screen loads — same UX as WhatsApp, PhonePe, Cred, etc.
  // Skipped if user already has a phone (e.g. coming back from OTP screen).
  useEffect(() => {
    if (Platform.OS !== 'android' || !PhoneNumberHintModule) return;
    if (route.params?.prefillPhone) return; // already have a number

    // Small delay so the Activity is fully mounted and idle (no animations)
    const timer = setTimeout(async () => {
      try {
        const phoneNumber: string =
          await PhoneNumberHintModule.requestPhoneNumberHint();
        if (phoneNumber) {
          const cleaned = phoneNumber.replace(/[^0-9]/g, '');
          if (cleaned.length >= 10) {
            setPhone(cleaned.slice(-10));
          }
        }
      } catch (err: any) {
        // User dismissed or no SIM numbers — perfectly fine, they'll type manually
        console.log('[PhoneHint] auto-detect:', err?.message);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    if (error) setError('');
    if (cleaned.length === 10) {
      Keyboard.dismiss();
    }
  };

  const handleContinue = async () => {
    Keyboard.dismiss();
    if (phone.length === 10) {
      setError('');
      setIsLoading(true);

      try {
        const response = await AuthService.sendOtp('+91', phone);

        if (response.status) {
          toast.success(
            response.message || 'Verification code sent successfully',
          );
          navigation.navigate('OtpVerification', {
            phone,
            authToken: response.data.authToken,
          });
        } else {
          setError(response.message || 'Failed to send OTP');
        }
      } catch (err: any) {
        console.error('Login Error:', err);
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please enter a valid 10-digit phone number');
    }
  };

  const isButtonActive = phone.length === 10 && !isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-hero"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-canvas"
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero header — Ink 900, collapses when the keyboard opens */}
        <Animated.View
          style={animatedHeaderStyle}
          className="w-full bg-hero items-center justify-center"
        >
          <Animated.View
            entering={FadeInUp.duration(1000)}
            className="items-center gap-md"
          >
            <View className="w-24 h-24 rounded-pill bg-ember items-center justify-center shadow-ember-glow">
              <Text variant="display" tone="on-ember">
                JJ
              </Text>
            </View>
            <Text variant="h1" tone="on-hero">
              JJ's Kitchen
            </Text>
            <Text variant="caption" tone="on-hero" className="opacity-70">
              Dine in & catering
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.duration(600)}
          className="flex-1 bg-canvas rounded-t-sheet px-xl pt-xl shadow-e3"
          style={[{ paddingBottom: insets.bottom + 20 }, animatedCardStyle]}
        >
          <View className="items-center mb-xl gap-lg">
            <View className="w-16 h-1.5 rounded-pill bg-hairline" />
            <Text variant="title" className="text-center">
              Let's start with your phone number
            </Text>
          </View>

          <TextField
            label="Phone number"
            prefix="+91"
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="98765 43210"
            error={error || undefined}
            keyboardType="number-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={10}
            isDisabled={isLoading}
          />

          <Button
            label="Send OTP"
            loadingLabel="Sending OTP"
            onPress={handleContinue}
            isDisabled={!isButtonActive && !isLoading}
            isLoading={isLoading}
          />

          <View className="mt-auto pt-xl pb-md">
            <Text variant="body" tone="muted" className="text-center">
              By continuing, you automatically accept our{'\n'}
              <Text variant="body" className="underline">
                Terms & Conditions
              </Text>
              ,{' '}
              <Text variant="body" className="underline">
                Privacy Policy
              </Text>{' '}
              and{' '}
              <Text variant="body" className="underline">
                Cookies Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/** Layout-only: the ScrollView must be able to grow past the viewport. */
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
