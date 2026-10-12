import {
  AcademicYear,
  Semester,
  Department,
  Course,
  Subject,
  ClassEntity,
  SectionEntity,
  Student,
  Faculty,
  AttendanceRecord,
  StudentFeeAccount,
  Result,
  User,
  Role,
  AdminAssignment,
  AuditLog,
  FeePayment,
  TimetableEntry,
  Examination,
  FeeStructure,
  Scholarship,
  Fine,
  LibraryBook,
  LibraryBookCopy,
  LibraryMember,
  LibraryLoan,
  LibraryReservation,
  LibraryResolutionRecord,
  Company,
  PlacementDrive,
  JobRole,
  PlacementProfile,
  PlacementApplication,
  PlacementRound,
  RoundResult,
  PlacementOffer,
  CertificateType,
  CertificateRequest,
  CertificateRecord,
  CertificateHistory,
  EventType,
  EventTargeting,
  Event,
  EventRegistration,
  EventAttendance,
  EventHistory,
  Notification,
  NotificationDelivery,
  NotificationHistory,
  Permission,
  BackupRecord
} from "../../types/domain";

export const mockAcademicYears: AcademicYear[] = [
  { id: "ay-1", code: "2026-27", startDate: "2026-06-01", endDate: "2027-05-31", isActive: true, status: "ACTIVE" },
  { id: "ay-2", code: "2025-26", startDate: "2025-06-01", endDate: "2026-05-31", isActive: false, status: "ACTIVE" },
  { id: "ay-3", code: "2024-25", startDate: "2024-06-01", endDate: "2025-05-31", isActive: false, status: "ARCHIVED" }
];

export const mockSemesters: Semester[] = [
  { id: "sem-1", academicYearId: "ay-1", term: "Odd Term", number: 1, startDate: "2026-06-01", endDate: "2026-11-30", isActive: true, status: "ACTIVE" },
  { id: "sem-2", academicYearId: "ay-1", term: "Even Term", number: 2, startDate: "2026-12-01", endDate: "2027-05-31", isActive: false, status: "ACTIVE" },
  { id: "sem-3", academicYearId: "ay-1", term: "Odd Term", number: 3, startDate: "2026-06-01", endDate: "2026-11-30", isActive: true, status: "ACTIVE" },
  { id: "sem-4", academicYearId: "ay-1", term: "Even Term", number: 4, startDate: "2026-12-01", endDate: "2027-05-31", isActive: false, status: "ACTIVE" },
  { id: "sem-5", academicYearId: "ay-1", term: "Odd Term", number: 5, startDate: "2026-06-01", endDate: "2026-11-30", isActive: true, status: "ACTIVE" },
  { id: "sem-6", academicYearId: "ay-1", term: "Even Term", number: 6, startDate: "2026-12-01", endDate: "2027-05-31", isActive: false, status: "ACTIVE" }
];

export const mockDepartments: Department[] = [
  { id: "dept-bca", code: "BCA", name: "Computer Applications", hodId: "fac-1", status: "ACTIVE" },
  { id: "dept-bsc", code: "B.Sc(CS)", name: "Computer Science", hodId: "fac-3", status: "ACTIVE" },
  { id: "dept-bcom", code: "B.Com", name: "Commerce", hodId: "fac-4", status: "ACTIVE" },
  { id: "dept-bba", code: "BBA", name: "Business Administration", hodId: "fac-5", status: "ACTIVE" },
  { id: "dept-eco", code: "Eco", name: "Economics", status: "ACTIVE" },
  { id: "dept-math", code: "Math", name: "Mathematics", status: "ACTIVE" },
  { id: "dept-eng", code: "Eng", name: "English", status: "ACTIVE" },
  { id: "dept-micro", code: "Micro", name: "Microbiology", status: "ACTIVE" },
  { id: "dept-ds", code: "DS", name: "Data Science", status: "ACTIVE" },
  { id: "dept-it", code: "IT", name: "Information Technology", status: "ACTIVE" }
];

