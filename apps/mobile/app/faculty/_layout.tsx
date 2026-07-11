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
      <Stack.Screen name="attendance-hub" options={{ headerShown: false }} />
      <Stack.Screen name="academic-hub" options={{ headerShown: false }} />
      <Stack.Screen name="student-hub" options={{ headerShown: false }} />
      <Stack.Screen name="admin-hub" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="other-attendance" options={{ headerShown: false }} />
      <Stack.Screen name="dept-timetable" options={{ headerShown: false }} />
      <Stack.Screen name="batch-timetable" options={{ headerShown: false }} />
      <Stack.Screen name="event-od" options={{ headerShown: false }} />
      <Stack.Screen name="substitution" options={{ headerShown: false }} />
      <Stack.Screen name="engage-attendance" options={{ headerShown: false }} />
      <Stack.Screen name="class-cancel" options={{ headerShown: false }} />
    </Stack>
  );
}
