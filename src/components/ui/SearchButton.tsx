import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { Text } from './Text';

/**
 * Looks like a field, behaves like a button: tapping it opens search rather
 * than raising a keyboard in the header. Deliberately NOT a TextInput.
 */
export const SearchButton = ({
  placeholder = 'Search dishes…',
  onPress,
}: {
  placeholder?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="search"
    accessibilityLabel={placeholder}
    className="w-full flex-row items-center gap-sm bg-hero-foreground rounded-md px-md py-sm h-12"
  >
    <Search size={19} className="text-muted" strokeWidth={2} />
    <Text variant="body" tone="muted">
      {placeholder}
    </Text>
  </TouchableOpacity>
);
