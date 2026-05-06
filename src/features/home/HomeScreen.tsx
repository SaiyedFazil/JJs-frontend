import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, TextInput } from 'react-native';
import { MapPin, ChevronRight, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

// Components
import { FoodListItem } from '@/components/common/FoodListItem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.42;

const CATEGORIES = [
  { id: '1', name: 'Burger', emoji: '🍔' },
  { id: '2', name: 'Pizza', emoji: '🍕' },
  { id: '3', name: 'Sushi', emoji: '🍣' },
  { id: '4', name: 'Desserts', emoji: '🍰' },
  { id: '5', name: 'Pasta', emoji: '🍝' },
  { id: '6', name: 'Salads', emoji: '🥗' },
];

const POPULAR_ITEMS = [
  { 
    id: '1', 
    name: 'Classic Cheeseburger', 
    price: 299, 
    rating: 4.8, 
    reviews: 120,
    isVeg: false,
    description: 'Juicy beef patty with melted cheddar, pickles, and our signature sauce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop' 
  },
  { 
    id: '2', 
    name: 'Pepperoni Feast Pizza', 
    price: 449, 
    rating: 4.9, 
    reviews: 85,
    isVeg: false,
    description: 'Loaded with spicy pepperoni, mozzarella, and classic tomato sauce.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=500&auto=format&fit=crop' 
  },
];

const MOST_ORDERED = [
  { 
    id: '3', 
    name: 'Spicy Paneer Tikka', 
    price: 349, 
    rating: 4.6, 
    reviews: 210,
    isVeg: true,
    description: 'Grilled paneer cubes marinated in spicy yogurt and indian spices.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=500&auto=format&fit=crop' 
  },
  { 
    id: '4', 
    name: 'Garden Fresh Salad', 
    price: 179, 
    rating: 4.3, 
    reviews: 45,
    isVeg: true,
    description: 'A mix of organic greens, cherry tomatoes, and honey lemon dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&auto=format&fit=crop' 
  },
];

/**
 * Section Header Component
 */
const SectionHeader = memo(({ title }: { title: string }) => (
  <View className="flex-row justify-between items-center px-6 mb-4">
    <Text className="text-xl font-black text-foreground dark:text-foreground-dark">{title}</Text>
    <TouchableOpacity className="flex-row items-center">
      <Text className="text-primary dark:text-primary-dark font-bold mr-1">View all</Text>
      <ChevronRight size={16} className="text-primary dark:text-primary-dark" />
    </TouchableOpacity>
  </View>
));

/**
 * Category Item Component
 */
const CategoryItem = memo(({ cat, index }: { cat: any; index: number }) => (
  <Animated.View 
    entering={FadeInRight.delay(index * 100)} 
    className="items-center mx-2.5"
  >
    <TouchableOpacity className="bg-surface dark:bg-surface-dark w-16 h-16 rounded-[20px] items-center justify-center shadow-md shadow-primary/10 border border-border/40 dark:border-border-dark/20 mb-2.5">
      <Text className="text-2xl">{cat.emoji}</Text>
    </TouchableOpacity>
    <Text className="text-foreground dark:text-foreground-dark font-black text-[10px] uppercase tracking-wider">{cat.name}</Text>
  </Animated.View>
));

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Banner Section - Covers phone top */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop' }}
          style={[styles.banner, { height: BANNER_HEIGHT }]}
          imageStyle={styles.bannerImage}
        >
          {/* Address Header Overlay */}
          <View style={{ paddingTop: insets.top + 10 }} className="items-center w-full">
            <View className="bg-black/70 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 items-center">
              <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-0.5">Delivery location</Text>
              <TouchableOpacity className="flex-row items-center">
                <MapPin size={16} className="text-primary dark:text-primary-dark" fill="currentColor" fillOpacity={0.4} />
                <Text className="text-white w-40 font-black text-sm mx-2" numberOfLines={1}>351 Maison Street, NY</Text>
                <ChevronRight size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar Overlay - At the bottom of the banner */}
          <View className="mt-auto px-6 mb-8">
            <View className="flex-row items-center bg-white dark:bg-surface-dark h-14 rounded-full px-5 shadow-2xl border border-primary/5">
              <Search size={20} className="text-muted dark:text-muted-dark" />
              <TextInput 
                placeholder="Search by item name..."
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-foreground dark:text-foreground-dark font-bold text-sm"
              />
            </View>
          </View>
        </ImageBackground>

        {/* Categories Horizontal Scroll */}
        <View className="mt-8">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORIES.map((cat, index) => (
              <CategoryItem key={cat.id} cat={cat} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Items Section */}
        <View className="mt-12">
          <SectionHeader title="Popular Items" />
          <View className="px-6">
            {POPULAR_ITEMS.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
                <FoodListItem 
                  item={item} 
                  onAdd={() => console.log('Add', item.name)} 
                />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Most Ordered Section */}
        <View className="mt-8 mb-32">
          <SectionHeader title="Most Ordered" />
          <View className="px-6">
            {MOST_ORDERED.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
                <FoodListItem 
                  item={item} 
                  onAdd={() => console.log('Add', item.name)} 
                />
              </Animated.View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  bannerImage: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
  },
});
