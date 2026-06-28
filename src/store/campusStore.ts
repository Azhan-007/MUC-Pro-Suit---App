import { create } from 'zustand';
import {
  AttendanceOverview,
  DailyAttendance,
  SubjectAttendance,
  TimetableClass,
  ResultOverview,
  SubjectGrade,
  FeeSummary,
  FeeDetail,
  PaymentTransaction,
  Announcement,
} from '../types';
import {
  mockAttendanceOverview,
  mockDailyAttendance,
  mockSubjectAttendance,
  mockTimetable,
  mockResultOverview,
  mockSubjectGrades,
  mockFeeSummary,
  mockFeeDetails,
  mockPaymentTransactions,
  mockAnnouncements,
} from '../data/mockData';

interface CampusState {
  // Navigation state
  selectedDay: string;
  selectedSemester: string;
  notificationCount: number;

  // Attendance
  attendanceOverview: AttendanceOverview;
  dailyAttendance: DailyAttendance[];
  subjectAttendanceList: SubjectAttendance[];

  // Timetable
  timetableClasses: TimetableClass[];

  // Results
  resultOverview: ResultOverview;
  subjectGrades: SubjectGrade[];

  // Fees
  feeSummary: FeeSummary;
  feeDetails: FeeDetail[];
  paymentTransactions: PaymentTransaction[];

  // Announcements
  announcements: Announcement[];

  // Actions
  setSelectedDay: (day: string) => void;
  setSelectedSemester: (semester: string) => void;
}

export const useCampusStore = create<CampusState>((set) => ({
  // Initial state loaded from mock data
  selectedDay: 'Wed',
  selectedSemester: 'Semester 4',
  notificationCount: 2,

  attendanceOverview: mockAttendanceOverview,
  dailyAttendance: mockDailyAttendance,
  subjectAttendanceList: mockSubjectAttendance,

  timetableClasses: mockTimetable['Wed'] ?? [],

  resultOverview: mockResultOverview,
  subjectGrades: mockSubjectGrades,

  feeSummary: mockFeeSummary,
  feeDetails: mockFeeDetails,
  paymentTransactions: mockPaymentTransactions,

  announcements: mockAnnouncements,

  // Actions
  setSelectedDay: (day) =>
    set({ selectedDay: day, timetableClasses: mockTimetable[day] ?? [] }),

  setSelectedSemester: (semester) =>
    set({ selectedSemester: semester }),
}));
