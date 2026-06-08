// Disable native autolinking of react-native-maps until a Google Maps API key
// is configured in app.json (android.config.googleMaps.apiKey). Without the
// key, MapView can crash on release builds when the native module tries to
// initialize the map provider. KhabiMap renders a JS placeholder in the
// meantime (see NATIVE_MAPS_ENABLED in components/KhabiMap.tsx).
module.exports = {
  dependencies: {
    'react-native-maps': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
