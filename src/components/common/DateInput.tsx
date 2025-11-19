import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DateInputProps {
  label?: string;
  value: string; // Expected format: YYYY-MM-DD
  onChangeDate: (date: string) => void;
  error?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DateInput({
  label,
  value,
  onChangeDate,
  error,
  placeholder = 'YYYY-MM-DD',
  containerStyle,
  minimumDate,
  maximumDate,
}: DateInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Parse the value string to Date object
  const getDateFromValue = (): Date => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return new Date();
  };

  const currentDate = getDateFromValue();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      onChangeDate(formattedDate);
    }
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleDismiss = () => {
    setShowPicker(false);
  };

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Icon name="calendar" size={20} color="#6b7280" style={styles.icon} />
        <Text style={[styles.text, isPlaceholder && styles.placeholder]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onTouchCancel={handleDismiss}
        />
      )}

      {/* For iOS, show a dismiss button */}
      {showPicker && Platform.OS === 'ios' && (
        <View style={styles.iosButtons}>
          <TouchableOpacity onPress={handleDismiss} style={styles.iosButton}>
            <Text style={styles.iosButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  placeholder: {
    color: '#9ca3af',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  iosButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
  },
  iosButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  iosButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
