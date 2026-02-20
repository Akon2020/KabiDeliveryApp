import { View, StyleSheet, Text, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { DEFAULT_LOCATION } from '@/mocks/data';
import MapView, { Marker } from 'react-native-maps';

interface KhabiMapProps {
  height?: number;
  showPin?: boolean;
}

export default function KhabiMap({ height = 220, showPin = true }: KhabiMapProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webMap, { height }]}>
        <View style={styles.webMapGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={styles.webMapBlock} />
          ))}
        </View>
        {showPin && (
          <View style={styles.pinContainer}>
            <View style={styles.pinShadow} />
            <View style={styles.pinIcon}>
              <MapPin size={24} color={theme.primary} strokeWidth={2} fill={theme.primaryLight} />
            </View>
          </View>
        )}
        <View style={styles.webMapLabel}>
          <Text style={styles.webMapLabelText}>Kinshasa, RDC</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, { height }]}>
      <MapView
        style={styles.map}
        initialRegion={DEFAULT_LOCATION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {showPin && (
          <Marker
            coordinate={{
              latitude: DEFAULT_LOCATION.latitude,
              longitude: DEFAULT_LOCATION.longitude,
            }}
            title="Votre position"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  webMap: {
    borderRadius: 16,
    backgroundColor: '#E8F4F0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webMapGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.3,
  },
  webMapBlock: {
    width: '25%',
    height: '33.33%',
    borderWidth: 0.5,
    borderColor: theme.primary,
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pinShadow: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  webMapLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  webMapLabelText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
});
