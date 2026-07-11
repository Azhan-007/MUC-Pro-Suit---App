import React from 'react';
import * as DocumentPicker from 'expo-document-picker';
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
  ArrowLeft, BookOpen, FileText, ClipboardList, Plus, X, UploadCloud, CheckCircle, 
  Pencil, Trash2, Search, Lock, ChevronRight, MoreVertical, ChevronDown 
} from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, CustomButton, useCampusAlert } from '../../components';
import {
  mockStudyMaterials as initialStudyMaterials,
} from '../../data/mockFacultyData';

type ActiveTab = 'COURSES' | 'MATERIALS' | 'EXTERNAL_MARKS';

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

interface Teacher {
  name: string;
  id: string;
  avatar: string;
}

interface CourseRecord {
  id: string;
  code: string;
  subject: string;
  type: string;
  enrollment: number;
  term: string;
  teachers: Teacher[];
  classInfo: string;
  academicYear: string;
  shift?: 'SHIFT_I' | 'SHIFT_II' | 'GIRLS';
}

export const FacultyAcademicHubScreen: React.FC = () => {
  const router = useRouter();
  const { showAlert } = useCampusAlert();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('COURSES');

  React.useEffect(() => {
    if (params.tab && ['COURSES', 'MATERIALS', 'EXTERNAL_MARKS'].includes(params.tab)) {
      setActiveTab(params.tab as ActiveTab);
    }
  }, [params.tab]);

  // Search & Academic Year States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedYearFilter, setSelectedYearFilter] = React.useState('2025-26');
  const [showYearPicker, setShowYearPicker] = React.useState(false);

  // Add Course Form States
  const [showAddCourseModal, setShowAddCourseModal] = React.useState(false);
  const [newCourseCode, setNewCourseCode] = React.useState('');
  const [newCourseSubject, setNewCourseSubject] = React.useState('');
  const [newCourseEnrollment, setNewCourseEnrollment] = React.useState('');
  const [newCourseTerm, setNewCourseTerm] = React.useState('');
  const [newCourseClass, setNewCourseClass] = React.useState('');
  const [newCourseYear, setNewCourseYear] = React.useState('2025-26');
  const [newCourseType, setNewCourseType] = React.useState<'Theory' | 'Practical'>('Theory');
  const [newCourseShift, setNewCourseShift] = React.useState<'SHIFT_I' | 'SHIFT_II' | 'GIRLS'>('SHIFT_I');

  // Study Notes File Pick States
  const [selectedFileName, setSelectedFileName] = React.useState('');
  const [selectedFileSize, setSelectedFileSize] = React.useState('');
  const [selectedFileType, setSelectedFileType] = React.useState('PDF');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], // PDF, DOCX, PPTX
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const name = file.name;
        const sizeInBytes = file.size || 0;
        const sizeInMB = sizeInBytes > 0 ? (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB' : '1.5 MB';
        
        let ext = 'PDF';
        if (name.toLowerCase().endsWith('.docx') || name.toLowerCase().endsWith('.doc')) ext = 'DOCX';
        if (name.toLowerCase().endsWith('.pptx') || name.toLowerCase().endsWith('.ppt')) ext = 'PPTX';
        
        setSelectedFileName(name);
        setSelectedFileSize(sizeInMB);
        setSelectedFileType(ext);
        
        if (!newMatTitle) {
          const dotIdx = name.lastIndexOf('.');
          const cleanTitle = dotIdx !== -1 
            ? name.substring(0, dotIdx).replace(/_/g, ' ').replace(/-/g, ' ')
            : name.replace(/_/g, ' ').replace(/-/g, ' ');
          setNewMatTitle(cleanTitle);
        }
      }
    } catch (err) {
      console.log('Error picking document:', err);
      showAlert('Error', 'Failed to pick a document.');
    }
  };

  // Courses state initialized with DBMS and OS data
  const [editingCourseId, setEditingCourseId] = React.useState<string | null>(null);
  const [showCourseActionsModal, setShowCourseActionsModal] = React.useState(false);
  const [selectedActionCourse, setSelectedActionCourse] = React.useState<CourseRecord | null>(null);
  const [courses, setCourses] = React.useState<CourseRecord[]>([
    {
      id: "c1",
      code: "CS301",
      subject: "DATABASE MANAGEMENT SYSTEM",
      type: "Theory",
      enrollment: 52,
      term: "Third",
      teachers: [
        { name: "Dr P Rizwan Ahmed", id: "1001", avatar: "RA" },
        { name: "Dr. AYESHA SIDDIQUA J", id: "1075", avatar: "AS" },
      ],
      classInfo: "III BSC CS - 2025-26",
      academicYear: "2025-26",
      shift: "SHIFT_I",
    },
    {
      id: "c2",
      code: "CS201",
      subject: "OPERATING SYSTEM",
      type: "Theory",
      enrollment: 48,
      term: "Second",
      teachers: [
        { name: "Dr P Rizwan Ahmed", id: "1001", avatar: "RA" },
        { name: "Dr. K H KALEEMULLAH", id: "1010", avatar: "KK" },
      ],
      classInfo: "II BSC CS - 2025-26",
      academicYear: "2025-26",
      shift: "SHIFT_I",
    },
  ]);

  // Study Materials State
  const [materials, setMaterials] = React.useState(initialStudyMaterials);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [newMatTitle, setNewMatTitle] = React.useState('');
  const [newMatSubject, setNewMatSubject] = React.useState('Database Management System');
  const [editingMaterialId, setEditingMaterialId] = React.useState<string | null>(null);

  // External Marks Entry State
  const [studentRegNo, setStudentRegNo] = React.useState('');
  const [externalMarkValue, setExternalMarkValue] = React.useState('');
  const [externalSubject, setExternalSubject] = React.useState('Database Management System');

  const handleEditMaterialPress = (mat: any) => {
    setEditingMaterialId(mat.id);
    setNewMatTitle(mat.title);
    setNewMatSubject(mat.subject);
    setShowUploadModal(true);
  };

  const handleDeleteMaterial = (id: string) => {
    showAlert(
      'Delete Material',
      'Are you sure you want to delete this study material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMaterials((prev) => prev.filter((m) => m.id !== id));
            showAlert('Deleted', 'Study material deleted successfully.');
          }
        }
      ]
    );
  };

  const handleAddMaterial = () => {
    if (!newMatTitle.trim()) {
      showAlert('Error', 'Please enter a topic/title name.');
      return;
    }
    if (!editingMaterialId && !selectedFileName) {
      showAlert('Error', 'Please press the zone below to select a document file.');
      return;
    }
    if (editingMaterialId) {
      setMaterials((prev) => prev.map((m) =>
        m.id === editingMaterialId
          ? { ...m, subject: newMatSubject, title: newMatTitle }
          : m
      ));
      setEditingMaterialId(null);
      setNewMatTitle('');
      setSelectedFileName('');
      setSelectedFileSize('');
      setShowUploadModal(false);
      showAlert('Success', 'Study material updated successfully!');
    } else {
      const newMat = {
        id: 'mat_' + Date.now(),
        subject: newMatSubject,
        title: newMatTitle,
        fileType: selectedFileType,
        fileSize: selectedFileSize,
        dateAdded: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setMaterials([newMat, ...materials]);
      setNewMatTitle('');
      setSelectedFileName('');
      setSelectedFileSize('');
      setShowUploadModal(false);
      showAlert('Success', 'Study material uploaded successfully!');
    }
  };

  const handleCourseMenuPress = (course: CourseRecord) => {
    showAlert(
      "Course Options",
      `Manage options for ${course.subject}:`,
      [
        {
          text: "Edit Course",
          onPress: () => {
            setEditingCourseId(course.id);
            setNewCourseCode(course.code);
            setNewCourseSubject(course.subject);
            setNewCourseType(course.type as any || 'Theory');
            setNewCourseShift(course.shift || 'SHIFT_I');
            setNewCourseEnrollment(String(course.enrollment));
            setNewCourseTerm(course.term);
            setNewCourseClass(course.classInfo);
            setNewCourseYear(course.academicYear);
            setShowAddCourseModal(true);
          }
        },
        {
          text: "Delete Course",
          style: "destructive",
          onPress: () => {
            showAlert(
              "Delete Course",
              "Are you sure you want to delete this course?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    setCourses((prev) => prev.filter((c) => c.id !== course.id));
                    showAlert("Deleted", "Course deleted successfully.");
                  }
                }
              ]
            );
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleAddCourse = () => {
    if (!newCourseCode.trim() || !newCourseSubject.trim() || !newCourseClass.trim()) {
      showAlert('Error', 'Please fill in Course Code, Subject Name, and Class details.');
      return;
    }
    const enrollmentVal = parseInt(newCourseEnrollment, 10) || 40;
    if (editingCourseId) {
      setCourses((prev) => prev.map((c) =>
        c.id === editingCourseId
          ? {
              ...c,
              code: newCourseCode.toUpperCase(),
              subject: newCourseSubject.toUpperCase(),
              type: newCourseType,
              shift: newCourseShift,
              enrollment: enrollmentVal,
              term: newCourseTerm,
              classInfo: newCourseClass,
              academicYear: newCourseYear,
            }
          : c
      ));
      setEditingCourseId(null);
      showAlert('Success', 'Course updated successfully!');
    } else {
      const newCourse: CourseRecord = {
        id: 'c_' + Date.now(),
        code: newCourseCode.toUpperCase(),
        subject: newCourseSubject.toUpperCase(),
        type: newCourseType,
        shift: newCourseShift,
        enrollment: enrollmentVal,
        term: newCourseTerm || "First",
        teachers: [
          { name: "Dr P Rizwan Ahmed", id: "1001", avatar: "RA" }
        ],
        classInfo: newCourseClass,
        academicYear: newCourseYear,
      };
      setCourses([...courses, newCourse]);
      showAlert('Success', 'Course created successfully.');
    }
    setShowAddCourseModal(false);
    setNewCourseCode('');
    setNewCourseSubject('');
    setNewCourseType('Theory');
    setNewCourseShift('SHIFT_I');
    setNewCourseEnrollment('');
    setNewCourseTerm('');
    setNewCourseClass('');
  };

  const handleSubmitExternalMarks = () => {
    if (!studentRegNo.trim() || !externalMarkValue.trim()) {
      showAlert('Error', 'Please fill in both Register Number and Marks.');
      return;
    }
    showAlert(
      'Submit External Marks',
      `Submit external marks for Register No: ${studentRegNo}\nSubject: ${externalSubject}\nMarks: ${externalMarkValue}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            showAlert('Success', 'External Marks submitted successfully!');
            setStudentRegNo('');
            setExternalMarkValue('');
          },
        },
      ]
    );
  };

  const handleFinalResultSubmission = () => {
    showAlert(
      'Result Submission',
      'This will submit final exam results of BSC CS to the Controller of Examinations. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Results', onPress: () => showAlert('Success', 'Final results submitted and locked successfully.') },
      ]
    );
  };

  // Filtered courses listing
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.subject.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYearFilter === 'All' || c.academicYear === selectedYearFilter;
    return matchesSearch && matchesYear;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Academic Management</Text>
        <View style={styles.spacer} />
      </View>

      {/* Sliding Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {(['COURSES', 'MATERIALS', 'EXTERNAL_MARKS'] as ActiveTab[]).map((tab) => {
            const active = activeTab === tab;
            const label = tab === 'COURSES' ? 'My Courses' : tab === 'MATERIALS' ? 'Study Materials' : 'External & Results';
            return (
              <Pressable
                key={tab}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ──── COURSES TAB ──── */}
        {activeTab === 'COURSES' && (
          <View style={styles.tabPane}>
            {/* Search and Year filter row */}
            <View style={styles.filterControlsRow}>
              <View style={styles.searchBarWrapper}>
                <Search size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Sea..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Pressable style={styles.yearDropdownTrigger} onPress={() => setShowYearPicker(true)}>
                <Text style={styles.yearDropdownText} numberOfLines={1}>
                  {selectedYearFilter === 'All' ? 'Academic year' : selectedYearFilter}
                </Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>
            </View>

            {filteredCourses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No courses match the criteria.</Text>
              </View>
            ) : (
              filteredCourses.map((course) => (
                <CampusCard key={course.id} style={styles.courseCard} elevation="sm">
                  {/* Top Row: Circular Icon + Subject Details + Type Tag */}
                  <View style={styles.courseHeaderRow}>
                    <View style={styles.courseLeftInfo}>
                      <View style={styles.courseIconBox}>
                        <BookOpen size={18} color={Colors.BluePrimary} />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.courseCodeText}>{course.code}</Text>
                        <Text style={styles.courseTitleText}>{course.subject}</Text>
                      </View>
                    </View>
                    <View style={styles.courseTypeTag}>
                      <Text style={styles.courseTypeTagText}>{course.type}</Text>
                    </View>
                  </View>

                  <View style={styles.courseDetailsDivider} />

                  {/* Enrollment and Term */}
                  <View style={styles.courseMetaRow}>
                    <Text style={styles.courseMetaLabel}>Enrollment : <Text style={styles.courseMetaValue}>{course.enrollment}</Text></Text>
                    <Text style={styles.courseMetaLabel}>Term : <Text style={styles.courseMetaValue}>{course.term}</Text></Text>
                  </View>

                  {/* Attendance & Course Status Lock Row */}
                  <View style={styles.statusLockRow}>
                    <Text style={styles.statusLabelText}>Status</Text>
                    <View style={styles.statusIconsContainer}>
                      <Text style={styles.statusLabelText}>Attendance : </Text>
                      <View style={styles.lockIconBox}>
                        <Lock size={12} color="#10B981" />
                      </View>
                      <Text style={[styles.statusLabelText, { marginLeft: 12 }]}>Course : </Text>
                      <View style={styles.lockIconBox}>
                        <Lock size={12} color="#10B981" />
                      </View>
                    </View>
                  </View>

                  {/* Teachers Avatar List */}
                  <View style={styles.teachersSection}>
                    <Text style={styles.teachersTitle}>Teachers</Text>
                    {course.teachers.map((teacher, tIdx) => (
                      <View key={tIdx} style={styles.teacherRow}>
                        <View style={styles.teacherAvatar}>
                          <Text style={styles.teacherAvatarText}>{teacher.avatar}</Text>
                        </View>
                        <View>
                          <Text style={styles.teacherNameText}>{teacher.name}</Text>
                          <Text style={styles.teacherIdText}>{teacher.id}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Class Link bar */}
                  <Pressable 
                    style={styles.classInfoRow} 
                    onPress={() => {
                      setSelectedActionCourse(course);
                      setShowCourseActionsModal(true);
                    }}
                  >
                    <Text style={styles.classInfoText}>
                      Class : {course.classInfo} {course.shift ? `(${course.shift === 'SHIFT_I' ? 'Shift I' : course.shift === 'SHIFT_II' ? 'Shift II' : 'Girls'})` : ''}
                    </Text>
                    <ChevronRight size={16} color="#64748B" />
                  </Pressable>
                </CampusCard>
              ))
            )}
          </View>
        )}

        {/* ──── MATERIALS TAB ──── */}
        {activeTab === 'MATERIALS' && (
          <View style={styles.tabPane}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Tutorials & Notes</Text>
              <Pressable style={styles.addBtn} onPress={() => setShowUploadModal(true)}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Upload New</Text>
              </Pressable>
            </View>

            {materials.map((mat) => (
              <CampusCard key={mat.id} style={styles.materialCard} elevation="sm">
                <View style={styles.materialRow}>
                  <View style={[styles.fileIconBox, { backgroundColor: Colors.BluePrimary + '15' }]}>
                    <FileText size={20} color={Colors.BluePrimary} />
                  </View>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{mat.title}</Text>
                    <Text style={styles.materialMeta}>{mat.subject} · {mat.fileType} ({mat.fileSize})</Text>
                    <Text style={styles.materialDate}>Added: {mat.dateAdded}</Text>
                  </View>
                  <View style={styles.actionBtnGroup}>
                    <Pressable onPress={() => handleEditMaterialPress(mat)} style={styles.actionIconButton}>
                      <Pencil size={15} color={Colors.BluePrimary} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteMaterial(mat.id)} style={styles.actionIconButton}>
                      <Trash2 size={15} color={Colors.ColorAbsent} />
                    </Pressable>
                  </View>
                </View>
              </CampusCard>
            ))}
          </View>
        )}

        {/* ──── EXTERNAL MARKS TAB ──── */}
        {activeTab === 'EXTERNAL_MARKS' && (
          <View style={styles.tabPane}>
            <CampusCard style={styles.card} elevation="sm">
              <Text style={styles.sectionTitle}>Record Semester End Marks</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subject</Text>
                <View style={styles.chipSelectorGroup}>
                  {['Database Management System', 'Operating System'].map((sub) => {
                    const active = externalSubject === sub;
                    return (
                      <Pressable
                        key={sub}
                        style={[styles.selectorChip, active && styles.selectorChipActive]}
                        onPress={() => setExternalSubject(sub)}
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
                <Text style={styles.formLabel}>Student Register Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={studentRegNo}
                  onChangeText={setStudentRegNo}
                  placeholder="e.g. MUC710"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>External Marks Value</Text>
                <TextInput
                  style={styles.textInput}
                  value={externalMarkValue}
                  onChangeText={setExternalMarkValue}
                  placeholder="e.g. 58"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>

              <Pressable style={styles.submitBtn} onPress={handleSubmitExternalMarks}>
                <Text style={styles.submitBtnText}>Submit Marks</Text>
              </Pressable>
            </CampusCard>

            <CampusCard style={styles.card} elevation="sm">
              <Text style={styles.resultTitle}>Consolidated Result Sheet</Text>
              <Text style={styles.resultDesc}>
                Lock and publish semester marks for B.Sc Computer Science. This compiles both internal assessments and external papers.
              </Text>
              
              <View style={styles.resultInfoRow}>
                <View style={styles.resultInfoCol}>
                  <Text style={styles.resultInfoLabel}>Total Students</Text>
                  <Text style={styles.resultInfoValue}>52</Text>
                </View>
                <View style={styles.resultInfoCol}>
                  <Text style={styles.resultInfoLabel}>Marks Entered</Text>
                  <Text style={[styles.resultInfoValue, { color: '#10B981' }]}>52 / 52</Text>
                </View>
                <View style={styles.resultInfoCol}>
                  <Text style={styles.resultInfoLabel}>Term</Text>
                  <Text style={styles.resultInfoValue}>Third</Text>
                </View>
              </View>

              <Pressable style={styles.resultSubmitBtn} onPress={handleFinalResultSubmission}>
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.resultSubmitText}>Publish & Lock Results</Text>
              </Pressable>
            </CampusCard>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button (Courses list add FAB) */}
      {activeTab === 'COURSES' && (
        <Pressable style={styles.fabBtn} onPress={() => setShowAddCourseModal(true)}>
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Study Notes Uploader Modal Sheet */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowUploadModal(false)} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {editingMaterialId ? 'Edit Study Note' : 'Upload Study Materials'}
                </Text>
                <Pressable onPress={() => { setShowUploadModal(false); setEditingMaterialId(null); setNewMatTitle(''); setSelectedFileName(''); }} style={styles.pickerCloseBtn}>
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
                      const active = newMatSubject === sub;
                      return (
                        <Pressable
                          key={sub}
                          style={[styles.selectorChip, active && styles.selectorChipActive]}
                          onPress={() => setNewMatSubject(sub)}
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
                  <Text style={styles.formLabel}>Topic / Title Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newMatTitle}
                    onChangeText={setNewMatTitle}
                    placeholder="e.g. Unit 3 - Query Optimization"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {!editingMaterialId && (
                  <Pressable style={styles.uploadDropZone} onPress={handlePickDocument}>
                    {selectedFileName ? (
                      <>
                        <FileText size={36} color={Colors.BluePrimary} />
                        <Text style={[styles.uploadText, { color: Colors.AppOnBackground, marginTop: 4, textAlign: 'center' }]}>
                          {selectedFileName}
                        </Text>
                        <Text style={styles.uploadSub}>
                          Size: {selectedFileSize} · Format: {selectedFileType}
                        </Text>
                        <Text style={[styles.uploadText, { fontSize: 12, color: Colors.BluePrimary, marginTop: 8 }]}>
                          Tap to select a different file
                        </Text>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={32} color={Colors.BluePrimary} />
                        <Text style={styles.uploadText}>Select Document File</Text>
                        <Text style={styles.uploadSub}>PDF, PPTX, or DOCX (max 10MB)</Text>
                      </>
                    )}
                  </Pressable>
                )}

                <CustomButton
                  text={editingMaterialId ? 'Save Changes' : 'Upload Document'}
                  onPress={handleAddMaterial}
                  style={{ marginTop: 12 }}
                />
              </ScrollView>
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* Add Course Form Modal Sheet */}
      <Modal visible={showAddCourseModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowAddCourseModal(false)} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{editingCourseId ? 'Edit Course Details' : 'Add New Course'}</Text>
                <Pressable onPress={() => setShowAddCourseModal(false)} style={styles.pickerCloseBtn}>
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
                  <Text style={styles.formLabel}>Course Code</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCourseCode}
                    onChangeText={setNewCourseCode}
                    placeholder="e.g. 25BLU30"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Course Subject Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCourseSubject}
                    onChangeText={setNewCourseSubject}
                    placeholder="e.g. URDU III"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Course Type</Text>
                  <View style={styles.chipSelectorGroup}>
                    {['Theory', 'Practical'].map((type) => {
                      const active = newCourseType === type;
                      return (
                        <Pressable
                          key={type}
                          style={[styles.selectorChip, active && styles.selectorChipActive]}
                          onPress={() => setNewCourseType(type as any)}
                        >
                          <Text style={[styles.selectorChipText, active && styles.selectorChipTextActive]}>
                            {type}
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
                      const active = newCourseShift === sh;
                      const label = sh === 'SHIFT_I' ? 'Shift I' : sh === 'SHIFT_II' ? 'Shift II' : 'Girls';
                      return (
                        <Pressable
                          key={sh}
                          style={[styles.selectorChip, active && styles.selectorChipActive]}
                          onPress={() => setNewCourseShift(sh as any)}
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
                  <Text style={styles.formLabel}>Enrollment Count</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCourseEnrollment}
                    onChangeText={setNewCourseEnrollment}
                    placeholder="e.g. 49"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Term (Semester)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCourseTerm}
                    onChangeText={setNewCourseTerm}
                    placeholder="e.g. Third"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Class / Section</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCourseClass}
                    onChangeText={setNewCourseClass}
                    placeholder="e.g. II BA CE, BCOM CS 2025 - 26"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Academic Year</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCourseYear}
                    onChangeText={setNewCourseYear}
                    placeholder="e.g. 2025-26"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <CustomButton text={editingCourseId ? 'Save Changes' : 'Add Course'} onPress={handleAddCourse} style={{ marginTop: 12 }} />
              </ScrollView>
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* Academic Year Dropdown Menu */}
      <Modal visible={showYearPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowYearPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Academic Year</Text>
              <Pressable onPress={() => setShowYearPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView style={[styles.pickerList, { flexShrink: 1 }]} showsVerticalScrollIndicator={false}>
              {['All', '2026-27', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'].map((yr) => {
                const active = selectedYearFilter === yr;
                return (
                  <Pressable
                    key={yr}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedYearFilter(yr);
                      setShowYearPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>
                      {yr === 'All' ? 'All Years' : yr}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Course Actions Popup Modal Sheet */}
      <Modal visible={showCourseActionsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowCourseActionsModal(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.pickerTitle}>Course Management</Text>
                {selectedActionCourse && (
                  <Text style={styles.pickerSubtitle}>
                    {selectedActionCourse.code} · {selectedActionCourse.subject}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => setShowCourseActionsModal(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            <View style={styles.actionsModalContent}>
              <Pressable
                style={styles.actionRow}
                onPress={() => {
                  if (selectedActionCourse) {
                    setEditingCourseId(selectedActionCourse.id);
                    setNewCourseCode(selectedActionCourse.code);
                    setNewCourseSubject(selectedActionCourse.subject);
                    setNewCourseType(selectedActionCourse.type as any || 'Theory');
                    setNewCourseShift(selectedActionCourse.shift || 'SHIFT_I');
                    setNewCourseEnrollment(String(selectedActionCourse.enrollment));
                    setNewCourseTerm(selectedActionCourse.term);
                    setNewCourseClass(selectedActionCourse.classInfo);
                    setNewCourseYear(selectedActionCourse.academicYear);
                    setShowCourseActionsModal(false);
                    setShowAddCourseModal(true);
                  }
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: Colors.BluePrimary + '15' }]}>
                  <Pencil size={20} color={Colors.BluePrimary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitleText}>Edit Course Details</Text>
                  <Text style={styles.actionDescText}>Modify course code, name, term, or class details</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.actionRow}
                onPress={() => {
                  if (selectedActionCourse) {
                    setShowCourseActionsModal(false);
                    showAlert(
                      "Delete Course",
                      `Are you sure you want to delete ${selectedActionCourse.subject}? This action cannot be undone.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            setCourses((prev) => prev.filter((c) => c.id !== selectedActionCourse.id));
                            showAlert("Deleted", "Course deleted successfully.");
                          }
                        }
                      ]
                    );
                  }
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: Colors.ColorAbsent + '15' }]}>
                  <Trash2 size={20} color={Colors.ColorAbsent} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={[styles.actionTitleText, { color: Colors.ColorAbsent }]}>Delete Course</Text>
                  <Text style={styles.actionDescText}>Remove this course from your academic portfolio</Text>
                </View>
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
  tabBar: {
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  tabBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: Colors.BluePrimary,
  },
  tabLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  tabLabelActive: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  tabPane: { gap: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },
  
  // Controls Row for filtering
  filterControlsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.AppOnBackground,
    padding: 0,
  },
  yearDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    minWidth: 130,
  },
  yearDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  // MUC Course Cards Styling
  courseCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    borderRadius: 14,
    marginBottom: 2,
    gap: 12,
  },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  courseIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.BluePrimary + '0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseCodeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  courseTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  courseTypeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  courseTypeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  courseDetailsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  courseMetaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  statusLockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIconBox: {
    backgroundColor: '#E6FDF4',
    padding: 3,
    borderRadius: 4,
  },
  teachersSection: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  teachersTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teacherAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  teacherNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  teacherIdText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  classInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 2,
  },
  classInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },

  // FAB Style
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.BluePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.BluePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  // Materials & Assessments Styles
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
  materialCard: { padding: 12, marginBottom: 4 },
  materialRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  materialInfo: { flex: 1 },
  materialTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  materialMeta: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  materialDate: { fontSize: 10, color: Colors.AppOnSurfaceVariant + '80', marginTop: 1 },
  actionBtnGroup: { flexDirection: 'row', gap: 8 },
  actionIconButton: { padding: 6, borderRadius: 6, backgroundColor: '#F1F5F9' },

  card: { padding: 16, gap: 16 },
  assHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  assMeta: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  assProgress: { gap: 6, marginTop: 10 },
  assSubLabel: { fontSize: 12, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  assSubPercent: { fontSize: 13, fontWeight: '700', color: Colors.AppOnBackground },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  assDateText: { fontSize: 11, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  remindBtnText: { fontSize: 11, fontWeight: '800', color: Colors.BluePrimary },

  formGroup: { gap: 4, marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  chipSelectorGroup: { flexDirection: 'row', gap: 8 },
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
  submitBtn: {
    backgroundColor: Colors.BluePrimary,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  resultTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground },
  resultDesc: { fontSize: 12, color: Colors.AppOnSurfaceVariant, lineHeight: 18 },
  resultInfoRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  resultInfoCol: { gap: 4 },
  resultInfoLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  resultInfoValue: { fontSize: 18, fontWeight: '800', color: Colors.BluePrimary },
  resultSubmitBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  resultSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

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
    paddingBottom: 24,
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
  modalScrollContent: {
    padding: 20,
    gap: 16,
  },
  uploadDropZone: {
    borderWidth: 2,
    borderColor: Colors.BluePrimary,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BluePrimary + '05',
    gap: 8,
    marginVertical: 12,
  },
  uploadText: { fontSize: 14, fontWeight: '700', color: Colors.BluePrimary },
  uploadSub: { fontSize: 11, color: Colors.AppOnSurfaceVariant },

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
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  pickerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  actionsModalContent: {
    padding: 20,
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
    gap: 2,
  },
  actionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  actionDescText: {
    fontSize: 11,
    color: '#64748B',
  },
});
