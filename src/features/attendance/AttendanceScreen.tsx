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
import { useCampusStore } from '../../store/campusStore';
import {
  CampusCard,
  SectionHeader,
  StatusChip,
  CircularProgress,
  PageHeader,
} from '../../components';
import { Colors } from '../../theme';
import {
  Check,
  X,
  Clock,
  AlertCircle,
  CircleOff,
  CheckCircle,
  XCircle,
  TrendingUp,
  Flame,
} from 'lucide-react-native';

// ── Status Mini Icons ──
const PresentIcon = () => (
  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.ColorPresent, alignItems: 'center', justifyContent: 'center' }}>
    <Check size={14} color="#FFFFFF" strokeWidth={3} />
  </View>
);

const AbsentIcon = () => (
  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.ColorAbsent, alignItems: 'center', justifyContent: 'center' }}>
    <X size={14} color="#FFFFFF" strokeWidth={3} />
  </View>
);

const LateIcon = () => (
  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.ColorPending, alignItems: 'center', justifyContent: 'center' }}>
    <Clock size={12} color="#FFFFFF" strokeWidth={3} />
  </View>
);

const LetOffIcon = () => (
  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#64748B', alignItems: 'center', justifyContent: 'center' }}>
    <AlertCircle size={14} color="#FFFFFF" strokeWidth={3} />
  </View>
);

const UnmarkedIcon = () => (
  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.ColorHoliday, alignItems: 'center', justifyContent: 'center' }}>
    <CircleOff size={12} color="#FFFFFF" strokeWidth={3} />
  </View>
);

