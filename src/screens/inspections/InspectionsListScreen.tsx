import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InspectionsStackParamList, Inspection } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { getInspections, deleteInspection } from '../../services/fimsService';
import InspectionCard from '../../components/InspectionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type NavigationProp = StackNavigationProp<InspectionsStackParamList, 'InspectionsList'>;

export default function InspectionsListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { userRole, hasAccess } = usePermissions(user);

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadInspections = useCallback(async () => {
    try {
      const data = await getInspections(user?.id, userRole);
      setInspections(data);
      setFilteredInspections(data);
    } catch (error) {
      console.error('Error loading inspections:', error);
      Alert.alert(t('common.error'), 'Failed to load inspections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, userRole, t]);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInspections(inspections);
    } else {
      const filtered = inspections.filter((inspection) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          inspection.category_name?.toLowerCase().includes(searchLower) ||
          inspection.category_name_marathi?.toLowerCase().includes(searchLower) ||
          inspection.location_address?.toLowerCase().includes(searchLower) ||
          inspection.filled_by_name?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredInspections(filtered);
    }
  }, [searchQuery, inspections]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadInspections();
  };

  const handleViewInspection = (inspection: Inspection) => {
    navigation.navigate('InspectionDetail', { inspectionId: inspection.id });
  };

  const handleEditInspection = (inspection: Inspection) => {
    Alert.alert(t('common.info'), 'Edit functionality coming soon');
  };

  const handleDeleteInspection = (inspection: Inspection) => {
    if (!hasAccess('fims', 'delete')) {
      Alert.alert(t('common.error'), 'You do not have permission to delete inspections');
      return;
    }

    Alert.alert(
      t('common.delete'),
      t('common.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInspection(inspection.id);
              Alert.alert(t('common.success'), 'Inspection deleted successfully');
              loadInspections();
            } catch (error) {
              Alert.alert(t('common.error'), 'Failed to delete inspection');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('fims.inspections')}</Text>
      <Text style={styles.headerSubtitle}>
        {filteredInspections.length} {t('fims.inspections').toLowerCase()}
      </Text>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('fims.searchInspections')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="clipboard-text-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyText}>{t('fims.noInspectionsFound')}</Text>
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Text style={styles.clearSearchText}>Clear search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={filteredInspections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InspectionCard
            inspection={item}
            onPress={() => handleViewInspection(item)}
            onEdit={hasAccess('fims', 'write') ? () => handleEditInspection(item) : undefined}
            onDelete={hasAccess('fims', 'delete') ? () => handleDeleteInspection(item) : undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 8,
  },
});
