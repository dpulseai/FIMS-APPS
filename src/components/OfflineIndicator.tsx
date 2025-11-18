import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import offlineService from '../services/offlineService';

export default function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();

    const unsubscribe = offlineService.subscribeToNetworkChanges((online) => {
      setIsOnline(online);
      if (online) {
        syncPendingData();
      }
    });

    const interval = setInterval(checkPendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const checkConnectionStatus = async () => {
    const online = await offlineService.isOnline();
    setIsOnline(online);
    await checkPendingCount();
  };

  const checkPendingCount = async () => {
    const count = await offlineService.getPendingSyncCount();
    setPendingCount(count);
  };

  const syncPendingData = async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      await offlineService.syncOfflineData();
      await checkPendingCount();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline) return;
    await syncPendingData();
  };

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      {!isOnline && (
        <View style={styles.content}>
          <View style={styles.dot} />
          <Text style={styles.text}>{t('offline.noConnection')}</Text>
        </View>
      )}

      {isOnline && pendingCount > 0 && (
        <TouchableOpacity style={styles.content} onPress={handleSync} disabled={syncing}>
          <Text style={styles.text}>
            {syncing
              ? t('offline.syncing')
              : `${pendingCount} ${t('offline.pendingSync')}`}
          </Text>
          {!syncing && <Text style={styles.tapText}>{t('offline.tapToSync')}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offline: {
    backgroundColor: '#ef4444',
  },
  online: {
    backgroundColor: '#f59e0b',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tapText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.9,
  },
});
