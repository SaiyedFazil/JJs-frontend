import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Keyboard,
  TextInput,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Spinner } from 'heroui-native';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useAppToast } from '@/hooks/useAppToast';
import { Text, OtpInput } from '@/components/ui';

// ── Native modules ────────────────────────────────────────────────────────────
const { SmsRetrieverModule } = NativeModules;

const OTP_LENGTH = 6;

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
  /** The code last sent for verification, so each entry is submitted once. */
  const submittedOtpRef = useRef('');
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

  // Start timer on mount; clean up on unmount.
  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startResendTimer]);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      inputRef.current?.blur();
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
      hideSubscription.remove();
      clearTimeout(timer);
      if (Platform.OS === 'android') {
        smsReceivedSub?.remove();
        smsTimeoutSub?.remove();
        SmsRetrieverModule.stopSmsRetriever?.();
      }
    };
  }, []);

  const handleVerify = useCallback(async () => {
    if (otp.length === OTP_LENGTH) {
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
  }, [otp, authToken, setAuth]);

  // Verify as soon as the last digit lands — typed or filled from the SMS.
  // Editing the code re-arms it, so the same code can be retried.
  useEffect(() => {
    if (otp.length < OTP_LENGTH) {
      submittedOtpRef.current = '';
      return;
    }
    if (submittedOtpRef.current === otp) return;
    submittedOtpRef.current = otp;
    handleVerify();
  }, [otp, handleVerify]);

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

  const renderStatus = () => {
    if (isLoading || isResending) {
      return (
        <View className="flex-row items-center justify-center gap-sm">
          <Spinner size="sm" />
          <Text variant="body" tone="ember">
            {isLoading ? 'Verifying...' : 'Sending code...'}
          </Text>
        </View>
      );
    }

    return (
      <Text variant="body" tone="hero-muted" className="text-center">
        Didn't get it?{' '}
        {canResend ? (
          <Text
            variant="body"
            tone="ember"
            className="font-jakarta-700"
            accessibilityRole="button"
            onPress={handleResendOtp}
            suppressHighlighting
          >
            Resend code
          </Text>
        ) : (
          <Text variant="body" tone="ember" className="font-jakarta-700">
            Resend in 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
          </Text>
        )}
      </Text>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-hero"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        className="px-lg"
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Login', { prefillPhone: phone })}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Change phone number"
          className="w-10 h-10 self-start rounded-md border border-hero-hairline bg-hero-surface items-center justify-center"
        >
          <ChevronLeft size={20} className="text-hero-foreground" />
        </TouchableOpacity>

        <Animated.View entering={FadeInUp.duration(600)}>
          <Text variant="h2" tone="on-hero" className="mt-xl">
            Verify your number
          </Text>
          <Text variant="body" tone="hero-muted" className="mt-sm">
            Enter the {OTP_LENGTH}-digit code sent to{' '}
            <Text variant="body" tone="on-hero" className="font-jakarta-700">
              +91 {phone.slice(0, 5)} {phone.slice(5)}
            </Text>
          </Text>
        </Animated.View>

        <View className="mt-lg">
          <OtpInput
            ref={inputRef}
            surface="hero"
            length={OTP_LENGTH}
            value={otp}
            onChangeText={text => {
              setOtp(text);
              if (text.length === OTP_LENGTH) Keyboard.dismiss();
            }}
            error={error || undefined}
          />
        </View>

        <View className="mt-auto pt-xl">{renderStatus()}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/** Layout-only: lets the resend line pin to the bottom yet scroll on short screens. */
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
