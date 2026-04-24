import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const slides = [
  {
    id: 1,
    title: 'Delicious Food',
    description: 'Discover the best meals around you, prepared with fresh ingredients.',
    color: '#170C79', // Using primary
  },
  {
    id: 2,
    title: 'Fast Delivery',
    description: 'Get your favorite meals delivered to your doorstep in minutes.',
    color: '#56B6C6', // Using accent
  },
  {
    id: 3,
    title: 'Easy Payments',
    description: 'Pay safely and easily with multiple payment options.',
    color: '#8ACBD0', // Using default
  },
];

export const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const slide = slides[currentSlide];

  return (
    <View className="flex-1 bg-background">
      <Animated.View 
        key={currentSlide}
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
        className="flex-1 rounded-b-[60px] items-center justify-center p-8"
        style={{ backgroundColor: slide.color + '1A' }}
      >
        <View className="w-64 h-64 rounded-full items-center justify-center" style={{ backgroundColor: slide.color }}>
          <Text className="text-primary-foreground text-3xl font-bold">JJ's</Text>
        </View>
      </Animated.View>

      <View className="h-[40%] px-8 py-10 justify-between bg-surface">
        <Animated.View 
          key={`text-${currentSlide}`}
          entering={FadeInRight.duration(500).delay(100)}
        >
          <Text className="text-3xl font-extrabold text-foreground mb-4">{slide.title}</Text>
          <Text className="text-lg text-muted leading-relaxed">{slide.description}</Text>
        </Animated.View>

        <View className="flex-row items-center justify-between mt-8">
          <View className="flex-row space-x-2">
            {slides.map((s, index) => (
              <View 
                key={s.id} 
                className={`h-2 rounded-full ${index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted/30'}`}
              />
            ))}
          </View>
          
          <View className="flex-row space-x-4 items-center">
            {currentSlide < slides.length - 1 && (
              <Pressable onPress={handleSkip}>
                <Text className="text-muted font-semibold px-4 text-base">Skip</Text>
              </Pressable>
            )}
            <Pressable 
              onPress={handleNext}
              className="bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary/30"
            >
              <Text className="text-primary-foreground font-bold text-lg">{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

