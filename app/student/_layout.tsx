import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function StudentLayout() {
  const { isLoggedIn, role } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role !== 'STUDENT') {
    return <Redirect href={"/faculty" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
      <Stack.Screen name="fees" options={{ headerShown: false }} />
      <Stack.Screen name="exams" options={{ headerShown: false }} />
      <Stack.Screen name="exam-results" options={{ headerShown: false }} />
    </Stack>
  );
}
