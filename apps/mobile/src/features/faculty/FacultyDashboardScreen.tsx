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
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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
  Plus,
  Grid3X3,
  Users,
  FileText,
  X,
  Check,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { mockFacultyTimetable, mockFacultyStats, mockFacultyNotifications, mockFacultyCirculars } from '../../data/mockFacultyData';
import { getDayOrder, DAY_ORDER_MAP } from '../../utils/dayOrder';
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

// Parse "DD Mon YYYY" → Date for sorting
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
const parseCircularDate = (dateStr: string): number => {
  const parts = dateStr.trim().split(' ');
  if (parts.length !== 3) return 0;
  const [day, mon, year] = parts;
  const m = MONTH_MAP[mon];
  if (m === undefined) return 0;
  return new Date(Number(year), m, Number(day)).getTime();
};

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
  Attendance: { title: 'Attendance', iconName: 'CheckCircle', route: '/faculty/classes', bg: Colors.BluePrimaryContainer },
  Timetable: { title: 'Timetable', iconName: 'Calendar', route: '/faculty/schedule', bg: Colors.BluePrimaryContainer },
  'Enter Marks': { title: 'Enter Marks', iconName: 'ClipboardList', route: '/faculty/exam-marks', bg: Colors.BluePrimaryContainer },
  Circulars: { title: 'Circulars', iconName: 'Bell', route: '/faculty/alerts', bg: Colors.BluePrimaryContainer },
  'Academic Hub': { title: 'Academic Hub', iconName: 'BookOpen', route: '/faculty/academic-hub', bg: Colors.BluePrimaryContainer },
  Assessments: { title: 'Assessments', iconName: 'FileText', route: '/faculty/assessments', bg: Colors.BluePrimaryContainer },
  'Student Hub': { title: 'Student Hub', iconName: 'Users', route: '/faculty/student-hub?tab=STUDENTS', bg: Colors.BluePrimaryContainer },
  'Mentor Panel': { title: 'Mentor Panel', iconName: 'User', route: '/faculty/student-hub?tab=MENTOR', bg: Colors.BluePrimaryContainer },
  'Batch Timetable': { title: 'Batch Timetable', iconName: 'ClipboardList', route: '/faculty/batch-timetable', bg: Colors.BluePrimaryContainer },
  'Dept Timetable': { title: 'Dept Timetable', iconName: 'ClipboardList', route: '/faculty/dept-timetable', bg: Colors.BluePrimaryContainer },
};

const renderShortcutIcon = (name: string, size = 26, color = Colors.BluePrimary) => {
  switch (name) {
    case 'CheckCircle': return <CheckCircle size={size} color={color} />;
    case 'Calendar': return <Calendar size={size} color={color} />;
    case 'ClipboardList': return <ClipboardList size={size} color={color} />;
    case 'Bell': return <Bell size={size} color={color} />;
    case 'BookOpen': return <BookOpen size={size} color={color} />;
    case 'FileText': return <FileText size={size} color={color} />;
    case 'Users': return <Users size={size} color={color} />;
    case 'User': return <User size={size} color={color} />;
    case 'Plus': return <Plus size={size} color={color} />;
    default: return <Grid3X3 size={size} color={color} />;
  }
};

