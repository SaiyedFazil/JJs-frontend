import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, Plus, Minus } from 'lucide-react-native';

interface FoodListItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    rating: number;
    image: string;
    description?: string;
    isVeg?: boolean;
    reviews?: number;
  };
  onAdd?: () => void;
  onRemove?: () => void;
  quantity?: number;
}

export const FoodListItem = memo(({ item, onAdd, onRemove, quantity = 0 }: FoodListItemProps) => {
  return (
    <View className="py-6 flex-row items-start border-b border-border/20 dark:border-border-dark/20">
      {/* Left Content */}
      <View className="flex-1 pr-4">
        {/* Veg/Non-Veg Indicator */}
        <View className={`w-4 h-4 border-2 items-center justify-center rounded-sm mb-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
          <View className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
        </View>

        <Text className="text-foreground dark:text-foreground-dark text-[17px] font-black leading-6 mb-1" numberOfLines={2}>
          {item.name}
        </Text>

        <Text className="text-primary dark:text-primary-dark font-black text-lg mb-1.5">
          ₹{item.price}
        </Text>

        {/* Rating Badge */}
        <View className="flex-row items-center bg-green-50 dark:bg-green-900/10 self-start px-2 py-0.5 rounded-lg mb-3">
          <Star size={11} fill="#16A34A" color="#16A34A" />
          <Text className="text-green-700 dark:text-green-400 text-[11px] font-black ml-1">
            {item.rating} {item.reviews ? `(${item.reviews})` : ''}
          </Text>
        </View>

        <Text className="text-muted dark:text-muted-dark text-[13px] leading-5 font-medium" numberOfLines={2}>
          {item.description || 'Fresh and delicious meal prepared with the finest ingredients.'}
        </Text>
      </View>

      {/* Right Content - Image & Add Button */}
      <View className="items-center">
        <View className="relative">
          <Image 
            source={{ uri: item.image }} 
            className="w-32 h-32 rounded-3xl"
            resizeMode="cover"
          />
          
          {/* Add Button Overlay */}
          <View className="absolute -bottom-3 left-0 right-0 items-center">
            {quantity > 0 ? (
              <View className="flex-row items-center bg-primary dark:bg-primary-dark rounded-xl shadow-lg px-2 py-2">
                <TouchableOpacity onPress={onRemove} className="p-1">
                  <Minus size={18} color="white" strokeWidth={3} />
                </TouchableOpacity>
                <Text className="mx-4 text-white font-black text-base">{quantity}</Text>
                <TouchableOpacity onPress={onAdd} className="p-1">
                  <Plus size={18} color="white" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={onAdd}
                activeOpacity={0.9}
                style={styles.addButton}
                className="bg-primary dark:bg-primary-dark rounded-2xl shadow-lg px-6 py-2.5"
              >
                <Text className="text-primary-foreground dark:text-primary-foreground font-black text-sm uppercase tracking-wider">ADD</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  addButton: {
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#170C79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
