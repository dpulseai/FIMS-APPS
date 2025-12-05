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
      // ensure we pass undefined (not null) when user id is not available
      const userId = user?.id ?? undefined;
      const data = await getInspections(userId, userRole ?? undefined);
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
    // Navigate to the appropriate form screen for editing.
    // Cast to any to allow cross-stack navigation without TypeScript errors.
    const params = { categoryId: inspection.category_id, inspectionId: inspection.id };
    // Determine route based on form_type or fallback to Anganwadi for now
    // If this is an office form, open the office form screen in the NewInspection navigator
    if (inspection.form_type === 'office' || inspection.category_name?.toLowerCase().includes('office')) {
      (navigation as any).navigate('NewInspection', {
        screen: 'FIMSOfficeInspection',
        params: { categoryId: inspection.category_id, inspectionId: inspection.id, edit: true },
      });
      return;
    }

    // If it's an anganwadi form, open the Anganwadi screen inside NewInspection
    if (inspection.form_type === 'anganwadi' || inspection.category_name?.toLowerCase().includes('anganwadi')) {
      (navigation as any).navigate('NewInspection', {
        screen: 'AnganwadiTapasani',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's Bandhakam Vibhag 2 (explicit form_type or category name contains 'inspection format'), open BandhkamVibhag2
    const cat = inspection.category_name?.toLowerCase() ?? '';
    if (
      inspection.form_type === 'bandhakam_vibhag2' ||
      cat.includes('inspection format') ||
      cat.includes('zpd construction inspection')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'BandhkamVibhag2',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's a Bandhakam / Zilla Parishad construction form (generic), open BandhkamVibhag1
    if (
      inspection.form_type === 'bandhakam_vibhag1' ||
      cat.includes('bandhakam') ||
      cat.includes('zilla parishad') ||
      cat.includes('construction')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'BandhkamVibhag1',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's a Grampanchayat form, open the Grampanchayat screen
    if (
      inspection.form_type === 'grampanchayat' ||
      cat.includes('grampanchayat') ||
      cat.includes('gram panchayat')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'GrampanchayatInspection',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's a Pahuvaidhakiya Tapasani (Veterinary) form, open the PahuvaidhakiyaTapasani screen
    if (
      inspection.form_type === 'pahuvaidhakiya' ||
      inspection.form_type === 'veterinary' ||
      cat.includes('pahuvaidhakiya') ||
      cat.includes('veterinary') ||
      cat.includes('पशु')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'PahuvaidhakiyaTapasani',
        params: { ...params, edit: true },
      });
      return;
    }

    // Rajya Shaishanik (Education Training) form
    if (
      inspection.form_type === 'rajya_shaishanik' ||
      cat.includes('rajya') ||
      cat.includes('shaishanik') ||
      cat.includes('शै') ||
      cat.includes('शिक्ष') ||
      (inspection.category_name && inspection.category_name.toLowerCase().includes('education'))
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'RajyaShaishanikPrashikshan',
        params: { ...params, edit: true },
      });
      return;
    }

     // If it's a Sub Centre Monitoring form, open the SubCenterMonitoring screen inside NewInspection
    if (
      inspection.form_type === 'sub_centre_monitoring' ||
      inspection.form_type === 'Sub Centre Monitoring Checklist' ||
      cat.includes('sub centre') ||
      cat.includes('sub center') ||
      cat.includes('subcentre') ||
      cat.includes('subcenter')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'SubCenterMonitoring',
        params: { ...params, edit: true },
      });
      return;
    }


    // State Level Quality Inspection (Rajya Gunwatta) form
    if (
      inspection.category_name === 'State Level Quality Inspection Form' ||
      (inspection.category_name && inspection.category_name.toLowerCase().includes('state level quality')) ||
      inspection.form_type === 'state_quality_inspection' ||
      inspection.form_type === 'rajya_gunwatta'
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'RajyaGunwattaNirikshak',
        params: { ...params, edit: true },
      });
      return;
    }

      // If it's an MahatmaGandhiRojgarHami form, open the MahatmaGandhiRojgarHami screen inside NewInspection
    if (inspection.form_type === 'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection' || inspection.category_name?.toLowerCase().includes('mahatmagandhirojgarhami')) {
      (navigation as any).navigate('NewInspection', {
        screen: 'MahatmaGandhiRojgarHami',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's an ZPDarMahinyala form, open the ZPDarMahinyala screen inside NewInspection
    if (inspection.form_type === 'Monthly Report Submission Form' || inspection.category_name?.toLowerCase().includes('zpdarmahinyala')) {
      (navigation as any).navigate('NewInspection', {
        screen: 'ZPDarMahinyala',
        params: { ...params, edit: true },
      });
      return;
    }


    // If it's a MumbaiNyayalay (High Court) form, open the MumbaiNyayalay screen inside NewInspection
    if (
      inspection.form_type === 'High Court Order Inspection Form' ||
      inspection.form_type === 'mumbai_nyayalay' ||
      cat.includes('mumbainyayalay') ||
      cat.includes('mumbai nyayalay') ||
      cat.includes('high court')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'MumbaiNyayalay',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's a Sub Centre Monitoring form, open the SubCenterMonitoring screen inside NewInspection
    if (
      inspection.form_type === 'sub_centre_monitoring' ||
      inspection.form_type === 'Sub Centre Monitoring Checklist' ||
      cat.includes('sub centre') ||
      cat.includes('sub center') ||
      cat.includes('subcentre') ||
      cat.includes('subcenter')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'SubCenterMonitoring',
        params: { ...params, edit: true },
      });
      return;
    }

    // If it's a Health Inspection form, open the HealthInspection screen inside NewInspection
    if (
      inspection.form_type === 'health_inspection' ||
      inspection.form_type === 'health' ||
      cat.includes('health') ||
      cat.includes('आरोग्य')
    ) {
      (navigation as any).navigate('NewInspection', {
        screen: 'HealthInspection',
        params: { ...params, edit: true },
      });
      return;
    }

    // Fallback: show the inspection detail view
    navigation.navigate('InspectionDetail', { inspectionId: inspection.id });
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
        renderItem={({ item }) => {
          // Consider user as owner if they are the inspector, filled_by, or assigned_by
          const isOwner = Boolean(
            (user?.id && item.inspector_id && user.id === item.inspector_id) ||
            (user?.email && item.filled_by_name && user.email === item.filled_by_name) ||
            (user?.id && item.assigned_by && user.id === item.assigned_by)
          );
          // Admin role if permission grants admin or role name is one of the admin roles
          const isAdminRole = hasAccess('fims', 'admin') || ['admin', 'super_admin', 'developer'].includes(userRole ?? '');
          const canEdit = hasAccess('fims', 'write') || isOwner || isAdminRole;
          const canDelete = hasAccess('fims', 'delete') || isOwner || isAdminRole;
          return (
            <InspectionCard
              inspection={item}
              onPress={() => handleViewInspection(item)}
              onEdit={canEdit ? () => handleEditInspection(item) : undefined}
              onDelete={canDelete ? () => handleDeleteInspection(item) : undefined}
            />
          );
        }}
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