/**
 * academicService.ts
 * 
 * Centralized API service for the 6 priority domains:
 * departments, classes, timetable, attendance, faculty, students
 *
 * All data for these domains MUST come from here — no mock data.
 */

import { apiClient } from '../lib/apiClient';

// ── Types ────────────────────────────────────────

export interface FacultyTimetableSlot {
  id: string;
  day: string;
  time: string;
  periodCode: string;
  subject: string;
  subjectId: string;
  className: string;
  classId: string;
  shift: string;
  room: string;
  section?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  totalStudents: number;
}

export interface FacultyClass {
  assignmentId: string;
  classId: string;
  className: string;
  classDisplayName: string;
  subjectId: string;
  subjectName: string;
  shift: string;
  totalStudents: number;
}

export interface ClassStudent {
  studentId: string;
  enrollmentId: string;
  name: string;
  registrationNumber: string;
  rollNumber: string;
}

export interface StudentAttendanceStat {
  studentId: string;
  enrollmentId: string;
  name: string;
  registrationNumber: string;
  attended: number;
  total: number;
  percentage: number;
  statusLevel: 'SAFE' | 'CONDONATION' | 'DEFAULTER';
}

export interface AttendanceStatsSummary {
  total: number;
  defaulters: number;
  safe: number;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectName: string;
  fraction: string;
  percentage: number;
  classesNeeded: number;
  statusLevel: 'SAFE' | 'WARNING' | 'DANGER';
}

export interface DailyPeriodEntry {
  period: string;
  status: string;
  subject: string;
}

export interface DailyAttendanceSummary {
  date: string;
  periods: DailyPeriodEntry[];
}

export interface StudentAttendanceOverview {
  overview: {
    overallPercentage: number;
    presentDays: number;
    absentDays: number;
    totalDays: number;
    totalAttendedClasses: number;
    missedClasses: number;
    classesTo75Percent: number;
    currentStreak: number;
  };
  subjects: SubjectAttendanceSummary[];
  daily: DailyAttendanceSummary[];
}

export interface StudentTimetableSlot {
  id: string;
  day: string;
  time: string;
  periodCode: string;
  subject: string;
  professor: string;
  room: string;
  isLunchBreak: boolean;
  status: string;
}

// ── Student APIs ──────────────────────────────────

export const AcademicService = {
  /**
   * Get the logged-in student's timetable for the current class.
   */
  async getStudentTimetable(): Promise<StudentTimetableSlot[]> {
    const res = await apiClient.get('/academic/mobile/timetable');
    return res.data || [];
  },

  /**
   * Get the logged-in student's attendance overview, subject breakdown, and daily history.
   */
  async getStudentAttendanceOverview(): Promise<StudentAttendanceOverview> {
    const res = await apiClient.get('/attendance/mobile-overview');
    return res.data;
  },

  // ── Faculty APIs ────────────────────────────────

  /**
   * Get the logged-in faculty member's full timetable.
   */
  async getFacultyTimetable(): Promise<FacultyTimetableSlot[]> {
    const res = await apiClient.get('/academic/mobile/faculty-timetable');
    return res.data || [];
  },

  /**
   * Get all classes the logged-in faculty teaches (teaching assignments).
   */
  async getFacultyClasses(): Promise<FacultyClass[]> {
    const res = await apiClient.get('/academic/mobile/faculty-classes');
    return res.data || [];
  },

  /**
   * Get all active students enrolled in a class.
   * Used when a faculty member selects a class to mark attendance.
   */
  async getClassStudents(classId: string): Promise<ClassStudent[]> {
    const res = await apiClient.get('/academic/mobile/class-students', {
      params: { classId }
    });
    return res.data || [];
  },

  /**
   * Get attendance stats for students in a class (and optionally a subject).
   * Returns per-student attendance % and defaulter flags.
   */
  async getFacultyAttendanceStats(
    classId?: string,
    subjectId?: string
  ): Promise<{ students: StudentAttendanceStat[]; summary: AttendanceStatsSummary }> {
    const res = await apiClient.get('/academic/mobile/faculty-attendance-stats', {
      params: { classId, subjectId }
    });
    return res.data;
  },

  /**
   * Mark attendance for a class session.
   */
  async markAttendance(data: {
    classId: string;
    subjectId: string;
    date: string;
    period: string;
    entries: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY' }[];
  }): Promise<{ success: boolean; count: number }> {
    const res = await apiClient.post('/attendance/mark', data);
    return res.data;
  },

  // ── Shared / Admin APIs ─────────────────────────

  /**
   * Get list of all departments.
   */
  async getDepartments() {
    const res = await apiClient.get('/academic/departments');
    return res.data || [];
  },

  /**
   * Get list of all classes.
   */
  async getClasses() {
    const res = await apiClient.get('/academic/classes');
    return res.data || [];
  },

  /**
   * Get list of all faculty members.
   */
  async getAllFaculty() {
    const res = await apiClient.get('/academic/faculty');
    return res.data || [];
  },

  /**
   * Get list of all students (paginated).
   */
  async getAllStudents(page = 1, classId?: string) {
    const res = await apiClient.get('/academic/students', {
      params: { page, classId }
    });
    return res.data || [];
  },
};
