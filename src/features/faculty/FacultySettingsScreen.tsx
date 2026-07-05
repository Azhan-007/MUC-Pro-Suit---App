import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Bell, Shield, Eye, EyeOff, X } from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, CustomButton, useCampusAlert } from '../../components';

export const FacultySettingsScreen: React.FC = () => {
  const router = useRouter();
  const { showAlert } = useCampusAlert();

  // Settings Toggles State
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showOldPass, setShowOldPass] = React.useState(false);
  const [showNewPass, setShowNewPass] = React.useState(false);

  const handleChangePasswordSubmit = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showAlert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New Password and Confirm Password do not match.');
      return;
    }
    showAlert(
      'Change Password',
      'Are you sure you want to update your password?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => {
            showAlert('Success', 'Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordModal(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <CampusCard style={styles.card} elevation="sm">
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={Colors.BluePrimary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Receive instant updates for lectures, circulars and mark releases.</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#CBD5E1', true: Colors.BluePrimary + '80' }}
              thumbColor={pushEnabled ? Colors.BluePrimary : '#F4F3F0'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={Colors.BluePrimary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Email Alerts Copy</Text>
                <Text style={styles.settingDesc}>Send copy of critical announcements to official institutional email.</Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#CBD5E1', true: Colors.BluePrimary + '80' }}
              thumbColor={emailEnabled ? Colors.BluePrimary : '#F4F3F0'}
            />
          </View>
        </CampusCard>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security & Login</Text>
        <CampusCard style={styles.card} elevation="sm">
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={Colors.BluePrimary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Biometric Authentication</Text>
                <Text style={styles.settingDesc}>Enable Touch ID / Face ID quick log in for faculty pass details.</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#CBD5E1', true: Colors.BluePrimary + '80' }}
              thumbColor={biometricsEnabled ? Colors.BluePrimary : '#F4F3F0'}
            />
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.settingClickRow} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.settingLeft}>
              <Lock size={20} color={Colors.BluePrimary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDesc}>Modify your secure account log in password credential.</Text>
              </View>
            </View>
          </Pressable>
        </CampusCard>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.pickerOverlay}>
            <Pressable style={styles.pickerDismiss} onPress={() => setShowPasswordModal(false)} />
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Change Password</Text>
                <Pressable onPress={() => setShowPasswordModal(false)} style={styles.pickerCloseBtn}>
                  <X size={20} color={Colors.AppOnBackground} />
                </Pressable>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Current Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInputWithIcon}
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      secureTextEntry={!showOldPass}
                      placeholder="Enter current password"
                      placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                    />
                    <Pressable style={styles.iconBtn} onPress={() => setShowOldPass(!showOldPass)}>
                      {showOldPass ? <EyeOff size={16} color={Colors.AppOnSurfaceVariant} /> : <Eye size={16} color={Colors.AppOnSurfaceVariant} />}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>New Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInputWithIcon}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPass}
                      placeholder="Enter new password"
                      placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                    />
                    <Pressable style={styles.iconBtn} onPress={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <EyeOff size={16} color={Colors.AppOnSurfaceVariant} /> : <Eye size={16} color={Colors.AppOnSurfaceVariant} />}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Re-enter new password"
                    placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                  />
                </View>

                <CustomButton text="Update Password" onPress={handleChangePasswordSubmit} style={{ marginTop: 12 }} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingVertical: 12,
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.AppOnBackground },
  spacer: { width: 40 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },
  card: { padding: 16, gap: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingClickRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', gap: 14, flex: 1, alignItems: 'center' },
  settingInfo: { flex: 1, gap: 2 },
  settingTitle: { fontSize: 14, fontWeight: '800', color: Colors.AppOnBackground },
  settingDesc: { fontSize: 11, color: Colors.AppOnSurfaceVariant, lineHeight: 15 },
  divider: { height: 1, backgroundColor: Colors.AppOutline },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerDismiss: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  pickerCloseBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  formGroup: { gap: 8 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  textInput: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.AppOnBackground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    overflow: 'hidden',
  },
  textInputWithIcon: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.AppOnBackground,
  },
  iconBtn: {
    paddingHorizontal: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
