import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/store/authStore';

import { CampusAlertProvider } from '../src/components';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AuthGuard() {
  const { isLoggedIn, role } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Wait a tick after mount so the navigation container is fully initialized
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      const inAuthGroup = (segments[0] as string) === '(auth)';
      const isStudentRoute = (segments[0] as string) === 'student';
      const isFacultyRoute = (segments[0] as string) === 'faculty';

      if (!isLoggedIn && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isLoggedIn && role === 'STUDENT' && !isStudentRoute) {
        router.replace('/student' as any);
      } else if (isLoggedIn && role === 'FACULTY' && !isFacultyRoute) {
        router.replace('/faculty' as any);
      }
    } catch (e) {
      // Silently handle navigation errors during initialization
      console.warn('AuthGuard navigation error:', e);
    }
  }, [isLoggedIn, role, segments, isReady]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const onLayoutReady = useCallback(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Safety timeout: always hide splash after 3 seconds no matter what
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash as soon as fonts load (or fail)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Don't block rendering - render the app even without fonts
  // (system fonts will be used as fallback until custom fonts load)
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutReady}>
      <SafeAreaProvider>
        <CampusAlertProvider>
          <QueryClientProvider client={queryClient}>
            <AuthGuard />
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="student" options={{ headerShown: false }} />
              <Stack.Screen name="faculty" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </CampusAlertProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

