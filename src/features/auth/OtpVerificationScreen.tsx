import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner } from 'heroui-native';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useAppToast } from '@/hooks/useAppToast';

// ── Native modules ────────────────────────────────────────────────────────────
const { SmsRetrieverModule } = NativeModules;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;
const MIN_HEADER_HEIGHT = 160;
const CARD_OVERLAP = 40; // -mt-10 = 10 * 4
const MIN_CARD_OVERLAP = 35; // keep card rounded corners visible inside header

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
  const [isFocused, setIsFocused] = useState(false);
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
      setIsFocused(false);
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

  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i];
      const isActive = isFocused && i === otp.length;

      slots.push(
        <View
          key={i}
          className={`w-11 h-14 rounded-xl border-2 justify-center items-center bg-white ${
            isActive
              ? 'border-primary dark:border-primary-dark'
              : 'border-border dark:border-border-dark'
          }`}
          pointerEvents="none"
        >
          {char ? (
            <Animated.Text
              entering={ZoomIn.duration(200)}
              className="text-2xl font-black text-[#170C79]"
            >
              {char}
            </Animated.Text>
          ) : null}
          {isActive && (
            <View className="w-0.5 h-6 bg-primary dark:bg-primary-dark absolute" />
          )}
        </View>,
      );
    }
    return slots;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-primary dark:bg-primary-dark"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background dark:bg-background-dark"
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header — collapses when keyboard opens */}
        <Animated.View
          style={animatedHeaderStyle}
          className="w-full bg-primary dark:bg-primary-dark items-center justify-center"
        >
          <Animated.View
            entering={FadeInUp.duration(1000)}
            className="items-center"
          >
            <View className="w-24 h-24 bg-primary-foreground/20 dark:bg-primary-foreground/20 rounded-full items-center justify-center">
              <Text className="text-5xl">🍔</Text>
            </View>
            <Text className="text-primary-foreground dark:text-primary-foreground text-3xl font-black mt-3">
              Verify OTP
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Floating Card Section */}
        <Animated.View
          entering={SlideInDown.duration(600)}
          className="flex-1 bg-surface dark:bg-surface-dark rounded-t-[40px] px-8 pt-8"
          style={[
            styles.cardShadow,
            { paddingBottom: insets.bottom + 40 },
            animatedCardStyle,
          ]}
        >
          <View className="items-center mb-2">
            <View className="w-16 h-1.5 bg-muted/30 dark:bg-muted-dark/30 rounded-full mb-6" />
            <Text className="text-foreground/80 dark:text-foreground-dark/80 font-medium text-lg text-center px-1 leading-8">
              JJ's Kitchen has sent a 6-digit code to
            </Text>
            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-base">
                +91 {phone}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Login', { prefillPhone: phone })
                }
                className="ml-3 bg-muted/10 border border-border dark:border-border-dark px-2 py-1 rounded-xl flex-row items-center shadow-sm active:bg-muted/20"
              >
                <Text className="text-primary dark:text-white mr-1.5 text-[10px]">
                  ✎
                </Text>
                <Text className="text-primary dark:text-white font-bold text-[10px] uppercase tracking-wider">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center mb-2">
            {/* Hidden TextInput */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={text => {
                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(cleaned);
                if (cleaned.length === 6) {
                  Keyboard.dismiss();
                }
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={6}
              style={styles.hiddenInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.otpRow}
            >
              {renderSlots()}
            </TouchableOpacity>

            {error ? (
              <Animated.View entering={FadeIn.duration(300)}>
                <Text className="mt-2 text-red-500 font-medium text-sm text-center">
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            {isResending ? (
              <View className="mt-4 flex-row items-center justify-center">
                <Spinner color="primary" size="sm" />
                <Text className="text-primary dark:text-white font-bold text-base ml-2">
                  Sending code...
                </Text>
              </View>
            ) : !canResend ? (
              /* Countdown — button disabled */
              <View className="mt-4 items-center">
                <Text className="text-muted dark:text-muted-dark text-sm font-medium">
                  Resend code in{' '}
                  <Text className="text-primary dark:text-white font-bold">
                    0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                  </Text>
                </Text>
              </View>
            ) : (
              /* Timer expired — button active */
              <TouchableOpacity
                className="mt-4 self-center px-4 py-2 rounded-xl active:opacity-70"
                activeOpacity={0.7}
                onPress={handleResendOtp}
                disabled={isLoading}
              >
                <Text className="text-primary dark:text-white font-bold text-base underline text-center">
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            disabled={!isButtonActive}
            activeOpacity={0.8}
            className={`h-16 rounded-2xl shadow-lg mt-4 items-center justify-center ${isButtonActive ? 'bg-primary dark:bg-primary-dark' : 'bg-primary/30 dark:bg-primary-dark/30 shadow-none'}`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <Spinner color="white" size="sm" />
                <Text className="text-primary-foreground dark:text-primary-foreground text-xl font-black ml-3">
                  Verifying...
                </Text>
              </View>
            ) : (
              <Text
                className={`text-xl font-black ${isButtonActive ? 'text-primary-foreground dark:text-primary-foreground' : 'text-muted dark:text-muted-dark'}`}
              >
                Verify & Login
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-auto pt-10">
            <Text className="text-muted dark:text-muted-dark font-medium text-[10px] text-center leading-4">
              By continuing, you automatically accept our{'\n'}
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">
                Terms & Conditions
              </Text>
              ,
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">
                {' '}
                Privacy Policy
              </Text>{' '}
              and
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">
                {' '}
                Cookies Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    paddingVertical: 10,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
});
