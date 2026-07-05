import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CampusCard, StatusChip, PageHeader, useCampusAlert } from '../../components';
import { Colors } from '../../theme';
import { User, MapPin, CheckCircle, Clock, Plus, Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react-native';
import { ClassStatus, ClassSession } from '../../types';
import { mockFacultyTimetable } from '../../data/mockFacultyData';

const WEEK_DAYS = [
  { label: 'Mon', num: '12', key: 'Mon' },
  { label: 'Tue', num: '13', key: 'Tue' },
  { label: 'Wed', num: '14', key: 'Wed' },
  { label: 'Thu', num: '15', key: 'Thu' },
  { label: 'Fri', num: '16', key: 'Fri' },
  { label: 'Sat', num: '17', key: 'Sat' },
];

const ModalKeyboardAvoidingView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ width: '100%' }}>
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <>{children}</>;
};

const STATUS_STRIP_COLOR: Record<ClassStatus, string> = {
  COMPLETED: Colors.ColorPresent,
  ONGOING: Colors.BluePrimary,
  UPCOMING: Colors.AppOutline,
};

const SUBJECT_OPTIONS = ['Database Management System', 'Operating System', 'Web Technology', 'Python Programming'];

export const FacultyTimetableScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();

  const todayRaw = new Date().getDay(); // 0=Sun ... 6=Sat
  const todayKey = WEEK_DAYS[todayRaw === 0 ? 0 : todayRaw - 1]?.key ?? 'Mon';
  const [selectedDay, setSelectedDay] = React.useState(todayKey);
  const [isManageMode, setIsManageMode] = React.useState(false);

  // CRUD Schedule State
  const [timetable, setTimetable] = React.useState<Record<string, ClassSession[]>>(mockFacultyTimetable);

  const rightHeaderBtn = (
    <Pressable onPress={() => setIsManageMode(!isManageMode)}>
      <Text style={{
        fontSize: 14,
        fontWeight: '800',
        color: isManageMode ? Colors.ColorPresent : Colors.BluePrimary,
      }}>
        {isManageMode ? 'Done' : 'Manage'}
      </Text>
    </Pressable>
  );

  // Form State
  const [showFormModal, setShowFormModal] = React.useState(false);
  const [editingSession, setEditingSession] = React.useState<ClassSession | null>(null);
  const [formSubject, setFormSubject] = React.useState('');
  const [formSection, setFormSection] = React.useState('');
  const [formRoom, setFormRoom] = React.useState('');
  const [formTime, setFormTime] = React.useState('');
  const [showSubjectPicker, setShowSubjectPicker] = React.useState(false);

  const sessions = timetable[selectedDay] || [];
  const periodCount = sessions.length;

  const handleAddPress = () => {
    setEditingSession(null);
    setFormSubject('Database Management System');
    setFormSection('III B.Sc CS');
    setFormRoom('Room 402');
    setFormTime('09:00 - 10:00');
    setShowFormModal(true);
  };

  const handleEditPress = (session: ClassSession) => {
    setEditingSession(session);
    setFormSubject(session.subject);
    setFormSection(session.section);
    setFormRoom(session.room);
    setFormTime(session.time);
    setShowFormModal(true);
  };

  const handleSave = () => {
    if (!formSubject || !formSection || !formRoom || !formTime) {
      showAlert('Error', 'Please fill in all fields.');
      return;
    }

    if (editingSession) {
      // Edit
      setTimetable((prev) => {
        const list = prev[selectedDay] || [];
        const updated = list.map((item) =>
          item.id === editingSession.id
            ? { ...item, subject: formSubject, section: formSection, room: formRoom, time: formTime }
            : item
        );
        return { ...prev, [selectedDay]: updated };
      });
    } else {
      // Add
      const newSession: ClassSession = {
        id: 'session_' + Date.now(),
        subject: formSubject,
        section: formSection,
        room: formRoom,
        time: formTime,
        day: selectedDay,
        status: 'UPCOMING',
        totalStudents: formSection.includes('III') ? 52 : 48,
      };
      setTimetable((prev) => {
        const list = prev[selectedDay] || [];
        return { ...prev, [selectedDay]: [...list, newSession] };
      });
    }
    setShowFormModal(false);
  };

  const handleDeletePress = (sessionId: string) => {
    showAlert(
      'Delete Class',
      'Are you sure you want to remove this class from your schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTimetable((prev) => {
              const list = prev[selectedDay] || [];
              const filtered = list.filter((item) => item.id !== sessionId);
              return { ...prev, [selectedDay]: filtered };
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="My Schedule" rightElement={rightHeaderBtn} />

      {/* ── 1. Day Selector (Pinned & Scrollable) ── */}
      <View style={styles.pinnedDaySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {WEEK_DAYS.map(({ label, num, key }) => {
            const active = selectedDay === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDay(key)}
                style={[
                  styles.dayItem,
                  active ? styles.dayItemActive : styles.dayItemInactive,
                ]}
              >
                <Text style={[styles.dayLabel, active && { color: '#FFF' }]}>{label}</Text>
                <Text style={[styles.dayNum, active && { color: '#FFF' }]}>{num}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. Classes Header ── */}
        <View style={styles.classesHeader}>
          <View>
            <Text style={styles.classesTitle}>Scheduled Classes</Text>
            <Text style={styles.classesSubText}>{periodCount} periods for {selectedDay}</Text>
          </View>
          {isManageMode ? (
            <Pressable style={styles.addSessionBtn} onPress={handleAddPress}>
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.addSessionBtnText}>Add Class</Text>
            </Pressable>
          ) : (
            <StatusChip text={`${periodCount} Classes`} level="ACADEMIC" />
          )}
        </View>

        {/* ── 3. Class Timeline ── */}
        {sessions.length === 0 ? (
          <CampusCard borderColor={Colors.AppOutline} style={styles.classCard} elevation="sm">
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.AppOnSurfaceVariant }}>
                No classes scheduled for this day!
              </Text>
            </View>
          </CampusCard>
        ) : (
          sessions.map((cls, idx) => {
            const status = cls.status ?? 'UPCOMING';
            const isOngoing = status === 'ONGOING';

            return (
              <CampusCard
                key={cls.id}
                borderColor={isOngoing ? Colors.BluePrimary : Colors.AppOutline}
                elevation={isOngoing ? 'md' : 'sm'}
                padding={0}
                style={styles.classCard}
              >
                <View style={styles.classInner}>
                  {/* Status strip */}
                  <View style={[styles.statusStrip, { backgroundColor: STATUS_STRIP_COLOR[status] }]} />

                  <View style={styles.classContent}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeText}>{cls.time.replace(' ', '\n')}</Text>
                    </View>
                    <View style={styles.vertLine} />
                    <View style={styles.classInfo}>
                      <Text style={styles.subjectText}>{cls.subject}</Text>
                      <View style={styles.classMeta}>
                        <User size={13} color={Colors.AppOnSurfaceVariant} />
                        <Text style={styles.classMetaText}> {cls.section}</Text>
                        <MapPin size={13} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 12 }} />
                        <Text style={styles.classMetaText}> {cls.room}</Text>
                      </View>
                    </View>

                    {/* Actions and Status Block */}
                    <View style={[styles.actionsBlock, { justifyContent: isManageMode ? 'space-between' : 'center' }]}>
                      <View style={styles.statusIcon}>
                        {status === 'COMPLETED' && <CheckCircle size={22} color={Colors.ColorPresent} />}
                        {status === 'ONGOING' && <StatusChip text="NOW" level="NOW" />}
                        {status === 'UPCOMING' && <Clock size={20} color={Colors.AppOnSurfaceVariant} />}
                      </View>
                      
                      {isManageMode && (
                        <View style={styles.cardBtnGroup}>
                          <Pressable style={styles.cardActionBtn} onPress={() => handleEditPress(cls)}>
                            <Pencil size={13} color={Colors.BluePrimary} />
                          </Pressable>
                          <Pressable style={styles.cardActionBtn} onPress={() => handleDeletePress(cls.id)}>
                            <Trash2 size={13} color={Colors.ColorAbsent} />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </CampusCard>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add / Edit Form Modal Sheet */}
      <Modal visible={showFormModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFormModal(false)} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {editingSession ? 'Edit Scheduled Class' : 'Add Scheduled Class'}
                </Text>
                <Pressable onPress={() => setShowFormModal(false)} style={styles.pickerCloseBtn}>
                  <X size={20} color={Colors.AppOnBackground} />
                </Pressable>
              </View>

              <ScrollView 
                style={{ flexShrink: 1 }}
                contentContainerStyle={styles.configContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Subject Selector */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Subject</Text>
                  <Pressable style={styles.fullDropdownTrigger} onPress={() => setShowSubjectPicker(true)}>
                    <Text style={styles.dropdownValue} numberOfLines={1}>{formSubject}</Text>
                    <ChevronDown size={18} color={Colors.AppOnSurfaceVariant} />
                  </Pressable>
                </View>

                {/* Class / Section Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Class / Section</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formSection}
                    onChangeText={setFormSection}
                    placeholder="e.g. III B.Sc CS"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Room Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Room / Lab Location</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formRoom}
                    onChangeText={setFormRoom}
                    placeholder="e.g. Room 402 or Lab 01"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Time Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Timings</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formTime}
                    onChangeText={setFormTime}
                    placeholder="e.g. 09:00 - 10:00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Save button */}
                <Pressable style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save Schedule</Text>
                </Pressable>
              </ScrollView>
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* Subject Selector sub-modal */}
      <Modal visible={showSubjectPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowSubjectPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Subject</Text>
              <Pressable onPress={() => setShowSubjectPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {SUBJECT_OPTIONS.map((sub) => {
                const active = formSubject === sub;
                return (
                  <Pressable
                    key={sub}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => {
                      setFormSubject(sub);
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]} numberOfLines={1}>
                      {sub}
                    </Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 6 },
  pinnedDaySelectorContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.AppBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 70,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  dayItemActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  dayItemInactive: {
    backgroundColor: Colors.AppSurface,
    borderColor: Colors.AppOutline,
  },
  dayLabel: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  dayNum: { fontSize: 16, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
  classesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  classesTitle: { fontSize: 18, fontWeight: '700', color: Colors.AppOnBackground },
  classesSubText: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  addSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.BluePrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: Colors.BluePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addSessionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  classCard: { marginBottom: 10, overflow: 'hidden' },
  classInner: { flexDirection: 'row' },
  statusStrip: { width: 6 },
  classContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  timeBlock: { width: 56 },
  timeText: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textAlign: 'center', lineHeight: 16 },
  vertLine: { width: 1, height: '100%', backgroundColor: Colors.AppOutline },
  classInfo: { flex: 1 },
  subjectText: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground, lineHeight: 18 },
  classMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  classMetaText: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  actionsBlock: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  statusIcon: { alignItems: 'center', justifyContent: 'center' },
  cardBtnGroup: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  cardActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 10,
  },
  pickerDismiss: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
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
  configContent: {
    padding: 20,
    gap: 16,
  },
  formGroup: {
    gap: 6,
    width: '100%',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  fullDropdownTrigger: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  saveBtn: {
    backgroundColor: Colors.BluePrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pickerList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: Colors.BluePrimary + '0D',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
});
