import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { Mail, ShieldCheck, ChevronLeft, Check } from 'lucide-react-native';
import { Spinner } from 'heroui-native';
import { GlassInput } from './components/GlassInput';
import { COLORS, styles } from './components/styles';

interface EmailStepProps {
  email: string;
  setEmail: (text: string) => void;
  isDarkMode: boolean;
  showEmailOtp: boolean;
  setShowEmailOtp: (show: boolean) => void;
  emailOtp: string;
  setEmailOtp: (text: string) => void;
  isOtpFocused: boolean;
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
  isDarkMode,
  showEmailOtp,
  setShowEmailOtp,
  emailOtp,
  setEmailOtp,
  isOtpFocused,
  setIsOtpFocused,
  isLoading,
  isEmailValid,
  emailOtpRef,
  handleVerifyEmail,
  handleFinish,
}) => {
  const renderOtpSlots = () => {
    const digitColor = isDarkMode ? '#FFFFFF' : COLORS.primary;
    const cursorColor = isDarkMode ? '#FFFFFF' : COLORS.primary;

    const slots = [];
    for (let i = 0; i < 6; i++) {
      const char = emailOtp[i];
      const isActive = isOtpFocused && i === emailOtp.length;
      const isFilled = Boolean(char);

      const slotStyle = isActive
        ? isDarkMode
          ? styles.otpSlotActiveDark
          : styles.otpSlotActive
        : isFilled
          ? isDarkMode
            ? styles.otpSlotFilledDark
            : styles.otpSlotFilled
          : isDarkMode
            ? styles.otpSlotIdleDark
            : styles.otpSlotIdle;

      slots.push(
        <View key={i} style={[styles.otpSlot, slotStyle]}>
          {char ? (
            <Animated.Text
              entering={ZoomIn}
              style={[styles.otpDigit, { color: digitColor }]}
            >
              {char}
            </Animated.Text>
          ) : null}
          {isActive && (
            <View
              style={[styles.otpCursor, { backgroundColor: cursorColor }]}
            />
          )}
        </View>,
      );
    }
    return slots;
  };

  // Pre-computed theme tokens for this block
  const shieldBadgeBg = isDarkMode ? '#1E1B2E' : '#EAE8F8';
  const shieldIconColor = isDarkMode ? '#A89FE8' : COLORS.primary;
  const subtitleColor = isDarkMode
    ? 'rgba(255,255,255,0.5)'
    : 'rgba(23,12,121,0.55)';
  const subtitleEmailClr = isDarkMode ? '#FFFFFF' : COLORS.primary;
  const chipBg = isDarkMode ? '#1A1A2E' : '#EDEAF9';
  const chipBorder = isDarkMode ? '#2E2A4A' : '#C8C2EF';
  const chipIconColor = isDarkMode ? '#8B7FD4' : COLORS.primary;
  const chipTextColor = isDarkMode ? '#8B7FD4' : COLORS.primary;

  return (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
      {/* Email field — disabled once OTP is active */}
      <GlassInput
        label="Email Address (Optional)"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (showEmailOtp) {
            setShowEmailOtp(false);
            setEmailOtp('');
          }
        }}
        placeholder="john@example.com"
        icon={<Mail size={18} color={isDarkMode ? 'white' : COLORS.primary} />}
        keyboardType="email-address"
        isDark={isDarkMode}
        disabled={showEmailOtp}
      />

      {/* ── Inline OTP Section ── */}
      {showEmailOtp && (
        <Animated.View
          entering={FadeIn.duration(350)}
          style={styles.otpSection}
        >
          {/* Status chip: code sent to … */}
          <View style={styles.otpSubtitleRow}>
            <View
              style={[
                styles.otpShieldBadge,
                { backgroundColor: shieldBadgeBg },
              ]}
            >
              <ShieldCheck size={13} color={shieldIconColor} />
            </View>
            <Text
              numberOfLines={1}
              style={[styles.otpSubtitleText, { color: subtitleColor }]}
            >
              Code sent to{' '}
              <Text
                style={[styles.otpSubtitleEmail, { color: subtitleEmailClr }]}
              >
                {email}
              </Text>
            </Text>
          </View>

          {/* Hidden capture input */}
          <TextInput
            ref={emailOtpRef}
            value={emailOtp}
            onChangeText={text => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
              setEmailOtp(cleaned);
              if (cleaned.length === 6) Keyboard.dismiss();
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            onFocus={() => setIsOtpFocused(true)}
            onBlur={() => setIsOtpFocused(false)}
          />

          {/* OTP Slot Row */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => emailOtpRef.current?.focus()}
            style={styles.otpSlotsRow}
          >
            {renderOtpSlots()}
          </TouchableOpacity>

          {/* Change Email — professional chip */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setShowEmailOtp(false);
              setEmailOtp('');
              setTimeout(() => emailOtpRef.current?.blur(), 50);
            }}
            style={[
              styles.changeEmailChip,
              { backgroundColor: chipBg, borderColor: chipBorder },
            ]}
          >
            <ChevronLeft size={13} color={chipIconColor} strokeWidth={3} />
            <Text style={[styles.changeEmailText, { color: chipTextColor }]}>
              Change Email
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Actions for Step 2 */}
      <View style={styles.actionArea}>
        {email.length === 0 ? (
          <TouchableOpacity
            onPress={handleFinish}
            activeOpacity={0.8}
            className={`h-18 rounded-[30px] flex-row items-center justify-center border ${
              isDarkMode
                ? 'bg-[#1A1A1A] border-white/5'
                : 'bg-white border-primary/5'
            } shadow-sm`}
          >
            <Text
              className={`text-lg font-black mr-2 ${isDarkMode ? 'text-white' : 'text-primary'}`}
            >
              Skip & Finish
            </Text>
            <Check
              size={20}
              color={isDarkMode ? 'white' : COLORS.primary}
              strokeWidth={3}
            />
          </TouchableOpacity>
        ) : isEmailValid && !showEmailOtp ? (
          /* ── Stage 2: Valid email entered → show "Verify Email" button ── */
          <TouchableOpacity
            onPress={handleVerifyEmail}
            activeOpacity={0.8}
            className="h-18 rounded-[30px] flex-row items-center justify-center bg-primary dark:bg-primary-dark"
          >
            <Text className="text-lg font-black mr-2 text-primary-foreground">
              Verify Email
            </Text>
            <ShieldCheck size={20} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        ) : showEmailOtp ? (
          /* ── Stage 3: OTP visible → disabled until 6 digits filled ── */
          <TouchableOpacity
            onPress={emailOtp.length === 6 ? handleFinish : undefined}
            activeOpacity={emailOtp.length === 6 ? 0.8 : 1}
            disabled={emailOtp.length < 6 || isLoading}
            className={`h-18 rounded-[30px] flex-row items-center justify-center ${
              emailOtp.length === 6
                ? 'bg-primary dark:bg-primary-dark'
                : isDarkMode
                  ? 'bg-[#1A1A1A]'
                  : 'bg-gray-100'
            }`}
          >
            {isLoading ? (
              <Spinner color="#FFFFFF" size="sm" />
            ) : (
              <>
                <Text
                  className={`text-lg font-black mr-2 ${
                    emailOtp.length === 6
                      ? 'text-primary-foreground'
                      : isDarkMode
                        ? 'text-white/20'
                        : 'text-black/20'
                  }`}
                >
                  Verify Email
                </Text>
                <ShieldCheck
                  size={20}
                  color={
                    emailOtp.length === 6
                      ? '#FFFFFF'
                      : isDarkMode
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.2)'
                  }
                  strokeWidth={3}
                />
              </>
            )}
          </TouchableOpacity>
        ) : (
          /* ── Stage 1b: Email typed but invalid ── */
          <View
            className={`h-18 rounded-[30px] items-center justify-center ${
              isDarkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-lg font-black ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}
            >
              Invalid Email
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
