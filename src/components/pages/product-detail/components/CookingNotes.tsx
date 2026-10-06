import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { SectionLabel } from './SectionLabel';

const MAX_LENGTH = 200;

/**
 * Free-text instructions for the kitchen. A multi-line well rather than the
 * kit's TextField, which is a fixed-height single line.
 */
export const CookingNotes = ({
  value,
  onChange,
  isVeg,
}: {
  value: string;
  onChange: (notes: string) => void;
  isVeg: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-5.5">
      <SectionLabel title="Add cooking instructions" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={
          isVeg
            ? 'e.g. Less oil, extra spicy, no onion…'
            : 'e.g. Make it extra smoky, less oil, no bones…'
        }
        multiline
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
        accessibilityLabel="Cooking instructions"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-18 rounded-lg border bg-surface px-3.5 py-3 font-jakarta-500 text-body text-ink ${
          isFocused ? 'border-ember' : 'border-card-hairline'
        }`}
        placeholderTextColorClassName="text-muted"
        cursorColorClassName="text-ember"
        selectionColorClassName="text-ember"
      />
    </View>
  );
};
