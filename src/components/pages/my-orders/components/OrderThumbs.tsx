import React from 'react';
import { Text as RNText, View } from 'react-native';
import { CATEGORY_EMOJI, CATEGORY_TINT, Text, VegBadge } from '@/components/ui';
import { byId } from '@/data/menu';
import type { OrderLine } from '@/types/order.types';

/** How many thumbnails fit before the rest collapse into a "+N". */
const MAX_THUMBS = 3;

/**
 * The overlapping stack of dish thumbnails on an order card. Each thumbnail is
 * the dish's cuisine tile — the same tint and glyph the menu uses — resolved
 * from the line's `dishId`, so no order carries its own artwork. On its corner
 * rides the shared VegBadge mark. The stack overlaps left-to-right and caps at
 * three, with a "+N" tile for the rest.
 */
export const OrderThumbs = ({ lines }: { lines: OrderLine[] }) => {
  const shown = lines.slice(0, MAX_THUMBS);
  const extra = lines.length - shown.length;

  return (
    <View className="flex-row">
      {shown.map((line, i) => {
        const dish = byId[line.dishId];
        const tint = (dish && CATEGORY_TINT[dish.cat]) ?? 'bg-sunken';
        const glyph = (dish && CATEGORY_EMOJI[dish.cat]) ?? '\u{1F37D}';
        return (
          <View
            key={line.dishId}
            // Overlap every tile after the first; layout-only negative margin.
            style={i === 0 ? undefined : { marginLeft: -10 }}
            className={`relative w-11 h-11 items-center justify-center rounded-md border-2 border-surface shadow-e1 ${tint}`}
          >
            <RNText style={{ fontSize: 20 }}>{glyph}</RNText>
            {/* Corner mark, lifted onto a white chip so it reads on any tint. */}
            <View className="absolute -bottom-1 -right-1 rounded-sm bg-surface p-px">
              <VegBadge isVeg={line.veg} size={11} />
            </View>
          </View>
        );
      })}
      {extra > 0 ? (
        <View
          style={{ marginLeft: -10 }}
          className="w-11 h-11 items-center justify-center rounded-md border-2 border-surface bg-sunken shadow-e1"
        >
          <Text variant="micro" tone="muted" weight="700">
            {`+${extra}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