export const mockCourses: Course[] = [
  // Shift I (Aided)
  { id: "course-ba-eco", departmentId: "dept-eco", code: "B.A.(Corp Eco)", name: "Bachelor of Arts in Corporate Economics", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_I", status: "ACTIVE" },
  { id: "course-bsc-math", departmentId: "dept-math", code: "B.Sc(Math)", name: "Bachelor of Science in Mathematics", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_I", status: "ACTIVE" },
  { id: "course-bsc-cs", departmentId: "dept-bsc", code: "B.Sc(CS)", name: "Bachelor of Science in Computer Science", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_I", status: "ACTIVE" },
  { id: "course-bcom-corp", departmentId: "dept-bcom", code: "B.Com(Corp)", name: "Bachelor of Commerce (Corporate Secretaryship)", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_I", status: "ACTIVE" },
  { id: "course-bcom-gen", departmentId: "dept-bcom", code: "B.Com", name: "Bachelor of Commerce (General)", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_I", status: "ACTIVE" },

  // Shift II (Self-Financing)
  { id: "course-ba-eng", departmentId: "dept-eng", code: "B.A.(Eng)", name: "Bachelor of Arts in English", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_II", status: "ACTIVE" },
  { id: "course-bba", departmentId: "dept-bba", code: "BBA", name: "Bachelor of Business Administration", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_II", status: "ACTIVE" },
  { id: "course-bca", departmentId: "dept-bca", code: "BCA", name: "Bachelor of Computer Applications", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_II", status: "ACTIVE" },
  { id: "course-bcom-ca", departmentId: "dept-bcom", code: "B.Com(CA)", name: "Bachelor of Commerce (Computer Applications)", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_II", status: "ACTIVE" },
  { id: "course-bsc-micro", departmentId: "dept-micro", code: "B.Sc(Micro)", name: "Bachelor of Science in Microbiology", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_II", status: "ACTIVE" },
  { id: "course-bsc-ds", departmentId: "dept-ds", code: "B.Sc(DS)", name: "Bachelor of Science in Data Science", degree: "UG", regulation: "Reg-2024", durationYears: 3, totalSemesters: 6, shift: "SHIFT_II", status: "ACTIVE" },
  
  // PG (Shift II)
  { id: "course-msc-it", departmentId: "dept-it", code: "M.Sc(IT)", name: "Master of Science in Information Technology", degree: "PG", regulation: "Reg-2024", durationYears: 2, totalSemesters: 4, shift: "SHIFT_II", status: "ACTIVE" },
  { id: "course-msc-math", departmentId: "dept-math", code: "M.Sc(Math)", name: "Master of Science in Mathematics", degree: "PG", regulation: "Reg-2024", durationYears: 2, totalSemesters: 4, shift: "SHIFT_II", status: "ACTIVE" }
];

export const mockFaculty: Faculty[] = [
  { id: "fac-1", employeeId: "EMP-001", firstName: "Dr. Ayesha", lastName: "Begum", email: "ayesha@muc.edu", phone: "9998887771", departmentId: "dept-bca", designation: "Head of Department", specialization: "Web Technology", status: "ACTIVE" },
  { id: "fac-2", employeeId: "EMP-002", firstName: "Mr. Imran", lastName: "Khan", email: "imran@muc.edu", phone: "9998887772", departmentId: "dept-bca", designation: "Assistant Professor", specialization: "Programming", status: "ACTIVE" },
  { id: "fac-3", employeeId: "EMP-003", firstName: "Dr. Saleem", lastName: "Basha", email: "saleem@muc.edu", phone: "9998887773", departmentId: "dept-bsc", designation: "Head of Department", specialization: "Data Science", status: "ACTIVE" },
  { id: "fac-4", employeeId: "EMP-004", firstName: "Prof. Zubaida", lastName: "Fathima", email: "zubaida@muc.edu", phone: "9998887774", departmentId: "dept-bcom", designation: "Head of Department", specialization: "Accounting", status: "ACTIVE" },
  { id: "fac-5", employeeId: "EMP-005", firstName: "Dr. Tariq", lastName: "Anwar", email: "tariq@muc.edu", phone: "9998887775", departmentId: "dept-bba", designation: "Head of Department", specialization: "Management", status: "ACTIVE" }
];

export const mockSubjects: Subject[] = [
  { id: "sub-bca-101", courseId: "course-bca", semesterNumber: 1, code: "BCA101", name: "Programming in C", credits: 4, type: "CORE", facultyIds: ["fac-2"], status: "ACTIVE" },
  { id: "sub-bca-102", courseId: "course-bca", semesterNumber: 1, code: "BCA102", name: "Web Technology", credits: 3, type: "CORE", facultyIds: ["fac-1"], status: "ACTIVE" },
  { id: "sub-bca-103", courseId: "course-bca", semesterNumber: 1, code: "BCA103", name: "Mathematical Foundations", credits: 4, type: "CORE", facultyIds: [], status: "ACTIVE" },
  { id: "sub-bcom-101", courseId: "course-bcom-gen", semesterNumber: 1, code: "BCM101", name: "Financial Accounting I", credits: 4, type: "CORE", facultyIds: ["fac-4"], status: "ACTIVE" }
];

export const mockClasses: ClassEntity[] = [
  { id: "class-bca-1", academicYearId: "ay-1", courseId: "course-bca", semesterNumber: 1, code: "BCA I Year", status: "ACTIVE" },
  { id: "class-bca-2", academicYearId: "ay-1", courseId: "course-bca", semesterNumber: 3, code: "BCA II Year", status: "ACTIVE" },
  { id: "class-bcom-1", academicYearId: "ay-1", courseId: "course-bcom-gen", semesterNumber: 1, code: "B.Com I Year", status: "ACTIVE" }
];

export const mockSections: SectionEntity[] = [
  { id: "sec-bca-1", classId: "class-bca-1", name: "General", advisorId: "fac-2", status: "ACTIVE" },
  { id: "sec-bca-2", classId: "class-bca-2", name: "General", advisorId: "fac-1", status: "ACTIVE" },
  { id: "sec-bcom-1", classId: "class-bcom-1", name: "General", advisorId: "fac-4", status: "ACTIVE" },
  { id: "sec-bsc-1", classId: "class-bsc-1", name: "Shift 1 Section", advisorId: "fac-3", status: "ACTIVE" }
];

export const mockStudents: Student[] = [
  { id: "stu-1", registrationNumber: "25UCA001", admissionNumber: "ADM-25-001", firstName: "Mohammed", lastName: "Ali", email: "m.ali@student.muc.edu", phone: "9876543210", dateOfBirth: "2007-01-01", gender: "Male", bloodGroup: "O+", guardianName: "Ahmed Ali", guardianPhone: "9876543211", departmentId: "dept-bca", courseId: "course-bca", currentSemester: 1, sectionId: "sec-bca-1", status: "ACTIVE" },
  { id: "stu-2", registrationNumber: "25UCA002", admissionNumber: "ADM-25-002", firstName: "Fatima", lastName: "Zahra", email: "f.zahra@student.muc.edu", phone: "9876543212", dateOfBirth: "2007-02-02", gender: "Female", bloodGroup: "A+", guardianName: "Omer Farooq", guardianPhone: "9876543213", departmentId: "dept-bca", courseId: "course-bca", currentSemester: 1, sectionId: "sec-bca-1", status: "ACTIVE" },
  { id: "stu-3", registrationNumber: "25UCA003", admissionNumber: "ADM-25-003", firstName: "Abdul", lastName: "Rahman", email: "a.rahman@student.muc.edu", phone: "9876543214", dateOfBirth: "2007-03-03", gender: "Male", bloodGroup: "B+", guardianName: "Kareem", guardianPhone: "9876543215", departmentId: "dept-bca", courseId: "course-bca", currentSemester: 1, sectionId: "sec-bca-1", status: "ACTIVE" },
  { id: "stu-4", registrationNumber: "25UCA004", admissionNumber: "ADM-25-004", firstName: "Ayesha", lastName: "Siddiqa", email: "a.siddiqa@student.muc.edu", phone: "9876543216", dateOfBirth: "2007-04-04", gender: "Female", bloodGroup: "O-", guardianName: "Yousuf", guardianPhone: "9876543217", departmentId: "dept-bca", courseId: "course-bca", currentSemester: 1, sectionId: "sec-bca-1", status: "ACTIVE" },
  { id: "stu-5", registrationNumber: "25UCM001", admissionNumber: "ADM-25-005", firstName: "Syed", lastName: "Ibrahim", email: "s.ibrahim@student.muc.edu", phone: "9876543218", dateOfBirth: "2007-05-05", gender: "Male", bloodGroup: "AB+", guardianName: "Syed Abbas", guardianPhone: "9876543219", departmentId: "dept-bcom", courseId: "course-bcom-gen", currentSemester: 1, sectionId: "sec-bcom-1", status: "ACTIVE" },
  { id: "stu-6", registrationNumber: "24UCA001", admissionNumber: "ADM-24-001", firstName: "Zainab", lastName: "Bi", email: "zainab@student.muc.edu", phone: "9876543220", dateOfBirth: "2006-06-06", gender: "Female", bloodGroup: "O+", guardianName: "Hussain", guardianPhone: "9876543221", departmentId: "dept-bca", courseId: "course-bca", currentSemester: 3, sectionId: "sec-bca-2", status: "ACTIVE" }
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  { id: "att-1", classId: "class-1", studentId: "stu-1", subjectId: "sub-bca-101", sectionId: "sec-bca-1", semesterNumber: 1, date: "2026-06-10", period: "H1", status: "PRESENT", facultyId: "fac-2", recordedBy: "fac-2" },
  { id: "att-2", classId: "class-1", studentId: "stu-2", subjectId: "sub-bca-101", sectionId: "sec-bca-1", semesterNumber: 1, date: "2026-06-10", period: "H1", status: "PRESENT", facultyId: "fac-2", recordedBy: "fac-2" },
  { id: "att-3", classId: "class-1", studentId: "stu-1", subjectId: "sub-bca-102", sectionId: "sec-bca-1", semesterNumber: 1, date: "2026-06-10", period: "H2", status: "ABSENT", facultyId: "fac-1", recordedBy: "fac-1" },
  { id: "att-4", classId: "class-1", studentId: "stu-2", subjectId: "sub-bca-102", sectionId: "sec-bca-1", semesterNumber: 1, date: "2026-06-10", period: "H2", status: "PRESENT", facultyId: "fac-1", recordedBy: "fac-1" }
];

// --- Finance & Fee Mock Data ---

export const mockFeeStructures: FeeStructure[] = [
  {
    id: "fs-bca-s1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    courseId: "course-bca",
    shift: "SHIFT_II",
    studentCategory: "GENERAL",
    components: [
      { id: "comp-1", name: "Tuition Fee", amount: 15000, isMandatory: true },
      { id: "comp-2", name: "Lab Fee", amount: 2000, isMandatory: true },
      { id: "comp-3", name: "Library Fee", amount: 1000, isMandatory: true }
    ],
    totalAmount: 18000,
    status: "ACTIVE"
  },
  {
    id: "fs-bsc-s1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    courseId: "course-bsc-cs",
    shift: "SHIFT_I",
    studentCategory: "GENERAL",
    components: [
      { id: "comp-4", name: "Tuition Fee (Aided)", amount: 5500, isMandatory: true },
      { id: "comp-5", name: "Computer Lab Fee", amount: 2000, isMandatory: true },
      { id: "comp-6", name: "Special Amenities", amount: 1000, isMandatory: true }
    ],
    totalAmount: 8500,
    status: "ACTIVE"
  },
  {
    id: "fs-bcom-s1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    courseId: "course-bcom-gen",
    shift: "SHIFT_I",
    studentCategory: "GENERAL",
    components: [
      { id: "comp-7", name: "Tuition Fee (Aided)", amount: 5200, isMandatory: true },
      { id: "comp-8", name: "Library & Reading Room", amount: 1000, isMandatory: true },
      { id: "comp-9", name: "Sports & Association", amount: 1000, isMandatory: true }
    ],
    totalAmount: 7200,
    status: "ACTIVE"
  },
  {
    id: "fs-bba-s1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    courseId: "course-bba",
    shift: "SHIFT_II",
    studentCategory: "GENERAL",
    components: [
      { id: "comp-10", name: "Tuition Fee", amount: 14000, isMandatory: true },
      { id: "comp-11", name: "Management Activity Fee", amount: 1500, isMandatory: true },
      { id: "comp-12", name: "Library & Digital Resources", amount: 1000, isMandatory: true }
    ],
    totalAmount: 16500,
    status: "ACTIVE"
  },
  {
    id: "fs-msc-s1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    courseId: "course-msc-it",
    shift: "SHIFT_II",
    studentCategory: "GENERAL",
    components: [
      { id: "comp-13", name: "Tuition Fee", amount: 17000, isMandatory: true },
      { id: "comp-14", name: "Advanced Lab & Research", amount: 3500, isMandatory: true },
      { id: "comp-15", name: "Library & E-Journal", amount: 1500, isMandatory: true }
    ],
    totalAmount: 22000,
    status: "ACTIVE"
  }
];

export const mockFeeAccounts: StudentFeeAccount[] = [
  {
    id: "fa-stu1-sem1",
    studentId: "stu-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    feeStructureId: "fs-bca-s1",
    totalAssessed: 18000,
    scholarshipAmount: 0,
    fineAmount: 0,
    netPayable: 18000,
    paidAmount: 18000,
    outstandingAmount: 0,
    dueDate: "2026-07-01",
    status: "PAID"
  },
  {
    id: "fa-stu2-sem1",
    studentId: "stu-2",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    feeStructureId: "fs-bca-s1",
    totalAssessed: 18000,
    scholarshipAmount: 3000,
    fineAmount: 500,
    netPayable: 15500,
    paidAmount: 10000,
    outstandingAmount: 5500,
    dueDate: "2026-07-01",
    status: "PARTIALLY_PAID"
  },
  {
    id: "fa-stu3-sem1",
    studentId: "stu-3",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    feeStructureId: "fs-bca-s1",
    totalAssessed: 18000,
    scholarshipAmount: 5000,
    fineAmount: 0,
    netPayable: 13000,
    paidAmount: 0,
    outstandingAmount: 13000,
    dueDate: "2026-07-15",
    status: "UNPAID"
  },
  {
    id: "fa-stu4-sem1",
    studentId: "stu-4",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    feeStructureId: "fs-bca-s1",
    totalAssessed: 18000,
    scholarshipAmount: 4000,
    fineAmount: 0,
    netPayable: 14000,
    paidAmount: 14000,
    outstandingAmount: 0,
    dueDate: "2026-07-01",
    status: "PAID"
  },
  {
    id: "fa-stu5-sem1",
    studentId: "stu-5",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    feeStructureId: "fs-bcom-s1",
    totalAssessed: 7200,
    scholarshipAmount: 0,
    fineAmount: 200,
    netPayable: 7400,
    paidAmount: 0,
    outstandingAmount: 7400,
    dueDate: "2026-06-30",
    status: "OVERDUE"
  },
  {
    id: "fa-stu6-sem3",
    studentId: "stu-6",
    academicYearId: "ay-1",
    semesterId: "sem-3",
    feeStructureId: "fs-bca-s1",
    totalAssessed: 18500,
    scholarshipAmount: 0,
    fineAmount: 0,
    netPayable: 18500,
    paidAmount: 18500,
    outstandingAmount: 0,
    dueDate: "2026-07-01",
    status: "PAID"
  }
];

export const mockFeePayments: FeePayment[] = [
  {
    id: "pay-1",
    studentFeeAccountId: "fa-stu1-sem1",
    studentId: "stu-1",
    amount: 18000,
    paymentDate: "2026-06-15",
    paymentMethod: "ONLINE_GATEWAY",
    receiptNumber: "RCPT-2026-001",
    transactionId: "TXN-987654321",
    status: "SUCCESS",
    collectedBy: "system"
  },
  {
    id: "pay-2",
    studentFeeAccountId: "fa-stu2-sem1",
    studentId: "stu-2",
    amount: 10000,
    paymentDate: "2026-06-20",
    paymentMethod: "CASH",
    receiptNumber: "RCPT-2026-002",
    status: "SUCCESS",
    collectedBy: "masteradmin"
  },
  {
    id: "pay-3",
    studentFeeAccountId: "fa-stu4-sem1",
    studentId: "stu-4",
    amount: 14000,
    paymentDate: "2026-06-25",
    paymentMethod: "UPI",
    receiptNumber: "RCPT-2026-003",
    transactionId: "UPI-440219842",
    status: "SUCCESS",
    collectedBy: "system"
  },
  {
    id: "pay-4",
    studentFeeAccountId: "fa-stu6-sem3",
    studentId: "stu-6",
    amount: 18500,
    paymentDate: "2026-06-28",
    paymentMethod: "ONLINE_GATEWAY",
    receiptNumber: "RCPT-2026-004",
    transactionId: "TXN-987654399",
    status: "SUCCESS",
    collectedBy: "system"
  }
];

export const mockScholarships: Scholarship[] = [
  {
    id: "schol-1",
    studentFeeAccountId: "fa-stu2-sem1",
    studentId: "stu-2",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 3000,
    reason: "Merit Scholarship (Top 5% in Higher Secondary)",
    status: "APPROVED",
    grantedBy: "masteradmin"
  },
  {
    id: "schol-2",
    studentFeeAccountId: "fa-stu3-sem1",
    studentId: "stu-3",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 5000,
    reason: "First Graduate Scheme State Benefit",
    status: "APPROVED",
    grantedBy: "masteradmin"
  },
  {
    id: "schol-3",
    studentFeeAccountId: "fa-stu4-sem1",
    studentId: "stu-4",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 4000,
    reason: "Minority Community Welfare Scholarship",
    status: "APPROVED",
    grantedBy: "masteradmin"
  },
  {
    id: "schol-4",
    studentFeeAccountId: "fa-stu5-sem1",
    studentId: "stu-5",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 2500,
    reason: "Inter-Collegiate Sports Excellence Grant",
    status: "APPROVED",
    grantedBy: "masteradmin"
  }
];

export const mockFines: Fine[] = [
  {
    id: "fine-1",
    studentFeeAccountId: "fa-stu2-sem1",
    studentId: "stu-2",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 500,
    source: "LATE_PAYMENT",
    reason: "Late fee submission past grace period",
    status: "APPLIED",
    createdAt: "2026-07-05"
  },
  {
    id: "fine-2",
    studentFeeAccountId: "fa-stu2-sem1",
    studentId: "stu-2",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 1000,
    source: "ATTENDANCE",
    reason: "Attendance Condonation (68.5% Attendance, Sem 1)",
    status: "APPLIED",
    createdAt: "2026-09-10"
  },
  {
    id: "fine-3",
    studentFeeAccountId: "fa-stu5-sem1",
    studentId: "stu-5",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 200,
    source: "LATE_PAYMENT",
    reason: "Semester fee payment deadline missed",
    status: "APPLIED",
    createdAt: "2026-07-02"
  },
  {
    id: "fine-4",
    studentFeeAccountId: "fa-stu1-sem1",
    studentId: "stu-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 150,
    source: "OTHER",
    reason: "Library book overdue fine (15 days)",
    status: "APPLIED",
    createdAt: "2026-08-30"
  },
  {
    id: "fine-5",
    studentFeeAccountId: "fa-stu3-sem1",
    studentId: "stu-3",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    amount: 350,
    source: "OTHER",
    reason: "Laboratory equipment glass replacement charge",
    status: "APPLIED",
    createdAt: "2026-08-18"
  }
];

export const mockTimetableEntries: TimetableEntry[] = [
  {
    id: "tt-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    shift: "SHIFT_II",
    dayOfWeek: "Monday",
    period: "H1",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-101",
    facultyId: "fac-2"
  },
  {
    id: "tt-2",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    shift: "SHIFT_II",
    dayOfWeek: "Monday",
    period: "H2",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-102",
    facultyId: "fac-1"
  },
  {
    id: "tt-3",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    shift: "SHIFT_I",
    dayOfWeek: "Tuesday",
    period: "H1",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-103",
    facultyId: "fac-3"
  }
];

// --- Examinations & Results Mock Data ---

export const mockExaminations: Examination[] = [
  {
    id: "exam-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    examinationType: "CIA_I",
    courseId: "course-bca",
    classId: "class-bca-1",
    subjectId: "sub-bca-101",
    shift: "SHIFT_II",
    examDate: "2026-08-15",
    startTime: "01:30",
    endTime: "03:30",
    status: "COMPLETED"
  },
  {
    id: "exam-2",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    examinationType: "CIA_II",
    courseId: "course-bca",
    classId: "class-bca-1",
    subjectId: "sub-bca-102",
    shift: "SHIFT_II",
    examDate: "2026-09-28",
    startTime: "01:30",
    endTime: "03:30",
    status: "COMPLETED"
  },
  {
    id: "exam-3",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    examinationType: "SEMESTER_END",
    courseId: "course-bcom-gen",
    classId: "class-bcom-1",
    subjectId: "sub-bcom-101",
    shift: "SHIFT_I",
    examDate: "2026-11-20",
    startTime: "09:30",
    endTime: "12:30",
    status: "SCHEDULED"
  },
  {
    id: "exam-4",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    examinationType: "SEMESTER_END",
    courseId: "course-bca",
    classId: "class-bca-1",
    subjectId: "sub-bca-101",
    shift: "SHIFT_II",
    examDate: "2026-11-22",
    startTime: "01:30",
    endTime: "04:30",
    status: "SCHEDULED"
  },
  {
    id: "exam-5",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    examinationType: "CIA_I",
    courseId: "course-bsc-cs",
    classId: "class-bsc-1",
    subjectId: "sub-bca-103",
    shift: "SHIFT_I",
    examDate: "2026-08-18",
    startTime: "09:30",
    endTime: "11:30",
    status: "COMPLETED"
  }
];

export const mockResults: Result[] = [
  {
    id: "res-1",
    examinationId: "exam-1",
    studentId: "stu-1",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-101",
    marksObtained: 88,
    maxMarks: 100,
    grade: "A+",
    gradePoint: 8,
    resultStatus: "PASS",
    enteredBy: "masteradmin"
  },
  {
    id: "res-2",
    examinationId: "exam-1",
    studentId: "stu-2",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-101",
    marksObtained: 40,
    maxMarks: 100,
    grade: "C",
    gradePoint: 5,
    resultStatus: "PASS",
    enteredBy: "masteradmin"
  },
  {
    id: "res-3",
    examinationId: "exam-1",
    studentId: "stu-3",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-101",
    marksObtained: 76,
    maxMarks: 100,
    grade: "D",
    gradePoint: 8.5,
    resultStatus: "PASS",
    enteredBy: "masteradmin"
  },
  {
    id: "res-4",
    examinationId: "exam-1",
    studentId: "stu-4",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-101",
    marksObtained: 94,
    maxMarks: 100,
    grade: "O",
    gradePoint: 10,
    resultStatus: "PASS",
    enteredBy: "masteradmin"
  },
  {
    id: "res-5",
    examinationId: "exam-2",
    studentId: "stu-1",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-102",
    marksObtained: 85,
    maxMarks: 100,
    grade: "D+",
    gradePoint: 9,
    resultStatus: "PASS",
    enteredBy: "fac-1"
  },
  {
    id: "res-6",
    examinationId: "exam-2",
    studentId: "stu-2",
    courseId: "course-bca",
    classId: "class-bca-1",
    sectionId: "sec-bca-1",
    subjectId: "sub-bca-102",
    marksObtained: 68,
    maxMarks: 100,
    grade: "A",
    gradePoint: 7,
    resultStatus: "PASS",
    enteredBy: "fac-1"
  },
  {
    id: "res-7",
    examinationId: "exam-3",
    studentId: "stu-5",
    courseId: "course-bcom-gen",
    classId: "class-bcom-1",
    sectionId: "sec-bcom-1",
    subjectId: "sub-bcom-101",
    marksObtained: 81,
    maxMarks: 100,
    grade: "D+",
    gradePoint: 9,
    resultStatus: "PASS",
    enteredBy: "fac-4"
  }
];

// --- Platform & Super Admin Mock Data ---

export const mockRoles: Role[] = [
  { id: "role-1", name: "SUPER_ADMIN", description: "Platform Level Administrator with full root access", isSystem: true },
  { id: "role-2", name: "MASTER_ADMIN", description: "College Level Administrator overseeing all academic operations", isSystem: true },
  { id: "role-3", name: "DOMAIN_ADMIN", description: "Domain Level Administrator (Finance, Exams, Placements)", isSystem: false },
  { id: "role-4", name: "FACULTY", description: "Teaching faculty with class and attendance marking privileges", isSystem: true },
  { id: "role-5", name: "STUDENT", description: "Enrolled student with portal access", isSystem: true }
];

export const mockUsers: User[] = [
  { id: "user-1", username: "superadmin", email: "superadmin@muc.edu", firstName: "Super", lastName: "Admin", status: "ACTIVE", lastLogin: "2026-09-29T10:00:00Z" },
  { id: "user-2", username: "masteradmin", email: "masteradmin@muc.edu", firstName: "Master", lastName: "Admin", status: "ACTIVE", lastLogin: "2026-09-29T09:30:00Z" },
  { id: "user-3", username: "feeadmin", email: "fees@muc.edu", firstName: "Kareem", lastName: "Ahmed", status: "ACTIVE", lastLogin: "2026-09-28T14:15:00Z" },
  { id: "user-4", username: "certadmin", email: "certs@muc.edu", firstName: "Farida", lastName: "Banu", status: "ACTIVE", lastLogin: "2026-09-28T11:00:00Z" },
  { id: "user-5", username: "eventadmin", email: "events@muc.edu", firstName: "Salman", lastName: "Farooq", status: "ACTIVE", lastLogin: "2026-09-27T16:45:00Z" },
  { id: "user-6", username: "libadmin", email: "librarian@muc.edu", firstName: "Irfan", lastName: "Sharif", status: "ACTIVE", lastLogin: "2026-09-29T08:30:00Z" }
];

export const mockAdminAssignments: AdminAssignment[] = [
  { id: "aa-1", userId: "user-1", roleId: "role-1", assignedBy: "system", assignedAt: "2025-06-01T10:00:00Z", status: "ACTIVE" },
  { id: "aa-2", userId: "user-2", roleId: "role-2", assignedBy: "system", assignedAt: "2025-06-01T10:00:00Z", status: "ACTIVE" },
  { id: "aa-3", userId: "user-3", roleId: "role-3", assignedBy: "masteradmin", assignedAt: "2025-06-15T10:00:00Z", status: "ACTIVE" },
  { id: "aa-4", userId: "user-4", roleId: "role-3", assignedBy: "masteradmin", assignedAt: "2025-06-15T10:00:00Z", status: "ACTIVE" },
  { id: "aa-5", userId: "user-5", roleId: "role-3", assignedBy: "masteradmin", assignedAt: "2025-06-15T10:00:00Z", status: "ACTIVE" },
  { id: "aa-6", userId: "user-6", roleId: "role-3", assignedBy: "masteradmin", assignedAt: "2025-06-15T10:00:00Z", status: "ACTIVE" }
];

export const mockPermissions: Permission[] = [
  { id: "perm-1", code: "users.manage", description: "Create, edit, and deactivate system users.", module: "System Users" },
  { id: "perm-2", code: "roles.manage", description: "Configure system and domain roles.", module: "Roles" },
  { id: "perm-3", code: "audit.view", description: "View system audit logs.", module: "Security" },
  { id: "perm-4", code: "system.backup", description: "Create and restore system backups.", module: "System" },
  { id: "perm-5", code: "students.manage", description: "Full control over student records.", module: "Academics" },
  { id: "perm-6", code: "faculty.manage", description: "Full control over faculty records.", module: "Academics" },
  { id: "perm-7", code: "attendance.manage", description: "Modify attendance and condonation.", module: "Attendance" },
  { id: "perm-8", code: "fees.manage", description: "Collect and configure fees.", module: "Fees" },
  { id: "perm-9", code: "exams.manage", description: "Schedule examinations and enter results.", module: "Examinations" },
  { id: "perm-10", code: "library.manage", description: "Catalog books and process loan returns.", module: "Library" },
  { id: "perm-11", code: "placements.manage", description: "Coordinate placement drives and student offers.", module: "Placements" },
  { id: "perm-12", code: "certificates.issue", description: "Approve and issue official certificates.", module: "Certificates" }
];

export const mockAuditLogs: AuditLog[] = [
  { id: "audit-1", actorId: "user-1", action: "CREATED_ROLE", entityType: "ROLE", entityId: "role-3", newValue: '{"name":"DOMAIN_ADMIN"}', timestamp: "2026-09-29T10:05:00Z", ipAddress: "192.168.1.1" },
  { id: "audit-2", actorId: "user-1", action: "ASSIGNED_ROLE", entityType: "ADMIN_ASSIGNMENT", entityId: "aa-2", newValue: '{"role":"MASTER_ADMIN"}', timestamp: "2026-09-29T10:10:00Z", ipAddress: "192.168.1.1" },
  { id: "audit-3", actorId: "user-2", action: "PUBLISHED_EVENT", entityType: "EVENT", entityId: "evt-1", timestamp: "2026-09-28T12:00:00Z", ipAddress: "192.168.1.5" },
  { id: "audit-4", actorId: "user-3", action: "COLLECTED_FEE", entityType: "FEE_PAYMENT", entityId: "pay-1", newValue: '{"amount":18000}', timestamp: "2026-09-28T14:30:00Z", ipAddress: "192.168.1.8" },
  { id: "audit-5", actorId: "user-4", action: "APPROVED_CERTIFICATE", entityType: "CERTIFICATE_REQUEST", entityId: "cert-req-1", timestamp: "2026-09-27T09:15:00Z", ipAddress: "192.168.1.12" },
  { id: "audit-6", actorId: "user-2", action: "SCHEDULED_EXAM", entityType: "EXAMINATION", entityId: "exam-3", timestamp: "2026-09-26T15:20:00Z", ipAddress: "192.168.1.5" },
  { id: "audit-7", actorId: "user-6", action: "ISSUED_BOOK", entityType: "LIBRARY_LOAN", entityId: "loan-1", timestamp: "2026-09-25T11:45:00Z", ipAddress: "192.168.1.14" },
  { id: "audit-8", actorId: "user-1", action: "CREATED_BACKUP", entityType: "BACKUP", entityId: "bkp-1", timestamp: "2026-09-25T02:00:00Z", ipAddress: "192.168.1.1" }
];

export const mockBackups: BackupRecord[] = [
  { id: "bkp-1", name: "Pre-Semester Start Snapshot", type: "FULL", status: "COMPLETED", sizeBytes: 104857600, createdAt: "2026-06-01T02:00:00Z", createdBy: "user-1" },
  { id: "bkp-2", name: "Weekly Automated DB Dump", type: "PARTIAL", status: "COMPLETED", sizeBytes: 25600000, createdAt: "2026-09-22T02:00:00Z", createdBy: "system" },
  { id: "bkp-3", name: "Monthly Academic Archives", type: "FULL", status: "COMPLETED", sizeBytes: 122880000, createdAt: "2026-09-01T02:00:00Z", createdBy: "user-1" },
  { id: "bkp-4", name: "Mid-Term Examination Milestone", type: "PARTIAL", status: "COMPLETED", sizeBytes: 16777216, createdAt: "2026-09-28T02:00:00Z", createdBy: "system" }
];

// --- Library Mock Data ---

export const mockLibraryBooks: LibraryBook[] = [
  {
    id: "lb-1",
    isbn: "978-0131103627",
    title: "The C Programming Language",
    author: "Brian W. Kernighan, Dennis M. Ritchie",
    publisher: "Prentice Hall",
    subject: "Computer Science",
    category: "Textbook",
    departmentId: "dept-bca",
    rack: "CS-A1"
  },
  {
    id: "lb-2",
    isbn: "978-0072465631",
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth",
    publisher: "McGraw-Hill",
    subject: "Database Management",
    category: "Textbook",
    departmentId: "dept-bca",
    rack: "CS-B2"
  },
  {
    id: "lb-3",
    isbn: "978-0132143011",
    title: "Computer Networks: A Systems Approach",
    author: "Larry L. Peterson, Bruce S. Davie",
    publisher: "Morgan Kaufmann",
    subject: "Computer Networks",
    category: "Textbook",
    departmentId: "dept-bsc",
    rack: "CS-C3"
  },
  {
    id: "lb-4",
    isbn: "978-9352865246",
    title: "Financial Accounting & Practice",
    author: "T.S. Reddy, A. Murthy",
    publisher: "Margham Publications",
    subject: "Commerce",
    category: "Textbook",
    departmentId: "dept-bcom",
    rack: "COM-D1"
  },
  {
    id: "lb-5",
    isbn: "978-0070669116",
    title: "Principles of Management",
    author: "P.C. Tripathi, P.N. Reddy",
    publisher: "Tata McGraw Hill",
    subject: "Management",
    category: "Textbook",
    departmentId: "dept-bba",
    rack: "BBA-E2"
  },
  {
    id: "lb-6",
    isbn: "978-0073383095",
    title: "Discrete Mathematics and Its Applications",
    author: "Kenneth H. Rosen",
    publisher: "McGraw-Hill",
    subject: "Mathematics",
    category: "Reference",
    departmentId: "dept-math",
    rack: "MAT-F1"
  }
];

export const mockLibraryBookCopies: LibraryBookCopy[] = [
  { id: "lbc-1", bookId: "lb-1", barcode: "BCA-C-001", status: "AVAILABLE" },
  { id: "lbc-2", bookId: "lb-1", barcode: "BCA-C-002", status: "ISSUED" },
  { id: "lbc-3", bookId: "lb-2", barcode: "BCA-DB-001", status: "AVAILABLE" },
  { id: "lbc-4", bookId: "lb-2", barcode: "BCA-DB-002", status: "ISSUED" },
  { id: "lbc-5", bookId: "lb-2", barcode: "BCA-DB-003", status: "AVAILABLE" },
  { id: "lbc-6", bookId: "lb-3", barcode: "CS-NET-001", status: "AVAILABLE" },
  { id: "lbc-7", bookId: "lb-3", barcode: "CS-NET-002", status: "ISSUED" },
  { id: "lbc-8", bookId: "lb-4", barcode: "BCM-FA-001", status: "AVAILABLE" },
  { id: "lbc-9", bookId: "lb-4", barcode: "BCM-FA-002", status: "AVAILABLE" },
  { id: "lbc-10", bookId: "lb-5", barcode: "BBA-MGT-001", status: "AVAILABLE" },
  { id: "lbc-11", bookId: "lb-6", barcode: "MAT-DM-001", status: "AVAILABLE" },
  { id: "lbc-12", bookId: "lb-6", barcode: "MAT-DM-002", status: "AVAILABLE" }
];

export const mockLibraryMembers: LibraryMember[] = [
  { id: "mem-stu-1", institutionalId: "stu-1", memberType: "STUDENT", activeLoansCount: 1, hasUnresolvedFines: false, clearanceStatus: "PENDING" },
  { id: "mem-stu-2", institutionalId: "stu-2", memberType: "STUDENT", activeLoansCount: 1, hasUnresolvedFines: false, clearanceStatus: "PENDING" },
  { id: "mem-stu-3", institutionalId: "stu-3", memberType: "STUDENT", activeLoansCount: 0, hasUnresolvedFines: false, clearanceStatus: "PENDING" },
  { id: "mem-stu-4", institutionalId: "stu-4", memberType: "STUDENT", activeLoansCount: 1, hasUnresolvedFines: false, clearanceStatus: "PENDING" },
  { id: "mem-stu-5", institutionalId: "stu-5", memberType: "STUDENT", activeLoansCount: 0, hasUnresolvedFines: false, clearanceStatus: "PENDING" },
  { id: "mem-fac-1", institutionalId: "fac-1", memberType: "FACULTY", activeLoansCount: 0, hasUnresolvedFines: false, clearanceStatus: "CLEARED" },
  { id: "mem-fac-2", institutionalId: "fac-2", memberType: "FACULTY", activeLoansCount: 0, hasUnresolvedFines: false, clearanceStatus: "CLEARED" }
];

export const mockLibraryLoans: LibraryLoan[] = [
  {
    id: "loan-1",
    memberId: "mem-stu-1",
    copyId: "lbc-2",
    issueDate: "2026-09-10T09:00:00Z",
    dueDate: "2026-09-24T17:00:00Z",
    renewalCount: 0,
    status: "ACTIVE",
    issuedBy: "libadmin"
  },
  {
    id: "loan-2",
    memberId: "mem-stu-2",
    copyId: "lbc-4",
    issueDate: "2026-09-15T11:00:00Z",
    dueDate: "2026-09-29T17:00:00Z",
    renewalCount: 1,
    status: "ACTIVE",
    issuedBy: "libadmin"
  },
  {
    id: "loan-3",
    memberId: "mem-stu-4",
    copyId: "lbc-7",
    issueDate: "2026-09-18T14:30:00Z",
    dueDate: "2026-10-02T17:00:00Z",
    renewalCount: 0,
    status: "ACTIVE",
    issuedBy: "libadmin"
  },
  {
    id: "loan-4",
    memberId: "mem-stu-1",
    copyId: "lbc-1",
    issueDate: "2026-08-01T10:00:00Z",
    dueDate: "2026-08-15T17:00:00Z",
    returnDate: "2026-08-14T15:00:00Z",
    renewalCount: 0,
    status: "RETURNED",
    issuedBy: "libadmin",
    acceptedBy: "libadmin"
  },
  {
    id: "loan-5",
    memberId: "mem-stu-3",
    copyId: "lbc-3",
    issueDate: "2026-08-10T11:00:00Z",
    dueDate: "2026-08-24T17:00:00Z",
    returnDate: "2026-08-22T16:00:00Z",
    renewalCount: 0,
    status: "RETURNED",
    issuedBy: "libadmin",
    acceptedBy: "libadmin"
  }
];

export const mockLibraryReservations: LibraryReservation[] = [
  {
    id: "resv-1",
    bookId: "lb-1",
    memberId: "mem-stu-3",
    queuePosition: 1,
    requestDate: "2026-09-20T10:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "resv-2",
    bookId: "lb-2",
    memberId: "mem-stu-4",
    queuePosition: 2,
    requestDate: "2026-09-22T14:00:00Z",
    status: "ACTIVE"
  }
];

export const mockLibraryResolutionRecords: LibraryResolutionRecord[] = [
  {
    id: "libres-1",
    loanId: "loan-1",
    memberId: "mem-stu-1",
    copyId: "lbc-2",
    resolutionType: "PAID_PRICE",
    penaltyAmount: 850,
    status: "RESOLVED",
    reportedDate: "2026-08-10T10:00:00Z"
  },
  {
    id: "libres-2",
    loanId: "loan-2",
    memberId: "mem-stu-2",
    copyId: "lbc-4",
    resolutionType: "REPLACEMENT_BOOK",
    status: "PENDING",
    reportedDate: "2026-09-28T11:00:00Z"
  }
];

// --- Placement Management Mock Data ---

export const mockCompanies: Company[] = [
  {
    id: "comp-1",
    name: "Tata Consultancy Services (TCS)",
    industry: "IT Services & Consulting",
    location: "Siruseri, Chennai",
    contactPerson: "R. Muralidharan (Lead Campus HR)",
    contactEmail: "campus.chennai@tcs.com"
  },
  {
    id: "comp-2",
    name: "Infosys Ltd",
    industry: "IT Services",
    location: "Electronic City, Bangalore",
    contactPerson: "Priya Varma (University Relations)",
    contactEmail: "talent.connect@infosys.com"
  },
  {
    id: "comp-3",
    name: "Zoho Corporation",
    industry: "SaaS & Product Development",
    location: "Estancia IT Park, Guduvanchery",
    contactPerson: "K. Vignesh (Hiring Specialist)",
    contactEmail: "campus@zohocorp.com"
  },
  {
    id: "comp-4",
    name: "Cognizant Technology Solutions",
    industry: "IT & Digital Operations",
    location: "CHIL SEZ, Coimbatore",
    contactPerson: "Deepa Natarajan (Campus Lead)",
    contactEmail: "campusrecruitment@cognizant.com"
  },
  {
    id: "comp-5",
    name: "Wipro Technologies",
    industry: "IT Services",
    location: "Sholinganallur, Chennai",
    contactPerson: "Arun Prakash (Talent Acquisition)",
    contactEmail: "elite.campus@wipro.com"
  }
];

export const mockPlacementDrives: PlacementDrive[] = [
  {
    id: "drive-1",
    companyId: "comp-1",
    title: "TCS Ignite & Smart Hiring 2026",
    driveType: "ON_CAMPUS",
    date: "2026-10-10T09:00:00Z",
    minCgpa: 6.5,
    maxBacklogs: 0,
    allowedCourseIds: ["course-bca", "course-bsc-cs", "course-bsc-math"],
    allowedDepartmentIds: []
  },
  {
    id: "drive-2",
    companyId: "comp-3",
    title: "Zoho Campus Graduate Trainee Drive",
    driveType: "ON_CAMPUS",
    date: "2026-10-22T09:00:00Z",
    minCgpa: 6.0,
    maxBacklogs: 1,
    allowedCourseIds: ["course-bca", "course-bsc-cs", "course-msc-it"],
    allowedDepartmentIds: []
  },
  {
    id: "drive-3",
    companyId: "comp-2",
    title: "Infosys Springboard Associate Hiring",
    driveType: "OFF_CAMPUS",
    date: "2026-11-05T09:00:00Z",
    minCgpa: 7.0,
    maxBacklogs: 0,
    allowedCourseIds: ["course-bca", "course-bsc-cs", "course-bcom-ca", "course-msc-it"],
    allowedDepartmentIds: []
  }
];

export const mockJobRoles: JobRole[] = [
  {
    id: "jrole-1",
    driveId: "drive-1",
    title: "Associate Software Trainee",
    salaryCtc: 336000,
    location: "Chennai / Siruseri",
    joiningDate: "2027-06-01T00:00:00Z"
  },
  {
    id: "jrole-2",
    driveId: "drive-1",
    title: "Digital Engineer",
    salaryCtc: 700000,
    location: "Pan India",
    joiningDate: "2027-06-01T00:00:00Z"
  },
  {
    id: "jrole-3",
    driveId: "drive-2",
    title: "Member Technical Staff (Software)",
    salaryCtc: 550000,
    location: "Chennai / Guduvanchery",
    joiningDate: "2027-05-15T00:00:00Z"
  },
  {
    id: "jrole-4",
    driveId: "drive-3",
    title: "Systems Associate",
    salaryCtc: 360000,
    location: "Bangalore / Mysore",
    joiningDate: "2027-07-01T00:00:00Z"
  }
];

export const mockPlacementProfiles: PlacementProfile[] = [
  {
    id: "prof-stu-1",
    studentId: "stu-1",
    registrationStatus: "REGISTERED",
    skills: ["Java", "SQL", "React", "Python"],
    certifications: ["AWS Cloud Practitioner", "Oracle SQL Certified"],
    activeBacklogs: 0,
    cgpa: 8.4
  },
  {
    id: "prof-stu-2",
    studentId: "stu-2",
    registrationStatus: "REGISTERED",
    skills: ["C++", "Data Structures", "HTML/CSS"],
    certifications: [],
    activeBacklogs: 0,
    cgpa: 6.8
  },
  {
    id: "prof-stu-3",
    studentId: "stu-3",
    registrationStatus: "REGISTERED",
    skills: ["JavaScript", "Python", "Linux Basics"],
    certifications: ["Python for Everybody (Coursera)"],
    activeBacklogs: 1,
    cgpa: 6.4
  },
  {
    id: "prof-stu-4",
    studentId: "stu-4",
    registrationStatus: "REGISTERED",
    skills: ["Full Stack Development", "Node.js", "MongoDB", "React"],
    certifications: ["HackerRank Problem Solving 5 Stars"],
    activeBacklogs: 0,
    cgpa: 9.1
  },
  {
    id: "prof-stu-5",
    studentId: "stu-5",
    registrationStatus: "REGISTERED",
    skills: ["Tally Prime", "Advanced Excel", "GST Filing", "Financial Analysis"],
    certifications: ["Tally Certified Professional"],
    activeBacklogs: 0,
    cgpa: 7.9
  },
  {
    id: "prof-stu-6",
    studentId: "stu-6",
    registrationStatus: "REGISTERED",
    skills: ["Data Analytics", "Power BI", "SQL", "Python"],
    certifications: ["Microsoft Power BI Analyst"],
    activeBacklogs: 0,
    cgpa: 8.2
  }
];

export const mockPlacementApplications: PlacementApplication[] = [
  {
    id: "app-1",
    studentId: "stu-1",
    driveId: "drive-1",
    status: "SELECTED",
    appliedDate: "2026-09-01T10:00:00Z"
  },
  {
    id: "app-2",
    studentId: "stu-2",
    driveId: "drive-1",
    status: "SHORTLISTED",
    appliedDate: "2026-09-02T11:00:00Z"
  },
  {
    id: "app-3",
    studentId: "stu-4",
    driveId: "drive-2",
    status: "SELECTED",
    appliedDate: "2026-09-05T09:30:00Z"
  },
  {
    id: "app-4",
    studentId: "stu-6",
    driveId: "drive-3",
    status: "APPLIED",
    appliedDate: "2026-09-12T14:00:00Z"
  },
  {
    id: "app-5",
    studentId: "stu-3",
    driveId: "drive-2",
    status: "REJECTED",
    appliedDate: "2026-09-06T10:00:00Z"
  }
];

export const mockPlacementRounds: PlacementRound[] = [
  {
    id: "round-1",
    driveId: "drive-1",
    name: "Online Cognitive & Coding Test",
    sequenceNumber: 1,
    date: "2026-10-10T09:30:00Z"
  },
  {
    id: "round-2",
    driveId: "drive-1",
    name: "Technical & HR Interview",
    sequenceNumber: 2,
    date: "2026-10-10T14:00:00Z"
  },
  {
    id: "round-3",
    driveId: "drive-2",
    name: "Written Aptitude & Basic C Programming",
    sequenceNumber: 1,
    date: "2026-10-22T09:30:00Z"
  },
  {
    id: "round-4",
    driveId: "drive-2",
    name: "Advanced Problem Solving & Tech HR",
    sequenceNumber: 2,
    date: "2026-10-22T14:00:00Z"
  }
];

export const mockRoundResults: RoundResult[] = [
  {
    id: "rr-1",
    applicationId: "app-1",
    roundId: "round-1",
    status: "PASS"
  },
  {
    id: "rr-2",
    applicationId: "app-1",
    roundId: "round-2",
    status: "PASS",
    remarks: "Exceptional core computer concepts and communication."
  },
  {
    id: "rr-3",
    applicationId: "app-2",
    roundId: "round-1",
    status: "PASS"
  },
  {
    id: "rr-4",
    applicationId: "app-3",
    roundId: "round-3",
    status: "PASS"
  },
  {
    id: "rr-5",
    applicationId: "app-3",
    roundId: "round-4",
    status: "PASS",
    remarks: "High problem solving aptitude demonstrated in coding tasks."
  }
];

export const mockPlacementOffers: PlacementOffer[] = [
  {
    id: "offer-1",
    applicationId: "app-1",
    jobRoleId: "jrole-1",
    offeredCtc: 336000,
    status: "ACCEPTED",
    issuedDate: "2026-09-22T10:00:00Z"
  },
  {
    id: "offer-2",
    applicationId: "app-3",
    jobRoleId: "jrole-3",
    offeredCtc: 550000,
    status: "ACCEPTED",
    issuedDate: "2026-09-25T14:00:00Z"
  },
  {
    id: "offer-3",
    applicationId: "app-4",
    jobRoleId: "jrole-4",
    offeredCtc: 360000,
    status: "PENDING",
    issuedDate: "2026-09-28T16:00:00Z"
  }
];

// --- Certificate Management Mock Data ---

export const mockCertificateTypes: CertificateType[] = [
  {
    id: "cert-type-1",
    name: "Bonafide Certificate",
    description: "Standard institutional bonafide proof for passport, bank, or bus pass purposes.",
    requiresFee: false,
    feeAmount: 0
  },
  {
    id: "cert-type-2",
    name: "Transfer Certificate (TC)",
    description: "Authoritative transfer document issued upon graduation or transfer.",
    requiresFee: true,
    feeAmount: 500
  },
  {
    id: "cert-type-3",
    name: "Conduct & Character Certificate",
    description: "Official testimonial of moral conduct and collegiate behavior.",
    requiresFee: false,
    feeAmount: 0
  },
  {
    id: "cert-type-4",
    name: "Medium of Instruction Certificate",
    description: "Formal certification that studies were undertaken in English medium.",
    requiresFee: true,
    feeAmount: 200
  },
  {
    id: "cert-type-5",
    name: "Faculty Experience Certificate",
    description: "Statement of academic service and tenure for faculty members.",
    requiresFee: false,
    feeAmount: 0
  }
];

export const mockCertificateRequests: CertificateRequest[] = [
  {
    id: "cert-req-1",
    requesterId: "stu-1",
    requesterType: "STUDENT",
    certificateTypeId: "cert-type-1",
    purpose: "State Government Scholarship Application Verification",
    status: "APPROVED",
    requestedDate: "2026-09-05T10:00:00Z",
    processedDate: "2026-09-06T11:00:00Z",
    processedBy: "certadmin"
  },
  {
    id: "cert-req-2",
    requesterId: "stu-2",
    requesterType: "STUDENT",
    certificateTypeId: "cert-type-2",
    purpose: "Higher Education Transfer to University Department",
    status: "REQUESTED",
    requestedDate: "2026-09-12T09:00:00Z"
  },
  {
    id: "cert-req-3",
    requesterId: "stu-4",
    requesterType: "STUDENT",
    certificateTypeId: "cert-type-4",
    purpose: "Foreign University Masters Program Admission",
    status: "APPROVED",
    requestedDate: "2026-09-18T14:30:00Z",
    processedDate: "2026-09-19T10:00:00Z",
    processedBy: "certadmin"
  },
  {
    id: "cert-req-4",
    requesterId: "stu-5",
    requesterType: "STUDENT",
    certificateTypeId: "cert-type-3",
    purpose: "Educational Loan Verification at Nationalized Bank",
    status: "REQUESTED",
    requestedDate: "2026-09-24T11:15:00Z"
  },
  {
    id: "cert-req-5",
    requesterId: "fac-2",
    requesterType: "FACULTY",
    certificateTypeId: "cert-type-5",
    purpose: "Ph.D. Registration Verification at Madras University",
    status: "APPROVED",
    requestedDate: "2026-09-20T09:00:00Z",
    processedDate: "2026-09-21T12:00:00Z",
    processedBy: "masteradmin"
  }
];

export const mockCertificateRecords: CertificateRecord[] = [
  {
    id: "cert-rec-1",
    certificateRequestId: "cert-req-1",
    certificateTypeId: "cert-type-1",
    requesterId: "stu-1",
    requesterType: "STUDENT",
    status: "ISSUED",
    issuedDate: "2026-09-06T11:05:00Z",
    pdfUrl: "/mock-certs/bonafide-stu-1.pdf"
  },
  {
    id: "cert-rec-2",
    certificateRequestId: "cert-req-3",
    certificateTypeId: "cert-type-4",
    requesterId: "stu-4",
    requesterType: "STUDENT",
    status: "ISSUED",
    issuedDate: "2026-09-19T10:05:00Z",
    pdfUrl: "/mock-certs/moi-stu-4.pdf"
  },
  {
    id: "cert-rec-3",
    certificateRequestId: "cert-req-5",
    certificateTypeId: "cert-type-5",
    requesterId: "fac-2",
    requesterType: "FACULTY",
    status: "ISSUED",
    issuedDate: "2026-09-21T12:05:00Z",
    pdfUrl: "/mock-certs/exp-fac-2.pdf"
  }
];

export const mockCertificateHistory: CertificateHistory[] = [
  {
    id: "cert-hist-1",
    certificateRecordId: "cert-rec-1",
    action: "ISSUED",
    date: "2026-09-06T11:05:00Z",
    performedBy: "certadmin",
    reason: "Initial Issuance following verification"
  },
  {
    id: "cert-hist-2",
    certificateRecordId: "cert-rec-2",
    action: "ISSUED",
    date: "2026-09-19T10:05:00Z",
    performedBy: "certadmin",
    reason: "Initial Issuance upon payment clearance"
  },
  {
    id: "cert-hist-3",
    certificateRecordId: "cert-rec-3",
    action: "ISSUED",
    date: "2026-09-21T12:05:00Z",
    performedBy: "masteradmin",
    reason: "Faculty service record certified"
  }
];

// --- Event Management Mock Data ---

export const mockEventTypes: EventType[] = [
  { id: "et-1", name: "Seminar", description: "Academic or professional seminar with invited speakers" },
  { id: "et-2", name: "Workshop", description: "Hands-on practical training session" },
  { id: "et-3", name: "Cultural", description: "Cultural festival or collegiate competition" },
  { id: "et-4", name: "Institutional", description: "College-wide institutional convocation or anniversary" },
  { id: "et-5", name: "Sports", description: "Inter-collegiate and intra-mural athletic championships" }
];

export const mockEvents: Event[] = [
  {
    id: "evt-1",
    name: "AI & Modern Cyber Security Summit 2026",
    description: "National seminar featuring industry speakers on AI defenses and cloud infrastructure.",
    eventTypeId: "et-1",
    organizer: "Computer Applications & CS Department",
    venue: "Main College Auditorium",
    date: "2026-10-15",
    startTime: "10:00",
    endTime: "13:30",
    capacity: 250,
    requiresRegistration: true,
    registrationDeadline: "2026-10-10",
    requiresApproval: true,
    approverId: "masteradmin",
    approvalStatus: "APPROVED",
    requiresFee: false,
    providesCertificate: true,
    certificateTypeId: "cert-type-1",
    status: "PUBLISHED",
    createdBy: "eventadmin",
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-11T12:00:00Z"
  },
  {
    id: "evt-2",
    name: "Faculty Development Program on Outcome-Based Education",
    description: "Modern pedagogical frameworks, Bloom's Taxonomy, and curriculum mapping.",
    eventTypeId: "et-2",
    organizer: "Internal Quality Assurance Cell (IQAC)",
    venue: "Smart Seminar Hall B",
    date: "2026-11-05",
    startTime: "09:00",
    endTime: "16:00",
    capacity: 80,
    requiresRegistration: true,
    requiresApproval: false,
    approvalStatus: "NOT_REQUIRED",
    requiresFee: true,
    feeAmount: 250,
    providesCertificate: true,
    status: "PUBLISHED",
    createdBy: "eventadmin",
    createdAt: "2026-09-12T09:00:00Z",
    updatedAt: "2026-09-12T09:00:00Z"
  },
  {
    id: "evt-3",
    name: "Inter-Collegiate Athletic Championships 2026",
    description: "Annual sports tournament across track, field, football, and cricket.",
    eventTypeId: "et-5",
    organizer: "Physical Education Department",
    venue: "MUC Main Sports Complex & Ground",
    date: "2026-10-25",
    startTime: "08:30",
    endTime: "17:30",
    capacity: 600,
    requiresRegistration: true,
    registrationDeadline: "2026-10-20",
    requiresApproval: true,
    approvalStatus: "APPROVED",
    requiresFee: false,
    providesCertificate: true,
    certificateTypeId: "cert-type-1",
    status: "PUBLISHED",
    createdBy: "fac-5",
    createdAt: "2026-09-13T10:00:00Z",
    updatedAt: "2026-09-15T11:00:00Z"
  },
  {
    id: "evt-4",
    name: "Commerce & Corporate Leaders Conclave",
    description: "Keynote addresses from chartered accountants, banking CFOs, and tax consultants.",
    eventTypeId: "et-1",
    organizer: "Department of Commerce",
    venue: "Commerce Conference Hall",
    date: "2026-11-18",
    startTime: "10:30",
    endTime: "15:00",
    capacity: 150,
    requiresRegistration: true,
    registrationDeadline: "2026-11-12",
    requiresApproval: true,
    approvalStatus: "APPROVED",
    requiresFee: false,
    providesCertificate: true,
    status: "PUBLISHED",
    createdBy: "fac-4",
    createdAt: "2026-09-18T09:00:00Z",
    updatedAt: "2026-09-18T09:00:00Z"
  },
  {
    id: "evt-5",
    name: "Cultural Festival - MUC Fest 2026",
    description: "Annual intra-collegiate fine arts, oratory, singing, and drama competition.",
    eventTypeId: "et-3",
    organizer: "Student Fine Arts Council",
    venue: "Open Air Amphitheatre",
    date: "2026-12-10",
    startTime: "09:00",
    endTime: "18:00",
    capacity: 1000,
    requiresRegistration: false,
    requiresApproval: true,
    approvalStatus: "PENDING",
    requiresFee: false,
    providesCertificate: true,
    status: "DRAFT",
    createdBy: "eventadmin",
    createdAt: "2026-09-22T10:00:00Z",
    updatedAt: "2026-09-22T10:00:00Z"
  }
];

export const mockEventTargetings: EventTargeting[] = [
  {
    id: "etg-1",
    eventId: "evt-1",
    targetType: "SPECIFIC_COURSE",
    targetIds: ["course-bca", "course-bsc-cs", "course-msc-it"]
  },
  {
    id: "etg-2",
    eventId: "evt-2",
    targetType: "ALL_FACULTY",
    targetIds: []
  },
  {
    id: "etg-3",
    eventId: "evt-3",
    targetType: "ALL_STUDENTS",
    targetIds: []
  },
  {
    id: "etg-4",
    eventId: "evt-4",
    targetType: "SPECIFIC_COURSE",
    targetIds: ["course-bcom-gen", "course-bcom-corp", "course-bcom-ca", "course-bba"]
  }
];

export const mockEventRegistrations: EventRegistration[] = [
  { id: "ereg-1", eventId: "evt-1", participantId: "stu-1", participantType: "STUDENT", status: "REGISTERED", registeredAt: "2026-09-12T10:30:00Z" },
  { id: "ereg-2", eventId: "evt-1", participantId: "stu-2", participantType: "STUDENT", status: "REGISTERED", registeredAt: "2026-09-12T10:45:00Z" },
  { id: "ereg-3", eventId: "evt-1", participantId: "stu-4", participantType: "STUDENT", status: "REGISTERED", registeredAt: "2026-09-13T11:20:00Z" },
  { id: "ereg-4", eventId: "evt-2", participantId: "fac-1", participantType: "FACULTY", status: "REGISTERED", registeredAt: "2026-09-14T09:15:00Z" },
  { id: "ereg-5", eventId: "evt-2", participantId: "fac-2", participantType: "FACULTY", status: "REGISTERED", registeredAt: "2026-09-14T09:30:00Z" },
  { id: "ereg-6", eventId: "evt-3", participantId: "stu-3", participantType: "STUDENT", status: "REGISTERED", registeredAt: "2026-09-16T14:00:00Z" }
];

export const mockEventAttendances: EventAttendance[] = [
  { id: "eatt-1", eventId: "evt-1", participantId: "stu-1", participantType: "STUDENT", status: "PRESENT", markedBy: "eventadmin", markedAt: "2026-10-15T10:15:00Z" },
  { id: "eatt-2", eventId: "evt-1", participantId: "stu-2", participantType: "STUDENT", status: "PRESENT", markedBy: "eventadmin", markedAt: "2026-10-15T10:18:00Z" },
  { id: "eatt-3", eventId: "evt-1", participantId: "stu-4", participantType: "STUDENT", status: "PRESENT", markedBy: "eventadmin", markedAt: "2026-10-15T10:20:00Z" },
  { id: "eatt-4", eventId: "evt-2", participantId: "fac-1", participantType: "FACULTY", status: "PRESENT", markedBy: "eventadmin", markedAt: "2026-11-05T09:10:00Z" },
  { id: "eatt-5", eventId: "evt-2", participantId: "fac-2", participantType: "FACULTY", status: "PRESENT", markedBy: "eventadmin", markedAt: "2026-11-05T09:12:00Z" },
  { id: "eatt-6", eventId: "evt-3", participantId: "stu-3", participantType: "STUDENT", status: "PRESENT", markedBy: "fac-5", markedAt: "2026-10-25T08:45:00Z" }
];

export const mockEventHistories: EventHistory[] = [
  { id: "ehist-1", eventId: "evt-1", action: "PUBLISHED", newStatus: "PUBLISHED", changedBy: "masteradmin", timestamp: "2026-09-11T12:00:00Z", reason: "Approved and published for student registration" },
  { id: "ehist-2", eventId: "evt-2", action: "PUBLISHED", newStatus: "PUBLISHED", changedBy: "eventadmin", timestamp: "2026-09-12T09:00:00Z", reason: "Published for all faculty registration" },
  { id: "ehist-3", eventId: "evt-3", action: "PUBLISHED", newStatus: "PUBLISHED", changedBy: "masteradmin", timestamp: "2026-09-15T11:00:00Z", reason: "Sports council schedule confirmed" }
];

// --- Notification Management Mock Data ---

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Semester Fees Payment Notice",
    message: "Students with pending semester dues are advised to settle accounts before the grace deadline.",
    category: "FEES",
    audience: "STUDENTS",
    targetScope: "ALL",
    targetIds: [],
    status: "PUBLISHED",
    publishedAt: "2026-09-10T09:00:00Z",
    createdBy: "feeadmin",
    createdAt: "2026-09-10T08:55:00Z",
    updatedAt: "2026-09-10T09:00:00Z"
  },
  {
    id: "notif-2",
    title: "AI & Cyber Security Summit Registration Open",
    message: "Registration for the national seminar is now accepting student applications via the portal.",
    category: "EVENT",
    audience: "STUDENTS",
    targetScope: "SPECIFIC_COURSE",
    targetIds: ["course-bca", "course-bsc-cs", "course-msc-it"],
    relatedEntityType: "EVENT",
    relatedEntityId: "evt-1",
    status: "PUBLISHED",
    publishedAt: "2026-09-11T12:05:00Z",
    createdBy: "eventadmin",
    createdAt: "2026-09-11T12:00:00Z",
    updatedAt: "2026-09-11T12:05:00Z"
  },
  {
    id: "notif-3",
    title: "CIA-I Exam Hall Tickets Released",
    message: "Continuous Internal Assessment I hall tickets and seat allotments are published in student logins.",
    category: "EXAMINATION",
    audience: "STUDENTS",
    targetScope: "ALL",
    targetIds: [],
    status: "PUBLISHED",
    publishedAt: "2026-09-15T08:00:00Z",
    createdBy: "masteradmin",
    createdAt: "2026-09-15T07:45:00Z",
    updatedAt: "2026-09-15T08:00:00Z"
  },
  {
    id: "notif-4",
    title: "TCS Ignite Campus Recruitment Registration",
    message: "Eligible final-year BCA, B.Sc CS, and Maths students must complete registration on TCS NextStep portal.",
    category: "PLACEMENT",
    audience: "STUDENTS",
    targetScope: "SPECIFIC_COURSE",
    targetIds: ["course-bca", "course-bsc-cs", "course-bsc-math"],
    status: "PUBLISHED",
    publishedAt: "2026-09-20T10:00:00Z",
    createdBy: "masteradmin",
    createdAt: "2026-09-20T09:30:00Z",
    updatedAt: "2026-09-20T10:00:00Z"
  },
  {
    id: "notif-5",
    title: "Upcoming ERP System Maintenance",
    message: "The college ERP will undergo scheduled cloud database maintenance this Sunday from 2 AM to 4 AM.",
    category: "SYSTEM",
    audience: "BOTH",
    targetScope: "ALL",
    targetIds: [],
    status: "PUBLISHED",
    publishedAt: "2026-09-22T08:00:00Z",
    createdBy: "superadmin",
    createdAt: "2026-09-22T07:30:00Z",
    updatedAt: "2026-09-22T08:00:00Z"
  }
];

export const mockNotificationDeliveries: NotificationDelivery[] = [
  { id: "ndel-1", notificationId: "notif-1", recipientId: "stu-2", recipientType: "STUDENT", status: "DELIVERED", deliveredAt: "2026-09-10T09:00:05Z" },
  { id: "ndel-2", notificationId: "notif-2", recipientId: "stu-1", recipientType: "STUDENT", status: "READ", deliveredAt: "2026-09-11T12:05:05Z", readAt: "2026-09-12T08:30:00Z" },
  { id: "ndel-3", notificationId: "notif-2", recipientId: "stu-4", recipientType: "STUDENT", status: "READ", deliveredAt: "2026-09-11T12:05:05Z", readAt: "2026-09-11T13:10:00Z" },
  { id: "ndel-4", notificationId: "notif-3", recipientId: "stu-1", recipientType: "STUDENT", status: "READ", deliveredAt: "2026-09-15T08:00:05Z", readAt: "2026-09-15T09:00:00Z" },
  { id: "ndel-5", notificationId: "notif-4", recipientId: "stu-1", recipientType: "STUDENT", status: "DELIVERED", deliveredAt: "2026-09-20T10:00:05Z" },
  { id: "ndel-6", notificationId: "notif-5", recipientId: "fac-1", recipientType: "FACULTY", status: "READ", deliveredAt: "2026-09-22T08:00:05Z", readAt: "2026-09-22T08:45:00Z" }
];

export const mockNotificationHistory: NotificationHistory[] = [
  { id: "nhist-1", notificationId: "notif-1", action: "PUBLISHED", timestamp: "2026-09-10T09:00:00Z", performedBy: "feeadmin" },
  { id: "nhist-2", notificationId: "notif-2", action: "PUBLISHED", timestamp: "2026-09-11T12:05:00Z", performedBy: "eventadmin" },
  { id: "nhist-3", notificationId: "notif-3", action: "PUBLISHED", timestamp: "2026-09-15T08:00:00Z", performedBy: "masteradmin" },
  { id: "nhist-4", notificationId: "notif-4", action: "PUBLISHED", timestamp: "2026-09-20T10:00:00Z", performedBy: "masteradmin" },
  { id: "nhist-5", notificationId: "notif-5", action: "PUBLISHED", timestamp: "2026-09-22T08:00:00Z", performedBy: "superadmin" }
];

// --- Official Circulars Mock Data ---

export interface OfficialCircular {
  id: string;
  referenceNumber: string;
  title: string;
  category: "ACADEMIC" | "EXAMINATION" | "FEES" | "ADMINISTRATION" | "EVENT";
  targetAudience: "ALL" | "STUDENTS" | "FACULTY" | "DEPARTMENTS";
  issuedDate: string;
  expiryDate?: string;
  signatory: string;
  signatoryDesignation: string;
  status: "ACTIVE" | "ARCHIVED";
  acknowledgementRate: string;
  summary: string;
}

export const mockOfficialCirculars: OfficialCircular[] = [
  {
    id: "circ-101",
    referenceNumber: "MUC/CIR/2026/044",
    title: "Mandatory Attendance Threshold (75%) for CIA and Semester Examinations",
    category: "ACADEMIC",
    targetAudience: "ALL",
    issuedDate: "2026-09-01",
    expiryDate: "2026-11-30",
    signatory: "Dr. K. H. Kaleemullah",
    signatoryDesignation: "Principal & Head of Institution",
    status: "ACTIVE",
    acknowledgementRate: "94%",
    summary: "Students must maintain a minimum of 75% attendance in each course component to appear for end semester university examinations without condonation penalties."
  },
  {
    id: "circ-102",
    referenceNumber: "MUC/CIR/2026/048",
    title: "Odd Semester Examination Fee Payment Schedule and Fine Waivers",
    category: "FEES",
    targetAudience: "STUDENTS",
    issuedDate: "2026-09-10",
    expiryDate: "2026-10-15",
    signatory: "Dr. Ayesha Begum",
    signatoryDesignation: "Bursar & Academic Dean",
    status: "ACTIVE",
    acknowledgementRate: "88%",
    summary: "Prescribed exam fees for Odd Semester 2026-27 must be remitted through the institutional web portal by October 15, 2026 without late penalty."
  },
  {
    id: "circ-103",
    referenceNumber: "MUC/CIR/2026/051",
    title: "Campus Recruitment Season 2026-27: TCS, Infosys, and Zoho Drive Briefing",
    category: "ADMINISTRATION",
    targetAudience: "STUDENTS",
    issuedDate: "2026-09-18",
    expiryDate: "2026-10-30",
    signatory: "Prof. S. R. Anwar",
    signatoryDesignation: "Head of Training & Placement Cell",
    status: "ACTIVE",
    acknowledgementRate: "92%",
    summary: "All eligible final year students enrolled in BCA, B.Sc CS, and B.Sc Maths are required to attend the mandatory placement orientation session in the Auditorium."
  },
  {
    id: "circ-104",
    referenceNumber: "MUC/CIR/2026/055",
    title: "Library Book Renewal & Return Notice Ahead of Mid-Term Audit",
    category: "ACADEMIC",
    targetAudience: "ALL",
    issuedDate: "2026-09-22",
    expiryDate: "2026-10-05",
    signatory: "Mr. Irfan Sharif",
    signatoryDesignation: "Chief Librarian",
    status: "ACTIVE",
    acknowledgementRate: "85%",
    summary: "All overdue volumes must be surrendered or renewed at the central library circulation desk before October 5 to prevent suspension of borrower privileges."
  },
  {
    id: "circ-105",
    referenceNumber: "MUC/CIR/2026/058",
    title: "College Holiday Declaration: Milad-un-Nabi Observance",
    category: "ADMINISTRATION",
    targetAudience: "ALL",
    issuedDate: "2026-09-25",
    expiryDate: "2026-09-30",
    signatory: "Dr. K. H. Kaleemullah",
    signatoryDesignation: "Principal & Head of Institution",
    status: "ACTIVE",
    acknowledgementRate: "97%",
    summary: "The college will observe a holiday on Monday, September 28 in view of Milad-un-Nabi. Regular classes for both Shift I and Shift II will resume on Tuesday."
  }
];
