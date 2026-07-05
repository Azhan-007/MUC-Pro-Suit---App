import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader, CampusCard, CustomButton } from '../../components';
import { Colors } from '../../theme';
import { mockCertificateRequests } from '../../data/mockData';
import { CertificateRequest } from '../../types';
import {
  FileText,
  Clock,
  FileDown,
  CheckCircle,
  Plus,
  Send,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react-native';

const CERTIFICATE_TYPES = [
  'Bonafide Certificate',
  'Transfer Certificate (TC)',
  'Attendance Certificate',
  'Course Completion Certificate',
];

export const RequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>(mockCertificateRequests);
  const [selectedCert, setSelectedCert] = useState(CERTIFICATE_TYPES[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Custom Alert States
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'SUCCESS' | 'ERROR';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'ERROR',
  });

  // Custom Download states
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Required Field Missing',
        message: 'Please provide a clear reason or purpose for requesting this certificate.',
        type: 'ERROR',
      });
      return;
    }

    setSubmitting(true);
    setShowDropdown(false);
    setTimeout(() => {
      const newRequest: CertificateRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        certificateType: selectedCert,
        reason: reason.trim(),
        submittedDate: 'Today',
        status: 'PENDING',
      };
      setRequests((prev) => [newRequest, ...prev]);
      setReason('');
      setSubmitting(false);
      setAlertConfig({
        visible: true,
        title: 'Request Submitted',
        message: 'Your certificate request has been logged and sent to the academic registrar office for approval.',
        type: 'SUCCESS',
      });
    }, 1200);
  };

  const handleCertDownload = (id: string) => {
    setDownloadingCertId(id);
    setDownloadSuccess(false);
    
    // Simulate premium mobile-styled download
    setTimeout(() => {
      setDownloadingCertId(null);
      setDownloadSuccess(true);
    }, 2000);
  };

  const getStatusColor = (status: CertificateRequest['status']) => {
    switch (status) {
      case 'ISSUED':
        return { bg: '#ECFDF5', text: '#10B981', label: 'Issued' };
      case 'APPROVED':
        return { bg: '#EFF6FF', text: '#3B82F6', label: 'Approved' };
      case 'PENDING':
      default:
        return { bg: '#FFFBEB', text: '#D97706', label: 'Pending' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Certificates & Requests" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <CampusCard style={styles.formCard} elevation="sm">
          <Text style={styles.formTitle}>New Certificate Request</Text>

          {/* Certificate selector */}
          <Text style={styles.inputLabel}>Certificate Type</Text>
          <Pressable onPress={() => setShowDropdown(!showDropdown)} style={styles.dropdownBtn}>
            <Text style={styles.dropdownText}>{selectedCert}</Text>
            <Plus size={16} color={Colors.BluePrimary} style={{ transform: [{ rotate: showDropdown ? '45deg' : '0deg' }] }} />
          </Pressable>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              {CERTIFICATE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => {
                    setSelectedCert(type);
                    setShowDropdown(false);
                  }}
                  style={styles.dropdownOption}
                >
                  <Text style={styles.optionText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Reason input */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Reason / Purpose</Text>
          <TextInput
            placeholder="Explain why you need this certificate..."
            value={reason}
            onChangeText={setReason}
            style={styles.textInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={{ height: 16 }} />

          {submitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.BluePrimary} />
              <Text style={styles.loadingText}>Submitting request...</Text>
            </View>
          ) : (
            <CustomButton
              text="Submit Request"
              onPress={handleSubmit}
              fullWidth
              leadingIcon={<Send size={16} color="#FFFFFF" />}
            />
          )}
        </CampusCard>

        {/* Requests History */}
        <Text style={styles.sectionTitle}>Request History</Text>

        <View style={{ gap: 12 }}>
          {requests.map((item) => {
            const statusConfig = getStatusColor(item.status);

            return (
              <CampusCard key={item.id} borderColor={Colors.AppOutline} style={styles.historyCard} elevation="sm">
                <View style={styles.historyHeader}>
                  <FileText size={20} color={Colors.BluePrimary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.certType}>{item.certificateType}</Text>
                    <Text style={styles.requestId}>Req ID: {item.id} • Submitted: {item.submittedDate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
                  </View>
                </View>

                <Text style={styles.reasonText}>Reason: "{item.reason}"</Text>

                {item.status === 'ISSUED' && item.downloadUrl && (
                  <Pressable
                    onPress={() => handleCertDownload(item.id)}
                    style={({ pressed }) => [
                      styles.downloadBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <FileDown size={14} color="#059669" />
                    <Text style={styles.downloadText}>Download Certificate (PDF)</Text>
                  </Pressable>
                )}

                {item.status === 'PENDING' && (
                  <View style={styles.pendingIndicator}>
                    <Clock size={12} color="#D97706" />
                    <Text style={styles.pendingText}>Under review. Usually takes 2-3 working days.</Text>
                  </View>
                )}
              </CampusCard>
            );
          })}
        </View>
      </ScrollView>

      {/* ── CUSTOM ALERT DIALOG MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertConfig.visible}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            <View style={[styles.modalIconBox, { backgroundColor: alertConfig.type === 'SUCCESS' ? '#E6FBF3' : '#FEF2F2' }]}>
              {alertConfig.type === 'SUCCESS' ? (
                <BadgeCheck size={28} color="#10B981" />
              ) : (
                <AlertCircle size={28} color="#EF4444" />
              )}
            </View>

            <Text style={styles.portalTitle}>{alertConfig.title}</Text>
            <Text style={styles.portalMessage}>{alertConfig.message}</Text>

            <Pressable
              style={[styles.portalBtn, alertConfig.type === 'SUCCESS' ? styles.portalBtnPrimary : styles.portalBtnError, { width: '100%' }]}
              onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.portalBtnTextPrimary}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── PDF DOWNLOAD LOADER MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={downloadingCertId !== null || downloadSuccess}
        onRequestClose={() => {
          setDownloadingCertId(null);
          setDownloadSuccess(false);
        }}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {downloadingCertId !== null && (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                <Text style={styles.portalTitle}>Downloading Certificate</Text>
                <Text style={styles.portalMessage}>
                  Retrieving official signed document from college registrar archives...
                </Text>
              </View>
            )}
            {downloadSuccess && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#E6FBF3' }]}>
                  <BadgeCheck size={30} color="#10B981" />
                </View>
                <Text style={styles.portalTitle}>Download Complete</Text>
                <Text style={styles.portalMessage}>
                  The certificate PDF file has been securely saved to your local device Downloads directory.
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  formCard: { backgroundColor: '#FFFFFF', marginBottom: 20, padding: 16 },
  formTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  dropdownText: { fontSize: 14, fontWeight: '600', color: Colors.AppOnBackground },
  dropdownMenu: { borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, backgroundColor: '#FFFFFF', marginTop: 4, overflow: 'hidden' },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline },
  optionText: { fontSize: 14, color: Colors.AppOnBackground, fontWeight: '500' },
  textInput: { borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.AppOnBackground, minHeight: 80, fontWeight: '500' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
  loadingText: { fontSize: 12, fontWeight: '600', color: Colors.BluePrimary },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 12 },
  historyCard: { backgroundColor: '#FFFFFF', padding: 14, marginBottom: 12 },
  historyHeader: { flexDirection: 'row', alignItems: 'center' },
  certType: { fontSize: 14, fontWeight: '800', color: Colors.AppOnBackground },
  requestId: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  reasonText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 12, fontStyle: 'italic', fontWeight: '500' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderLeftWidth: 3, borderLeftColor: '#10B981', borderRadius: 6, padding: 10, marginTop: 12, alignSelf: 'flex-start' },
  downloadText: { fontSize: 11, color: '#065F46', fontWeight: '700' },
  pendingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  pendingText: { fontSize: 11, color: '#D97706', fontWeight: '600' },

  // Portal Modals style
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
  portalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 6 },
  portalMessage: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20, fontWeight: '500' },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  // CTAs
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnError: { backgroundColor: '#EF4444' },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
