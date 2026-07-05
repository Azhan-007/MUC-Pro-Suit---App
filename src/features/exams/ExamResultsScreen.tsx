import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../theme';
import { Download, CheckCircle2, BadgeCheck } from 'lucide-react-native';
import { CampusCard, StatusChip, CustomButton, PageHeader } from '../../components';

const EXAM_TYPES = ['CIA 1', 'CIA 2', 'Semester'] as const;
type ExamType = typeof EXAM_TYPES[number];

const COMPREHENSIVE_RESULTS = [
  {
    code: 'DBMS401',
    subject: 'Database Management System',
    cia1: '42/50',
    cia2: '45/50',
    internal: '22/25',
    external: '66/75',
    total: 88,
    grade: 'A+',
    result: 'PASS',
    cia1Grade: 'A+',
    cia2Grade: 'O',
  },
  {
    code: 'DMW402',
    subject: 'Data Mining and Warehousing',
    cia1: '38/50',
    cia2: '40/50',
    internal: '20/25',
    external: '62/75',
    total: 82,
    grade: 'A',
    result: 'PASS',
    cia1Grade: 'A',
    cia2Grade: 'A',
  },
  {
    code: 'DS403',
    subject: 'Data Science',
    cia1: '48/50',
    cia2: '47/50',
    internal: '24/25',
    external: '71/75',
    total: 95,
    grade: 'O',
    result: 'PASS',
    cia1Grade: 'O',
    cia2Grade: 'O',
  },
  {
    code: 'OS404',
    subject: 'Operating System',
    cia1: '43/50',
    cia2: '44/50',
    internal: '23/25',
    external: '64/75',
    total: 87,
    grade: 'A+',
    result: 'PASS',
    cia1Grade: 'A+',
    cia2Grade: 'A+',
  },
];

