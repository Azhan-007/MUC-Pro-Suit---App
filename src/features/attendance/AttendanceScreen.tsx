import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
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

// ── Semester Mock Data ──
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];

const mockDataPerSemester: Record<string, {
  overview: {
    totalAttendedClasses: number;
    missedClasses: number;
    classesTo75Percent: number;
    currentStreak: number;
    overallPercent: number;
  };
  subjects: Array<{
    subjectName: string;
    facultyName?: string;
    fraction: string;
    percentage: number;
    statusLevel: 'SAFE' | 'WARNING' | 'LOW';
  }>;
}> = {
  'Semester 1': {
    overview: { totalAttendedClasses: 140, missedClasses: 10, classesTo75Percent: 0, currentStreak: 8, overallPercent: 93 },
    subjects: [
      { subjectName: 'Technical English', facultyName: 'Dr. John Doe', fraction: '45/48 Hrs', percentage: 93, statusLevel: 'SAFE' },
      { subjectName: 'Mathematics I', facultyName: 'Prof. Mary Ann', fraction: '48/52 Hrs', percentage: 92, statusLevel: 'SAFE' },
      { subjectName: 'Engineering Physics', facultyName: 'Dr. Albert E.', fraction: '47/50 Hrs', percentage: 94, statusLevel: 'SAFE' },
    ]
  },
  'Semester 2': {
    overview: { totalAttendedClasses: 132, missedClasses: 18, classesTo75Percent: 0, currentStreak: 4, overallPercent: 88 },
    subjects: [
      { subjectName: 'Mathematics II', facultyName: 'Prof. Mary Ann', fraction: '42/50 Hrs', percentage: 84, statusLevel: 'SAFE' },
      { subjectName: 'Applied Chemistry', facultyName: 'Dr. Curie', fraction: '46/50 Hrs', percentage: 92, statusLevel: 'SAFE' },
      { subjectName: 'Programming in C', facultyName: 'Prof. Dennis Ritchie', fraction: '44/50 Hrs', percentage: 88, statusLevel: 'SAFE' },
    ]
  },
  'Semester 3': {
    overview: { totalAttendedClasses: 120, missedClasses: 25, classesTo75Percent: 0, currentStreak: 6, overallPercent: 82 },
    subjects: [
      { subjectName: 'Data Structures', facultyName: 'Prof. Knuth', fraction: '38/48 Hrs', percentage: 79, statusLevel: 'WARNING' },
      { subjectName: 'Discrete Mathematics', facultyName: 'Prof. Cantor', fraction: '42/50 Hrs', percentage: 84, statusLevel: 'SAFE' },
      { subjectName: 'Digital Logic Circuits', facultyName: 'Dr. Claude Shannon', fraction: '40/50 Hrs', percentage: 80, statusLevel: 'SAFE' },
    ]
  },
  'Semester 4': {
    overview: { totalAttendedClasses: 125, missedClasses: 30, classesTo75Percent: 2, currentStreak: 5, overallPercent: 80 },
    subjects: [
      { subjectName: 'Operating Systems', facultyName: 'Prof. Linus T.', fraction: '38/50 Hrs', percentage: 76, statusLevel: 'WARNING' },
      { subjectName: 'Object Oriented Programming', facultyName: 'Prof. Bjarne S.', fraction: '45/50 Hrs', percentage: 90, statusLevel: 'SAFE' },
      { subjectName: 'Database Management Systems', facultyName: 'Dr. E.F. Codd', fraction: '42/50 Hrs', percentage: 84, statusLevel: 'SAFE' },
    ]
  },
  'Semester 5': {
    overview: { totalAttendedClasses: 112, missedClasses: 21, classesTo75Percent: 0, currentStreak: 7, overallPercent: 84 },
    subjects: [
      { subjectName: 'Computer Networks', facultyName: 'Prof. Tanenbaum', fraction: '42/50 Hrs', percentage: 84, statusLevel: 'SAFE' },
      { subjectName: 'Software Engineering', facultyName: 'Prof. Pressman', fraction: '35/50 Hrs', percentage: 70, statusLevel: 'LOW' },
      { subjectName: 'Web Technology', facultyName: 'Prof. Tim Berners-Lee', fraction: '35/40 Hrs', percentage: 87, statusLevel: 'SAFE' },
    ]
  },
  'Semester 6': {
    overview: { totalAttendedClasses: 115, missedClasses: 15, classesTo75Percent: 0, currentStreak: 9, overallPercent: 88 },
    subjects: [
      { subjectName: 'Artificial Intelligence', facultyName: 'Prof. McCarthy', fraction: '38/44 Hrs', percentage: 86, statusLevel: 'SAFE' },
      { subjectName: 'Cloud Computing', facultyName: 'Dr. Werner Vogels', fraction: '40/46 Hrs', percentage: 86, statusLevel: 'SAFE' },
      { subjectName: 'Mobile App Development', facultyName: 'Prof. Andy Rubin', fraction: '37/43 Hrs', percentage: 86, statusLevel: 'SAFE' },
    ]
  }
};

export const AttendanceScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'COURSE' | 'HOURLY' | 'TERMLY'>('HOURLY');
  
  // Semester selector filter states
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [showSemDropdown, setShowSemDropdown] = useState(false);

  // Hourly attendance details modal states
  const [selectedHourDetails, setSelectedHourDetails] = useState<any | null>(null);

  const handleHourPress = (day: string, hourIndex: number, status: string) => {
    // Map hourIndex to simulated subject details
    const subjectMap: Record<number, { subject: string; prof: string; time: string; room: string }> = {
      1: { subject: 'Operating System', prof: 'Ms Sayeeda', time: '09:00 AM - 10:00 AM', room: 'Room 402' },
      2: { subject: 'Database Management System', prof: 'Dr P Rizwan Ahmed', time: '10:00 AM - 11:00 AM', room: 'Lab 01' },
      3: { subject: 'Data Mining and Warehousing', prof: 'Dr A Zakiuddin Ahmed', time: '11:30 AM - 12:30 PM', room: 'Room 201' },
      4: { subject: 'Data Science', prof: 'Mr Yaseen', time: '01:30 PM - 02:30 PM', room: 'Lab 03' },
      5: { subject: 'Mobile App Development', prof: 'Prof. Andy Rubin', time: '02:30 PM - 03:30 PM', room: 'Room 304' },
    };

    const details = subjectMap[hourIndex] || subjectMap[1];

    setSelectedHourDetails({
      day,
      hourIndex,
      status,
      subject: details.subject,
      prof: details.prof,
      time: details.time,
      room: details.room,
    });
  };

  const currentData = mockDataPerSemester[selectedSemester] || mockDataPerSemester['Semester 5'];

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

              <ScrollView 
                style={{ height: 380 }} 
                contentContainerStyle={{ paddingBottom: 4 }}
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true}
              >
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
                      <Pressable
                        key={hIdx}
                        style={styles.statusCell}
                        onPress={() => handleHourPress(row.day, hIdx + 1, status)}
                      >
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
                      </Pressable>
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
