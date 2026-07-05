import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { CampusCard, StatusChip, PageHeader } from '../../components';
import { Colors } from '../../theme';
import {
  Paperclip,
  ChevronRight,
  Download,
  BadgeCheck,
  FileText,
  Calendar,
} from 'lucide-react-native';
import { AnnouncementCategory } from '../../types';

const FILTERS: Array<{ label: string; value: AnnouncementCategory | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Exams', value: 'EXAMS' },
  { label: 'Placements', value: 'PLACEMENTS' },
  { label: 'Scholarships', value: 'SCHOLARSHIPS' },
  { label: 'Library', value: 'LIBRARY' },
];



export const AnnouncementsScreen: React.FC = () => {
  const router = useRouter();
  const { announcements } = useCampusStore();
  const [activeFilter, setActiveFilter] = useState<AnnouncementCategory | 'ALL'>('ALL');

  // Interactive modal states
  const [selectedAnn, setSelectedAnn] = useState<any | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filtered =
    activeFilter === 'ALL'
      ? announcements
      : announcements.filter((a) => a.category === activeFilter);

  const handleAttachmentDownload = (fileName: string) => {
    setDownloadingFile(fileName);
    setDownloadSuccess(false);
    setTimeout(() => {
      setDownloadingFile(null);
      setDownloadSuccess(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Circulars" />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => {
          const active = f.value === activeFilter;
          return (
            <Pressable
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              style={[styles.filterChip, active && styles.activeFilterChip]}
            >
              <Text style={[styles.filterLabel, active && styles.activeFilterLabel]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((ann) => (
          <CampusCard
            key={ann.id}
            borderColor={ann.isImportant ? Colors.BluePrimary : Colors.AppOutline}
            style={styles.annCard}
            elevation="sm"
            onPress={() => setSelectedAnn(ann)}
          >
            {/* Header row */}
            <View style={styles.annHeader}>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{ann.initials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.chipRow}>
                  <StatusChip text={ann.category} level={ann.category} />
                  {ann.isImportant && (
                    <Text style={styles.importantBadge}> • IMPORTANT</Text>
                  )}
                </View>
                <Text style={styles.authorText}>{ann.author}</Text>
              </View>
              <Text style={styles.dateText}>{ann.dateText}</Text>
            </View>



            {/* Title & summary */}
            <Text style={styles.annTitle} numberOfLines={2}>{ann.title}</Text>
            <Text style={styles.annSummary} numberOfLines={3}>{ann.summary}</Text>

            {/* Attachment */}
            {ann.attachmentName && (
              <Pressable
                style={styles.attachment}
                onPress={() => handleAttachmentDownload(ann.attachmentName!)}
              >
                <Paperclip size={14} color={Colors.BluePrimary} />
                <Text style={styles.attachmentText}>{ann.attachmentName}</Text>
              </Pressable>
            )}

            {/* Read More */}
            <View style={styles.readMoreRow}>
              <Text style={styles.readMoreText}>Read More</Text>
              <ChevronRight size={16} color={Colors.BluePrimary} />
            </View>
          </CampusCard>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── DETAIL MODAL FOR CIRCULARS ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedAnn !== null}
        onRequestClose={() => setSelectedAnn(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {selectedAnn && (
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Header info */}
                <View style={styles.modalAnnHeader}>
                  <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{selectedAnn.initials}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.authorText}>{selectedAnn.author}</Text>
                    <Text style={styles.dateText}>{selectedAnn.dateText} • Circular ID: #{selectedAnn.id}</Text>
                  </View>
                </View>

                {/* Sub row with categories */}
                <View style={[styles.chipRow, { marginVertical: 10 }]}>
                  <StatusChip text={selectedAnn.category} level={selectedAnn.category} />
                  {selectedAnn.isImportant && (
                    <Text style={[styles.importantBadge, { marginLeft: 8 }]}>IMPORTANT NOTICE</Text>
                  )}
                </View>

                {/* Title */}
                <Text style={styles.modalTitle}>{selectedAnn.title}</Text>

                {/* Full Body Text */}
                <Text style={styles.modalBodyText}>{selectedAnn.summary}</Text>



                {/* Attachment Section */}
                {selectedAnn.attachmentName && (
                  <View style={styles.modalAttachmentBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <FileText size={18} color={Colors.BluePrimary} />
                      <Text style={styles.modalAttachmentText} numberOfLines={1}>
                        {selectedAnn.attachmentName}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.modalDownloadIconBtn}
                      onPress={() => handleAttachmentDownload(selectedAnn.attachmentName!)}
                    >
                      <Download size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}

                {/* Action button */}
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { marginTop: 16 }]}
                  onPress={() => setSelectedAnn(null)}
                >
                  <Text style={styles.portalBtnTextPrimary}>Dismiss Circular</Text>
                </Pressable>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── PDF DOWNLOAD LOADER MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={downloadingFile !== null || downloadSuccess}
        onRequestClose={() => {
          setDownloadingFile(null);
          setDownloadSuccess(false);
        }}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContentOverlay}>
            {downloadingFile !== null && (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                <Text style={styles.progressTitle}>Downloading Attachment</Text>
                <Text style={styles.progressMessage}>
                  Retrieving "{downloadingFile}" from academic notice board archives...
                </Text>
              </View>
            )}
            {downloadSuccess && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#E6FBF3' }]}>
                  <BadgeCheck size={30} color="#10B981" />
                </View>
                <Text style={styles.progressTitle}>Attachment Saved</Text>
                <Text style={styles.progressMessage}>
                  The file has been successfully downloaded and stored in your device Downloads directory.
                </Text>
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%' }]}
                  onPress={() => setDownloadSuccess(false)}
                >
                  <Text style={styles.portalBtnTextPrimary}>OK</Text>
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
  filterScroll: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  activeFilterChip: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
    shadowColor: Colors.BluePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterLabel: { fontSize: 13, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  activeFilterLabel: { color: '#FFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  annCard: { marginBottom: 14, backgroundColor: '#FFFFFF' },
  annHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 14, fontWeight: '700', color: Colors.BluePrimary },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  importantBadge: { fontSize: 11, color: Colors.RedError, fontWeight: '900' },
  authorText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: '700' },
  dateText: { fontSize: 11, color: Colors.AppOnSurfaceVariant + 'B3', fontWeight: '500' },
  annTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 6 },
  annSummary: { fontSize: 13, color: Colors.AppOnSurfaceVariant, lineHeight: 18, fontWeight: '500' },
  posterImage: {
    width: '100%',
    height: 155,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: Colors.BluePrimaryContainer + '66', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  attachmentText: { fontSize: 12, color: Colors.BluePrimary, fontWeight: '700' },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 },
  readMoreText: { fontSize: 13, fontWeight: '700', color: Colors.BluePrimary },

  // Modals layouts
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
  portalContentOverlay: {
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
  modalAnnHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginVertical: 12 },
  modalBodyText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  modalPosterImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },

  // Modal attachments
  modalAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  modalAttachmentText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  modalDownloadIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.BluePrimary, alignItems: 'center', justifyContent: 'center' },

  // CTAs
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Progress loaders
  progressTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  progressMessage: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
