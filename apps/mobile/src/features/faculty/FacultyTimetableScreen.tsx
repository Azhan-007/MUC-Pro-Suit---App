import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CampusCard, StatusChip, PageHeader } from '../../components';
import { Colors } from '../../theme';
import { User, MapPin, CheckCircle, Clock } from 'lucide-react-native';
import { ClassStatus } from '../../types';
import { AcademicService, FacultyTimetableSlot } from '../../services/academicService';
import { useFocusEffect } from 'expo-router';

// ── Real week days computed from today ──
const getRealWeekDays = () => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date();
  const currentDay = today.getDay(); // 0=Sun ... 6=Sat
  const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + mondayDiff);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const dayDate = new Date(currentMonday);
    dayDate.setDate(currentMonday.getDate() + i);
    days.push({
      label: labels[i],
      num: String(dayDate.getDate()),
      key: labels[i],
    });
  }
  return days;
};

const STATUS_STRIP_COLOR: Record<ClassStatus, string> = {
  COMPLETED: Colors.ColorPresent,
  ONGOING: Colors.BluePrimary,
  UPCOMING: Colors.AppOutline,
};

// Map API day string to short key
const dayKeyMap: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri',
};

const getClassStatusRealtime = (timeStr: string): ClassStatus => {
  const normalized = timeStr.replace(/\s+/g, '').replace(/[\n\-–]/g, '-');
  const parts = normalized.split('-');
  if (parts.length < 2) return 'UPCOMING';

  const parseToMinutes = (str: string) => {
    let [h, m] = str.split(':').map(Number);
    if (h >= 1 && h <= 5) h += 12; // PM heuristic for afternoon
    return h * 60 + m;
  };
  const startMin = parseToMinutes(parts[0]);
  const endMin = parseToMinutes(parts[1]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  if (nowMin >= endMin) return 'COMPLETED';
  if (nowMin >= startMin && nowMin < endMin) return 'ONGOING';
  return 'UPCOMING';
};

export const FacultyTimetableScreen: React.FC = () => {
  const router = useRouter();

  const today = new Date().getDay();
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const todayKey = today === 0 || today === 6 ? 'Mon' : labels[today - 1];
  const [selectedDay, setSelectedDay] = React.useState(todayKey);

  const weekDays = React.useMemo(() => getRealWeekDays(), []);

  // Real data state
  const [allSlots, setAllSlots] = React.useState<FacultyTimetableSlot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await AcademicService.getFacultyTimetable();
          if (active) setAllSlots(data);
        } catch (e: any) {
          if (active) setError('Failed to load timetable. Check connection.');
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => { active = false; };
    }, [])
  );

  // Filter by selected day and enrich with real-time status
  const sessions = React.useMemo(() => {
    return allSlots
      .filter(slot => {
        const slotDay = dayKeyMap[slot.day] || slot.day;
        return slotDay === selectedDay;
      })
      .map(slot => ({
        ...slot,
        status: getClassStatusRealtime(slot.time) as ClassStatus,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [allSlots, selectedDay]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="My Schedule" />

      {/* ── Day Selector ── */}
      <View style={styles.pinnedDaySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {weekDays.map(({ label, num, key }) => {
            const active = selectedDay === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDay(key)}
                style={[
                  styles.dayItem,
                  active ? styles.dayItemActive : styles.dayItemInactive,
                ]}
              >
                <Text style={[styles.dayLabel, active && { color: '#FFF' }]}>{label}</Text>
                <Text style={[styles.dayNum, active && { color: '#FFF' }]}>{num}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.classesHeader}>
          <View>
            <Text style={styles.classesTitle}>Scheduled Classes</Text>
            <Text style={styles.classesSubText}>{sessions.length} periods for {selectedDay}</Text>
          </View>
          <StatusChip text={`${sessions.length} Classes`} level="ACADEMIC" />
        </View>

        {/* ── Content ── */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.BluePrimary} />
            <Text style={styles.loadingText}>Loading your schedule…</Text>
          </View>
        ) : error ? (
          <CampusCard borderColor={Colors.AppOutline} style={styles.classCard} elevation="sm">
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          </CampusCard>
        ) : sessions.length === 0 ? (
          <CampusCard borderColor={Colors.AppOutline} style={styles.classCard} elevation="sm">
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={styles.emptyText}>No classes scheduled for {selectedDay}</Text>
              <Text style={styles.emptySubText}>
                {allSlots.length === 0
                  ? 'No timetable has been assigned yet. Contact the admin.'
                  : 'You have a free day!'}
              </Text>
            </View>
          </CampusCard>
        ) : (
          sessions.map((cls) => {
            const status = cls.status ?? 'UPCOMING';
            const isOngoing = status === 'ONGOING';

            return (
              <CampusCard
                key={cls.id}
                borderColor={isOngoing ? Colors.BluePrimary : Colors.AppOutline}
                elevation={isOngoing ? 'md' : 'sm'}
                padding={0}
                style={styles.classCard}
              >
                <View style={styles.classInner}>
                  <View style={[styles.statusStrip, { backgroundColor: STATUS_STRIP_COLOR[status] }]} />

                  <View style={styles.classContent}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeText}>{cls.time.replace(' - ', '\n')}</Text>
                    </View>
                    <View style={styles.vertLine} />
                    <View style={styles.classInfo}>
                      <Text style={styles.subjectText}>{cls.subject}</Text>
                      <View style={styles.classMeta}>
                        <User size={13} color={Colors.AppOnSurfaceVariant} />
                        <Text style={styles.classMetaText}> {cls.className}</Text>
                        <MapPin size={13} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 12 }} />
                        <Text style={styles.classMetaText}> {cls.room}</Text>
                      </View>
                      {cls.periodCode ? (
                        <Text style={styles.periodBadge}>{cls.periodCode}</Text>
                      ) : null}
                    </View>

                    <View style={styles.actionsBlock}>
                      {status === 'COMPLETED' && <CheckCircle size={22} color={Colors.ColorPresent} />}
                      {status === 'ONGOING' && <StatusChip text="NOW" level="NOW" />}
                      {status === 'UPCOMING' && <Clock size={20} color={Colors.AppOnSurfaceVariant} />}
                    </View>
                  </View>
                </View>
              </CampusCard>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 6 },
  pinnedDaySelectorContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.AppBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  daySelectorContent: { paddingHorizontal: 16, gap: 12 },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 70,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dayItemActive: { backgroundColor: Colors.BluePrimary, borderColor: Colors.BluePrimary },
  dayItemInactive: { backgroundColor: Colors.AppSurface, borderColor: Colors.AppOutline },
  dayLabel: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  dayNum: { fontSize: 16, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
  classesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  classesTitle: { fontSize: 18, fontWeight: '700', color: Colors.AppOnBackground },
  classesSubText: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  classCard: { marginBottom: 10, overflow: 'hidden' },
  classInner: { flexDirection: 'row' },
  statusStrip: { width: 6 },
  classContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  timeBlock: { width: 56 },
  timeText: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textAlign: 'center', lineHeight: 16 },
  vertLine: { width: 1, height: '100%', backgroundColor: Colors.AppOutline },
  classInfo: { flex: 1 },
  subjectText: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground, lineHeight: 18 },
  classMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  classMetaText: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  periodBadge: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.BluePrimary,
    backgroundColor: Colors.BluePrimaryContainer + '33',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionsBlock: { alignItems: 'center', justifyContent: 'center' },
  centerBox: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.AppOnSurfaceVariant },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.AppOnSurfaceVariant, textAlign: 'center' },
  emptySubText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, marginTop: 4, textAlign: 'center', paddingHorizontal: 16 },
});
