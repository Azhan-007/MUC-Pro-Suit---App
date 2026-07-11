import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Line } from 'react-native-svg';
import { useCampusStore } from '../../store/campusStore';
import {
  CampusCard,
  SectionHeader,
  StatusChip,
  PageHeader,
} from '../../components';
import { Colors } from '../../theme';
import { TrendingUp, Award, Brain, Download, ChevronRight, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'];

export const ResultsScreen: React.FC = () => {
  const router = useRouter();
  const { resultOverview, subjectGrades, selectedSemester, setSelectedSemester } = useCampusStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const parsedGrades = subjectGrades.map((g) => {
    const scoreVal = parseInt(g.total.split('/')[0], 10) || 0;
    return { ...g, scoreVal };
  });

  const highestSubject = parsedGrades.reduce((max, item) => (max && max.scoreVal > item.scoreVal ? max : item), parsedGrades[0]);
  const toughestSubject = parsedGrades.reduce((min, item) => (min && min.scoreVal < item.scoreVal ? min : item), parsedGrades[0]);

  const highestLabel = highestSubject ? `${highestSubject.subjectName} (${highestSubject.scoreVal})` : 'N/A';
  const toughestLabel = toughestSubject ? `${toughestSubject.subjectName} (${toughestSubject.scoreVal})` : 'N/A';

  const chartWidth = 280;
  const chartHeight = 110;
  const barW = 40;
  const count = resultOverview.gpaTrend.length;
  const spacing = (chartWidth - barW * count) / (count + 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Performance" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. SGPA / CGPA Card ── */}
        <CampusCard style={styles.card}>
          <View style={styles.gpaRow}>
            {/* SGPA Section */}
            <View style={styles.gpaCol}>
              <Text style={styles.gpaSmLabel}>CURRENT SGPA</Text>
              <Text style={styles.sgpa}>{resultOverview.currentSgpa.toFixed(2)}</Text>
              <View style={styles.trendRow}>
                <TrendingUp size={14} color={Colors.ColorPresent} />
                <Text style={styles.trendText}>+0.17 from last sem</Text>
              </View>
            </View>

            {/* Vert Divider */}
            <View style={styles.gpaVertDivider} />

            {/* CGPA Section */}
            <View style={styles.gpaCol}>
              <Text style={styles.gpaSmLabel}>CGPA</Text>
              <Text style={styles.cgpa}>{resultOverview.cgpa.toFixed(2)}</Text>
              <View style={styles.standingBadge}>
                <Award size={12} color={Colors.BluePrimary} />
                <Text style={styles.standingBadgeText}>First Class</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Credits Progress Section */}
          <View style={styles.creditsSection}>
            <View style={styles.creditsLabelRow}>
              <Text style={styles.creditsLabel}>Completed Credits</Text>
              <Text style={styles.creditsValue}>{resultOverview.creditsProgress}</Text>
            </View>
            <View style={styles.creditTrack}>
              <View style={[styles.creditFill, { width: `${resultOverview.currentProgressPercentage * 100}%` }]} />
            </View>
          </View>
        </CampusCard>

        {/* ── 2. GPA Trend Chart ── */}
        <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
          <Text style={styles.cardTitle}>GPA Trend</Text>
          <View style={{ height: 16 }} />
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid line at 7.5 */}
            <Line
              x1={0} y1={chartHeight - (7.5 / 10) * chartHeight}
              x2={chartWidth} y2={chartHeight - (7.5 / 10) * chartHeight}
              stroke={Colors.AppOutline} strokeWidth={1} strokeDasharray="8,8"
            />
            {resultOverview.gpaTrend.map((pt, i) => {
              const x = spacing + i * (barW + spacing);
              const barH = (pt.gpa / 10) * chartHeight;
              const y = chartHeight - barH;
              return (
                <Rect
                  key={pt.semester}
                  x={x} y={y}
                  width={barW} height={barH}
                  fill={i === count - 1 ? Colors.BluePrimary : Colors.BluePrimary + '33'}
                  rx={4}
                />
              );
            })}
          </Svg>
          <View style={styles.barLabels}>
            {resultOverview.gpaTrend.map((pt) => (
              <View key={pt.semester} style={styles.barLabelCol}>
                <Text style={styles.barSem}>{pt.semester}</Text>
                <Text style={styles.barGpa}>{pt.gpa.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </CampusCard>


        {/* ── 4. Subject Breakdown ── */}
        <SectionHeader title="Subject Breakdown" actionText="View Policy" />
        {subjectGrades.map((g, idx) => (
          <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
            <View style={styles.gradeHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <View style={styles.gradeChipRow}>
                  <StatusChip text={g.code} level="LIBRARY" />
                  <Text style={styles.gradeCredits}> {g.credits} Credits</Text>
                </View>
                <Text style={styles.gradeName}>{g.subjectName}</Text>
              </View>
              <View style={{ width: 75, alignItems: 'flex-end' }}>
                <Text style={styles.gradeLetterScore}>{g.grade}</Text>
                <View style={[
                  styles.resultHighlightBadge,
                  { backgroundColor: g.passStatus === 'PASS' ? Colors.ColorPresent : Colors.ColorAbsent }
                ]}>
                  <Text style={styles.resultHighlightText}>{g.passStatus}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 16 }} />
            <View style={styles.scoreRow}>
              <ScoreBox label="Internals" value={g.internals} />
              <ScoreBox label="Externals" value={g.externals} />
              <ScoreBox label="Total" value={g.total} isTotal />
            </View>
          </CampusCard>
        ))}

        {/* ── 5. Highlights Row ── */}
        {subjectGrades.length > 0 && (
          <View style={styles.highlightRow}>
            <View style={[styles.highlightCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1 }]}>
              <Award size={20} color="#10B981" />
              <Text style={[styles.highlightLabel, { color: '#065F46' }]}>Highest Score</Text>
              <Text style={styles.highlightVal} numberOfLines={1}>{highestLabel}</Text>
            </View>
            <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1 }]}>
              <Brain size={20} color="#F59E0B" />
              <Text style={[styles.highlightLabel, { color: '#92400E' }]}>Toughest Area</Text>
              <Text style={styles.highlightVal} numberOfLines={1}>{toughestLabel}</Text>
            </View>
          </View>
        )}



        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ScoreBox: React.FC<{ label: string; value: string; isTotal?: boolean }> = ({
  label, value, isTotal,
}) => (
  <View style={[scoreStyles.box, isTotal && { backgroundColor: Colors.BluePrimaryContainer + '80' }]}>
    <Text style={scoreStyles.label}>{label}</Text>
    <Text style={[scoreStyles.value, isTotal && { color: Colors.BluePrimary }]}>{value}</Text>
  </View>
);

