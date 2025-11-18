import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FormsStackParamList, InspectionCategory } from '../../types';
import { fetchCategories } from '../../services/fimsService';
import CategoryCard from '../../components/CategoryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type NavigationProp = StackNavigationProp<FormsStackParamList, 'CategorySelection'>;

export default function CategorySelectionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [categories, setCategories] = useState<InspectionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert(t('common.error'), 'Failed to load inspection categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handleCategoryPress = (category: InspectionCategory) => {
    const formTypeMap: { [key: string]: keyof FormsStackParamList } = {
      'office': 'FIMSOfficeInspection',
      'anganwadi': 'AnganwadiTapasani',
      'health': 'HealthInspection',
      'Health Inspection': 'HealthInspection',
      'grampanchayat': 'GrampanchayatInspection',
      'Grampanchayat Inspection': 'GrampanchayatInspection',
      'subcenter': 'SubCenterMonitoring',
      'Sub Centre Monitoring': 'SubCenterMonitoring',
      'bandhkam1': 'BandhkamVibhag1',
      'Zilla Parishad Construction Progress Report Form': 'BandhkamVibhag1',
      'bandhkam2': 'BandhkamVibhag2',
      'Zilla Parishad Construction Inspection Format': 'BandhkamVibhag2',
      'mgnrega': 'MahatmaGandhiRojgarHami',
      'Mahatma Gandhi National Rural Employment Guarantee Scheme Inspection': 'MahatmaGandhiRojgarHami',
      'nyayalay': 'MumbaiNyayalay',
      'High Court Order Inspection Form': 'MumbaiNyayalay',
      'veterinary': 'PahuvaidhakiyaTapasani',
      'Veterinary Institution Inspection': 'PahuvaidhakiyaTapasani',
      'education': 'RajyaShaishanikPrashikshan',
      'Rajya Shaishanik Prashikshan Inspection': 'RajyaShaishanikPrashikshan',
      'quality': 'RajyaGunwattaNirikshak',
      'State Level Quality Inspection Form': 'RajyaGunwattaNirikshak',
      'monthly': 'ZPDarMahinyala',
      'Monthly Report Submission Form': 'ZPDarMahinyala',
    };

    const routeName = formTypeMap[category.form_type] || formTypeMap[category.form_type.toLowerCase()];

    if (routeName) {
      navigation.navigate(routeName, { categoryId: category.id });
    } else {
      console.log('Unmapped form_type:', category.form_type);
      Alert.alert(
        t('common.info'),
        `Form for "${category.name}" coming soon!\n\nform_type: ${category.form_type}`
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('fims.newInspection')}</Text>
      <Text style={styles.headerSubtitle}>{t('fims.selectCategory')}</Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => handleCategoryPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
        }
        numColumns={1}
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
    paddingBottom: 20,
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
  },
  listContent: {
    paddingVertical: 8,
  },
});
