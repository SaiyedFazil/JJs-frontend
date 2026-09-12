import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Spinner } from 'heroui-native';
import { Text, type TextTone } from './Text';

/** PDF section 05 · Buttons. `disabled` is a state, not a variant. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'sm';

const BASE = 'flex-row items-center justify-center rounded-lg';

const SIZE: Record<ButtonSize, string> = {
  md: 'h-14 px-lg',
  sm: 'h-10 px-md',
};

const SURFACE: Record<ButtonVariant, string> = {
  primary: 'bg-ember shadow-ember-glow',
  secondary: 'bg-surface border border-hairline shadow-e1',
  ghost: 'bg-transparent',
  destructive: 'bg-chili shadow-e1',
};

const LABEL_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'on-ember',
  secondary: 'ink',
  ghost: 'ember',
  destructive: 'on-ember',
};

/** Sand ground with a muted label reads as disabled without a new token. */
const DISABLED_SURFACE = 'bg-sunken border border-hairline';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  loadingLabel,
  icon,
  className = '',
}: ButtonProps) => {
  const inactive = isDisabled || isLoading;
  const surface = inactive ? DISABLED_SURFACE : SURFACE[variant];
  const tone: TextTone = inactive ? 'muted' : LABEL_TONE[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      className={`${BASE} ${SIZE[size]} ${surface} ${className}`.trim()}
    >
      <View className="flex-row items-center gap-sm">
        {isLoading ? <Spinner size="sm" /> : icon}
        {/* `item` is Jakarta 17/600 — >= 14px bold keeps white-on-ember inside
            WCAG AA Large. See the spec's Contrast audit. */}
        <Text variant="item" tone={tone}>
          {isLoading ? (loadingLabel ?? label) : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
