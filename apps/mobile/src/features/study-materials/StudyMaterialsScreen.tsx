import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader, CampusCard } from '../../components';
import { Colors } from '../../theme';
import { mockStudyMaterials } from '../../data/mockData';
import { StudyMaterial } from '../../types';
import {
  BookOpen,
  Download,
  Check,
  FileText,
  Search,
  Folder,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CustomAlertConfig {
  visible: boolean;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'CONFIRM';
  onConfirm?: () => void;
}

export const StudyMaterialsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    'Database Management System': true, // Expand DBMS by default
  });

  // Custom alert state
  const [customAlert, setCustomAlert] = useState<CustomAlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'SUCCESS',
  });

  // Filter logic based on search
  const filteredMaterials = mockStudyMaterials.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group materials by subject
  const subjectsMap: Record<string, StudyMaterial[]> = {};
  filteredMaterials.forEach((item) => {
    if (!subjectsMap[item.subjectName]) {
      subjectsMap[item.subjectName] = [];
    }
    subjectsMap[item.subjectName].push(item);
  });

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }));
  };

  const isSubjectExpanded = (subject: string) => {
    if (searchQuery.length > 0) return true; // Auto-expand all when searching
    return !!expandedSubjects[subject];
  };

  const handleDownload = (id: string, title: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadedIds((prev) => [...prev, id]);
      setDownloadingId(null);
      setCustomAlert({
        visible: true,
        title: 'Download Complete',
        message: `"${title}" has been saved to your downloads and is now available offline.`,
        type: 'SUCCESS',
      });
    }, 1200);
  };

  const handleCardPress = (file: StudyMaterial) => {
    const isDownloaded = downloadedIds.includes(file.id);
    if (isDownloaded) {
      setCustomAlert({
        visible: true,
        title: 'Open Material',
        message: `Opening "${file.title}" (${file.fileSize}) in your device viewer.`,
        type: 'SUCCESS',
      });
    } else {
      setCustomAlert({
        visible: true,
        title: 'Download Required',
        message: `Would you like to download "${file.title}" for offline viewing?`,
        type: 'CONFIRM',
        onConfirm: () => handleDownload(file.id, file.title),
      });
    }
  };

  const getFileIconConfig = (type: string) => {
    const normType = type.toUpperCase();
    if (normType === 'PDF') {
      return { bg: '#FEF2F2', color: '#EF4444' };
    } else if (normType.startsWith('PPT')) {
      return { bg: '#FFFBEB', color: '#F59E0B' };
    } else if (normType.startsWith('DOC')) {
      return { bg: '#EFF6FF', color: '#3B82F6' };
    } else {
      return { bg: '#F5F3FF', color: '#8B5CF6' };
    }
  };

  const getSubjectColor = (subject: string) => {
    const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: '#EFF6FF', icon: '#3B82F6' }, // Blue
      { bg: '#F5F3FF', icon: '#8B5CF6' }, // Purple
      { bg: '#ECFDF5', icon: '#10B981' }, // Green
      { bg: '#FEF3C7', icon: '#F59E0B' }, // Yellow/Orange
    ];
    return colors[hash % colors.length];
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Study Materials" />

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={Colors.AppOnSurfaceVariant} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials, subjects..."
            placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Main Content List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(subjectsMap).length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={48} color={Colors.AppOnSurfaceVariant} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyText}>No materials found matching your search</Text>
          </View>
        ) : (
          Object.keys(subjectsMap).map((subjectName) => {
            const isExpanded = isSubjectExpanded(subjectName);
            const files = subjectsMap[subjectName];
            const colors = getSubjectColor(subjectName);

            return (
              <View key={subjectName} style={styles.subjectGroup}>
                {/* Subject Folder Accordion Header */}
                <Pressable
                  onPress={() => toggleSubject(subjectName)}
                  style={({ pressed }) => [
                    styles.folderHeader,
                    isExpanded && styles.folderHeaderExpanded,
                    pressed && styles.folderHeaderPressed,
                  ]}
                >
                  <View style={[styles.folderIconBox, { backgroundColor: colors.bg }]}>
                    <Folder size={22} color={colors.icon} fill={isExpanded ? colors.icon : 'none'} />
                  </View>
                  <View style={styles.folderMeta}>
                    <Text style={styles.folderTitle}>{subjectName}</Text>
                    <Text style={styles.folderSubtitle}>{files.length} {files.length === 1 ? 'file' : 'files'} available</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color={Colors.AppOnSurfaceVariant} />
                  ) : (
                    <ChevronDown size={20} color={Colors.AppOnSurfaceVariant} />
                  )}
                </Pressable>

                {/* Subject Files List */}
                {isExpanded && (
                  <View style={styles.filesContainer}>
                    {files.map((file, index) => {
                      const isDownloading = downloadingId === file.id;
                      const isDownloaded = downloadedIds.includes(file.id);
                      const iconConfig = getFileIconConfig(file.fileType);
                      const isLast = index === files.length - 1;

                      return (
                        <Pressable
                          key={file.id}
                          onPress={() => handleCardPress(file)}
                          style={({ pressed }) => [
                            styles.fileRow,
                            pressed && styles.fileRowPressed,
                            !isLast && styles.fileRowBorder,
                          ]}
                        >
                          {/* File Icon Box */}
                          <View style={[styles.fileIconBox, { backgroundColor: iconConfig.bg }]}>
                            <FileText size={18} color={iconConfig.color} />
                          </View>

                          {/* File Metadata */}
                          <View style={styles.fileMeta}>
                            <Text style={styles.fileTitle} numberOfLines={2}>
                              {file.title}
                            </Text>
                            <Text style={styles.fileDetails}>
                              {file.unit ? `${file.unit} • ` : ''}{file.fileType.toUpperCase()} • {file.fileSize} • {file.uploadedDate}
                            </Text>
                          </View>

                          {/* Download Button */}
                          <Pressable
                            disabled={isDownloading || isDownloaded}
                            onPress={() => handleDownload(file.id, file.title)}
                            style={[
                              styles.downloadBtn,
                              isDownloaded && styles.downloadBtnSuccess,
                              isDownloading && styles.downloadBtnActive,
                            ]}
                          >
                            {isDownloading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : isDownloaded ? (
                              <Check size={14} color="#FFFFFF" strokeWidth={3} />
                            ) : (
                              <Download size={14} color={Colors.BluePrimary} />
                            )}
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Premium Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={customAlert.visible}
        onRequestClose={() => setCustomAlert((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContent}>
            {/* Top Icon Box */}
            <View
              style={[
                styles.alertIconBox,
                {
                  backgroundColor:
                    customAlert.type === 'SUCCESS'
                      ? '#E6FBF3'
                      : customAlert.type === 'CONFIRM'
                      ? '#EFF6FF'
                      : '#FFFBEB',
                },
              ]}
            >
              {customAlert.type === 'SUCCESS' ? (
                <CheckCircle size={28} color="#10B981" />
              ) : (
                <BookOpen size={28} color={Colors.BluePrimary} />
              )}
            </View>

            <Text style={styles.alertTitle}>{customAlert.title}</Text>
            <Text style={styles.alertMessage}>{customAlert.message}</Text>

            {/* Action Buttons */}
            <View style={styles.alertActionRow}>
              {customAlert.type === 'CONFIRM' ? (
                <>
                  <Pressable
                    style={[styles.alertBtn, styles.alertBtnSecondary]}
                    onPress={() => setCustomAlert((prev) => ({ ...prev, visible: false }))}
                  >
                    <Text style={styles.alertBtnTextSecondary}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.alertBtn, styles.alertBtnPrimary]}
                    onPress={() => {
                      setCustomAlert((prev) => ({ ...prev, visible: false }));
                      if (customAlert.onConfirm) customAlert.onConfirm();
                    }}
                  >
                    <Text style={styles.alertBtnTextPrimary}>Download</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={[styles.alertBtn, styles.alertBtnPrimary, { flex: 0, width: '100%' }]}
                  onPress={() => setCustomAlert((prev) => ({ ...prev, visible: false }))}
                >
                  <Text style={styles.alertBtnTextPrimary}>OK</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' }, // Light slate background
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Clean soft gray background
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.AppOnBackground,
    paddingVertical: 0,
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  subjectGroup: {
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  folderHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  folderHeaderPressed: {
    backgroundColor: '#F8FAFC',
  },
  folderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  folderMeta: { flex: 1, marginRight: 8 },
  folderTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', lineHeight: 20 },
  folderSubtitle: { fontSize: 11, color: '#64748B', marginTop: 3, fontWeight: '600' },
  filesContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  fileRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fileRowPressed: {
    backgroundColor: '#F8FAFC',
  },
  fileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileMeta: { flex: 1, marginRight: 8 },
  fileTitle: { fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 18 },
  fileDetails: { fontSize: 10, color: '#64748B', marginTop: 5, fontWeight: '500' },
  downloadBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.BluePrimaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnActive: { backgroundColor: Colors.BluePrimary },
  downloadBtnSuccess: { backgroundColor: '#10B981' }, // Emerald green
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 14, color: '#64748B', fontWeight: '600', marginTop: 12 },

  // Custom Alert Modal Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Faded slate backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  alertIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  alertActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBtnPrimary: {
    backgroundColor: Colors.BluePrimary,
  },
  alertBtnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  alertBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  alertBtnTextSecondary: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
