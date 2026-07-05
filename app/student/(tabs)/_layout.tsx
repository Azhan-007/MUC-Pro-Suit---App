import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar, CheckCircle, Menu, User } from 'lucide-react-native';
import { Colors } from '../../../src/theme';

interface TabBarItemProps {
  label: string;
  isFocused: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({ label, isFocused, icon, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      tabStyles.item,
      { opacity: pressed && Platform.OS === 'ios' ? 0.6 : 1 }
    ]}
    android_ripple={{ color: Colors.BluePrimary + '1E', borderless: true, radius: 36 }}
  >
    <View style={[tabStyles.pill, isFocused && { backgroundColor: Colors.BluePrimary + '1F' }]}>
      {icon}
    </View>
    <Text style={[tabStyles.label, { color: isFocused ? Colors.BluePrimary : Colors.AppOnSurfaceVariant }]}>
      {label}
    </Text>
  </Pressable>
);

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const TAB_MAP: Record<string, { label: string; icon: (focused: boolean) => React.ReactNode }> = {
    index: { label: 'Home', icon: (focused: boolean) => <Home size={22} color={focused ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} /> },
    schedule: { label: 'Schedule', icon: (focused: boolean) => <Calendar size={22} color={focused ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} /> },
    attendance: { label: 'Attendance', icon: (focused: boolean) => <CheckCircle size={22} color={focused ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} /> },
    menu: { label: 'Menu', icon: (focused: boolean) => <Menu size={22} color={focused ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} /> },
    profile: { label: 'Profile', icon: (focused: boolean) => <User size={22} color={focused ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} /> },
  };

  return (
    <View style={[tabStyles.bar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12, borderTopWidth: 1, borderTopColor: Colors.AppOutline }]}>
      {state.routes
        .filter((route: any) => route.name !== 'schedule')
        .map((route: any) => {
          const isFocused = state.routes[state.index].key === route.key;
          const tab = TAB_MAP[route.name];
          if (!tab) return null;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarItem
              key={route.key}
              label={tab.label}
              isFocused={isFocused}
              icon={tab.icon(isFocused)}
              onPress={onPress}
            />
          );
        })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: Colors.AppSurface, paddingVertical: 8, paddingHorizontal: 12 },
  item: { flex: 1, alignItems: 'center' },
  pill: { width: 60, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="menu" />
      <Tabs.Screen name="attendance" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
