import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const router = useRouter();
  const { isLoggedIn, isLoading, role, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  // Route as soon as auth loading finishes
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace('/(auth)/login');
      } else if (role === 'STUDENT') {
        router.replace('/student');
      } else if (role === 'FACULTY') {
        router.replace('/faculty');
      } else {
        router.replace('/(auth)/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoggedIn, isLoading, role, router]);

  // Fail-safe timeout: Never stay stuck on the splash screen longer than 2.5s
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.isLoading) {
        if (!state.isLoggedIn) {
          router.replace('/(auth)/login');
        } else if (state.role === 'STUDENT') {
          router.replace('/student');
        } else if (state.role === 'FACULTY') {
          router.replace('/faculty');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 2500);

    return () => clearTimeout(fallbackTimer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="small" color="#0F766E" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 220,
    height: 220,
  },
  loader: {
    marginTop: 24,
  },
});
