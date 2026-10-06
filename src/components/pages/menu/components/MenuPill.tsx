import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Menu } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

/** The floating charcoal pill that opens the category index. */
export const MenuPill = ({
  dishCount,
  onPress,
}: {
  dishCount: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={`Browse sections, ${dishCount} dishes`}
    className="self-center flex-row items-center gap-sm bg-hero rounded-pill px-5 py-3 shadow-lift"
  >
    <Icon icon={Menu} className="text-saffron" size={17} strokeWidth={2.2} />
    <Text variant="fine" tone="hero-chrome" weight="800">
      Menu
    </Text>
    <View className="w-1 h-1 rounded-pill bg-hero-muted" />
    <Text variant="fine" tone="hero-muted" weight="700">
      {`${dishCount} dishes`}
    </Text>
  </TouchableOpacity>
);
