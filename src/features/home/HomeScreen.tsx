import React, { memo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { ChevronRight, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
  Text,
  FoodCard,
  CategoryChip,
  LocationBar,
  TextField,
  type FoodItem,
} from '@/components/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.42;

/** The restaurant's actual sections, per the PDF's category chips. */
const CATEGORIES = [
  'All',
  'Tandoor',
  'Starters',
  'Mutton',
  'Seafood',
  'Veg only',
];

const POPULAR_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Burrah',
    price: 419,
    rating: 4.7,
    reviews: 120,
    isVeg: false,
    tag: 'BESTSELLER',
    description:
      'Charcoal-grilled chicken chops in a smoky yogurt & chilli marinade.',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Mutton Seekh',
    price: 699,
    rating: 4.9,
    reviews: 85,
    isVeg: false,
    isSpicy: true,
    description:
      'Hand-minced mutton on the skewer, finished over natural charcoal.',
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=500&auto=format&fit=crop',
  },
];

const MOST_ORDERED: FoodItem[] = [
  {
    id: '3',
    name: 'Paneer Tikka Masala',
    price: 349,
    rating: 4.6,
    reviews: 210,
    isVeg: true,
    description: 'Cottage cheese in a rich makhani gravy, finished with cream.',
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Garden Fresh Salad',
    price: 179,
    strikePrice: 219,
    rating: 4.3,
    reviews: 45,
    isVeg: true,
    description:
      'A mix of organic greens, cherry tomatoes, and honey lemon dressing.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&auto=format&fit=crop',
  },
];

const SectionHeader = memo(({ title }: { title: string }) => (
  <View className="flex-row justify-between items-center px-lg mb-md">
    <Text variant="title">{title}</Text>
    <TouchableOpacity
      accessibilityRole="button"
      className="flex-row items-center gap-xs"
    >
      <Text variant="caption" tone="ember">
        View all
      </Text>
      <ChevronRight size={16} className="text-ember" />
    </TouchableOpacity>
  </View>
));

SectionHeader.displayName = 'SectionHeader';

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop',
          }}
          style={[styles.banner, { height: BANNER_HEIGHT }]}
          imageStyle={styles.bannerImage}
        >
          {/* Ink 900 scrim keeps the location bar legible over any photo. */}
          <View className="absolute inset-0 bg-hero/40" />

          <View
            style={{ paddingTop: insets.top + 10 }}
            className="items-center w-full"
          >
            <LocationBar
              label="Deliver to · Home"
              address="351 Maison Street, Bandra W"
              onHero
            />
          </View>

          <View className="mt-auto px-lg mb-xl">
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder="Search by item name…"
              icon={<Search size={20} className="text-muted" />}
              className="mb-0"
            />
          </View>
        </ImageBackground>

        {/* Categories */}
        <View className="mt-xl">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORIES.map((name, index) => (
              <Animated.View
                key={name}
                entering={FadeInRight.delay(index * 60)}
              >
                <CategoryChip
                  label={name}
                  isActive={name === category}
                  onPress={() => setCategory(name)}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        <View className="mt-xl">
          <SectionHeader title="Popular items" />
          <View className="px-lg">
            {POPULAR_ITEMS.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <FoodCard item={item} />
              </Animated.View>
            ))}
          </View>
        </View>

        <View className="mt-xl mb-32">
          <SectionHeader title="Most ordered" />
          <View className="px-lg">
            {MOST_ORDERED.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <FoodCard item={item} />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/** Layout-only: values Tailwind cannot express against an ImageBackground. */
const styles = StyleSheet.create({
  banner: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  bannerImage: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
});
