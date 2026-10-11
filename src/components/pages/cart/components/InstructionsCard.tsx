import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

const MAX_LENGTH = 200;

/**
 * A note to the kitchen for the whole order. Collapsed it is a row naming the
 * note (or inviting one); tapped, it opens a multi-line well in place — the
 * screen's scroller is keyboard-aware, so the well rides above the keyboard.
 */
export const InstructionsCard = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) => {
  const [isOpen, setOpen] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const note = value.trim();

  return (
    <View className="px-4 pt-3.5">
      <View className="rounded-md border border-card-hairline bg-surface">
        <TouchableOpacity
          onPress={() => setOpen(open => !open)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          className="flex-row items-center gap-3 px-3.5 py-3"
        >
          <View className="w-8.5 h-8.5 items-center justify-center rounded-md bg-tile-sand">
            <Icon
              icon={Pencil}
              className="text-muted"
              size={17}
              strokeWidth={2}
            />
          </View>
          <View className="flex-1">
            <Text variant="fine" weight="700">
              {note ? 'Cooking instructions' : 'Add cooking instructions'}
            </Text>
            <Text variant="micro" tone="label" weight="500" numberOfLines={1}>
              {note || 'Any note for the restaurant?'}
            </Text>
          </View>
          <Icon
            icon={isOpen ? ChevronDown : ChevronRight}
            className="text-chevron"
            size={18}
            strokeWidth={2.2}
          />
        </TouchableOpacity>

        {isOpen ? (
          <View className="px-3.5 pb-3.5">
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Less oil, pack the gravy separately…"
              multiline
              autoFocus
              maxLength={MAX_LENGTH}
              textAlignVertical="top"
              accessibilityLabel="Cooking instructions"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`min-h-18 rounded-md border bg-canvas px-3.5 py-3 font-jakarta-500 text-fine text-ink ${
                isFocused ? 'border-ember' : 'border-card-hairline'
              }`}
              placeholderTextColorClassName="text-muted"
              cursorColorClassName="text-ember"
              selectionColorClassName="text-ember"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};
