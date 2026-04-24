import React, { useState, useRef, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet, Keyboard, TextInput, Dimensions } from 'react-native';
import Animated, { SlideInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
  Login: { prefillPhone?: string };
  OtpVerification: { phone: string };
};

export const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OtpVerification'>>();
  const insets = useSafeAreaInsets();
  const { phone } = route.params;

  // Professional Focus Management
  useEffect(() => {
    // 1. Sync state with hardware keyboard events
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      inputRef.current?.blur();
      setIsFocused(false);
    });

    // 2. Safe delay to ensure screen animation is 100% complete
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 800);

    return () => {
      hideSubscription.remove();
      clearTimeout(timer);
    };
  }, []);

  const handleVerify = () => {
    Keyboard.dismiss();
    if (otp.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        console.log('OTP Verified');
      }, 1500);
    }
  };

  const isButtonActive = otp.length === 6 && !isLoading;

  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i];
      const isActive = isFocused && i === otp.length;
      
      slots.push(
        <View 
          key={i}
          className={`w-11 h-14 rounded-xl border-2 justify-center items-center bg-white ${
            isActive ? 'border-primary dark:border-primary-dark' : 'border-border dark:border-border-dark'
          }`}
          pointerEvents="none"
        >
          {char ? (
            <Animated.Text 
              entering={ZoomIn.duration(200)}
              className="text-2xl font-black text-[#170C79]"
            >
              {char}
            </Animated.Text>
          ) : null}
          {isActive && <View className="w-0.5 h-6 bg-primary dark:bg-primary-dark absolute" />}
        </View>
      );

    }
    return slots;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary dark:bg-primary-dark"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
        <View style={{ height: SCREEN_HEIGHT * 0.45 }} className="w-full bg-primary dark:bg-primary-dark items-center justify-center">
          <Animated.View entering={FadeInUp.duration(1000)} className="items-center">
             <View className="w-24 h-24 bg-primary-foreground/20 dark:bg-primary-foreground/20 rounded-full items-center justify-center">
                <Text className="text-5xl">🍔</Text>
             </View>
             <Text className="text-primary-foreground dark:text-primary-foreground text-3xl font-black mt-3">Verify OTP</Text>
          </Animated.View>
        </View>

        {/* Floating Card Section */}
        <Animated.View 
          entering={SlideInDown.duration(600)} 
          className="flex-1 bg-surface dark:bg-surface-dark -mt-10 rounded-t-[40px] px-8 pt-8"
          style={[
            styles.cardShadow, 
            { minHeight: SCREEN_HEIGHT * 0.6, paddingBottom: insets.bottom + 40 }
          ]}
        >
          <View className="items-center mb-2">
             <View className="w-16 h-1.5 bg-muted/30 dark:bg-muted-dark/30 rounded-full mb-6" />
             <Text className="text-foreground/80 dark:text-foreground-dark/80 font-medium text-lg text-center px-4 leading-6">
                JJ's Kitchen has sent a 6-digit code to
             </Text>
             <View className="flex-row items-center justify-center mt-2">
               <Text className="text-foreground dark:text-foreground-dark font-semibold text-base">+91 {phone}</Text>
               <TouchableOpacity 
                 onPress={() => navigation.navigate('Login', { prefillPhone: phone })}
                 className="ml-3 bg-muted/10 border border-border dark:border-border-dark px-2 py-1 rounded-xl flex-row items-center shadow-sm active:bg-muted/20"
               >
                 <Text className="text-primary dark:text-white mr-1.5 text-[10px]">✎</Text>
                 <Text className="text-primary dark:text-white font-bold text-[10px] uppercase tracking-wider">Change</Text>
               </TouchableOpacity>
             </View>
          </View>

          <View className="items-center mb-2">
            {/* Hidden TextInput - Minimal size for focus stability */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(cleaned);
                if (cleaned.length === 6) {
                  Keyboard.dismiss();
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.hiddenInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            {/* Entire row is now touchable to open keyboard */}
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.otpRow}
            >
              {renderSlots()}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="mt-2 self-center" 
              activeOpacity={0.7}
              onPress={() => setOtp('')}
            >
              <Text className="text-primary dark:text-white font-bold text-base underline text-center">Resend OTP</Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            onPress={handleVerify}
            variant="primary"
            size="lg"
            isDisabled={!isButtonActive}
            className={`h-16 rounded-2xl shadow-lg mt-4 ${isButtonActive ? 'bg-primary dark:bg-primary-dark' : 'bg-primary/30 dark:bg-primary-dark/30 shadow-none'}`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <Spinner color="white" size="sm" />
                <Text className="text-primary-foreground dark:text-primary-foreground text-xl font-black ml-3">Verifying...</Text>
              </View>
            ) : (
              <Text className={`text-xl font-black ${isButtonActive ? 'text-primary-foreground dark:text-primary-foreground' : 'text-muted dark:text-muted-dark'}`}>
                Verify & Login
              </Text>
            )}
          </Button>

          <View className="mt-auto pt-10">
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
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    paddingVertical: 10,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
});

