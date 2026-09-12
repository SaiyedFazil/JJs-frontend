import React from 'react';
import { Keyboard, type TextInput } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { User } from 'lucide-react-native';
import { Button, TextField } from '@/components/ui';

interface NameStepProps {
  firstName: string;
  setFirstName: (text: string) => void;
  lastName: string;
  setLastName: (text: string) => void;
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
  isStep1Valid,
  handleNextStep,
  lastNameInputRef,
  handleLastNameFocus,
  handleLastNameBlur,
  isLoading,
}) => {
  return (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
      <TextField
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="e.g. John"
        icon={<User size={18} className="text-muted" />}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => lastNameInputRef.current?.focus()}
        isDisabled={isLoading}
      />

      <TextField
        ref={lastNameInputRef}
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        placeholder="e.g. Doe"
        icon={<User size={18} className="text-muted" />}
        autoCapitalize="words"
        returnKeyType="done"
        onFocus={handleLastNameFocus}
        onBlur={handleLastNameBlur}
        onSubmitEditing={() => Keyboard.dismiss()}
        isDisabled={isLoading}
      />

      <Button
        label="Continue"
        loadingLabel="Saving..."
        onPress={handleNextStep}
        isDisabled={!isStep1Valid && !isLoading}
        isLoading={isLoading}
        className="mt-sm"
      />
    </Animated.View>
  );
};
