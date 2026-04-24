import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Keyboard, TextInput } from 'react-native';
import Animated, { SlideInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';

type RootStackParamList = {
  Login: { prefillPhone?: string };
  OtpVerification: { phone: string };
};

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  
  const [phone, setPhone] = useState(route.params?.prefillPhone || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    if (error) setError('');
    if (cleaned.length === 10) {
      Keyboard.dismiss();
    }
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    if (phone.length === 10) {
      setError('');
      setIsLoading(true);
      
      // Simulate professional API authentication delay
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('OtpVerification', { phone });
      }, 1500);
    } else {
      setError('Please enter a valid 10-digit phone number');
    }
  };

  const isButtonActive = phone.length === 10 && !isLoading;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary dark:bg-primary-dark"
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background dark:bg-background-dark"
        style={styles.scrollBackground}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section - 45% Height */}
        <View className="h-[45%] w-full bg-primary dark:bg-primary-dark items-center justify-center">
          <Animated.View entering={FadeInUp.duration(1000)} className="items-center">
             <View className="w-24 h-24 bg-primary-foreground/20 dark:bg-primary-foreground/20 rounded-full items-center justify-center">
                <Text className="text-5xl">🍔</Text>
             </View>
             <Text className="text-primary-foreground dark:text-primary-foreground text-4xl font-black mt-4">JJ's Kitchen</Text>
          </Animated.View>
        </View>

        {/* Floating Login Card */}
        <Animated.View 
          entering={SlideInDown.duration(600)} 
          className="flex-1 bg-surface dark:bg-surface-dark -mt-12 rounded-t-[40px] px-8 pt-10"
          style={[
            styles.cardShadow, 
            { paddingBottom: insets.bottom + 20 }
          ]}
        >
          <View className="items-center mb-10">
             <View className="w-16 h-1.5 bg-muted/30 dark:bg-muted-dark/30 rounded-full mb-6" />
             <Text className="text-foreground/80 dark:text-foreground-dark/80 font-medium text-lg text-center">Let's start with your phone number</Text>
          </View>

          <View className="mb-8">
            <View className="flex-row gap-x-3 items-start">
              {/* Country Code Box - Split Design */}
              <View 
                style={[styles.inputBox, error ? styles.inputBoxError : null]}
                className="w-20 h-16 rounded-2xl border-2 border-border dark:border-border-dark bg-white items-center justify-center"
              >
                <Text className="text-xl font-bold text-primary">+91</Text>
              </View>

              {/* Phone Number Input Box - Split Design */}
              <View className="flex-1">
                <View 
                  style={[styles.inputBox, error ? styles.inputBoxError : null]}
                  className="h-16 rounded-2xl border-2 border-border dark:border-border-dark bg-white px-4 justify-center"
                >
                  <TextInput 
                    placeholder="Enter phone number"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!isLoading}
                    style={[styles.inputText, phone ? styles.fontLarge : styles.fontSmall, styles.darkText]}
                    className="font-bold h-full p-0"
                  />
                </View>
                
                {error ? (
                  <Animated.View entering={FadeIn.duration(300)}>
                    <Text className="mt-2 ml-1 text-red-500 font-medium text-sm">{error}</Text>
                  </Animated.View>
                ) : null}
              </View>
            </View>
          </View>
          
          <Button 
            onPress={handleContinue}
            variant="primary"
            size="lg"
            isDisabled={!isButtonActive}
            className={`h-16 rounded-2xl shadow-lg ${isButtonActive ? 'bg-primary dark:bg-primary-dark' : 'bg-primary/30 dark:bg-primary-dark/30 shadow-none'}`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <Spinner color="white" size="sm" />
                <Text className="text-primary-foreground dark:text-primary-foreground text-xl font-black ml-3">Sending OTP</Text>
              </View>
            ) : (
              <Text className={`text-xl font-black ${isButtonActive ? 'text-primary-foreground dark:text-primary-foreground' : 'text-muted dark:text-muted-dark'}`}>
                Send OTP
              </Text>
            )}
          </Button>

          <View className="mt-auto pt-10 pb-4">
            <Text className="text-muted dark:text-muted-dark font-medium text-[10px] text-center leading-4">
              By continuing, you automatically accept our{"\n"}
              <Text className="text-foreground dark:text-foreground-dark font-bold underline">Terms & Conditions</Text>, 
              <Text className="text-foreground dark:text-foreground-dark font-bold underline"> Privacy Policy</Text> and 
              <Text className="text-foreground dark:text-foreground-dark font-bold underline"> Cookies Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  scrollBackground: {
    backgroundColor: 'transparent',
  },
  inputBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputBoxError: {
    borderColor: '#ef4444',
  },
  inputText: {
    paddingVertical: 0,
    includeFontPadding: false,
  },
  darkText: {
    color: '#170C79',
  },
  fontSmall: {
    fontSize: 14,
  },
  fontLarge: {
    fontSize: 20,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
});
