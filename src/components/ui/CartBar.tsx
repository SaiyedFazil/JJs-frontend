import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Text } from './Text';

/** The sticky ember cart bar. Rendered only when the cart is non-empty. */
export const CartBar = ({
  count,
  total,
  onPress,
}: {
  count: number;
  total: number;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={`View cart, ${count} items, ${total} rupees`}
    className="flex-row items-center justify-between bg-ember rounded-lg px-md py-sm shadow-ember-glow"
  >
    <View className="flex-row items-center gap-sm">
      <View className="bg-surface/20 rounded-sm px-sm py-xs">
        <Text variant="caption" tone="on-ember">
          {count}
        </Text>
      </View>
      <View>
        <Text variant="body" tone="on-ember" weight="800">
          {`₹${total}`}
        </Text>
        <Text variant="fine" tone="on-ember" className="opacity-80">
          plus taxes
        </Text>
      </View>
    </View>

    <View className="flex-row items-center gap-xs">
      <Text variant="body" tone="on-ember" weight="800">
        View cart
      </Text>
      <ArrowRight size={17} className="text-on-ember" strokeWidth={2.4} />
    </View>
  </TouchableOpacity>
);
