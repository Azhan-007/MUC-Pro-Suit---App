// Complete mock dataset — ported from MockCampusData object in MockData.kt

import {
  StudentProfile,
  AttendanceOverview,
  DailyAttendance,
  SubjectAttendance,
  TimetableClass,
  EventDeadline,
  ResultOverview,
  SubjectGrade,
  FeeSummary,
  FeeDetail,
  PaymentTransaction,
  Announcement,
  UpcomingEvent,
  Assignment,
  StudyMaterial,
  BorrowedBook,
  LibraryBook,
  JobPosting,
  CollegeEvent,
  CertificateRequest,
} from '../types';

export const mockProfile: StudentProfile = {
  id: 'MUC710',
  name: 'Mohammed Azhan T',
  registerNumber: 'MUC710',
  department: 'BSc Computer Science',
  course: 'B.Sc CS',
  semester: '5 (year 3)',
  batch: '2024-27',
  section: 'A',
  classAdvisor: 'Dr P Rizwan Ahmed',
  mentor: 'Dr A Zakiuddin Ahmed',
  rollNumber: '710',
  bloodGroup: 'b+',
  mobile: '+91 98765 43210',
  email: 'azhan.t@mucollege.edu.in',
  dob: '14.07.2007',
  gender: 'Male',
  permanentAddress: 'Ambur, Tamil Nadu, India',
  fatherName: 'Mr. T. Father',
  motherName: 'Mrs. T. Mother',
  emergencyContact: '+91 98765 43211',
};

export const mockAttendanceOverview: AttendanceOverview = {
  overallPercentage: 85,
  presentDays: 42,
  absentDays: 3,
  totalDays: 45,
  totalAttendedClasses: 112,
  missedClasses: 12,
  classesTo75Percent: 0,
  currentStreak: 8,
};

export const mockDailyAttendance: DailyAttendance[] = [
  { time: '09:00 AM', subject: 'Operating System', period: 'Period 1 • Room 402', room: 'Room 402', status: 'LATE' },
  { time: '10:00 AM', subject: 'Database Management System', period: 'Period 2 • Lab 01', room: 'Lab 01', status: 'PRESENT' },
  { time: '11:30 AM', subject: 'Data Mining and Warehousing', period: 'Period 3 • Room 201', room: 'Room 201', status: 'ABSENT' },
  { time: '01:30 PM', subject: 'Data Science', period: 'Period 4 • Lab 03', room: 'Lab 03', status: 'PRESENT' },
  { time: '02:30 PM', subject: 'Database Management System', period: 'Period 5 • Lab 01', room: 'Lab 01', status: 'PENDING' },
];

export const mockSubjectAttendance: SubjectAttendance[] = [
  { subjectName: 'Database Management System', percentage: 93, fraction: '42/45 Classes', statusLevel: 'SAFE', tip: 'Excellent attendance. Keep maintaining it!', facultyName: 'Dr P Rizwan Ahmed' },
  { subjectName: 'Data Mining and Warehousing', percentage: 75, fraction: '30/40 Classes', statusLevel: 'WARNING', tip: "Don't miss the next lecture to stay above 75%.", facultyName: 'Dr A Zakiuddin Ahmed' },
  { subjectName: 'Data Science', percentage: 88, fraction: '28/32 Classes', statusLevel: 'SAFE', tip: 'Good job, keep it up!', facultyName: 'Mr Yaseen' },
  { subjectName: 'Operating System', percentage: 84, fraction: '27/32 Classes', statusLevel: 'SAFE', tip: 'Stay consistent!', facultyName: 'Ms Sayeeda' },
];

