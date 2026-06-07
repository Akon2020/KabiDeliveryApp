import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { useLocation, Coordinates } from '@/providers/LocationProvider';

interface KhabiMapProps {
  height?: number;
  showPin?: boolean;
  markers?: { id: string; coordinate: Coordinates; title?: string; color?: 'primary' | 'accent' }[];
  centerOnUser?: boolean;
}

type MapsModule = typeof import('react-native-maps');
let MapsModuleRef: MapsModule | null = null;
let MapsLoadFailed = false;

function loadMapsModule(): MapsModule | null {
  if (MapsModuleRef || MapsLoadFailed) return MapsModuleRef;
  try {
    MapsModuleRef = require('react-native-maps') as MapsModule;
    return MapsModuleRef;
  } catch (err) {
    console.log('[KhabiMap] react-native-maps unavailable, falling back to placeholder:', err);
    MapsLoadFailed = true;
    return null;
  }
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.log('[KhabiMap] MapView render failed, using fallback:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function MapPlaceholder({
  height,
  showPin,
  label,
}: {
  height: number;
  showPin: boolean;
  label: string;
}) {
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
        <Text style={styles.webMapLabelText}>{label}</Text>
      </View>
    </View>
  );
}

export default function KhabiMap({
  height = 220,
  showPin = true,
  markers,
  centerOnUser = true,
}: KhabiMapProps) {
  const { region, address } = useLocation();

  if (Platform.OS === 'web') {
    return <MapPlaceholder height={height} showPin={showPin} label={address} />;
  }

  const Maps = loadMapsModule();
  if (!Maps) {
    return <MapPlaceholder height={height} showPin={showPin} label={address} />;
  }

  const { default: MapView, Marker } = Maps;

  const mapRegion = centerOnUser
    ? region
    : {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        latitudeDelta: DEFAULT_LOCATION.latitudeDelta,
        longitudeDelta: DEFAULT_LOCATION.longitudeDelta,
      };

  return (
    <MapErrorBoundary
      fallback={<MapPlaceholder height={height} showPin={showPin} label={address} />}
    >
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          region={mapRegion}
          showsMyLocationButton={false}
        >
          {showPin && (
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
              title="Votre position"
              pinColor={theme.primary}
            />
          )}
          {markers?.map((m) => (
            <Marker
              key={m.id}
              coordinate={m.coordinate}
              title={m.title}
              pinColor={m.color === 'accent' ? theme.accent : theme.primary}
            />
          ))}
        </MapView>
      </View>
    </MapErrorBoundary>
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
