import React, { useEffect, useState, useCallback, Component, ErrorInfo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// ============================================================
// Global error handler for diagnostic logging
// ============================================================
let globalError: string | null = null;

try {
  if (typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      globalError = `[${isFatal ? 'FATAL' : 'ERROR'}] ${error?.message || String(error)}\n${error?.stack || ''}`;
      try {
        const SplashMod = require('expo-splash-screen');
        SplashMod.hideAsync?.();
      } catch (_) {}
      if (originalHandler) originalHandler(error, isFatal);
    });
  }
} catch (_) {}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

class AppErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: `${error.name}: ${error.message}\n\n${error.stack || 'No stack trace'}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      const SplashMod = require('expo-splash-screen');
      SplashMod.hideAsync?.();
    } catch (_) {}
  }

  render() {
    if (this.state.hasError || globalError) {
      const errorText = this.state.error || globalError || 'Unknown error';
      return (
        <View style={errorStyles.container}>
          <ScrollView style={errorStyles.scroll} contentContainerStyle={errorStyles.scrollContent}>
            <Text style={errorStyles.title}>⚠️ App Crash Detected</Text>
            <Text style={errorStyles.subtitle}>
              The app crashed during startup. Share this screen with the developer:
            </Text>
            <Text style={errorStyles.errorText}>{errorText}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000', paddingTop: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { color: '#ff4444', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#ffaaaa', fontSize: 14, marginBottom: 20 },
  errorText: { color: '#ffffff', fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
});

// ============================================================
// Root Layout Configuration
// ============================================================
import { Stack } from 'expo-router';
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
import { CampusAlertProvider } from '../src/components';

// Prevent splash screen auto hide on launch
try { SplashScreen.preventAutoHideAsync(); } catch (_) {}

const queryClient = new QueryClient();

function AppContent() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  // Safety timeout: Always hide splash after 3 seconds no matter what
  useEffect(() => {
    const timer = setTimeout(() => {
      try { SplashScreen.hideAsync(); } catch (_) {}
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash screen when fonts are loaded or when a font loading error occurs
  useEffect(() => {
    if (fontsLoaded || fontError) {
      try { SplashScreen.hideAsync(); } catch (_) {}
    }
  }, [fontsLoaded, fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CampusAlertProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
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

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
