import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, FileText, Plus, X, Pencil, Trash2, CheckCircle2, AlertCircle, Clock
} from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, CustomButton, useCampusAlert } from '../../components';

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

interface StudentSubmission {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: 'PENDING' | 'SUBMITTED' | 'EVALUATED';
  marksObtained?: number;
}

interface AssessmentRecord {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  totalSubmissions: number;
  totalStudents: number;
  shift?: 'SHIFT_I' | 'SHIFT_II' | 'GIRLS';
  description?: string;
  submissionsList: StudentSubmission[];
}

const mockStudentsList: StudentSubmission[] = [
  { studentId: 's1', studentName: 'Abdul Rahman K', rollNo: '711', status: 'SUBMITTED' },
  { studentId: 's2', studentName: 'Ayesha Banu R', rollNo: '714', status: 'EVALUATED', marksObtained: 18 },
  { studentId: 's3', studentName: 'Maryam Siddiqui F', rollNo: '718', status: 'PENDING' },
  { studentId: 's4', studentName: 'Mohammed Anas P', rollNo: '725', status: 'SUBMITTED' },
  { studentId: 's5', studentName: 'Sanjay Kumar S', rollNo: '744', status: 'PENDING' },
  { studentId: 's6', studentName: 'Zoya Fatima M', rollNo: '752', status: 'EVALUATED', marksObtained: 19 },
];

const initialAssessmentsWithSubmissions: AssessmentRecord[] = [
  { 
    id: 'ass1', 
    subject: 'Database Management System', 
    title: 'SQL Queries Assignment 1', 
    dueDate: '08 Jul 2026', 
    totalSubmissions: 4, 
    totalStudents: 6, 
    maxMarks: 20, 
    shift: 'SHIFT_I',
    description: 'Write SQL queries to create databases, tables, and perform inner/outer joins on the schema provided in class.',
    submissionsList: [
      { studentId: 's1', studentName: 'Abdul Rahman K', rollNo: '711', status: 'SUBMITTED' },
      { studentId: 's2', studentName: 'Ayesha Banu R', rollNo: '714', status: 'EVALUATED', marksObtained: 18 },
      { studentId: 's3', studentName: 'Maryam Siddiqui F', rollNo: '718', status: 'PENDING' },
      { studentId: 's4', studentName: 'Mohammed Anas P', rollNo: '725', status: 'SUBMITTED' },
      { studentId: 's5', studentName: 'Sanjay Kumar S', rollNo: '744', status: 'PENDING' },
      { studentId: 's6', studentName: 'Zoya Fatima M', rollNo: '752', status: 'EVALUATED', marksObtained: 19 },
    ]
  },
  { 
    id: 'ass2', 
    subject: 'Operating System', 
    title: 'CPU Scheduling Problems Sheet', 
    dueDate: '30 Jun 2026', 
    totalSubmissions: 4, 
    totalStudents: 6, 
    maxMarks: 15, 
    shift: 'SHIFT_I',
    description: 'Solve the numerical problems on FCFS, SJF, SRTF, and Round Robin scheduling algorithms with gantt charts.',
    submissionsList: [
      { studentId: 's1', studentName: 'Abdul Rahman K', rollNo: '711', status: 'EVALUATED', marksObtained: 14 },
      { studentId: 's2', studentName: 'Ayesha Banu R', rollNo: '714', status: 'EVALUATED', marksObtained: 13 },
      { studentId: 's3', studentName: 'Maryam Siddiqui F', rollNo: '718', status: 'PENDING' },
      { studentId: 's4', studentName: 'Mohammed Anas P', rollNo: '725', status: 'EVALUATED', marksObtained: 15 },
      { studentId: 's5', studentName: 'Sanjay Kumar S', rollNo: '744', status: 'PENDING' },
      { studentId: 's6', studentName: 'Zoya Fatima M', rollNo: '752', status: 'EVALUATED', marksObtained: 15 },
    ]
  },
];

