import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageBackground,
  FlatList,
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
  Wallet,
  BookOpen,
  ClipboardList,
  CalendarOff,
  Grid3X3,
  ChevronRight,
  User,
  MapPin,
  Briefcase,
  Megaphone,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { mockTimetable } from '../../data/mockData';
import {
  CampusCard,
  CustomButton,
  SectionHeader,
  QuickActionButton,
  CircularProgress,
  StatusChip,
} from '../../components';
import { Colors } from '../../theme';
import { Announcement, AttendanceStatus } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

const CAROUSEL_ITEMS = [
  {
    id: '2',
    subtitle: 'Campus Life',
    title: 'Explore Our New\nDigital Library',
    image: require('../../../assets/library_banner.jpg'),
  },
  {
    id: '1',
    subtitle: 'Upcoming Workshop',
    title: 'AI Workshop\nby Dept of CS',
    image: require('../../../assets/ai_workshop_banner.png'),
  },
  {
    id: '3',
    subtitle: 'Events',
    title: 'Annual Tech Fest\nRegistration Open',
    image: require('../../../assets/campus_banner.png'),
  },
];

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const carouselRef = React.useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeSlide + 1) % CAROUSEL_ITEMS.length;
      carouselRef.current?.scrollTo({
        x: nextIndex * CAROUSEL_WIDTH,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlide]);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : (insets.top || 44);
  const student = useAuthStore((s) => s.student);
  const {
    attendanceOverview,
    notificationCount,
    announcements,
    dailyAttendance,
  } = useCampusStore();

  if (!student) return null;

  const firstName = student.name.split(' ')[0];
  const initial = student.name[0];

  const getTodayDateString = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}`;
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return { bg: '#10B981', border: '#10B981', text: '#FFFFFF' };
      case 'ABSENT':
        return { bg: '#EF4444', border: '#EF4444', text: '#FFFFFF' };
      case 'LATE':
        return { bg: '#F59E0B', border: '#F59E0B', text: '#FFFFFF' };
      case 'PENDING':
      default:
        return { bg: '#FFFFFF', border: '#E5E7EB', text: '#1F2937' };
    }
  };

  const conductedCount = dailyAttendance.filter((a) => a.status !== 'PENDING').length;
  const presentCount = dailyAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const fractionText = `${conductedCount}/5`;

  const getTodayDayKey = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  const todayDayKey = getTodayDayKey();
  const isWeekendDay = todayDayKey === 'Sun' || todayDayKey === 'Sat';
  const todayClasses = mockTimetable[isWeekendDay ? 'Wed' : todayDayKey] || [];
  const ongoingClass = todayClasses.find((cls) => cls.status === 'ONGOING');
  const upcomingClasses = todayClasses.filter((cls) => cls.status === 'UPCOMING');

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return '#10B981'; // Green
    if (pct >= 65) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getWarningBannerStyle = (pct: number) => {
    if (pct >= 75) return { bg: '#10B981', text: '#FFFFFF', label: 'Safe' };
    if (pct >= 65) return { bg: '#F59E0B', text: '#FFFFFF', label: 'Warning' };
    return { bg: '#EF4444', text: '#FFFFFF', label: 'Critical' };
  };

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
      {/* ── 1. Top Header (Clickable Profile Info + Bell) ── */}
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
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.greetingSmall}>Good Morning,</Text>
              <Text style={styles.greetingName}>{student.name}</Text>
              <Text style={styles.headerReg}>Reg: {student.registerNumber}</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.bellBtn}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Bell size={22} color={Colors.AppOnBackground} />
            {notificationCount > 0 && <View style={styles.bellDot} />}
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

        {/* ── 4. Workshop Banner (Horizontal Swipeable Carousel) ── */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slideSize = event.nativeEvent.layoutMeasurement.width;
              const offset = event.nativeEvent.contentOffset.x;
              const active = Math.round(offset / slideSize);
              if (active !== activeSlide) {
                setActiveSlide(active);
              }
            }}
            scrollEventThrottle={16}
            style={styles.carouselScroll}
          >
            {CAROUSEL_ITEMS.map((item) => (
              <View key={item.id} style={styles.bannerCard}>
                <Image
                  source={item.image}
                  style={styles.bannerImage}
                  contentFit="cover"
                />
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerSub}>{item.subtitle}</Text>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.bannerDots}>
            {CAROUSEL_ITEMS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeSlide ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Today's Attendance Hourly Dots Card ── */}
        <CampusCard style={styles.card} elevation="sm">
          <View style={styles.todayAttHeader}>
            <View>
              <Text style={styles.todayAttTitle}>Today's Attendance</Text>
              <Text style={styles.todayAttDate}>{getTodayDateString()}</Text>
            </View>
            <View style={styles.todayAttBadge}>
              <Text style={styles.todayAttBadgeText}>{fractionText}</Text>
            </View>
          </View>
          <View style={styles.hoursRow}>
            {dailyAttendance.slice(0, 5).map((item, index) => {
              const statusColor = getStatusColor(item.status);
              return (
                <View
                  key={index}
                  style={[
                    styles.hourCircle,
                    {
                      backgroundColor: statusColor.bg,
                      borderColor: statusColor.border,
                    },
                  ]}
                >
                  <Text style={[styles.hourText, { color: statusColor.text }]}>
                    {index + 1} hr
                  </Text>
                </View>
              );
            })}
          </View>
        </CampusCard>

        {/* ── 3. Mini Attendance Overview ── */}
        <CampusCard style={styles.card} elevation="sm">
          <View style={styles.todayAttHeader}>
            <View>
              <Text style={styles.todayAttTitle}>Overall Attendance</Text>
              <Text style={styles.todayAttDate}>Semester 4 • B.Tech CSE</Text>
            </View>
            <View
              style={[
                styles.todayAttBadge,
                {
                  backgroundColor: getWarningBannerStyle(attendanceOverview.overallPercentage).bg,
                  borderColor: getWarningBannerStyle(attendanceOverview.overallPercentage).bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.todayAttBadgeText,
                  {
                    color: getWarningBannerStyle(attendanceOverview.overallPercentage).text,
                  },
                ]}
              >
                {getWarningBannerStyle(attendanceOverview.overallPercentage).label}
              </Text>
            </View>
          </View>
          <View style={styles.attendanceRow}>
            <CircularProgress
              percentage={attendanceOverview.overallPercentage}
              size={100}
              strokeWidth={8}
              progressColor={getProgressColor(attendanceOverview.overallPercentage)}
              label="Overall"
            />
            <View style={styles.attendanceStats}>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                  <CheckCircle size={18} color="#15803D" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Present</Text>
                  <Text style={styles.statValue}>{attendanceOverview.presentDays} Hours</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                  <XCircle size={18} color="#B91C1C" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Absent</Text>
                  <Text style={styles.statValue}>{attendanceOverview.absentDays} Hours</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#F3F4F6' }]}>
                  <Calendar size={18} color="#374151" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statValue}>{attendanceOverview.totalDays} Hours</Text>
                </View>
              </View>
            </View>
          </View>
        </CampusCard>

        {/* ── 5. Quick Access Grid ── */}
        <SectionHeader title="Quick Access" />
        <View style={styles.quickGrid}>
          <View style={styles.quickRow}>
            <QuickActionButton title="Attendance" icon={<CheckCircle size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/(tabs)/attendance')} />
            <QuickActionButton title="Timetable" icon={<Calendar size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/(tabs)/schedule')} />
            <QuickActionButton title="Performance" icon={<TrendingUp size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/results')} />
            <QuickActionButton title="Fees" icon={<Wallet size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/fees')} />

          </View>
          <View style={styles.quickRow}>
            <QuickActionButton title="Exams" icon={<GraduationCap size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/exams')} />
            <QuickActionButton title="Circulars" icon={<Bell size={26} color={Colors.BluePrimary} />} iconBg={Colors.BluePrimaryContainer} onPress={() => router.push('/(tabs)/alerts')} />
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }} />
          </View>
        </View>

        {/* ── 6. Today's Classes ── */}
        <SectionHeader
          title="Today's Classes"
          actionText="View Timetable"
          onActionPress={() => router.push('/(tabs)/schedule')}
        />

        {/* Ongoing class */}
        {ongoingClass && (
          <CampusCard backgroundColor={Colors.BluePrimaryContainer} style={styles.card} borderColor={Colors.BluePrimary + '33'}>
            <View style={styles.classRow}>
              <View style={styles.classLeft}>
                <StatusChip text="ONGOING" level="NOW" />
                <Text style={[styles.classSubject, { color: Colors.BlueOnPrimaryContainer }]}>{ongoingClass.subject}</Text>
                <View style={styles.classMetaRow}>
                  <User size={14} color={Colors.BlueOnPrimaryContainer} style={{ opacity: 0.8 }} />
                  <Text style={[styles.classMeta, { color: Colors.BlueOnPrimaryContainer, opacity: 0.8 }]}> {ongoingClass.professor}  </Text>
                  <MapPin size={14} color={Colors.BlueOnPrimaryContainer} style={{ opacity: 0.8 }} />
                  <Text style={[styles.classMeta, { color: Colors.BlueOnPrimaryContainer, opacity: 0.8 }]}> {ongoingClass.room}</Text>
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
                  {cls.subject}
                </Text>
                <View style={styles.classMetaRow}>
                  <User size={14} color={Colors.AppOnSurfaceVariant} />
                  <Text style={[styles.classMeta, { color: Colors.AppOnSurfaceVariant }]}> {cls.professor}  </Text>
                  <MapPin size={14} color={Colors.AppOnSurfaceVariant} />
                  <Text style={[styles.classMeta, { color: Colors.AppOnSurfaceVariant }]}> {cls.room}</Text>
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

        {/* ── 7. Circulars ── */}
        <SectionHeader
          title="Circulars"
          actionText="View All"
          onActionPress={() => router.push('/(tabs)/alerts')}
        />

        <CampusCard style={styles.announcementsContainerCard} elevation="sm">
          {announcements.slice(0, 3).map((item, index) => {
            const iconInfo = getCategoryIconInfo(item.category);
            const isLast = index === announcements.slice(0, 3).length - 1;
            return (
              <View key={item.id}>
                <Pressable
                  onPress={() => router.push('/(tabs)/alerts')}
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
  bellDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.ColorPresent },
  card: { marginBottom: 16 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  studentAvatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { fontSize: 24, fontWeight: '800', color: Colors.BluePrimary },
  studentName: { fontSize: 18, fontWeight: '700', color: Colors.AppOnBackground },
  studentReg: { fontSize: 14, fontWeight: '600', color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 12 },
  studentMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  metaValue: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
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
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerSub: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginTop: 4, lineHeight: 24 },
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
  announcementFeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  announcementFeedText: {
    fontSize: 13,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 18,
  },
  announcementFeedAuthor: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.BluePrimary,
    marginTop: 6,
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
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
