import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { CampusCard, SectionHeader, StatusChip, PageHeader } from '../../components';
import { Colors } from '../../theme';
import { User, MapPin, CheckCircle, Clock, Utensils, Lightbulb, ClipboardCheck } from 'lucide-react-native';
import { ClassStatus } from '../../types';

const STATUS_STRIP_COLOR: Record<ClassStatus, string> = {
  COMPLETED: Colors.ColorPresent,
  ONGOING: Colors.BluePrimary,
  UPCOMING: Colors.AppOutline,
};

const getRealWeekDays = () => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Calculate difference to Monday of this week
  const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + mondayDiff);

  const days = [];
  
  // Week 1 (This Week)
  for (let i = 0; i < 6; i++) {
    const dayDate = new Date(currentMonday);
    dayDate.setDate(currentMonday.getDate() + i);
    days.push({
      label: labels[i],
      num: String(dayDate.getDate()),
      month: dayDate.toLocaleString('default', { month: 'short' }),
      year: dayDate.getFullYear(),
      key: `W1-${labels[i]}`,
    });
  }

  // Week 2 (Next Week)
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);
  for (let i = 0; i < 6; i++) {
    const dayDate = new Date(nextMonday);
    dayDate.setDate(nextMonday.getDate() + i);
    days.push({
      label: labels[i],
      num: String(dayDate.getDate()),
      month: dayDate.toLocaleString('default', { month: 'short' }),
      year: dayDate.getFullYear(),
      key: `W2-${labels[i]}`,
    });
  }

  return days;
};

const getDayOrderIndex = (label: string) => {
  switch (label) {
    case 'Mon': return 1;
    case 'Tue': return 2;
    case 'Wed': return 3;
    case 'Thu': return 4;
    case 'Fri': return 5;
    case 'Sat': return 6;
    default: return 1;
  }
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

export const TimetableScreen: React.FC = () => {
  const router = useRouter();
  const { timetableClasses, selectedDay, setSelectedDay } = useCampusStore();
  const periodCount = timetableClasses.filter((c) => !c.isLunchBreak).length;

  const weekDays = useMemo(() => getRealWeekDays(), []);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());

  // Auto-select today's weekday in Week 1 on mount (defaults to Mon if Sunday)
  useEffect(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const current = days[new Date().getDay()];
    const todayLabel = current === 'Sun' ? 'Mon' : current;
    setSelectedDateKey(`W1-${todayLabel}`);
  }, []);

  // Sync clock minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMinute(new Date().getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync local selectedDateKey back to Zustand store day
  useEffect(() => {
    if (selectedDateKey) {
      const activeDayKey = selectedDateKey.split('-')[1] || 'Mon';
      setSelectedDay(activeDayKey);
    }
  }, [selectedDateKey]);

  const processedClasses = useMemo(() => {
    return timetableClasses.map((cls) => {
      if (cls.isLunchBreak) return cls;
      return {
        ...cls,
        status: getClassStatusRealtime(cls.time),
      };
    });
  }, [timetableClasses, currentMinute]);

  const activeDateItem = useMemo(() => {
    return weekDays.find((d) => d.key === selectedDateKey) || weekDays[0];
  }, [selectedDateKey, weekDays]);

  const activeDayOrderIndex = useMemo(() => {
    return getDayOrderIndex(activeDateItem?.label || 'Mon');
  }, [activeDateItem]);

  const activeMonthYear = activeDateItem 
    ? `${activeDateItem.month} ${activeDateItem.year}` 
    : 'Schedule';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Timetable" />

      {/* ── 1. Day & Month Selector ── */}
      <View style={styles.pinnedDaySelectorContainer}>
        <View style={styles.monthHeaderRow}>
          <Text style={styles.monthHeaderTitle}>{activeMonthYear}</Text>
          <Text style={styles.monthHeaderSubtitle}>
            Day Order: D{activeDayOrderIndex}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {weekDays.map(({ label, num, key }) => {
            const active = selectedDateKey === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDateKey(key)}
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

        {/* ── 2. Classes Header ── */}
        <View style={styles.classesHeader}>
          <Text style={styles.classesTitle}>Today's Classes</Text>
          <StatusChip text={`${periodCount} Periods`} level="ACADEMIC" />
        </View>

        {/* ── 3. Class Timeline ── */}
        {processedClasses.map((cls, idx) => {
          if (cls.isLunchBreak) {
            return (
              <View key={idx} style={styles.lunchRow}>
                <Utensils size={15} color={Colors.BluePrimary} />
                <Text style={styles.lunchText}>{cls.time} • Time Break</Text>
              </View>
            );
          }

          const status = cls.status ?? 'UPCOMING';
          const isOngoing = status === 'ONGOING';

          return (
            <CampusCard
              key={idx}
              borderColor={isOngoing ? Colors.BluePrimary : Colors.AppOutline}
              elevation={isOngoing ? 'md' : 'sm'}
              padding={0}
              style={styles.classCard}
            >
              <View style={styles.classInner}>
                {/* Status strip */}
                <View style={[styles.statusStrip, { backgroundColor: STATUS_STRIP_COLOR[status] }]} />

                <View style={styles.classContent}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>{cls.time}</Text>
                  </View>
                  <View style={styles.vertLine} />
                  <View style={styles.classInfo}>
                    <Text style={styles.subjectText}>{cls.subject}</Text>
                    <View style={styles.classMeta}>
                      <User size={12} color={Colors.AppOnSurfaceVariant} />
                      <Text style={styles.classMetaText}> {cls.professor}</Text>
                      <MapPin size={12} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 12 }} />
                      <Text style={styles.classMetaText}> {cls.room}</Text>
                    </View>
                  </View>
                  {/* Status icon */}
                  <View style={styles.statusIcon}>
                    {status === 'COMPLETED' && <CheckCircle size={22} color={Colors.ColorPresent} />}
                    {status === 'ONGOING' && <StatusChip text="NOW" level="NOW" />}
                    {status === 'UPCOMING' && <Clock size={20} color={Colors.AppOnSurfaceVariant} />}
                  </View>
                </View>
              </View>
            </CampusCard>
          );
        })}



        <View style={{ height: 24 }} />
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
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  monthHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  monthHeaderSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.BluePrimary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 60,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  dayItemActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  dayItemInactive: {
    backgroundColor: Colors.AppSurface,
    borderColor: Colors.AppOutline,
  },
  dayLabel: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  dayNum: { fontSize: 14, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 2 },

  classesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  classesTitle: { fontSize: 18, fontWeight: '700', color: Colors.AppOnBackground },
  classCard: { marginBottom: 10, overflow: 'hidden' },
  classInner: { flexDirection: 'row' },
  statusStrip: { width: 5 },
  classContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  timeBlock: { width: 50 },
  timeText: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textAlign: 'center' },
  vertLine: { width: 1, height: '100%', backgroundColor: Colors.AppOutline },
  classInfo: { flex: 1 },
  subjectText: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  classMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  classMetaText: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  statusIcon: { alignItems: 'center', justifyContent: 'center' },
  lunchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.BluePrimaryContainer + '4D', borderRadius: 12, borderWidth: 1, borderColor: Colors.BluePrimary + '1A', padding: 10, marginBottom: 10, gap: 8 },
  lunchText: { fontSize: 13, fontWeight: '700', color: Colors.BluePrimary },
  eventsRow: { flexDirection: 'row', gap: 12 },
  eventCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  eventIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  eventDetail: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 4 },
});