// ── Hourly Matrix Mock Data ──
const hourlyMatrixData = [
  { day: '01-Mon', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '02-Tue', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '03-Wed', hours: ['PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT'] },
  { day: '04-Thu', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '05-Fri', hours: ['PRESENT', 'LATE', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '08-Mon', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '09-Tue', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '10-Wed', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '11-Thu', hours: ['ABSENT', 'ABSENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '12-Fri', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '15-Mon', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '16-Tue', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '17-Wed', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '18-Thu', hours: ['ABSENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '19-Fri', hours: ['ABSENT', 'ABSENT', 'ABSENT', 'ABSENT', 'ABSENT'] },
  { day: '22-Mon', hours: ['PRESENT', 'PRESENT', 'ABSENT', 'ABSENT', 'ABSENT'] },
  { day: '23-Tue', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '24-Wed', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '25-Thu', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '26-Fri', hours: ['PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'PRESENT'] },
  { day: '29-Mon', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'] },
  { day: '30-Tue', hours: ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PENDING'] },
];

export const AttendanceScreen: React.FC = () => {
  const router = useRouter();
  const { attendanceOverview, subjectAttendanceList } = useCampusStore();
  const [activeTab, setActiveTab] = React.useState<'COURSE' | 'HOURLY' | 'TERMLY'>('HOURLY');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Attendance" />

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {(['COURSE', 'HOURLY', 'TERMLY'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'COURSE' ? 'Course' : tab === 'HOURLY' ? 'Hourly' : 'Termly';
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. COURSE TAB ── */}
        {activeTab === 'COURSE' && (
          <View style={{ paddingTop: 16 }}>
            {/* Insights Grid */}
            <View style={styles.insightGrid}>
              <View style={styles.insightRow}>
                <InsightCard
                  value={String(attendanceOverview.totalAttendedClasses)}
                  label="Total Attended"
                  icon={<CheckCircle size={18} color={Colors.BluePrimary} />}
                  iconBg={Colors.BluePrimaryContainer + '66'}
                />
                <InsightCard
                  value={String(attendanceOverview.missedClasses)}
                  label="Missed Classes"
                  icon={<XCircle size={18} color={Colors.RedError} />}
                  iconBg={Colors.RedErrorContainer}
                />
              </View>
              <View style={[styles.insightRow, { marginTop: 8 }]}>
                <InsightCard
                  value={String(attendanceOverview.classesTo75Percent)}
                  label="Classes to 75%"
                  icon={<TrendingUp size={18} color={Colors.TealTertiary} />}
                  iconBg={Colors.TealTertiaryContainer}
                />
                <InsightCard
                  value={String(attendanceOverview.currentStreak)}
                  label="Current Streak"
                  icon={<Flame size={18} color={Colors.ColorPending} />}
                  iconBg={Colors.ColorPending + '1F'}
                />
              </View>
            </View>

            {/* Course-wise Analytics */}
            {subjectAttendanceList.map((subject, idx) => {
              const color =
                subject.statusLevel === 'SAFE'
                  ? Colors.ColorPresent
                  : subject.statusLevel === 'WARNING'
                  ? Colors.ColorPending
                  : Colors.ColorAbsent;

              const [attendedStr, rest] = subject.fraction.split('/');
              const totalStr = rest ? rest.split(' ')[0] : '0';

              return (
                <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                  <View style={styles.subjectHeader}>
                    <View>
                      <Text style={styles.subjectName}>{subject.subjectName}</Text>
                      {subject.facultyName ? (
                        <Text style={styles.facultyText}>{subject.facultyName}</Text>
                      ) : null}
                    </View>
                    <StatusChip text={subject.statusLevel} level={subject.statusLevel} />
                  </View>
                  
                  <View style={styles.subjectStatsRow}>
                    <CircularProgress
                      percentage={subject.percentage}
                      size={64}
                      strokeWidth={5.5}
                      progressColor={color}
                      label=""
                    />
                    
                    <View style={styles.subjectDetailsBox}>
                      <View style={styles.subjectDetailItem}>
                        <Text style={styles.subjectDetailLabel}>Attended</Text>
                        <Text style={styles.subjectDetailValue}>{attendedStr} Hrs</Text>
                      </View>
                      <View style={styles.subjectDetailDivider} />
                      <View style={styles.subjectDetailItem}>
                        <Text style={styles.subjectDetailLabel}>Total Hours</Text>
                        <Text style={styles.subjectDetailValue}>{totalStr} Hrs</Text>
                      </View>
                    </View>
                  </View>
                </CampusCard>
              );
            })}
          </View>
        )}

        {/* ── 2. HOURLY TAB ── */}
        {activeTab === 'HOURLY' && (
          <>
            {/* June pill button */}
            <View style={styles.monthSelectorRow}>
              <Pressable style={styles.monthPill}>
                <Text style={styles.monthPillText}>June</Text>
              </Pressable>
            </View>

            {/* Hourly Matrix Table */}
            <CampusCard style={styles.matrixCard} elevation="sm">
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { width: 75, textAlign: 'left' }]}>Day</Text>
                {['H1', 'H2', 'H3', 'H4', 'H5'].map((h) => (
                  <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
                ))}
              </View>

              <ScrollView style={{ maxHeight: 336 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                {hourlyMatrixData.map((row, rIdx) => (
                  <View
                    key={row.day}
                    style={[
                      styles.tableBodyRow,
                      rIdx === hourlyMatrixData.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <Text style={styles.tableRowLabel}>{row.day}</Text>
                    {row.hours.map((status, hIdx) => (
                      <View key={hIdx} style={styles.statusCell}>
                        {status === 'PRESENT' ? (
                          <PresentIcon />
                        ) : status === 'ABSENT' ? (
                          <AbsentIcon />
                        ) : status === 'LATE' ? (
                          <LateIcon />
                        ) : status === 'LETOFF' ? (
                          <LetOffIcon />
                        ) : (
                          <UnmarkedIcon />
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </CampusCard>

            {/* Legend Card */}
            <CampusCard style={styles.legendCard} elevation="sm">
              <View style={styles.legendGrid}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendChip, { borderColor: Colors.ColorPresent + '40' }]}>
                    <View style={[styles.miniDot, { backgroundColor: Colors.ColorPresent }]}>
                      <Check size={8} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={[styles.legendChipText, { color: Colors.ColorPresent }]}>Present</Text>
                  </View>
                  
                  <View style={[styles.legendChip, { borderColor: Colors.ColorAbsent + '40' }]}>
                    <View style={[styles.miniDot, { backgroundColor: Colors.ColorAbsent }]}>
                      <X size={8} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={[styles.legendChipText, { color: Colors.ColorAbsent }]}>Absent</Text>
                  </View>

                  <View style={[styles.legendChip, { borderColor: Colors.ColorPending + '40' }]}>
                    <View style={[styles.miniDot, { backgroundColor: Colors.ColorPending }]}>
                      <Clock size={8} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={[styles.legendChipText, { color: Colors.ColorPending }]}>Late</Text>
                  </View>
                </View>

                <View style={[styles.legendRow, { marginTop: 10, justifyContent: 'center' }]}>
                  <View style={[styles.legendChip, { borderColor: '#64748B40' }]}>
                    <View style={[styles.miniDot, { backgroundColor: '#64748B' }]}>
                      <AlertCircle size={8} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={[styles.legendChipText, { color: '#64748B' }]}>Let-off</Text>
                  </View>

                  <View style={[styles.legendChip, { borderColor: Colors.ColorHoliday + '40' }]}>
                    <View style={[styles.miniDot, { backgroundColor: Colors.ColorHoliday }]}>
                      <CircleOff size={8} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={[styles.legendChipText, { color: Colors.ColorHoliday }]}>Unmarked</Text>
                  </View>
                </View>
              </View>
            </CampusCard>
          </>
        )}

        {/* ── 3. TERMLY TAB ── */}
        {activeTab === 'TERMLY' && (
          <View style={{ paddingTop: 16 }}>
            {[
              { term: 'Semester 1 (Jul - Dec 2025)', pct: 91, classes: '120/132 Classes', status: 'SAFE' },
              { term: 'Semester 2 (Jan - Jun 2026)', pct: 84, classes: '112/133 Classes', status: 'SAFE' },
            ].map((t, idx) => (
              <CampusCard key={idx} style={styles.card} elevation="sm">
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{t.term}</Text>
                  <StatusChip text={t.status} level={t.status === 'SAFE' ? 'SAFE' : 'LOW'} />
                </View>
                <View style={styles.subjectStatsRow}>
                  <CircularProgress
                    percentage={t.pct}
                    size={64}
                    strokeWidth={5.5}
                    progressColor={Colors.ColorPresent}
                    label=""
                  />
                  <View style={styles.subjectDetailsBox}>
                    <View style={styles.subjectDetailItem}>
                      <Text style={styles.subjectDetailLabel}>Attended</Text>
                      <Text style={styles.subjectDetailValue}>{t.classes.split('/')[0]} Hrs</Text>
                    </View>
                    <View style={styles.subjectDetailDivider} />
                    <View style={styles.subjectDetailItem}>
                      <Text style={styles.subjectDetailLabel}>Total Hours</Text>
                      <Text style={styles.subjectDetailValue}>{t.classes.split('/')[1].split(' ')[0]} Hrs</Text>
                    </View>
                  </View>
                </View>
              </CampusCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Local sub-component ──
const InsightCard: React.FC<{ value: string; label: string; icon: React.ReactNode; iconBg: string }> = ({
  value, label, icon, iconBg,
}) => (
  <View style={insightStyles.card}>
    <View style={[insightStyles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
    <View style={{ marginLeft: 10 }}>
      <Text style={insightStyles.value}>{value}</Text>
      <Text style={insightStyles.label}>{label}</Text>
    </View>
  </View>
);

const insightStyles = StyleSheet.create({
  card: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.AppSurface, borderRadius: 12, borderWidth: 1, borderColor: Colors.AppOutline, padding: 12, marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 16, fontWeight: '700', color: Colors.AppOnBackground },
  label: { fontSize: 10, fontWeight: '500', color: Colors.AppOnSurfaceVariant },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
    backgroundColor: Colors.AppBackground,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  activeTabText: {
    color: Colors.BluePrimary,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    backgroundColor: Colors.BluePrimary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingTop: 8, paddingBottom: 24 },
  monthSelectorRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  monthPill: {
    backgroundColor: Colors.BluePrimary,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  monthPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  matrixCard: {
    marginHorizontal: 16,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  tableHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
    backgroundColor: '#FFFFFF',
  },
  tableRowLabel: {
    width: 75,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.AppOnBackground,
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendCard: {
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  legendGrid: {
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  miniDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  insightGrid: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  insightRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  facultyText: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  subjectStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  subjectDetailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.AppSurfaceVariant,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 16,
    marginLeft: 20,
  },
  subjectDetailItem: {
    alignItems: 'flex-start',
  },
  subjectDetailLabel: {
    fontSize: 9,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subjectDetailValue: {
    fontSize: 14,
    color: Colors.AppOnBackground,
    fontWeight: '800',
    marginTop: 1,
  },
  subjectDetailDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.AppOutline,
  },
});
