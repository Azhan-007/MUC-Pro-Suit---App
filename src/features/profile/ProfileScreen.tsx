import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { CampusCard, CustomButton } from '../../components';
import { Colors } from '../../theme';
import {
  User,
  Users,
  Landmark,
  GraduationCap,
  Settings,
  Info,
  Power,
  ChevronRight,
  ArrowLeft,
  Award,
  IdCard,
} from 'lucide-react-native';

const ModalRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.modalRow}>
    <Text style={styles.modalRowLabel}>{label}</Text>
    <Text style={styles.modalRowValue}>{value}</Text>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { student, logout } = useAuthStore();
  const [activeModal, setActiveModal] = React.useState<
    'PERSONAL' | 'PARENTS' | 'BANK' | 'ADMISSION' | 'ACCOUNT' | 'ABOUT' | null
  >(null);
  const [showIdCard, setShowIdCard] = React.useState(false);

  if (!student) return null;
  const initial = student.name[0];

  const getModalTitle = (type: string) => {
    switch (type) {
      case 'PERSONAL': return 'Personal Details';
      case 'PARENTS': return 'Parents & Guardian Details';
      case 'BANK': return 'Bank Account Details';
      case 'ADMISSION': return 'Admission Details';
      case 'ACCOUNT': return 'Account Details';
      case 'ABOUT': return 'About App';
      default: return '';
    }
  };

  const renderModalContent = (type: string) => {
    switch (type) {
      case 'PERSONAL':
        return (
          <View style={styles.modalItemsList}>
            <ModalRow label="Date of Birth" value={student.dob} />
            <ModalRow label="Gender" value={student.gender} />
            <ModalRow label="Blood Group" value={student.bloodGroup} />
            <ModalRow label="Permanent Address" value={student.permanentAddress} />
          </View>
        );
      case 'PARENTS':
        return (
          <View style={styles.modalItemsList}>
            <ModalRow label="Father's Name" value={student.fatherName} />
            <ModalRow label="Mother's Name" value={student.motherName} />
            <ModalRow label="Emergency Contact" value={student.emergencyContact} />
          </View>
        );
      case 'BANK':
        return (
          <View style={styles.modalItemsList}>
            <ModalRow label="Bank Name" value="State Bank of India (SBI)" />
            <ModalRow label="Account Number" value="•••• •••• 4910" />
            <ModalRow label="IFSC Code" value="SBIN0001048" />
            <ModalRow label="Branch" value="Campus Extension Branch" />
          </View>
        );
      case 'ADMISSION':
        return (
          <View style={styles.modalItemsList}>
            <ModalRow label="Department" value={student.department} />
            <ModalRow label="Admission No" value="710/24-25" />
            <ModalRow label="Register No" value={student.registerNumber} />
            <ModalRow label="Batch" value={student.batch} />
            <ModalRow label="Semester" value={student.semester} />
          </View>
        );
      case 'ACCOUNT':
        return (
          <View style={styles.modalItemsList}>
            <ModalRow label="Email Address" value={student.email} />
            <ModalRow label="Mobile Number" value={student.mobile} />
            <ModalRow label="Username" value={student.registerNumber} />
          </View>
        );
      case 'ABOUT':
        return (
          <View style={styles.modalItemsList}>
            <ModalRow label="App Name" value="MUC Pro Suit" />
            <ModalRow label="Version" value="1.0" />
            <ModalRow label="Build" value="102" />
            <ModalRow label="Powered by" value="Aziron Tech Private Ltd" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Page Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={() => setShowIdCard(true)} style={styles.filterBtn}>
          <IdCard size={20} color={Colors.AppOnBackground} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Centered Hero Card ── */}
        <CampusCard style={styles.heroCard}>
          <View style={styles.heroCenterContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.heroName}>{student.name}</Text>
            <Text style={styles.heroCollege}>Mazharul Uloom College (Autonomous), Ambur</Text>
            <Text style={styles.heroDept}>{student.department}</Text>
            <Text style={styles.heroMeta}>Register No : {student.registerNumber}</Text>
            <Text style={styles.heroMeta}>Admission No : 710/24-25</Text>
          </View>
        </CampusCard>

        {/* ── Main Details List Card ── */}
        <CampusCard style={styles.menuCard} elevation="sm">
          {/* Personal Details */}
          <Pressable
            onPress={() => setActiveModal('PERSONAL')}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuIconCircle}>
              <User size={20} color={Colors.BluePrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Personal Details</Text>
              <Text style={styles.menuSubtitle}>DOB, Gender, Address</Text>
            </View>
            <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} />
          </Pressable>

          {/* Parents & Guardian Details */}
          <Pressable
            onPress={() => setActiveModal('PARENTS')}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuIconCircle}>
              <Users size={20} color={Colors.BluePrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Parents & Guardian Details</Text>
              <Text style={styles.menuSubtitle}>Contact, Relation, Occupation</Text>
            </View>
            <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} />
          </Pressable>

          {/* Bank Account Details */}
          <Pressable
            onPress={() => setActiveModal('BANK')}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuIconCircle}>
              <Landmark size={20} color={Colors.BluePrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Bank Account Details</Text>
              <Text style={styles.menuSubtitle}>Bank Name, Account Number</Text>
            </View>
            <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} />
          </Pressable>

          {/* Admission Details */}
          <Pressable
            onPress={() => setActiveModal('ADMISSION')}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuIconCircle}>
              <GraduationCap size={20} color={Colors.BluePrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Admission Details</Text>
              <Text style={styles.menuSubtitle}>Department, Batch, Semester</Text>
            </View>
            <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} />
          </Pressable>

          {/* Account Details */}
          <Pressable
            onPress={() => setActiveModal('ACCOUNT')}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuIconCircle}>
              <Settings size={20} color={Colors.BluePrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Account Details</Text>
              <Text style={styles.menuSubtitle}>Email, Username, Password</Text>
            </View>
            <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} />
          </Pressable>


          {/* About */}
          <Pressable
            onPress={() => setActiveModal('ABOUT')}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuIconCircle}>
              <Info size={20} color={Colors.BluePrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>About</Text>
              <Text style={styles.menuSubtitle}>App Details, Share App</Text>
            </View>
            <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} />
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              styles.menuRow,
              { borderBottomWidth: 0 },
              pressed && styles.menuRowPressed
            ]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: Colors.RedErrorContainer }]}>
              <Power size={20} color={Colors.RedError} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={[styles.menuTitle, { color: Colors.RedError }]}>Logout</Text>
            </View>
            <ChevronRight size={18} color={Colors.RedError} />
          </Pressable>
        </CampusCard>

        {/* Muted version tag */}
        <Text style={styles.versionText}>Version 1.0 • Powered by Aziron Tech Private Ltd</Text>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Slide up Modal for Details */}
      {activeModal && (
        <Modal
          transparent
          animationType="slide"
          visible={activeModal !== null}
          onRequestClose={() => setActiveModal(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalDismissOverlay} onPress={() => setActiveModal(null)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{getModalTitle(activeModal)}</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {renderModalContent(activeModal)}
              </ScrollView>

              <CustomButton
                text="Close"
                onPress={() => setActiveModal(null)}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Digital ID Card Modal */}
      <Modal
        visible={showIdCard}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdCard(false)}
      >
        <Pressable style={styles.idModalOverlay} onPress={() => setShowIdCard(false)}>
          <View style={styles.idCardContainer} onStartShouldSetResponder={() => false}>
            {/* Header with College Name and Logo on same line */}
            <View style={styles.idCardHeader}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.idLogoImage}
                resizeMode="contain"
              />
              <View style={styles.idHeaderTextContainer}>
                <Text style={styles.idCollegeName}>Mazharul Uloom College (Autonomous)</Text>
                <Text style={styles.idCollegeSub}>Ambur - 635802</Text>
              </View>
            </View>

            {/* Body of ID Card */}
            <View style={styles.idCardBody}>
              <View style={styles.idPhotoContainer}>
                <Text style={styles.idPhotoText}>{initial}</Text>
              </View>

              <Text style={styles.idStudentName}>{student.name}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>STUDENT ID PASS</Text>
              </View>

              {/* ID Details Grid */}
              <View style={styles.idDetailsGrid}>
                <View style={styles.idDetailsRow}>
                  <View style={styles.idDetailsCol}>
                    <Text style={styles.idLabel}>Roll No</Text>
                    <Text style={styles.idValue}>710</Text>
                  </View>
                  <View style={styles.idDetailsCol}>
                    <Text style={styles.idLabel}>Register No</Text>
                    <Text style={styles.idValue}>{student.registerNumber}</Text>
                  </View>
                </View>

                <View style={styles.idDivider} />

                <View style={styles.idDetailsRow}>
                  <View style={styles.idDetailsCol}>
                    <Text style={styles.idLabel}>Date of Birth</Text>
                    <Text style={styles.idValue}>{student.dob}</Text>
                  </View>
                  <View style={styles.idDetailsCol}>
                    <Text style={styles.idLabel}>Blood Group</Text>
                    <Text style={styles.idValue}>{student.bloodGroup}</Text>
                  </View>
                </View>

                <View style={styles.idDivider} />

                <View style={styles.idDetailsRow}>
                  <View style={styles.idDetailsCol}>
                    <Text style={styles.idLabel}>Mobile No</Text>
                    <Text style={styles.idValue}>9876543210</Text>
                  </View>
                </View>

                <View style={styles.idDivider} />

                <View style={styles.idDetailsRow}>
                  <View style={styles.idDetailsCol}>
                    <Text style={styles.idLabel}>Address</Text>
                    <Text style={styles.idValue} numberOfLines={2}>MUC, Ambur - 635802, Tamil Nadu</Text>
                  </View>
                </View>
              </View>

              {/* Barcode section */}
              <View style={styles.idFooter}>
                <View style={styles.idBarcodeContainer}>
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2, 1, 4, 1, 3].map((w, idx) => (
                    <View
                      key={idx}
                      style={{
                        width: w,
                        height: 30,
                        backgroundColor: '#0F172A',
                        marginHorizontal: 0.8,
                      }}
                    />
                  ))}
                </View>
                <Text style={styles.idValidityText}>Academic Year: 2024 - 2027 • SECURE DIGITAL PASS</Text>
              </View>
            </View>

            <Pressable style={styles.idCloseBtn} onPress={() => setShowIdCard(false)}>
              <Text style={styles.idCloseBtnText}>Close Pass</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.AppBackground,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  heroCard: { marginBottom: 16, padding: 24 },
  heroCenterContent: { alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.BluePrimaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: Colors.BluePrimary },
  heroName: { fontSize: 20, fontWeight: '700', color: Colors.AppOnBackground, marginBottom: 4 },
  heroCollege: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.BluePrimary,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  heroDept: { fontSize: 13, color: Colors.AppOnSurfaceVariant, fontWeight: '600', marginBottom: 8 },
  heroMeta: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  menuCard: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  menuRowPressed: {
    backgroundColor: '#F8FAFC',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.BluePrimaryContainer + '4D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextWrap: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  menuSubtitle: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalDismissOverlay: { flex: 1 },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.BluePrimary,
    marginBottom: 20,
  },
  modalScroll: { paddingBottom: 8 },
  modalItemsList: { gap: 16 },
  modalRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
    paddingBottom: 12,
  },
  modalRowLabel: {
    fontSize: 10,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalRowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.AppOnBackground,
    marginTop: 4,
  },
  idModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  idCardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idCardHeader: {
    backgroundColor: '#CBD5E1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  idLogoImage: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idHeaderTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  idCollegeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  idCollegeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  idCardBody: {
    alignItems: 'center',
    padding: 20,
  },
  idPhotoContainer: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  idPhotoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#334155',
  },
  idStudentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
    textAlign: 'center',
  },
  idBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'center',
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  idDetailsGrid: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  idDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idDetailsCol: {
    flex: 1,
  },
  idLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  idValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  idDivider: {
    height: 1,
    backgroundColor: Colors.AppOutline,
    marginVertical: 4,
  },
  idFooter: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.AppOutline,
  },
  idBarcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: '100%',
    marginBottom: 8,
  },
  idValidityText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
  },
  idCloseBtn: {
    backgroundColor: Colors.AppSurfaceVariant,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.AppOutline,
  },
  idCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
});
