export type StudentStatus = 'Active' | 'Inactive' | 'On Probation';
export type FacultyStatus = 'Marked' | 'Pending' | 'Scheduled';
export type AttendanceStatus = 'Present' | 'Absent';
export type FeeStatus = 'Paid' | 'Partial' | 'Overdue';

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
  date: string;
  amount: number;
  method: string;
  status: FeeStatus;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category: 'primary' | 'secondary' | 'tertiary';
}

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
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
  day: string; // e.g. Mon, Tue...
  time: string; // e.g. 09:30 AM
  courseName: string;
  facultyName: string;
  room: string;
}

export interface ExamSchedule {
  id: string;
  course: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  room: string;
}

export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  grade: string;
  marks: number;
  maxMarks: number;
  status: 'Pass' | 'Fail';
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface PlacementRecord {
  id: string;
  studentName: string;
  company: string;
  salaryPackage: string; // e.g. "$12 LPA"
  position: string;
  status: 'Placed' | 'Selected' | 'Interview Round';
}

export interface Certificate {
  id: string;
  studentName: string;
  type: string; // e.g. "Degree Certificate", "Provisional"
  issueDate: string;
  status: 'Generated' | 'Pending Approval' | 'Requested';
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'Academic' | 'Financial' | 'Attendance' | 'Registrar';
  generatedAt: string;
  size: string;
}
