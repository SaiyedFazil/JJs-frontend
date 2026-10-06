import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Text } from '@/components/ui';
import type { MenuSection } from '../hooks/use-menu-catalog';

/** How far from the rail's left edge the active tab is scrolled to. */
const LEAD_IN = 80;

/**
 * The sticky section rail. MenuScreen makes it sticky (stickyHeaderIndices)
 * and tells it which tab is active; the rail's only job of its own is to keep
 * that tab in view as the scroll-spy moves it.
 */
export const CategoryTabs = ({
  sections,
  activeId,
  onSelect,
  onLayout,
}: {
  sections: MenuSection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) => {
  const railRef = useRef<ScrollView>(null);
  const tabX = useRef<Record<string, number>>({});

  useEffect(() => {
    if (activeId == null) return;
    const x = tabX.current[activeId];
    if (x == null) return;
    railRef.current?.scrollTo({ x: Math.max(0, x - LEAD_IN), animated: true });
  }, [activeId]);

  return (
    <View
      onLayout={onLayout}
      className="bg-canvas border-b border-card-hairline"
    >
      <ScrollView
        ref={railRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-sm px-md py-3"
      >
        {sections.map(section => {
          const isActive = section.id === activeId;
          return (
            <TouchableOpacity
              key={section.id}
              onLayout={e => {
                tabX.current[section.id] = e.nativeEvent.layout.x;
              }}
              onPress={() => onSelect(section.id)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className={`rounded-pill px-4 py-2 ${
                isActive ? 'bg-ember' : 'bg-sunken'
              }`}
            >
              <Text
                variant="fine"
                weight="700"
                tone={isActive ? 'on-ember' : 'ink-soft'}
              >
                {section.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
