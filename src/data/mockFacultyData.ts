import {
  FacultyProfile,
  ClassSession,
  StudentRecord,
  StudentAttendanceEntry,
  ExamMarkEntry,
} from '../types';

// ── Faculty Profile ──
export const mockFacultyProfile: FacultyProfile = {
  id: 'FAC001',
  name: 'Dr P Rizwan Ahmed',
  employeeId: 'FAC001',
  designation: 'Associate Professor',
  department: 'BSc Computer Science',
  subjectsTaught: ['Database Management System', 'Operating System'],
  mobile: '+91 98765 00001',
  email: 'rizwan.ahmed@mucollege.edu.in',
  dob: '15.04.1982',
  gender: 'Male',
  bloodGroup: 'A+',
  qualification: 'Ph.D - Computer Science (Anna University)',
  experience: '14 Years',
  address: 'MUC Campus, Ambur - 635802, Tamil Nadu',
};

// ── Faculty Timetable (Mon - Sat) ──
export const mockFacultyTimetable: Record<string, ClassSession[]> = {
  Mon: [
    { id: 'm1', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '09:00 - 10:00', day: 'Mon', status: 'COMPLETED', totalStudents: 52 },
    { id: 'm2', subject: 'Operating System',            section: 'II B.Sc CS',  room: 'Room 402', time: '10:00 - 11:00', day: 'Mon', status: 'COMPLETED', totalStudents: 48 },
    { id: 'm3', subject: 'Database Management System', section: 'II B.Sc CS',  room: 'Lab 01', time: '11:30 - 12:30', day: 'Mon', status: 'ONGOING', totalStudents: 48 },
    { id: 'm4', subject: 'Operating System',            section: 'III B.Sc CS', room: 'Room 402', time: '01:30 - 02:30', day: 'Mon', status: 'UPCOMING', totalStudents: 52 },
    { id: 'm5', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '02:30 - 03:30', day: 'Mon', status: 'UPCOMING', totalStudents: 52 },
  ],
  Tue: [
    { id: 't1', subject: 'Operating System',            section: 'III B.Sc CS', room: 'Room 402', time: '09:00 - 10:00', day: 'Tue', status: 'UPCOMING', totalStudents: 52 },
    { id: 't2', subject: 'Database Management System', section: 'II B.Sc CS',  room: 'Lab 01', time: '10:00 - 11:00', day: 'Tue', status: 'UPCOMING', totalStudents: 48 },
    { id: 't3', subject: 'Operating System',            section: 'II B.Sc CS',  room: 'Room 402', time: '11:30 - 12:30', day: 'Tue', status: 'UPCOMING', totalStudents: 48 },
    { id: 't4', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '02:30 - 03:30', day: 'Tue', status: 'UPCOMING', totalStudents: 52 },
  ],
  Wed: [
    { id: 'w1', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '09:00 - 10:00', day: 'Wed', status: 'UPCOMING', totalStudents: 52 },
    { id: 'w2', subject: 'Operating System',            section: 'III B.Sc CS', room: 'Room 402', time: '10:00 - 11:00', day: 'Wed', status: 'UPCOMING', totalStudents: 52 },
    { id: 'w3', subject: 'Database Management System', section: 'II B.Sc CS',  room: 'Lab 01', time: '01:30 - 02:30', day: 'Wed', status: 'UPCOMING', totalStudents: 48 },
    { id: 'w4', subject: 'Operating System',            section: 'II B.Sc CS',  room: 'Room 402', time: '02:30 - 03:30', day: 'Wed', status: 'UPCOMING', totalStudents: 48 },
    { id: 'w5', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '03:30 - 04:30', day: 'Wed', status: 'UPCOMING', totalStudents: 52 },
  ],
  Thu: [
    { id: 'th1', subject: 'Operating System',            section: 'II B.Sc CS',  room: 'Room 402', time: '09:00 - 10:00', day: 'Thu', status: 'UPCOMING', totalStudents: 48 },
    { id: 'th2', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '10:00 - 11:00', day: 'Thu', status: 'UPCOMING', totalStudents: 52 },
    { id: 'th3', subject: 'Operating System',            section: 'III B.Sc CS', room: 'Room 402', time: '11:30 - 12:30', day: 'Thu', status: 'UPCOMING', totalStudents: 52 },
  ],
  Fri: [
    { id: 'f1', subject: 'Database Management System', section: 'II B.Sc CS',  room: 'Lab 01', time: '09:00 - 10:00', day: 'Fri', status: 'UPCOMING', totalStudents: 48 },
    { id: 'f2', subject: 'Operating System',            section: 'II B.Sc CS',  room: 'Room 402', time: '10:00 - 11:00', day: 'Fri', status: 'UPCOMING', totalStudents: 48 },
    { id: 'f3', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '02:30 - 03:30', day: 'Fri', status: 'UPCOMING', totalStudents: 52 },
    { id: 'f4', subject: 'Operating System',            section: 'III B.Sc CS', room: 'Room 402', time: '03:30 - 04:30', day: 'Fri', status: 'UPCOMING', totalStudents: 52 },
  ],
  Sat: [
    { id: 's1', subject: 'Database Management System', section: 'III B.Sc CS', room: 'Lab 01', time: '09:00 - 10:00', day: 'Sat', status: 'UPCOMING', totalStudents: 52 },
    { id: 's2', subject: 'Operating System',            section: 'II B.Sc CS',  room: 'Room 402', time: '10:00 - 11:00', day: 'Sat', status: 'UPCOMING', totalStudents: 48 },
  ],
};

