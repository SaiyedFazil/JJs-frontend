import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text, type TextTone } from './Text';
import type { Surface } from './surface';

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
  /** The ground the field sits on. Defaults to the Cream 50 canvas. */
  surface?: Surface;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const THEME: Record<
  Surface,
  {
    idleBorder: string;
    errorBorder: string;
    ground: string;
    disabledGround: string;
    input: string;
    placeholder: string;
    labelTone: TextTone;
    valueTone: TextTone;
    errorTone: TextTone;
  }
> = {
  canvas: {
    idleBorder: 'border-hairline',
    errorBorder: 'border-chili',
    ground: 'bg-surface',
    disabledGround: 'bg-sunken',
    input: 'text-ink',
    placeholder: 'text-muted',
    labelTone: 'muted',
    valueTone: 'ink',
    errorTone: 'chili',
  },
  hero: {
    idleBorder: 'border-hero-hairline',
    errorBorder: 'border-hero-danger',
    ground: 'bg-hero-surface',
    disabledGround: 'bg-hero-surface',
    input: 'text-hero-foreground',
    placeholder: 'text-hero-muted',
    labelTone: 'hero-muted',
    valueTone: 'on-hero',
    errorTone: 'hero-danger',
  },
};

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
      surface = 'canvas',
      className = '',
      onFocus,
      onBlur,
      ...inputProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const theme = THEME[surface];

    const border = error
      ? theme.errorBorder
      : isFocused
        ? 'border-ember'
        : theme.idleBorder;
    const ground = isDisabled ? theme.disabledGround : theme.ground;

    return (
      <View className={`mb-md ${className}`.trim()}>
        {label ? (
          <Text
            variant="caption"
            tone={theme.labelTone}
            className="mb-sm ml-xs"
          >
            {label}
          </Text>
        ) : null}

        <View
          className={`flex-row items-center h-14 rounded-lg px-md border ${border} ${ground} ${
            isDisabled ? 'opacity-60' : ''
          }`}
        >
          {icon ? <View className="mr-sm opacity-60">{icon}</View> : null}
          {prefix ? (
            <Text variant="item" tone={theme.valueTone} className="mr-sm">
              {prefix}
            </Text>
          ) : null}
          <RNTextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={!isDisabled}
            className={`flex-1 font-jakarta-600 text-item p-0 ${theme.input}`}
            placeholderTextColorClassName={theme.placeholder}
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
            <Text
              variant="caption"
              tone={theme.errorTone}
              className="mt-sm ml-xs"
            >
              {error}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';
