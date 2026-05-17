import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard,
  TextInput,
  Dimensions,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  SlideInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner } from 'heroui-native';
import { AuthService } from '@/services/auth.service';
import { clearAuthData } from '@/utils/storage';
import { useAppToast } from '@/hooks/useAppToast';

const { PhoneNumberHintModule } = NativeModules;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;
const MIN_HEADER_HEIGHT = 200;
const CARD_OVERLAP = 48; // -mt-12 = 12 * 4
const MIN_CARD_OVERLAP = 34; // keep card rounded corners visible inside header

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
            <Text className="text-primary-foreground dark:text-primary-foreground text-4xl font-black mt-4">
              JJ's Kitchen
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Floating Login Card */}
        <Animated.View
          entering={SlideInDown.duration(600)}
          className="flex-1 bg-surface dark:bg-surface-dark rounded-t-[40px] px-8 pt-10"
          style={[
            styles.cardShadow,
            { paddingBottom: insets.bottom + 20 },
            animatedCardStyle,
          ]}
        >
          <View className="items-center mb-10">
            <View className="w-16 h-1.5 bg-muted/30 dark:bg-muted-dark/30 rounded-full mb-6" />
            <Text className="text-foreground/80 dark:text-foreground-dark/80 font-medium text-lg text-center">
              Let's start with your phone number
            </Text>
          </View>

          <View className="mb-8">
            <View className="flex-row gap-x-3 items-start">
              {/* Country Code Box */}
              <View
                style={[styles.inputBox, error ? styles.inputBoxError : null]}
                className="w-20 h-16 rounded-2xl border-2 border-border dark:border-border-dark bg-white items-center justify-center"
              >
                <Text className="text-xl font-bold text-primary">+91</Text>
              </View>

              {/* Phone Number Input Box */}
              <View className="flex-1">
                <View
                  style={[styles.inputBox, error ? styles.inputBoxError : null]}
                  className="h-16 rounded-2xl border-2 border-border dark:border-border-dark bg-white px-4 justify-center"
                >
                  <TextInput
                    placeholder="Enter phone number"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    onChangeText={handlePhoneChange}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!isLoading}
                    style={[
                      styles.inputText,
                      phone ? styles.fontLarge : styles.fontSmall,
                      styles.darkText,
                    ]}
                    className="font-bold h-full p-0"
                  />
                </View>

                {error ? (
                  <Animated.View entering={FadeIn.duration(300)}>
                    <Text className="mt-2 ml-1 text-red-500 font-medium text-sm">
                      {error}
                    </Text>
                  </Animated.View>
                ) : null}
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isButtonActive}
            activeOpacity={0.8}
            className={`h-16 rounded-2xl shadow-lg items-center justify-center ${isButtonActive ? 'bg-primary dark:bg-primary-dark' : 'bg-primary/30 dark:bg-primary-dark/30 shadow-none'}`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <Spinner color="white" size="sm" />
                <Text className="text-primary-foreground dark:text-primary-foreground text-xl font-black ml-3">
                  Sending OTP
                </Text>
              </View>
            ) : (
              <Text
                className={`text-xl font-black ${isButtonActive ? 'text-primary-foreground dark:text-primary-foreground' : 'text-muted dark:text-muted-dark'}`}
              >
                Send OTP
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-auto pt-10 pb-4">
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
  inputBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputBoxError: {
    borderColor: '#ef4444',
  },
  inputText: {
    paddingVertical: 0,
    includeFontPadding: false,
  },
  darkText: {
    color: '#170C79',
  },
  fontSmall: {
    fontSize: 14,
  },
  fontLarge: {
    fontSize: 20,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
});
