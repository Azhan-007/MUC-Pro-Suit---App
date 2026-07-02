import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function FacultyLayout() {
  const { isLoggedIn, role } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role !== 'FACULTY') {
    return <Redirect href={"/student" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(faculty-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exam-marks" options={{ headerShown: false }} />
      <Stack.Screen name="mark-attendance" options={{ headerShown: false }} />
    </Stack>
  );
}
