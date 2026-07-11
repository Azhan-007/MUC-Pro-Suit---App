import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { PageHeader, CampusCard, StatusChip } from '../../components';
import { Colors } from '../../theme';
import { mockAssignments } from '../../data/mockData';
import { Calendar, User, Award, FileText, CheckCircle, AlertCircle } from 'lucide-react-native';

export const AssignmentDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const assignment = mockAssignments.find((a) => a.id === id);

  if (!assignment) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PageHeader title="Assignment Details" />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.RedError} />
          <Text style={styles.errorText}>Assignment not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusConfig = (status: typeof assignment.status) => {
    switch (status) {
      case 'GRADED':
        return { bg: Colors.ColorPresent + '15', text: Colors.ColorPresent, label: 'Graded' };
      case 'SUBMITTED':
        return { bg: Colors.BluePrimary + '15', text: Colors.BluePrimary, label: 'Submitted' };
      case 'PENDING':
      default:
        return { bg: Colors.ColorPending + '15', text: Colors.ColorPending, label: 'Pending' };
    }
  };

  const statusConfig = getStatusConfig(assignment.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Assignment Details" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Details Card */}
        <CampusCard borderColor={Colors.AppOutline} style={styles.detailCard} elevation="sm">
          <View style={styles.headerRow}>
            <StatusChip text={assignment.subjectName} level="ACADEMIC" />
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
            </View>
          </View>

          <Text style={styles.title}>{assignment.title}</Text>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <User size={16} color={Colors.AppOnSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Assigned By</Text>
                <Text style={styles.infoValue}>{assignment.professorName ?? 'Subject Professor'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Calendar size={16} color={Colors.AppOnSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Timeline</Text>
                <Text style={styles.infoValue}>
                  Assigned: {assignment.assignedDate ?? 'N/A'} • Due: {assignment.dueDate}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Award size={16} color={Colors.AppOnSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Marks / Weightage</Text>
                <Text style={styles.infoValue}>{assignment.marks}</Text>
              </View>
            </View>
          </View>
        </CampusCard>

        {/* Instructions / Description */}
        <Text style={styles.sectionTitle}>Description & Guidelines</Text>
        <CampusCard borderColor={Colors.AppOutline} style={styles.descCard} elevation="sm">
          <View style={styles.descHeader}>
            <FileText size={18} color={Colors.BluePrimary} />
            <Text style={styles.descHeaderTitle}>Instructions</Text>
          </View>
          <Text style={styles.descriptionText}>
            {assignment.description ?? 'No detailed description provided for this assignment.'}
          </Text>
        </CampusCard>

        {/* Evaluation & Grades */}
        {assignment.status === 'GRADED' && (
          <>
            <Text style={styles.sectionTitle}>Evaluation & Feedback</Text>
            <CampusCard borderColor={Colors.ColorPresent} style={styles.gradeCard} elevation="sm">
              <View style={styles.gradeHeaderRow}>
                <Award size={22} color={Colors.ColorPresent} />
                <View>
                  <Text style={styles.gradeTitle}>Grade Awarded</Text>
                  <Text style={styles.gradeValue}>{assignment.grade}</Text>
                </View>
              </View>
              {assignment.remarks && (
                <>
                  <View style={styles.innerDivider} />
                  <Text style={styles.remarksLabel}>Faculty Remarks:</Text>
                  <Text style={styles.remarksText}>"{assignment.remarks}"</Text>
                </>
              )}
            </CampusCard>
          </>
        )}

        {assignment.status === 'SUBMITTED' && assignment.remarks && (
          <>
            <Text style={styles.sectionTitle}>Submission Status</Text>
            <CampusCard borderColor={Colors.BluePrimary} style={[styles.gradeCard, { borderColor: Colors.BluePrimary }]} elevation="sm">
              <View style={styles.gradeHeaderRow}>
                <CheckCircle size={22} color={Colors.BluePrimary} />
                <View>
                  <Text style={styles.gradeTitle}>Status</Text>
                  <Text style={[styles.gradeValue, { color: Colors.BluePrimary }]}>Awaiting Evaluation</Text>
                </View>
              </View>
              <View style={styles.innerDivider} />
              <Text style={styles.remarksLabel}>Remarks:</Text>
              <Text style={styles.remarksText}>"{assignment.remarks}"</Text>
            </CampusCard>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  detailCard: { backgroundColor: '#FFFFFF', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 20, lineHeight: 26 },
  infoSection: { backgroundColor: Colors.AppSurfaceVariant + '4D', borderRadius: 12, padding: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.AppOnBackground, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4, marginBottom: 12, marginLeft: 4 },
  descCard: { backgroundColor: '#FFFFFF', marginBottom: 20 },
  descHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  descHeaderTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  descriptionText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, lineHeight: 20, fontWeight: '500' },
  gradeCard: { backgroundColor: '#FFFFFF', marginBottom: 20, borderLeftWidth: 4 },
  gradeHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gradeTitle: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textTransform: 'uppercase' },
  gradeValue: { fontSize: 18, fontWeight: '900', color: Colors.ColorPresent, marginTop: 2 },
  innerDivider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 12 },
  remarksLabel: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textTransform: 'uppercase' },
  remarksText: { fontSize: 13, color: Colors.AppOnBackground, fontStyle: 'italic', marginTop: 4, lineHeight: 18, fontWeight: '500' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { fontSize: 16, color: Colors.AppOnSurfaceVariant, fontWeight: '600', marginTop: 12 },
});