const scoreStyles = StyleSheet.create({
  box: { flex: 1, borderRadius: 10, backgroundColor: Colors.AppSurfaceVariant, padding: 10, alignItems: 'center', marginHorizontal: 2 },
  label: { fontSize: 10, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  value: { fontSize: 14, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  card: { marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.AppOnBackground },
  gpaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpaCol: {
    flex: 1,
    alignItems: 'center',
  },
  gpaVertDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.AppOutline,
  },
  gpaSmLabel: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  sgpa: { fontSize: 32, fontWeight: '900', color: Colors.BluePrimary, marginVertical: 4 },
  cgpa: { fontSize: 32, fontWeight: '900', color: Colors.AppOnBackground, marginVertical: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.ColorPresent + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendText: { fontSize: 11, fontWeight: '700', color: Colors.ColorPresent },
  standingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.BluePrimaryContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  standingBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.BluePrimary },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 16 },
  creditsSection: { width: '100%' },
  creditsLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  creditsLabel: { fontSize: 12, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  creditsValue: { fontSize: 13, fontWeight: '700', color: Colors.AppOnBackground },
  creditTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.AppOutline, overflow: 'hidden' },
  creditFill: { height: 8, borderRadius: 4, backgroundColor: Colors.BluePrimary },
  barLabels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  barLabelCol: { alignItems: 'center' },
  barSem: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  barGpa: { fontSize: 12, fontWeight: '700', color: Colors.AppOnBackground },
  standingCard: { backgroundColor: Colors.BluePrimary, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 6 },
  standingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  standingIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  standingTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  standingText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  standingDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 10 },
  accuracyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accuracyLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  accuracyValue: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  gradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' },
  gradeChipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  gradeCredits: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  gradeName: { fontSize: 18, fontWeight: '900', color: Colors.AppOnBackground, flexShrink: 1 },
  gradeLetterScore: { fontSize: 24, fontWeight: '900', color: Colors.BluePrimary, marginBottom: 4 },
  scoreRow: { flexDirection: 'row', gap: 4 },
  highlightRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  highlightCard: { flex: 1, borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  highlightLabel: { fontSize: 11, fontWeight: '700', marginTop: 8 },
  highlightVal: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  docSub: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  resultHighlightBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHighlightText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
