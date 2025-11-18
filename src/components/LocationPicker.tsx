import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { LocationData } from '../types';

const GOOGLE_API_KEY = 'AIzaSyAjFLdphP7tlo99o3L6IgxbeSOHPsla9-Y';

interface LocationPickerProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData) => void;
}

export default function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Location permission is required to capture GPS coordinates for inspections.'
      );
      return false;
    }
    setPermissionGranted(true);
    return true;
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!permissionGranted) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }

    try {
      setLoading(true);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = currentLocation.coords;

      const address = await reverseGeocode(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        accuracy: accuracy || null,
        address: address || null,
        timestamp: Date.now(),
      };

      onLocationChange(locationData);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        t('common.error'),
        'Failed to get current location. Please ensure location services are enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('fims.location')}</Text>
        {location && (
          <View style={styles.accuracyBadge}>
            <Icon name="crosshairs-gps" size={12} color="#10b981" />
            <Text style={styles.accuracyText}>
              {location.accuracy ? `±${Math.round(location.accuracy)}m` : 'GPS'}
            </Text>
          </View>
        )}
      </View>

      {location ? (
        <View style={styles.locationInfo}>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={20} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('fims.address')}</Text>
              <Text style={styles.infoValue}>
                {location.address || 'Address not available'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="crosshairs-gps" size={20} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Coordinates</Text>
              <Text style={styles.infoValue}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <>
                <Icon name="refresh" size={18} color="#2563eb" />
                <Text style={styles.updateButtonText}>Update Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.captureButtonText}>{t('fims.gettingLocation')}</Text>
            </>
          ) : (
            <>
              <Icon name="crosshairs-gps" size={24} color="#ffffff" />
              <Text style={styles.captureButtonText}>{t('fims.getCurrentLocation')}</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.infoText}>
        GPS location is required for inspection validation. Works offline - location will be captured and saved locally.
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
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  locationInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginTop: 4,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 12,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
