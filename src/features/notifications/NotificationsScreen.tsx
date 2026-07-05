import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { PageHeader, CampusCard } from '../../components';
import { Colors } from '../../theme';
import {
  Bell,
  BellOff,
  BookOpen,
  Wallet,
  Briefcase,
  Megaphone,
  ChevronRight,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react-native';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: 'ACADEMIC' | 'FINANCIAL' | 'PLACEMENTS' | 'LIBRARY' | 'EVENTS' | 'CIRCULARS';
  read: boolean;
  route: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Assignment Deadline Approaching',
    body: 'Your Chemistry Lab Report 4 is due tomorrow at 11:59 PM. Please submit offline.',
    timestamp: '2 hours ago',
    category: 'ACADEMIC',
    read: false,
    route: '/student/assignments',
  },
  {
    id: 'notif-2',
    title: 'Outstanding Semester Fees Due',
    body: 'An outstanding balance of ₹1,250 is unpaid. Please settle before July 10 to avoid penalty.',
    timestamp: '5 hours ago',
    category: 'FINANCIAL',
    read: false,
    route: '/student/fees',
  },
  {
    id: 'notif-3',
    title: 'Job Drive Application Closing',
    body: 'Registration for the active Cognizant recruitment drive closes today at 5:00 PM.',
    timestamp: 'Yesterday',
    category: 'PLACEMENTS',
    read: true,
    route: '/student/placements',
  },
  {
    id: 'notif-4',
    title: 'Overdue Book Fine Notice',
    body: 'The issued book "Design Patterns" is overdue by 3 days. Active fine: ₹15.',
    timestamp: '3 days ago',
    category: 'LIBRARY',
    read: true,
    route: '/student/library',
  },
  {
    id: 'notif-5',
    title: 'Registration Slot Secured',
    body: 'You are successfully registered for the "MUC Fest \'26" cultural event.',
    timestamp: '4 days ago',
    category: 'EVENTS',
    read: true,
    route: '/student/events',
  },
  {
    id: 'notif-6',
    title: 'End-Semester Exam Timetable',
    body: 'Circular: Official timetable schedule for May/June End Sem Examinations has been published.',
    timestamp: '1 week ago',
    category: 'CIRCULARS',
    read: true,
    route: '/student/alerts',
  },
];

export const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const { setNotificationCount } = useCampusStore();
  const [list, setList] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Sync count to campus store on mount and updates
  useEffect(() => {
    const unreadCount = list.filter((n) => !n.read).length;
    setNotificationCount(unreadCount);
  }, [list]);

  const handleMarkAllRead = () => {
    setList((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    // Mark as read
    setList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    // Route to appropriate module page
    router.push(item.route as any);
  };

  const handleDeleteNotification = (id: string) => {
    setList((prev) => prev.filter((item) => item.id !== id));
  };

  const getCategoryTheme = (category: NotificationItem['category']) => {
    switch (category) {
      case 'ACADEMIC':
        return { icon: <BookOpen size={16} color="#2563EB" />, bg: '#EFF6FF', label: 'Academic' };
      case 'FINANCIAL':
        return { icon: <Wallet size={16} color="#10B981" />, bg: '#ECFDF5', label: 'Financial' };
      case 'PLACEMENTS':
        return { icon: <Briefcase size={16} color="#8B5CF6" />, bg: '#F5F3FF', label: 'Placements' };
      case 'LIBRARY':
        return { icon: <FileText size={16} color="#0D9488" />, bg: '#F0FDFA', label: 'Library' };
      case 'EVENTS':
        return { icon: <Megaphone size={16} color="#F59E0B" />, bg: '#FFFBEB', label: 'Events' };
      case 'CIRCULARS':
      default:
        return { icon: <AlertCircle size={16} color="#D97706" />, bg: '#FFFBEB', label: 'Circular' };
    }
  };

  const renderMarkAllBtn = () => {
    const hasUnread = list.some((n) => !n.read);
    if (!hasUnread) return null;
    return (
      <Pressable onPress={handleMarkAllRead} style={styles.markReadBtn} hitSlop={8}>
        <Text style={styles.markReadText}>Mark all read</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Notifications" rightElement={renderMarkAllBtn()} />

      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <BellOff size={32} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>
            You're all caught up! Fee deadlines, library book returns, and job alerts will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const theme = getCategoryTheme(item.category);
            return (
              <CampusCard
                borderColor={Colors.AppOutline}
                style={[styles.card, !item.read && styles.unreadCard]}
                elevation="sm"
              >
                {!item.read && <View style={styles.unreadIndicatorBar} />}
                <Pressable
                  style={styles.cardPressable}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
                      {theme.icon}
                    </View>
                    <View style={styles.headerMeta}>
                      <Text style={styles.categoryLabel}>{theme.label}</Text>
                      <Text style={styles.timestampText}>{item.timestamp}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.bodyText}>{item.body}</Text>

                  <View style={styles.divider} />

                  <View style={styles.actionRow}>
                    <View style={styles.actionLeft}>
                      <Text style={styles.actionLinkText}>View details</Text>
                      <ChevronRight size={13} color={Colors.BluePrimary} />
                    </View>
                    
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteNotification(item.id)}
                      hitSlop={8}
                    >
                      <Trash2 size={15} color="#94A3B8" />
                    </Pressable>
                  </View>
                </Pressable>
              </CampusCard>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', padding: 0, overflow: 'hidden', marginBottom: 12 },
  unreadCard: {
    backgroundColor: '#F8FAFC', // Slate-50 background for unread items
  },
  unreadIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.BluePrimary,
    zIndex: 2,
  },
  cardPressable: { padding: 14, paddingLeft: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, position: 'relative' },
  iconBox: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headerMeta: { flex: 1, marginLeft: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  timestampText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.BluePrimary, marginRight: 4 },
  titleText: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  bodyText: { fontSize: 12, color: '#64748B', lineHeight: 18, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionLinkText: { fontSize: 11, color: Colors.BluePrimary, fontWeight: '700' },
  deleteBtn: { padding: 4 },

  // Mark all read header element
  markReadBtn: { marginRight: 16, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  markReadText: { fontSize: 11, color: Colors.BluePrimary, fontWeight: '700' },

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptySubtitle: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, fontWeight: '500' },
});
