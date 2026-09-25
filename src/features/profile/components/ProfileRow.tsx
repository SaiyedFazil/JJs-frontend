import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Icon, Text, type TextTone } from '@/components/ui';

/**
 * One row inside a section card: icon tile, title over subtitle, an optional
 * count badge, and the disclosure chevron.
 *
 * The divider is drawn on the row rather than between rows so the last one in
 * a card can simply omit it — a separator drawn by the parent would have to
 * know how many children it has.
 */
export interface ProfileRowProps {
  /** A lucide icon, already coloured by the caller to suit the tile. */
  icon: React.ReactNode;
  /** The tile's ground, as a literal utility (`bg-ember-tint`, …). */
  tile: string;
  title: string;
  subtitle: string;
  badge?: string;
  /** `ember` is for something that wants attention — unread, new. */
  badgeTone?: 'neutral' | 'ember';
  /** `chili` marks the destructive row; it also drops the chevron. */
  tone?: Extract<TextTone, 'ink' | 'chili'>;
  isLast?: boolean;
  onPress?: () => void;
}

export const ProfileRow = memo(
  ({
    icon,
    tile,
    title,
    subtitle,
    badge,
    badgeTone = 'neutral',
    tone = 'ink',
    isLast = false,
    onPress,
  }: ProfileRowProps) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${title}, ${badge}` : title}
      accessibilityHint={subtitle}
      className={`flex-row items-center gap-3 px-4 py-3.5 ${
        isLast ? '' : 'border-b border-row-divider'
      }`}
    >
      <View
        className={`w-9.5 h-9.5 rounded-md items-center justify-center ${tile}`}
      >
        {icon}
      </View>

      <View className="flex-1">
        <Text variant="body" weight="700" tone={tone}>
          {title}
        </Text>
        <Text variant="fine" tone="label" className="mt-1">
          {subtitle}
        </Text>
      </View>

      {badge ? (
        <View
          className={`px-2 py-1 rounded-sm ${
            badgeTone === 'ember' ? 'bg-ember' : 'bg-badge'
          }`}
        >
          <Text
            variant="micro"
            weight="800"
            tone={badgeTone === 'ember' ? 'on-ember' : 'muted'}
          >
            {badge}
          </Text>
        </View>
      ) : null}

      {/* The destructive row is an action, not a destination — a chevron
          there would promise another screen. */}
      {tone === 'chili' ? null : (
        <Icon
          icon={ChevronRight}
          className="text-chevron"
          size={18}
          strokeWidth={2.2}
        />
      )}
    </TouchableOpacity>
  ),
);

ProfileRow.displayName = 'ProfileRow';
