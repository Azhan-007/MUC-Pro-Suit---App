export type StudentStatus = 'Active' | 'Inactive' | 'On Probation';
export type FacultyStatus = 'Marked' | 'Pending' | 'Scheduled';
export type AttendanceStatus = 'Present' | 'Absent';
export type FeeStatus = 'Paid' | 'Partial' | 'Overdue';

export type UserRole = 'ADMIN' | 'MASTER_ADMIN' | 'SUPER_ADMIN';

export interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  role?: string;
  action: string;
  category: 'AUTH' | 'DATABASE' | 'SECURITY' | 'ACADEMIC' | 'FINANCIAL' | 'SETTINGS';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  ipAddress: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  department: string;
  course: string;
  year: string;
  status: StudentStatus;
  attendancePercentage: number;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  department: string;
  course: string;
  subject: string;
  time: string;
  status: FacultyStatus;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  courseSection: string;
  status: AttendanceStatus;
  attendancePercentage: number;
  date: string;
}

export interface FeeRecord {
  receiptNo: string;
  studentId: string;
  studentName: string;
  initials: string;
  department?: string;
  course?: string;
  date: string;
  amount: number;
  totalDue?: number;
  paidAmount?: number;
  remainingBalance?: number;
  method: string;
  status: FeeStatus;
  feeType?: string; // e.g. Tuition Fee, Semester Fee, Exam Fee, Hostel Fee
  academicYear?: string;
  semester?: string;
  dueDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category: 'primary' | 'secondary' | 'tertiary';
  priority?: 'High' | 'Medium' | 'Low' | 'Urgent';
  status?: 'Draft' | 'Scheduled' | 'Published' | 'Archived';
  audience?: 'All College' | 'Students' | 'Faculty' | 'Department' | 'Course';
  department?: string;
  author?: string;
  scheduledDate?: string;
}

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
  endTime?: string;
  date?: string; // e.g. 2026-10-12
  description?: string;
  organizer?: string;
  category?: 'Academic' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
  audience?: 'All College' | 'Students' | 'Faculty' | 'Department';
  department?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  block: string;
  countStudents: number;
  countFaculty: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
  activeStudents: number;
}

export interface TimetableSlot {
  id: string;
  day: string; // e.g. Mon, Tue... or D1, D2
  time: string; // e.g. 09:30 AM
  endTime?: string; // e.g. 10:30 AM
  courseName: string;
  subject?: string;
  facultyName: string;
  room: string;
  department?: string;
  section?: string;
  status?: 'Scheduled' | 'Substituted' | 'Cancelled';
  replacementFaculty?: string;
}

export interface ExamSchedule {
  id: string;
  course: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  room: string;
  department?: string;
  examType?: string; // e.g. Midterm, Semester, Internal, Practical
  section?: string;
  status?: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  subject?: string;
  department?: string;
  examId?: string;
  examType?: string;
  grade: string;
  marks: number;
  maxMarks: number;
  status: 'Pass' | 'Fail';
  resultStatus?: 'Draft' | 'Published' | 'Withheld' | 'Pending';
  academicYear?: string;
  semester?: string;
  publishedAt?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publisher?: string;
  location?: string;
  status?: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Damaged';
}

export interface LibraryTransaction {
  id: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  fineAmount?: number;
}

export interface PlacementRecord {
  id: string;
  studentId?: string;
  studentName: string;
  company: string;
  salaryPackage: string; // e.g. "$120,000" or "₹12 LPA"
  numericPackage?: number;
  position: string;
  department?: string;
  course?: string;
  placementType?: 'On-Campus' | 'Off-Campus' | 'Internship + PPO' | 'Pool Drive';
  status: 'Placed' | 'Selected' | 'Interview Round' | 'Shortlisted' | 'Rejected';
  appliedDate?: string;
  offerDate?: string;
}

export interface Certificate {
  id: string;
  studentId?: string;
  studentName: string;
  type: string; // e.g. "Degree Certificate", "Provisional Certificate", etc.
  issueDate: string;
  department?: string;
  course?: string;
  status: 'Requested' | 'Pending Approval' | 'Approved' | 'Generated' | 'Issued' | 'Rejected';
  remarks?: string;
  certNumber?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'Academic' | 'Financial' | 'Attendance' | 'Registrar' | 'Student' | 'Faculty' | 'Examination' | 'Results' | 'Library' | 'Placement' | 'Certificates';
  generatedAt: string;
  size: string;
  department?: string;
  academicYear?: string;
  semester?: string;
  recordCount?: number;
  filterSummary?: string;
}
