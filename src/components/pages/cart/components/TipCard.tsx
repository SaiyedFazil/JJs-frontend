import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui';
import { MAX_TIP, TIP_PRESETS } from '@/data/checkout';
import { inr } from '@/data/orders';
import type { TipChoice } from '@/store/checkout.store';

const Chip = ({
  label,
  isSelected,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected: isSelected }}
    className={`flex-1 items-center rounded-md border-2 py-2.5 ${
      isSelected ? 'border-ember bg-ember-wash' : 'border-hairline bg-surface'
    }`}
  >
    <Text
      variant="fine"
      weight="800"
      tone={isSelected ? 'ember-pressed' : 'ink-soft'}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * The rider tip, on delivery orders only. A preset chip tapped again clears
 * the tip, so the default one is never forced on anyone; Custom opens a
 * rupee field under the chips.
 */
export const TipCard = ({
  choice,
  customTip,
  onChoose,
  onCustomChange,
}: {
  choice: TipChoice;
  customTip: number;
  onChoose: (choice: TipChoice) => void;
  onCustomChange: (amount: number) => void;
}) => (
  <View className="px-4 pt-3.5">
    <View className="rounded-md border border-card-hairline bg-surface px-4 py-3.5">
      <Text variant="fine" weight="800">
        Tip your delivery partner
      </Text>
      <Text variant="micro" tone="label" weight="500" className="mb-3">
        100% of your tip goes to the rider.
      </Text>

      <View className="flex-row gap-2">
        {TIP_PRESETS.map(amount => {
          const isSelected = choice === amount;
          return (
            <Chip
              key={amount}
              label={inr(amount)}
              isSelected={isSelected}
              accessibilityLabel={
                isSelected
                  ? `Remove ${amount} rupee tip`
                  : `Tip ${amount} rupees`
              }
              onPress={() => onChoose(isSelected ? 0 : amount)}
            />
          );
        })}
        <Chip
          label="Custom"
          isSelected={choice === 'custom'}
          accessibilityLabel="Custom tip"
          onPress={() => onChoose(choice === 'custom' ? 0 : 'custom')}
        />
      </View>

      {choice === 'custom' ? (
        <View className="mt-3 flex-row items-center gap-2 rounded-md border-2 border-ember bg-surface px-3.5">
          <Text variant="body" weight="800">
            ₹
          </Text>
          <TextInput
            value={customTip > 0 ? String(customTip) : ''}
            onChangeText={text => {
              const amount = Number(text.replace(/\D/g, '')) || 0;
              onCustomChange(Math.min(amount, MAX_TIP));
            }}
            placeholder={`Up to ${MAX_TIP}`}
            keyboardType="number-pad"
            maxLength={String(MAX_TIP).length}
            autoFocus
            accessibilityLabel="Tip amount in rupees"
            className="h-11 flex-1 font-jakarta-700 text-body text-ink"
            placeholderTextColorClassName="text-muted"
            cursorColorClassName="text-ember"
            selectionColorClassName="text-ember"
          />
        </View>
      ) : null}
    </View>
  </View>
);
