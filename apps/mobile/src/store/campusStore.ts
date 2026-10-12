import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';
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
  allTimetableClasses: TimetableClass[];
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
  fetchCampusData: () => Promise<void>;
}

// Compute today's short day label (Mon, Tue, Wed, Thu, Fri, Sat). Defaults to Mon on Sunday.
const getTodayLabel = () => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = new Date().getDay();
  return day === 0 ? 'Mon' : labels[day];
};

import {
  mockStudentFeeSummary,
  mockStudentFeeDetails,
  mockStudentTransactions,
  mockStudentResultOverview,
  mockStudentSubjectGrades,
  mockStudentAnnouncements,
} from '../data/mockStudentData';

export const useCampusStore = create<CampusState>((set) => ({
  // Initial state
  selectedDay: getTodayLabel(),
  selectedSemester: 'Semester 1',
  notificationCount: 3,
  quickAccessShortcuts: ['Attendance', 'Timetable', 'Performance', 'Fees', 'Assignments', 'Library'],
  facultyQuickAccessShortcuts: ['Attendance', 'Timetable', 'Enter Marks', 'Circulars', 'Academic Hub', 'Assessments'],

  attendanceOverview: { overallPercentage: 0, presentDays: 0, absentDays: 0, totalDays: 0, totalAttendedClasses: 0, missedClasses: 0, classesTo75Percent: 0, currentStreak: 0 },
  dailyAttendance: [] as any[],
  subjectAttendanceList: [] as any[],

  allTimetableClasses: [] as any[],
  timetableClasses: [] as any[],

  resultOverview: mockStudentResultOverview,
  subjectGrades: mockStudentSubjectGrades,

  feeSummary: mockStudentFeeSummary,
  feeDetails: mockStudentFeeDetails,
  paymentTransactions: mockStudentTransactions,

  announcements: mockStudentAnnouncements,

  // Actions
  setSelectedDay: (day) =>
    set((state) => ({ 
      selectedDay: day, 
      timetableClasses: state.allTimetableClasses.filter(c => {
        const dayStr = (c as any).day?.toUpperCase() || '';
        const searchStr = day.toUpperCase();
        return dayStr === searchStr || dayStr.startsWith(searchStr);
      })
    })),

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

  fetchCampusData: async () => {
    try {
      const ttRes = await apiClient.get('/academic/mobile/timetable');
      const attRes = await apiClient.get('/attendance/mobile-overview');
      set((state) => {
        const allTT = ttRes.data || [];
        const filteredTT = allTT.filter((c: any) => {
          const dayStr = c.day?.toUpperCase() || '';
          const searchStr = state.selectedDay.toUpperCase();
          return dayStr === searchStr || dayStr.startsWith(searchStr);
        });
        return { 
          allTimetableClasses: allTT,
          timetableClasses: filteredTT,
          attendanceOverview: attRes.data?.overview || { totalAttendedClasses: 0, missedClasses: 0, classesTo75Percent: 0, currentStreak: 0, overallPercentage: 0 },
          dailyAttendance: attRes.data?.daily || [],
          subjectAttendanceList: attRes.data?.subjects || []
        };
      });
    } catch (e) {
      console.error(e);
    }
  }
}));
