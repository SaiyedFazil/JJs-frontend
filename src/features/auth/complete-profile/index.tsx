import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  type TextInput,
  StatusBar,
  useColorScheme,
  Alert,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChefHat, ChevronLeft, ArrowRight, Sparkle } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth.store';
import { UserService } from '@/services/user.service';
import { NameStep } from './NameStep';
import { EmailStep } from './EmailStep';
import { COLORS, EMAIL_REGEX, styles } from './components/styles';

export const CompleteProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const setProfileCompleted = useAuthStore(state => state.setProfileCompleted);
  const updateUser = useAuthStore(state => state.updateUser);

  // Step Management: 1 = Names, 2 = Email
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const isLastNameFocused = useRef(false);
  const emailOtpRef = useRef<TextInput>(null);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (isLastNameFocused.current) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });
    return () => sub.remove();
  }, []);

  const handleLastNameFocus = () => {
    isLastNameFocused.current = true;
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      50,
    );
  };

  const handleLastNameBlur = () => {
    isLastNameFocused.current = false;
  };

  // Validation
  const isEmailValid = EMAIL_REGEX.test(email);
  const isStep1Valid =
    firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleNextStep = async () => {
    if (isStep1Valid) {
      setIsLoading(true);
      try {
        await UserService.updateProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        });

        // ── Persist the new name immediately ─────────────────────────────────
        // This writes to both Zustand (instant UI) and MMKV (survives restart).
        // Without this call, the profile screen shows "User Name" until logout/re-login
        // because the in-memory user object never received the updated name.
        updateUser({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });

        setCurrentStep(2);
      } catch (err: any) {
        Alert.alert(
          'Error',
          err?.message || 'Failed to update profile. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyEmail = () => {
    if (isEmailValid) {
      Keyboard.dismiss();
      setShowEmailOtp(true);
      setTimeout(() => emailOtpRef.current?.focus(), 400);
    }
  };

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
      setProfileCompleted(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* ── Professional Culinary Background ── */}
      <View className="absolute inset-0">
        {/* Subtle pattern of culinary icons */}
        <View className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] flex-row flex-wrap">
          {Array.from({ length: 24 }).map((_, i) => (
            <View
              key={i}
              className="p-10"
              style={{ transform: [{ rotate: `${i * 15}deg` }] }}
            >
              <ChefHat
                size={40}
                color={isDarkMode ? 'white' : COLORS.primary}
              />
            </View>
          ))}
        </View>

        {/* Large Elegant Watermark */}
        <View className="absolute top-[15%] right-[-20%] opacity-[0.05] dark:opacity-[0.1]">
          <ChefHat size={400} color={isDarkMode ? 'white' : COLORS.primary} />
        </View>

        <View className="absolute bottom-[5%] left-[-10%] opacity-[0.03] dark:opacity-[0.05]">
          <Sparkle size={300} color={isDarkMode ? 'white' : COLORS.primary} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Progress & Navigation ── */}
          <View className="px-8 flex-row items-center justify-between mb-10">
            {currentStep === 2 ? (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setCurrentStep(1);
                  setEmail('');
                  setShowEmailOtp(false);
                  setEmailOtp('');
                  setIsOtpFocused(false);
                }}
                className="w-12 h-12 rounded-2xl items-center justify-center border bg-surface/5 dark:bg-surface-dark/5 border-border dark:border-border-dark"
              >
                <ChevronLeft
                  size={20}
                  color={isDarkMode ? '#FFFFFF' : COLORS.primary}
                />
              </TouchableOpacity>
            ) : (
              <View className="w-12 h-12 rounded-2xl items-center justify-center bg-primary/10 dark:bg-primary-dark/10">
                <ChefHat
                  size={24}
                  color={isDarkMode ? '#FFFFFF' : COLORS.primary}
                />
              </View>
            )}

            {/* Right side: Skip pill when OTP is open or email is typed, progress dots otherwise */}
            {currentStep === 2 && (showEmailOtp || email.trim().length > 0) ? (
              (() => {
                const skipBgColor = isDarkMode ? '#1A1A1A' : '#F5F3FF';
                const skipBorderColor = isDarkMode ? '#2A2A2A' : '#DDD8F5';
                const skipTextColorValue = isDarkMode
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(23,12,121,0.6)';
                const skipIconColorValue = isDarkMode
                  ? 'rgba(255,255,255,0.4)'
                  : 'rgba(23,12,121,0.5)';

                return (
                  <Animated.View entering={FadeIn.duration(250)}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleFinish}
                      style={[
                        styles.skipButton,
                        {
                          backgroundColor: skipBgColor,
                          borderColor: skipBorderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.skipText, { color: skipTextColorValue }]}
                      >
                        Skip
                      </Text>
                      <ArrowRight
                        size={13}
                        color={skipIconColorValue}
                        strokeWidth={2.5}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })()
            ) : (
              <View className="flex-row">
                {[1, 2].map(s => (
                  <View
                    key={s}
                    className={`h-1.5 rounded-full mx-1 ${
                      s === currentStep
                        ? 'w-10 bg-primary dark:bg-primary-dark'
                        : 'w-2 bg-primary/20 dark:bg-primary-dark/20'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Content Section ── */}
          <View className="px-8 flex-1">
            <Animated.Text
              key={currentStep}
              entering={FadeIn.duration(600)}
              className="text-[30px] font-bold leading-[40px] tracking-tighter mb-2 text-foreground dark:text-foreground-dark"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {currentStep === 1 ? "Let's get started!" : 'Add your email'}
            </Animated.Text>

            <Animated.Text
              key={`desc-${currentStep}`}
              entering={FadeIn.delay(100).duration(600)}
              className="text-md font-semibold mb-6 leading-7 text-default-soft dark:text-foreground-dark/50"
            >
              {currentStep === 1
                ? "Welcome to JJ's Kitchen. To provide the best experience, we need your name."
                : 'This is optional, but it helps secure your account and track your orders.'}
            </Animated.Text>

            {currentStep === 1 ? (
              <NameStep
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                isDarkMode={isDarkMode}
                isStep1Valid={isStep1Valid}
                handleNextStep={handleNextStep}
                lastNameInputRef={lastNameInputRef}
                handleLastNameFocus={handleLastNameFocus}
                handleLastNameBlur={handleLastNameBlur}
                isLoading={isLoading}
              />
            ) : (
              <EmailStep
                email={email}
                setEmail={setEmail}
                isDarkMode={isDarkMode}
                showEmailOtp={showEmailOtp}
                setShowEmailOtp={setShowEmailOtp}
                emailOtp={emailOtp}
                setEmailOtp={setEmailOtp}
                isOtpFocused={isOtpFocused}
                setIsOtpFocused={setIsOtpFocused}
                isLoading={isLoading}
                isEmailValid={isEmailValid}
                emailOtpRef={emailOtpRef}
                handleVerifyEmail={handleVerifyEmail}
                handleFinish={handleFinish}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
