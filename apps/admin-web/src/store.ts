import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Student, Faculty, AttendanceRecord, FeeRecord, Announcement, EventItem,
  Department, Course, TimetableSlot, ExamSchedule, ResultRecord, 
  LibraryBook, LibraryTransaction, PlacementRecord, Certificate, ReportItem, UserRole, SecurityLog
} from './types';

interface ERPStore {
  // Navigation & Role Configuration
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  semester: string;
  setSemester: (sem: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // State Lists
  students: Student[];
  faculties: Faculty[];
  attendanceRecords: AttendanceRecord[];
  feeRecords: FeeRecord[];
  announcements: Announcement[];
  events: EventItem[];
  departments: Department[];
  courses: Course[];
  timetable: TimetableSlot[];
  examSchedules: ExamSchedule[];
  results: ResultRecord[];
  libraryBooks: LibraryBook[];
  placements: PlacementRecord[];
  certificates: Certificate[];
  reports: ReportItem[];
  securityLogs: SecurityLog[];
  libraryTransactions: LibraryTransaction[];

  // Mutations
  addStudent: (student: Omit<Student, 'id' | 'initials'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addFaculty: (faculty: Omit<Faculty, 'id' | 'initials'>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;

  markAttendance: (record: AttendanceRecord) => void;
  addFeeRecord: (record: Omit<FeeRecord, 'receiptNo'>) => void;
  updateFeeRecord: (receiptNo: string, updates: Partial<FeeRecord>) => void;
  deleteFeeRecord: (receiptNo: string) => void;

  addResult: (result: Omit<ResultRecord, 'id'>) => void;
  updateResult: (id: string, updates: Partial<ResultRecord>) => void;
  deleteResult: (id: string) => void;
  publishResult: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addEvent: (evt: Omit<EventItem, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;

  issueLibraryBook: (tx: Omit<LibraryTransaction, 'id' | 'status'>) => void;
  returnLibraryBook: (txId: string) => void;

  addDepartment: (dept: Omit<Department, 'id' | 'countStudents' | 'countFaculty'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addCourse: (course: Omit<Course, 'id' | 'activeStudents'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => void;
  updateLibraryBook: (id: string, updates: Partial<LibraryBook>) => void;
  deleteLibraryBook: (id: string) => void;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;

  addExamSchedule: (exam: Omit<ExamSchedule, 'id'>) => void;
  updateExamSchedule: (id: string, updates: Partial<ExamSchedule>) => void;
  deleteExamSchedule: (id: string) => void;

  addPlacement: (plc: Omit<PlacementRecord, 'id'>) => void;
  updatePlacement: (id: string, updates: Partial<PlacementRecord>) => void;
  updatePlacementStatus: (id: string, status: PlacementRecord['status']) => void;
  deletePlacement: (id: string) => void;

  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, updates: Partial<Certificate>) => void;
  updateCertificateStatus: (id: string, status: Certificate['status']) => void;
  deleteCertificate: (id: string) => void;

  generateReport: (title: string, type: ReportItem['type'], extra?: Partial<ReportItem>) => void;
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
}

export const useERPStore = create<ERPStore>()(
  persist(
    (set) => ({
  // Navigation & Role Configuration
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeRole: 'SUPER_ADMIN', // Default to Super Admin so all features are visible initially
  setActiveRole: (role) => set((state) => {
    // Log the role change
    const emailMap = {
      ADMIN: 'admin@muc.edu',
      MASTER_ADMIN: 'masteradmin@muc.edu',
      SUPER_ADMIN: 'superadmin@muc.edu'
    };
    const id = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id,
      timestamp,
      user: emailMap[role],
      action: `User session elevated/changed to ${role}`,
      category: 'AUTH',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return { 
      activeRole: role, 
      securityLogs: [newLog, ...state.securityLogs],
      // If switching to a role that doesn't have access to the activeTab, fall back to dashboard
      activeTab: (role === 'ADMIN' && ['fees', 'reports'].includes(state.activeTab)) ? 'dashboard' : state.activeTab
    };
  }),
  academicYear: '2024-25',
  setAcademicYear: (year) => set({ academicYear: year }),
  semester: 'Fall Semester',
  setSemester: (sem) => set({ semester: sem }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Initial Mock Data derived exactly from the screenshots!
  students: [
    {
      id: 'S10245',
      name: 'Ahmed Khan',
      email: 'ahmed.k@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      initials: 'AK',
      department: 'Computer Science',
      course: 'MCA',
      year: 'Year 2',
      status: 'Active',
      attendancePercentage: 94.5,
    },
    {
      id: 'S10289',
      name: 'Sarah John',
      email: 'sarah.j@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      initials: 'SJ',
      department: 'Business Administration',
      course: 'B.Com',
      year: 'Year 1',
      status: 'Active',
      attendancePercentage: 92.0,
    },
    {
      id: 'S10342',
      name: 'Chen Wei',
      email: 'chen.w@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      initials: 'CW',
      department: 'Computer Science',
      course: 'Computer Science',
      year: 'Year 3',
      status: 'Inactive',
      attendancePercentage: 78.4,
    },
    {
      id: 'S10511',
      name: 'Amara Okafor',
      email: 'amara.o@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      initials: 'AO',
      department: 'Business Administration',
      course: 'BBA',
      year: 'Year 2',
      status: 'Active',
      attendancePercentage: 95.1,
    },
    {
      id: 'S10620',
      name: 'Omar Zayed',
      email: 'omar.z@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      initials: 'OZ',
      department: 'Artificial Intelligence',
      course: 'AI',
      year: 'Year 4',
      status: 'Active',
      attendancePercentage: 91.2,
    },
    {
      id: 'S10711',
      name: 'Rahul Sharma',
      email: 'rahul.s@muc.edu',
      initials: 'RS',
      department: 'Computer Science',
      course: 'CS Gen AI',
      year: 'Year 1',
      status: 'Active',
      attendancePercentage: 98.0,
    },
    {
      id: 'S10822',
      name: 'Ananya Das',
      email: 'ananya.d@muc.edu',
      initials: 'AD',
      department: 'Business Administration',
      course: 'BBA Logistics',
      year: 'Year 1',
      status: 'Active',
      attendancePercentage: 93.4,
    }
  ],

  faculties: [
    {
      id: 'F201',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.j@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      initials: 'SJ',
      department: 'Computer Science',
      course: 'B.Tech CS',
      subject: 'Data Structures',
      time: '09:30 AM',
      status: 'Marked',
    },
    {
      id: 'F202',
      name: 'Prof. Alan Turing',
      email: 'alan.t@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      initials: 'AT',
      department: 'Artificial Intelligence',
      course: 'M.Tech AI',
      subject: 'Neural Networks',
      time: '11:00 AM',
      status: 'Marked',
    },
    {
      id: 'F203',
      name: 'Dr. Maria Garcia',
      email: 'maria.g@muc.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      initials: 'MG',
      department: 'Business Administration',
      course: 'BBA',
      subject: 'BBA Marketing',
      time: '01:45 PM',
      status: 'Pending',
    },
    {
      id: 'F204',
      name: 'Dr. James Wilson',
      email: 'james.w@muc.edu',
      initials: 'JW',
      department: 'Computer Science',
      course: 'B.Tech CS',
      subject: 'Discrete Maths',
      time: '03:00 PM',
      status: 'Scheduled',
    }
  ],

  attendanceRecords: [
    {
      id: 'A301',
      studentId: '#MUC-2023-0421',
      studentName: 'Abhinav Jha',
      initials: 'AJ',
      courseSection: 'B.Tech CS - Sec A',
      status: 'Present',
      attendancePercentage: 96.5,
      date: '2026-07-10',
    },
    {
      id: 'A302',
      studentId: '#MUC-2023-1182',
      studentName: 'Reece Wilson',
      initials: 'RW',
      courseSection: 'M.Tech AI - Sec B',
      status: 'Absent',
      attendancePercentage: 82.1,
      date: '2026-07-10',
    },
    {
      id: 'A303',
      studentId: '#MUC-2023-0094',
      studentName: 'Sunita Kapoor',
      initials: 'SK',
      courseSection: 'BBA - Sec C',
      status: 'Present',
      attendancePercentage: 91.0,
      date: '2026-07-10',
    }
  ],

  feeRecords: [
    {
      receiptNo: '#REC-9021',
      studentId: '2024-001',
      studentName: 'Jane Doe',
      initials: 'JD',
      date: 'Oct 12, 2025',
      amount: 2500,
      method: 'UPI',
      status: 'Paid',
    },
    {
      receiptNo: '#REC-9022',
      studentId: '2024-042',
      studentName: 'Mark Smith',
      initials: 'MS',
      date: 'Oct 14, 2025',
      amount: 1200,
      method: 'Card',
      status: 'Partial',
    },
    {
      receiptNo: '#REC-9023',
      studentId: '2024-018',
      studentName: 'Lucy Brown',
      initials: 'LB',
      date: 'Sep 28, 2025',
      amount: 3800,
      method: 'Bank',
      status: 'Overdue',
    },
    {
      receiptNo: '#REC-9024',
      studentId: '2024-099',
      studentName: 'Alan Walker',
      initials: 'AW',
      date: 'Oct 15, 2025',
      amount: 2500,
      method: 'UPI',
      status: 'Paid',
    }
  ],

  announcements: [
    {
      id: 'ANN-01',
      title: 'Semester Exam Schedule Released',
      content: 'Exams starting from Nov 20, 2026. All departments notified.',
      timestamp: '2 HOURS AGO',
      category: 'secondary'
    },
    {
      id: 'ANN-02',
      title: 'New Faculty Recruitment',
      content: '3 Senior Lecturers joined the AI & Data Science Department.',
      timestamp: 'YESTERDAY',
      category: 'primary'
    }
  ],

  events: [
    {
      id: 'EVT-01',
      day: '12',
      month: 'Oct',
      title: 'AI Workshop',
      location: 'Innovation Hub',
      time: '10:00 AM'
    },
    {
      id: 'EVT-02',
      day: '15',
      month: 'Oct',
      title: 'B.Com Seminars',
      location: 'Main Auditorium',
      time: '02:30 PM'
    }
  ],

  departments: [
    { id: 'D01', name: 'Computer Science', code: 'CSE', head: 'Dr. Sarah Jenkins', block: 'Block A', countStudents: 540, countFaculty: 18 },
    { id: 'D02', name: 'Artificial Intelligence', code: 'AI', head: 'Prof. Alan Turing', block: 'Innovation Hub', countStudents: 320, countFaculty: 12 },
    { id: 'D03', name: 'Business Administration', code: 'BBA', head: 'Dr. Maria Garcia', block: 'Block B', countStudents: 380, countFaculty: 14 }
  ],

  courses: [
    { id: 'C01', name: 'B.Tech Computer Science', code: 'BTech-CS', department: 'Computer Science', semester: 'Semester 3', credits: 4, activeStudents: 120 },
    { id: 'C02', name: 'M.Tech Artificial Intelligence', code: 'MTech-AI', department: 'Artificial Intelligence', semester: 'Semester 1', credits: 3, activeStudents: 45 },
    { id: 'C03', name: 'BBA Marketing', code: 'BBA-Mkt', department: 'Business Administration', semester: 'Semester 5', credits: 3, activeStudents: 85 }
  ],

  timetable: [
    { id: 'T01', day: 'Mon', time: '09:30 AM', courseName: 'Data Structures', facultyName: 'Dr. Sarah Jenkins', room: 'Lab 4' },
    { id: 'T02', day: 'Wed', time: '11:00 AM', courseName: 'Neural Networks', facultyName: 'Prof. Alan Turing', room: 'Seminar Room' },
    { id: 'T03', day: 'Fri', time: '01:45 PM', courseName: 'BBA Marketing', facultyName: 'Dr. Maria Garcia', room: 'Hall B' }
  ],

  examSchedules: [
    { id: 'E01', course: 'B.Tech CS', subject: 'Data Structures', date: '2026-11-20', time: '10:00 AM', duration: '3 Hours', room: 'Block A, Hall 1' },
    { id: 'E02', course: 'M.Tech AI', subject: 'Neural Networks', date: '2026-11-22', time: '02:00 PM', duration: '3 Hours', room: 'Innovation Hub' }
  ],

  results: [
    { id: 'R01', studentId: 'S10245', studentName: 'Ahmed Khan', courseName: 'Data Structures', grade: 'A+', marks: 95, maxMarks: 100, status: 'Pass' },
    { id: 'R02', studentId: 'S10289', studentName: 'Sarah John', courseName: 'B.Com Seminars', grade: 'A', marks: 88, maxMarks: 100, status: 'Pass' }
  ],

  libraryBooks: [
    { id: 'B01', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 15, availableCopies: 8 },
    { id: 'B02', title: 'Artificial Intelligence: A Modern Approach', author: 'Russell, Norvig', isbn: '978-0134610993', category: 'AI & ML', totalCopies: 10, availableCopies: 4 }
  ],

  placements: [
    { id: 'P01', studentName: 'Ahmed Khan', company: 'Google', salaryPackage: '$120,000', position: 'Software Engineer', status: 'Placed' },
    { id: 'P02', studentName: 'Omar Zayed', company: 'Microsoft', salaryPackage: '$110,000', position: 'AI Researcher', status: 'Selected' }
  ],

  certificates: [
    { id: 'CRT01', studentName: 'Ahmed Khan', type: 'Degree Certificate', issueDate: '2026-06-15', status: 'Generated' },
    { id: 'CRT02', studentName: 'Sarah John', type: 'Provisional Certificate', issueDate: 'Pending', status: 'Pending Approval' }
  ],

  reports: [
    { id: 'REP01', title: 'Q2 Academic Quality Report', type: 'Academic', generatedAt: '2026-07-01 10:30 AM', size: '2.4 MB' },
    { id: 'REP02', title: 'FY 2026 Budget Outlook', type: 'Financial', generatedAt: '2026-07-05 02:15 PM', size: '1.8 MB' }
  ],

  securityLogs: [
    { id: 'LOG-1001', timestamp: '2026-07-11 11:30 AM', user: 'superadmin@muc.edu', action: 'Institutional Configurations Updated', category: 'SECURITY', status: 'SUCCESS', ipAddress: '192.168.1.50' },
    { id: 'LOG-1002', timestamp: '2026-07-11 11:15 AM', user: 'masteradmin@muc.edu', action: 'Fee Receipt generated for S10245', category: 'FINANCIAL', status: 'SUCCESS', ipAddress: '192.168.1.102' },
    { id: 'LOG-1003', timestamp: '2026-07-11 10:45 AM', user: 'admin@muc.edu', action: 'Failed Login Attempt - Invalid Credentials', category: 'AUTH', status: 'FAILED', ipAddress: '198.51.100.12' },
    { id: 'LOG-1004', timestamp: '2026-07-11 09:00 AM', user: 'system', action: 'Database backup synchronized with S3 bucket', category: 'DATABASE', status: 'SUCCESS', ipAddress: '127.0.0.1' },
    { id: 'LOG-1005', timestamp: '2026-07-11 08:30 AM', user: 'admin@muc.edu', action: 'Student Profile S10711 Registered', category: 'ACADEMIC', status: 'SUCCESS', ipAddress: '192.168.1.105' }
  ],

  libraryTransactions: [
    {
      id: 'TX-101',
      bookId: 'B01',
      bookTitle: 'Introduction to Algorithms',
      isbn: '978-0262033848',
      studentId: 'S10245',
      studentName: 'Ahmed Khan',
      issueDate: '2026-10-01',
      dueDate: '2026-10-15',
      status: 'Active'
    }
  ],

  // Mutations
  addStudent: (student) => set((state) => {
    // Collision-safe ID: never reuses a deleted student's ID
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `STU-${ts}-${rand}`;
    const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newStudent: Student = { 
      ...student, 
      id, 
      initials 
    };

    // Log this action
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Created Student profile: ${student.name} (${id})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      students: [newStudent, ...state.students],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateStudent: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Updated Student profile: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      students: state.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteStudent: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Deleted Student profile: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      students: state.students.filter((s) => s.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addFaculty: (faculty) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `FAC-${ts}-${rand}`;
    const initials = faculty.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newFaculty: Faculty = { 
      ...faculty, 
      id, 
      initials 
    };

    // Log this action
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Created Faculty profile: ${faculty.name} (${id})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      faculties: [newFaculty, ...state.faculties],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateFaculty: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Updated Faculty profile: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      faculties: state.faculties.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteFaculty: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Deleted Faculty profile: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      faculties: state.faculties.filter((f) => f.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  markAttendance: (record: AttendanceRecord) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Attendance marked for: ${record.studentName} - ${record.status}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    const exists = state.attendanceRecords.some(r => r.id === record.id);
    const updatedRecords = exists
      ? state.attendanceRecords.map(r => r.id === record.id ? record : r)
      : [record, ...state.attendanceRecords];

    return {
      attendanceRecords: updatedRecords,
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addFeeRecord: (record) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const receiptNo = `#REC-${ts}-${rand}`;
    const newFee: FeeRecord = { 
      ...record, 
      receiptNo 
    };

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Recorded Fee Payment of $${record.amount} for student ${record.studentName} (${receiptNo})`,
      category: 'FINANCIAL',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      feeRecords: [newFee, ...state.feeRecords],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateFeeRecord: (receiptNo, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Updated Fee Receipt: ${receiptNo}`,
      category: 'FINANCIAL',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      feeRecords: state.feeRecords.map(f => f.receiptNo === receiptNo ? { ...f, ...updates } : f),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteFeeRecord: (receiptNo) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Deleted Fee Receipt: ${receiptNo}`,
      category: 'FINANCIAL',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      feeRecords: state.feeRecords.filter(f => f.receiptNo !== receiptNo),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addResult: (result) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `RES-${ts}-${rand}`;
    const newResult: ResultRecord = { ...result, id };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Results: Created result for ${result.studentName} (${result.courseName} - ${result.grade})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      results: [newResult, ...state.results],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateResult: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Results: Updated academic result ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      results: state.results.map(r => r.id === id ? { ...r, ...updates } : r),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteResult: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Results: Removed academic result ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      results: state.results.filter(r => r.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  publishResult: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Results: Published result ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      results: state.results.map(r => r.id === id ? { ...r, resultStatus: 'Published', publishedAt: new Date().toLocaleDateString() } : r),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addAnnouncement: (ann) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `ANN-${ts}-${rand}`;
    const newAnn: Announcement = {
      ...ann,
      id,
      timestamp: 'JUST NOW',
      priority: ann.priority || 'Medium',
      status: ann.status || 'Published',
      audience: ann.audience || 'All College',
    };

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Created announcement: "${ann.title}" (${id})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      announcements: [newAnn, ...state.announcements],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateAnnouncement: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Updated announcement: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      announcements: state.announcements.map(a => a.id === id ? { ...a, ...updates } : a),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteAnnouncement: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Deleted announcement: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      announcements: state.announcements.filter(a => a.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addEvent: (evt) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `EVT-${ts}-${rand}`;
    const newEvt: EventItem = { 
      ...evt, 
      id,
      status: evt.status || 'Upcoming',
      audience: evt.audience || 'All College',
    };
    return { events: [newEvt, ...state.events] };
  }),

  updateEvent: (id, updates) => set((state) => {
    return {
      events: state.events.map(e => e.id === id ? { ...e, ...updates } : e)
    };
  }),

  deleteEvent: (id) => set((state) => {
    return {
      events: state.events.filter(e => e.id !== id)
    };
  }),

  issueLibraryBook: (tx) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `TX-${ts}-${rand}`;
    const newTx: LibraryTransaction = {
      ...tx,
      id,
      status: 'Active'
    };

    // Update available copies for the book
    const updatedBooks = state.libraryBooks.map(b => {
      if (b.id === tx.bookId) {
        return { ...b, availableCopies: Math.max(0, b.availableCopies - 1) };
      }
      return b;
    });

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Library: Issued "${tx.bookTitle}" to student ${tx.studentName}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      libraryBooks: updatedBooks,
      libraryTransactions: [newTx, ...state.libraryTransactions],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  returnLibraryBook: (txId) => set((state) => {
    const targetTx = state.libraryTransactions.find(t => t.id === txId);
    if (!targetTx || targetTx.status === 'Returned') return state;

    const returnDate = new Date().toISOString().split('T')[0];

    // Increment available copies for the book
    const updatedBooks = state.libraryBooks.map(b => {
      if (b.id === targetTx.bookId) {
        return { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) };
      }
      return b;
    });

    const updatedTxList = state.libraryTransactions.map(t => 
      t.id === txId ? { ...t, status: 'Returned' as const, returnDate } : t
    );

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Library: Returned "${targetTx.bookTitle}" from student ${targetTx.studentName}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      libraryBooks: updatedBooks,
      libraryTransactions: updatedTxList,
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addCertificate: (cert) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `CRT-${ts}-${rand}`;
    const certNumber = cert.certNumber || `MUC-CERT-2026-${Math.floor(Math.random() * 900000) + 100000}`;
    const newCert: Certificate = { 
      ...cert, 
      id,
      certNumber,
      status: cert.status || 'Requested'
    };

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Requested Certificate (${cert.type}) for ${cert.studentName} (${id})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      certificates: [newCert, ...state.certificates],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateCertificate: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Updated certificate request: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      certificates: state.certificates.map(c => c.id === id ? { ...c, ...updates } : c),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateCertificateStatus: (id, status) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const cert = state.certificates.find(c => c.id === id);
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Certificate (${cert?.type || ''}) status for ${cert?.studentName || ''} updated to ${status}`,
      category: 'SECURITY',
      status: status === 'Generated' || status === 'Issued' ? 'SUCCESS' : 'WARNING',
      ipAddress: '192.168.1.50'
    };

    return {
      certificates: state.certificates.map(c => c.id === id ? { ...c, status } : c),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteCertificate: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Cancelled/Deleted certificate request: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return {
      certificates: state.certificates.filter(c => c.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  generateReport: (title, type, extra) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `REP-${ts}-${rand}`;
    const today = new Date();
    const formattedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0') + ' ' + String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0');
    const newReport: ReportItem = {
      id,
      title,
      type,
      generatedAt: formattedDate,
      size: (Math.random() * 2 + 0.8).toFixed(1) + ' MB',
      ...extra
    };

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Generated Institutional Report: "${title}" (${type})`,
      category: 'FINANCIAL',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      reports: [newReport, ...state.reports],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addSecurityLog: (log) => set((state) => {
    const id = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleString();
    const newLog: SecurityLog = {
      ...log,
      id,
      timestamp
    };
    return { securityLogs: [newLog, ...state.securityLogs] };
  }),

  addDepartment: (dept) => set((state) => {
    // Generate a collision-safe ID that stays unique even after deletions
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `DEPT-${timestamp}-${random}`;
    const newDept: Department = { ...dept, id, countStudents: 0, countFaculty: 0 };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Provisioned Department: ${dept.name} (${dept.code})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      departments: [...state.departments, newDept],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateDepartment: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Updated Department configurations: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      departments: state.departments.map(d => d.id === id ? { ...d, ...updates } : d),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteDepartment: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Deleted Department: ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      departments: state.departments.filter(d => d.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addCourse: (course) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `CRS-${ts}-${rand}`;
    const newCourse: Course = { ...course, id, activeStudents: 0 };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Curriculum: Added Course ${course.name} (${course.code})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      courses: [...state.courses, newCourse],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateCourse: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Curriculum: Updated Course ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      courses: state.courses.map(c => c.id === id ? { ...c, ...updates } : c),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteCourse: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Curriculum: Deleted Course ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      courses: state.courses.filter(c => c.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addLibraryBook: (book) => set((state) => {
    const id = `B0${state.libraryBooks.length + 1}`;
    const newBook: LibraryBook = { ...book, id };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Library: Cataloged book "${book.title}"`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      libraryBooks: [...state.libraryBooks, newBook],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateLibraryBook: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Library: Updated Asset ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      libraryBooks: state.libraryBooks.map(b => b.id === id ? { ...b, ...updates } : b),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteLibraryBook: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Library: Removed Asset ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      libraryBooks: state.libraryBooks.filter(b => b.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addTimetableSlot: (slot) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `SLOT-${ts}-${rand}`;
    const newSlot: TimetableSlot = { ...slot, id };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Timetable: Allocated lecture slot for ${slot.courseName} (${slot.day} ${slot.time})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      timetable: [...state.timetable, newSlot],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateTimetableSlot: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Timetable: Updated lecture slot ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      timetable: state.timetable.map(t => t.id === id ? { ...t, ...updates } : t),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteTimetableSlot: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Timetable: Deleted lecture slot ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      timetable: state.timetable.filter(t => t.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addExamSchedule: (exam) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `EXAM-${ts}-${rand}`;
    const newExam: ExamSchedule = { ...exam, id };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Exams: Scheduled exam for ${exam.subject}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      examSchedules: [...state.examSchedules, newExam],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updateExamSchedule: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Exams: Modified exam schedule ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      examSchedules: state.examSchedules.map(e => e.id === id ? { ...e, ...updates } : e),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deleteExamSchedule: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Exams: Cancelled exam ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      examSchedules: state.examSchedules.filter(e => e.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addPlacement: (plc) => set((state) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const id = `PLC-${ts}-${rand}`;
    const newPlc: PlacementRecord = { ...plc, id };
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Placements: Recorded placement offer for ${plc.studentName} (${id})`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      placements: [newPlc, ...state.placements],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updatePlacement: (id, updates) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Placements: Updated placement record ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      placements: state.placements.map(p => p.id === id ? { ...p, ...updates } : p),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  updatePlacementStatus: (id, status) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Placements: Offer status for placement ${id} updated to ${status}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      placements: state.placements.map(p => p.id === id ? { ...p, status } : p),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  deletePlacement: (id) => set((state) => {
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: SecurityLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      user: email,
      action: `Placements: Removed placement record ${id}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };
    return {
      placements: state.placements.filter(p => p.id !== id),
      securityLogs: [newLog, ...state.securityLogs]
    };
  })
}),
    {
      name: 'muc_erp_store_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as Storage))),
    }
  )
);

