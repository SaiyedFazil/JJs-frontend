import React from 'react';
import { View, TextInput, Keyboard } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Mail, ShieldCheck, Check } from 'lucide-react-native';
import { Button, OtpInput, Text, TextField } from '@/components/ui';

interface EmailStepProps {
  email: string;
  setEmail: (text: string) => void;
  showEmailOtp: boolean;
  setShowEmailOtp: (show: boolean) => void;
  emailOtp: string;
  setEmailOtp: (text: string) => void;
  setIsOtpFocused: (focused: boolean) => void;
  isLoading: boolean;
  isEmailValid: boolean;
  emailOtpRef: React.RefObject<TextInput | null>;
  handleVerifyEmail: () => void;
  handleFinish: () => void;
}

export const EmailStep: React.FC<EmailStepProps> = ({
  email,
  setEmail,
  showEmailOtp,
  setShowEmailOtp,
  emailOtp,
  setEmailOtp,
  setIsOtpFocused,
  isLoading,
  isEmailValid,
  emailOtpRef,
  handleVerifyEmail,
  handleFinish,
}) => {
  /**
   * Step 2 has four mutually exclusive action states: nothing typed, a valid
   * address awaiting verification, the OTP open, and an invalid address.
   */
  const renderAction = () => {
    if (email.length === 0) {
      return (
        <Button
          label="Skip & finish"
          variant="secondary"
          onPress={handleFinish}
          icon={<Check size={18} className="text-ink" strokeWidth={3} />}
        />
      );
    }

    if (isEmailValid && !showEmailOtp) {
      return (
        <Button
          label="Verify email"
          onPress={handleVerifyEmail}
          icon={
            <ShieldCheck size={18} className="text-on-ember" strokeWidth={3} />
          }
        />
      );
    }

    if (showEmailOtp) {
      return (
        <Button
          label="Verify email"
          loadingLabel="Verifying..."
          onPress={handleFinish}
          isDisabled={emailOtp.length < 6}
          isLoading={isLoading}
          icon={
            <ShieldCheck size={18} className="text-on-ember" strokeWidth={3} />
          }
        />
      );
    }

    return <Button label="Invalid email" isDisabled />;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      className="w-full"
    >
      {/* Email field — locked once the code has been sent */}
      <TextField
        label="Email address (optional)"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (showEmailOtp) {
            setShowEmailOtp(false);
            setEmailOtp('');
          }
        }}
        placeholder="john@example.com"
        icon={<Mail size={18} className="text-muted" />}
        keyboardType="email-address"
        autoCapitalize="none"
        isDisabled={showEmailOtp}
      />

      {showEmailOtp ? (
        <Animated.View entering={FadeIn.duration(350)} className="mb-md">
          <View className="flex-row items-center gap-sm mb-md">
            <View className="w-7 h-7 rounded-sm bg-ember-tint items-center justify-center">
              <ShieldCheck size={13} className="text-ember" />
            </View>
            <Text
              variant="body"
              tone="muted"
              numberOfLines={1}
              className="flex-1"
            >
              Code sent to{' '}
              <Text variant="body" tone="ink">
                {email}
              </Text>
            </Text>
          </View>

          <OtpInput
            ref={emailOtpRef}
            value={emailOtp}
            onChangeText={text => {
              setEmailOtp(text);
              if (text.length === 6) Keyboard.dismiss();
            }}
            onFocusChange={setIsOtpFocused}
          />

          <Button
            label="Change email"
            variant="ghost"
            size="sm"
            className="self-start mt-sm"
            onPress={() => {
              setShowEmailOtp(false);
              setEmailOtp('');
              setTimeout(() => emailOtpRef.current?.blur(), 50);
            }}
          />
        </Animated.View>
      ) : null}

      <View className="mt-sm">{renderAction()}</View>
    </Animated.View>
  );
};
