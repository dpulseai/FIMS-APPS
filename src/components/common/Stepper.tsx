import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepCircle,
                  index < currentStep && styles.stepCompleted,
                  index === currentStep && styles.stepActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (index <= currentStep) && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index === currentStep && styles.stepLabelActive,
                ]}
                numberOfLines={2}
              >
                {step}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: '#10b981',
  },
  stepActive: {
    backgroundColor: '#2563eb',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#e5e7eb',
    flex: 0.3,
    marginHorizontal: -10,
  },
  stepLineCompleted: {
    backgroundColor: '#10b981',
  },
});
