export type EntityStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "ARCHIVED";

// --- Academic Year & Semester ---
export interface AcademicYear {
  id: string;
  code: string; // e.g. "2025-26"
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: EntityStatus;
}

export interface Semester {
  id: string;
  academicYearId: string;
  term: string; // e.g. "Odd Term", "Even Term"
  number: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: EntityStatus;
}

// --- Institutional Entities ---
export interface Department {
  id: string;
  code: string;
  name: string;
  hodId?: string; // Faculty ID
  status: EntityStatus;
}

export interface Course {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  degree: string;
  regulation: string;
  durationYears: number;
  totalSemesters: number;
  shift: "SHIFT_I" | "SHIFT_II";
  status: EntityStatus;
}

export interface Subject {
  id: string;
  courseId: string;
  semesterNumber: number;
  code: string;
  name: string;
  credits: number;
  type: "CORE" | "ELECTIVE" | "LAB" | "PROJECT";
  facultyIds?: string[]; // Faculty allocations
  status: EntityStatus;
}

export interface ClassEntity {
  id: string;
  academicYearId: string;
  courseId: string;
  semesterNumber: number;
  code: string; // e.g. "BCA-I"
  status: EntityStatus;
}

export interface SectionEntity {
  id: string;
  classId: string;
  name: string; // e.g. "A", "B"
  advisorId?: string; // Faculty ID
  status: EntityStatus;
}

// --- Core People Entities ---
export interface Student {
  id: string;
  registrationNumber: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  guardianName: string;
  guardianPhone: string;
  departmentId: string;
  courseId: string;
  currentSemester: number;
  sectionId: string;
  academicClassId?: string;
  status: EntityStatus;
}

export interface Faculty {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: string;
  specialization: string;
  status: EntityStatus;
}

// --- Academic Management ---
export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  sectionId: string;
  semesterNumber: number;
  date: string;
  period: "H1" | "H2" | "H3" | "H4" | "H5";
  status: "PRESENT" | "ABSENT" | "ON_DUTY" | "LATE";
  facultyId: string;
  recordedBy: string; // Faculty/User ID
  isCorrected?: boolean;
}

export interface AttendanceSummary {
  studentId: string;
  semesterNumber: number;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
}

export interface TimetableEntry {
  id: string;
  academicYearId: string;
  semesterId: string;
  shift: "SHIFT_I" | "SHIFT_II";
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  period: "H1" | "H2" | "H3" | "H4" | "H5";
  courseId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  facultyId: string;
  roomId?: string; // Optional since rooms aren't strictly required yet
}

export interface Examination {
  id: string;
  academicYearId: string;
  semesterId: string;
  examinationType: "CIA_I" | "CIA_II" | "SEMESTER_END" | "PRACTICAL" | "PROJECT_VIVA";
  courseId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  shift: "SHIFT_I" | "SHIFT_II";
  examDate: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
}

export interface Result {
  id: string;
  examinationId: string;
  studentId: string;
  courseId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  marksObtained?: number; // Optional if ABSENT/NOT_ENTERED
  maxMarks: number;
  grade?: string;
  gradePoint?: number;
  resultStatus: "PASS" | "FAIL" | "ABSENT" | "WITHHELD" | "NOT_ENTERED";
  enteredBy?: string;
  updatedAt?: string;
  isCorrected?: boolean;
}

// --- Financial Management ---
export interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  isMandatory: boolean;
}

export interface FeeInstallmentConfig {
  installmentNumber: number;
  percentage: number; // e.g. 50 for 50%
  dueDate: string;
}

export interface FeeStructure {
  id: string;
  academicYearId: string;
  semesterId: string;
  courseId: string;
  shift: "SHIFT_I" | "SHIFT_II";
  studentCategory: "GENERAL" | "SC_ST" | "OBC" | "MANAGEMENT";
  components: FeeComponent[];
  totalAmount: number;
  installmentConfig?: FeeInstallmentConfig[];
  status: EntityStatus;
}

export interface FeeInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
}

export interface StudentFeeAccount {
  id: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  feeStructureId: string;
  totalAssessed: number;
  scholarshipAmount: number;
  fineAmount: number;
  netPayable: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  installments?: FeeInstallment[];
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
}

export interface FeePayment {
  id: string;
  studentFeeAccountId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "CASH" | "UPI" | "ONLINE_GATEWAY";
  receiptNumber: string;
  transactionId?: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  collectedBy: string; // User ID
  remarks?: string;
}

export interface Scholarship {
  id: string;
  studentFeeAccountId: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  amount: number;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  grantedBy?: string; // User ID
}

export interface Fine {
  id: string;
  studentFeeAccountId: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  amount: number;
  source: "ATTENDANCE" | "LATE_PAYMENT" | "OTHER";
  reason: string;
  status: "APPLIED" | "WAIVED";
  createdAt: string;
}

