import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from './Text';

export interface TimelineStep {
  label: string;
  detail?: string;
  time?: string;
  isDone: boolean;
  isCurrent?: boolean;
}

/** PDF section 05 · order status timeline. */
export const OrderTimeline = ({ steps }: { steps: TimelineStep[] }) => (
  <View className="px-lg">
    {steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      const active = step.isDone || step.isCurrent;

      return (
        <View key={step.label} className="flex-row">
          {/* Rail */}
          <View className="items-center mr-md">
            <View
              className={`w-6 h-6 rounded-pill items-center justify-center border-2 ${
                active ? 'bg-ember border-ember' : 'bg-surface border-hairline'
              }`}
            >
              {step.isDone ? (
                <Check size={12} className="text-on-ember" strokeWidth={3} />
              ) : null}
            </View>
            {!isLast ? (
              <View
                className={`w-0.5 flex-1 ${
                  step.isDone ? 'bg-ember' : 'bg-hairline'
                }`}
              />
            ) : null}
          </View>

          {/* Content */}
          <View className={`flex-1 ${isLast ? 'pb-0' : 'pb-lg'}`}>
            <View className="flex-row items-center justify-between">
              <Text variant="item" tone={active ? 'ink' : 'muted'}>
                {step.label}
              </Text>
              {step.time ? (
                <Text variant="caption" tone="muted">
                  {step.time}
                </Text>
              ) : null}
            </View>
            {step.detail ? (
              <Text variant="body" tone="muted" className="mt-xs">
                {step.detail}
              </Text>
            ) : null}
          </View>
        </View>
      );
    })}
  </View>
);
