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
import { PageHeader, CampusCard, StatusChip } from '../../components';
import { Colors } from '../../theme';
import { mockAssignments } from '../../data/mockData';
import { Assignment } from '../../types';
import { ClipboardList, Calendar, CheckCircle, AlertCircle, Award } from 'lucide-react-native';

const FILTERS: Array<{ label: string; value: Assignment['status'] | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Graded', value: 'GRADED' },
];

export const AssignmentsScreen: React.FC = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [activeFilter, setActiveFilter] = useState<Assignment['status'] | 'ALL'>('ALL');

  const filtered = activeFilter === 'ALL'
    ? assignments
    : assignments.filter((a) => a.status === activeFilter);

  const getStatusColor = (status: Assignment['status']) => {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Assignments" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setActiveFilter(f.value)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main content list */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ClipboardList size={48} color={Colors.AppOnSurfaceVariant} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>No assignments found in this section</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const statusConfig = getStatusColor(item.status);

            return (
              <CampusCard
                key={item.id}
                borderColor={Colors.AppOutline}
                style={styles.card}
                elevation="sm"
                onPress={() => router.push({ pathname: '/student/assignment-details', params: { id: item.id } })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <StatusChip text={item.subjectName} level="ACADEMIC" />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
                  </View>
                </View>

                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.metaRow}>
                  <Calendar size={14} color={Colors.AppOnSurfaceVariant} />
                  <Text style={styles.metaText}>Due: {item.dueDate}</Text>
                  <View style={styles.metaDivider} />
                  <Award size={14} color={Colors.AppOnSurfaceVariant} />
                  <Text style={styles.metaText}>{item.marks}</Text>
                </View>



                {item.status === 'GRADED' && (
                  <View style={styles.gradeSection}>
                    <Award size={18} color={Colors.ColorPresent} />
                    <Text style={styles.gradeLabel}>Grade Awarded: </Text>
                    <Text style={styles.gradeValue}>{item.grade}</Text>
                  </View>
                )}
               </CampusCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  filterContainer: { borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingVertical: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: Colors.BluePrimary, borderColor: Colors.BluePrimary },
  filterLabel: { fontSize: 13, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  filterLabelActive: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  marksBadge: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant, backgroundColor: Colors.AppSurfaceVariant, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 12, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: '500' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.AppOnSurfaceVariant, opacity: 0.3, marginHorizontal: 8 },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.BluePrimaryContainer + '4D', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 12 },
  attachmentText: { fontSize: 12, color: Colors.BluePrimary, fontWeight: '600' },
  gradeSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.ColorPresent + '10', borderLeftWidth: 3, borderLeftColor: Colors.ColorPresent, padding: 12, borderRadius: 6, marginTop: 4 },
  gradeLabel: { fontSize: 13, fontWeight: '600', color: Colors.AppOnBackground, marginLeft: 8 },
  gradeValue: { fontSize: 14, fontWeight: '800', color: Colors.ColorPresent },
  actionRow: { marginTop: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  loadingText: { fontSize: 13, fontWeight: '600', color: Colors.BluePrimary },
  submittedInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8, marginTop: 8 },
  submittedInfoText: { fontSize: 12, color: '#065F46', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 14, color: Colors.AppOnSurfaceVariant, fontWeight: '600', marginTop: 12 },
});