// --- Campus Services (Library) ---
export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  subject: string;
  category: string;
  departmentId?: string;
  rack: string;
}

export interface LibraryBookCopy {
  id: string;
  bookId: string;
  barcode: string; // Accession number
  status: "AVAILABLE" | "ISSUED" | "RESERVED" | "LOST" | "DAMAGED" | "UNDER_REPAIR";
}

export interface LibraryMember {
  id: string;
  institutionalId: string; // Maps to Student.id or Faculty.id
  memberType: "STUDENT" | "FACULTY";
  activeLoansCount: number;
  hasUnresolvedFines: boolean;
  clearanceStatus: "CLEARED" | "PENDING";
}

export interface LibraryLoan {
  id: string;
  memberId: string;
  copyId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewalCount: number;
  status: "ACTIVE" | "RETURNED" | "LOST" | "DAMAGED";
  issuedBy: string; // User ID
  acceptedBy?: string; // User ID who accepted return
  remarks?: string;
}

export interface LibraryReservation {
  id: string;
  memberId: string;
  bookId: string; // Catalog level
  queuePosition: number;
  requestDate: string;
  status: "ACTIVE" | "FULFILLED" | "CANCELLED";
}

export interface LibraryResolutionRecord {
  id: string;
  loanId: string;
  memberId: string;
  copyId: string;
  resolutionType: "PAID_PRICE" | "REPLACEMENT_BOOK" | "MANUAL_PENALTY";
  penaltyAmount?: number;
  status: "PENDING" | "RESOLVED";
  reportedDate: string;
  resolvedBy?: string; // User ID
  remarks?: string;
}

// --- Placement Management ---
export interface PlacementProfile {
  id: string; // Typically maps 1:1 with studentId, but keeps placement state isolated
  studentId: string;
  registrationStatus: "REGISTERED" | "NOT_REGISTERED";
  skills: string[];
  resumeUrl?: string;
  certifications: string[];
  activeBacklogs: number; // Snapshot/reported backlogs specifically for placement
  cgpa: number; // Snapshot/reported CGPA
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  title: string;
  driveType: "ON_CAMPUS" | "OFF_CAMPUS" | "ONLINE";
  date: string;
  // Eligibility Configuration Configured by Placement Admin
  minCgpa: number;
  maxBacklogs: number;
  allowedCourseIds: string[];
  allowedDepartmentIds: string[];
}

export interface JobRole {
  id: string;
  driveId: string;
  title: string;
  salaryCtc: number;
  location: string;
  joiningDate?: string;
}

export interface PlacementRound {
  id: string;
  driveId: string;
  name: string; // e.g., "Aptitude", "Technical", "HR"
  sequenceNumber: number;
  date: string;
}

export interface RoundResult {
  id: string;
  applicationId: string;
  roundId: string;
  status: "PENDING" | "PASS" | "FAIL";
  remarks?: string;
}

export interface PlacementApplication {
  id: string;
  studentId: string;
  driveId: string;
  status: "REGISTERED" | "ELIGIBLE" | "APPLIED" | "SHORTLISTED" | "APTITUDE" | "TECHNICAL_INTERVIEW" | "HR_INTERVIEW" | "SELECTED" | "REJECTED" | "OFFER_ACCEPTED" | "JOINED";
  appliedDate: string;
}

export interface PlacementOffer {
  id: string;
  applicationId: string;
  jobRoleId: string;
  offeredCtc: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  issuedDate: string;
}

// --- Certificate Management ---

export interface CertificateType {
  id: string;
  name: string;
  description: string;
  requiresFee: boolean;
  feeAmount: number;
}

