import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  type TextInput,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChefHat, ChevronLeft, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth.store';
import { UserService } from '@/services/user.service';
import { Button, Text } from '@/components/ui';
import { NameStep } from './NameStep';
import { EmailStep } from './EmailStep';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CompleteProfileScreen = () => {
  const insets = useSafeAreaInsets();
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
  const [, setIsOtpFocused] = useState(false);
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

        // Persist the new name immediately, to both Zustand (instant UI) and
        // MMKV (survives restart). Without this the profile screen shows
        // "User Name" until logout/re-login, because the in-memory user
        // object never receives the updated name.
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

  const showSkip =
    currentStep === 2 && (showEmailOtp || email.trim().length > 0);

  return (
    <View className="flex-1 bg-canvas">
      {/* A single sunken wash, replacing the old violet ChefHat watermark
          field — the PDF's canvas is plain Cream 50 with a sand accent. */}
      <View className="absolute top-0 left-0 right-0 h-64 bg-sunken rounded-b-sheet" />

      {/* `padding` is correct on iOS; on Android it fights the native
          windowSoftInputMode and pushes the layout twice. */}
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
          <View className="px-xl flex-row items-center justify-between mb-xl">
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
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="w-12 h-12 rounded-lg items-center justify-center bg-surface border border-hairline"
              >
                <ChevronLeft size={20} className="text-ink" />
              </TouchableOpacity>
            ) : (
              <View className="w-12 h-12 rounded-lg items-center justify-center bg-ember-tint">
                <ChefHat size={24} className="text-ember" />
              </View>
            )}

            {showSkip ? (
              <Animated.View entering={FadeIn.duration(250)}>
                <Button
                  label="Skip"
                  variant="ghost"
                  size="sm"
                  onPress={handleFinish}
                  icon={
                    <ArrowRight
                      size={13}
                      className="text-ember"
                      strokeWidth={2.5}
                    />
                  }
                />
              </Animated.View>
            ) : (
              <View className="flex-row gap-xs">
                {[1, 2].map(s => (
                  <View
                    key={s}
                    className={`h-1.5 rounded-pill ${
                      s === currentStep ? 'w-10 bg-ember' : 'w-2 bg-hairline'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Content Section ── */}
          <View className="px-xl flex-1">
            <Animated.View key={currentStep} entering={FadeIn.duration(600)}>
              <Text variant="h1" className="mb-sm">
                {currentStep === 1 ? "Let's get started!" : 'Add your email'}
              </Text>
            </Animated.View>

            <Animated.View
              key={`desc-${currentStep}`}
              entering={FadeIn.delay(100).duration(600)}
            >
              <Text variant="body" tone="muted" className="mb-lg">
                {currentStep === 1
                  ? "Welcome to JJ's Kitchen. To provide the best experience, we need your name."
                  : 'This is optional, but it helps secure your account and track your orders.'}
              </Text>
            </Animated.View>

            {currentStep === 1 ? (
              <NameStep
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
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
                showEmailOtp={showEmailOtp}
                setShowEmailOtp={setShowEmailOtp}
                emailOtp={emailOtp}
                setEmailOtp={setEmailOtp}
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

/** Layout-only: the ScrollView must be able to grow past the viewport. */
const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
});
