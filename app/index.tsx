import { theme } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const { isLoading, isAuthenticated, isOnboarded, hasGrantedGPS, user } =
    useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      console.log("[Splash] Navigating...", {
        isOnboarded,
        isAuthenticated,
        hasGrantedGPS,
        role: user?.role,
      });
      if (!isOnboarded) {
        router.replace("/onboarding" as any);
      } else if (!isAuthenticated) {
        router.replace("/role-select" as any);
      } else if (!hasGrantedGPS) {
        router.replace("/gps-permission" as any);
      } else if (user?.role === "driver") {
        router.replace("/(driver-tabs)/dashboard" as any);
      } else {
        router.replace("/(client-tabs)/home" as any);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, isOnboarded, hasGrantedGPS, user]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.bgPattern}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logoImage}
        />
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
        Livraison rapide et fiable
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  circle2: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  logoContainer: {
    alignItems: "center",
    gap: 5,
  },
  logoImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    marginTop: 12,
    letterSpacing: 1,
  },
});
