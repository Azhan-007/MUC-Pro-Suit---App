import React, { useState } from 'react';
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
import { PageHeader, CampusCard, StatusChip, SectionHeader } from '../../components';
import { Colors } from '../../theme';
import { mockJobPostings } from '../../data/mockData';
import { JobPosting } from '../../types';
import {
  Briefcase,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Building,
  BadgeCheck,
} from 'lucide-react-native';

type PlacementTab = 'DRIVES' | 'APPLIED';

export const PlacementsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlacementTab>('DRIVES');
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(mockJobPostings);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  
  // Custom loader simulation states
  const [applyState, setApplyState] = useState<'IDLE' | 'LOADING_PROFILE' | 'LOADING_RESUME' | 'SUBMITTING' | 'SUCCESS'>('IDLE');

  const filteredJobs = activeTab === 'DRIVES'
    ? jobPostings
    : jobPostings.filter((job) => job.status === 'APPLIED' || job.status === 'SHORTLISTED');

  const handleApplyProcess = (id: string) => {
    setApplyState('LOADING_PROFILE');
    
    // Simulate multi-stage upload progress
    setTimeout(() => {
      setApplyState('LOADING_RESUME');
      setTimeout(() => {
        setApplyState('SUBMITTING');
        setTimeout(() => {
          setJobPostings((prev) =>
            prev.map((job) => (job.id === id ? { ...job, status: 'APPLIED' } : job))
          );
          
          // Update selectedJob state if open
          setSelectedJob((prev) => prev && prev.id === id ? { ...prev, status: 'APPLIED' } : prev);
          
          setApplyState('SUCCESS');
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const getStatusConfig = (status: JobPosting['status']) => {
    switch (status) {
      case 'SHORTLISTED':
        return { bg: '#ECFDF5', text: '#10B981', label: 'Shortlisted 🎉' };
      case 'APPLIED':
        return { bg: '#EFF6FF', text: '#3B82F6', label: 'Applied' };
      case 'NOT_ELIGIBLE':
        return { bg: '#FEF2F2', text: '#EF4444', label: 'Not Eligible' };
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Placement Cell" />

      {/* Segmented Tab Headers */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'DRIVES' && styles.tabBtnActive]}
          onPress={() => setActiveTab('DRIVES')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'DRIVES' && styles.tabBtnTextActive]}>
            Active Drives
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === 'APPLIED' && styles.tabBtnActive]}
          onPress={() => setActiveTab('APPLIED')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'APPLIED' && styles.tabBtnTextActive]}>
            My Applications
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Placement Statistics Banner */}
        {activeTab === 'DRIVES' && (
          <CampusCard style={[styles.card, styles.statsSummaryCard]} borderColor={Colors.AppOutline} elevation="sm">
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.statsRow}>
              <View style={styles.statsCol}>
                <Text style={styles.statsNum}>{jobPostings.length}</Text>
                <Text style={styles.statsLabel}>Total Drives</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsCol}>
                <Text style={styles.statsNum}>
                  {jobPostings.filter(j => j.status === 'APPLIED' || j.status === 'SHORTLISTED').length}
                </Text>
                <Text style={styles.statsLabel}>Applied</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsCol}>
                <Text style={[styles.statsNum, { color: '#10B981' }]}>
                  {jobPostings.filter(j => j.status === 'SHORTLISTED').length}
                </Text>
                <Text style={styles.statsLabel}>Shortlisted</Text>
              </View>
            </View>
          </CampusCard>
        )}

        {/* Drives List */}
        <SectionHeader title={activeTab === 'DRIVES' ? 'Open Recruitment Drives' : 'Applied Applications'} />
        
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Briefcase size={36} color="#94A3B8" />
            <Text style={styles.emptyText}>No applications found in this category.</Text>
          </View>
        ) : (
          filteredJobs.map((job) => {
            const statusConfig = getStatusConfig(job.status);
            const logoInitial = job.companyName ? job.companyName[0] : 'C';

            return (
              <CampusCard key={job.id} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                <Pressable style={styles.jobPressable} onPress={() => setSelectedJob(job)}>
                  <View style={styles.cardHeader}>
                    <View style={styles.companyLogoBox}>
                      <Text style={styles.companyLogoText}>{logoInitial}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.companyName}>{job.companyName}</Text>
                      <Text style={styles.jobRole} numberOfLines={1}>{job.role}</Text>
                    </View>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>

                  <View style={styles.specsGrid}>
                    <View style={styles.specsRow}>
                      <Award size={13} color="#64748B" />
                      <Text style={styles.specsText}>{job.packageText}</Text>
                    </View>
                    <View style={styles.specsRow}>
                      <MapPin size={13} color="#64748B" />
                      <Text style={styles.specsText}>{job.location}</Text>
                    </View>
                    <View style={styles.specsRow}>
                      <Calendar size={13} color="#64748B" />
                      <Text style={styles.specsText}>Apply before: {job.deadline}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooter}>
                    <View style={styles.eligibilityRow}>
                      <Sparkles size={11} color="#0D9488" style={{ marginRight: 4, marginTop: 1 }} />
                      <Text style={styles.eligibilityText} numberOfLines={2}>
                        Requires {job.eligibility}
                      </Text>
                    </View>

                    <View style={styles.statusRowBottom}>
                      {statusConfig ? (
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                          <Text style={[styles.statusText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                          <Text style={[styles.statusText, { color: '#475569' }]}>Eligibility Open</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              </CampusCard>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── JOB DETAILS SHEET MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedJob !== null}
        onRequestClose={() => setSelectedJob(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {selectedJob && (
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Header Banner */}
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalLogoBox}>
                    <Building size={24} color={Colors.BluePrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCompanyName}>{selectedJob.companyName}</Text>
                    <Text style={styles.modalJobRole}>{selectedJob.role}</Text>
                  </View>
                </View>

                {/* Specs list */}
                <View style={styles.detailsSheet}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Annual Package</Text>
                    <Text style={styles.detailsVal}>{selectedJob.packageText}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Job Location</Text>
                    <Text style={styles.detailsVal}>{selectedJob.location}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Apply Deadline</Text>
                    <Text style={styles.detailsVal}>{selectedJob.deadline}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Required Eligibility</Text>
                    <Text style={[styles.detailsVal, { color: '#0D9488' }]}>{selectedJob.eligibility}</Text>
                  </View>
                </View>

                {/* Job Rounds and Recruitment Timeline */}
                <Text style={styles.sectionTitle}>Interview Process Rounds</Text>
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineKnot, { backgroundColor: Colors.BluePrimary }]}>
                      <Text style={styles.timelineNum}>1</Text>
                    </View>
                    <View style={styles.timelineInfo}>
                      <Text style={styles.timelineTitle}>Online Assessment (OA)</Text>
                      <Text style={styles.timelineDesc}>90 minutes analytical, coding and MCQ rounds on core subjects.</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineKnot}>
                      <Text style={styles.timelineNum}>2</Text>
                    </View>
                    <View style={styles.timelineInfo}>
                      <Text style={styles.timelineTitle}>Technical Rounds (DSA & Live Coding)</Text>
                      <Text style={styles.timelineDesc}>Interviews covering Data Structures, Web concepts, and live coding exercises.</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineKnot}>
                      <Text style={styles.timelineNum}>3</Text>
                    </View>
                    <View style={styles.timelineInfo}>
                      <Text style={styles.timelineTitle}>Managerial & System Design</Text>
                      <Text style={styles.timelineDesc}>Discussion on academic project architecture, system design and problem solving.</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineKnot}>
                      <Text style={styles.timelineNum}>4</Text>
                    </View>
                    <View style={styles.timelineInfo}>
                      <Text style={styles.timelineTitle}>HR & Offer Discussions</Text>
                      <Text style={styles.timelineDesc}>Final cultural compatibility round and details on onboarding steps.</Text>
                    </View>
                  </View>
                </View>

                {/* CTA Buttons */}
                <View style={{ gap: 10, marginTop: 14 }}>
                  {selectedJob.status === 'APPLY' && (
                    <Pressable
                      style={[styles.portalBtn, styles.portalBtnPrimary]}
                      onPress={() => handleApplyProcess(selectedJob.id)}
                    >
                      <Text style={styles.portalBtnTextPrimary}>Apply for Drive</Text>
                    </Pressable>
                  )}

                  {selectedJob.status === 'APPLIED' && (
                    <View style={styles.appliedConfirmationBox}>
                      <BadgeCheck size={16} color="#3B82F6" />
                      <Text style={styles.appliedConfirmationText}>
                        Profile Submitted • Awaiting Placement Cell Review
                      </Text>
                    </View>
                  )}

                  {selectedJob.status === 'SHORTLISTED' && (
                    <View style={[styles.appliedConfirmationBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                      <BadgeCheck size={16} color="#10B981" />
                      <Text style={[styles.appliedConfirmationText, { color: '#065F46' }]}>
                        Shortlisted 🎉 Check your registered mail for OA invitation links!
                      </Text>
                    </View>
                  )}

                  {selectedJob.status === 'NOT_ELIGIBLE' && (
                    <View style={[styles.appliedConfirmationBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                      <Text style={[styles.appliedConfirmationText, { color: '#B91C1C' }]}>
                        You do not meet the minimum CGPA / stream criteria set by {selectedJob.companyName}.
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={[styles.portalBtn, { backgroundColor: '#F1F5F9' }]}
                    onPress={() => setSelectedJob(null)}
                  >
                    <Text style={[styles.portalBtnTextPrimary, { color: '#475569' }]}>Close details</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── PLACEMENT APPLICATION PROGRESS LOADER ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={applyState !== 'IDLE'}
        onRequestClose={() => setApplyState('IDLE')}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {applyState !== 'SUCCESS' ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                <Text style={styles.progressTitle}>Submitting Placement Profile</Text>
                
                {applyState === 'LOADING_PROFILE' && (
                  <Text style={styles.progressMessage}>Syncing student academics profile & CGPA transcript...</Text>
                )}
                {applyState === 'LOADING_RESUME' && (
                  <Text style={styles.progressMessage}>Bundling official CV document (MUC-RESUME-2026.pdf)...</Text>
                )}
                {applyState === 'SUBMITTING' && (
                  <Text style={styles.progressMessage}>Submitting profile credentials to Corporate Recruitment portal...</Text>
                )}
              </View>
            ) : (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#E6FBF3' }]}>
                  <CheckCircle size={30} color="#10B981" />
                </View>
                <Text style={styles.progressTitle}>Application Submitted!</Text>
                <Text style={styles.progressMessage}>
                  Your profile and verified academic records have been successfully shared with {selectedJob?.companyName}.
                </Text>
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%', flex: 0 }]}
                  onPress={() => {
                    setApplyState('IDLE');
                    setSelectedJob(null); // Close the detail sheet too
                  }}
                >
                  <Text style={styles.portalBtnTextPrimary}>Great, Thank You</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9', // Slate-100
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  tabBtnTextActive: {
    color: Colors.BluePrimary,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  card: { marginBottom: 16 },

  // Stats Card with Circles Decal
  statsSummaryCard: {
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  decorCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  decorCircle2: {
    position: 'absolute',
    left: -50,
    bottom: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statsCol: { alignItems: 'center' },
  statsNum: { fontSize: 22, fontWeight: '900', color: Colors.BluePrimary },
  statsLabel: { fontSize: 11, fontWeight: '600', color: Colors.AppOnSurfaceVariant, marginTop: 4 },
  statsDivider: { width: 1, height: 28, backgroundColor: Colors.AppOutline },

  // Job item styles
  jobPressable: { padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  companyLogoBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  companyLogoText: { fontSize: 18, fontWeight: '900', color: Colors.BluePrimary },
  companyName: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  jobRole: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '600' },
  specsGrid: { marginTop: 12, gap: 6 },
  specsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specsText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 12 },
  cardFooter: { gap: 8 },
  eligibilityRow: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 8 },
  eligibilityText: { fontSize: 11, fontWeight: '600', color: '#0D9488', flex: 1, lineHeight: 15 },
  statusRowBottom: { flexDirection: 'row', justifyContent: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  // Modals overlays
  portalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  portalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalLogoBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  modalCompanyName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  modalJobRole: { fontSize: 13, color: Colors.BluePrimary, fontWeight: '700', marginTop: 2 },
  
  // Details list layout
  detailsSheet: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 6,
    gap: 12,
  },
  detailsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flexShrink: 0,
    width: '40%',
  },
  detailsVal: {
    flex: 1,
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 10, letterSpacing: 0.5 },

  // Timeline interview process
  timelineContainer: { paddingLeft: 8, marginVertical: 8 },
  timelineItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  timelineKnot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineNum: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  timelineInfo: { flex: 1, paddingBottom: 6 },
  timelineTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  timelineDesc: { fontSize: 10, color: '#64748B', marginTop: 2, lineHeight: 14 },
  timelineLine: { width: 2, height: 16, backgroundColor: '#CBD5E1', marginLeft: 9, marginVertical: -2 },

  // CTAs
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  
  appliedConfirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginVertical: 4,
  },
  appliedConfirmationText: { fontSize: 11, color: Colors.BluePrimary, fontWeight: '700', flex: 1, lineHeight: 16 },

  // Loader animation screen
  progressTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  progressMessage: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, fontWeight: '600', textAlign: 'center' },
});
