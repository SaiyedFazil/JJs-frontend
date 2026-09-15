import React, { forwardRef, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Text, type TextTone } from './Text';
import type { Surface } from './surface';

/**
 * PDF section 05 · OTP input, 6-digit.
 *
 * A single offscreen TextInput owns the value and the keyboard; the visible
 * slots are presentational. This is what makes SMS autofill work — the OS
 * fills one field, not six.
 */
export interface OtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
  onFocusChange?: (focused: boolean) => void;
  /** The ground the input sits on. Defaults to the Cream 50 canvas. */
  surface?: Surface;
}

const THEME: Record<
  Surface,
  {
    /** On hero the slots stretch to share the full row, as in the auth flow. */
    slot: string;
    idleBorder: string;
    errorBorder: string;
    emptyGround: string;
    filledGround: string;
    charTone: TextTone;
    errorTone: TextTone;
  }
> = {
  canvas: {
    slot: 'w-11 h-14',
    idleBorder: 'border-hairline',
    errorBorder: 'border-chili',
    emptyGround: 'bg-surface',
    filledGround: 'bg-ember-tint',
    charTone: 'ink',
    errorTone: 'chili',
  },
  hero: {
    slot: 'flex-1 h-12',
    idleBorder: 'border-hero-hairline',
    errorBorder: 'border-hero-danger',
    emptyGround: 'bg-hero-surface',
    filledGround: 'bg-hero-surface',
    charTone: 'on-hero',
    errorTone: 'hero-danger',
  },
};

export const OtpInput = forwardRef<RNTextInput, OtpInputProps>(
  (
    {
      value,
      onChangeText,
      length = 6,
      error,
      autoFocus,
      onFocusChange,
      surface = 'canvas',
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const innerRef = useRef<RNTextInput>(null);
    const theme = THEME[surface];

    /** Keeps the forwarded ref usable while still owning focus internally. */
    const setRefs = (node: RNTextInput | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handleChange = (text: string) => {
      onChangeText(text.replace(/[^0-9]/g, '').slice(0, length));
    };

    return (
      <View>
        <RNTextInput
          ref={setRefs}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={length}
          autoFocus={autoFocus}
          style={styles.offscreen}
          onFocus={() => {
            setIsFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onFocusChange?.(false);
          }}
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => innerRef.current?.focus()}
          accessibilityRole="button"
          accessibilityLabel={`Enter the ${length}-digit code`}
          className="flex-row justify-center items-center gap-sm py-sm"
        >
          {Array.from({ length }).map((_, i) => {
            const char = value[i];
            const isActive = isFocused && i === value.length;
            const border = error
              ? theme.errorBorder
              : isActive
                ? 'border-ember'
                : theme.idleBorder;
            const ground = char ? theme.filledGround : theme.emptyGround;

            return (
              <View
                key={i}
                pointerEvents="none"
                className={`${theme.slot} rounded-md border items-center justify-center ${border} ${ground}`}
              >
                {char ? (
                  <Animated.View entering={ZoomIn.duration(160)}>
                    <Text variant="h2" tone={theme.charTone}>
                      {char}
                    </Text>
                  </Animated.View>
                ) : null}
                {isActive ? (
                  <View className="w-0.5 h-6 bg-ember absolute rounded-pill" />
                ) : null}
              </View>
            );
          })}
        </TouchableOpacity>

        {error ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text
              variant="caption"
              tone={theme.errorTone}
              className="mt-sm text-center"
            >
              {error}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  },
);

OtpInput.displayName = 'OtpInput';

/** Layout-only: keeps the real input focusable but invisible. */
const styles = StyleSheet.create({
  offscreen: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
