import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronLeft, Heart, Share2 } from 'lucide-react-native';
import { Icon } from '@/components/ui';

const ChromeButton = ({
  label,
  onPress,
  isSelected,
  children,
}: {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  children: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={
      isSelected == null ? undefined : { selected: isSelected }
    }
    className="w-10 h-10 rounded-pill bg-hero/55 items-center justify-center"
  >
    {children}
  </TouchableOpacity>
);

/**
 * Back, share and favourite, floating over the photo. They sit outside the
 * scroll view, so they stay put while the page scrolls under them; their
 * charcoal glass keeps them legible over the photo and the cream body alike.
 */
export const GalleryChrome = ({
  top,
  isFavourite,
  onBack,
  onShare,
  onToggleFavourite,
}: {
  top: number;
  isFavourite: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleFavourite: () => void;
}) => (
  <View
    pointerEvents="box-none"
    // Layout-only: clears the status-bar inset, a runtime value.
    style={{ top }}
    className="absolute left-md right-md flex-row items-center justify-between"
  >
    <ChromeButton label="Go back" onPress={onBack}>
      <Icon
        icon={ChevronLeft}
        className="text-hero-foreground"
        size={22}
        strokeWidth={2.2}
      />
    </ChromeButton>

    <View className="flex-row gap-2">
      <ChromeButton label="Share" onPress={onShare}>
        <Icon
          icon={Share2}
          className="text-hero-foreground"
          size={18}
          strokeWidth={2}
        />
      </ChromeButton>
      <ChromeButton
        label="Favourite"
        isSelected={isFavourite}
        onPress={onToggleFavourite}
      >
        <Icon
          icon={Heart}
          className={isFavourite ? 'text-ember' : 'text-hero-foreground'}
          fill={isFavourite ? 'currentColor' : 'none'}
          size={20}
          strokeWidth={2}
        />
      </ChromeButton>
    </View>
  </View>
);
