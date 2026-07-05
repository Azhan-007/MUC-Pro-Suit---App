import React, { useState, useMemo, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, Search, Users, UserCheck, MessageSquare,
  ChevronRight, ChevronDown, X, Phone, Mail, Pencil, Trash2,
  BookOpen, Calendar, ClipboardList, FileText, DollarSign,
  Clock, AlertTriangle, CheckCircle, TrendingUp, User,
} from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, useCampusAlert } from '../../components';
import { mockClassStudents, mockMentees as initialMentees } from '../../data/mockFacultyData';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type DayStatus = 'Present' | 'Absent' | 'On Duty' | 'Medical Leave' | 'Leave' | 'Discontinued';
type ActiveTab = 'STUDENTS' | 'MENTOR';
type FilterKey = 'ALL' | 'PRESENT' | 'ABSENT' | 'ON_DUTY' | 'MEDICAL' | 'BELOW65' | 'BELOW75' | 'ABOVE75' | 'ABOVE90';
type MentorFilterKey = 'ALL' | 'LOW_ATTENDANCE' | 'LOW_MARKS' | 'PENDING_ASSIGNMENTS' | 'CONTINUOUS_ABSENCE' | 'ON_LEAVE' | 'HIGH_RISK' | 'EXCELLENT';
type TrendStatus = 'Improving' | 'Stable' | 'Declining';
type AcademicRisk = 'Low' | 'Moderate' | 'High';
type CounselingStatus = 'Open' | 'In Progress' | 'Closed';

interface SubjectAttendance {
  subject: string;
  attended: number;
  total: number;
  percent: number;
}

interface InternalMark {
  subject: string;
  ia1: number;
  ia2: number;
  max: number;
}

interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  registerNumber: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  email: string;
  mobile: string;
  parentName: string;
  parentContact: string;
  parentEmail: string;
  attendance: number;
  status: DayStatus;
  gpa: number;
  subjectAttendance: SubjectAttendance[];
  internalMarks: InternalMark[];
  assignmentStatus: string;
  labStatus: string;
  mentorNote: string;
}

interface MentorRemark {
  id: string;
  date: string;
  text: string;
}

interface CounselingEntry {
  id: string;
  date: string;
  discussion: string;
  actionTaken: string;
  status: CounselingStatus;
}

interface MentorStudentProfile extends StudentProfile {
  attendancePercent: number;
  internalAverage: number;
  assignmentCompletion: number;
  semesterProgress: number;
  continuousAbsenceDays: number;
  leaveDaysThisMonth: number;
  attendanceTrend: TrendStatus;
  marksTrend: TrendStatus;
  overallPerformance: string;
  academicRisk: AcademicRisk;
  mentorRemarks: MentorRemark[];
  counselingLogs: CounselingEntry[];
  librarySummary: string;
  leaveHistorySummary: string;
}

// ─────────────────────────────────────────────
// EXTENDED MOCK DATA
// ─────────────────────────────────────────────
const buildStudentProfiles = (): StudentProfile[] => {
  const raw = [
    { id: 's01', att: 89, status: 'Present' as DayStatus,   gpa: 8.6, parent: 'Tariq Ahmed',    parentMobile: '+91 98765 43210', mobile: '+91 90000 11001', email: 'azhan.t@mucstudent.ac.in',       note: 'Excellent student. Very focused.',          assn: 'All Submitted',  lab: 'Completed' },
    { id: 's02', att: 72, status: 'Absent' as DayStatus,    gpa: 6.4, parent: 'Khalid Khan',     parentMobile: '+91 87654 32109', mobile: '+91 90000 11002', email: 'abdulrahman.k@mucstudent.ac.in',  note: 'Low attendance. Parent meeting required.',  assn: '2 Pending',      lab: 'Incomplete' },
    { id: 's03', att: 95, status: 'Present' as DayStatus,   gpa: 9.2, parent: 'Mohamed Siddiq',  parentMobile: '+91 76543 21098', mobile: '+91 90000 11003', email: 'fathima.z@mucstudent.ac.in',      note: 'Topper. Needs higher challenges.',          assn: 'All Submitted',  lab: 'Completed' },
    { id: 's04', att: 80, status: 'On Duty' as DayStatus,   gpa: 7.8, parent: 'Siddiq Patel',    parentMobile: '+91 65432 10987', mobile: '+91 90000 11004', email: 'ibrahim.s@mucstudent.ac.in',      note: 'Good overall performance.',                 assn: 'All Submitted',  lab: 'In Progress' },
    { id: 's05', att: 74, status: 'Present' as DayStatus,   gpa: 7.1, parent: 'Raheem Banu',     parentMobile: '+91 54321 09876', mobile: '+91 90000 11005', email: 'ayesha.b@mucstudent.ac.in',       note: 'Needs improvement in theory subjects.',     assn: '1 Pending',      lab: 'Completed' },
    { id: 's06', att: 68, status: 'Medical Leave' as DayStatus, gpa: 5.9, parent: 'Farooq Sheikh',parentMobile: '+91 43210 98765', mobile: '+91 90000 11006', email: 'umar.f@mucstudent.ac.in',         note: 'Health issues. Follow up with parent.',     assn: '3 Pending',      lab: 'Incomplete' },
    { id: 's07', att: 91, status: 'Present' as DayStatus,   gpa: 8.9, parent: 'Nasreen Aslam',   parentMobile: '+91 32109 87654', mobile: '+91 90000 11007', email: 'zainab.n@mucstudent.ac.in',       note: 'Consistent and disciplined.',               assn: 'All Submitted',  lab: 'Completed' },
    { id: 's08', att: 77, status: 'Present' as DayStatus,   gpa: 7.5, parent: 'Ali Mahmood',     parentMobile: '+91 21098 76543', mobile: '+91 90000 11008', email: 'hassan.a@mucstudent.ac.in',       note: 'Steady progress this semester.',            assn: 'All Submitted',  lab: 'In Progress' },
    { id: 's09', att: 83, status: 'Leave' as DayStatus,     gpa: 8.1, parent: 'Siddiqui Farida', parentMobile: '+91 10987 65432', mobile: '+91 90000 11009', email: 'maryam.s@mucstudent.ac.in',       note: 'Reliable and hardworking.',                 assn: 'All Submitted',  lab: 'Completed' },
    { id: 's10', att: 60, status: 'Absent' as DayStatus,    gpa: 5.2, parent: 'Khalid Bilal',    parentMobile: '+91 99887 76655', mobile: '+91 90000 11010', email: 'yusuf.k@mucstudent.ac.in',        note: 'Critical attendance. Intervention needed.', assn: '4 Pending',      lab: 'Incomplete' },
    { id: 's11', att: 86, status: 'Present' as DayStatus,   gpa: 8.3, parent: 'Begum Naseema',   parentMobile: '+91 88776 65544', mobile: '+91 90000 11011', email: 'safia.b@mucstudent.ac.in',        note: 'Good academic record.',                     assn: 'All Submitted',  lab: 'Completed' },
    { id: 's12', att: 78, status: 'Present' as DayStatus,   gpa: 7.4, parent: 'Ismail Hassan',   parentMobile: '+91 77665 54433', mobile: '+91 90000 11012', email: 'tariq.i@mucstudent.ac.in',        note: 'Improving since last semester.',            assn: '1 Pending',      lab: 'In Progress' },
    { id: 's13', att: 92, status: 'Present' as DayStatus,   gpa: 9.0, parent: 'Huda Zaman',      parentMobile: '+91 66554 43322', mobile: '+91 90000 11013', email: 'noor.z@mucstudent.ac.in',         note: 'Outstanding. Recommend for merit award.',   assn: 'All Submitted',  lab: 'Completed' },
    { id: 's14', att: 71, status: 'On Duty' as DayStatus,   gpa: 6.9, parent: 'Qasim Tariq',     parentMobile: '+91 55443 32211', mobile: '+91 90000 11014', email: 'sulaiman.q@mucstudent.ac.in',     note: 'Good participation in events.',             assn: '2 Pending',      lab: 'Completed' },
    { id: 's15', att: 88, status: 'Present' as DayStatus,   gpa: 8.7, parent: 'Farouk Aisha',    parentMobile: '+91 44332 21100', mobile: '+91 90000 11015', email: 'ruqayyah.f@mucstudent.ac.in',     note: 'Active in class. Very participative.',      assn: 'All Submitted',  lab: 'Completed' },
  ];

  const subjects = [
    'Database Management System',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Data Structures & Algorithms',
  ];

  return mockClassStudents.map((s) => {
    const r = raw.find((x) => x.id === s.id) ?? raw[0];
    const subjectAttendance: SubjectAttendance[] = subjects.map((sub, i) => {
      const base = Math.max(50, r.att + (i % 2 === 0 ? 3 : -4) + (parseInt(s.id.slice(1), 10) % 3) * 2);
      const total = 48 + (i * 2);
      const attended = Math.round((Math.min(base, 98) / 100) * total);
      return { subject: sub, attended, total, percent: Math.round((attended / total) * 100) };
    });
    const internalMarks: InternalMark[] = subjects.slice(0, 4).map((sub, i) => ({
      subject: sub,
      ia1: Math.min(30, Math.round(r.gpa * 3 + i)),
      ia2: Math.min(30, Math.round(r.gpa * 3.1 - i)),
      max: 30,
    }));

    return {
      id: s.id,
      name: s.name,
      rollNo: s.rollNo,
      registerNumber: s.registerNumber,
      department: 'Computer Science',
      year: 'III Year',
      semester: 'VI Semester',
      section: 'A',
      email: r.email,
      mobile: r.mobile,
      parentName: r.parent,
      parentContact: r.parentMobile,
      parentEmail: r.parent.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '@parent.muc.in',
      attendance: r.att,
      status: r.status,
      gpa: r.gpa,
      subjectAttendance,
      internalMarks,
      assignmentStatus: r.assn,
      labStatus: r.lab,
      mentorNote: r.note,
    };
  });
};