// ── Mock Students ──
export const mockClassStudents: StudentRecord[] = [
  { id: 's01', name: 'Mohammed Azhan T',   rollNo: '710', registerNumber: 'MUC710' },
  { id: 's02', name: 'Abdul Rahman K',     rollNo: '711', registerNumber: 'MUC711' },
  { id: 's03', name: 'Fathima Zahra M',    rollNo: '712', registerNumber: 'MUC712' },
  { id: 's04', name: 'Ibrahim Siddiq P',   rollNo: '713', registerNumber: 'MUC713' },
  { id: 's05', name: 'Ayesha Banu R',      rollNo: '714', registerNumber: 'MUC714' },
  { id: 's06', name: 'Umar Farooq S',      rollNo: '715', registerNumber: 'MUC715' },
  { id: 's07', name: 'Zainab Nasreen A',   rollNo: '716', registerNumber: 'MUC716' },
  { id: 's08', name: 'Hassan Ali M',       rollNo: '717', registerNumber: 'MUC717' },
  { id: 's09', name: 'Maryam Siddiqui F',  rollNo: '718', registerNumber: 'MUC718' },
  { id: 's10', name: 'Yusuf Khalid B',     rollNo: '719', registerNumber: 'MUC719' },
  { id: 's11', name: 'Safia Begum N',      rollNo: '720', registerNumber: 'MUC720' },
  { id: 's12', name: 'Tariq Ismail H',     rollNo: '721', registerNumber: 'MUC721' },
  { id: 's13', name: 'Noor Ul Huda Z',     rollNo: '722', registerNumber: 'MUC722' },
  { id: 's14', name: 'Sulaiman Qasim T',   rollNo: '723', registerNumber: 'MUC723' },
  { id: 's15', name: 'Ruqayyah Farouk A',  rollNo: '724', registerNumber: 'MUC724' },
];

export const getDefaultAttendanceEntries = (): StudentAttendanceEntry[] =>
  mockClassStudents.map((s) => ({
    studentId: s.id,
    name: s.name,
    rollNo: s.rollNo,
    status: 'PRESENT' as const,
  }));

export const getDefaultExamEntries = (maxMarks: number): ExamMarkEntry[] =>
  mockClassStudents.map((s) => ({
    studentId: s.id,
    name: s.name,
    rollNo: s.rollNo,
    marks: null,
    maxMarks,
  }));

export const mockFacultySubjects = [
  { id: 'sub01', subject: 'Database Management System', sections: 'II & III B.Sc CS', room: 'Lab 01', totalStudents: 100, avgAttendance: 87 },
  { id: 'sub02', subject: 'Operating System', sections: 'II & III B.Sc CS', room: 'Room 402', totalStudents: 100, avgAttendance: 82 },
];

export const mockFacultyStats = {
  classesToday: 3,
  totalClassesTaken: 84,
  avgAttendancePercent: 85,
  pendingMarksCount: 2,
};
