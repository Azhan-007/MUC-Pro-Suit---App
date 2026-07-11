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
  Modal,
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
  FileText,
  AlertCircle,
  Clock,
  Plus,
  Check,
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

const getClassStatusRealtime = (timeStr: string): 'COMPLETED' | 'ONGOING' | 'UPCOMING' => {
  const normalized = timeStr.replace(/\s+/g, '').replace(/[\n\-–]/g, '-');
  const parts = normalized.split('-');
  if (parts.length < 2) return 'UPCOMING';

  const [startStr, endStr] = parts;
  const parseToMinutes = (str: string) => {
    let [h, m] = str.split(':').map(Number);
    if (h >= 1 && h <= 4) h += 12; // Adjust afternoon classes
    return h * 60 + m;
  };

  const startMin = parseToMinutes(startStr);
  const endMin = parseToMinutes(endStr);
  const currentMin = new Date().getHours() * 60 + new Date().getMinutes();

  if (currentMin >= endMin) return 'COMPLETED';
  if (currentMin >= startMin && currentMin < endMin) return 'ONGOING';
  return 'UPCOMING';
};

const SHORTCUT_METADATA: Record<string, {
  title: string;
  iconName: string;
  route: string;
  bg: string;
}> = {
  Attendance: { title: 'Attendance', iconName: 'CheckCircle', route: '/student/attendance', bg: Colors.BluePrimaryContainer },
  Timetable: { title: 'Timetable', iconName: 'Calendar', route: '/student/schedule', bg: Colors.BluePrimaryContainer },
  Performance: { title: 'Performance', iconName: 'TrendingUp', route: '/student/results', bg: Colors.BluePrimaryContainer },
  Fees: { title: 'Fees', iconName: 'Wallet', route: '/student/fees', bg: Colors.BluePrimaryContainer },
  Assignments: { title: 'Assignments', iconName: 'ClipboardList', route: '/student/assignments', bg: Colors.BluePrimaryContainer },
  Library: { title: 'Library', iconName: 'BookOpen', route: '/student/library', bg: Colors.BluePrimaryContainer },
  Placements: { title: 'Placements', iconName: 'Briefcase', route: '/student/placements', bg: Colors.BluePrimaryContainer },
  Events: { title: 'Events', iconName: 'Megaphone', route: '/student/events', bg: Colors.BluePrimaryContainer },
  Requests: { title: 'Requests', iconName: 'FileText', route: '/student/requests', bg: Colors.BluePrimaryContainer },
  Announcements: { title: 'Announcements', iconName: 'Bell', route: '/student/alerts', bg: Colors.BluePrimaryContainer },
};

