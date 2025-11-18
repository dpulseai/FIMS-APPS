import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'revisit';
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'draft':
        return { backgroundColor: '#e5e7eb', color: '#4b5563' };
      case 'in_progress':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'submitted':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'approved':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'revisit':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#e5e7eb', color: '#4b5563' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.text, { color: statusStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
