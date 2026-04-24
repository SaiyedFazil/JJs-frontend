import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Animated.View entering={ZoomIn.duration(1000)} exiting={FadeOut.duration(500)} className="items-center">
        <View className="w-24 h-24 bg-surface rounded-3xl items-center justify-center mb-6 shadow-lg shadow-black/20">
          <Text className="text-primary text-4xl font-extrabold">JJ's</Text>
        </View>
        <Text className="text-primary-foreground text-5xl font-extrabold tracking-tight">Kitchen</Text>
        <Text className="text-primary-foreground/80 text-lg font-medium mt-2 tracking-wide">Taste the perfection</Text>
      </Animated.View>
    </View>

  );
};
