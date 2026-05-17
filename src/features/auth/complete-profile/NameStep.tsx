import React from 'react';
import { Text, TouchableOpacity, Keyboard, type TextInput } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { User, ArrowRight } from 'lucide-react-native';
import { Spinner } from 'heroui-native';
import { GlassInput } from './components/GlassInput';
import { COLORS } from './components/styles';

interface NameStepProps {
  firstName: string;
  setFirstName: (text: string) => void;
  lastName: string;
  setLastName: (text: string) => void;
  isDarkMode: boolean;
  isStep1Valid: boolean;
  handleNextStep: () => void;
  lastNameInputRef: React.RefObject<TextInput | null>;
  handleLastNameFocus: () => void;
  handleLastNameBlur: () => void;
  isLoading: boolean;
}

export const NameStep: React.FC<NameStepProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  isDarkMode,
  isStep1Valid,
  handleNextStep,
  lastNameInputRef,
  handleLastNameFocus,
  handleLastNameBlur,
  isLoading,
}) => {
  return (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
      <GlassInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="e.g. John"
        icon={<User size={18} color={isDarkMode ? 'white' : COLORS.primary} />}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => lastNameInputRef.current?.focus()}
        isDark={isDarkMode}
        disabled={isLoading}
      />
      <GlassInput
        ref={lastNameInputRef}
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        placeholder="e.g. Doe"
        icon={<User size={18} color={isDarkMode ? 'white' : COLORS.primary} />}
        autoCapitalize="words"
        returnKeyType="done"
        onFocus={handleLastNameFocus}
        onBlur={handleLastNameBlur}
        onSubmitEditing={() => Keyboard.dismiss()}
        isDark={isDarkMode}
        disabled={isLoading}
      />

      <TouchableOpacity
        onPress={handleNextStep}
        disabled={!isStep1Valid || isLoading}
        activeOpacity={0.8}
        className={`h-18 rounded-[30px] flex-row items-center justify-center mt-2 ${
          isStep1Valid
            ? 'bg-primary dark:bg-primary-dark shadow-2xl'
            : isDarkMode
              ? 'bg-[#262626]'
              : 'bg-gray-100'
        }`}
      >
        {isLoading ? (
          <Spinner color="#FFFFFF" size="sm" />
        ) : (
          <>
            <Text
              className={`text-lg font-black mr-2 ${
                isStep1Valid
                  ? 'text-primary-foreground'
                  : isDarkMode
                    ? 'text-white/20'
                    : 'text-black/20'
              }`}
            >
              Continue
            </Text>
            <ArrowRight
              size={20}
              color={
                isStep1Valid
                  ? '#FFFFFF'
                  : isDarkMode
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.2)'
              }
              strokeWidth={3}
            />
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
