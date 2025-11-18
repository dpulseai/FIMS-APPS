import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Inspection } from '../types';
import StatusBadge from './common/StatusBadge';
import { format } from 'date-fns';

interface InspectionCardProps {
  inspection: Inspection;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function InspectionCard({
  inspection,
  onPress,
  onEdit,
  onDelete,
}: InspectionCardProps) {
  const { t, i18n } = useTranslation();

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      draft: t('fims.draft'),
      in_progress: t('fims.inProgress'),
      submitted: t('fims.submitted'),
      approved: t('fims.approved'),
      rejected: t('fims.rejected'),
      revisit: t('common.revisit'),
    };
    return labels[status] || status;
  };

  const categoryName = i18n.language === 'mr'
    ? inspection.category_name_marathi
    : inspection.category_name;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Icon name="clipboard-text-outline" size={20} color="#2563eb" />
          <Text style={styles.categoryText} numberOfLines={2}>
            {categoryName || 'Inspection'}
          </Text>
        </View>
        <StatusBadge
          status={inspection.status}
          label={getStatusLabel(inspection.status)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoContainer}>
        {inspection.location_address && (
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText} numberOfLines={2}>
              {inspection.location_address}
            </Text>
          </View>
        )}

        {inspection.filled_by_name && (
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{inspection.filled_by_name}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {format(new Date(inspection.created_at), 'dd MMM yyyy, hh:mm a')}
          </Text>
        </View>
      </View>

      {(onEdit || onDelete) && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Icon name="pencil-outline" size={20} color="#2563eb" />
                <Text style={styles.actionText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Icon name="delete-outline" size={20} color="#dc2626" />
                <Text style={[styles.actionText, styles.deleteText]}>
                  {t('common.delete')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  infoContainer: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  deleteText: {
    color: '#dc2626',
  },
});