export interface CertificateRequest {
  id: string;
  requesterId: string; // Student ID or Faculty ID
  requesterType: "STUDENT" | "FACULTY";
  certificateTypeId: string;
  purpose: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
  requestedDate: string;
  processedDate?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface CertificateRecord {
  id: string;
  certificateRequestId: string;
  certificateTypeId: string;
  requesterId: string;
  requesterType: "STUDENT" | "FACULTY";
  status: "ISSUED" | "CORRECTED" | "REVOKED";
  issuedDate: string;
  pdfUrl?: string; // Mock reference to digital document
}

export interface CertificateHistory {
  id: string;
  certificateRecordId: string;
  action: "ISSUED" | "CORRECTED" | "REVOKED";
  date: string;
  performedBy: string;
  reason?: string;
}

// --- Event Management ---

export interface EventType {
  id: string;
  name: string;
  description: string;
}

export interface EventTargeting {
  id: string;
  eventId: string;
  targetType: "ALL_STUDENTS" | "ALL_FACULTY" | "SPECIFIC_DEPARTMENT" | "SPECIFIC_COURSE" | "SPECIFIC_CLASS" | "SELECTED_STUDENTS" | "SELECTED_FACULTY";
  targetIds: string[]; // E.g. array of departmentIds, courseIds, or studentIds depending on targetType
}

export interface Event {
  id: string;
  name: string;
  description: string;
  eventTypeId: string;
  organizer: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  requiresRegistration: boolean;
  registrationDeadline?: string;
  requiresApproval: boolean;
  approverId?: string;
  approvalStatus: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  requiresFee: boolean;
  feeAmount?: number;
  providesCertificate: boolean;
  certificateTypeId?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "CANCELLED" | "COMPLETED" | "RESCHEDULED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  participantId: string;
  participantType: "STUDENT" | "FACULTY";
  status: "REGISTERED" | "CANCELLED";
  registeredAt: string;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  participantId: string;
  participantType: "STUDENT" | "FACULTY";
  status: "PRESENT" | "ABSENT";
  markedBy: string;
  markedAt: string;
}

export interface EventHistory {
  id: string;
  eventId: string;
  action: "CREATED" | "RESCHEDULED" | "CANCELLED" | "PUBLISHED" | "COMPLETED";
  previousStatus?: string;
  newStatus: string;
  previousDate?: string;
  newDate?: string;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

// --- Notification Management ---

export type NotificationCategory = "GENERAL" | "ACADEMIC" | "EXAMINATION" | "ATTENDANCE" | "FEES" | "LIBRARY" | "PLACEMENT" | "CERTIFICATE" | "EVENT" | "SYSTEM" | "OTHER";

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  audience: "STUDENTS" | "FACULTY" | "BOTH";
  targetScope: "ALL" | "SPECIFIC_DEPARTMENT" | "SPECIFIC_COURSE" | "SPECIFIC_CLASS" | "SPECIFIC_SECTION" | "SPECIFIC_USERS";
  targetIds: string[];
  scheduledAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "EXPIRED" | "CANCELLED";
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  recipientId: string;
  recipientType: "STUDENT" | "FACULTY";
  deliveredAt?: string;
  readAt?: string;
  status: "PENDING" | "DELIVERED" | "READ" | "FAILED";
}

export interface NotificationHistory {
  id: string;
  notificationId: string;
  action: "CREATED" | "EDITED" | "PUBLISHED" | "SCHEDULED" | "CANCELLED" | "EXPIRED";
  timestamp: string;
  performedBy: string;
  reason?: string;
}

// --- Super Admin / Access Control ---
export interface Permission {
  id: string;
  code: string; // e.g. "students.view"
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // SUPER_ADMIN, MASTER_ADMIN
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface User {
  id: string;
  username: string; // usually email or employeeId
  email: string;
  firstName: string;
  lastName: string;
  status: EntityStatus;
  lastLogin?: string;
}

export interface AdminAssignment {
  id: string;
  userId: string;
  roleId: string;
  domain?: string; // Only populated for DOMAIN_ADMIN
  assignedBy: string;
  assignedAt: string;
  status: EntityStatus;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface BackupRecord {
  id: string;
  name: string;
  type: "FULL" | "PARTIAL" | "SYSTEM_ONLY";
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS";
  sizeBytes: number;
  createdAt: string;
  createdBy: string;
}

// --- Student Register & Dossier View Models ---
export interface StudentAcademicSummary {
  attendancePercentage: number;
  attendanceStatus: "REGULAR" | "CONDONATION" | "REDO";
  attendedSessions: number;
  totalSessions: number;
  feeStatus: "PAID" | "PARTIALLY_PAID" | "UNPAID" | "OVERDUE";
  feeTotalAssessed: number;
  feePaidAmount: number;
  feeOutstanding: number;
  libraryActiveLoansCount: number;
  libraryBookTitles: string[];
}

export interface ResolvedStudent {
  id: string;
  registrationNumber: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  formattedDateOfBirth: string;
  gender: string;
  bloodGroup: string;
  guardianName: string;
  guardianPhone: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  currentSemester: number;
  classYearLabel: string; // e.g. "I BCA", "II BCA"
  shift: "SHIFT_I" | "SHIFT_II";
  shiftLabel: string; // "Shift I (Aided)" | "Shift II (Self-Financing)"
  shiftType: "Aided" | "Self-Financing";
  academicYearCode: string; // "2026-27"
  status: EntityStatus;
  summary: StudentAcademicSummary;
}

export interface StudentRegisterMetrics {
  totalStudents: number;
  shift1Count: number;
  shift2Count: number;
  activeCount: number;
  inactiveCount: number;
  academicYear: string;
}

// --- Resolved Faculty View Models (Phase 3I) ---
export interface FacultySubjectAssignment {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: "CORE" | "ELECTIVE" | "LAB" | "PROJECT";
  semesterNumber: number;
  courseId: string;
  courseCode: string;
  courseName: string;
  shift: "SHIFT_I" | "SHIFT_II";
}

export interface FacultyClassAdvisory {
  classId: string;
  classCode: string;
  sectionName: string;
  academicYear: string;
  courseName: string;
  studentCount: number;
}

export interface ResolvedFaculty {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  designation: string;
  specialization: string;
  status: EntityStatus;
  isHod: boolean;
  hodDepartmentName?: string;
  primaryShift: "SHIFT_I" | "SHIFT_II" | "DUAL_SHIFT";
  shiftLabel: string;
  teachingShifts: ("SHIFT_I" | "SHIFT_II")[];
  workload: {
    assignedSubjectsCount: number;
    totalCredits: number;
    subjects: FacultySubjectAssignment[];
    advisoryClasses: FacultyClassAdvisory[];
    totalStudentsTaught: number;
  };
}

export interface FacultyDirectoryMetrics {
  totalFaculty: number;
  activeFaculty: number;
  hodCount: number;
  shift1FacultyCount: number;
  shift2FacultyCount: number;
  unassignedWorkloadCount: number;
  academicYear: string;
}

// --- Resolved Department View Models (Phase 3I) ---
export interface DepartmentCourseSummary {
  id: string;
  code: string;
  name: string;
  shift: "SHIFT_I" | "SHIFT_II";
  shiftLabel: string;
  degree: string;
}

export interface DepartmentFacultySummary {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  isHod: boolean;
}

export interface ResolvedDepartment {
  id: string;
  code: string;
  name: string;
  hodId?: string;
  hodName: string;
  hodEmployeeId?: string;
  courses: DepartmentCourseSummary[];
  coursesCount: number;
  faculty: DepartmentFacultySummary[];
  facultyCount: number;
  studentCount: number;
  shiftDistribution: {
    hasShift1: boolean;
    hasShift2: boolean;
    shiftLabel: string;
  };
  status: EntityStatus;
}

export interface DepartmentDirectoryMetrics {
  totalDepartments: number;
  activeDepartments: number;
  totalPrograms: number;
  totalFaculty: number;
  totalStudents: number;
  departmentsWithHodCount: number;
}

// --- Resolved Course View Models (Phase 3I) ---
export interface ResolvedCourse {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  degree: string;
  regulation: string;
  durationYears: number;
  totalSemesters: number;
  shift: "SHIFT_I" | "SHIFT_II";
  shiftLabel: string;
  shiftType: "Aided" | "Self-Financing";
  subjectsCount: number;
  classesCount: number;
  studentCount: number;
  status: EntityStatus;
}

export interface CourseDirectoryMetrics {
  totalCourses: number;
  aidedShift1Count: number;
  selfFinancingShift2Count: number;
  ugCoursesCount: number;
  pgCoursesCount: number;
  activeCoursesCount: number;
}

// --- Resolved Subject View Models (Phase 3I) ---
export interface SubjectFacultySummary {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
}

export interface ResolvedSubject {
  id: string;
  code: string;
  name: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  semesterNumber: number;
  semesterLabel: string;
  credits: number;
  type: "CORE" | "ELECTIVE" | "LAB" | "PROJECT";
  shift: "SHIFT_I" | "SHIFT_II";
  shiftLabel: string;
  facultyIds: string[];
  assignedFaculty: SubjectFacultySummary[];
  classesCount: number;
  status: EntityStatus;
}

export interface SubjectDirectoryMetrics {
  totalSubjects: number;
  coreSubjectsCount: number;
  electiveLabCount: number;
  assignedSubjectsCount: number;
  unassignedSubjectsCount: number;
}

// --- Resolved Class View Models (Phase 3I) ---
export interface ResolvedClass {
  id: string;
  code: string;
  classYearLabel: string; // e.g. "I BCA", "II BCA"
  academicYearId: string;
  academicYearCode: string;
  semesterNumber: number;
  semesterLabel: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  departmentId: string;
  departmentName: string;
  shift: "SHIFT_I" | "SHIFT_II";
  shiftLabel: string;
  shiftType: "Aided" | "Self-Financing";
  sectionId?: string;
  sectionName?: string;
  advisorId?: string;
  advisorName?: string;
  advisorEmployeeId?: string;
  studentCount: number;
  subjectsCount: number;
  status: EntityStatus;
}

export interface ClassDirectoryMetrics {
  totalClasses: number;
  shift1ClassesCount: number;
  shift2ClassesCount: number;
  activeAcademicYear: string;
  totalEnrolledStudents: number;
  classesWithAdvisorCount: number;
}

export * from "../commandCenter";

