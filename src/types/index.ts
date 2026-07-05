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
  shift?: 'SHIFT_I' | 'SHIFT_II' | 'GIRLS';
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

// Leaves
// ─────────────────────────────────────────────
export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveAllocation {
  id: string;
  year: string;
  balances: {
    casualLeave: LeaveBalance;
    medicalLeave: LeaveBalance;
    dutyLeave: LeaveBalance;
    earnedLeave: LeaveBalance;
    lossOfPay: LeaveBalance;
    maternityPaternityLeave?: LeaveBalance;
  };
}

export interface LeaveApplication {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'DRAFT' | 'APPLIED' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'PENDING';
  totalDays: number;
  allocationYear: string;
  appliedDate: string;
  halfDay?: boolean;
  emergencyContact?: string;
  attachmentName?: string;
}

// ─────────────────────────────────────────────
// Library
// ─────────────────────────────────────────────
export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  copiesAvailable?: number;
  isAvailable?: boolean;
  category: string;
  publisher: string;
  accessNo: string;
  rackNo: string;
  isbn: string;
  language: string;
  edition: string;
  availableCopies: number;
  totalCopies: number;
  status: 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'UNAVAILABLE';
  description: string;
  imageKey?: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  borrowDate?: string;
  issueDate: string;
  dueDate: string;
  daysLeft?: number;
  renewCount: number;
  accessNo: string;
  status: 'SAFE' | 'OVERDUE' | 'ISSUED' | 'DUE_SOON';
}

export interface ReadingHistoryEntry {
  id: string;
  bookId: string;
  title: string;
  author: string;
  issueDate: string;
  returnDate: string;
  totalDays: number;
  renewCount: number;
}

export interface LibraryStats {
  borrowedCount: number;
  returnedCount: number;
  overdueCount: number;
  renewedCount: number;
  currentCount: number;
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

export interface CertificateRequest {
  id: string;
  certificateType: string;
  reason: string;
  submittedDate: string;
  status: 'PENDING' | 'APPROVED' | 'ISSUED' | 'REJECTED';
  downloadUrl?: string;
}

// ─────────────────────────────────────────────
// Placement Cell
// ─────────────────────────────────────────────
export interface PlacementDrive {
  id: string;
  companyName: string;
  role: string;
  package: string;
  location: string;
  driveDate: string;
  deadline: string;
  registeredCount: number;
  eligibleCount: number;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  jobType: 'Full Time' | 'Internship' | 'Intern + FTO';
  minCgpa: number;
  passingYear: string;
  departments: string[];
  skills: string[];
  venue: string;
  selectionProcess: string[];
  hrContact: string;
  jobDescription: string;
  timelineSteps: string[];
  currentTimelineStepIndex: number;
}

export interface PlacementStudent {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  cgpa: number;
  currentStatus: 'ELIGIBLE' | 'REGISTERED' | 'ATTENDED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
  driveId: string;
}

export interface PlacementStats {
  totalDrives: number;
  upcomingDrives: number;
  ongoingDrives: number;
  completedDrives: number;
  totalRegistered: number;
  totalSelected: number;
}

// ─────────────────────────────────────────────
// College Events
// ─────────────────────────────────────────────
export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  day: string;
  month: string;
  year: string;
  dateText?: string;
  timeText?: string;
  startTime: string;
  endTime: string;
  venue: string;
  category: 'TECHNICAL' | 'CULTURAL' | 'SPORTS' | 'Technical' | 'Cultural' | 'Academic' | 'National Festival' | 'Symposium';
  isRegistered?: boolean;
  coordinator: string;
  assignedDuty: 'Technical Judge' | 'Coordinator' | 'Volunteer Incharge' | 'Registration Desk' | 'Discipline Committee' | 'Stage Committee' | 'Hospitality' | 'Transport' | 'Documentation' | 'Photography' | 'Evaluation Committee' | string;
  dutyStatus: 'ASSIGNED' | 'CONFIRMED' | 'REPORTED' | 'STARTED' | 'COMPLETED';
  status: 'UPCOMING' | 'TODAY' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  reportingTime: string;
  dressCode: string;
  assignedCommittee: string;
  specialInstructions: string;
  requiredDocuments: string[];
  emergencyContact: string;
  timelineSteps: string[];
  currentTimelineStepIndex: number;
}

export interface CircularAttachment {
  name: string;
  type: 'PDF' | 'Image' | 'Word' | 'Excel' | 'ZIP';
  size: string;
}

export interface CircularItem {
  id: string;
  category: 'Academic' | 'Exams' | 'Placement' | 'Library' | 'Administration' | 'Events' | 'HR' | 'Finance' | 'Scholarships' | 'Research' | 'Training' | 'IQAC' | 'NAAC' | 'General';
  priority: 'Normal' | 'Important' | 'Urgent' | 'Critical';
  department: string;
  targetDesignation: string;
  publisher: string;
  publishedDate: string;
  expiryDate: string;
  title: string;
  summary: string;
  description: string;
  coverImage?: string;
  attachmentCount: number;
  attachments: CircularAttachment[];
  circularNo: string;
  referenceNo: string;
  isRead: boolean;
  isBookmarked: boolean;
  isArchived: boolean;
}

export interface ERPNotification {
  id: string;
  module: 'Academic' | 'Attendance' | 'Timetable' | 'Leave' | 'Circulars' | 'Library' | 'Placement' | 'Events' | 'Examination' | 'Faculty' | 'HR' | 'Finance' | 'System' | 'Emergency';
  category: string;
  priority: 'Critical' | 'Urgent' | 'Important' | 'Normal' | 'Low';
  title: string;
  description: string;
  referenceId?: string;
  createdTime: string;
  readTime?: string;
  expiryTime?: string;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  actionRequired?: 'View' | 'Open' | 'Download' | 'Renew' | 'Approve' | 'Reject' | 'Join' | 'Acknowledge' | 'Dismiss' | string;
  deepLink: string;
}

