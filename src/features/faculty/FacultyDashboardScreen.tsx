import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle,
  XCircle,
  Calendar,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ChevronRight,
  User,
  MapPin,
  TrendingUp,
  Briefcase,
  Megaphone,
  Award,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { mockFacultyTimetable, mockFacultyStats } from '../../data/mockFacultyData';
import {
  CampusCard,
  SectionHeader,
  QuickActionButton,
  CircularProgress,
  StatusChip,
} from '../../components';
import { Colors } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const FacultyDashboardScreen: React.FC = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);

  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : (insets.top || 44);
  const faculty = useAuthStore((s) => s.faculty);
  const { announcements } = useCampusStore();

  if (!faculty) return null;

  const initial = faculty.name.split(' ').filter(w => /[A-Za-z]/.test(w[0])).map(w => w[0]).join('').slice(0, 2);

  const todayIdx = new Date().getDay();
  const todayKey = DAYS[todayIdx];
  const isWeekendDay = todayKey === 'Sun' || todayKey === 'Sat';
  const todayClasses = mockFacultyTimetable[isWeekendDay ? 'Mon' : todayKey] || [];
  const ongoingClass = todayClasses.find((cls) => cls.status === 'ONGOING');
  const upcomingClasses = todayClasses.filter((cls) => cls.status === 'UPCOMING');



  const getCategoryIconInfo = (category: string) => {
    switch (category.toUpperCase()) {
      case 'ACADEMIC':
        return {
          icon: <BookOpen size={18} color="#2563EB" />,
          bg: '#DBEAFE',
        };
      case 'PLACEMENTS':
        return {
          icon: <Briefcase size={18} color="#10B981" />,
          bg: '#DCFCE7',
        };
      case 'EVENTS':
        return {
          icon: <Megaphone size={18} color="#F59E0B" />,
          bg: '#FEF3C7',
        };
      case 'SCHOLARSHIPS':
        return {
          icon: <Award size={18} color="#8B5CF6" />,
          bg: '#EDE9FE',
        };
      case 'LIBRARY':
        return {
          icon: <BookOpen size={18} color="#0D9488" />,
          bg: '#CCFBF1',
        };
      default:
        return {
          icon: <Bell size={18} color="#475569" />,
          bg: '#F1F5F9',
        };
    }
  };

  return (
    <View style={styles.safeArea}>
      {/* ── 1. Top Header ── */}
      <View
        style={[
          styles.fixedHeaderContainer,
          scrolled
            ? {
              top: 0,
              left: 0,
              right: 0,
              paddingTop: statusBarHeight + 12,
              paddingBottom: 12,
              paddingHorizontal: 16,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: Colors.AppOutline,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 4,
            }
            : {
              top: statusBarHeight + 12,
              left: 16,
              right: 16,
              backgroundColor: 'transparent',
            },
        ]}
      >
        <View
          style={
            scrolled
              ? styles.header
              : [
                styles.header,
                {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.AppOutline,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 2,
                },
              ]
          }
        >
          <Pressable
            style={styles.headerLeft}
            onPress={() => router.push('/(faculty-tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.greetingSmall}>Good Morning,</Text>
              <Text style={styles.greetingName}>{faculty.name}</Text>
              <Text style={styles.headerReg}>Emp ID: {faculty.employeeId}</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.bellBtn}
            onPress={() => router.push('/(faculty-tabs)/alerts')}
          >
            <Bell size={22} color={Colors.AppOnBackground} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: statusBarHeight + 112 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          if (offsetY > 10) {
            setScrolled(true);
          } else {
            setScrolled(false);
          }
        }}
      >
        {/* ── 2. Library Banner Card ── */}
        <View style={{ marginBottom: 16 }}>
          <View style={styles.bannerCard}>
            <Image
              source={require('../../../assets/library_banner.jpg')}
              style={styles.bannerImage}
              contentFit="cover"
            />
            <View style={styles.bannerContent}>
              <View style={styles.textBadge}>
                <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>MAZHARUL ULOOM COLLEGE (AUTONOMOUS), AMBUR</Text>
              </View>
            </View>
          </View>
        </View>



        {/* ── 4. Quick Access Grid ── */}
        <SectionHeader title="Quick Access" />
        <View style={styles.quickGrid}>
          <View style={styles.quickRow}>
            <QuickActionButton title="Attendance" icon={<CheckCircle size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/(faculty-tabs)/classes')} />
            <QuickActionButton title="Timetable" icon={<Calendar size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/(faculty-tabs)/schedule')} />
            <QuickActionButton title="Enter Marks" icon={<ClipboardList size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/faculty-exam-marks')} />
            <QuickActionButton title="Circulars" icon={<Bell size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/(faculty-tabs)/alerts')} />
          </View>
        </View>

        {/* ── 5. Today's Classes ── */}
        <SectionHeader
          title="Today's Classes"
          actionText="View Schedule"
          onActionPress={() => router.push('/(faculty-tabs)/schedule')}
        />
        {/* Ongoing class */}
        {ongoingClass && (
          <CampusCard backgroundColor={Colors.BluePrimaryContainer} style={styles.card} borderColor={Colors.BluePrimary + '33'}>
            <View style={styles.classRow}>
              <View style={styles.classLeft}>
                <StatusChip text="ONGOING" level="NOW" />
                <Text style={[styles.classSubject, { color: Colors.BlueOnPrimaryContainer }]}>
                  {ongoingClass.section}  ·  {ongoingClass.room}
                </Text>
                <View style={styles.classMetaRow}>
                  <BookOpen size={14} color={Colors.BlueOnPrimaryContainer} style={{ opacity: 0.8 }} />
                  <Text style={[styles.classMeta, { color: Colors.BlueOnPrimaryContainer, opacity: 0.8 }]}>
                    {" "}{ongoingClass.subject}
                  </Text>
                </View>
              </View>
              <View style={[styles.timeBox, { backgroundColor: 'rgba(30, 64, 175, 0.1)' }]}>
                <Text style={[styles.timeText, { color: Colors.BlueOnPrimaryContainer }]}>{ongoingClass.time.replace('\n', ' - ')}</Text>
              </View>
            </View>
          </CampusCard>
        )}

        {/* Upcoming classes */}
        {upcomingClasses.slice(0, 2).map((cls, idx) => (
          <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
            <View style={styles.classRow}>
              <View style={styles.classLeft}>
                <View style={styles.upcomingHeader}>
                  <View style={styles.pendingDot} />
                  <Text style={styles.upcomingTime}>{cls.time.replace('\n', ' - ')}</Text>
                  <View style={{ marginLeft: 12 }}>
                    <StatusChip text="Upcoming" level="WARNING" />
                  </View>
                </View>
                <Text style={[styles.classSubject, { color: Colors.AppOnBackground, marginTop: 8 }]}>
                  {cls.section}  ·  {cls.room}
                </Text>
                <View style={styles.classMetaRow}>
                  <BookOpen size={14} color={Colors.AppOnSurfaceVariant} />
                  <Text style={[styles.classMeta, { color: Colors.AppOnSurfaceVariant }]}>
                    {" "}{cls.subject}
                  </Text>
                </View>
              </View>
            </View>
          </CampusCard>
        ))}

        {/* No active classes placeholder */}
        {!ongoingClass && upcomingClasses.length === 0 && (
          <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.AppOnSurfaceVariant }}>
                No more classes scheduled for today!
              </Text>
            </View>
          </CampusCard>
        )}

        {/* ── 6. Circulars ── */}
        <SectionHeader
          title="Circulars"
          actionText="View All"
          onActionPress={() => router.push('/(faculty-tabs)/alerts')}
        />

        <CampusCard style={styles.announcementsContainerCard} elevation="sm">
          {announcements.slice(0, 3).map((item, index) => {
            const iconInfo = getCategoryIconInfo(item.category);
            const isLast = index === announcements.slice(0, 3).length - 1;
            return (
              <View key={item.id}>
                <Pressable
                  onPress={() => router.push('/(faculty-tabs)/alerts')}
                  style={({ pressed }) => [
                    styles.announcementFeedItem,
                    pressed && { backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <View style={[styles.announcementIconCircle, { backgroundColor: iconInfo.bg }]}>
                    {iconInfo.icon}
                  </View>
                  <View style={styles.announcementFeedContent}>
                    <Text style={styles.announcementFeedTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.announcementFeedDate}>
                      {item.category} • {item.dateText}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 8 }} />
                </Pressable>
                {!isLast && <View style={styles.feedDivider} />}
              </View>
            );
          })}
        </CampusCard>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  fixedHeaderContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: Colors.BluePrimary },
  greetingSmall: { fontSize: 13, color: Colors.AppOnSurfaceVariant },
  greetingName: { fontSize: 20, fontWeight: '900', color: Colors.BluePrimary, lineHeight: 24 },
  headerReg: { fontSize: 13, fontWeight: '600', color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  bellBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.AppSurface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  card: { marginBottom: 16 },
  attendanceRow: { flexDirection: 'row', alignItems: 'center' },
  attendanceStats: { marginLeft: 20, gap: 10, flex: 1 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  statValue: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  carouselContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  carouselScroll: {
    borderRadius: 16,
  },
  bannerCard: {
    width: CAROUSEL_WIDTH,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  textBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    width: '92%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 14,
    backgroundColor: Colors.BluePrimary,
  },
  dotInactive: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  quickGrid: { gap: 8, marginBottom: 8 },
  quickRow: { flexDirection: 'row' },
  classRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classLeft: { flex: 1 },
  classSubject: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  classMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  classMeta: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  timeBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  timeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center' },
  pendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.ColorPending },
  upcomingTime: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant, marginLeft: 6 },
  announcementsContainerCard: {
    padding: 0,
    overflow: 'hidden',
  },
  announcementFeedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  announcementIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  announcementFeedContent: {
    flex: 1,
  },
  announcementFeedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.AppOnBackground,
    flex: 1,
    marginRight: 8,
  },
  announcementFeedDate: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
  },
  feedDivider: {
    height: 1,
    backgroundColor: Colors.AppOutline,
    marginLeft: 70,
  },
  todayAttHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayAttTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  todayAttDate: {
    fontSize: 13,
    color: Colors.AppOnSurfaceVariant,
    marginTop: 2,
  },
  todayAttBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todayAttBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
});
