import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, BarChart3, Users } from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, StatusChip, useCampusAlert } from '../../components';
import { mockDefaultersList } from '../../data/mockFacultyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ActiveTab = 'OVERVIEW' | 'STATS' | 'DEFAULTERS' | 'REPORTS';

export const FacultyAttendanceHubScreen: React.FC = () => {
  const router = useRouter();
  const { showAlert } = useCampusAlert();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('OVERVIEW');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Mock Reports State
  const [selectedClass, setSelectedClass] = React.useState('III B.Sc CS');
  const [reportType, setReportType] = React.useState<'PDF' | 'EXCEL'>('PDF');

  const handleSendWarning = (studentName: string) => {
    showAlert(
      'Send Warning SMS',
      `Are you sure you want to send a shortage of attendance warning SMS to ${studentName}'s parents?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => showAlert('Success', `Warning SMS sent successfully to ${studentName}'s parents.`) },
      ]
    );
  };

  const handleBulkWarning = () => {
    showAlert(
      'Bulk Warning Alert',
      `This will send automated attendance warnings to parents of all ${mockDefaultersList.length} defaulters. Proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: () => showAlert('Success', 'Bulk warnings sent successfully.') },
      ]
    );
  };

  const handleGenerateReport = () => {
    showAlert(
      'Report Request',
      `Generating Attendance Report for ${selectedClass} in ${reportType} format...`,
      [
        { text: 'OK', onPress: () => showAlert('Success', `Report successfully generated and emailed to your registered address.`) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Attendance Management</Text>
        <View style={styles.spacer} />
      </View>

      {/* Sliding Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {(['OVERVIEW', 'STATS', 'DEFAULTERS', 'REPORTS'] as ActiveTab[]).map((tab) => {
            const active = activeTab === tab;
            const label = tab === 'OVERVIEW' ? 'Overview' : tab === 'STATS' ? 'Course & Dept Stats' : tab === 'DEFAULTERS' ? 'Defaulters' : 'Reports';
            return (
              <Pressable
                key={tab}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ──── OVERVIEW TAB ──── */}
        {activeTab === 'OVERVIEW' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Daily Attendance Tasks</Text>
            
            <CampusCard style={styles.taskCard} onPress={() => router.push('/faculty/classes' as any)}>
              <View style={styles.taskRow}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.BluePrimary + '15' }]}>
                  <CheckCircle size={22} color={Colors.BluePrimary} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Mark Attendance</Text>
                  <Text style={styles.taskDesc}>Select Class, Subject and Hour to mark attendance for today's sessions.</Text>
                </View>
              </View>
            </CampusCard>

            <CampusCard style={styles.taskCard} onPress={() => router.push('/faculty/classes' as any)}>
              <View style={styles.taskRow}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.TealTertiary + '15' }]}>
                  <FileText size={22} color={Colors.TealTertiary} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Edit Attendance</Text>
                  <Text style={styles.taskDesc}>Modify attendance status for past class periods and submit corrections.</Text>
                </View>
              </View>
            </CampusCard>

            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.summaryStatsGrid}>
              <CampusCard style={styles.statCard} elevation="sm">
                <Text style={styles.statTitle}>Total Classes</Text>
                <Text style={[styles.statValue, { color: Colors.BluePrimary }]}>5</Text>
              </CampusCard>
              <CampusCard style={styles.statCard} elevation="sm">
                <Text style={styles.statTitle}>Marked</Text>
                <Text style={[styles.statValue, { color: Colors.ColorPresent }]}>3</Text>
              </CampusCard>
              <CampusCard style={styles.statCard} elevation="sm">
                <Text style={styles.statTitle}>Pending</Text>
                <Text style={[styles.statValue, { color: Colors.ColorPending }]}>2</Text>
              </CampusCard>
            </View>
          </View>
        )}

        {/* ──── STATS TAB ──── */}
        {activeTab === 'STATS' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Subject Attendance Averages</Text>
            <CampusCard style={styles.card} elevation="sm">
              <View style={styles.metricRow}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricName}>Database Management System</Text>
                  <Text style={styles.metricPercent}>87%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '87%', backgroundColor: Colors.ColorPresent }]} />
                </View>
                <Text style={styles.metricSub}>III B.Sc CS · 36 hours completed</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricName}>Operating System</Text>
                  <Text style={styles.metricPercent}>82%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '82%', backgroundColor: Colors.ColorPresent }]} />
                </View>
                <Text style={styles.metricSub}>II B.Sc CS · 28 hours completed</Text>
              </View>
            </CampusCard>

            <Text style={styles.sectionTitle}>Department Statistics</Text>
            <CampusCard style={styles.card} elevation="sm">
              <View style={styles.deptRow}>
                <View style={styles.deptLeft}>
                  <Text style={styles.deptCode}>B.Sc CS</Text>
                  <Text style={styles.deptName}>Computer Science</Text>
                </View>
                <StatusChip text="85% AVG" level="NOW" />
              </View>
              <View style={styles.divider} />
              <View style={styles.deptRow}>
                <View style={styles.deptLeft}>
                  <Text style={styles.deptCode}>BCA</Text>
                  <Text style={styles.deptName}>Computer Applications</Text>
                </View>
                <StatusChip text="81% AVG" level="NOW" />
              </View>
              <View style={styles.divider} />
              <View style={styles.deptRow}>
                <View style={styles.deptLeft}>
                  <Text style={styles.deptCode}>B.Com CS</Text>
                  <Text style={styles.deptName}>Corporate Secretaryship</Text>
                </View>
                <StatusChip text="79% AVG" level="WARNING" />
              </View>
            </CampusCard>
          </View>
        )}

        {/* ──── DEFAULTERS TAB ──── */}
        {activeTab === 'DEFAULTERS' && (
          <View style={styles.tabPane}>
            <View style={styles.defaultersHeader}>
              <View>
                <Text style={styles.sectionTitle}>Attendance Shortage (&lt; 75%)</Text>
                <Text style={styles.defaultersSub}>Action required for {mockDefaultersList.length} students</Text>
              </View>
              <Pressable style={styles.bulkBtn} onPress={handleBulkWarning}>
                <Text style={styles.bulkBtnText}>Alert All</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="Search student by name or roll no..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
            />

            {mockDefaultersList
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.includes(searchQuery))
              .map((student) => (
                <CampusCard key={student.id} style={styles.defaulterCard} elevation="sm">
                  <View style={styles.defaulterRow}>
                    <View style={styles.defaulterLeft}>
                      <View style={[styles.avatarCircle, { backgroundColor: Colors.RedErrorContainer }]}>
                        <Text style={[styles.avatarText, { color: Colors.RedOnErrorContainer }]}>
                          {student.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.defaulterName}>{student.name}</Text>
                        <Text style={styles.defaulterMeta}>Roll No: {student.rollNo} · {student.class}</Text>
                      </View>
                    </View>
                    <View style={styles.defaulterRight}>
                      <Text style={styles.defaulterPercent}>{student.attendancePercent}%</Text>
                      <Pressable style={styles.alertBtn} onPress={() => handleSendWarning(student.name)}>
                        <AlertTriangle size={14} color="#FFF" />
                        <Text style={styles.alertBtnText}>Alert</Text>
                      </Pressable>
                    </View>
                  </View>
                </CampusCard>
              ))}
          </View>
        )}

        {/* ──── REPORTS TAB ──── */}
        {activeTab === 'REPORTS' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Generate Attendance Reports</Text>
            <CampusCard style={styles.card} elevation="sm">
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Class / Section</Text>
                <View style={styles.chipSelectorGroup}>
                  {['III B.Sc CS', 'II B.Sc CS', 'III BCA'].map((cls) => (
                    <Pressable
                      key={cls}
                      style={[styles.selectorChip, selectedClass === cls && styles.selectorChipActive]}
                      onPress={() => setSelectedClass(cls)}
                    >
                      <Text style={[styles.selectorChipText, selectedClass === cls && styles.selectorChipTextActive]}>
                        {cls}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Report Format</Text>
                <View style={styles.chipSelectorGroup}>
                  {(['PDF', 'EXCEL'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[styles.selectorChip, reportType === type && styles.selectorChipActive]}
                      onPress={() => setReportType(type)}
                    >
                      <Text style={[styles.selectorChipText, reportType === type && styles.selectorChipTextActive]}>
                        {type} Document
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable style={styles.generateBtn} onPress={handleGenerateReport}>
                <BarChart3 size={18} color="#FFFFFF" />
                <Text style={styles.generateBtnText}>Compile & Download Report</Text>
              </Pressable>
            </CampusCard>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.AppOnBackground },
  spacer: { width: 40 },
  tabBar: {
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  tabBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: Colors.BluePrimary,
  },
  tabLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  tabLabelActive: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  tabPane: { gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },
  taskCard: { padding: 16 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  taskDesc: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2, lineHeight: 16 },
  summaryStatsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, alignItems: 'center' },
  statTitle: { fontSize: 11, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  statValue: { fontSize: 24, fontWeight: '900', marginTop: 8 },
  card: { padding: 16, gap: 16 },
  metricRow: { gap: 8 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricName: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground, flex: 1 },
  metricPercent: { fontSize: 16, fontWeight: '900', color: Colors.ColorPresent },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  metricSub: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  divider: { height: 1, backgroundColor: Colors.AppOutline },
  deptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deptLeft: { gap: 2 },
  deptCode: { fontSize: 14, fontWeight: '800', color: Colors.AppOnBackground },
  deptName: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  defaultersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  defaultersSub: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  bulkBtn: { backgroundColor: Colors.RedError, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  bulkBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  searchBar: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.AppOnBackground,
  },
  defaulterCard: { padding: 12 },
  defaulterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  defaulterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  defaulterName: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  defaulterMeta: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  defaulterRight: { alignItems: 'flex-end', gap: 6 },
  defaulterPercent: { fontSize: 16, fontWeight: '900', color: Colors.RedError },
  alertBtn: {
    backgroundColor: Colors.RedError,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertBtnText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  formGroup: { gap: 8 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  chipSelectorGroup: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  selectorChipActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  selectorChipText: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  selectorChipTextActive: { color: '#FFFFFF' },
  generateBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  generateBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