const renderShortcutIcon = (name: string, size = 26, color = Colors.BluePrimary) => {
  switch (name) {
    case 'CheckCircle': return <CheckCircle size={size} color={color} />;
    case 'Calendar': return <Calendar size={size} color={color} />;
    case 'TrendingUp': return <TrendingUp size={size} color={color} />;
    case 'Wallet': return <Wallet size={size} color={color} />;
    case 'ClipboardList': return <ClipboardList size={size} color={color} />;
    case 'BookOpen': return <BookOpen size={size} color={color} />;
    case 'Briefcase': return <Briefcase size={size} color={color} />;
    case 'Megaphone': return <Megaphone size={size} color={color} />;
    case 'FileText': return <FileText size={size} color={color} />;
    case 'Bell': return <Bell size={size} color={color} />;
    case 'Plus': return <Plus size={size} color={color} />;
    default: return <Grid3X3 size={size} color={color} />;
  }
};

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const carouselRef = React.useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [selectedAttendance, setSelectedAttendance] = React.useState<any | null>(null);
  const [currentMinute, setCurrentMinute] = React.useState(new Date().getMinutes());
  const [isCustomizingShortcuts, setIsCustomizingShortcuts] = React.useState(false);
  const [tempShortcuts, setTempShortcuts] = React.useState<string[]>([]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMinute(new Date().getMinutes());
    }, 30000); // Sync every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const getProfessorForSubject = (subject: string) => {
    switch (subject) {
      case 'Operating System':
        return 'Ms Sayeeda';
      case 'Database Management System':
        return 'Dr P Rizwan Ahmed';
      case 'Data Mining and Warehousing':
        return 'Dr A Zakiuddin Ahmed';
      case 'Data Science':
        return 'Mr Yaseen';
      default:
        return 'Academic Faculty';
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeSlide + 1) % CAROUSEL_ITEMS.length;
      carouselRef.current?.scrollTo({
        x: nextIndex * CAROUSEL_WIDTH,
        animated: true,
      });
    }, 8000);

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
    quickAccessShortcuts,
    setQuickAccessShortcuts,
  } = useCampusStore();

  if (!student) return null;

  const handleOpenCustomizer = () => {
    setTempShortcuts(quickAccessShortcuts);
    setIsCustomizingShortcuts(true);
  };

  const toggleTempShortcut = (key: string) => {
    if (tempShortcuts.includes(key)) {
      setTempShortcuts(tempShortcuts.filter((s) => s !== key));
    } else {
      setTempShortcuts([...tempShortcuts, key]);
    }
  };

  const handleSelectAll = () => {
    setTempShortcuts(Object.keys(SHORTCUT_METADATA));
  };

  const handleResetDefault = () => {
    setTempShortcuts(['Attendance', 'Timetable', 'Performance', 'Fees', 'Assignments', 'Library']);
  };

  const handleSaveShortcuts = () => {
    setQuickAccessShortcuts(tempShortcuts);
    setIsCustomizingShortcuts(false);
  };

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

  const todayClasses = React.useMemo(() => {
    const rawClasses = mockTimetable[isWeekendDay ? 'Wed' : todayDayKey] || [];
    return rawClasses.map((cls) => {
      if (cls.isLunchBreak) return cls;
      return {
        ...cls,
        status: getClassStatusRealtime(cls.time),
      };
    });
  }, [todayDayKey, isWeekendDay, currentMinute]);

  const ongoingClass = React.useMemo(() => todayClasses.find((cls) => cls.status === 'ONGOING'), [todayClasses]);
  const upcomingClasses = React.useMemo(() => todayClasses.filter((cls) => cls.status === 'UPCOMING'), [todayClasses]);

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
      {/* ── 1. Static Floating Header Card ── */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: statusBarHeight + 12 },
        ]}
      >
        <View style={styles.headerCard}>
          <Pressable
            style={styles.headerLeft}
            onPress={() => router.push('/student/profile' as any)}
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
            onPress={() => router.push('/student/notifications' as any)}
          >
            <Bell size={22} color={Colors.AppOnBackground} />
            {notificationCount > 0 && <View style={styles.bellDot} />}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
                <Pressable
                  key={index}
                  onPress={() => setSelectedAttendance({ ...item, hourIndex: index + 1 })}
                  style={({ pressed }) => [
                    styles.hourCircle,
                    {
                      backgroundColor: statusColor.bg,
                      borderColor: statusColor.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.hourText, { color: statusColor.text }]}>
                    {index + 1} hr
                  </Text>
                </Pressable>
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
        <SectionHeader 
          title="Quick Access" 
          actionText="Edit"
          onActionPress={handleOpenCustomizer}
        />
        <View style={styles.quickGrid}>
          <View style={styles.quickWrap}>
            {quickAccessShortcuts.map((key) => {
              const meta = SHORTCUT_METADATA[key];
              if (!meta) return null;
              return (
                <View key={key} style={styles.quickActionWrapper}>
                  <QuickActionButton
                    title={meta.title}
                    icon={renderShortcutIcon(meta.iconName)}
                    iconBg={meta.bg}
                    onPress={() => router.push(meta.route as any)}
                  />
                </View>
              );
            })}
            
            {/* Trailing Add More Button */}
            <View style={styles.quickActionWrapper}>
              <QuickActionButton
                title="Add More"
                icon={renderShortcutIcon('Plus', 26, Colors.BluePrimary)}
                iconBg="#F1F5F9"
                onPress={handleOpenCustomizer}
              />
            </View>
          </View>
        </View>

        {/* ── 6. Today's Classes ── */}
        <SectionHeader
          title="Today's Classes"
          actionText="View Timetable"
          onActionPress={() => router.push('/student/schedule' as any)}
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
          onActionPress={() => router.push('/student/alerts' as any)}
        />

        <CampusCard style={styles.announcementsContainerCard} elevation="sm">
          {announcements.slice(0, 3).map((item, index) => {
            const iconInfo = getCategoryIconInfo(item.category);
            const isLast = index === announcements.slice(0, 3).length - 1;
            return (
              <View key={item.id}>
                <Pressable
                  onPress={() => router.push('/student/alerts' as any)}
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

      {/* ── TODAY'S ATTENDANCE HOUR DETAILS MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedAttendance !== null}
        onRequestClose={() => setSelectedAttendance(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {selectedAttendance && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View
                  style={[
                    styles.modalIconBox,
                    {
                      backgroundColor:
                        selectedAttendance.status === 'PRESENT'
                          ? '#E6FBF3'
                          : selectedAttendance.status === 'ABSENT'
                          ? '#FEF2F2'
                          : selectedAttendance.status === 'LATE'
                          ? '#FFFBEB'
                          : '#F1F5F9',
                    },
                  ]}
                >
                  {selectedAttendance.status === 'PRESENT' ? (
                    <CheckCircle size={30} color="#10B981" />
                  ) : selectedAttendance.status === 'ABSENT' ? (
                    <XCircle size={30} color="#EF4444" />
                  ) : selectedAttendance.status === 'LATE' ? (
                    <Clock size={30} color="#F59E0B" />
                  ) : (
                    <AlertCircle size={30} color="#64748B" />
                  )}
                </View>

                <Text style={styles.portalTitle}>Hour {selectedAttendance.hourIndex} Attendance</Text>
                <Text style={styles.portalSubtitle}>{selectedAttendance.subject}</Text>

                {/* Clean full-width details list */}
                <View style={styles.gridContainer}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>SUBJECT</Text>
                    <Text style={styles.gridVal}>{selectedAttendance.subject}</Text>
                  </View>
                  
                  <View style={styles.gridDividerLine} />
                  
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>MARKED BY</Text>
                    <Text style={styles.gridVal}>{getProfessorForSubject(selectedAttendance.subject)}</Text>
                  </View>
                </View>

                {/* Status Bar */}
                <View style={styles.modalStatusRow}>
                  <Text style={styles.modalStatusLabel}>ATTENDANCE STATUS</Text>
                  <StatusChip
                    text={selectedAttendance.status}
                    level={
                      selectedAttendance.status === 'PRESENT'
                        ? 'SAFE'
                        : selectedAttendance.status === 'ABSENT'
                        ? 'LOW'
                        : 'WARNING'
                    }
                  />
                </View>

                {/* Close Button */}
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%' }]}
                  onPress={() => setSelectedAttendance(null)}
                >
                  <Text style={styles.portalBtnTextPrimary}>Dismiss Details</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── SHORTCUT CUSTOMIZER MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCustomizingShortcuts}
        onRequestClose={() => setIsCustomizingShortcuts(false)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.customizerContent}>
            <View style={styles.customizerHeader}>
              <Text style={styles.customizerTitle}>Customize Shortcuts</Text>
              <Text style={styles.customizerSubtitle}>Choose modules to display on your Home Screen</Text>
            </View>

            <View style={styles.quickActionsControlRow}>
              <Pressable style={styles.controlLinkBtn} onPress={handleSelectAll}>
                <Text style={styles.controlLinkText}>Select All</Text>
              </Pressable>
              <View style={styles.controlDivider} />
              <Pressable style={styles.controlLinkBtn} onPress={handleResetDefault}>
                <Text style={styles.controlLinkText}>Reset to Default</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.checklistScroll} showsVerticalScrollIndicator={false}>
              {Object.keys(SHORTCUT_METADATA).map((key) => {
                const meta = SHORTCUT_METADATA[key];
                const checked = tempShortcuts.includes(key);
                return (
                  <Pressable
                    key={key}
                    style={styles.checkItemRow}
                    onPress={() => toggleTempShortcut(key)}
                  >
                    <View style={styles.checkItemLeft}>
                      <View style={[styles.miniIconBg, { backgroundColor: meta.bg }]}>
                        {renderShortcutIcon(meta.iconName, 18, Colors.BluePrimary)}
                      </View>
                      <Text style={styles.checkItemLabel}>{meta.title}</Text>
                    </View>
                    <View
                      style={[
                        styles.checkboxCircle,
                        checked ? styles.checkboxCircleChecked : styles.checkboxCircleUnchecked,
                      ]}
                    >
                      {checked && <Check size={12} color="#FFFFFF" />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.customizerFooter}>
              <Pressable
                style={[styles.customizerBtn, styles.customizerBtnCancel]}
                onPress={() => setIsCustomizingShortcuts(false)}
              >
                <Text style={styles.customizerBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.customizerBtn, styles.customizerBtnSave]}
                onPress={handleSaveShortcuts}
              >
                <Text style={styles.customizerBtnSaveText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  headerContainer: {
    backgroundColor: Colors.AppBackground,
    paddingBottom: 6,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  quickGrid: { marginBottom: 12 },
  quickWrap: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  quickActionWrapper: { width: '25%', alignItems: 'center', marginBottom: 16 },
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

  // Hour Detail Modal Styles
  portalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  portalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  portalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  portalSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.BluePrimary, marginBottom: 16, textAlign: 'center' },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  
  gridContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  gridDividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
    width: '100%',
  },
  gridItem: {
    alignItems: 'flex-start',
    width: '100%',
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 18,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 18,
  },
  modalStatusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Customizer Modal Styles
  customizerContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  customizerHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  customizerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  customizerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsControlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  controlLinkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  controlLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
  controlDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.AppOutline,
  },
  checklistScroll: {
    maxHeight: 320,
    marginBottom: 16,
  },
  checkItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  checkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleChecked: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  checkboxCircleUnchecked: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  customizerFooter: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  customizerBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizerBtnCancel: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  customizerBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  customizerBtnSave: {
    backgroundColor: Colors.BluePrimary,
  },
  customizerBtnSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
