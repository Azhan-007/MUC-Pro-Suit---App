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
