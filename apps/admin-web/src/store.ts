import { create } from 'zustand';
import { 
  Student, Faculty, AttendanceRecord, FeeRecord, Announcement, EventItem,
  Department, Course, TimetableSlot, ExamSchedule, ResultRecord, 
  LibraryBook, PlacementRecord, Certificate, ReportItem
} from './types';

interface ERPStore {
  // Navigation & Config
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

  // Mutations
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;

  markAttendance: (record: AttendanceRecord) => void;
  addFeeRecord: (record: Omit<FeeRecord, 'receiptNo'>) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp'>) => void;
  addEvent: (evt: Omit<EventItem, 'id'>) => void;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  generateReport: (title: string, type: ReportItem['type']) => void;
}

export const useERPStore = create<ERPStore>((set) => ({
  // Navigation & Config
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnmYFV9mpwf_144fF3roKvHeU232G-N8zzKMsINS7QV1E11_OkFNVgeDRIiPqQvB2jwwZB3zvh9__6feXlpDhlmuGGLIZsUBZQU_lwK2Yzi4ORvhdjYquQJp2jS8BN2g6YIK-CLX_UlAPQVRPI02C_QjF90dYfUSfx3CjJYuq2i5bP02kK99harV0Q2VphKNvJrg4NBouUpQ188avwUATPdOdKLwF9uGZvmlsrxVSRqWSi8izBPL430A',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC275UfSmyNrLHT4ETzc5cP-TX2EOwsy78vPJQWAMot1PAfoQWbh67UGGSbD9Xl0YYc8_l6ZKZT9lOvlz3GYHJgb1P4MIk991uNGs0Bk7VCiZnlcRsoYZPFzG_1fgDQNyp0251sY6mtPqgIXF4iUDg6UACylnCuDTprrpa-rglcxhUAoo_iAl5j100VGfynDRIA-UNN46JxIkivbRG3x1DwYinz_8GkB5eKxfdUdBnQfSjlNoBBFKES1Q',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh3vJ_m497xhSB7OrwBNeUWydgGrVajTLX1R7cJHEEcBlL9qKbKIlZoJssvCANOFdceb-kHMkgnWhiQNkpZ79ztbYLsSSbd8bcMJ8tLZibgGaxyRBiS5p3vw2Kz-Rm545IQ5TpFWQzdVcy03V0bFHzMsaOh0Yxm2oivCJf_TNjJPBf9EkLSxYq9LZJZSzUpwU4xhui4Y0LUMrZsdIeu4VsgSODdqGUWuBfjZ7rlb7gcs5bUm4bDc1shw',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAocBJQWo4LTQe88x7sTsB_9j9emHD34x1NnnLYA0iFL1b4ScT4tzeWs1t6IZzF3ecMh1G2oYQTHLt2slTmj-z6aUzYSW2VFxQDekEZFz6BPQ7JOAdTo6xBOjhT_ICeDDnq83gV1DOTAoFQ3g1AYZilNNyxmyn3vMJa_GfNidU_OGSU5qWU5SH3U1fwdCG3aUYfUeZNYiHBsqNNdYnL7t8CmyJxjY0YVny0-gmjV7M9EFkuMAZ17Zb9Hg',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUxJrht1ZxEOPTDPOro7Vbd__UBtn-q1Zm779nRrkgK2kwBafhe7oAXqeqzZBSt9iNjFY2fJxkPgPlYx57ZXMpX0CQpnLPk87aSno_mdy0K2npHLe9uyIrVEQkghVtL7sTX6kuGzkNhXdZqcz7iBvDzVsvO4VkstSwPaYTzipSVyRrqfELTWHZVJTa5fkGzL4GmKbZMvRRrPzhg0V00JzcfE5Q-s-m_MQs_mjS5NB35cB-As6Q09tRAQ',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPSgZGUE6FGABNPPFG7UPZneoNfV3h-tNnHr64aSlZErImykBoqGpl-8guZhcYWR5BOU4ajviYCVMxaSEGemOJ-YP0ptBL4N5r_6Xft4rmOLbzml77aM2d6_GRhvXah32DPMCtmnzXSOaF6MVMJVsevgsaTK8d9F8fTRjkIPOnySthw9hCw-R4WA8PNCfppW0krRhz6moRnemvIPIbWWUXgqlY_K3hHVemF__YYM1gaMMhFZOifNGKlg',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlavQ21TlRHfHevvmcGJrQAn6CiVEC6honU2SsPy9IhBZNHyBpLnXIQeOEIK6HmosvPfijt-N-hawtJW5Q3QJbfCQn3qNN5GFChyUNs4ir1Ciff9R1tmuNF8GfAFiA9W4qH5GROlr6icqvjuTesbTJuer4gLxPjFDpB6HXAIzmG8ea-ejEag1W1KDlNZZ9y0jVdI1OR02Sd0k3T8WhjawsjYoZrvKcL8RYmOQxRd3pEbh0WgCxJkcrVQ',
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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABRTxhfRN84bZLLMYqcPnY_3fx6EA8CSnL7fO3qW6dxlsJMVTz17A3EK2CmG9pIsWqEetdRIOpdUN86tk6fznynKrcMDXU1wBn-hwweMxcZqpH-oSj0dQesRrCYvXwLlhHLEOhyuUOlLMf3CTggR2fm2k41ypLbIXvPNZfKRZqMDKFRopzkVRBVBvUUZgy65foGKJyWi5pwyEAqus13tvAsEGLM9Ymi367YlbQYZ1XEmB9YNwRjBT0CA',
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
      date: 'Oct 12, 2023',
      amount: 2500,
      method: 'UPI',
      status: 'Paid',
    },
    {
      receiptNo: '#REC-9022',
      studentId: '2024-042',
      studentName: 'Mark Smith',
      initials: 'MS',
      date: 'Oct 14, 2023',
      amount: 1200,
      method: 'Card',
      status: 'Partial',
    },
    {
      receiptNo: '#REC-9023',
      studentId: '2024-018',
      studentName: 'Lucy Brown',
      initials: 'LB',
      date: 'Sep 28, 2023',
      amount: 3800,
      method: 'Bank',
      status: 'Overdue',
    },
    {
      receiptNo: '#REC-9024',
      studentId: '2024-099',
      studentName: 'Alan Walker',
      initials: 'AW',
      date: 'Oct 15, 2023',
      amount: 2500,
      method: 'UPI',
      status: 'Paid',
    }
  ],

  announcements: [
    {
      id: 'ANN-01',
      title: 'Semester Exam Schedule Released',
      content: 'Exams starting from Nov 20, 2024. All departments notified.',
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

  // Mutations
  addStudent: (student) => set((state) => {
    const id = `S${10000 + state.students.length + 1}`;
    const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newStudent: Student = { 
      ...student, 
      id, 
      initials 
    };
    return { students: [newStudent, ...state.students] };
  }),

  updateStudent: (id, updates) => set((state) => ({
    students: state.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  })),

  deleteStudent: (id) => set((state) => ({
    students: state.students.filter((s) => s.id !== id),
  })),

  addFaculty: (faculty) => set((state) => {
    const id = `F${state.faculties.length + 201}`;
    const initials = faculty.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newFaculty: Faculty = { 
      ...faculty, 
      id, 
      initials 
    };
    return { faculties: [newFaculty, ...state.faculties] };
  }),

  updateFaculty: (id, updates) => set((state) => ({
    faculties: state.faculties.map((f) => (f.id === id ? { ...f, ...updates } : f)),
  })),

  deleteFaculty: (id) => set((state) => ({
    faculties: state.faculties.filter((f) => f.id !== id),
  })),

  markAttendance: (record) => set((state) => ({
    attendanceRecords: [record, ...state.attendanceRecords],
  })),

  addFeeRecord: (record) => set((state) => {
    const receiptNo = `#REC-${9000 + state.feeRecords.length + 21}`;
    const newFee: FeeRecord = { 
      ...record, 
      receiptNo 
    };
    return { feeRecords: [newFee, ...state.feeRecords] };
  }),

  addAnnouncement: (ann) => set((state) => {
    const id = `ANN-${state.announcements.length + 3}`;
    const newAnn: Announcement = {
      ...ann,
      id,
      timestamp: 'JUST NOW'
    };
    return { announcements: [newAnn, ...state.announcements] };
  }),

  addEvent: (evt) => set((state) => {
    const id = `EVT-${state.events.length + 3}`;
    const newEvt: EventItem = { ...evt, id };
    return { events: [newEvt, ...state.events] };
  }),

  addCertificate: (cert) => set((state) => {
    const id = `CRT0${state.certificates.length + 3}`;
    const newCert: Certificate = { ...cert, id };
    return { certificates: [newCert, ...state.certificates] };
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
    return { reports: [newReport, ...state.reports] };
  })
}));
