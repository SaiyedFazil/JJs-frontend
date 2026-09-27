import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Keyboard,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '@/lib/api/auth/auth-api';
import { clearAuthData } from '@/lib/storage';
import { useAppToast } from '@/hooks/use-app-toast';
import { Text, Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/types/navigation.types';
import { BrandMark } from '../components/BrandMark';
import { usePhoneNumberHint } from './hooks/use-phone-number-hint';

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();

  const [phone, setPhone] = useState(route.params?.prefillPhone || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toast = useAppToast();

  useEffect(() => {
    // Proactively clear stale auth data to prevent token conflicts during login
    clearAuthData();
  }, []);

  usePhoneNumberHint({
    skip: Boolean(route.params?.prefillPhone),
    onNumber: setPhone,
  });

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
        const response = await authApi.sendOtp('+91', phone);

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
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        className="px-lg"
      >
        <Animated.View entering={FadeInUp.duration(600)}>
          <BrandMark size="sm" />
          <Text variant="h2" tone="on-hero" className="mt-xl">
            Smoke, spice{'\n'}& everything grilled.
          </Text>
          <Text variant="body" tone="hero-muted" className="mt-sm">
            Enter your phone number to get started. We'll send a one-time code.
          </Text>
        </Animated.View>

        <Text variant="caption" tone="hero-muted" className="mt-xl mb-sm ml-xs">
          Phone number
        </Text>
        <View className="flex-row gap-sm">
          <View className="h-14 px-md rounded-lg border border-hero-hairline bg-hero-surface items-center justify-center">
            <Text variant="item" tone="on-hero">
              +91
            </Text>
          </View>
          <TextField
            surface="hero"
            value={phone}
            onChangeText={handlePhoneChange}
            error={error || undefined}
            keyboardType="number-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={10}
            isDisabled={isLoading}
            className="flex-1"
          />
        </View>

        <View className="mt-auto pt-xl">
          <Button
            surface="hero"
            label="Send code"
            loadingLabel="Sending code"
            onPress={handleContinue}
            isDisabled={!isButtonActive && !isLoading}
            isLoading={isLoading}
          />
          <Text variant="fine" tone="hero-muted" className="mt-md text-center">
            By continuing you agree to our Terms & Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/** Layout-only: lets the footer pin to the bottom yet scroll on short screens. */
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