const STUDENT_PROFILES = buildStudentProfiles();

const mentorProfileExtras: Record<string, {
  assignmentCompletion: number;
  semesterProgress: number;
  continuousAbsenceDays: number;
  leaveDaysThisMonth: number;
  attendanceTrend: TrendStatus;
  marksTrend: TrendStatus;
  librarySummary: string;
  leaveHistorySummary: string;
  defaultAction: string;
  defaultStatus: CounselingStatus;
  mentorRemarks: MentorRemark[];
}> = {
  s01: {
    assignmentCompletion: 100,
    semesterProgress: 84,
    continuousAbsenceDays: 0,
    leaveDaysThisMonth: 0,
    attendanceTrend: 'Stable',
    marksTrend: 'Improving',
    librarySummary: '2 books currently issued. No overdue items.',
    leaveHistorySummary: 'No leave recorded in the current month.',
    defaultAction: 'Encouraged research paper reading and weekly project milestone tracking.',
    defaultStatus: 'Closed',
    mentorRemarks: [
      { id: 'rem_s01_1', date: '20 Jun 2026', text: 'Strong academic focus. Consider recommending for department symposium.' },
    ],
  },
  s02: {
    assignmentCompletion: 68,
    semesterProgress: 61,
    continuousAbsenceDays: 3,
    leaveDaysThisMonth: 1,
    attendanceTrend: 'Declining',
    marksTrend: 'Declining',
    librarySummary: '1 book issued. 1 previous late return warning.',
    leaveHistorySummary: 'One approved leave and three continuous absences in the current month.',
    defaultAction: 'Parent follow-up, daily attendance monitoring, and pending assignment submission plan.',
    defaultStatus: 'In Progress',
    mentorRemarks: [
      { id: 'rem_s02_1', date: '18 Jun 2026', text: 'Attendance shortage and pending assignments need parent contact.' },
    ],
  },
  s03: {
    assignmentCompletion: 100,
    semesterProgress: 91,
    continuousAbsenceDays: 0,
    leaveDaysThisMonth: 0,
    attendanceTrend: 'Improving',
    marksTrend: 'Stable',
    librarySummary: '3 reference books issued. No overdue items.',
    leaveHistorySummary: 'No leave recorded in the current month.',
    defaultAction: 'Guided on higher studies preparation and coding practice.',
    defaultStatus: 'Closed',
    mentorRemarks: [
      { id: 'rem_s03_1', date: '01 Jun 2026', text: 'Excellent performer. Peer tutoring candidate.' },
    ],
  },
};

const formatDisplayDate = (date: Date = new Date()) =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const getInternalAverage = (student: StudentProfile) => {
  const scores = student.internalMarks.flatMap((m) => [m.ia1, m.ia2]);
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
};

const getOverallPerformance = (student: StudentProfile, internalAverage: number, assignmentCompletion: number) => {
  if (student.gpa >= 8.5 && student.attendance >= 85 && assignmentCompletion === 100 && internalAverage >= 24) {
    return 'Excellent';
  }
  if (student.gpa < 6.5 || internalAverage < 20 || student.attendance < 75) {
    return 'Needs Attention';
  }
  return 'Satisfactory';
};

const getAcademicRisk = (
  attendance: number,
  internalAverage: number,
  assignmentCompletion: number,
  continuousAbsenceDays: number,
): AcademicRisk => {
  const riskCount = [
    attendance < 75,
    internalAverage < 20,
    assignmentCompletion < 100,
    continuousAbsenceDays >= 3,
  ].filter(Boolean).length;

  if (riskCount >= 3) return 'High';
  if (riskCount >= 1) return 'Moderate';
  return 'Low';
};

const buildMentorProfiles = (profiles: StudentProfile[]): MentorStudentProfile[] =>
  initialMentees
    .map((mentee) => {
      const profile = profiles.find((student) => student.id === mentee.id);
      if (!profile) return null;

      const extras = mentorProfileExtras[mentee.id] ?? mentorProfileExtras.s01;
      const internalAverage = getInternalAverage(profile);
      const overallPerformance = getOverallPerformance(profile, internalAverage, extras.assignmentCompletion);
      const academicRisk = getAcademicRisk(
        profile.attendance,
        internalAverage,
        extras.assignmentCompletion,
        extras.continuousAbsenceDays,
      );

      return {
        ...profile,
        attendancePercent: profile.attendance,
        internalAverage,
        assignmentCompletion: extras.assignmentCompletion,
        semesterProgress: extras.semesterProgress,
        continuousAbsenceDays: extras.continuousAbsenceDays,
        leaveDaysThisMonth: extras.leaveDaysThisMonth,
        attendanceTrend: extras.attendanceTrend,
        marksTrend: extras.marksTrend,
        overallPerformance,
        academicRisk,
        mentorRemarks: extras.mentorRemarks,
        counselingLogs: mentee.counselingLogs.map((log, index) => ({
          id: `${mentee.id}_log_${index + 1}`,
          date: log.date,
          discussion: log.notes,
          actionTaken: index === 0 ? extras.defaultAction : 'Reviewed progress and advised continued follow-up.',
          status: index === 0 ? extras.defaultStatus : 'Closed',
        })),
        librarySummary: extras.librarySummary,
        leaveHistorySummary: extras.leaveHistorySummary,
      };
    })
    .filter((student): student is MentorStudentProfile => student !== null);

const MENTOR_STUDENT_PROFILES = buildMentorProfiles(STUDENT_PROFILES);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getAttColor = (pct: number) => {
  if (pct >= 75) return Colors.ColorPresent;   // 🟢 green  ≥75%
  if (pct >= 65) return Colors.ColorPending;   // 🟠 orange 65–74%
  return Colors.ColorAbsent;                  // 🔴 red    <65%
};

const STATUS_COLORS: Record<DayStatus, { bg: string; text: string }> = {
  Present:       { bg: '#DCFCE7', text: '#16A34A' },
  Absent:        { bg: '#FEE2E2', text: '#DC2626' },
  'On Duty':     { bg: '#DBEAFE', text: '#2563EB' },
  'Medical Leave': { bg: '#FEF3C7', text: '#D97706' },
  Leave:         { bg: '#F1F5F9', text: '#64748B' },
  Discontinued:  { bg: '#F3E8FF', text: '#7C3AED' },
};

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'ALL',      label: 'All Students' },
  { key: 'PRESENT',  label: 'Present Today' },
  { key: 'ABSENT',   label: 'Absent Today' },
  { key: 'ON_DUTY',  label: 'On Duty' },
  { key: 'MEDICAL',  label: 'Medical Leave' },
  { key: 'BELOW65',  label: 'Attendance Below 65%' },
  { key: 'BELOW75',  label: 'Attendance Below 75%' },
  { key: 'ABOVE75',  label: 'Attendance Above 75%' },
  { key: 'ABOVE90',  label: 'Attendance Above 90%' },
];

const MENTOR_FILTER_LABELS: { key: MentorFilterKey; label: string }[] = [
  { key: 'ALL', label: 'All Mentor Students' },
  { key: 'LOW_ATTENDANCE', label: 'Attendance: Below 75%' },
  { key: 'LOW_MARKS', label: 'Performance: Low Marks' },
  { key: 'PENDING_ASSIGNMENTS', label: 'Performance: Pending Assignments' },
  { key: 'CONTINUOUS_ABSENCE', label: 'Attendance: Continuous Absence' },
  { key: 'ON_LEAVE', label: 'Leave Status: On Leave' },
  { key: 'HIGH_RISK', label: 'Academic Risk: High' },
  { key: 'EXCELLENT', label: 'Performance: Excellent' },
];

