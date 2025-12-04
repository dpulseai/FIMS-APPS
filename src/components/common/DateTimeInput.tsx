import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DateTimeInputProps {
  label?: string;
  value: string; // Expected format: YYYY-MM-DD HH:MM
  onChangeDateTime: (dateTime: string) => void;
  error?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export default function DateTimeInput({
  label,
  value,
  onChangeDateTime,
  error,
  placeholder = 'YYYY-MM-DD HH:MM',
  containerStyle,
  minimumDate,
  maximumDate,
  disabled = false,
}: DateTimeInputProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // Parse the value string to Date object
  const getDateFromValue = (): Date => {
    if (value) {
      // Try parsing "YYYY-MM-DD HH:MM" format
      const match = value.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
      if (match) {
        const [, datePart, timePart] = match;
        const date = new Date(`${datePart}T${timePart}:00`);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return new Date();
  };

  const currentDate = getDateFromValue();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      // On Android, immediately show time picker after date selection
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    } else if (Platform.OS === 'android') {
      // User cancelled
      setTempDate(null);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedTime && tempDate) {
      // Combine date from tempDate and time from selectedTime
      const finalDate = new Date(tempDate);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());

      const formattedDateTime = format(finalDate, 'yyyy-MM-dd HH:mm');
      onChangeDateTime(formattedDateTime);
      setTempDate(null);
    } else if (Platform.OS === 'android') {
      // User cancelled
      setTempDate(null);
    }
  };

  const handlePress = () => {
    if (disabled) return;
    setShowDatePicker(true);
  };

  const handleDismissDate = () => {
    setShowDatePicker(false);
    if (tempDate && Platform.OS === 'ios') {
      setShowTimePicker(true);
    }
  };

  const handleDismissTime = () => {
    setShowTimePicker(false);
    if (tempDate) {
      // For iOS, combine the date and time
      const formattedDateTime = format(tempDate, 'yyyy-MM-dd HH:mm');
      onChangeDateTime(formattedDateTime);
      setTempDate(null);
    }
  };

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.inputContainer, error ? styles.inputError : undefined]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Icon name="calendar-clock" size={20} color="#6b7280" style={styles.icon} />
        <Text style={[styles.text, isPlaceholder ? styles.placeholder : undefined]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate || currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={tempDate || currentDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
          onChange={handleTimeChange}
        />
      )}

      {/* For iOS, show dismiss buttons */}
      {showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.iosButtons}>
          <TouchableOpacity onPress={handleDismissDate} style={styles.iosButton}>
            <Text style={styles.iosButtonText}>Next (Time)</Text>
          </TouchableOpacity>
        </View>
      )}

      {showTimePicker && Platform.OS === 'ios' && (
        <View style={styles.iosButtons}>
          <TouchableOpacity onPress={handleDismissTime} style={styles.iosButton}>
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
