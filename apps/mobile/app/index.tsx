import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isLoggedIn, role } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'STUDENT') {
    return <Redirect href="/student" />;
  }

  if (role === 'FACULTY') {
    return <Redirect href="/faculty" />;
  }

  return <Redirect href="/(auth)/login" />;
}
