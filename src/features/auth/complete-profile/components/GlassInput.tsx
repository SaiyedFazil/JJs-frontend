import React, { useState, useEffect, forwardRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import { COLORS } from './styles';

export interface GlassInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  returnKeyType?: 'default' | 'next' | 'done';
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  containerRef?: React.RefObject<View | null>;
  isDark: boolean;
  disabled?: boolean;
}

export const GlassInput = forwardRef<TextInput, GlassInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      icon,
      error,
      keyboardType = 'default',
      autoCapitalize = 'none',
      returnKeyType = 'default',
      onFocus,
      onBlur,
      onSubmitEditing,
      containerRef,
      isDark,
      disabled = false,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);
    const disabledAnim = useSharedValue(disabled ? 1 : 0);

    useEffect(() => {
      focusAnim.value = withTiming(isFocused && !disabled ? 1 : 0, {
        duration: 250,
      });
    }, [isFocused, focusAnim, disabled]);

    useEffect(() => {
      disabledAnim.value = withTiming(disabled ? 1 : 0, { duration: 300 });
    }, [disabled, disabledAnim]);

    const animatedStyle = useAnimatedStyle(() => {
      const defaultBorder = isDark ? '#333333' : '#D8D4F0';
      const focusedBorder = isDark ? '#FFFFFF' : '#170C79';
      const disabledBorder = isDark ? '#222222' : '#E8E6F5';
      const defaultBg = isDark ? '#1A1A1A' : '#FFFFFF';
      const focusedBg = isDark ? '#242424' : '#FFFFFF';
      const disabledBg = isDark ? '#141414' : '#F4F2FB';

      const activeBorder = error ? COLORS.error : defaultBorder;

      return {
        borderColor: interpolateColor(
          disabledAnim.value,
          [0, 1],
          [
            interpolateColor(
              focusAnim.value,
              [0, 1],
              [activeBorder, focusedBorder],
            ),
            disabledBorder,
          ],
        ),
        backgroundColor: interpolateColor(
          disabledAnim.value,
          [0, 1],
          [
            interpolateColor(focusAnim.value, [0, 1], [defaultBg, focusedBg]),
            disabledBg,
          ],
        ),
        opacity: interpolate(disabledAnim.value, [0, 1], [1, 0.6]),
        transform: [{ scale: interpolate(focusAnim.value, [0, 1], [1, 1.01]) }],
      };
    });

    return (
      <View ref={containerRef} className="mb-3">
        <Text className="text-foreground/40 dark:text-foreground-dark/40 font-black text-[10px] uppercase tracking-[3px] mb-2.5 ml-1">
          {label}
        </Text>
        <Animated.View
          style={[animatedStyle]}
          className="flex-row items-center h-16 rounded-[24px] px-5 border"
        >
          <View className="mr-4 opacity-50">{icon}</View>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={
              isDark ? 'rgba(255,255,255,0.3)' : 'rgba(23, 12, 121, 0.3)'
            }
            className="flex-1 font-bold text-[16px] text-foreground dark:text-foreground-dark"
            editable={!disabled}
            onFocus={() => {
              if (disabled) return;
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            submitBehavior={
              returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'
            }
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
          {disabled && (
            <View className="ml-2 opacity-40">
              <ShieldCheck
                size={16}
                color={isDark ? 'white' : COLORS.primary}
              />
            </View>
          )}
        </Animated.View>
        {error ? (
          <Animated.Text
            entering={FadeIn}
            className="text-red-400 text-[10px] font-bold mt-2 ml-2"
          >
            {error}
          </Animated.Text>
        ) : null}
      </View>
    );
  },
);

GlassInput.displayName = 'GlassInput';
