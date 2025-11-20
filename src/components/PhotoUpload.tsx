import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';

interface PhotoMeta {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  photoMetas?: PhotoMeta[];
  onPhotoMetaChange?: (metas: PhotoMeta[]) => void;
  maxPhotos?: number;
  maxSizeKB?: number;
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  photoMetas,
  onPhotoMetaChange,
  maxPhotos = 5,
  maxSizeKB = 5120,
}: PhotoUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos for inspections.'
      );
      return false;
    }
    return true;
  };

  // Gallery selection is intentionally disabled: photos must be taken with the camera only.

  const compressImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  };

  const handleTakePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(t('common.error'), t('fims.maxPhotosAllowed'));
      return;
    }

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedUri = await compressImage(result.assets[0].uri);
        // Try to capture current location when photo is taken
        let meta: PhotoMeta | undefined;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced });
            meta = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? undefined,
            };
          }
        } catch (locErr) {
          console.warn('Could not fetch location for photo:', locErr);
        }

        onPhotosChange([...photos, compressedUri]);
        if (onPhotoMetaChange) {
          const newMetas = [...(photoMetas || []), (meta || {})];
          onPhotoMetaChange(newMetas as PhotoMeta[]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('common.error'), 'Failed to take photo');
    } finally {
      setUploading(false);
    }
  };

  // Gallery selection removed to enforce camera-only uploads.

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      t('common.confirm'),
      'Remove this photo?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange(newPhotos);
            if (onPhotoMetaChange) {
              const newMetas = (photoMetas || []).filter((_, i) => i !== index);
              onPhotoMetaChange(newMetas);
            }
          },
        },
      ]
    );
  };

  const showPhotoOptions = () => {
    // Only allow taking photo with camera.
    handleTakePhoto();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('common.photos')}</Text>
        <Text style={styles.subtitle}>
          {photos.length} / {maxPhotos} photos
        </Text>
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              {/* Geo-tag indicator */}
              {photoMetas && photoMetas[index] && (photoMetas[index].latitude !== undefined) && (
                <View style={styles.geoIndicator}>
                  <Icon name="map-marker" size={14} color="#10b981" />
                </View>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Icon name="close-circle" size={24} color="#dc2626" />
              </TouchableOpacity>
              <Text style={styles.photoNumber}>{index + 1}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {photos.length < maxPhotos && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={showPhotoOptions}
          disabled={uploading}
        >
          <Icon name="camera-plus" size={32} color="#2563eb" />
          <Text style={styles.addButtonText}>
            {uploading ? 'Processing...' : t('fims.takePhoto')}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.infoText}>
        Maximum {maxPhotos} photos. Photos must be taken with the camera; uploads from gallery or other sources are not allowed. Photos will be compressed to ensure they are under {Math.floor(maxSizeKB / 1024)}MB.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  photosScroll: {
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  photoNumber: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  geoIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 4,
    borderRadius: 10,
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
