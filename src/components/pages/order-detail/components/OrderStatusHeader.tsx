import React from 'react';
import { View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Icon, RadialGlow, Text } from '@/components/ui';
import type { StatusHeader } from '../hooks/use-order-detail';

/**
 * The full-bleed status band at the top of a receipt. Its ground carries the
 * verdict as a hue — green for a settled order (delivered or picked up), brown
 * for a cancelled one — with a brighter icon tile, a radial glow bleeding off
 * the corner, and a title + subline lifted for legibility on that ground.
 *
 * All colour comes from the order-detail tokens in global.css; the two themes
 * swap the whole set at once.
 */
export const OrderStatusHeader = ({ header }: { header: StatusHeader }) => {
  const settled = header.theme === 'settled';

  return (
    <View
      className={`relative overflow-hidden px-md py-lg ${
        settled ? 'bg-status-settled' : 'bg-status-void'
      }`}
    >
      {/* The corner bloom — veg-green on a settled band, coral on a void one. */}
      <RadialGlow
        token={settled ? 'veg-bright' : 'status-void-mark'}
        size={180}
        opacity={0.22}
        style={{ top: -60, right: -40 }}
      />

      <View className="flex-row items-center gap-md">
        <View
          // Layout-only: the design's 52px tile is not a Tailwind step.
          style={{ width: 52, height: 52 }}
          className={`items-center justify-center rounded-lg ${
            settled ? 'bg-status-settled-tile' : 'bg-status-void-tile'
          }`}
        >
          <Icon
            icon={settled ? Check : X}
            className={settled ? 'text-on-ember' : 'text-status-void-mark'}
            size={26}
            strokeWidth={settled ? 2.6 : 2.2}
          />
        </View>

        <View className="flex-1">
          <Text
            variant="h2"
            weight="800"
            className={
              settled ? 'text-status-settled-title' : 'text-status-void-title'
            }
          >
            {header.title}
          </Text>
          <Text
            variant="fine"
            weight="600"
            className={`mt-xs ${
              settled ? 'text-status-settled-sub' : 'text-status-void-sub'
            }`}
          >
            {header.note}
          </Text>
        </View>
      </View>
    </View>
  );
};
