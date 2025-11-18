import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { InspectionsStackParamList } from '../../types';
import { getInspectionById } from '../../services/fimsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { format } from 'date-fns';

type RouteParams = RouteProp<InspectionsStackParamList, 'InspectionDetail'>;

const { width } = Dimensions.get('window');

export default function InspectionDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteParams>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspectionDetails();
  }, [inspectionId]);

  const loadInspectionDetails = async () => {
    try {
      const data = await getInspectionById(inspectionId);
      setInspection(data);
    } catch (error) {
      console.error('Error loading inspection:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (!inspection) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const categoryName = i18n.language === 'mr'
    ? inspection.category_name_marathi
    : inspection.category_name;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Icon name="clipboard-text-outline" size={24} color="#2563eb" />
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
          <StatusBadge
            status={inspection.status}
            label={getStatusLabel(inspection.status)}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('fims.locationDetails')}</Text>

          {inspection.location_address && (
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{inspection.location_address}</Text>
            </View>
          )}

          {inspection.location_latitude && inspection.location_longitude && (
            <View style={styles.infoRow}>
              <Icon name="crosshairs-gps" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                {inspection.location_latitude.toFixed(6)}, {inspection.location_longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Info</Text>

          {inspection.filled_by_name && (
            <View style={styles.infoRow}>
              <Icon name="account" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{inspection.filled_by_name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color="#6b7280" />
            <Text style={styles.infoText}>
              {format(new Date(inspection.created_at), 'dd MMM yyyy, hh:mm a')}
            </Text>
          </View>

          {inspection.updated_at !== inspection.created_at && (
            <View style={styles.infoRow}>
              <Icon name="calendar-edit" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                Updated: {format(new Date(inspection.updated_at), 'dd MMM yyyy, hh:mm a')}
              </Text>
            </View>
          )}
        </View>

        {inspection.photos && inspection.photos.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('common.photos')}</Text>
              <View style={styles.photosGrid}>
                {inspection.photos.map((photo: any, index: number) => (
                  <Image
                    key={photo.id || index}
                    source={{ uri: photo.photo_url }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photo: {
    width: (width - 64) / 2,
    height: (width - 64) / 2,
    borderRadius: 8,
    margin: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 32,
  },
});
