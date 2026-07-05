import {
  FacultyProfile,
  ClassSession,
  StudentRecord,
  StudentAttendanceEntry,
  ExamMarkEntry,
  LeaveAllocation,
  LeaveApplication,
  LibraryBook,
  BorrowedBook,
  ReadingHistoryEntry,
  LibraryStats,
  PlacementDrive,
  PlacementStudent,
  CollegeEvent,
  CircularItem,
  ERPNotification,
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

// ── Mock Course Details ──
export const mockCourseDetails = [
  {
    id: 'sub01',
    subject: 'Database Management System',
    sections: 'III B.Sc CS',
    room: 'Lab 01',
    credits: 4,
    syllabusProgress: 75,
    hoursCompleted: 36,
    totalHoursRequired: 48,
    avgAttendance: 87,
  },
  {
    id: 'sub02',
    subject: 'Operating System',
    sections: 'II B.Sc CS',
    room: 'Room 402',
    credits: 4,
    syllabusProgress: 60,
    hoursCompleted: 28,
    totalHoursRequired: 45,
    avgAttendance: 82,
  },
];

// ── Mock Study Materials ──
export const mockStudyMaterials = [
  { id: 'mat1', subject: 'Database Management System', title: 'DBMS Unit 1 - Introduction & ER Model', fileType: 'PDF', fileSize: '2.4 MB', dateAdded: '12 Jun 2026' },
  { id: 'mat2', subject: 'Database Management System', title: 'DBMS Unit 2 - Relational Algebra & SQL', fileType: 'PPTX', fileSize: '4.1 MB', dateAdded: '18 Jun 2026' },
  { id: 'mat3', subject: 'Operating System', title: 'OS Unit 1 - Processes and Threads', fileType: 'PDF', fileSize: '1.8 MB', dateAdded: '10 Jun 2026' },
  { id: 'mat4', subject: 'Operating System', title: 'OS Unit 2 - CPU Scheduling Algorithms', fileType: 'PDF', fileSize: '3.2 MB', dateAdded: '22 Jun 2026' },
];

// ── Mock Assessments ──
export const mockAssessments = [
  { id: 'ass1', subject: 'Database Management System', title: 'SQL Queries Assignment 1', dueDate: '08 Jul 2026', totalSubmissions: 45, totalStudents: 52, status: 'OPEN', maxMarks: 20, shift: 'SHIFT_I' },
  { id: 'ass2', subject: 'Operating System', title: 'CPU Scheduling Problems Sheet', dueDate: '30 Jun 2026', totalSubmissions: 48, totalStudents: 48, status: 'CLOSED', maxMarks: 15, shift: 'SHIFT_I' },
];

// ── Mock Leave Allocations ──
export const mockLeaveAllocations: LeaveAllocation[] = [
  {
    id: 'alloc_2026',
    year: 'Year 2026',
    balances: {
      casualLeave: { total: 12, used: 2, remaining: 10 },
      medicalLeave: { total: 10, used: 2, remaining: 8 },
      dutyLeave: { total: 15, used: 1, remaining: 14 },
      earnedLeave: { total: 10, used: 0, remaining: 10 },
      lossOfPay: { total: 30, used: 0, remaining: 30 },
      maternityPaternityLeave: { total: 90, used: 0, remaining: 90 },
    }
  },
  {
    id: 'alloc_2025',
    year: 'Year 2025',
    balances: {
      casualLeave: { total: 12, used: 12, remaining: 0 },
      medicalLeave: { total: 10, used: 5, remaining: 5 },
      dutyLeave: { total: 15, used: 8, remaining: 7 },
      earnedLeave: { total: 10, used: 2, remaining: 8 },
      lossOfPay: { total: 30, used: 4, remaining: 26 },
      maternityPaternityLeave: { total: 90, used: 0, remaining: 90 },
    }
  }
];

// ── Mock Leave Applications ──
export const mockLeaveApplications: LeaveApplication[] = [
  {
    id: 'lv1',
    leaveType: 'Casual Leave',
    startDate: '06 Jul 2026',
    endDate: '07 Jul 2026',
    reason: 'Personal family function',
    status: 'APPLIED',
    totalDays: 2,
    allocationYear: 'Year 2026',
    appliedDate: '02 Jul 2026',
    halfDay: false,
    emergencyContact: '+91 98765 00001',
    attachmentName: 'flight_tickets.pdf',
  },
  {
    id: 'lv2',
    leaveType: 'Medical Leave',
    startDate: '15 May 2026',
    endDate: '16 May 2026',
    reason: 'Severe viral fever',
    status: 'APPROVED',
    totalDays: 2,
    allocationYear: 'Year 2026',
    appliedDate: '10 May 2026',
    halfDay: false,
    emergencyContact: '+91 98765 00001',
    attachmentName: 'medical_certificate.pdf',
  },
  {
    id: 'lv3',
    leaveType: 'Duty Leave',
    startDate: '10 Apr 2026',
    endDate: '10 Apr 2026',
    reason: 'External examiner duty at Ambur College',
    status: 'APPROVED',
    totalDays: 1,
    allocationYear: 'Year 2026',
    appliedDate: '08 Apr 2026',
    halfDay: false,
    emergencyContact: '+91 98765 00001',
    attachmentName: 'duty_order.pdf',
  },
];

// ── Mock Placement Coordination ──
export const mockPlacementDrives: PlacementDrive[] = [
  {
    id: 'pl1',
    companyName: 'Zoho Corporation',
    role: 'Software Developer',
    package: '₹6.5 - 8.5 LPA',
    location: 'Chennai (Mock Venue)',
    driveDate: '15 Jul 2026',
    deadline: '10 Jul 2026',
    registeredCount: 0,
    eligibleCount: 12,
    status: 'REGISTRATION_OPEN',
    jobType: 'Full Time',
    minCgpa: 7.0,
    passingYear: '2026',
    departments: ['CSE', 'ECE'],
    skills: ['Java', 'C++', 'Data Structures', 'SQL'],
    venue: 'Campus Placement Seminar Hall',
    selectionProcess: ['Aptitude Test', 'Programming Round', 'Technical Interview', 'HR Interview'],
    hrContact: 'Mr. Rajesh Kumar (hr@zoho.com)',
    jobDescription: 'Seeking junior software engineers proficient in core computing principles, problem-solving, and web development using modern stack architectures.',
    timelineSteps: ['Registration Open', 'Aptitude Test', 'Technical Round', 'HR Interview', 'Final Offer'],
    currentTimelineStepIndex: 0
  },
  {
    id: 'pl2',
    companyName: 'Tata Consultancy Services',
    role: 'Systems Engineer',
    package: '₹3.6 - 7.0 LPA',
    location: 'Coimbatore (Mock Venue)',
    driveDate: '22 Jul 2026',
    deadline: '18 Jul 2026',
    registeredCount: 8,
    eligibleCount: 22,
    status: 'UPCOMING',
    jobType: 'Full Time',
    minCgpa: 6.0,
    passingYear: '2026',
    departments: ['CSE', 'ECE', 'EEE', 'MECH'],
    skills: ['Python', 'SQL', 'DBMS', 'Communication Skills'],
    venue: 'Online / Remote Test Centers',
    selectionProcess: ['TCS NQT Exam', 'Technical Interview', 'MR Interview', 'HR Interview'],
    hrContact: 'Ms. Priya Sharma (priya.s@tcs.com)',
    jobDescription: 'Entry-level systems engineering role responsible for consulting, application deployment, client configurations, and systems operations support.',
    timelineSteps: ['Registration Open', 'NQT Test', 'Technical Round', 'MR Panel', 'HR Interview', 'Final Offer'],
    currentTimelineStepIndex: 0
  },
  {
    id: 'pl3',
    companyName: 'Wipro Limited',
    role: 'Project Engineer',
    package: '₹3.5 LPA',
    location: 'Chennai (Mock Venue)',
    driveDate: '20 Jun 2026',
    deadline: '15 Jun 2026',
    registeredCount: 15,
    eligibleCount: 18,
    status: 'COMPLETED',
    jobType: 'Full Time',
    minCgpa: 6.0,
    passingYear: '2026',
    departments: ['CSE', 'ECE', 'EEE'],
    skills: ['C Programming', 'Basic Python', 'Operating Systems'],
    venue: 'IT Block Block-B Lab 3',
    selectionProcess: ['Wipro Elite NLTH Test', 'Technical Panel', 'HR Panel'],
    hrContact: 'Mr. Sandeep Nair (campus.hr@wipro.com)',
    jobDescription: 'Work with cross-functional development teams on enterprise maintenance projects, QA testing, and cloud operations support.',
    timelineSteps: ['Registration Open', 'NLTH Online Test', 'Technical Round', 'HR Interview', 'Final Results'],
    currentTimelineStepIndex: 4
  },
  {
    id: 'pl4',
    companyName: 'Accenture India',
    role: 'Associate Software Engineer',
    package: '₹4.5 LPA',
    location: 'Bangalore (Mock Venue)',
    driveDate: '01 Jul 2026',
    deadline: '25 Jun 2026',
    registeredCount: 10,
    eligibleCount: 20,
    status: 'ONGOING',
    jobType: 'Full Time',
    minCgpa: 6.5,
    passingYear: '2026',
    departments: ['CSE', 'ECE', 'EEE'],
    skills: ['JavaScript', 'Agile Methodologies', 'Cloud Basics'],
    venue: 'Main Auditorium & CS Labs',
    selectionProcess: ['Cognitive Assessment', 'Technical Interview', 'HR Panel Interview'],
    hrContact: 'Ms. Divya Mathews (divya.m@accenture.com)',
    jobDescription: 'Collaborate with software engineers to design, build, and support enterprise systems for global Fortune 500 companies.',
    timelineSteps: ['Registration Open', 'Cognitive Exam', 'Technical Interview', 'HR Interview', 'Final Offer'],
    currentTimelineStepIndex: 2
  },
  {
    id: 'pl5',
    companyName: 'Amazon',
    role: 'SDE Intern',
    package: '₹80k / month',
    location: 'Bangalore Office',
    driveDate: '10 Aug 2026',
    deadline: '01 Aug 2026',
    registeredCount: 0,
    eligibleCount: 5,
    status: 'CANCELLED',
    jobType: 'Internship',
    minCgpa: 8.5,
    passingYear: '2026',
    departments: ['CSE'],
    skills: ['Data Structures', 'Advanced Algorithms', 'Systems Design'],
    venue: 'Amazon Bangalore Headquarters',
    selectionProcess: ['Online Coding Challenge', 'System Design Panel', 'Coding Loop Round', 'Bar Raiser'],
    hrContact: 'Mr. David Paul (dpaul@amazon.com)',
    jobDescription: '3-month Summer Internship with direct consideration for Full Time SDE Offers based on project performance reviews.',
    timelineSteps: ['Registration Open', 'Online Test', 'Technical Panel 1', 'Technical Panel 2', 'HR Interview'],
    currentTimelineStepIndex: 0
  }
];

export const mockPlacementStudents: PlacementStudent[] = [
  { id: 'ps1', name: 'Adithya R', registerNumber: '912322104001', department: 'CSE', cgpa: 8.5, currentStatus: 'ELIGIBLE', driveId: 'pl1' },
  { id: 'ps2', name: 'Abhinaya K', registerNumber: '912322104002', department: 'CSE', cgpa: 7.2, currentStatus: 'ELIGIBLE', driveId: 'pl1' },
  { id: 'ps3', name: 'Balaji S', registerNumber: '912322106001', department: 'ECE', cgpa: 8.1, currentStatus: 'ELIGIBLE', driveId: 'pl1' },
  { id: 'ps4', name: 'Bharathi M', registerNumber: '912322106002', department: 'ECE', cgpa: 6.9, currentStatus: 'REJECTED', driveId: 'pl1' },

  { id: 'ps5', name: 'Adithya R', registerNumber: '912322104001', department: 'CSE', cgpa: 8.5, currentStatus: 'REGISTERED', driveId: 'pl2' },
  { id: 'ps6', name: 'Balaji S', registerNumber: '912322106001', department: 'ECE', cgpa: 8.1, currentStatus: 'REGISTERED', driveId: 'pl2' },
  { id: 'ps7', name: 'Chandran V', registerNumber: '912322105001', department: 'EEE', cgpa: 7.8, currentStatus: 'REGISTERED', driveId: 'pl2' },
  { id: 'ps8', name: 'Dinesh Kumar', registerNumber: '912322114001', department: 'MECH', cgpa: 5.8, currentStatus: 'ELIGIBLE', driveId: 'pl2' },

  { id: 'ps9', name: 'Adithya R', registerNumber: '912322104001', department: 'CSE', cgpa: 8.5, currentStatus: 'SELECTED', driveId: 'pl3' },
  { id: 'ps10', name: 'Abhinaya K', registerNumber: '912322104002', department: 'CSE', cgpa: 7.2, currentStatus: 'SELECTED', driveId: 'pl3' },
  { id: 'ps11', name: 'Balaji S', registerNumber: '912322106001', department: 'ECE', cgpa: 8.1, currentStatus: 'REJECTED', driveId: 'pl3' },
  { id: 'ps12', name: 'Chandran V', registerNumber: '912322105001', department: 'EEE', cgpa: 7.8, currentStatus: 'ATTENDED', driveId: 'pl3' },

  { id: 'ps13', name: 'Adithya R', registerNumber: '912322104001', department: 'CSE', cgpa: 8.5, currentStatus: 'SHORTLISTED', driveId: 'pl4' },
  { id: 'ps14', name: 'Abhinaya K', registerNumber: '912322104002', department: 'CSE', cgpa: 7.2, currentStatus: 'ATTENDED', driveId: 'pl4' },
  { id: 'ps15', name: 'Balaji S', registerNumber: '912322106001', department: 'ECE', cgpa: 8.1, currentStatus: 'SHORTLISTED', driveId: 'pl4' }
];

// ── Mock Library Services ──
export const mockAllBooks: LibraryBook[] = [
  {
    id: 'b1',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth',
    category: 'Computer Science',
    publisher: 'McGraw-Hill',
    accessNo: 'ACC8901',
    rackNo: 'R-04-A',
    isbn: '978-0073523323',
    language: 'English',
    edition: '6th Edition',
    availableCopies: 3,
    totalCopies: 5,
    status: 'AVAILABLE',
    description: 'Presents the fundamental concepts of database management in an intuitive manner, including relational design, SQL, transaction management, and concurrency control.',
  },
  {
    id: 'b2',
    title: 'Operating System Principles',
    author: 'Galvin, Gagne',
    category: 'Computer Science',
    publisher: 'Wiley',
    accessNo: 'ACC4321',
    rackNo: 'R-03-B',
    isbn: '978-0470128725',
    language: 'English',
    edition: '8th Edition',
    availableCopies: 0,
    totalCopies: 4,
    status: 'ISSUED',
    description: 'Provides a solid conceptual foundation of operating systems, covering processes, memory management, file systems, I/O, security, and distributed systems.',
  },
  {
    id: 'b3',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    category: 'Networking',
    publisher: 'Pearson',
    accessNo: 'ACC5678',
    rackNo: 'R-02-C',
    isbn: '978-0132126953',
    language: 'English',
    edition: '5th Edition',
    availableCopies: 6,
    totalCopies: 8,
    status: 'AVAILABLE',
    description: 'Introduces the domain of computer networks, exploring physical layer, data link layer, routing algorithms, transport layer protocols, and application layer utilities.',
  },
  {
    id: 'b4',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    category: 'Artificial Intelligence',
    publisher: 'Pearson',
    accessNo: 'ACC9012',
    rackNo: 'R-05-D',
    isbn: '978-0136086208',
    language: 'English',
    edition: '3rd Edition',
    availableCopies: 2,
    totalCopies: 2,
    status: 'RESERVED',
    description: 'The long-standing standard textbook on AI, providing a comprehensive and modern synthesis of intelligent agents, search, logic, planning, and neural networks.',
  },
  {
    id: 'b5',
    title: 'Data Structures and Algorithms in Java',
    author: 'Robert Lafore',
    category: 'Data Structures',
    publisher: 'Sams Publishing',
    accessNo: 'ACC3456',
    rackNo: 'R-01-A',
    isbn: '978-0672324536',
    language: 'English',
    edition: '2nd Edition',
    availableCopies: 0,
    totalCopies: 3,
    status: 'UNAVAILABLE',
    description: 'An easy-to-read introduction to basic data structures (stacks, queues, trees, graphs) and algorithms, using clear Java code examples and interactive illustrations.',
  },
  {
    id: 'b6',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest',
    category: 'Data Structures',
    publisher: 'MIT Press',
    accessNo: 'ACC6543',
    rackNo: 'R-01-B',
    isbn: '978-0262033848',
    language: 'English',
    edition: '3rd Edition',
    availableCopies: 4,
    totalCopies: 5,
    status: 'AVAILABLE',
    description: 'An essential guide to algorithm analysis and design, covering sorting, dynamic programming, greedy strategies, graph theory, and NP-completeness.',
  }
];

export const mockBorrowedBooks: BorrowedBook[] = [
  {
    id: 'issue_01',
    bookId: 'b1',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth',
    issueDate: '15 Jun 2026',
    dueDate: '15 Jul 2026',
    renewCount: 1,
    accessNo: 'ACC8901',
    status: 'ISSUED'
  },
  {
    id: 'issue_02',
    bookId: 'b2',
    title: 'Operating System Principles',
    author: 'Galvin, Gagne',
    issueDate: '20 Jun 2026',
    dueDate: '06 Jul 2026',
    renewCount: 3,
    accessNo: 'ACC4321',
    status: 'DUE_SOON'
  },
  {
    id: 'issue_03',
    bookId: 'b5',
    title: 'Data Structures and Algorithms in Java',
    author: 'Robert Lafore',
    issueDate: '10 May 2026',
    dueDate: '25 May 2026',
    renewCount: 0,
    accessNo: 'ACC3456',
    status: 'OVERDUE'
  }
];

export const mockReadingHistory: ReadingHistoryEntry[] = [
  {
    id: 'hist_01',
    bookId: 'b3',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    issueDate: '10 Mar 2026',
    returnDate: '24 Mar 2026',
    totalDays: 14,
    renewCount: 0
  },
  {
    id: 'hist_02',
    bookId: 'b6',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest',
    issueDate: '15 Nov 2025',
    returnDate: '10 Dec 2025',
    totalDays: 25,
    renewCount: 1
  },
  {
    id: 'hist_03',
    bookId: 'b1',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth',
    issueDate: '01 May 2025',
    returnDate: '15 May 2025',
    totalDays: 14,
    renewCount: 0
  }
];

export const mockLibraryStats: LibraryStats = {
  borrowedCount: 18,
  returnedCount: 15,
  overdueCount: 1,
  renewedCount: 4,
  currentCount: 3
};

// ── Mock Defaulters List ──
export const mockDefaultersList = [
  { id: 'def1', name: 'Ayesha Banu R', rollNo: '714', attendancePercent: 71, class: 'III B.Sc CS' },
  { id: 'def2', name: 'Abdul Rahman K', rollNo: '711', attendancePercent: 72, class: 'III B.Sc CS' },
  { id: 'def3', name: 'Maryam Siddiqui F', rollNo: '718', attendancePercent: 74, class: 'III B.Sc CS' },
];

// ── Mock Mentees & Counseling Logs ──
export const mockMentees = [
  {
    id: 's01',
    name: 'Mohammed Azhan T',
    rollNo: '710',
    registerNumber: 'MUC710',
    attendancePercent: 89,
    gpa: 8.6,
    counselingLogs: [
      { date: '15 Jun 2026', notes: 'Discussed final year project topic. Advised to focus on web portal app.' },
      { date: '10 May 2026', notes: 'Performing well. Suggested reading research papers on machine learning.' }
    ]
  },
  {
    id: 's02',
    name: 'Abdul Rahman K',
    rollNo: '711',
    registerNumber: 'MUC711',
    attendancePercent: 72,
    gpa: 6.4,
    counselingLogs: [
      { date: '18 Jun 2026', notes: 'Warned regarding shortage of attendance. He cited transportation issues. Parents were informed.' }
    ]
  },
  {
    id: 's03',
    name: 'Fathima Zahra M',
    rollNo: '712',
    registerNumber: 'MUC712',
    attendancePercent: 95,
    gpa: 9.2,
    counselingLogs: [
      { date: '01 Jun 2026', notes: 'Excellent academic progress. Eager to apply for higher studies.' }
    ]
  }
];

// ── Mock College Events ──
export const mockFacultyEvents: CollegeEvent[] = [
  {
    id: 'ev1',
    title: 'CS National Symposium 2026',
    description: 'Annual national level technical symposium organized by the Computer Science and Engineering department. Features coding challenges, paper presentations, and tech quizzes.',
    date: '12 Jul 2026',
    day: '12',
    month: 'JUL',
    year: '2026',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    venue: 'Main College Auditorium',
    category: 'Symposium',
    coordinator: 'Dr. Rizwan Ahmed',
    assignedDuty: 'Technical Quiz Judge',
    dutyStatus: 'ASSIGNED',
    status: 'UPCOMING',
    reportingTime: '09:15 AM',
    dressCode: 'Formals (Collar tie mandatory)',
    assignedCommittee: 'Technical Evaluation Committee',
    specialInstructions: 'Please coordinate with student coordinators at 9:15 AM to verify quiz systems. Evaluation sheets must be submitted to the CSE department office by 4:30 PM.',
    requiredDocuments: ['Scoring Sheet', 'Winner List', 'Rules Sheet'],
    emergencyContact: '+91 98765 43210 (Dr. Rizwan Ahmed)',
    timelineSteps: ['Duty Assigned', 'Confirmed', 'Reporting', 'Event Started', 'Event Completed'],
    currentTimelineStepIndex: 0
  },
  {
    id: 'ev2',
    title: 'Web Development Bootcamp',
    description: '3-day hands-on intensive bootcamp on Full Stack React Native and Next.js development for third-year students.',
    date: '05 Jul 2026',
    day: '05',
    month: 'JUL',
    year: '2026',
    startTime: '09:30 AM',
    endTime: '01:00 PM',
    venue: 'CSE Block Seminar Hall',
    category: 'Academic',
    coordinator: 'Prof. Sarah Jenkins',
    assignedDuty: 'Coordinator',
    dutyStatus: 'CONFIRMED',
    status: 'ONGOING',
    reportingTime: '09:00 AM',
    dressCode: 'Formals / Smart Casuals',
    assignedCommittee: 'Academic Event Operations Committee',
    specialInstructions: 'Ensure audio-visual projection works correctly. Distribute digital certificates to student attendees who attend all sessions.',
    requiredDocuments: ['Attendance Sheet', 'Feedback Forms', 'Speaker Form'],
    emergencyContact: '+91 99999 88888 (Prof. Sarah Jenkins)',
    timelineSteps: ['Duty Assigned', 'Confirmed', 'Reporting', 'Event Started', 'Event Completed'],
    currentTimelineStepIndex: 3
  },
  {
    id: 'ev3',
    title: 'Independence Day Celebrations',
    description: 'Flag hoisting ceremony and patriotic cultural events to celebrate the 80th Independence Day of India.',
    date: '15 Aug 2026',
    day: '15',
    month: 'AUG',
    year: '2026',
    startTime: '08:00 AM',
    endTime: '10:30 AM',
    venue: 'Main College Ground',
    category: 'National Festival',
    coordinator: 'Principal Office',
    assignedDuty: 'Discipline Committee',
    dutyStatus: 'ASSIGNED',
    status: 'UPCOMING',
    reportingTime: '07:30 AM',
    dressCode: 'Traditional White Ethnic Wear',
    assignedCommittee: 'College Celebrations Assembly Committee',
    specialInstructions: 'Arrive early at 7:30 AM. Supervise student placement grids on the ground and ensure disciplined flag hoisting sequence.',
    requiredDocuments: ['Assembly Seating Map', 'Student Marching List'],
    emergencyContact: '+91 94444 55555 (Administrative Coordinator)',
    timelineSteps: ['Duty Assigned', 'Confirmed', 'Reporting', 'Event Started', 'Event Completed'],
    currentTimelineStepIndex: 0
  },
  {
    id: 'ev4',
    title: 'Internal Hackathon 2025',
    description: '24-hour coding hackathon for solving real-world smart city problems.',
    date: '10 Oct 2025',
    day: '10',
    month: 'OCT',
    year: '2025',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: 'CSE Lab 1 & 2',
    category: 'Technical',
    coordinator: 'HOD CSE',
    assignedDuty: 'Evaluation Committee',
    dutyStatus: 'COMPLETED',
    status: 'COMPLETED',
    reportingTime: '08:30 AM',
    dressCode: 'Formals',
    assignedCommittee: 'Technical Evaluation Panel',
    specialInstructions: 'Evaluating student project prototypes. Verify documentation and clean code standards.',
    requiredDocuments: ['Grading Sheets', 'Team List Roster'],
    emergencyContact: '+91 91111 22222 (HOD CSE Office)',
    timelineSteps: ['Duty Assigned', 'Confirmed', 'Reporting', 'Event Started', 'Event Completed'],
    currentTimelineStepIndex: 4
  }
];

// ── Mock Faculty Circulars ──
export const mockFacultyCirculars: CircularItem[] = [
  {
    id: 'c1',
    category: 'Exams',
    priority: 'Critical',
    department: 'CSE',
    targetDesignation: 'All Faculty',
    publisher: 'Controller of Examinations',
    publishedDate: '01 Jul 2026',
    expiryDate: '10 Jul 2026',
    title: 'Semester End Exam Valuation Schedule & Duty Allocation',
    summary: 'Valuation duties allocated for final semester exams starting from 06 July. Attendance is compulsory.',
    description: 'Dear Faculty Members,\n\nThe valuations of the end semester examinations (April/May 2026 sessions) are scheduled to start from 06 July 2026 at the Central Valuation Camp (IT Block, Lab-1).\n\nAll allocated evaluators are strictly requested to report by 09:30 AM on their respective days. Kindly note that valuation is an essential university duty, and no leaves or alternate arrangements will be sanctioned during this period.\n\nPlease refer to the attachment for detailed evaluator lists and code allocations.',
    attachmentCount: 2,
    attachments: [
      { name: 'Valuation_Evaluator_List.pdf', type: 'PDF', size: '1.2 MB' },
      { name: 'Valuation_Guidelines_2026.docx', type: 'Word', size: '240 KB' }
    ],
    circularNo: 'MUC/EX/2026/089',
    referenceNo: 'REF-EX-8902',
    isRead: false,
    isBookmarked: false,
    isArchived: false
  },
  {
    id: 'c2',
    category: 'HR',
    priority: 'Important',
    department: 'All Departments',
    targetDesignation: 'All Faculty',
    publisher: 'Director HR',
    publishedDate: '28 Jun 2026',
    expiryDate: '30 Jul 2026',
    title: 'Faculty Performance Appraisal Guidelines and Timelines 2026',
    summary: 'Submission criteria and timeline dates for Self Appraisal Reports (SAR) for academic year 2025-26.',
    description: 'This is to inform all faculty members that the portal for submitting the Annual Self Appraisal Report (SAR) for the Academic Year 2025-26 is now open.\n\nThe appraisal metric is based on three main criteria:\n1. Teaching-Learning Process & Student Feedback (50%)\n2. Research Outputs, Publications, and Grants (30%)\n3. Administration Contributions & Co-curricular activities (20%)\n\nAll completed SAR forms along with required proof portfolios must be uploaded online before 30 July 2026. Late submissions will not be considered for annual increments.',
    attachmentCount: 1,
    attachments: [
      { name: 'Self_Appraisal_Form_SAR_2026.xlsx', type: 'Excel', size: '420 KB' }
    ],
    circularNo: 'MUC/HR/2026/042',
    referenceNo: 'REF-HR-4211',
    isRead: false,
    isBookmarked: true,
    isArchived: false
  },
  {
    id: 'c3',
    category: 'Research',
    priority: 'Urgent',
    department: 'All Departments',
    targetDesignation: 'Assistant & Associate Professors',
    publisher: 'Dean Research',
    publishedDate: '05 Jul 2026',
    expiryDate: '25 Jul 2026',
    title: 'AICTE Research Promotion Scheme (RPS) Project Proposals Call',
    summary: 'Call for funding project proposals in engineering disciplines with a maximum grant of ₹25 Lakhs.',
    description: 'Proposals are invited from faculty members holding regular positions for research grants under the AICTE Research Promotion Scheme (RPS) for the financial year 2026-27.\n\nPriority themes include:\n- Sustainable & Clean Energies\n- AI in Agriculture and Health Diagnostics\n- Additive Manufacturing and Advanced Materials\n\nDean Office will organize a proposal drafting workshop on 12 July 2026. Final soft copies of proposals must be submitted through the portal before 25 July 2026.',
    attachmentCount: 3,
    attachments: [
      { name: 'AICTE_RPS_Scheme_Details.pdf', type: 'PDF', size: '2.5 MB' },
      { name: 'Proposal_Draft_Format.docx', type: 'Word', size: '150 KB' },
      { name: 'Budget_Format_RPS.xlsx', type: 'Excel', size: '95 KB' }
    ],
    circularNo: 'MUC/RES/2026/015',
    referenceNo: 'REF-RES-1510',
    isRead: true,
    isBookmarked: false,
    isArchived: false
  },
  {
    id: 'c4',
    category: 'IQAC',
    priority: 'Normal',
    department: 'All Departments',
    targetDesignation: 'All Faculty',
    publisher: 'IQAC Coordinator',
    publishedDate: '15 Jun 2026',
    expiryDate: '30 Jun 2026',
    title: 'IQAC Internal Department Audit Notification',
    summary: 'Internal academic audit schedule for verification of course files and student attendance logs.',
    description: 'Dear Colleagues,\n\nThe IQAC Internal Academic and Administrative Audit for the odd semester is scheduled from 25th June to 30th June 2026.\n\nAll HODs are requested to keep ready the department course files, lab manual registers, student feedback summaries, mentor files, and research publications registers for verification by external auditing teams.\n\nAudit findings must be submitted to IQAC by 02 July.',
    attachmentCount: 1,
    attachments: [
      { name: 'IQAC_Audit_Checklist.pdf', type: 'PDF', size: '580 KB' }
    ],
    circularNo: 'MUC/IQAC/2026/011',
    referenceNo: 'REF-IQ-1102',
    isRead: true,
    isBookmarked: false,
    isArchived: true
  },
  {
    id: 'c5',
    category: 'NAAC',
    priority: 'Critical',
    department: 'CSE',
    targetDesignation: 'Criteria 3 Coordinators',
    publisher: 'NAAC Chairperson',
    publishedDate: '03 Jul 2026',
    expiryDate: '15 Jul 2026',
    title: 'NAAC Criteria 3 Research & Extensions Proofs Verification',
    summary: 'Verification of research papers index, citations, and extension activity reports.',
    description: 'To all CSE department criteria coordinators,\n\nWe will hold a criteria audit review on 08 July 2026 at 02:00 PM in the Principal Conference Room.\n\nKindly compile all journal/conference publication proofs, patents certificate proofs, and community extension activity photographs with student signing rosters for the last 5 years. Use the standard templates attached below.',
    attachmentCount: 2,
    attachments: [
      { name: 'Criteria_3_Research_Template.xlsx', type: 'Excel', size: '180 KB' },
      { name: 'Patents_Format_MUC.zip', type: 'ZIP', size: '4.8 MB' }
    ],
    circularNo: 'MUC/NAAC/2026/057',
    referenceNo: 'REF-NC-5722',
    isRead: false,
    isBookmarked: false,
    isArchived: false
  }
];

// ── Mock Notifications ──
export const mockFacultyNotifications: ERPNotification[] = [
  {
    id: 'n1',
    module: 'Faculty',
    category: 'Meeting',
    priority: 'Urgent',
    title: 'Urgent HOD Meeting Scheduled',
    description: 'HOD has scheduled an urgent departmental meeting regarding odd semester result valuation and syllabus completion verification today at 03:30 PM in the HOD Cabin. Attendance is mandatory.',
    createdTime: '2026-07-05T12:45:00Z',
    isRead: false,
    isPinned: false,
    isArchived: false,
    actionRequired: 'Acknowledge',
    deepLink: '/faculty/academic-hub'
  },
  {
    id: 'n2',
    module: 'Leave',
    category: 'Leave Approved',
    priority: 'Important',
    title: 'Leave Application Approved by HOD',
    description: 'Your casual leave request CL-203 (06 Jul 2026 to 07 Jul 2026) has been approved by HOD and Principal. Alternate teaching arrangement details have been verified.',
    createdTime: '2026-07-05T10:30:00Z',
    isRead: false,
    isPinned: true,
    isArchived: false,
    actionRequired: 'View',
    deepLink: '/faculty/admin-hub?tab=LEAVE'
  },
  {
    id: 'n3',
    module: 'Attendance',
    category: 'Attendance Pending',
    priority: 'Critical',
    title: 'Daily Attendance Submission Pending',
    description: 'Attendance log for class "III Year CSE B - Computer Networks" scheduled at 10:00 AM today has not been submitted yet. Kindly submit before 04:00 PM lock.',
    createdTime: '2026-07-05T11:00:00Z',
    isRead: false,
    isPinned: false,
    isArchived: false,
    actionRequired: 'Open',
    deepLink: '/faculty/attendance-hub'
  },
  {
    id: 'n4',
    module: 'Library',
    category: 'Book Return Reminder',
    priority: 'Normal',
    title: 'Library Book Due Reminder',
    description: 'The book "Database System Concepts (6th Edition)" issued on Accession No: B-9022 is due in 3 days. Kindly renew or return to avoid overdue fines.',
    createdTime: '2026-07-04T09:00:00Z',
    isRead: true,
    isPinned: false,
    isArchived: false,
    actionRequired: 'Renew',
    deepLink: '/faculty/admin-hub?tab=LIBRARY'
  },
  {
    id: 'n5',
    module: 'Events',
    category: 'Duty Assigned',
    priority: 'Important',
    title: 'Symposium Coordination Duty Assigned',
    description: 'You have been assigned as the coordinator for the Technical Quiz in "MUC INFO-QUEST 2026". Check coordinator contacts and guidelines in the events tab.',
    createdTime: '2026-07-03T15:00:00Z',
    isRead: true,
    isPinned: false,
    isArchived: false,
    actionRequired: 'Acknowledge',
    deepLink: '/faculty/admin-hub?tab=EVENTS'
  },
  {
    id: 'n6',
    module: 'Placement',
    category: 'New Drive Published',
    priority: 'Important',
    title: 'New Placement Drive: Wipro Hackathon Recruitment',
    description: 'Wipro has published a new drive for CSE/ECE graduates with package of 6.5 LPA. Registration closes on 10 July.',
    createdTime: '2026-07-05T08:00:00Z',
    isRead: false,
    isPinned: false,
    isArchived: false,
    actionRequired: 'View',
    deepLink: '/faculty/admin-hub?tab=PLACEMENTS'
  },
  {
    id: 'n7',
    module: 'HR',
    category: 'Salary Credited',
    priority: 'Normal',
    title: 'Salary Credited - June 2026',
    description: 'Your monthly salary for the month of June 2026 has been credited. The detailed pay slip is available for download in the profile section.',
    createdTime: '2026-07-01T10:00:00Z',
    isRead: true,
    isPinned: false,
    isArchived: false,
    actionRequired: 'Download',
    deepLink: '/faculty/profile'
  },
  {
    id: 'n8',
    module: 'System',
    category: 'Security Alert',
    priority: 'Urgent',
    title: 'Faculty ERP Login from New Device',
    description: 'A login was detected from Chrome browser on Windows 11 at 05 Jul 2026 12:01 PM. If this was not you, please reset your password immediately.',
    createdTime: '2026-07-05T12:05:00Z',
    isRead: false,
    isPinned: false,
    isArchived: false,
    actionRequired: 'Dismiss',
    deepLink: '/faculty/settings'
  }
];

