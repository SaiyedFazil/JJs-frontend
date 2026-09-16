import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Spinner } from 'heroui-native';
import { useCSSVariable } from 'uniwind';
import { Text, type TextTone } from './Text';
import type { Surface } from './surface';

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

/**
 * On canvas, a sand ground with a muted label reads as disabled without a new
 * token. On hero, a sand slab would glare against Ink 900, so the button keeps
 * its ember ground at half strength instead.
 */
const INACTIVE: Record<Surface, { ground: string; tone: TextTone }> = {
  canvas: { ground: 'bg-sunken border border-hairline', tone: 'muted' },
  hero: { ground: 'bg-ember/50', tone: 'on-ember' },
};

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  /** The ground the button sits on. Defaults to the Cream 50 canvas. */
  surface?: Surface;
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
  surface = 'canvas',
  className = '',
}: ButtonProps) => {
  const onEmber = useCSSVariable('--color-on-ember');
  const inactive = isDisabled || isLoading;
  const ground = inactive ? INACTIVE[surface].ground : SURFACE[variant];
  const tone: TextTone = inactive
    ? INACTIVE[surface].tone
    : LABEL_TONE[variant];

  // The default spinner is ember, which vanishes on the hero's ember ground.
  const spinnerColor =
    surface === 'hero' && typeof onEmber === 'string' ? onEmber : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      className={`${BASE} ${SIZE[size]} ${ground} ${className}`.trim()}
    >
      <View className="flex-row items-center gap-sm">
        {isLoading ? <Spinner size="sm" color={spinnerColor} /> : icon}
        {/* `item` is Jakarta 17/600 — >= 14px bold keeps white-on-ember inside
            WCAG AA Large. See the spec's Contrast audit. */}
        <Text variant="item" tone={tone}>
          {isLoading ? (loadingLabel ?? label) : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
