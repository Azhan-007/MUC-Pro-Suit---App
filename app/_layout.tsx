import { useEffect } from 'react';
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

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGuard() {
  const { isLoggedIn, role } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const allowedStudentRoutes = ['(tabs)', 'results', 'fees', 'exams', 'exam-results'];
    const isStudentRoute = allowedStudentRoutes.includes(segments[0]);
    const allowedFacultyRoutes = ['(faculty-tabs)', 'faculty-mark-attendance', 'faculty-exam-marks'];
    const isFacultyRoute = allowedFacultyRoutes.includes(segments[0]);

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && role === 'STUDENT' && !isStudentRoute) {
      router.replace('/(tabs)');
    } else if (isLoggedIn && role === 'FACULTY' && !isFacultyRoute) {
      router.replace('/(faculty-tabs)' as any);
    }
  }, [isLoggedIn, role, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGuard />
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(faculty-tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="results" options={{ headerShown: false }} />
            <Stack.Screen name="fees" options={{ headerShown: false }} />
            <Stack.Screen name="exams" options={{ headerShown: false }} />
            <Stack.Screen name="exam-results" options={{ headerShown: false }} />
            <Stack.Screen name="faculty-mark-attendance" options={{ headerShown: false }} />
            <Stack.Screen name="faculty-exam-marks" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

