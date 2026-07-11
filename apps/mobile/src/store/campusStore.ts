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

  // Quick Access Shortcuts customization
  quickAccessShortcuts: string[];
  facultyQuickAccessShortcuts: string[];

  // Actions
  setSelectedDay: (day: string) => void;
  setSelectedSemester: (semester: string) => void;
  payOutstandingFees: (method: string) => void;
  setNotificationCount: (count: number) => void;
  setQuickAccessShortcuts: (shortcuts: string[]) => void;
  setFacultyQuickAccessShortcuts: (shortcuts: string[]) => void;
}

export const useCampusStore = create<CampusState>((set) => ({
  // Initial state loaded from mock data
  selectedDay: 'Wed',
  selectedSemester: 'Semester 4',
  notificationCount: 2,
  quickAccessShortcuts: ['Attendance', 'Timetable', 'Performance', 'Fees', 'Assignments', 'Library'],
  facultyQuickAccessShortcuts: ['Attendance', 'Timetable', 'Enter Marks', 'Circulars', 'Academic Hub', 'Assessments'],

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

  setNotificationCount: (count) =>
    set({ notificationCount: count }),

  payOutstandingFees: (method) =>
    set((state) => {
      const paidAmount = state.feeSummary.paidAmount + state.feeSummary.outstandingAmount;
      const outstandingAmount = 0;
      const progressPercent = 1.0;
      
      const newTxn = {
        receiptNumber: Math.floor(100000 + Math.random() * 900000).toString(),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        method: method || 'Online Payment',
        amount: state.feeSummary.outstandingAmount,
      };

      const updatedFeeDetails = state.feeDetails.map(detail => ({
        ...detail,
        isPaid: true,
        settledDateText: newTxn.date
      }));

      return {
        feeSummary: {
          ...state.feeSummary,
          paidAmount,
          outstandingAmount,
          progressPercent,
          lastPaymentDate: newTxn.date,
          nextDueDate: 'Fully Settled',
        },
        feeDetails: updatedFeeDetails,
        paymentTransactions: [newTxn, ...state.paymentTransactions],
      };
    }),

  setQuickAccessShortcuts: (shortcuts) =>
    set({ quickAccessShortcuts: shortcuts }),

  setFacultyQuickAccessShortcuts: (shortcuts) =>
    set({ facultyQuickAccessShortcuts: shortcuts }),
}));
