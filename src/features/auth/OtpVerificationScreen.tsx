import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard,
  TextInput,
  Dimensions,
  NativeModules,
  NativeEventEmitter,
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
import { Spinner } from 'heroui-native';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useAppToast } from '@/hooks/useAppToast';
import { Text, Button, OtpInput } from '@/components/ui';

// ── Native modules ────────────────────────────────────────────────────────────
const { SmsRetrieverModule } = NativeModules;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;
const MIN_HEADER_HEIGHT = 160;
const CARD_OVERLAP = 40;
const MIN_CARD_OVERLAP = 35; // keep the sheet's rounded corners visible

type RootStackParamList = {
  Login: { prefillPhone?: string };
  OtpVerification: { phone: string; authToken: string };
};

export const OtpVerificationScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OtpVerification'>>();
  const insets = useSafeAreaInsets();
  const { phone } = route.params;

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState(route.params.authToken);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const setAuth = useAuthStore(state => state.setAuth);
  const toast = useAppToast();

  /** Resets and starts the 60-second countdown. */
  const startResendTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(60);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

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

  // Start timer on mount; clean up on unmount.
  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startResendTimer]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      headerProgress.value = withTiming(0, { duration: 220 });
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      inputRef.current?.blur();
      headerProgress.value = withTiming(1, { duration: 220 });
    });

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 800);

    // ── SMS User Consent API — no hash needed, shows native consent dialog ──
    let smsEventEmitter: NativeEventEmitter | null = null;
    let smsReceivedSub: ReturnType<NativeEventEmitter['addListener']> | null =
      null;
    let smsTimeoutSub: ReturnType<NativeEventEmitter['addListener']> | null =
      null;

    const startSmsListener = async () => {
      try {
        // Start the User Consent listener (5-minute window)
        await SmsRetrieverModule.startSmsRetriever();
        console.log('📡 SMS User Consent listener started');

        smsEventEmitter = new NativeEventEmitter(SmsRetrieverModule);

        // Fired when user taps "Allow" on the native consent dialog
        smsReceivedSub = smsEventEmitter.addListener(
          'onSmsReceived',
          (event: { message?: string }) => {
            console.log('📲 SMS User Consent received:', event?.message);
            if (event?.message) {
              const otpMatch = event.message.match(/\d{6}/);
              if (otpMatch && otpMatch[0]) {
                console.log('✅ OTP auto-filled:', otpMatch[0]);
                setOtp(otpMatch[0]);
                Keyboard.dismiss();
              }
            }
          },
        );

        smsTimeoutSub = smsEventEmitter.addListener('onSmsTimeout', () => {
          console.log('⏰ SMS User Consent timed out');
        });
      } catch (err) {
        console.log('SMS User Consent error:', err);
      }
    };

    if (Platform.OS === 'android') {
      startSmsListener();
    }

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      clearTimeout(timer);
      if (Platform.OS === 'android') {
        smsReceivedSub?.remove();
        smsTimeoutSub?.remove();
        SmsRetrieverModule.stopSmsRetriever?.();
      }
    };
  }, [headerProgress]);

  const handleVerify = async () => {
    if (otp.length === 6) {
      setIsLoading(true);
      setError('');

      try {
        const response = await AuthService.verifyOtp(otp, authToken);

        if (response.status) {
          // 1. Hide the loader immediately so the user sees progress
          setIsLoading(false);

          // 2. Trigger global auth state change (switches to Home screen)
          setAuth(response.data);

          console.log('🚀 Redirecting to Home...');
          return; // Exit all logic for this component
        } else {
          setError(response.message || 'Invalid OTP');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Verify OTP Error:', err);
        setError(err.message || 'Verification failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setOtp('');

    try {
      const response = await AuthService.resendOtp(authToken);
      if (response.status && response.data?.authToken) {
        setAuthToken(response.data.authToken);
        startResendTimer();
        toast.success(
          response.message || 'Verification code resent successfully',
        );
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      console.error('Resend OTP Error:', err);
      toast.error(err.message || 'Resend failed. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isButtonActive = otp.length === 6 && !isLoading;

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
        {/* Hero header — collapses when the keyboard opens */}
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
              Verify OTP
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.duration(600)}
          className="flex-1 bg-canvas rounded-t-sheet px-xl pt-xl shadow-e3"
          style={[{ paddingBottom: insets.bottom + 40 }, animatedCardStyle]}
        >
          <View className="items-center mb-sm gap-sm">
            <View className="w-16 h-1.5 rounded-pill bg-hairline mb-md" />
            <Text variant="title" className="text-center">
              JJ's Kitchen has sent a 6-digit code to
            </Text>
            <View className="flex-row items-center gap-sm mt-xs">
              <Text variant="item">+91 {phone}</Text>
              <Button
                label="Change"
                variant="secondary"
                size="sm"
                onPress={() =>
                  navigation.navigate('Login', { prefillPhone: phone })
                }
              />
            </View>
          </View>

          <View className="items-center mb-sm">
            <OtpInput
              ref={inputRef}
              value={otp}
              onChangeText={text => {
                setOtp(text);
                if (text.length === 6) Keyboard.dismiss();
              }}
              error={error || undefined}
            />

            {isResending ? (
              <View className="mt-md flex-row items-center justify-center gap-sm">
                <Spinner size="sm" />
                <Text variant="body" tone="ember">
                  Sending code...
                </Text>
              </View>
            ) : !canResend ? (
              <View className="mt-md items-center">
                <Text variant="body" tone="muted">
                  Resend code in{' '}
                  <Text variant="body" tone="ember">
                    0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                  </Text>
                </Text>
              </View>
            ) : (
              <Button
                label="Resend OTP"
                variant="ghost"
                size="sm"
                onPress={handleResendOtp}
                isDisabled={isLoading}
                className="mt-md self-center"
              />
            )}
          </View>

          <Button
            label="Verify & Login"
            loadingLabel="Verifying..."
            onPress={handleVerify}
            isDisabled={!isButtonActive && !isLoading}
            isLoading={isLoading}
            className="mt-md"
          />

          <View className="mt-auto pt-xl">
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
