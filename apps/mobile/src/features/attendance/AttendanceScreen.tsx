import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
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
  CheckCircle,
  XCircle,
  TrendingUp,
  Flame,
  Filter,
  Check,
  X,
  Clock,
  AlertCircle,
  CircleOff,
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


// ── Semester Mock Data ──
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];



export const AttendanceScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'COURSE' | 'HOURLY' | 'TERMLY'>('HOURLY');

  // Real data from campus store (fetched on dashboard load)
  const { attendanceOverview, subjectAttendanceList, dailyAttendance, fetchCampusData } = useCampusStore();

  // Load real attendance data when screen is focused
  useEffect(() => {
    fetchCampusData();
  }, []);

  // Semester selector filter states
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [showSemDropdown, setShowSemDropdown] = useState(false);

  // Hourly attendance details modal states
  const [selectedHourDetails, setSelectedHourDetails] = useState<any | null>(null);

  const handleHourPress = (day: string, hourIndex: number, status: string, subject?: string) => {
    // Use subject info from daily attendance if available, otherwise generic period info
    setSelectedHourDetails({
      day,
      hourIndex,
      status,
      subject: subject || `Period H${hourIndex}`,
      time: '',
    });
  };

  const currentData = {
    overview: {
      totalAttendedClasses: attendanceOverview?.totalAttendedClasses ?? 0,
      missedClasses: attendanceOverview?.missedClasses ?? 0,
      totalDays: (attendanceOverview as any)?.totalDays ?? ((attendanceOverview?.totalAttendedClasses ?? 0) + (attendanceOverview?.missedClasses ?? 0)),
      classesTo75Percent: attendanceOverview?.classesTo75Percent ?? 0,
      currentStreak: attendanceOverview?.currentStreak ?? 0,
      overallPercent: attendanceOverview?.overallPercentage ?? 0,
    },
    subjects: subjectAttendanceList ?? []
  };

  const renderFilterButton = () => (
    <Pressable
      onPress={() => setShowSemDropdown(true)}
      style={styles.filterBtn}
    >
      <Filter size={13} color={Colors.BluePrimary} style={{ marginRight: 4 }} />
      <Text style={styles.filterText}>{selectedSemester.replace('Semester', 'Sem')}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Attendance" rightElement={renderFilterButton()} />

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
                  value={String(currentData.overview.totalAttendedClasses)}
                  label="Total Attended"
                  icon={<CheckCircle size={18} color={Colors.BluePrimary} />}
                  iconBg={Colors.BluePrimaryContainer + '66'}
                />
                <InsightCard
                  value={String(currentData.overview.missedClasses)}
                  label="Missed Classes"
                  icon={<XCircle size={18} color={Colors.RedError} />}
                  iconBg={Colors.RedErrorContainer}
                />
              </View>
              <View style={[styles.insightRow, { marginTop: 8 }]}>
                <InsightCard
                  value={String(currentData.overview.classesTo75Percent)}
                  label="Classes to 75%"
                  icon={<TrendingUp size={18} color={Colors.TealTertiary} />}
                  iconBg={Colors.TealTertiaryContainer}
                />
                <InsightCard
                  value={String(currentData.overview.currentStreak)}
                  label="Current Streak"
                  icon={<Flame size={18} color={Colors.ColorPending} />}
                  iconBg={Colors.ColorPending + '1F'}
                />
              </View>
            </View>

            {/* Course-wise Analytics */}
            {currentData.subjects.map((subject, idx) => {
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
            {/* Current month pill button */}
            <View style={styles.monthSelectorRow}>
              <Pressable style={styles.monthPill}>
                <Text style={styles.monthPillText}>
                  {new Date().toLocaleString('default', { month: 'long' })}
                </Text>
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

              <ScrollView 
                style={{ height: 380 }} 
                contentContainerStyle={{ paddingBottom: 4 }}
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true}
              >
                {(dailyAttendance ?? []).map((row: any, rIdx: any) => (
                  <View
                    key={row.date}
                    style={[
                      styles.tableBodyRow,
                      rIdx === 0 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <Text style={styles.tableRowLabel}>
                      {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </Text>
                    {Array.from({ length: 5 }).map((_, hIdx) => {
                      const periodEntry = row.periods?.find((p: any) => p.period === `H${hIdx + 1}`);
                      const status = periodEntry?.status || 'UNMARKED';
                      const subject = periodEntry?.subject;
                      return (
                        <Pressable
                          key={hIdx}
                          style={styles.statusCell}
                          onPress={() => handleHourPress(row.date, hIdx + 1, status, subject)}
                        >
                          {status === 'PRESENT' ? (
                            <PresentIcon />
                          ) : status === 'ABSENT' ? (
                            <AbsentIcon />
                          ) : status === 'LATE' ? (
                            <LateIcon />
                          ) : status === 'ON_DUTY' ? (
                            <LetOffIcon />
                          ) : (
                            <UnmarkedIcon />
                          )}
                        </Pressable>
                      );
                    })}
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
            {currentData.overview.totalDays === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: Colors.AppOnSurfaceVariant, fontSize: 14 }}>No term-level attendance data available yet.</Text>
              </View>
            ) : (
              <CampusCard style={styles.card} elevation="sm">
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>Current Semester</Text>
                  <StatusChip
                    text={currentData.overview.overallPercent >= 75 ? 'SAFE' : currentData.overview.overallPercent >= 65 ? 'WARNING' : 'LOW'}
                    level={currentData.overview.overallPercent >= 75 ? 'SAFE' : 'LOW'}
                  />
                </View>
                <View style={styles.subjectStatsRow}>
                  <CircularProgress
                    percentage={currentData.overview.overallPercent}
                    size={64}
                    strokeWidth={5.5}
                    progressColor={currentData.overview.overallPercent >= 75 ? Colors.ColorPresent : currentData.overview.overallPercent >= 65 ? Colors.ColorPending : Colors.ColorAbsent}
                    label=""
                  />
                  <View style={styles.subjectDetailsBox}>
                    <View style={styles.subjectDetailItem}>
                      <Text style={styles.subjectDetailLabel}>Attended</Text>
                      <Text style={styles.subjectDetailValue}>{currentData.overview.totalAttendedClasses} Hrs</Text>
                    </View>
                    <View style={styles.subjectDetailDivider} />
                    <View style={styles.subjectDetailItem}>
                      <Text style={styles.subjectDetailLabel}>Total Hours</Text>
                      <Text style={styles.subjectDetailValue}>{currentData.overview.totalDays} Hrs</Text>
                    </View>
                  </View>
                </View>
              </CampusCard>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── SEMESTER SELECTOR MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSemDropdown}
        onRequestClose={() => setShowSemDropdown(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setShowSemDropdown(false)}>
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Select Semester</Text>
            {SEMESTERS.map((sem) => {
              const active = sem === selectedSemester;
              return (
                <Pressable
                  key={sem}
                  onPress={() => {
                    setSelectedSemester(sem);
                    setShowSemDropdown(false);
                  }}
                  style={[styles.dropdownOption, active && styles.dropdownOptionActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{sem}</Text>
                  {active && <CheckCircle size={14} color={Colors.BluePrimary} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* ── HOURLY ATTENDANCE HOUR DETAILS MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedHourDetails !== null}
        onRequestClose={() => setSelectedHourDetails(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {selectedHourDetails && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View
                  style={[
                    styles.modalIconBox,
                    {
                      backgroundColor:
                        selectedHourDetails.status === 'PRESENT'
                          ? '#E6FBF3'
                          : selectedHourDetails.status === 'ABSENT'
                          ? '#FEF2F2'
                          : selectedHourDetails.status === 'LATE'
                          ? '#FFFBEB'
                          : '#F1F5F9',
                    },
                  ]}
                >
                  {selectedHourDetails.status === 'PRESENT' ? (
                    <CheckCircle size={30} color="#10B981" />
                  ) : selectedHourDetails.status === 'ABSENT' ? (
                    <XCircle size={30} color="#EF4444" />
                  ) : selectedHourDetails.status === 'LATE' ? (
                    <Clock size={30} color="#F59E0B" />
                  ) : (
                    <AlertCircle size={30} color="#64748B" />
                  )}
                </View>

                <Text style={styles.portalTitle}>Hour {selectedHourDetails.hourIndex} Attendance</Text>
                <Text style={styles.portalSubtitle}>{selectedHourDetails.day} • {selectedHourDetails.subject}</Text>

                {/* Clean full-width details list */}
                <View style={styles.gridContainer}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>SUBJECT</Text>
                    <Text style={styles.gridVal}>{selectedHourDetails.subject}</Text>
                  </View>
                  
                  <View style={styles.gridDividerLine} />
                  
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>MARKED BY</Text>
                    <Text style={styles.gridVal}>{selectedHourDetails.prof}</Text>
                  </View>
                </View>

                {/* Status Bar */}
                <View style={styles.modalStatusRow}>
                  <Text style={styles.modalStatusLabel}>ATTENDANCE STATUS</Text>
                  <StatusChip
                    text={selectedHourDetails.status}
                    level={
                      selectedHourDetails.status === 'PRESENT'
                        ? 'SAFE'
                        : selectedHourDetails.status === 'ABSENT'
                        ? 'LOW'
                        : 'WARNING'
                    }
                  />
                </View>

                {/* Close Button */}
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%' }]}
                  onPress={() => setSelectedHourDetails(null)}
                >
                  <Text style={styles.portalBtnTextPrimary}>Dismiss Details</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 8,
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
    paddingVertical: 7,
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

  // Semester Filter Styles
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Slate-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
    textAlign: 'center',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 3,
  },
  dropdownOptionActive: {
    backgroundColor: '#F0F9FF', // Sky-50
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  optionTextActive: {
    color: Colors.BluePrimary,
    fontWeight: '700',
  },

  // Modal Overlays
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
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Grid details styles
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
});