export const FacultyAssessmentsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();

  // State definitions
  const [assessments, setAssessments] = React.useState<AssessmentRecord[]>(initialAssessmentsWithSubmissions);
  const [showAssessmentModal, setShowAssessmentModal] = React.useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = React.useState<string | null>(null);
  
  // Assessment Form States
  const [newAssSubject, setNewAssSubject] = React.useState('Database Management System');
  const [newAssTitle, setNewAssTitle] = React.useState('');
  const [newAssDesc, setNewAssDesc] = React.useState('');
  const [newAssDueDate, setNewAssDueDate] = React.useState('18 Jul 2026');
  const [newAssMaxMarks, setNewAssMaxMarks] = React.useState('20');
  const [newAssShift, setNewAssShift] = React.useState<'SHIFT_I' | 'SHIFT_II' | 'GIRLS'>('SHIFT_I');

  // Submissions Modal States
  const [selectedAssForSubmissions, setSelectedAssForSubmissions] = React.useState<AssessmentRecord | null>(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = React.useState(false);

  // Grading Modal States
  const [gradingStudent, setGradingStudent] = React.useState<StudentSubmission | null>(null);
  const [gradingStatus, setGradingStatus] = React.useState<'PENDING' | 'SUBMITTED' | 'EVALUATED'>('SUBMITTED');
  const [gradingMarks, setGradingMarks] = React.useState('');
  const [showGradingModal, setShowGradingModal] = React.useState(false);

  const handleEditAssessmentPress = (ass: AssessmentRecord) => {
    setEditingAssessmentId(ass.id);
    setNewAssTitle(ass.title);
    setNewAssDesc(ass.description || '');
    setNewAssSubject(ass.subject);
    setNewAssDueDate(ass.dueDate);
    setNewAssMaxMarks(String(ass.maxMarks));
    setNewAssShift(ass.shift || 'SHIFT_I');
    setShowAssessmentModal(true);
  };

  const handleDeleteAssessment = (id: string) => {
    showAlert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAssessments((prev) => prev.filter((a) => a.id !== id));
            showAlert('Deleted', 'Assessment deleted successfully.');
          }
        }
      ]
    );
  };

  const handleAddAssessment = () => {
    if (!newAssTitle.trim()) {
      showAlert('Error', 'Please enter a title for the assignment.');
      return;
    }
    const maxVal = parseInt(newAssMaxMarks, 10) || 20;

    if (editingAssessmentId) {
      setAssessments((prev) => prev.map((a) =>
        a.id === editingAssessmentId
          ? {
              ...a,
              subject: newAssSubject,
              title: newAssTitle,
              description: newAssDesc,
              dueDate: newAssDueDate,
              maxMarks: maxVal,
              shift: newAssShift,
            }
          : a
      ));
      setEditingAssessmentId(null);
      setNewAssTitle('');
      setNewAssDesc('');
      setNewAssShift('SHIFT_I');
      setShowAssessmentModal(false);
      showAlert('Success', 'Assessment updated successfully!');
    } else {
      const newAss: AssessmentRecord = {
        id: 'ass_' + Date.now(),
        subject: newAssSubject,
        title: newAssTitle,
        description: newAssDesc,
        dueDate: newAssDueDate || '18 Jul 2026',
        maxMarks: maxVal,
        totalSubmissions: 0,
        totalStudents: mockStudentsList.length,
        shift: newAssShift,
        submissionsList: mockStudentsList.map((s) => ({ ...s, status: 'PENDING', marksObtained: undefined })),
      };
      setAssessments([newAss, ...assessments]);
      setNewAssTitle('');
      setNewAssDesc('');
      setNewAssShift('SHIFT_I');
      setShowAssessmentModal(false);
      showAlert('Success', 'Assessment published successfully!');
    }
  };

  const handleOpenSubmissions = (ass: AssessmentRecord) => {
    setSelectedAssForSubmissions(ass);
    setShowSubmissionsModal(true);
  };

  const handleOpenGrading = (student: StudentSubmission) => {
    setGradingStudent(student);
    setGradingStatus('EVALUATED');
    setGradingMarks(student.marksObtained !== undefined ? String(student.marksObtained) : '');
    setShowGradingModal(true);
  };

  const handleDirectStatusChange = (studentId: string, newStatus: 'PENDING' | 'SUBMITTED') => {
    if (!selectedAssForSubmissions) return;

    setAssessments((prev) => prev.map((a) => {
      if (a.id !== selectedAssForSubmissions.id) return a;

      const updatedSubmissions = a.submissionsList.map((s) => {
        if (s.studentId !== studentId) return s;
        return {
          ...s,
          status: newStatus,
          marksObtained: undefined
        } as StudentSubmission;
      });

      const newSubmissionsCount = updatedSubmissions.filter(
        (s) => s.status === 'SUBMITTED' || s.status === 'EVALUATED'
      ).length;

      const updatedAss = {
        ...a,
        submissionsList: updatedSubmissions,
        totalSubmissions: newSubmissionsCount
      };

      setSelectedAssForSubmissions(updatedAss);
      return updatedAss;
    }));
  };

  const handleSaveGrade = () => {
    if (!selectedAssForSubmissions || !gradingStudent) return;
    
    const marksNum = parseInt(gradingMarks, 10);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > selectedAssForSubmissions.maxMarks) {
      showAlert('Error', `Please enter a valid marks value between 0 and ${selectedAssForSubmissions.maxMarks}.`);
      return;
    }

    setAssessments((prev) => prev.map((a) => {
      if (a.id !== selectedAssForSubmissions.id) return a;
      
      const updatedSubmissions = a.submissionsList.map((s) => {
        if (s.studentId !== gradingStudent.studentId) return s;
        return {
          ...s,
          status: 'EVALUATED' as const,
          marksObtained: marksNum
        } as StudentSubmission;
      });

      const newSubmissionsCount = updatedSubmissions.filter(
        (s) => s.status === 'SUBMITTED' || s.status === 'EVALUATED'
      ).length;

      const updatedAss = {
        ...a,
        submissionsList: updatedSubmissions,
        totalSubmissions: newSubmissionsCount
      };

      setSelectedAssForSubmissions(updatedAss);
      return updatedAss;
    }));

    setShowGradingModal(false);
    setGradingStudent(null);
    showAlert('Success', 'Student grade recorded successfully!');
  };

  const handleMarksChangeText = (text: string) => {
    if (text === '') {
      setGradingMarks('');
      return;
    }
    const cleanText = text.replace(/[^0-9]/g, '');
    const marksNum = parseInt(cleanText, 10);
    const maxVal = selectedAssForSubmissions?.maxMarks || 20;

    if (!isNaN(marksNum)) {
      if (marksNum > maxVal) {
        setGradingMarks(String(maxVal));
      } else {
        setGradingMarks(cleanText);
      }
    } else {
      setGradingMarks('');
    }
  };

  const getStatusBadge = (status: 'PENDING' | 'SUBMITTED' | 'EVALUATED') => {
    switch (status) {
      case 'PENDING':
        return (
          <View style={[styles.statusBadge, styles.badgePending]}>
            <Clock size={10} color="#D97706" />
            <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>Pending</Text>
          </View>
        );
      case 'SUBMITTED':
        return (
          <View style={[styles.statusBadge, styles.badgeSubmitted]}>
            <FileText size={10} color="#2563EB" />
            <Text style={[styles.statusBadgeText, { color: '#2563EB' }]}>Submitted</Text>
          </View>
        );
      case 'EVALUATED':
        return (
          <View style={[styles.statusBadge, styles.badgeEvaluated]}>
            <CheckCircle2 size={10} color="#059669" />
            <Text style={[styles.statusBadgeText, { color: '#059669' }]}>Graded</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.BluePrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Assessments & Assignments</Text>
        <View style={styles.spacer} />
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabPane}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Active Assignments</Text>
            <Pressable style={styles.addBtn} onPress={() => setShowAssessmentModal(true)}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Create New</Text>
            </Pressable>
          </View>

          {assessments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assessments created yet.</Text>
            </View>
          ) : (
            assessments.map((ass) => (
              <CampusCard key={ass.id} style={styles.card} elevation="sm">
                <View style={styles.assHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assTitle}>{ass.title}</Text>
                    <Text style={styles.assMeta}>
                      {ass.subject} {ass.shift ? `(${ass.shift === 'SHIFT_I' ? 'Shift I' : ass.shift === 'SHIFT_II' ? 'Shift II' : 'Girls'})` : ''} · Max Marks: {ass.maxMarks}
                    </Text>
                  </View>
                  <View style={styles.actionBtnGroup}>
                    <Pressable onPress={() => handleEditAssessmentPress(ass)} style={styles.actionIconButton}>
                      <Pencil size={15} color={Colors.BluePrimary} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteAssessment(ass.id)} style={styles.actionIconButton}>
                      <Trash2 size={15} color={Colors.ColorAbsent} />
                    </Pressable>
                  </View>
                </View>

                {ass.description ? (
                  <View style={styles.assDescWrapper}>
                    <Text style={styles.assDescText}>{ass.description}</Text>
                  </View>
                ) : null}

                <View style={styles.assProgress}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.assSubLabel}>Submissions</Text>
                    <Text style={styles.assSubPercent}>
                      {ass.totalSubmissions} / {ass.totalStudents} ({ass.totalStudents > 0 ? Math.round((ass.totalSubmissions / ass.totalStudents) * 100) : 0}%)
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${ass.totalStudents > 0 ? (ass.totalSubmissions / ass.totalStudents) * 100 : 0}%`, 
                          backgroundColor: Colors.BluePrimary 
                        }
                      ]} 
                    />
                  </View>
                </View>

                <View style={[styles.rowBetween, { marginTop: 8 }]}>
                  <Text style={styles.assDateText}>Due: {ass.dueDate}</Text>
                  <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                    <Pressable onPress={() => handleOpenSubmissions(ass)}>
                      <Text style={[styles.remindBtnText, { color: Colors.BluePrimary }]}>Submissions</Text>
                    </Pressable>
                    <Pressable onPress={() => showAlert('Remind Sent', 'Reminder sent to non-submitters.')}>
                      <Text style={styles.remindBtnText}>Send Reminder</Text>
                    </Pressable>
                  </View>
                </View>
              </CampusCard>
            ))
          )}
        </View>
      </ScrollView>

      {/* Assessment Creator Modal Sheet */}
      <Modal visible={showAssessmentModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowAssessmentModal(false)} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {editingAssessmentId ? 'Edit Assessment Assignment' : 'Create New Assessment'}
                </Text>
                <Pressable onPress={() => { setShowAssessmentModal(false); setEditingAssessmentId(null); setNewAssTitle(''); setNewAssDesc(''); setNewAssShift('SHIFT_I'); }} style={styles.pickerCloseBtn}>
                  <X size={20} color={Colors.AppOnBackground} />
                </Pressable>
              </View>

              <ScrollView 
                style={{ flexShrink: 1 }}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Subject</Text>
                  <View style={styles.chipSelectorGroup}>
                    {['Database Management System', 'Operating System'].map((sub) => {
                      const active = newAssSubject === sub;
                      return (
                        <Pressable
                          key={sub}
                          style={[styles.selectorChip, active && styles.selectorChipActive]}
                          onPress={() => setNewAssSubject(sub)}
                        >
                          <Text style={[styles.selectorChipText, active && styles.selectorChipTextActive]}>
                            {sub === 'Database Management System' ? 'DBMS' : 'OS'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Shift / Category</Text>
                  <View style={styles.chipSelectorGroup}>
                    {['SHIFT_I', 'SHIFT_II', 'GIRLS'].map((sh) => {
                      const active = newAssShift === sh;
                      const label = sh === 'SHIFT_I' ? 'Shift I' : sh === 'SHIFT_II' ? 'Shift II' : 'Girls';
                      return (
                        <Pressable
                          key={sh}
                          style={[styles.selectorChip, active && styles.selectorChipActive]}
                          onPress={() => setNewAssShift(sh as any)}
                        >
                          <Text style={[styles.selectorChipText, active && styles.selectorChipTextActive]}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Assignment Title</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAssTitle}
                    onChangeText={setNewAssTitle}
                    placeholder="e.g. CIA 1 - Database Schema Design"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Assignment Description</Text>
                  <TextInput
                    style={[styles.textInput, { minHeight: 64, textAlignVertical: 'top' }]}
                    value={newAssDesc}
                    onChangeText={setNewAssDesc}
                    placeholder="e.g. Write queries for creating DB and joins..."
                    placeholderTextColor="#94A3B8"
                    multiline
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Due Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAssDueDate}
                    onChangeText={setNewAssDueDate}
                    placeholder="e.g. 12 Jul 2026"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Maximum Marks Value</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAssMaxMarks}
                    onChangeText={setNewAssMaxMarks}
                    placeholder="e.g. 20"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>

                <CustomButton
                  text={editingAssessmentId ? 'Save Changes' : 'Publish Assignment'}
                  onPress={handleAddAssessment}
                  style={{ marginTop: 12 }}
                />
              </ScrollView>
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* Submissions Management Modal Sheet */}
      <Modal visible={showSubmissionsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowSubmissionsModal(false)} />
          <View style={[styles.pickerSheet, { height: '60%', paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.pickerTitle} numberOfLines={1}>
                  Submissions
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {selectedAssForSubmissions?.title}
                </Text>
              </View>
              <Pressable onPress={() => setShowSubmissionsModal(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedAssForSubmissions?.submissionsList && selectedAssForSubmissions.submissionsList.length > 0 ? (
                selectedAssForSubmissions.submissionsList.map((sub) => (
                  <View key={sub.studentId} style={styles.submissionRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.studentNameText} numberOfLines={1}>{sub.studentName}</Text>
                      <Text style={[styles.studentRollText, { marginTop: 2 }]}>Roll No: {sub.rollNo}</Text>
                    </View>

                    <View style={styles.inlineButtonGroup}>
                      {/* Pending Button */}
                      <Pressable 
                        style={[
                          styles.inlineChip, 
                          sub.status === 'PENDING' && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
                        ]}
                        onPress={() => handleDirectStatusChange(sub.studentId, 'PENDING')}
                      >
                        <Text style={[
                          styles.inlineChipText, 
                          { color: sub.status === 'PENDING' ? '#D97706' : '#64748B' }
                        ]}>Pending</Text>
                      </Pressable>

                      {/* Submitted Button */}
                      <Pressable 
                        style={[
                          styles.inlineChip, 
                          sub.status === 'SUBMITTED' && { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' }
                        ]}
                        onPress={() => handleDirectStatusChange(sub.studentId, 'SUBMITTED')}
                      >
                        <Text style={[
                          styles.inlineChipText, 
                          { color: sub.status === 'SUBMITTED' ? '#2563EB' : '#64748B' }
                        ]}>Submitted</Text>
                      </Pressable>

                      {/* Grade Button */}
                      <Pressable 
                        style={[
                          styles.inlineChip, 
                          sub.status === 'EVALUATED' && { backgroundColor: '#D1FAE5', borderColor: '#10B981' }
                        ]}
                        onPress={() => handleOpenGrading(sub)}
                      >
                        <Text style={[
                          styles.inlineChipText, 
                          { color: sub.status === 'EVALUATED' ? '#059669' : '#64748B', fontWeight: sub.status === 'EVALUATED' ? '800' : '600' }
                        ]}>
                          {sub.status === 'EVALUATED' ? `${sub.marksObtained} / ${selectedAssForSubmissions.maxMarks}` : 'Grade'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No students in this class registry.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Grading Input Modal Sheet (Sub-Modal) */}
      <Modal visible={showGradingModal} transparent animationType="fade">
        <View style={styles.gradingOverlay}>
          <View style={styles.gradingAlertBox}>
            <Text style={styles.gradingHeaderTitle}>Enter Assignment Grade</Text>
            <Text style={styles.gradingSubTitle}>{gradingStudent?.studentName} (Roll: {gradingStudent?.rollNo})</Text>
            
            <View style={[styles.formGroup, { marginTop: 16 }]}>
              <Text style={styles.formLabel}>Marks Awarded (Max: {selectedAssForSubmissions?.maxMarks || 20})</Text>
              <TextInput
                style={styles.textInput}
                value={gradingMarks}
                onChangeText={handleMarksChangeText}
                placeholder="e.g. 18"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.gradingActions}>
              <Pressable style={styles.gradingCancel} onPress={() => setShowGradingModal(false)}>
                <Text style={styles.gradingCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.gradingSave} onPress={handleSaveGrade}>
                <Text style={styles.gradingSaveText}>Save Grade</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
  content: { padding: 16 },
  tabPane: { gap: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },
  
  // Card
  card: { padding: 16, gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.AppOutline, borderRadius: 14 },
  
  // Assessments Styles
  addBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  actionBtnGroup: { flexDirection: 'row', gap: 8 },
  actionIconButton: { padding: 6, borderRadius: 6, backgroundColor: '#F1F5F9' },

  assHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  assMeta: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  
  assDescWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  assDescText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },

  assProgress: { gap: 6, marginTop: 6 },
  assSubLabel: { fontSize: 12, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  assSubPercent: { fontSize: 13, fontWeight: '700', color: Colors.AppOnBackground },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  assDateText: { fontSize: 11, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  remindBtnText: { fontSize: 11, fontWeight: '800', color: Colors.BluePrimary },

  // Forms
  formGroup: { gap: 4, marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  chipSelectorGroup: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  selectorChipActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  selectorChipText: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  selectorChipTextActive: { color: '#FFFFFF' },
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

  // Picker & Sheet Styles
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
    width: '100%',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
  },

  // Submission rows
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  studentRollText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  gradeMarksValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#059669',
    marginRight: 4,
  },
  gradeMarksPending: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginRight: 4,
  },

  // Badges
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeSubmitted: {
    backgroundColor: '#DBEAFE',
  },
  badgeEvaluated: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Grading modal sub overlay
  gradingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10000,
  },
  gradingAlertBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  gradingHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  gradingSubTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  gradingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  gradingCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  gradingCancelText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
  },
  gradingSave: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.BluePrimary,
  },
  gradingSaveText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inlineButtonGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  inlineChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  inlineChipText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
