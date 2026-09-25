import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

/**
 * The green VERIFIED mark.
 *
 * Its ground has two forms because the chip appears on both surfaces, and a
 * translucent mint needs slightly more presence over charcoal than over white
 * to land at the same apparent strength.
 */
export const VerifiedChip = ({
  surface = 'canvas',
}: {
  surface?: 'canvas' | 'hero';
}) => (
  <View
    // No self-alignment of its own: in the header it sits on a text baseline
    // row, in the phone field it sits in a 56px field. Both parents already
    // centre their children, and a `self-start` here pinned it to the top of
    // the taller one.
    className={`flex-row items-center gap-0.5 px-1.5 py-1 rounded-sm ${
      surface === 'hero' ? 'bg-verified-tint-hero' : 'bg-verified-tint'
    }`}
  >
    <Icon icon={Check} className="text-verified" size={10} strokeWidth={3.5} />
    <Text variant="micro" weight="800" tone="verified" className="uppercase">
      Verified
    </Text>
  </View>
);
