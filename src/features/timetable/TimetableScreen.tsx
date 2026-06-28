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

const WEEK_DAYS = [
  { label: 'Mon', num: '12', key: 'Mon' },
  { label: 'Tue', num: '13', key: 'Tue' },
  { label: 'Wed', num: '14', key: 'Wed' },
  { label: 'Thu', num: '15', key: 'Thu' },
  { label: 'Fri', num: '16', key: 'Fri' },
  { label: 'Sat', num: '17', key: 'Sat' },
];

const STATUS_STRIP_COLOR: Record<ClassStatus, string> = {
  COMPLETED: Colors.ColorPresent,
  ONGOING: Colors.BluePrimary,
  UPCOMING: Colors.AppOutline,
};

export const TimetableScreen: React.FC = () => {
  const router = useRouter();
  const { timetableClasses, selectedDay, setSelectedDay } = useCampusStore();
  const periodCount = timetableClasses.filter((c) => !c.isLunchBreak).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Timetable" />

      {/* ── 1. Day Selector (Pinned & Scrollable) ── */}
      <View style={styles.pinnedDaySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {WEEK_DAYS.map(({ label, num, key }) => {
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

        {/* ── 2. Classes Header ── */}
        <View style={styles.classesHeader}>
          <Text style={styles.classesTitle}>Today's Classes</Text>
          <StatusChip text={`${periodCount} Periods`} level="ACADEMIC" />
        </View>

        {/* ── 3. Class Timeline ── */}
        {timetableClasses.map((cls, idx) => {
          if (cls.isLunchBreak) {
            return (
              <View key={idx} style={styles.lunchRow}>
                <Utensils size={16} color={Colors.BluePrimary} />
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
                      <User size={13} color={Colors.AppOnSurfaceVariant} />
                      <Text style={styles.classMetaText}> {cls.professor}</Text>
                      <MapPin size={13} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 12 }} />
                      <Text style={styles.classMetaText}> {cls.room}</Text>
                    </View>
                  </View>
                  {/* Status icon */}
                  <View style={styles.statusIcon}>
                    {status === 'COMPLETED' && <CheckCircle size={24} color={Colors.ColorPresent} />}
                    {status === 'ONGOING' && <StatusChip text="NOW" level="NOW" />}
                    {status === 'UPCOMING' && <Clock size={22} color={Colors.AppOnSurfaceVariant} />}
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
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 70,
    borderRadius: 16,
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
  dayLabel: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  dayNum: { fontSize: 16, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
  classesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  classesTitle: { fontSize: 18, fontWeight: '700', color: Colors.AppOnBackground },
  classCard: { marginBottom: 10, overflow: 'hidden' },
  classInner: { flexDirection: 'row' },
  statusStrip: { width: 6 },
  classContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  timeBlock: { width: 52 },
  timeText: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textAlign: 'center' },
  vertLine: { width: 1, height: '100%', backgroundColor: Colors.AppOutline },
  classInfo: { flex: 1 },
  subjectText: { fontSize: 16, fontWeight: '700', color: Colors.AppOnBackground },
  classMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  classMetaText: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  statusIcon: { alignItems: 'center', justifyContent: 'center' },
  lunchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.BluePrimaryContainer + '4D', borderRadius: 12, borderWidth: 1, borderColor: Colors.BluePrimary + '1A', padding: 12, marginBottom: 10, gap: 8 },
  lunchText: { fontSize: 13, fontWeight: '700', color: Colors.BluePrimary },
  eventsRow: { flexDirection: 'row', gap: 12 },
  eventCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  eventIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  eventDetail: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 4 },
});
