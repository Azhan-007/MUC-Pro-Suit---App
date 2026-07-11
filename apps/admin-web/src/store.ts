import { create } from 'zustand';
import { 
  Student, Faculty, AttendanceRecord, FeeRecord, Announcement, EventItem,
  Department, Course, TimetableSlot, ExamSchedule, ResultRecord, 
  LibraryBook, PlacementRecord, Certificate, ReportItem, UserRole, SecurityLog
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

  // Mutations
  addStudent: (student: Omit<Student, 'id' | 'initials'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addFaculty: (faculty: Omit<Faculty, 'id' | 'initials'>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;

  markAttendance: (record: AttendanceRecord) => void;
  addFeeRecord: (record: Omit<FeeRecord, 'receiptNo'>) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp'>) => void;
  addEvent: (evt: Omit<EventItem, 'id'>) => void;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificateStatus: (id: string, status: Certificate['status']) => void;
  generateReport: (title: string, type: ReportItem['type']) => void;
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
}

export const useERPStore = create<ERPStore>((set) => ({
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

  // Mutations
  addStudent: (student) => set((state) => {
    const id = `S${10000 + state.students.length + 1}`;
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
    const id = `F${state.faculties.length + 201}`;
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

  markAttendance: (record) => set((state) => {
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

    return {
      attendanceRecords: [record, ...state.attendanceRecords],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addFeeRecord: (record) => set((state) => {
    const receiptNo = `#REC-${9000 + state.feeRecords.length + 21}`;
    const newFee: FeeRecord = { 
      ...record, 
      receiptNo 
    };

    // Log this action
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Recorded Fee Payment of $${record.amount} for student ${record.studentName}`,
      category: 'FINANCIAL',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      feeRecords: [newFee, ...state.feeRecords],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addAnnouncement: (ann) => set((state) => {
    const id = `ANN-${state.announcements.length + 3}`;
    const newAnn: Announcement = {
      ...ann,
      id,
      timestamp: 'JUST NOW'
    };

    // Log this action
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Created new announcement: "${ann.title}"`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      announcements: [newAnn, ...state.announcements],
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  addEvent: (evt) => set((state) => {
    const id = `EVT-${state.events.length + 3}`;
    const newEvt: EventItem = { ...evt, id };
    return { events: [newEvt, ...state.events] };
  }),

  addCertificate: (cert) => set((state) => {
    const id = `CRT0${state.certificates.length + 3}`;
    const newCert: Certificate = { ...cert, id };

    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Requested Certificate (${cert.type}) for ${cert.studentName}`,
      category: 'ACADEMIC',
      status: 'SUCCESS',
      ipAddress: '192.168.1.50'
    };

    return { 
      certificates: [newCert, ...state.certificates],
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
      status: status === 'Generated' ? 'SUCCESS' : 'WARNING',
      ipAddress: '192.168.1.50'
    };

    return {
      certificates: state.certificates.map(c => c.id === id ? { ...c, status } : c),
      securityLogs: [newLog, ...state.securityLogs]
    };
  }),

  generateReport: (title, type) => set((state) => {
    const id = `REP0${state.reports.length + 3}`;
    const today = new Date();
    const formattedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0') + ' ' + String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0');
    const newReport: ReportItem = {
      id,
      title,
      type,
      generatedAt: formattedDate,
      size: (Math.random() * 3 + 1).toFixed(1) + ' MB'
    };

    // Log this action
    const email = state.activeRole === 'SUPER_ADMIN' ? 'superadmin@muc.edu' : state.activeRole === 'MASTER_ADMIN' ? 'masteradmin@muc.edu' : 'admin@muc.edu';
    const logId = `LOG-${Math.floor(Math.random() * 90000) + 10000}`;
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SecurityLog = {
      id: logId,
      timestamp,
      user: email,
      action: `Generated Institutional Report: "${title}" (Type: ${type})`,
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
  })
}));