const getMentorRiskFlags = (student: MentorStudentProfile) => {
  const flags: string[] = [];
  if (student.attendance < 75) flags.push('Low Attendance');
  if (student.internalAverage < 20) flags.push('Low Marks');
  if (student.assignmentCompletion < 100) flags.push('Pending Assignments');
  if (student.continuousAbsenceDays >= 3) flags.push('Continuous Absence');
  return flags;
};

const getRiskColor = (risk: AcademicRisk) => {
  if (risk === 'High') return Colors.RedError;
  if (risk === 'Moderate') return Colors.ColorPending;
  return Colors.BluePrimary;
};

// ─────────────────────────────────────────────
// KEYBOARD AVOID WRAPPER
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// QUICK ACTION ROW
// ─────────────────────────────────────────────
const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.quickActionBtn, pressed && { opacity: 0.75 }]}
    onPress={onPress}
  >
    <View style={styles.quickActionIcon}>{icon}</View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </Pressable>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export const FacultyStudentHubScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();

  const { showAlert } = useCampusAlert();

  const [activeTab, setActiveTab] = useState<ActiveTab>('STUDENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');
  const [activeMentorFilter, setActiveMentorFilter] = useState<MentorFilterKey>('ALL');

  // Dropdown state
  const [filterDropOpen, setFilterDropOpen] = useState(false);
  const [dropY, setDropY] = useState(0);
  const [dropX, setDropX] = useState(0);
  const [dropW, setDropW] = useState(0);
  const filterBtnRef = useRef<View>(null);

  const openFilterDrop = () => {
    filterBtnRef.current?.measureInWindow((x, y, w, h) => {
      setDropX(x);
      setDropY(y + h + 4);
      setDropW(w);
      setFilterDropOpen(true);
    });
  };

  // Local mutable student data (mentor notes update in state)
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>(STUDENT_PROFILES);

  React.useEffect(() => {
    if (params.tab && ['STUDENTS', 'MENTOR'].includes(params.tab)) {
      setActiveTab(params.tab as ActiveTab);
    }
  }, [params.tab]);

  // Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [editingNote, setEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState('');

  // Mentor Mentees State
  const [mentorStudents, setMentorStudents] = useState<MentorStudentProfile[]>(MENTOR_STUDENT_PROFILES);
  const [activeMentee, setActiveMentee] = useState<MentorStudentProfile | null>(null);
  const [newRemarkText, setNewRemarkText] = useState('');
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [newLogDiscussion, setNewLogDiscussion] = useState('');
  const [newLogActionTaken, setNewLogActionTaken] = useState('');
  const [newLogStatus, setNewLogStatus] = useState<CounselingStatus>('Open');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // ── Filter + Search ──
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return studentProfiles.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.registerNumber.toLowerCase().includes(q);

      const matchFilter =
        activeFilter === 'ALL'     ? true :
        activeFilter === 'PRESENT' ? s.status === 'Present' :
        activeFilter === 'ABSENT'  ? s.status === 'Absent' :
        activeFilter === 'ON_DUTY' ? s.status === 'On Duty' :
        activeFilter === 'MEDICAL' ? s.status === 'Medical Leave' :
        activeFilter === 'BELOW65' ? s.attendance < 65 :
        activeFilter === 'BELOW75' ? s.attendance < 75 :
        activeFilter === 'ABOVE75' ? s.attendance >= 75 :
        activeFilter === 'ABOVE90' ? s.attendance >= 90 : true;

      return matchSearch && matchFilter;
    });
  }, [studentProfiles, searchQuery, activeFilter]);

  const filteredMentees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return mentorStudents.filter((student) => {
      const matchSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.rollNo.toLowerCase().includes(q) ||
        student.registerNumber.toLowerCase().includes(q);

      const matchFilter =
        activeMentorFilter === 'ALL' ? true :
        activeMentorFilter === 'LOW_ATTENDANCE' ? student.attendance < 75 :
        activeMentorFilter === 'LOW_MARKS' ? student.internalAverage < 20 :
        activeMentorFilter === 'PENDING_ASSIGNMENTS' ? student.assignmentCompletion < 100 :
        activeMentorFilter === 'CONTINUOUS_ABSENCE' ? student.continuousAbsenceDays >= 3 :
        activeMentorFilter === 'ON_LEAVE' ? student.status === 'Leave' || student.status === 'Medical Leave' :
        activeMentorFilter === 'HIGH_RISK' ? student.academicRisk === 'High' :
        activeMentorFilter === 'EXCELLENT' ? student.overallPerformance === 'Excellent' : true;

      return matchSearch && matchFilter;
    });
  }, [mentorStudents, searchQuery, activeMentorFilter]);

  // ── Summary Stats ──
  const stats = useMemo(() => {
    const total = studentProfiles.length;
    const avgAtt = Math.round(studentProfiles.reduce((sum, s) => sum + s.attendance, 0) / total);
    const lowAtt = studentProfiles.filter((s) => s.attendance < 75).length;
    const onLeave = studentProfiles.filter((s) => s.status === 'Leave' || s.status === 'Medical Leave').length;
    const onDuty = studentProfiles.filter((s) => s.status === 'On Duty').length;
    return { total, avgAtt, lowAtt, onLeave, onDuty };
  }, [studentProfiles]);

  const mentorStats = useMemo(() => {
    const totalStudents = mentorStudents.length;
    const lowAttendance = mentorStudents.filter((student) => student.attendance < 75).length;
    const lowMarks = mentorStudents.filter((student) => student.internalAverage < 20).length;
    const onLeave = mentorStudents.filter((student) => student.status === 'Leave' || student.status === 'Medical Leave').length;
    const excellentPerformers = mentorStudents.filter((student) => student.overallPerformance === 'Excellent').length;
    const studentsRequiringAttention = mentorStudents.filter((student) => getMentorRiskFlags(student).length > 0).length;

    return { totalStudents, studentsRequiringAttention, lowAttendance, lowMarks, onLeave, excellentPerformers };
  }, [mentorStudents]);

  // ── Open Student Profile ──
  const openStudent = (s: StudentProfile) => {
    setSelectedStudent(s);
    setDraftNote(s.mentorNote);
    setEditingNote(false);
  };

  // ── Save Mentor Note ──
  const saveMentorNote = () => {
    if (!selectedStudent) return;
    setStudentProfiles((prev) =>
      prev.map((s) => s.id === selectedStudent.id ? { ...s, mentorNote: draftNote } : s)
    );
    setSelectedStudent((prev) => prev ? { ...prev, mentorNote: draftNote } : prev);
    setEditingNote(false);
    showAlert('Saved', 'Mentor note updated successfully.');
  };

  const resetMentorForms = () => {
    setNewRemarkText('');
    setEditingRemarkId(null);
    setNewLogDiscussion('');
    setNewLogActionTaken('');
    setNewLogStatus('Open');
    setEditingLogId(null);
  };

  const updateMentorStudent = (
    studentId: string,
    updater: (student: MentorStudentProfile) => MentorStudentProfile,
  ) => {
    setMentorStudents((prev) => prev.map((student) => student.id === studentId ? updater(student) : student));
  };

  // Mentor Remark Handlers
  const handleEditMentorRemark = (remark: MentorRemark) => {
    setEditingRemarkId(remark.id);
    setNewRemarkText(remark.text);
  };

  const handleDeleteMentorRemark = (remarkId: string) => {
    const targetId = activeMentee?.id || selectedStudent?.id;
    if (!targetId) return;
    showAlert('Delete Remark', 'Delete this private mentor remark?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          updateMentorStudent(targetId, (student) => ({
            ...student,
            mentorRemarks: student.mentorRemarks.filter((remark) => remark.id !== remarkId),
          }));
          if (editingRemarkId === remarkId) {
            setEditingRemarkId(null);
            setNewRemarkText('');
          }
        },
      },
    ]);
  };

  const handleSaveMentorRemark = () => {
    const targetId = activeMentee?.id || selectedStudent?.id;
    if (!targetId) return;
    const text = newRemarkText.trim();
    if (!text) {
      showAlert('Error', 'Please enter a mentor remark.');
      return;
    }

    if (editingRemarkId) {
      updateMentorStudent(targetId, (student) => ({
        ...student,
        mentorRemarks: student.mentorRemarks.map((remark) =>
          remark.id === editingRemarkId ? { ...remark, text, date: formatDisplayDate() } : remark,
        ),
      }));
      showAlert('Saved', 'Mentor remark updated.');
    } else {
      const newRemark: MentorRemark = {
        id: 'remark_' + Date.now(),
        date: formatDisplayDate(),
        text,
      };
      updateMentorStudent(targetId, (student) => ({
        ...student,
        mentorRemarks: [newRemark, ...student.mentorRemarks],
      }));
      showAlert('Saved', 'Mentor remark added.');
    }

    setEditingRemarkId(null);
    setNewRemarkText('');
  };

  // Counseling Log Handlers
  const handleEditCounselingLog = (log: CounselingEntry) => {
    setEditingLogId(log.id);
    setNewLogDiscussion(log.discussion);
    setNewLogActionTaken(log.actionTaken);
    setNewLogStatus(log.status);
  };

  const handleDeleteCounselingLog = (logId: string) => {
    if (!activeMentee) return;
    showAlert('Delete Log', 'Delete this counselling log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          updateMentorStudent(activeMentee.id, (student) => ({
            ...student,
            counselingLogs: student.counselingLogs.filter((log) => log.id !== logId),
          }));
          if (editingLogId === logId) {
            setEditingLogId(null);
            setNewLogDiscussion('');
            setNewLogActionTaken('');
            setNewLogStatus('Open');
          }
        },
      },
    ]);
  };

  const handleAddCounselingLog = () => {
    if (!activeMentee) return;
    const discussion = newLogDiscussion.trim();
    const actionTaken = newLogActionTaken.trim();
    if (!discussion || !actionTaken) {
      showAlert('Error', 'Please enter discussion and action taken.');
      return;
    }

    if (editingLogId) {
      updateMentorStudent(activeMentee.id, (student) => ({
        ...student,
        counselingLogs: student.counselingLogs.map((log) =>
          log.id === editingLogId ? { ...log, discussion, actionTaken, status: newLogStatus } : log,
        ),
      }));
      showAlert('Success', 'Counselling log updated.');
    } else {
      const newLog: CounselingEntry = {
        id: 'log_' + Date.now(),
        date: formatDisplayDate(),
        discussion,
        actionTaken,
        status: newLogStatus,
      };
      updateMentorStudent(activeMentee.id, (student) => ({
        ...student,
        counselingLogs: [newLog, ...student.counselingLogs],
      }));
      showAlert('Success', 'Counselling session logged.');
    }

    setEditingLogId(null);
    setNewLogDiscussion('');
    setNewLogActionTaken('');
    setNewLogStatus('Open');
  };

  const handleScheduleCounseling = (student: MentorStudentProfile) => {
    const scheduledDate = formatDisplayDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
    const newLog: CounselingEntry = {
      id: 'scheduled_' + Date.now(),
      date: scheduledDate,
      discussion: 'Scheduled mentor counselling session.',
      actionTaken: 'Student to attend the scheduled counselling slot with updated attendance and assignment status.',
      status: 'Open',
    };

    updateMentorStudent(student.id, (current) => ({
      ...current,
      counselingLogs: [newLog, ...current.counselingLogs],
    }));
    showAlert('Counselling Scheduled', `Mock counselling session scheduled for ${scheduledDate}.`);
  };

  // Quick Action Handler
  const handleQuickAction = (action: string, student: StudentProfile) => {
    const mentee = mentorStudents.find((m) => m.id === student.id);
    switch (action) {
      case 'View Attendance': {
        const trendMsg = mentee ? `\nAttendance Trend: ${mentee.attendanceTrend}` : '';
        showAlert('Attendance Status', `Overall Attendance: ${student.attendance}%\nToday's Status: ${student.status}${trendMsg}`);
        break;
      }
      case 'View Marks': {
        const trendMsg = mentee ? `\nMarks Trend: ${mentee.marksTrend}` : '';
        const avg = getInternalAverage(student);
        showAlert('Academic Performance', `GPA: ${student.gpa}\nIA Average Marks: ${avg}/30${trendMsg}`);
        break;
      }
      case 'View Leave History': {
        const summary = mentee ? mentee.leaveHistorySummary : 'No leave history recorded.';
        showAlert('Leave History Summary', summary);
        break;
      }
      case 'View Library Details': {
        const summary = mentee ? mentee.librarySummary : 'No library records found.';
        showAlert('Library Summary', summary);
        break;
      }
      case 'View Parent Details': {
        showAlert(
          'Parent/Guardian Contact',
          `Father's Name: ${student.parentName}\nMobile: ${student.parentContact}\nEmail: ${student.parentEmail}`,
        );
        break;
      }
      case 'Add Mentor Note': {
        setEditingNote(true);
        break;
      }
      case 'Schedule Counselling': {
        if (mentee) {
          handleScheduleCounseling(mentee);
        } else {
          showAlert('Not Allowed', 'This student is not assigned as your mentee.');
        }
        break;
      }
      case 'Counselling Logs': {
        if (mentee) {
          setSelectedStudent(null);
          setActiveMentee(mentee);
          resetMentorForms();
        } else {
          showAlert('Not Allowed', 'This student is not assigned as your mentee.');
        }
        break;
      }
      default:
        showAlert('Quick Action', `"${action}" completed.`);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {activeTab === 'STUDENTS' ? 'Student Directory' : 'Mentors & Tutors'}
        </Text>
        <View style={styles.spacer} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {(['STUDENTS', 'MENTOR'] as ActiveTab[]).map((tab) => {
            const active = activeTab === tab;
            const label = tab === 'STUDENTS' ? 'Student List' : 'Mentor / Tutor Panel';
            return (
              <Pressable
                key={tab}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Main Content ── */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ═══ STUDENTS TAB ═══ */}
        {activeTab === 'STUDENTS' && (
          <View style={styles.tabPane}>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={16} color={Colors.AppOnSurfaceVariant + '80'} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchBar}
                placeholder="Search by name, roll no, register..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <X size={15} color={Colors.AppOnSurfaceVariant} />
                </Pressable>
              )}
            </View>

            {/* Summary Stats Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
              <View style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.statChipVal, { color: Colors.BluePrimary }]}>{stats.total}</Text>
                  <Text style={[styles.statChipLbl, { color: Colors.BluePrimary }]}>Total</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.statChipVal, { color: '#16A34A' }]}>{stats.avgAtt}%</Text>
                  <Text style={[styles.statChipLbl, { color: '#16A34A' }]}>Avg Att.</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.statChipVal, { color: Colors.RedError }]}>{stats.lowAtt}</Text>
                  <Text style={[styles.statChipLbl, { color: Colors.RedError }]}>Low Att.</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.statChipVal, { color: '#D97706' }]}>{stats.onLeave}</Text>
                  <Text style={[styles.statChipLbl, { color: '#D97706' }]}>On Leave</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.statChipVal, { color: '#7C3AED' }]}>{stats.onDuty}</Text>
                  <Text style={[styles.statChipLbl, { color: '#7C3AED' }]}>On Duty</Text>
                </View>
              </View>
            </ScrollView>

            {/* Filter Dropdown Button */}
            <Pressable
              ref={filterBtnRef}
              style={[styles.filterDropBtn, filterDropOpen && styles.filterDropBtnActive]}
              onPress={openFilterDrop}
            >
              <Text style={styles.filterDropBtnTxt} numberOfLines={1}>
                {FILTER_LABELS.find((f) => f.key === activeFilter)?.label ?? 'All Students'}
              </Text>
              <ChevronDown
                size={15}
                color={filterDropOpen ? Colors.BluePrimary : Colors.AppOnSurfaceVariant}
                style={{ transform: [{ rotate: filterDropOpen ? '180deg' : '0deg' }] }}
              />
            </Pressable>

            {/* Section Label */}
            <Text style={styles.sectionTitle}>
              III B.Sc Computer Science · {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </Text>

            {/* Student Cards */}
            {filteredStudents.length === 0 ? (
              <CampusCard style={styles.emptyCard} elevation="sm">
                <Users size={32} color={Colors.AppOnSurfaceVariant + '50'} />
                <Text style={styles.emptyText}>No students match your search or filter.</Text>
              </CampusCard>
            ) : (
              filteredStudents.map((student) => {
                const attColor = getAttColor(student.attendance);
                const statusStyle = STATUS_COLORS[student.status];
                return (
                  <CampusCard
                    key={student.id}
                    style={styles.studentCard}
                    onPress={() => openStudent(student)}
                    elevation="sm"
                  >
                    <View style={styles.studentRow}>
                      {/* Avatar */}
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {student.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </Text>
                      </View>

                      {/* Info */}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentMeta}>Roll: {student.rollNo} · Reg: {student.registerNumber}</Text>
                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, marginTop: 4 }]}>
                          <Text style={[styles.statusBadgeTxt, { color: statusStyle.text }]}>{student.status}</Text>
                        </View>
                      </View>

                      {/* Attendance */}
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={[styles.studentStatsVal, { color: attColor }]}>{student.attendance}%</Text>
                        <Text style={styles.studentStatsLabel}>Attendance</Text>
                      </View>

                      <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 8 }} />
                    </View>
                  </CampusCard>
                );
              })
            )}
          </View>
        )}

        {/* ═══ MENTOR TAB ═══ */}
        {activeTab === 'MENTOR' && (
          <View style={styles.tabPane}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={16} color={Colors.AppOnSurfaceVariant + '80'} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchBar}
                placeholder="Search mentees by name, roll no, register..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <X size={15} color={Colors.AppOnSurfaceVariant} />
                </Pressable>
              )}
            </View>

            {/* Summary Stats Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
              <View style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.statChipVal, { color: Colors.BluePrimary }]}>{mentorStats.totalStudents}</Text>
                  <Text style={[styles.statChipLbl, { color: Colors.BluePrimary }]}>Total Mentees</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.statChipVal, { color: Colors.RedError }]}>{mentorStats.studentsRequiringAttention}</Text>
                  <Text style={[styles.statChipLbl, { color: Colors.RedError }]}>Risk/Attention</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.statChipVal, { color: '#16A34A' }]}>{mentorStats.excellentPerformers}</Text>
                  <Text style={[styles.statChipLbl, { color: '#16A34A' }]}>Excellent GPA</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.statChipVal, { color: '#D97706' }]}>{mentorStats.lowAttendance}</Text>
                  <Text style={[styles.statChipLbl, { color: '#D97706' }]}>Low Att.</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.statChipVal, { color: '#7C3AED' }]}>{mentorStats.lowMarks}</Text>
                  <Text style={[styles.statChipLbl, { color: '#7C3AED' }]}>Low Marks</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#E2F1FF' }]}>
                  <Text style={[styles.statChipVal, { color: '#0284C7' }]}>{mentorStats.onLeave}</Text>
                  <Text style={[styles.statChipLbl, { color: '#0284C7' }]}>On Leave</Text>
                </View>
              </View>
            </ScrollView>

            {/* Filter Dropdown Button */}
            <Pressable
              ref={filterBtnRef}
              style={[styles.filterDropBtn, filterDropOpen && styles.filterDropBtnActive]}
              onPress={openFilterDrop}
            >
              <Text style={styles.filterDropBtnTxt} numberOfLines={1}>
                {MENTOR_FILTER_LABELS.find((f) => f.key === activeMentorFilter)?.label ?? 'All Mentor Students'}
              </Text>
              <ChevronDown
                size={15}
                color={filterDropOpen ? Colors.BluePrimary : Colors.AppOnSurfaceVariant}
                style={{ transform: [{ rotate: filterDropOpen ? '180deg' : '0deg' }] }}
              />
            </Pressable>

            {/* Section Label */}
            <Text style={styles.sectionTitle}>
              Assigned Mentees · {filteredMentees.length} student{filteredMentees.length !== 1 ? 's' : ''}
            </Text>

            {/* Mentee Cards */}
            {filteredMentees.length === 0 ? (
              <CampusCard style={styles.emptyCard} elevation="sm">
                <Users size={32} color={Colors.AppOnSurfaceVariant + '50'} />
                <Text style={styles.emptyText}>No mentees match your search or filter.</Text>
              </CampusCard>
            ) : (
              filteredMentees.map((mentee) => {
                const attColor = getAttColor(mentee.attendancePercent);
                const riskColor = getRiskColor(mentee.academicRisk);
                return (
                  <CampusCard
                    key={mentee.id}
                    style={styles.menteeCard}
                    onPress={() => openStudent(studentProfiles.find((s) => s.id === mentee.id)!)}
                    elevation="sm"
                  >
                    <View style={styles.menteeRow}>
                      <View style={[styles.avatar, { backgroundColor: Colors.BluePrimary + '20' }]}>
                        <Text style={[styles.avatarText, { color: Colors.BlueOnPrimaryContainer }]}>
                          {mentee.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </Text>
                      </View>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.menteeName}>{mentee.name}</Text>
                        <Text style={styles.menteeMeta}>
                          Roll: {mentee.rollNo} · Reg: {mentee.registerNumber}
                        </Text>
                        <Text style={[styles.menteeMeta, { fontSize: 10, marginTop: 2 }]}>
                          GPA: {mentee.gpa} · Risk: <Text style={{ fontWeight: '700', color: riskColor }}>{mentee.academicRisk}</Text>
                        </Text>

                        {/* Attendance bar */}
                        <View style={styles.attBarBg}>
                          <View style={[styles.attBarFill, {
                            width: `${Math.min(mentee.attendancePercent, 100)}%` as any,
                            backgroundColor: attColor,
                          }]} />
                        </View>
                      </View>

                      {/* Right side stats */}
                      <View style={{ alignItems: 'flex-end', gap: 4, marginLeft: 8 }}>
                        <Text style={[styles.studentStatsVal, { color: attColor }]}>
                          {mentee.attendancePercent}%
                        </Text>
                        <Text style={styles.studentStatsLabel}>Attendance</Text>
                        <View style={styles.logsBadge}>
                          <MessageSquare size={10} color={Colors.BlueOnPrimaryContainer} />
                          <Text style={styles.logsBadgeText}>{mentee.counselingLogs.length} logs</Text>
                        </View>
                      </View>

                      <ChevronRight size={18} color={Colors.AppOnSurfaceVariant} style={{ marginLeft: 8 }} />
                    </View>
                  </CampusCard>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══════════════════════════════════════════
          STUDENT PROFILE MODAL
          ══════════════════════════════════════════ */}
      <Modal visible={selectedStudent !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissOverlay} onPress={() => setSelectedStudent(null)} />
          <View style={styles.modalSheet}>
            {selectedStudent && (() => {
              const mentee = mentorStudents.find((m) => m.id === selectedStudent.id);
              const attColor = getAttColor(selectedStudent.attendance);
              
              // Risk flags check
              const riskFlags: string[] = [];
              if (selectedStudent.attendance < 75) riskFlags.push('Low Attendance (<75%)');
              const avgIA = getInternalAverage(selectedStudent);
              if (avgIA < 20) riskFlags.push('Low IA Marks (<20/30 avg)');
              if (selectedStudent.assignmentStatus !== 'All Submitted') riskFlags.push('Pending Assignments');
              if (mentee && mentee.continuousAbsenceDays >= 3) riskFlags.push(`Continuous Absence (${mentee.continuousAbsenceDays} days)`);

              return (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Student Profile</Text>
                    <Pressable onPress={() => setSelectedStudent(null)} style={styles.modalCloseBtn}>
                      <X size={20} color={Colors.AppOnBackground} />
                    </Pressable>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

                    {/* Hero */}
                    <View style={styles.profileHero}>
                      <View style={[styles.avatar, { width: 64, height: 64, borderRadius: 32 }]}>
                        <Text style={[styles.avatarText, { fontSize: 22 }]}>
                          {selectedStudent.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </Text>
                      </View>
                      <Text style={styles.profileName}>{selectedStudent.name}</Text>
                      <View style={[styles.statusBadge, {
                        backgroundColor: STATUS_COLORS[selectedStudent.status].bg,
                        alignSelf: 'center',
                        marginTop: 4,
                      }]}>
                        <Text style={[styles.statusBadgeTxt, { color: STATUS_COLORS[selectedStudent.status].text }]}>
                          {selectedStudent.status}
                        </Text>
                      </View>
                      <Text style={styles.profileSub}>
                        {selectedStudent.year} · {selectedStudent.department} · Sec {selectedStudent.section}
                      </Text>
                    </View>

                    {/* Risk Warning Alert Banner */}
                    {riskFlags.length > 0 && (
                      <View style={[styles.alertBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', marginBottom: 6 }]}>
                        <AlertTriangle size={18} color={Colors.RedError} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.RedError }}>
                            Academic Risk Alert
                          </Text>
                          {riskFlags.map((flag, index) => (
                            <Text key={index} style={{ fontSize: 11, color: '#B91C1C', marginTop: 1 }}>
                              • {flag}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Mentee Progress Trends */}
                    {mentee && (
                      <>
                        <Text style={styles.profileSectionTitle}>Academic Progress Trends</Text>
                        <CampusCard style={[styles.innerCard, { gap: 12 }]} elevation="none" borderColor={Colors.AppOutline}>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            <View style={styles.trendItem}>
                              <Text style={styles.trendLabel}>Overall Performance</Text>
                              <View style={[styles.trendBadge, { backgroundColor: mentee.overallPerformance === 'Excellent' ? '#DCFCE7' : mentee.overallPerformance === 'Needs Attention' ? '#FEE2E2' : '#FEF3C7' }]}>
                                <Text style={[styles.trendBadgeTxt, { color: mentee.overallPerformance === 'Excellent' ? '#16A34A' : mentee.overallPerformance === 'Needs Attention' ? Colors.RedError : '#D97706' }]}>
                                  {mentee.overallPerformance}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.trendItem}>
                              <Text style={styles.trendLabel}>Academic Risk Level</Text>
                              <View style={[styles.trendBadge, { backgroundColor: mentee.academicRisk === 'High' ? '#FEE2E2' : mentee.academicRisk === 'Moderate' ? '#FEF3C7' : '#E0F2FE' }]}>
                                <Text style={[styles.trendBadgeTxt, { color: mentee.academicRisk === 'High' ? Colors.RedError : mentee.academicRisk === 'Moderate' ? '#D97706' : Colors.BluePrimary }]}>
                                  {mentee.academicRisk} Risk
                                </Text>
                              </View>
                            </View>
                            <View style={styles.trendItem}>
                              <Text style={styles.trendLabel}>Attendance Trend</Text>
                              <View style={[styles.trendBadge, { backgroundColor: mentee.attendanceTrend === 'Improving' ? '#DCFCE7' : mentee.attendanceTrend === 'Declining' ? '#FEE2E2' : '#F1F5F9' }]}>
                                <Text style={[styles.trendBadgeTxt, { color: mentee.attendanceTrend === 'Improving' ? '#16A34A' : mentee.attendanceTrend === 'Declining' ? Colors.RedError : Colors.AppOnSurfaceVariant }]}>
                                  {mentee.attendanceTrend}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.trendItem}>
                              <Text style={styles.trendLabel}>Marks Trend</Text>
                              <View style={[styles.trendBadge, { backgroundColor: mentee.marksTrend === 'Improving' ? '#DCFCE7' : mentee.marksTrend === 'Declining' ? '#FEE2E2' : '#F1F5F9' }]}>
                                <Text style={[styles.trendBadgeTxt, { color: mentee.marksTrend === 'Improving' ? '#16A34A' : mentee.marksTrend === 'Declining' ? Colors.RedError : Colors.AppOnSurfaceVariant }]}>
                                  {mentee.marksTrend}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.divider} />

                          <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text style={styles.guardianLabel}>Semester Syllabus Progress</Text>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.BluePrimary }}>{mentee.semesterProgress}%</Text>
                            </View>
                            <View style={styles.attBarBg}>
                              <View style={[styles.attBarFill, { width: `${mentee.semesterProgress}%` as any, backgroundColor: Colors.BluePrimary }]} />
                            </View>
                          </View>
                        </CampusCard>
                      </>
                    )}

                    {/* Basic Info Grid */}
                    <Text style={styles.profileSectionTitle}>Basic Information</Text>
                    <View style={styles.infoCardGrid}>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Roll Number</Text>
                        <Text style={styles.infoCardValue}>{selectedStudent.rollNo}</Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Register No</Text>
                        <Text style={styles.infoCardValue}>{selectedStudent.registerNumber}</Text>
                      </View>
                    </View>
                    <View style={styles.infoCardGrid}>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Semester</Text>
                        <Text style={styles.infoCardValue}>{selectedStudent.semester}</Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Department</Text>
                        <Text style={styles.infoCardValue}>{selectedStudent.department}</Text>
                      </View>
                    </View>

                    {/* Academic Info */}
                    <Text style={styles.profileSectionTitle}>Academic Overview</Text>
                    <View style={styles.infoCardGrid}>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Overall Attendance</Text>
                        <Text style={[styles.infoCardValue, { color: attColor }]}>
                          {selectedStudent.attendance}%
                        </Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Current GPA</Text>
                        <Text style={[styles.infoCardValue, { color: Colors.BluePrimary }]}>
                          {selectedStudent.gpa} GPA
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoCardGrid}>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Assignments</Text>
                        <Text style={[styles.infoCardValue, { fontSize: 13 }]}>{selectedStudent.assignmentStatus}</Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardLabel}>Lab Status</Text>
                        <Text style={[styles.infoCardValue, { fontSize: 13 }]}>{selectedStudent.labStatus}</Text>
                      </View>
                    </View>

                    {/* Subject-wise Attendance */}
                    <Text style={styles.profileSectionTitle}>Subject-wise Attendance</Text>
                    <CampusCard style={styles.innerCard} elevation="none" borderColor={Colors.AppOutline}>
                      {selectedStudent.subjectAttendance.map((sa, i) => (
                        <View key={i}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={styles.subjectName} numberOfLines={1}>{sa.subject}</Text>
                            <Text style={[styles.subjectPct, { color: getAttColor(sa.percent) }]}>
                              {sa.percent}% ({sa.attended}/{sa.total})
                            </Text>
                          </View>
                          <View style={styles.attBarBg}>
                            <View style={[styles.attBarFill, {
                              width: `${sa.percent}%` as any,
                              backgroundColor: getAttColor(sa.percent),
                            }]} />
                          </View>
                          {i < selectedStudent.subjectAttendance.length - 1 && <View style={[styles.divider, { marginVertical: 8 }]} />}
                        </View>
                      ))}
                    </CampusCard>

                    {/* Internal Marks */}
                    <Text style={styles.profileSectionTitle}>Internal Assessment Marks</Text>
                    <CampusCard style={styles.innerCard} elevation="none" borderColor={Colors.AppOutline}>
                      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                        <Text style={[styles.guardianLabel, { flex: 1 }]}>Subject</Text>
                        <Text style={[styles.guardianLabel, { width: 40, textAlign: 'center' }]}>IA1</Text>
                        <Text style={[styles.guardianLabel, { width: 40, textAlign: 'center' }]}>IA2</Text>
                      </View>
                      {selectedStudent.internalMarks.map((im, i) => (
                        <View key={i}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.guardianValue, { flex: 1, fontSize: 12 }]} numberOfLines={1}>{im.subject}</Text>
                            <Text style={[styles.guardianValue, { width: 40, textAlign: 'center', color: im.ia1 < 18 ? Colors.RedError : Colors.ColorPresent }]}>
                              {im.ia1}/{im.max}
                            </Text>
                            <Text style={[styles.guardianValue, { width: 40, textAlign: 'center', color: im.ia2 < 18 ? Colors.RedError : Colors.ColorPresent }]}>
                              {im.ia2}/{im.max}
                            </Text>
                          </View>
                          {i < selectedStudent.internalMarks.length - 1 && <View style={[styles.divider, { marginVertical: 6 }]} />}
                        </View>
                      ))}
                    </CampusCard>

                    {/* Guardian Info */}
                    <Text style={styles.profileSectionTitle}>Guardian & Student Contacts</Text>
                    <CampusCard style={styles.innerCard} elevation="none" borderColor={Colors.AppOutline}>
                      <View style={styles.guardianRow}>
                        <Text style={styles.guardianLabel}>Father / Guardian Name</Text>
                        <Text style={styles.guardianValue}>{selectedStudent.parentName}</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.guardianRow}>
                        <Text style={styles.guardianLabel}>Parent Contact Phone</Text>
                        <View style={styles.rowAlign}>
                          <Text style={styles.guardianValue}>{selectedStudent.parentContact}</Text>
                          <Pressable
                            style={styles.contactBtn}
                            onPress={() => showAlert('Calling', `Calling Parent: ${selectedStudent.parentName}...`)}
                          >
                            <Phone size={14} color="#FFF" />
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.guardianRow}>
                        <Text style={styles.guardianLabel}>Parent Email Address</Text>
                        <View style={styles.rowAlign}>
                          <Text style={[styles.guardianValue, { flex: 1, fontSize: 12 }]} numberOfLines={1}>{selectedStudent.parentEmail}</Text>
                          <Pressable
                            style={[styles.contactBtn, { backgroundColor: '#6366F1' }]}
                            onPress={() => showAlert('Email', `Composing email to ${selectedStudent.parentEmail}...`)}
                          >
                            <Mail size={14} color="#FFF" />
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.guardianRow}>
                        <Text style={styles.guardianLabel}>Student Contact Phone</Text>
                        <View style={styles.rowAlign}>
                          <Text style={styles.guardianValue}>{selectedStudent.mobile}</Text>
                          <Pressable
                            style={[styles.contactBtn, { backgroundColor: Colors.ColorPresent }]}
                            onPress={() => showAlert('Calling', `Calling Student: ${selectedStudent.name}...`)}
                          >
                            <Phone size={14} color="#FFF" />
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.guardianRow}>
                        <Text style={styles.guardianLabel}>Student Email Address</Text>
                        <View style={styles.rowAlign}>
                          <Text style={[styles.guardianValue, { flex: 1, fontSize: 12 }]} numberOfLines={1}>{selectedStudent.email}</Text>
                          <Pressable
                            style={[styles.contactBtn, { backgroundColor: '#6366F1' }]}
                            onPress={() => showAlert('Email', `Composing email to ${selectedStudent.email}...`)}
                          >
                            <Mail size={14} color="#FFF" />
                          </Pressable>
                        </View>
                      </View>
                    </CampusCard>

                    {/* Quick Actions */}
                    <Text style={styles.profileSectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                      <QuickAction icon={<UserCheck size={18} color={Colors.BluePrimary} />}   label="Attendance"     onPress={() => handleQuickAction('View Attendance', selectedStudent)} />
                      <QuickAction icon={<TrendingUp size={18} color="#10B981" />}              label="Marks"          onPress={() => handleQuickAction('View Marks', selectedStudent)} />
                      <QuickAction icon={<FileText size={18} color="#F59E0B" />}                label="Leave History"  onPress={() => handleQuickAction('View Leave History', selectedStudent)} />
                      <QuickAction icon={<BookOpen size={18} color="#8B5CF6" />}               label="Library"        onPress={() => handleQuickAction('View Library Details', selectedStudent)} />
                      <QuickAction icon={<DollarSign size={18} color="#EF4444" />}             label="Parent Details" onPress={() => handleQuickAction('View Parent Details', selectedStudent)} />
                      <QuickAction icon={<Pencil size={18} color="#475569" />}                 label="Add Mentor Note" onPress={() => handleQuickAction('Add Mentor Note', selectedStudent)} />
                      
                      {mentee && (
                        <>
                          <QuickAction icon={<Calendar size={18} color="#0EA5E9" />}               label="Schedule Counselling" onPress={() => handleQuickAction('Schedule Counselling', selectedStudent)} />
                          <QuickAction icon={<MessageSquare size={18} color="#0284C7" />}           label="Counselling Logs"     onPress={() => handleQuickAction('Counselling Logs', selectedStudent)} />
                        </>
                      )}
                    </View>

                    {/* Private Remarks (Only Mentees) */}
                    {mentee && (
                      <>
                        <Text style={styles.profileSectionTitle}>Private Mentor Remarks ({mentee.mentorRemarks.length})</Text>
                        <CampusCard style={styles.innerCard} elevation="none" borderColor={Colors.AppOutline}>
                          <View style={{ gap: 8 }}>
                            <TextInput
                              style={styles.textInputArea}
                              value={newRemarkText}
                              onChangeText={setNewRemarkText}
                              placeholder="Enter private mentor remark..."
                              placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                              multiline
                              numberOfLines={3}
                            />
                            <Pressable style={styles.addLogBtn} onPress={handleSaveMentorRemark}>
                              <CheckCircle size={16} color="#FFFFFF" />
                              <Text style={styles.addLogBtnText}>
                                {editingRemarkId ? 'Update Mentor Remark' : 'Save Mentor Remark'}
                              </Text>
                            </Pressable>
                            {editingRemarkId && (
                              <Pressable
                                style={[styles.addLogBtn, { backgroundColor: Colors.AppOutline }]}
                                onPress={() => { setEditingRemarkId(null); setNewRemarkText(''); }}
                              >
                                <Text style={{ color: Colors.AppOnBackground, fontWeight: '700' }}>Cancel Edit</Text>
                              </Pressable>
                            )}
                          </View>

                          {mentee.mentorRemarks.length > 0 && <View style={[styles.divider, { marginVertical: 4 }]} />}

                          {mentee.mentorRemarks.map((remark) => (
                            <View key={remark.id} style={styles.remarkItem}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.historyDate}>{remark.date}</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                  <Pressable onPress={() => handleEditMentorRemark(remark)} hitSlop={6}>
                                    <Pencil size={12} color={Colors.BluePrimary} />
                                  </Pressable>
                                  <Pressable onPress={() => handleDeleteMentorRemark(remark.id)} hitSlop={6}>
                                    <Trash2 size={12} color={Colors.ColorAbsent} />
                                  </Pressable>
                                </View>
                              </View>
                              <Text style={{ fontSize: 13, color: Colors.AppOnBackground, marginTop: 4, lineHeight: 18 }}>
                                {remark.text}
                              </Text>
                            </View>
                          ))}
                        </CampusCard>
                      </>
                    )}

                    {/* Mentor Note */}
                    <Text style={styles.profileSectionTitle}>Private General Note</Text>
                    <CampusCard style={styles.innerCard} elevation="none" borderColor={Colors.AppOutline}>
                      {editingNote ? (
                        <>
                          <TextInput
                            style={styles.textInputArea}
                            value={draftNote}
                            onChangeText={setDraftNote}
                            multiline
                            numberOfLines={3}
                            placeholder="Add private mentor remarks..."
                            placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                          />
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                            <Pressable
                              style={[styles.addLogBtn, { flex: 1, backgroundColor: Colors.ColorPresent }]}
                              onPress={saveMentorNote}
                            >
                              <CheckCircle size={14} color="#FFF" />
                              <Text style={styles.addLogBtnText}>Save Note</Text>
                            </Pressable>
                            <Pressable
                              style={[styles.addLogBtn, { flex: 1, backgroundColor: Colors.AppOutline }]}
                              onPress={() => { setEditingNote(false); setDraftNote(selectedStudent.mentorNote); }}
                            >
                              <X size={14} color={Colors.AppOnBackground} />
                              <Text style={[styles.addLogBtnText, { color: Colors.AppOnBackground }]}>Cancel</Text>
                            </Pressable>
                          </View>
                        </>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                          <Text style={{ flex: 1, fontSize: 13, color: Colors.AppOnBackground, lineHeight: 18 }}>
                            {selectedStudent.mentorNote || 'No note added yet.'}
                          </Text>
                          <Pressable onPress={() => setEditingNote(true)} hitSlop={8}>
                            <Pencil size={15} color={Colors.BluePrimary} />
                          </Pressable>
                        </View>
                      )}
                    </CampusCard>

                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════
          MENTORING PANEL MODAL
          ══════════════════════════════════════════ */}
      <Modal visible={activeMentee !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissOverlay} onPress={() => setActiveMentee(null)} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.modalSheet, { maxHeight: '100%' }]}>
              {activeMentee && (() => {
                const liveMentee = mentorStudents.find(m => m.id === activeMentee.id) || activeMentee;
                return (
                  <>
                    <View style={styles.modalHeader}>
                      <View>
                        <Text style={styles.modalTitle}>Mentee Log: {liveMentee.name}</Text>
                        <Text style={styles.modalSubTitle}>
                          Roll No: {liveMentee.rollNo} · {liveMentee.attendancePercent}% Att. · {liveMentee.gpa} GPA
                        </Text>
                      </View>
                      <Pressable onPress={() => setActiveMentee(null)} style={styles.modalCloseBtn}>
                        <X size={20} color={Colors.AppOnBackground} />
                      </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

                      {/* Attendance alert for low attendance mentees */}
                      {liveMentee.attendancePercent < 75 && (
                        <View style={styles.alertBanner}>
                          <AlertTriangle size={16} color="#D97706" />
                          <Text style={styles.alertBannerText}>
                            Low attendance: {liveMentee.attendancePercent}% — Intervention required.
                          </Text>
                        </View>
                      )}

                      {/* Add Log Form */}
                      <Text style={styles.profileSectionTitle}>Record Counseling Session</Text>
                      <CampusCard style={styles.innerCard} elevation="none" borderColor={Colors.AppOutline}>
                        <View style={{ gap: 8 }}>
                          <Text style={styles.guardianLabel}>Discussion Topic & Details</Text>
                          <TextInput
                            style={styles.textInputArea}
                            value={newLogDiscussion}
                            onChangeText={setNewLogDiscussion}
                            placeholder="Enter counseling summary, issues discussed, and advice given..."
                            placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                            multiline
                            numberOfLines={3}
                          />

                          <Text style={styles.guardianLabel}>Action Items & Guidance</Text>
                          <TextInput
                            style={styles.textInputArea}
                            value={newLogActionTaken}
                            onChangeText={setNewLogActionTaken}
                            placeholder="Specify actions recommended for student..."
                            placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                            multiline
                            numberOfLines={2}
                          />

                          <Text style={styles.guardianLabel}>Status</Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {(['Open', 'In Progress', 'Closed'] as CounselingStatus[]).map((status) => (
                              <Pressable
                                key={status}
                                style={[styles.statusToggleBtn, newLogStatus === status && styles.statusToggleBtnActive]}
                                onPress={() => setNewLogStatus(status)}
                              >
                                <Text style={[styles.statusToggleBtnTxt, newLogStatus === status && styles.statusToggleBtnTxtActive]}>
                                  {status}
                                </Text>
                              </Pressable>
                            ))}
                          </View>

                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                            <Pressable style={[styles.addLogBtn, { flex: 1 }]} onPress={handleAddCounselingLog}>
                              <UserCheck size={16} color="#FFFFFF" />
                              <Text style={styles.addLogBtnText}>
                                {editingLogId ? 'Update Log' : 'Save Counselling Log'}
                              </Text>
                            </Pressable>
                            {editingLogId && (
                              <Pressable
                                style={[styles.addLogBtn, { backgroundColor: Colors.AppOutline }]}
                                onPress={() => { setEditingLogId(null); setNewLogDiscussion(''); setNewLogActionTaken(''); setNewLogStatus('Open'); }}
                              >
                                <X size={16} color={Colors.AppOnBackground} />
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </CampusCard>

                      {/* Log History */}
                      <Text style={styles.profileSectionTitle}>Mentoring History ({liveMentee.counselingLogs.length} entries)</Text>
                      {liveMentee.counselingLogs.length === 0 ? (
                        <Text style={{ fontSize: 13, color: Colors.AppOnSurfaceVariant, textAlign: 'center', marginVertical: 12 }}>
                          No counseling sessions logged yet.
                        </Text>
                      ) : (
                        liveMentee.counselingLogs.map((log) => {
                          const isEditing = editingLogId === log.id;
                          return (
                            <CampusCard
                              key={log.id}
                              style={[styles.historyCard, isEditing && { borderColor: Colors.BluePrimary }]}
                              elevation="none"
                              borderColor={isEditing ? Colors.BluePrimary : Colors.AppOutline}
                            >
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Text style={styles.historyDate}>{log.date}</Text>
                                  <View style={[styles.statusBadge, { paddingVertical: 1, paddingHorizontal: 6, backgroundColor: log.status === 'Closed' ? '#DCFCE7' : log.status === 'In Progress' ? '#FEF3C7' : '#DBEAFE' }]}>
                                    <Text style={{ fontSize: 9, fontWeight: '800', color: log.status === 'Closed' ? '#16A34A' : log.status === 'In Progress' ? '#D97706' : Colors.BluePrimary }}>
                                      {log.status}
                                    </Text>
                                  </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 14 }}>
                                  <Pressable onPress={() => handleEditCounselingLog(log)} hitSlop={8}>
                                    <Pencil size={13} color={Colors.BluePrimary} />
                                  </Pressable>
                                  <Pressable onPress={() => handleDeleteCounselingLog(log.id)} hitSlop={8}>
                                    <Trash2 size={13} color={Colors.ColorAbsent} />
                                  </Pressable>
                                </View>
                              </View>
                              <Text style={styles.historyNotes}>
                                <Text style={{ fontWeight: '700' }}>Discussion: </Text>{log.discussion}
                              </Text>
                              <Text style={[styles.historyNotes, { marginTop: 4, color: Colors.AppOnSurfaceVariant }]}>
                                <Text style={{ fontWeight: '700' }}>Action Taken: </Text>{log.actionTaken}
                              </Text>
                            </CampusCard>
                          );
                        })
                      )}
                    </ScrollView>
                  </>
                );
              })()}
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Filter Dropdown Modal ── */}
      <Modal
        visible={filterDropOpen}
        transparent
        animationType="none"
        onRequestClose={() => setFilterDropOpen(false)}
      >
        <Pressable style={styles.dropOverlay} onPress={() => setFilterDropOpen(false)}>
          <View style={[styles.dropMenu, { top: dropY, left: dropX, width: dropW }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {activeTab === 'STUDENTS' ? (
                FILTER_LABELS.map((f) => (
                  <Pressable
                    key={f.key}
                    style={[styles.dropItem, activeFilter === f.key && styles.dropItemActive]}
                    onPress={() => {
                      setActiveFilter(f.key);
                      setFilterDropOpen(false);
                    }}
                  >
                    <Text style={[styles.dropItemTxt, activeFilter === f.key && styles.dropItemTxtActive]}>
                      {f.label}
                    </Text>
                    {activeFilter === f.key && (
                      <CheckCircle size={14} color={Colors.BluePrimary} />
                    )}
                  </Pressable>
                ))
              ) : (
                MENTOR_FILTER_LABELS.map((f) => (
                  <Pressable
                    key={f.key}
                    style={[styles.dropItem, activeMentorFilter === f.key && styles.dropItemActive]}
                    onPress={() => {
                      setActiveMentorFilter(f.key);
                      setFilterDropOpen(false);
                    }}
                  >
                    <Text style={[styles.dropItemTxt, activeMentorFilter === f.key && styles.dropItemTxtActive]}>
                      {f.label}
                    </Text>
                    {activeMentorFilter === f.key && (
                      <CheckCircle size={14} color={Colors.BluePrimary} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>


    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifycontent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.AppOnBackground },
  spacer: { width: 40 },

  tabBar: { backgroundColor: Colors.AppSurface, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline },
  tabBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabItemActive: { backgroundColor: Colors.BluePrimary },
  tabLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  tabLabelActive: { color: '#FFFFFF' },

  scroll: { flex: 1 },
  content: { padding: 16 },
  tabPane: { gap: 12 },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 14,
    color: Colors.AppOnBackground,
    padding: 0,
  },

  // Filter Dropdown styles
  filterDropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  filterDropBtnActive: {
    borderColor: Colors.BluePrimary,
    backgroundColor: Colors.BluePrimaryContainer + '18',
  },
  filterDropBtnTxt: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  dropOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropMenu: {
    position: 'absolute',
    backgroundColor: Colors.AppSurface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  dropItemActive: {
    backgroundColor: Colors.BluePrimaryContainer + '30',
  },
  dropItemTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.AppOnBackground,
  },
  dropItemTxtActive: {
    fontWeight: '800',
    color: Colors.BluePrimary,
  },

  // Stats
  statsScroll: { marginHorizontal: -4 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  statChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  statChipVal: { fontSize: 18, fontWeight: '900' },
  statChipLbl: { fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'center' },

  // Filter Chips
  filtersScroll: { marginHorizontal: -4 },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
  },
  filterChipActive: { backgroundColor: Colors.BluePrimary, borderColor: Colors.BluePrimary },
  filterChipTxt: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  filterChipTxtActive: { color: '#FFFFFF' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },

  // Student Card
  studentCard: { padding: 12 },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BluePrimary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.BlueOnPrimaryContainer },
  studentName: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  studentMeta: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  studentStatsVal: { fontSize: 16, fontWeight: '900' },
  studentStatsLabel: { fontSize: 9, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },

  // Status Badge
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  statusBadgeTxt: { fontSize: 10, fontWeight: '800' },

  // Empty
  emptyCard: { padding: 32, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, textAlign: 'center' },

  // Mentor Card
  menteeCard: { padding: 12 },
  menteeRow: { flexDirection: 'row', alignItems: 'center' },
  menteeName: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  menteeMeta: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  logsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.BluePrimary + '1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  logsBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.BlueOnPrimaryContainer },

  // Attendance bar
  attBarBg: { height: 4, borderRadius: 2, backgroundColor: Colors.AppOutline, overflow: 'hidden', marginTop: 6 },
  attBarFill: { height: 4, borderRadius: 2 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 10,
  },
  modalDismissOverlay: { flex: 1 },
  modalSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground },
  modalSubTitle: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  modalCloseBtn: { padding: 4 },
  modalScroll: { padding: 20, gap: 12 },

  // Profile
  profileHero: { alignItems: 'center', gap: 6, marginBottom: 8 },
  profileName: { fontSize: 18, fontWeight: '800', color: Colors.AppOnBackground },
  profileSub: { fontSize: 12, color: Colors.AppOnSurfaceVariant, textAlign: 'center' },
  profileSectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },

  // Info Grid
  infoCardGrid: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.AppBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
  },
  infoCardLabel: { fontSize: 10, fontWeight: '600', color: Colors.AppOnSurfaceVariant, textTransform: 'uppercase' },
  infoCardValue: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },

  // Guardian
  innerCard: { padding: 12, backgroundColor: Colors.AppSurface, borderWidth: 1, gap: 10 },
  guardianRow: { gap: 4 },
  guardianLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  guardianValue: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  rowAlign: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.BluePrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.AppOutline },

  // Subject
  subjectName: { fontSize: 11, color: Colors.AppOnBackground, flex: 1, marginRight: 8 },
  subjectPct: { fontSize: 11, fontWeight: '700' },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionBtn: {
    width: '31%',
    backgroundColor: Colors.AppBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.AppSurface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.AppOutline,
  },
  quickActionLabel: { fontSize: 10, fontWeight: '700', color: Colors.AppOnSurfaceVariant, textAlign: 'center' },

  // Mentor Note Input
  textInputArea: {
    backgroundColor: Colors.AppBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    padding: 12,
    fontSize: 13,
    color: Colors.AppOnBackground,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addLogBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addLogBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // History
  historyCard: { padding: 12, borderWidth: 1, gap: 6, marginBottom: 8 },
  historyDate: { fontSize: 11, fontWeight: '700', color: Colors.BluePrimary },
  historyNotes: { fontSize: 13, color: Colors.AppOnBackground, lineHeight: 18 },

  // Alert banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
  },
  alertBannerText: { fontSize: 12, color: '#92400E', fontWeight: '600', flex: 1 },

  // Trend details styles
  trendItem: {
    width: '47%',
    gap: 4,
    marginBottom: 6,
  },
  trendLabel: {
    fontSize: 10,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  trendBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  remarkItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.AppBackground,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    marginBottom: 8,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleBtnActive: {
    borderColor: Colors.BluePrimary,
    backgroundColor: Colors.BluePrimaryContainer + '20',
  },
  statusToggleBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  statusToggleBtnTxtActive: {
    color: Colors.BluePrimary,
    fontWeight: '800',
  },
});
