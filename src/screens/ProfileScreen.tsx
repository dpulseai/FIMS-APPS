import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { userProfile, isLoading } = usePermissions(user);

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOut'),
      'Are you sure you want to sign out?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('fims.profile')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('fims.profile')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="account" size={50} color="#ffffff" />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="account-outline" size={20} color="#6b7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{t('common.name')}</Text>
                <Text style={styles.infoValue}>{userProfile?.name || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="email-outline" size={20} color="#6b7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{t('auth.email')}</Text>
                <Text style={styles.infoValue}>{userProfile?.email || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="shield-account-outline" size={20} color="#6b7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{t('fims.role')}</Text>
                <Text style={styles.infoValue}>{userProfile?.role_name || 'N/A'}</Text>
              </View>
            </View>

            {userProfile?.phone_number && (
              <View style={styles.infoRow}>
                <Icon name="phone-outline" size={20} color="#6b7280" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>{t('fims.phone')}</Text>
                  <Text style={styles.infoValue}>{userProfile.phone_number}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('fims.settings')}</Text>

          <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
            <Icon name="translate" size={24} color="#2563eb" />
            <Text style={styles.settingText}>
              Language / भाषा: {i18n.language === 'en' ? 'English' : 'मराठी'}
            </Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="logout" size={20} color="#ffffff" />
          <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FIMS Mobile v1.0.0</Text>
          <Text style={styles.footerText}>© जिल्हा परिषद, चंद्रपूर</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    paddingVertical: 14,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