export const ExamResultsScreen: React.FC = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: ExamType }>();
  const [selectedResultType, setSelectedResultType] = useState<ExamType>('Semester');
  
  // Single, full-report download state
  const [downloadingFull, setDownloadingFull] = useState<Record<string, boolean>>({});
  const [downloadedFull, setDownloadedFull] = useState<Record<string, boolean>>({});

  // Custom Alert States
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'SUCCESS' | 'INFO';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'INFO',
  });

  React.useEffect(() => {
    if (type && EXAM_TYPES.includes(type)) {
      setSelectedResultType(type);
    }
  }, [type]);

  const handleDownloadFullReport = () => {
    const key = selectedResultType;
    if (downloadedFull[key]) {
      setAlertConfig({
        visible: true,
        title: 'File Downloaded',
        message: `Opening ${key} Full Marksheet Report from local store...`,
        type: 'INFO',
      });
      return;
    }
    setDownloadingFull((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setDownloadingFull((prev) => ({ ...prev, [key]: false }));
      setDownloadedFull((prev) => ({ ...prev, [key]: true }));
      setAlertConfig({
        visible: true,
        title: 'Download Complete',
        message: `${key} Full Marksheet Report has been saved to your downloads.`,
        type: 'SUCCESS',
      });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title={`${selectedResultType} Results`} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabContent}>
          {COMPREHENSIVE_RESULTS.map((res, idx) => {
            const scoreText = selectedResultType === 'CIA 1' ? res.cia1 : selectedResultType === 'CIA 2' ? res.cia2 : `${res.total}/100`;
            const numericScore = parseInt(scoreText.split('/')[0]) || 0;
            const maxScore = selectedResultType === 'Semester' ? 100 : 50;
            const percentage = (numericScore / maxScore) * 100;
            
            const activeColor = selectedResultType === 'CIA 1'
              ? Colors.TealTertiary
              : selectedResultType === 'CIA 2'
                ? Colors.ColorPending
                : Colors.BluePrimary;

            return (
              <CampusCard key={idx} style={styles.resultCard} borderColor={Colors.AppOutline} elevation="sm">
                <View style={styles.resultHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <StatusChip text={res.code} level="LIBRARY" />
                      <Text style={styles.gradeLetterLabel}>Grade: </Text>
                      <Text style={styles.gradeTextValue}>
                        {selectedResultType === 'CIA 1' ? res.cia1Grade : selectedResultType === 'CIA 2' ? res.cia2Grade : res.grade}
                      </Text>
                    </View>
                    <Text style={styles.resultSubject}>{res.subject}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={[
                      styles.resultHighlightBadge,
                      { backgroundColor: res.result === 'PASS' ? Colors.ColorPresent : Colors.ColorAbsent }
                    ]}>
                      <Text style={styles.resultHighlightText}>{res.result}</Text>
                    </View>
                  </View>
                </View>

                {/* College Exam Scheme Score Breakdown Grid */}
                <View style={styles.resultsGrid}>
                  {selectedResultType === 'Semester' ? (
                    <>
                      <View style={styles.resultsGridCol}>
                        <Text style={styles.gridHeader}>CIA 1 (50m)</Text>
                        <Text style={styles.gridValue}>{res.cia1}</Text>
                      </View>
                      <View style={styles.gridDivider} />
                      <View style={styles.resultsGridCol}>
                        <Text style={styles.gridHeader}>CIA 2 (50m)</Text>
                        <Text style={styles.gridValue}>{res.cia2}</Text>
                      </View>
                      <View style={styles.gridDivider} />
                      <View style={[styles.resultsGridCol, { flex: 1.5 }]}>
                        <Text style={styles.gridHeader}>Semester (100m)</Text>
                        <Text style={[styles.gridValue, { color: Colors.BluePrimary }]}>{res.total}/100</Text>
                        <Text style={styles.gridSubText}>Int: {res.internal} • Ext: {res.external}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.resultsGridCol}>
                        <Text style={styles.gridHeader}>Marks Obtained</Text>
                        <Text style={[styles.gridValue, { color: activeColor }]}>{scoreText}</Text>
                      </View>
                      <View style={styles.gridDivider} />
                      <View style={styles.resultsGridCol}>
                        <Text style={styles.gridHeader}>Percentage</Text>
                        <Text style={styles.gridValue}>{percentage.toFixed(0)}%</Text>
                      </View>
                      <View style={styles.gridDivider} />
                      <View style={styles.resultsGridCol}>
                        <Text style={styles.gridHeader}>Passing Min</Text>
                        <Text style={styles.gridValue}>20 / 50</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Visual Progress Bar Track */}
                <View style={styles.progressTrackWrapper}>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: activeColor }]} />
                  </View>
                  <Text style={styles.progressPercentageText}>
                    {numericScore} out of {maxScore} marks scored ({percentage.toFixed(1)}%)
                  </Text>
                </View>
              </CampusCard>
            );
          })}
        </View>

        {/* Full Marksheet Download Button */}
        <View style={styles.downloadContainer}>
          <CustomButton
            text={
              downloadingFull[selectedResultType]
                ? 'Downloading...'
                : downloadedFull[selectedResultType]
                  ? 'Marksheet Downloaded'
                  : `Download ${selectedResultType} Marksheet`
            }
            onPress={handleDownloadFullReport}
            loading={downloadingFull[selectedResultType]}
            leadingIcon={
              downloadedFull[selectedResultType] ? (
                <CheckCircle2 size={20} color="#FFFFFF" />
              ) : (
                <Download size={20} color="#FFFFFF" />
              )
            }
            backgroundColor={
              downloadedFull[selectedResultType] ? Colors.ColorPresent : Colors.BluePrimary
            }
            fullWidth
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── CUSTOM ALERT MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertConfig.visible}
        onRequestClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            <View
              style={[
                styles.modalIconBox,
                {
                  backgroundColor:
                    alertConfig.type === 'SUCCESS' ? '#E6FBF3' : '#EFF6FF',
                },
              ]}
            >
              {alertConfig.type === 'SUCCESS' ? (
                <BadgeCheck size={30} color="#10B981" />
              ) : (
                <CheckCircle2 size={30} color={Colors.BluePrimary} />
              )}
            </View>
            <Text style={styles.portalTitle}>{alertConfig.title}</Text>
            <Text style={styles.portalMessage}>{alertConfig.message}</Text>
            <Pressable
              style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%' }]}
              onPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
            >
              <Text style={styles.portalBtnTextPrimary}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  tabContent: { gap: 12 },
  resultCard: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeLetterLabel: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
    marginLeft: 6,
  },
  gradeTextValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.BluePrimary,
  },
  resultSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.AppOnBackground,
    marginTop: 8,
  },
  resultsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.AppSurfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  resultsGridCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.AppOutline,
  },
  gridHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    marginTop: 4,
    textAlign: 'center',
  },
  gridSubText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  downloadContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  progressTrackWrapper: {
    marginTop: 12,
    gap: 6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.AppSurfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentageText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
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

  // Modal styles
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  portalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  portalBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalBtnPrimary: {
    backgroundColor: Colors.BluePrimary,
  },
  portalBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
