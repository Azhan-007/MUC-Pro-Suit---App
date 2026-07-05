import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CampusCard, PageHeader } from '../../components';
import { Colors } from '../../theme';
import {
  Calendar,
  CheckCircle,
  TrendingUp,
  Wallet,
  GraduationCap,
  Bell,
  ClipboardList,
  BookOpen,
  Briefcase,
  Megaphone,
  FileText,
  ChevronRight,
  BookOpen as LibraryIcon,
} from 'lucide-react-native';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  route: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const MenuScreen: React.FC = () => {
  const router = useRouter();

  const SECTIONS: MenuSection[] = [
    {
      title: 'Academic',
      items: [
        {
          title: 'Timetable',
          subtitle: 'Daily class schedule & labs',
          icon: <Calendar size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/schedule',
        },
        {
          title: 'Attendance View',
          subtitle: 'Subject percentages & statistics',
          icon: <CheckCircle size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/attendance',
        },
        {
          title: 'Results & CGPA',
          subtitle: 'Semester grades & SGPA charts',
          icon: <TrendingUp size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/results',
        },
        {
          title: 'Exams & Marks',
          subtitle: 'Exam schedules & marks list',
          icon: <GraduationCap size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/exams',
        },
        {
          title: 'Assignments',
          subtitle: 'Pending homework submissions',
          icon: <ClipboardList size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/assignments',
        },
        {
          title: 'Study Materials',
          subtitle: 'Lecture slides & reference notes',
          icon: <BookOpen size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/study-materials',
        },
      ],
    },
    {
      title: 'Financial',
      items: [
        {
          title: 'Fee Status',
          subtitle: 'Fee dues, transactions & receipts',
          icon: <Wallet size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/fees',
        },
      ],
    },
    {
      title: 'Campus Services',
      items: [
        {
          title: 'Digital Library',
          subtitle: 'Borrowed books & search catalog',
          icon: <LibraryIcon size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/library',
        },
        {
          title: 'Placement Cell',
          subtitle: 'Job drives, internships & status',
          icon: <Briefcase size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/placements',
        },
        {
          title: 'College Events',
          subtitle: 'Fests registrations & schedules',
          icon: <Megaphone size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/events',
        },
        {
          title: 'Certificates & Requests',
          subtitle: 'Bonafide, TC requests & history',
          icon: <FileText size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/requests',
        },
        {
          title: 'Circulars & Alerts',
          subtitle: 'Official announcements & notices',
          icon: <Bell size={20} color={Colors.BluePrimary} />,
          iconBg: Colors.BluePrimaryContainer + '4D',
          route: '/student/alerts',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Menu" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <CampusCard style={styles.menuListCard} elevation="sm" padding={0}>
              {section.items.map((item, idx) => {
                const isLast = idx === section.items.length - 1;
                return (
                  <View key={item.title}>
                    <Pressable
                      onPress={() => router.push(item.route as any)}
                      style={({ pressed }) => [
                        styles.menuRow,
                        pressed && styles.menuRowPressed,
                      ]}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                        {item.icon}
                      </View>
                      <View style={styles.textWrap}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                      </View>
                      <ChevronRight size={16} color={Colors.AppOnSurfaceVariant} />
                    </Pressable>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </CampusCard>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: Colors.AppBackground },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.AppOnBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24 },
  userCard: { backgroundColor: '#FFFFFF', marginBottom: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: '800', color: Colors.BluePrimary },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground },
  userDept: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  userReg: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 1, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnSurfaceVariant, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 4 },
  menuListCard: { backgroundColor: '#FFFFFF', overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuRowPressed: { backgroundColor: '#F8FAFC' },
  iconCircle: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  textWrap: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  itemSubtitle: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginLeft: 66 },
  logoutCard: { backgroundColor: '#FFFFFF', overflow: 'hidden', marginTop: 8 },
});
