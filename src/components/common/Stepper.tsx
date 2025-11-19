import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to center the active step
    if (scrollViewRef.current) {
      const stepWidth = 90; // stepWrapper width + stepLine width
      const scrollPosition = Math.max(0, currentStep * stepWidth - 150);
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentStep]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    width: 70,
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
    width: 70,
  },
  stepLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  stepLine: {
    height: 2,
    width: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 0,
  },
  stepLineCompleted: {
    backgroundColor: '#10b981',
  },
});
