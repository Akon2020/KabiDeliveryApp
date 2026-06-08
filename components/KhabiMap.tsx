import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform, InteractionManager } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useLocation, Coordinates } from '@/providers/LocationProvider';

interface KhabiMapProps {
  height?: number;
  showPin?: boolean;
  markers?: { id: string; coordinate: Coordinates; title?: string; color?: 'primary' | 'accent' }[];
  centerOnUser?: boolean;
}

// Set to `true` only after you have:
//   1. Added a Google Maps API key in app.json under android.config.googleMaps.apiKey
//   2. Rebuilt the APK with `expo prebuild --clean && eas build`
// Until then, the placeholder is rendered everywhere — this prevents native
// crashes on Android release builds where MapView can fail to initialize.
const NATIVE_MAPS_ENABLED = false;

type MapsModule = typeof import('react-native-maps');
let MapsModuleRef: MapsModule | null = null;
let MapsLoadFailed = false;

function loadMapsModule(): MapsModule | null {
  if (!NATIVE_MAPS_ENABLED) return null;
  if (MapsModuleRef || MapsLoadFailed) return MapsModuleRef;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
  markers,
}: {
  height: number;
  showPin: boolean;
  label: string;
  markers?: KhabiMapProps['markers'];
}) {
  return (
    <View style={[styles.placeholder, { height }]}>
      <View style={styles.placeholderGrid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.placeholderBlock} />
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
      {markers && markers.length > 0 && (
        <View style={styles.markersHint}>
          <Text style={styles.markersHintText}>
            {markers.length} repère{markers.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <View style={styles.placeholderLabel}>
        <Text style={styles.placeholderLabelText}>{label}</Text>
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
  const [readyToRenderMap, setReadyToRenderMap] = useState<boolean>(false);

  useEffect(() => {
    if (!NATIVE_MAPS_ENABLED) return;
    const task = InteractionManager.runAfterInteractions(() => {
      setReadyToRenderMap(true);
    });
    return () => task.cancel();
  }, []);

  if (Platform.OS === 'web' || !NATIVE_MAPS_ENABLED) {
    return <MapPlaceholder height={height} showPin={showPin} label={address} markers={markers} />;
  }

  const Maps = loadMapsModule();
  if (!Maps || !readyToRenderMap) {
    return <MapPlaceholder height={height} showPin={showPin} label={address} markers={markers} />;
  }

  const { default: MapView, Marker } = Maps;

  const mapRegion = centerOnUser
    ? region
    : {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };

  return (
    <MapErrorBoundary
      fallback={
        <MapPlaceholder height={height} showPin={showPin} label={address} markers={markers} />
      }
    >
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
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
  placeholder: {
    borderRadius: 16,
    backgroundColor: '#E8F4F0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.3,
  },
  placeholderBlock: {
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
  markersHint: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  markersHintText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700' as const,
  },
  placeholderLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  placeholderLabelText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
});
