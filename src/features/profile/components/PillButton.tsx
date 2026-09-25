import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Spinner } from 'heroui-native';
import { Text, type TextTone } from '@/components/ui';

/**
 * The profile flow's button.
 *
 * Deliberately NOT `components/ui/Button`: that primitive is the PDF's button
 * — 56/40px tall with a 17px label — and it is correct everywhere it is used
 * today. This screen's design calls for shorter, tighter controls (a 40px
 * header action, a translucent control sitting on the charcoal header, a pair
 * of 48px dialog buttons). Bending the shared Button into all of that would
 * have changed every screen that already uses it; this stays inside the
 * feature, where it can only affect the profile.
 *
 * Every value below still resolves to a token.
 */
export type PillVariant =
  'primary' | 'danger' | 'outline' | 'hero-glass' | 'ember-outline';

export type PillSize = 'sm' | 'md' | 'lg';

const GROUND: Record<PillVariant, string> = {
  primary: 'bg-ember shadow-ember-glow',
  danger: 'bg-chili',
  outline: 'bg-surface border border-border-strong',
  'hero-glass': 'bg-hero-glass border border-hero-glass-hairline',
  'ember-outline': 'bg-ember-wash border border-ember',
};

const LABEL_TONE: Record<PillVariant, TextTone> = {
  primary: 'on-ember',
  danger: 'on-ember',
  outline: 'ink',
  'hero-glass': 'hero-chrome',
  'ember-outline': 'ember',
};

const SIZE: Record<PillSize, string> = {
  sm: 'h-10 px-md rounded-md',
  // 12px rather than 16: `md` is the size a pair of these share a dialog row
  // at, where each one is barely wider than its label. At px-md, "Stay logged
  // in" wrapped onto a second line and the button grew to meet it.
  md: 'h-12 px-3 rounded-md',
  lg: 'h-14 px-lg rounded-lg',
};

/** `fine` at 800 is the design's 12–13px action label; `body` its 14–15px one. */
const LABEL_VARIANT: Record<PillSize, 'fine' | 'body'> = {
  sm: 'fine',
  md: 'body',
  lg: 'body',
};

export interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: PillVariant;
  size?: PillSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  /** Layout only — `flex-1` in a row, `w-full` on its own. */
  className?: string;
}

export const PillButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  isDisabled = false,
  className = '',
}: PillButtonProps) => {
  const inactive = isDisabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      className={`flex-row items-center justify-center ${SIZE[size]} ${
        GROUND[variant]
      } ${inactive ? 'opacity-60' : ''} ${className}`.trim()}
    >
      <View className="flex-row items-center gap-sm">
        {isLoading ? <Spinner size="sm" /> : icon}
        {/* One line, always. A wrapped label makes the button taller than its
            size promises, which is worse than a rare ellipsis. */}
        <Text
          variant={LABEL_VARIANT[size]}
          weight="800"
          tone={LABEL_TONE[variant]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