export const FacultyDashboardScreen: React.FC = () => {
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : (insets.top || 44);
  const faculty = useAuthStore((s) => s.faculty);
  const { announcements, facultyQuickAccessShortcuts, setFacultyQuickAccessShortcuts } = useCampusStore();
  const [isCustomizingShortcuts, setIsCustomizingShortcuts] = React.useState(false);
  const [tempShortcuts, setTempShortcuts] = React.useState<string[]>([]);

  const handleOpenCustomizer = () => {
    setTempShortcuts(facultyQuickAccessShortcuts);
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
    setTempShortcuts(['Attendance', 'Timetable', 'Enter Marks', 'Circulars', 'Academic Hub', 'Assessments']);
  };

  const handleSaveShortcuts = () => {
    setFacultyQuickAccessShortcuts(tempShortcuts);
    setIsCustomizingShortcuts(false);
  };

  if (!faculty) return null;

  const initial = faculty.name.split(' ').filter(w => /[A-Za-z]/.test(w[0])).map(w => w[0]).join('').slice(0, 2);

  const [unreadCount, setUnreadCount] = React.useState(0);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [currentMinute, setCurrentMinute] = React.useState(new Date().getMinutes());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMinute(new Date().getMinutes());
    }, 30000); // Sync every 30 seconds
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentDate(new Date());
      const count = mockFacultyNotifications.filter(n => !n.isRead && !n.isArchived).length;
      setUnreadCount(count);
    }, [])
  );

  const todayIdx = currentDate.getDay();
  const todayKey = DAYS[todayIdx];
  const isWeekendDay = todayKey === 'Sun' || todayKey === 'Sat';

  const todayDayOrder = getDayOrder(currentDate);
  const mappedDay = DAY_ORDER_MAP[todayDayOrder] || 'Mon';
  
  const todayClasses = React.useMemo(() => {
    // If it's a weekend, fall back to Wednesday (just like student dashboard) so there's active data visible
    const rawClasses = isWeekendDay ? (mockFacultyTimetable['Wed'] || []) : (mockFacultyTimetable[mappedDay] || []);
    return rawClasses.map((cls) => ({
      ...cls,
      status: getClassStatusRealtime(cls.time),
    }));
  }, [isWeekendDay, mappedDay, currentMinute]);

  const ongoingClass = React.useMemo(() => todayClasses.find((cls) => cls.status === 'ONGOING'), [todayClasses]);
  const upcomingClasses = React.useMemo(() => todayClasses.filter((cls) => cls.status === 'UPCOMING'), [todayClasses]);



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
            onPress={() => router.push('/faculty/profile' as any)}
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
            onPress={() => router.push('/faculty/notifications' as any)}
          >
            <View style={{ position: 'relative' }}>
              <Bell size={22} color={Colors.AppOnBackground} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
        <SectionHeader 
          title="Quick Access" 
          actionText="Edit"
          onActionPress={handleOpenCustomizer}
        />
        <View style={styles.quickGrid}>
          <View style={styles.quickWrap}>
            {facultyQuickAccessShortcuts.map((key) => {
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

        {/* ── 5. Today's Classes ── */}
        <SectionHeader
          title={isWeekendDay ? "Today's Classes (Weekend)" : `Today's Classes (${todayDayOrder})`}
          actionText="View Schedule"
          onActionPress={() => router.push('/faculty/schedule' as any)}
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
            <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}>
                <Calendar size={20} color="#64748B" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B', textAlign: 'center' }}>
                No Classes Scheduled Today
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                Your schedule is clear for this Day Order.
              </Text>
            </View>
          </CampusCard>
        )}

        {/* ── 6. Circulars ── */}
        <SectionHeader
          title="Circulars"
          actionText="View All"
          onActionPress={() => router.push('/faculty/alerts' as any)}
        />

        <CampusCard style={styles.announcementsContainerCard} elevation="sm">
          {[...mockFacultyCirculars]
            .sort((a, b) => parseCircularDate(b.publishedDate) - parseCircularDate(a.publishedDate))
            .slice(0, 3)
            .map((item, index) => {
            const iconInfo = getCategoryIconInfo(item.category);
            const isLast = index === Math.min(3, mockFacultyCirculars.length) - 1;
            const isUnread = !item.isRead;
            return (
              <View key={item.id}>
                <Pressable
                  onPress={() => router.push('/faculty/alerts' as any)}
                  style={({ pressed }) => [
                    styles.announcementFeedItem,
                    pressed && { backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <View style={[styles.announcementIconCircle, { backgroundColor: iconInfo.bg }]}>
                    {iconInfo.icon}
                  </View>
                  <View style={styles.announcementFeedContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {isUnread && (
                        <View style={styles.circularUnreadDot} />
                      )}
                      <Text
                        numberOfLines={1}
                        style={{ flex: 1, fontSize: 13, fontWeight: isUnread ? '800' : '600', color: Colors.AppOnBackground }}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text style={styles.announcementFeedDate}>
                      {item.category} • {item.publishedDate}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {item.priority === 'Critical' || item.priority === 'Urgent' ? (
                      <View style={[styles.circularPriorityBadge, { backgroundColor: item.priority === 'Critical' ? '#FEE2E2' : '#FEF3C7' }]}>
                        <Text style={[styles.circularPriorityText, { color: item.priority === 'Critical' ? '#DC2626' : '#D97706' }]}>
                          {item.priority}
                        </Text>
                      </View>
                    ) : null}
                    <ChevronRight size={14} color={Colors.AppOnSurfaceVariant} />
                  </View>
                </Pressable>
                {!isLast && <View style={styles.feedDivider} />}
              </View>
            );
          })}
        </CampusCard>

        <View style={{ height: 24 }} />
      </ScrollView>

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
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: 12,
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
  quickGrid: { gap: 8, marginBottom: 16 },
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
  circularUnreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.BluePrimary,
    flexShrink: 0,
  },
  circularPriorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  circularPriorityText: {
    fontSize: 9,
    fontWeight: '800',
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
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.RedError,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  
  // Customizer styles
  portalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
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
