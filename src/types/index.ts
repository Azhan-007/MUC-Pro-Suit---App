// All domain types — ported from MockData.kt data classes

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  course: string;
  semester: string;
  batch: string;
  section: string;
  classAdvisor: string;
  mentor: string;
  rollNumber: string;
  bloodGroup: string;
  mobile: string;
  email: string;
  dob: string;
  gender: string;
  permanentAddress: string;
  fatherName: string;
  motherName: string;
  emergencyContact: string;
  avatarUrl?: string;
}

export interface FacultyProfile {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  subjectsTaught: string[];
  mobile: string;
  email: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  qualification: string;
  experience: string;
  address: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  rollNo: string;
  registerNumber: string;
}

export interface ClassSession {
  id: string;
  subject: string;
  section: string;
  room: string;
  time: string;
  day: string;
  status: 'COMPLETED' | 'ONGOING' | 'UPCOMING';
  totalStudents: number;
}

export interface StudentAttendanceEntry {
  studentId: string;
  name: string;
  rollNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface ExamMarkEntry {
  studentId: string;
  name: string;
  rollNo: string;
  marks: number | null;
  maxMarks: number;
}

// ─────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────
export interface AttendanceOverview {
  overallPercentage: number;
  presentDays: number;
  absentDays: number;
  totalDays: number;
  totalAttendedClasses: number;
  missedClasses: number;
  classesTo75Percent: number;
  currentStreak: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PENDING' | 'HOLIDAY' | 'LATE';

export interface DailyAttendance {
  time: string;
  subject: string;
  period: string;
  room: string;
  status: AttendanceStatus;
}

export interface SubjectAttendance {
  subjectName: string;
  percentage: number;
  fraction: string;
  statusLevel: 'SAFE' | 'WARNING' | 'LOW';
  tip: string;
  facultyName?: string;
}

// ─────────────────────────────────────────────
// Timetable
// ─────────────────────────────────────────────
export type ClassStatus = 'COMPLETED' | 'ONGOING' | 'UPCOMING';

export interface TimetableClass {
  time: string;
  subject: string;
  professor: string;
  room: string;
  isLunchBreak?: boolean;
  status?: ClassStatus;
}

export interface EventDeadline {
  title: string;
  details: string;
  dateText: string;
  type: 'EXAM' | 'WORKSHOP';
}

// ─────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────
export interface GpaPoint {
  semester: string;
  gpa: number;
}

export interface ResultOverview {
  currentSgpa: number;
  cgpa: number;
  creditsProgress: string;
  currentProgressPercentage: number;
  accuracy: string;
  academicStanding: string;
  gpaTrend: GpaPoint[];
}

export interface SubjectGrade {
  code: string;
  subjectName: string;
  credits: number;
  grade: string;
  passStatus: 'PASS' | 'FAIL';
  internals: string;
  externals: string;
  total: string;
}

// ─────────────────────────────────────────────
// Fees
// ─────────────────────────────────────────────
export interface FeeSummary {
  outstandingAmount: number;
  paidAmount: number;
  progressPercent: number;
  dueDateText: string;
  isPending: boolean;
  scholarshipApplied: string;
  scholarshipDiscount: string;
  lastPaymentDate: string;
  nextDueDate: string;
}

export interface FeeDetail {
  title: string;
  amount: number;
  isPaid: boolean;
  settledDateText?: string;
  dueDateText?: string;
}

export interface PaymentTransaction {
  receiptNumber: string;
  date: string;
  amount: number;
  method: string;
}

// ─────────────────────────────────────────────
// Announcements
// ─────────────────────────────────────────────
export type AnnouncementCategory =
  | 'EXAMS'
  | 'PLACEMENTS'
  | 'SCHOLARSHIPS'
  | 'LIBRARY'
  | 'ACADEMIC';

export interface Announcement {
  id: string;
  category: AnnouncementCategory;
  title: string;
  summary: string;
  content: string;
  dateText: string;
  author: string;
  initials: string;
  isImportant?: boolean;
  attachmentName?: string;
  imageKey?: string;
}

export interface UpcomingEvent {
  title: string;
  dateText: string;
  timeText: string;
  imageKey: string;
}

// ─────────────────────────────────────────────
// New Features Domain Types
// ─────────────────────────────────────────────

export interface Assignment {
  id: string;
  subjectName: string;
  title: string;
  dueDate: string;
  marks: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  grade?: string;
  attachmentName?: string;
  description?: string;
  assignedDate?: string;
  professorName?: string;
  remarks?: string;
}

export interface StudyMaterial {
  id: string;
  subjectName: string;
  title: string;
  fileType: 'PDF' | 'PPTX' | 'DOCX' | 'PPT' | string;
  fileSize: string;
  uploadedDate: string;
  unit?: string;
  professor?: string;
  description?: string;
}

export interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  daysLeft: number;
  status: 'SAFE' | 'OVERDUE';
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  copiesAvailable: number;
  isAvailable: boolean;
}

export interface JobPosting {
  id: string;
  companyName: string;
  role: string;
  packageText: string;
  location: string;
  eligibility: string;
  deadline: string;
  status: 'APPLY' | 'APPLIED' | 'SHORTLISTED' | 'NOT_ELIGIBLE';
}

export interface CollegeEvent {
  id: string;
  title: string;
  dateText: string;
  timeText: string;
  venue: string;
  category: 'TECHNICAL' | 'CULTURAL' | 'SPORTS';
  isRegistered: boolean;
}

export interface CertificateRequest {
  id: string;
  certificateType: string;
  reason: string;
  submittedDate: string;
  status: 'PENDING' | 'APPROVED' | 'ISSUED' | 'REJECTED';
  downloadUrl?: string;
}

