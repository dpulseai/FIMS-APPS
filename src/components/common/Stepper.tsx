import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function Stepper({ steps, currentStep }: StepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Step Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.stepCounter}>
          Step {currentStep + 1} of {steps.length}
        </Text>
        <Text style={styles.stepTitle}>{steps[currentStep]}</Text>
      </View>

      {/* Optional: Dot Indicators */}
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.dotActive,
              index < currentStep && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCounter: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#2563eb',
    letterSpacing: 0.3,
  },
  stepTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2563eb',
  },
  dotCompleted: {
    backgroundColor: '#10b981',
  },
});
