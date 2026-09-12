import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from './Text';

/**
 * PDF section 05 · Text fields. Three visual states — idle, focused, error —
 * plus disabled. Colors come from tokens; the focus ring is the ember border.
 */
export interface TextFieldProps extends Pick<
  TextInputProps,
  | 'keyboardType'
  | 'autoCapitalize'
  | 'returnKeyType'
  | 'maxLength'
  | 'onSubmitEditing'
  | 'textContentType'
  | 'autoComplete'
  | 'submitBehavior'
  | 'secureTextEntry'
> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  /** Static leading text, e.g. the "+91" dial code. */
  prefix?: string;
  isDisabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TextField = forwardRef<RNTextInput, TextFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      error,
      icon,
      prefix,
      isDisabled = false,
      className = '',
      onFocus,
      onBlur,
      ...inputProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const border = error
      ? 'border-chili'
      : isFocused
        ? 'border-ember'
        : 'border-hairline';
    const surface = isDisabled ? 'bg-sunken' : 'bg-surface';

    return (
      <View className={`mb-md ${className}`.trim()}>
        {label ? (
          <Text variant="caption" tone="muted" className="mb-sm ml-xs">
            {label}
          </Text>
        ) : null}

        <View
          className={`flex-row items-center h-14 rounded-lg px-md border ${border} ${surface} ${
            isDisabled ? 'opacity-60' : ''
          }`}
        >
          {icon ? <View className="mr-sm opacity-60">{icon}</View> : null}
          {prefix ? (
            <Text variant="item" className="mr-sm">
              {prefix}
            </Text>
          ) : null}
          <RNTextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={!isDisabled}
            className="flex-1 font-jakarta-600 text-item text-ink p-0"
            placeholderTextColorClassName="text-muted"
            cursorColorClassName="text-ember"
            selectionColorClassName="text-ember"
            onFocus={() => {
              if (isDisabled) return;
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            {...inputProps}
          />
        </View>

        {error ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text variant="caption" tone="chili" className="mt-sm ml-xs">
              {error}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';
