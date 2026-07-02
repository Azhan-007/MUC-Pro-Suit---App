import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme';
import { Clock, MapPin, Info, GraduationCap } from 'lucide-react-native';
import { CampusCard, StatusChip, CustomButton, PageHeader } from '../../components';

const EXAM_TYPES = ['CIA 1', 'CIA 2', 'Semester'] as const;
type ExamType = typeof EXAM_TYPES[number];

const EXAM_TIMETABLES: Record<ExamType, { code: string; subject: string; date: string; time: string; hall: string; seat: string; maxMarks: string }[]> = {
  'CIA 1': [
    { code: 'DBMS401', subject: 'Database Management System', date: 'Aug 18, 2026', time: '10:00 AM - 11:30 AM', hall: 'Exam Hall A', seat: 'Row 3, Seat 12', maxMarks: '50 Marks' },
    { code: 'DMW402', subject: 'Data Mining and Warehousing', date: 'Aug 19, 2026', time: '10:00 AM - 11:30 AM', hall: 'Exam Hall B', seat: 'Row 1, Seat 24', maxMarks: '50 Marks' },
    { code: 'DS403', subject: 'Data Science', date: 'Aug 20, 2026', time: '10:00 AM - 11:30 AM', hall: 'CS Lab 06', seat: 'System 08', maxMarks: '50 Marks' },
    { code: 'OS404', subject: 'Operating System', date: 'Aug 21, 2026', time: '10:00 AM - 11:30 AM', hall: 'Room 402', seat: 'Row 5, Seat 10', maxMarks: '50 Marks' },
  ],
  'CIA 2': [
    { code: 'DBMS401', subject: 'Database Management System', date: 'Sep 28, 2026', time: '10:00 AM - 11:30 AM', hall: 'Exam Hall A', seat: 'Row 3, Seat 12', maxMarks: '50 Marks' },
    { code: 'DMW402', subject: 'Data Mining and Warehousing', date: 'Sep 29, 2026', time: '10:00 AM - 11:30 AM', hall: 'Exam Hall B', seat: 'Row 1, Seat 24', maxMarks: '50 Marks' },
    { code: 'DS403', subject: 'Data Science', date: 'Sep 30, 2026', time: '10:00 AM - 11:30 AM', hall: 'CS Lab 06', seat: 'System 08', maxMarks: '50 Marks' },
    { code: 'OS404', subject: 'Operating System', date: 'Oct 01, 2026', time: '10:00 AM - 11:30 AM', hall: 'Room 402', seat: 'Row 5, Seat 10', maxMarks: '50 Marks' },
  ],
  'Semester': [
    { code: 'DBMS401', subject: 'Database Management System', date: 'Nov 10, 2026', time: '10:00 AM - 01:00 PM', hall: 'Exam Hall A', seat: 'Row 3, Seat 12', maxMarks: '100 (75 Ext + 25 Int)' },
    { code: 'DMW402', subject: 'Data Mining and Warehousing', date: 'Nov 12, 2026', time: '10:00 AM - 01:00 PM', hall: 'Exam Hall B', seat: 'Row 1, Seat 24', maxMarks: '100 (75 Ext + 25 Int)' },
    { code: 'DS403', subject: 'Data Science', date: 'Nov 14, 2026', time: '10:00 AM - 01:00 PM', hall: 'CS Lab 06', seat: 'System 08', maxMarks: '100 (75 Ext + 25 Int)' },
    { code: 'OS404', subject: 'Operating System', date: 'Nov 16, 2026', time: '10:00 AM - 01:00 PM', hall: 'Room 402', seat: 'Row 5, Seat 10', maxMarks: '100 (75 Ext + 25 Int)' },
  ],
};

