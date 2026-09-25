import React from 'react';
import { View, Text as RNText } from 'react-native';
import { avatarAt } from '../avatars';

/**
 * A preset avatar: the emoji, centred on its tint.
 *
 * The emoji is a plain RN Text, not the design system's — it carries no type
 * style and no tone, because an emoji is a glyph, not type: it ignores colour
 * and would only inherit a font family that has no face for it. Its size is
 * half the diameter, which is what keeps it optically centred at every size
 * the design uses (78, 92, and the picker's tiles).
 */
export const Avatar = ({
  id,
  size,
  className = '',
}: {
  id: number;
  size: number;
  className?: string;
}) => {
  const preset = avatarAt(id);

  return (
    <View
      accessible
      accessibilityLabel={`${preset.label} avatar`}
      style={{ width: size, height: size }}
      className={`rounded-pill items-center justify-center ${preset.tint} ${className}`.trim()}
    >
      <RNText style={{ fontSize: size * 0.5, lineHeight: size * 0.6 }}>
        {preset.emoji}
      </RNText>
    </View>
  );
};