export const mockTimetable: Record<string, TimetableClass[]> = {
  Mon: [
    { time: '09:00\n10:00', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Room 402', status: 'COMPLETED' },
    { time: '10:00\n11:00', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Lab 01', status: 'COMPLETED' },
    { time: '11:00 - 11:30', subject: 'Time Break', professor: '', room: '', isLunchBreak: true },
    { time: '11:30\n12:30', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Room 201', status: 'COMPLETED' },
    { time: '01:30\n02:30', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Lab 03', status: 'COMPLETED' },
    { time: '02:30\n03:30', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Lab 01', status: 'COMPLETED' },
  ],
  Tue: [
    { time: '09:00\n10:00', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Room 404', status: 'COMPLETED' },
    { time: '10:00\n11:00', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Hall B', status: 'COMPLETED' },
    { time: '11:00 - 11:30', subject: 'Time Break', professor: '', room: '', isLunchBreak: true },
    { time: '11:30\n12:30', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Lab 05', status: 'COMPLETED' },
    { time: '01:30\n02:30', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Lab 02', status: 'COMPLETED' },
    { time: '02:30\n03:30', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Hall B', status: 'COMPLETED' },
  ],
  Wed: [
    { time: '09:00\n10:00', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Room 402', status: 'COMPLETED' },
    { time: '10:00\n11:00', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Lab 01', status: 'COMPLETED' },
    { time: '11:00 - 11:30', subject: 'Time Break', professor: '', room: '', isLunchBreak: true },
    { time: '11:30\n12:30', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Room 201', status: 'ONGOING' },
    { time: '01:30\n02:30', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Lab 03', status: 'UPCOMING' },
    { time: '02:30\n03:30', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Room 402', status: 'UPCOMING' },
  ],
  Thu: [
    { time: '09:00\n10:00', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Room 402', status: 'UPCOMING' },
    { time: '10:00\n11:00', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Lab 01', status: 'UPCOMING' },
    { time: '11:00 - 11:30', subject: 'Time Break', professor: '', room: '', isLunchBreak: true },
    { time: '11:30\n12:30', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Room 201', status: 'UPCOMING' },
    { time: '01:30\n02:30', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Lab 03', status: 'UPCOMING' },
    { time: '02:30\n03:30', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Room 201', status: 'UPCOMING' },
  ],
  Fri: [
    { time: '09:00\n10:00', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Lab 02', status: 'UPCOMING' },
    { time: '10:00\n11:00', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Lab 06', status: 'UPCOMING' },
    { time: '11:00 - 11:30', subject: 'Time Break', professor: '', room: '', isLunchBreak: true },
    { time: '11:30\n12:30', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Lab 05', status: 'UPCOMING' },
    { time: '01:30\n02:30', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Lab 01', status: 'UPCOMING' },
    { time: '02:30\n03:30', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Lab 06', status: 'UPCOMING' },
  ],
  Sat: [
    { time: '09:00\n10:00', subject: 'Data Mining and Warehousing', professor: 'Dr A Zakiuddin Ahmed', room: 'Project Lab', status: 'UPCOMING' },
    { time: '10:00\n11:00', subject: 'Database Management System', professor: 'Dr P Rizwan Ahmed', room: 'Seminar Hall', status: 'UPCOMING' },
    { time: '11:00 - 11:30', subject: 'Time Break', professor: '', room: '', isLunchBreak: true },
    { time: '11:30\n12:30', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Room 201', status: 'UPCOMING' },
    { time: '01:30\n02:30', subject: 'Operating System', professor: 'Ms Sayeeda', room: 'Lab 03', status: 'UPCOMING' },
    { time: '02:30\n03:30', subject: 'Data Science', professor: 'Mr Yaseen', room: 'Room 201', status: 'UPCOMING' },
  ],
};

export const mockEventsAndDeadlines: EventDeadline[] = [
  { title: 'Mid-term Exams', details: 'Next Monday • All Subjects', dateText: 'Next Monday', type: 'EXAM' },
  { title: 'Special Workshop: AI in Design', details: 'Friday • Main Auditorium', dateText: 'Friday', type: 'WORKSHOP' },
];

export const mockResultOverview: ResultOverview = {
  currentSgpa: 8.92,
  cgpa: 8.75,
  creditsProgress: '84 / 120',
  currentProgressPercentage: 0.7,
  accuracy: '89.2%',
  academicStanding: 'Excellent - Your academic standing is in the top 5% of your batch.',
  gpaTrend: [
    { semester: 'S1', gpa: 8.4 },
    { semester: 'S2', gpa: 8.6 },
    { semester: 'S3', gpa: 8.75 },
    { semester: 'S4', gpa: 8.92 },
  ],
};

export const mockSubjectGrades: SubjectGrade[] = [
  { code: 'DBMS401', subjectName: 'Database Management System', credits: 4, grade: 'A+', passStatus: 'PASS', internals: '22/25', externals: '66/75', total: '88/100' },
  { code: 'DMW402', subjectName: 'Data Mining and Warehousing', credits: 3, grade: 'A', passStatus: 'PASS', internals: '20/25', externals: '62/75', total: '82/100' },
  { code: 'DS403', subjectName: 'Data Science', credits: 3, grade: 'O', passStatus: 'PASS', internals: '24/25', externals: '71/75', total: '95/100' },
  { code: 'OS404', subjectName: 'Operating System', credits: 4, grade: 'A+', passStatus: 'PASS', internals: '23/25', externals: '64/75', total: '87/100' },
];

export const mockFeeSummary: FeeSummary = {
  outstandingAmount: 1250.0,
  paidAmount: 3750.0,
  progressPercent: 0.75,
  dueDateText: 'Due Date: Oct 25, 2026',
  isPending: true,
  scholarshipApplied: 'Merit Scholarship',
  scholarshipDiscount: '15% Discount',
  lastPaymentDate: 'Aug 15, 2026',
  nextDueDate: 'Oct 25, 2026',
};

export const mockFeeDetails: FeeDetail[] = [
  { title: 'TUITION', amount: 3000.0, isPaid: true, settledDateText: 'Settled on Aug 12, 2026' },
  { title: 'LAB', amount: 500.0, isPaid: true, settledDateText: 'Settled on Aug 12, 2026' },
  { title: 'EXAMINATION', amount: 1000.0, isPaid: false, dueDateText: 'Due Oct 25, 2026' },
  { title: 'OTHER CHARGES', amount: 250.0, isPaid: false, dueDateText: 'Due Oct 25, 2026' },
];

export const mockPaymentTransactions: PaymentTransaction[] = [
  { receiptNumber: 'MU-8821', date: 'Aug 15, 2026', amount: 1500.0, method: 'Visa 4242' },
  { receiptNumber: 'MU-8750', date: 'Jul 12, 2026', amount: 2250.0, method: 'Bank Trans' },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    category: 'EXAMS',
    title: 'Semester Exam Schedule Released',
    summary: 'The official schedule for Semester 4 exams is now available for all engineering branches. Please verify details on the campus portal.',
    content: 'The University Examination Department has officially announced the timetable for the upcoming Semester 4 End-Sem Exams starting from November 10th. All students are advised to download their admit cards by October 30th from the ERP portal. Make sure your outstanding dues are cleared to prevent any issues with your admit card generation.',
    dateText: 'Oct 25, 2026',
    author: 'Controller of Examinations',
    initials: 'CE',
    isImportant: true,
    attachmentName: 'Exam_Schedule_S4.pdf',
    imageKey: 'exams_poster',
  },
  {
    id: '2',
    category: 'PLACEMENTS',
    title: 'Google Recruitment Drive 2026',
    summary: 'Google is visiting campus for the 2026 batch recruitment drive. Eligibility: 7.5+ CGPA, no active backlogs.',
    content: 'We are thrilled to announce that Google will be visiting our campus on November 15th for an on-campus placement drive for software engineering roles. Interested candidates matching the eligibility criteria (B.Tech CSE/IT with CGPA >= 7.5) should submit their updated resumes by October 31st via the Placement Portal.',
    dateText: 'Oct 24, 2026',
    author: 'Placement Cell',
    initials: 'PC',
    attachmentName: 'JD_Google_SWE.pdf',
    imageKey: 'placements_poster',
    isImportant: false,
  },
  {
    id: '3',
    category: 'SCHOLARSHIPS',
    title: 'Merit Application Phase II Open',
    summary: 'Apply for the Merit-based scholarship for the upcoming academic year. Deadline is November 5th.',
    content: 'Applications are now open for the Phase II Merit-based tuition fee waivers and scholarships. Students with a CGPA above 8.5 in the previous semester are eligible to apply.',
    dateText: '2 hours ago',
    author: 'Student Affairs Office',
    initials: 'SA',
    isImportant: false,
  },
  {
    id: '4',
    category: 'LIBRARY',
    title: 'Extended 24/7 Library Hours',
    summary: 'The main library will remain open 24/7 during the exam month starting next Monday.',
    content: 'To facilitate exam preparation, the Central Library will operate round-the-clock (24 hours, 7 days a week) starting next Monday, November 1st.',
    dateText: 'Yesterday',
    author: 'Chief Librarian',
    initials: 'CL',
    isImportant: false,
  },
];

export const mockUpcomingEvents: UpcomingEvent[] = [
  { title: 'AI Workshop', dateText: 'Nov 02', timeText: '10:00 AM', imageKey: 'ai_workshop' },
  { title: 'Music Fest 2026', dateText: 'Nov 10', timeText: '06:00 PM', imageKey: 'music_fest' },
];

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    subjectName: 'Database Management System',
    title: 'DBMS Assignment 1: Schema Design',
    dueDate: 'Oct 10, 2026',
    marks: '10 Marks',
    status: 'GRADED',
    grade: '9/10',
    attachmentName: 'Schema_Design_Guidelines.pdf',
    assignedDate: 'Oct 01, 2026',
    professorName: 'Dr. P. Rizwan Ahmed',
    description: 'Design a relational database schema for a University Management System. Ensure all tables are normalized up to 3NF (Third Normal Form). Create Entity-Relationship (ER) diagrams showing relationships and keys. Write SQL queries to create the schema and insert sample records.',
    remarks: 'Excellent normalization and schema design. The ER diagram is very neat and clear. Good job!'
  },
  {
    id: '2',
    subjectName: 'Operating System',
    title: 'OS Lab 2: CPU Scheduling Algorithms',
    dueDate: 'Oct 28, 2026',
    marks: '15 Marks',
    status: 'PENDING',
    attachmentName: 'Scheduling_Lab_Manual.pdf',
    assignedDate: 'Oct 12, 2026',
    professorName: 'Ms. Sayeeda',
    description: 'Implement FCFS, SJF (Preemptive & Non-Preemptive), and Round Robin CPU scheduling algorithms. Calculate and compare the average waiting time and turnaround time for a given set of processes. Submit source code and execution graphs.',
  },
  {
    id: '3',
    subjectName: 'Data Science',
    title: 'DS Assignment 2: Exploratory Data Analysis',
    dueDate: 'Nov 05, 2026',
    marks: '20 Marks',
    status: 'PENDING',
    attachmentName: 'EDA_Dataset_Description.pdf',
    assignedDate: 'Oct 18, 2026',
    professorName: 'Mr. Yaseen',
    description: 'Perform Exploratory Data Analysis (EDA) on the provided dataset. Clean missing values, handle outliers using IQR method, create distribution plots, and visualize the correlation matrix using Seaborn heatmap. Document all insights.',
  },
  {
    id: '4',
    subjectName: 'Data Mining and Warehousing',
    title: 'DMW Lab 1: Apriori Algorithm Implementation',
    dueDate: 'Oct 22, 2026',
    marks: '10 Marks',
    status: 'SUBMITTED',
    attachmentName: 'Apriori_Lab_Sheet.pdf',
    assignedDate: 'Oct 08, 2026',
    professorName: 'Dr. A. Zakiuddin Ahmed',
    description: 'Implement the Apriori algorithm for mining frequent itemsets and association rules. Analyze the performance of the algorithm with varying support and confidence thresholds. Submit runtime performance plots.',
    remarks: 'Apriori implementation runs correctly. Evaluation is in progress.'
  }
];

export const mockStudyMaterials: StudyMaterial[] = [
  {
    id: '1',
    subjectName: 'Database Management System',
    title: 'DBMS Unit 1 Lecture Notes: Intro to RDBMS',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    uploadedDate: 'Oct 02, 2026',
    unit: 'Unit 1',
    professor: 'Dr. P. Rizwan Ahmed',
    description: 'Introduction to Database Management Systems, Relational Model, Database Schemas, Keys (Primary, Candidate, Foreign Keys), and relational integrity constraints.'
  },
  {
    id: '2',
    subjectName: 'Database Management System',
    title: 'DBMS Unit 2: SQL Joins and Subqueries Cheat Sheet',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    uploadedDate: 'Oct 05, 2026',
    unit: 'Unit 2',
    professor: 'Dr. P. Rizwan Ahmed',
    description: 'Quick reference sheet for SQL commands focusing on Inner Joins, Left/Right Outer Joins, Full Joins, nested subqueries, and grouping aggregates (GROUP BY, HAVING).'
  },
  {
    id: '3',
    subjectName: 'Operating System',
    title: 'OS Lecture Slides: Process Synchronization & Semaphores',
    fileType: 'PPTX',
    fileSize: '4.2 MB',
    uploadedDate: 'Oct 12, 2026',
    unit: 'Unit 2',
    professor: 'Ms. Sayeeda',
    description: 'Slides on Critical Section problem, process synchronization primitives, Semaphores (Counting & Binary), Mutexes, and classic synchronization problems like Producer-Consumer and Dining Philosophers.'
  },
  {
    id: '4',
    subjectName: 'Operating System',
    title: 'OS Unit 3 Notes: Deadlock Avoidance and Banker\'s Algorithm',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    uploadedDate: 'Oct 15, 2026',
    unit: 'Unit 3',
    professor: 'Ms. Sayeeda',
    description: 'Detailed study notes covering Deadlocks characterization, Resource Allocation Graphs, Deadlock Prevention techniques, and Banker\'s Algorithm for Deadlock Avoidance with solved examples.'
  },
  {
    id: '5',
    subjectName: 'Data Science',
    title: 'DS Python for Data Analysis: NumPy & Pandas Slides',
    fileType: 'PPTX',
    fileSize: '6.7 MB',
    uploadedDate: 'Oct 18, 2026',
    unit: 'Unit 1',
    professor: 'Mr. Yaseen',
    description: 'Introductory python slides focusing on core libraries: NumPy array manipulation, linear algebra operations, Pandas Series, DataFrames, data ingestion, filtering, and wrangling.'
  },
  {
    id: '6',
    subjectName: 'Data Mining and Warehousing',
    title: 'DMW Unit 1: Data Preprocessing Techniques Guide',
    fileType: 'PDF',
    fileSize: '2.9 MB',
    uploadedDate: 'Oct 20, 2026',
    unit: 'Unit 1',
    professor: 'Dr. A. Zakiuddin Ahmed',
    description: 'Detailed study guide for data cleaning (handling missing values, noisy data), data integration, data reduction, data transformation (normalization, discretization), and data quality metrics.'
  }
];

export const mockBorrowedBooks: BorrowedBook[] = [
  { id: 'LIB-3021', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', borrowDate: 'Oct 10, 2026', dueDate: 'Oct 25, 2026', daysLeft: 23, status: 'SAFE' },
  { id: 'LIB-4098', title: 'Database System Concepts', author: 'Abraham Silberschatz', borrowDate: 'Oct 12, 2026', dueDate: 'Oct 27, 2026', daysLeft: 25, status: 'SAFE' }
] as any;

export const mockLibraryCatalog: LibraryBook[] = [
  { id: 'CAT-101', title: 'Software Engineering: A Practitioner\'s Approach', author: 'Roger S. Pressman', copiesAvailable: 8, isAvailable: true },
  { id: 'CAT-102', title: 'Operating System Concepts', author: 'Abraham Silberschatz', copiesAvailable: 3, isAvailable: true },
  { id: 'CAT-103', title: 'Compilers: Principles, Techniques, and Tools', author: 'Alfred V. Aho', copiesAvailable: 0, isAvailable: false },
  { id: 'CAT-104', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', copiesAvailable: 5, isAvailable: true },
  { id: 'CAT-105', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', copiesAvailable: 2, isAvailable: true }
] as any;

export const mockJobPostings: JobPosting[] = [
  { id: 'JOB-001', companyName: 'Google', role: 'Software Engineering Intern (Summer 2027)', packageText: '₹1.2 Lakhs/month', location: 'Bangalore, India', eligibility: 'CGPA >= 8.0, B.Sc CS / BCA / B.Tech', deadline: 'Oct 31, 2026', status: 'APPLY' },
  { id: 'JOB-002', companyName: 'Zoho Corporation', role: 'Associate Software Developer', packageText: '₹7.5 LPA', location: 'Chennai, India', eligibility: 'CGPA >= 7.0, No active backlogs', deadline: 'Nov 15, 2026', status: 'APPLY' },
  { id: 'JOB-003', companyName: 'Infosys', role: 'Systems Engineer Specialist', packageText: '₹6.2 LPA', location: 'Mysore, India', eligibility: 'CGPA >= 6.0, Open to all IT branches', deadline: 'Nov 20, 2026', status: 'APPLIED' },
  { id: 'JOB-004', companyName: 'Tata Consultancy Services (TCS)', role: 'Ninja/Digital Developer', packageText: '₹3.6 - ₹7.0 LPA', location: 'Pune, India', eligibility: 'CGPA >= 6.5, All streams', deadline: 'Oct 25, 2026', status: 'NOT_ELIGIBLE' }
];

export const mockCollegeEvents: CollegeEvent[] = [
  { id: 'EVT-101', title: 'Inter-Collegiate Coding Hackathon 2026', dateText: 'Nov 02', timeText: '09:00 AM', venue: 'Main Computer Lab', category: 'TECHNICAL', isRegistered: false },
  { id: 'EVT-102', title: 'Annual Cultural Fest - MUC FEST \'26', dateText: 'Nov 12', timeText: '04:00 PM', venue: 'College Grounds & Auditorium', category: 'CULTURAL', isRegistered: true },
  { id: 'EVT-103', title: 'Inter-Departmental Cricket Tournament', dateText: 'Nov 15', timeText: '08:30 AM', venue: 'Sports Arena', category: 'SPORTS', isRegistered: false },
  { id: 'EVT-104', title: 'Workshop on Cyber Security & Ethical Hacking', dateText: 'Oct 29', timeText: '10:30 AM', venue: 'Seminar Hall B', category: 'TECHNICAL', isRegistered: false }
] as any;

export const mockCertificateRequests: CertificateRequest[] = [
  { id: 'REQ-2810', certificateType: 'Bonafide Certificate', reason: 'For applying to State Scholarship Portal', submittedDate: 'Oct 20, 2026', status: 'ISSUED', downloadUrl: 'https://mucollege.edu.in/certificates/sample.pdf' },
  { id: 'REQ-2940', certificateType: 'Attendance Certificate', reason: 'For attending regional sports tournament', submittedDate: 'Oct 26, 2026', status: 'PENDING' }
];

