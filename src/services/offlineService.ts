import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';

const OFFLINE_INSPECTIONS_KEY = '@fims_offline_inspections';
const OFFLINE_PHOTOS_KEY = '@fims_offline_photos';
const PENDING_SYNC_KEY = '@fims_pending_sync';

export interface OfflineInspection {
  id: string;
  category_id: string;
  inspector_id?: string;
  filled_by_name: string;
  status: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string | null;
  form_data?: any;
  created_at: string;
  photos: OfflinePhoto[];
}

export interface OfflinePhoto {
  inspection_id: string;
  uri: string;
  photo_number: number;
  filename: string;
}

export interface SyncStatus {
  pending: number;
  syncing: boolean;
  lastSync?: string;
  errors: string[];
}

export const offlineService = {
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  async saveOfflineInspection(inspection: OfflineInspection): Promise<void> {
    try {
      const existing = await this.getOfflineInspections();
      const updated = [...existing, inspection];
      await AsyncStorage.setItem(OFFLINE_INSPECTIONS_KEY, JSON.stringify(updated));
      console.log('Saved offline inspection:', inspection.id);
    } catch (error) {
      console.error('Error saving offline inspection:', error);
      throw error;
    }
  },

  async getOfflineInspections(): Promise<OfflineInspection[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_INSPECTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline inspections:', error);
      return [];
    }
  },

  async deleteOfflineInspection(inspectionId: string): Promise<void> {
    try {
      const existing = await this.getOfflineInspections();
      const updated = existing.filter(i => i.id !== inspectionId);
      await AsyncStorage.setItem(OFFLINE_INSPECTIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting offline inspection:', error);
      throw error;
    }
  },

  async clearOfflineInspections(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_INSPECTIONS_KEY);
      await AsyncStorage.removeItem(OFFLINE_PHOTOS_KEY);
    } catch (error) {
      console.error('Error clearing offline inspections:', error);
    }
  },

  async getPendingSyncCount(): Promise<number> {
    const inspections = await this.getOfflineInspections();
    return inspections.length;
  },

  async syncOfflineData(): Promise<SyncStatus> {
    const status: SyncStatus = {
      pending: 0,
      syncing: true,
      errors: [],
    };

    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        status.syncing = false;
        status.errors.push('No internet connection');
        return status;
      }

      const offlineInspections = await this.getOfflineInspections();
      status.pending = offlineInspections.length;

      if (offlineInspections.length === 0) {
        status.syncing = false;
        status.lastSync = new Date().toISOString();
        return status;
      }

      console.log(`Syncing ${offlineInspections.length} offline inspections...`);

      for (const inspection of offlineInspections) {
        try {
          const { data: newInspection, error: inspectionError } = await supabase
            .from('fims_inspections')
            .insert({
              category_id: inspection.category_id,
              inspector_id: inspection.inspector_id,
              filled_by_name: inspection.filled_by_name,
              status: inspection.status,
              location_latitude: inspection.location_latitude,
              location_longitude: inspection.location_longitude,
              location_address: inspection.location_address,
              created_at: inspection.created_at,
            })
            .select()
            .single();

          if (inspectionError) {
            console.error('Error syncing inspection:', inspectionError);
            status.errors.push(`Failed to sync inspection: ${inspectionError.message}`);
            continue;
          }

          for (const photo of inspection.photos) {
            try {
              const response = await fetch(photo.uri);
              const blob = await response.blob();
              const arrayBuffer = await blob.arrayBuffer();
              const fileExt = photo.filename.split('.').pop();
              const filePath = `${newInspection.id}/${photo.filename}`;

              const { error: uploadError } = await supabase.storage
                .from('inspection-photos')
                .upload(filePath, arrayBuffer, {
                  contentType: `image/${fileExt}`,
                  upsert: false,
                });

              if (uploadError) {
                console.error('Error uploading photo:', uploadError);
                status.errors.push(`Failed to upload photo: ${uploadError.message}`);
                continue;
              }

              const { data: { publicUrl } } = supabase.storage
                .from('inspection-photos')
                .getPublicUrl(filePath);

              await supabase.from('fims_inspection_photos').insert({
                inspection_id: newInspection.id,
                photo_url: publicUrl,
                photo_number: photo.photo_number,
              });
            } catch (photoError) {
              console.error('Error syncing photo:', photoError);
              status.errors.push(`Failed to sync photo: ${photoError}`);
            }
          }

          await this.deleteOfflineInspection(inspection.id);
          console.log('Successfully synced inspection:', inspection.id);
        } catch (error) {
          console.error('Error syncing inspection:', error);
          status.errors.push(`Failed to sync inspection: ${error}`);
        }
      }

      status.pending = await this.getPendingSyncCount();
      status.syncing = false;
      status.lastSync = new Date().toISOString();

      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(status));

      return status;
    } catch (error) {
      console.error('Error during sync:', error);
      status.syncing = false;
      status.errors.push(`Sync failed: ${error}`);
      return status;
    }
  },

  async getSyncStatus(): Promise<SyncStatus | null> {
    try {
      const data = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  },

  async setupAutoSync(intervalMinutes: number = 15): Promise<() => void> {
    const syncInterval = setInterval(async () => {
      const isOnline = await this.isOnline();
      if (isOnline) {
        const pending = await this.getPendingSyncCount();
        if (pending > 0) {
          console.log(`Auto-sync: ${pending} pending inspections`);
          await this.syncOfflineData();
        }
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(syncInterval);
  },

  subscribeToNetworkChanges(callback: (isOnline: boolean) => void): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
    return unsubscribe;
  },
};

export default offlineService;