export const ExamsScreen: React.FC = () => {
  const router = useRouter();
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('Semester');

  const parseExamDate = (dateStr: string) => {
    const parts = dateStr.split(' ');
    const month = parts[0]?.toUpperCase() || 'NOV';
    const day = parts[1]?.replace(',', '') || '10';
    return { month, day };
  };

  const getHeaderColor = (type: ExamType) => {
    if (type === 'CIA 1') return Colors.TealTertiary;
    if (type === 'CIA 2') return Colors.ColorPending;
    return Colors.BluePrimary;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Examination" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Exam Type Sub-tabs */}
        <View style={styles.subTabsContainer}>
          {EXAM_TYPES.map((type) => {
            const active = selectedExamType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setSelectedExamType(type)}
                style={[styles.subTabButton, active && styles.activeSubTabButton]}
              >
                <Text style={[styles.subTabText, active && styles.activeSubTabText]}>
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.cardsContainer}>
          {EXAM_TIMETABLES[selectedExamType].map((exam, idx) => {
            const { month, day } = parseExamDate(exam.date);
            const headerBg = getHeaderColor(selectedExamType);
            return (
              <CampusCard key={idx} style={styles.examCardNew} borderColor={Colors.AppOutline} elevation="sm">
                <View style={styles.examRowNew}>
                  {/* Left: Calendar Leaf */}
                  <View style={styles.calendarLeaf}>
                    <View style={[styles.calendarHeader, { backgroundColor: headerBg }]}>
                      <Text style={styles.calendarMonth}>{month}</Text>
                    </View>
                    <View style={styles.calendarBody}>
                      <Text style={styles.calendarDay}>{day}</Text>
                    </View>
                  </View>

                  {/* Right: Exam Details */}
                  <View style={styles.examInfoNew}>
                    <View style={styles.examHeaderRow}>
                      <StatusChip text={exam.code} level="ACADEMIC" />
                      <View style={styles.seatBadgeNew}>
                        <Text style={styles.seatBadgeTextNew}>{exam.seat}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.examSubjectNew}>{exam.subject}</Text>
                    
                    <View style={styles.examMetaRowNew}>
                      <Clock size={12} color={Colors.AppOnSurfaceVariant} />
                      <Text style={styles.examMetaTextNew}>{exam.time} ({exam.maxMarks})</Text>
                    </View>
                    
                    <View style={styles.examMetaRowNew}>
                      <MapPin size={12} color={Colors.AppOnSurfaceVariant} />
                      <Text style={styles.examMetaTextNew}>Venue: {exam.hall}</Text>
                    </View>
                  </View>
                </View>
              </CampusCard>
            );
          })}
        </View>

        {/* View Results Button */}
        <View style={styles.resultsButtonContainer}>
          <CustomButton
            text={`View ${selectedExamType} Results`}
            onPress={() => router.push(`/student/exam-results?type=${selectedExamType}` as any)}
            leadingIcon={<GraduationCap size={20} color="#FFFFFF" />}
            backgroundColor={getHeaderColor(selectedExamType)}
            fullWidth
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.AppSurface,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    padding: 3,
    borderRadius: 10,
    marginVertical: 12,
    gap: 4,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSubTabButton: {
    backgroundColor: Colors.BluePrimaryContainer,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  activeSubTabText: {
    color: Colors.BlueOnPrimaryContainer,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  cardsContainer: { gap: 10 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.BluePrimaryContainer + '40',
    borderWidth: 1,
    borderColor: Colors.BluePrimary + '20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.BlueOnPrimaryContainer,
    flex: 1,
  },
  examCardNew: {
    padding: 12,
  },
  examRowNew: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  calendarLeaf: {
    width: 64,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.AppOutline,
  },
  calendarHeader: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  calendarBody: {
    flex: 1,
    backgroundColor: Colors.AppSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.AppOnBackground,
  },
  examInfoNew: {
    flex: 1,
  },
  examHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatBadgeNew: {
    backgroundColor: Colors.BluePrimaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatBadgeTextNew: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.BlueOnPrimaryContainer,
  },
  examSubjectNew: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.AppOnBackground,
    marginVertical: 6,
  },
  examMetaRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  examMetaTextNew: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '500',
  },
  resultsButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
});
