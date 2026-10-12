// Real APIs accessed via React Query in client components.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

import { cookies } from 'next/headers';

async function fetchRealApi<T = any[]>(endpoint: string): Promise<T> {
  if (typeof window !== 'undefined') {
    return [] as unknown as T;
  }
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value || cookieStore.get('access_token')?.value;
    if (!token) {
      // Unauthenticated SSR request - return empty fallback so client ProtectedRoute handles redirect cleanly
      return [] as unknown as T;
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Cookie': `accessToken=${token}; access_token=${token}`,
    };
    
    const res = await fetch(BASE_URL + endpoint, {
      headers,
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn(`[fetchRealApi] Rate limited (429) for ${endpoint} - returning empty. Check backend rate limit config.`);
        return [] as unknown as T;
      }
      if (res.status === 401 || res.status === 403) {
        return [] as unknown as T;
      }
      console.warn(`[fetchRealApi] ${res.status} for ${endpoint}`);
      return [] as unknown as T;
    }
    
    const json = await res.json();
    return (json.data !== undefined ? json.data : []) as T;
  } catch (err: any) {
    console.error(`[fetchRealApi Error] for ${endpoint}:`, err?.message || err);
    return [] as unknown as T;
  }
}

import { Student, Faculty, User, Role, Department, Course, Subject, ClassEntity, SectionEntity, AttendanceRecord, AcademicYear, Semester, TimetableEntry, Examination, Result, FeeStructure, StudentFeeAccount, FeePayment, Scholarship, Fine, LibraryBook, LibraryBookCopy, LibraryMember, LibraryLoan, LibraryReservation, LibraryResolutionRecord, Company, PlacementDrive, JobRole, PlacementProfile, PlacementApplication, PlacementRound, RoundResult, PlacementOffer, CertificateType, CertificateRequest, CertificateRecord, CertificateHistory, EventType, EventTargeting, Event, EventRegistration, EventAttendance, EventHistory, Notification, NotificationDelivery, NotificationHistory, Permission, AuditLog, BackupRecord, ResolvedStudent, StudentRegisterMetrics, ResolvedFaculty, FacultyDirectoryMetrics, FacultySubjectAssignment, FacultyClassAdvisory, ResolvedDepartment, DepartmentDirectoryMetrics, ResolvedCourse, CourseDirectoryMetrics, ResolvedSubject, SubjectDirectoryMetrics, ResolvedClass, ClassDirectoryMetrics } from "../../types/domain";
import {
  mockAcademicYears,
  mockSemesters,
  mockFeeStructures,
  mockFeeAccounts,
  mockFeePayments,
  mockScholarships,
  mockFines,
  mockExaminations,
  mockResults,
  mockLibraryBooks,
  mockLibraryBookCopies,
  mockLibraryMembers,
  mockLibraryLoans,
  mockLibraryReservations,
  mockLibraryResolutionRecords,
  mockCompanies,
  mockPlacementDrives,
  mockJobRoles,
  mockPlacementProfiles,
  mockPlacementApplications,
  mockPlacementRounds,
  mockRoundResults,
  mockPlacementOffers,
  mockCertificateTypes,
  mockCertificateRequests,
  mockCertificateRecords,
  mockCertificateHistory,
  mockEventTypes,
  mockEvents,
  mockEventTargetings,
  mockEventRegistrations,
  mockEventAttendances,
  mockEventHistories,
  mockNotifications,
  mockNotificationDeliveries,
  mockNotificationHistory,
  mockRoles,
  mockUsers,
  mockPermissions,
  mockAuditLogs,
  mockBackups,
  mockSections,
  mockOfficialCirculars,
  OfficialCircular
} from "@/data/mock/db";

// This layer abstracts the data source. Components should call these services,
// not the repositories directly. This allows us to eventually switch to an HTTP
// repository without changing the UI components.

export const StudentService = {
  getAllStudents: async (): Promise<Student[]> => {
    return fetchRealApi('/academic/students');
  },
  getStudentById: async (id: string): Promise<Student | undefined> => {
    return fetchRealApi(`/academic/students/${id}`);
  },
  getStudentDashboardData: async (studentId: string) => {
    const student = await fetchRealApi(`/academic/students/${studentId}`);
    const attendance = await fetchRealApi(`/attendance/attendance?studentId=${studentId}`);
    const fees = await fetchRealApi(`/finance/feeAccounts?studentId=${studentId}`);
    return { student, attendance, fees };
  },
  getStudentRegisterData: async (): Promise<{
    students: ResolvedStudent[];
    departments: Department[];
    courses: Course[];
    metrics: StudentRegisterMetrics;
  }> => {
    const [
      rawStudents,
      courses,
      departments,
      academicYears,
      attendance,
      feeAccounts,
      libraryMembers,
      libraryLoans,
      libraryCopies,
      libraryBooks
    ] = await Promise.all([
      fetchRealApi('/academic/students'),
      fetchRealApi('/academic/courses'),
      fetchRealApi('/academic/departments'),
      fetchRealApi('/academic/academicYears'),
      fetchRealApi('/attendance/attendance'),
      fetchRealApi('/finance/feeAccounts'),
      fetchRealApi('/library/members'),
      fetchRealApi('/library/loans'),
      fetchRealApi('/library/copies'),
      fetchRealApi('/library/books')
    ]);

    const activeAy = academicYears.find((ay) => ay.isActive)?.code || "2026-27";

    const resolvedStudents: ResolvedStudent[] = rawStudents.map((s) => {
      const course = courses.find((c) => c.id === s.courseId);
      const dept = departments.find((d) => d.id === s.departmentId);

      // MUC Rule 2 & 4: Derive academic class based on semester
      const courseCode = course?.code || "UG";
      let yearRoman = "I";
      if (s.currentSemester >= 5) yearRoman = "III";
      else if (s.currentSemester >= 3) yearRoman = "II";
      const classYearLabel = `${yearRoman} ${courseCode}`;

      // MUC Rule 4: Authoritative Shift mapping from Course
      const shift: "SHIFT_I" | "SHIFT_II" = course?.shift || "SHIFT_I";
      const shiftLabel = shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (Self-Financing)";
      const shiftType = shift === "SHIFT_I" ? "Aided" : "Self-Financing";

      // MUC Rule 14: Formatted DOB
      const dobDate = new Date(s.dateOfBirth);
      const formattedDateOfBirth = isNaN(dobDate.getTime())
        ? s.dateOfBirth
        : dobDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

      // Attendance Summary
      const studentAtt = attendance.filter((a) => a.studentId === s.id);
      const totalSessions = studentAtt.length;
      const attendedSessions = studentAtt.filter((a) => a.status === "PRESENT" || a.status === "ON_DUTY"
      ).length;
      const attendancePercentage =
        totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 85;
      const attStatus = AttendanceService.calculateAttendanceStatus(attendancePercentage).status;

      // Fee Summary
      const feeAcc = feeAccounts.find((fa) => fa.studentId === s.id);
      const feeStatus = feeAcc?.status || "PAID";
      const feeTotalAssessed = feeAcc?.totalAssessed || 0;
      const feePaidAmount = feeAcc?.paidAmount || 0;
      const feeOutstanding = feeAcc?.outstandingAmount || 0;

      // Library Summary
      const libMem = libraryMembers.find((m) => m.institutionalId === s.id);
      const studentLoans = libraryLoans.filter((l) => l.memberId === libMem?.id && l.status === "ACTIVE"
      );
      const libraryActiveLoansCount = studentLoans.length;
      const libraryBookTitles = studentLoans.map((l) => {
        const copy = libraryCopies.find((c) => c.id === l.copyId);
        return libraryBooks.find((b) => b.id === copy?.bookId)?.title || "Library Book";
      });

      return {
        id: s.id,
        registrationNumber: s.registrationNumber,
        admissionNumber: s.admissionNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        fullName: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: s.phone,
        dateOfBirth: s.dateOfBirth,
        formattedDateOfBirth,
        gender: s.gender,
        bloodGroup: s.bloodGroup,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        departmentId: s.departmentId,
        departmentName: dept?.name || "Academic Department",
        departmentCode: dept?.code || "DEPT",
        courseId: s.courseId,
        courseName: course?.name || "Degree Program",
        courseCode,
        currentSemester: s.currentSemester,
        classYearLabel,
        shift,
        shiftLabel,
        shiftType,
        academicYearCode: activeAy,
        status: s.status,
        summary: {
          attendancePercentage,
          attendanceStatus: attStatus,
          attendedSessions,
          totalSessions,
          feeStatus,
          feeTotalAssessed,
          feePaidAmount,
          feeOutstanding,
          libraryActiveLoansCount,
          libraryBookTitles,
        },
      };
    });

    const metrics: StudentRegisterMetrics = {
      totalStudents: resolvedStudents.length,
      shift1Count: resolvedStudents.filter((s) => s.shift === "SHIFT_I").length,
      shift2Count: resolvedStudents.filter((s) => s.shift === "SHIFT_II").length,
      activeCount: resolvedStudents.filter((s) => s.status === "ACTIVE").length,
      inactiveCount: resolvedStudents.filter((s) => s.status !== "ACTIVE").length,
      academicYear: activeAy,
    };

    return {
      students: resolvedStudents,
      departments,
      courses,
      metrics,
    };
  }
};


export const FacultyService = {
  getAllFaculty: async (): Promise<Faculty[]> => {
    return fetchRealApi('/academic/faculty');
  },
  getFacultyDirectoryData: async (): Promise<{
    faculty: ResolvedFaculty[];
    departments: Department[];
    subjects: Subject[];
    metrics: FacultyDirectoryMetrics;
  }> => {
    const [
      rawFaculty,
      departments,
      courses,
      subjects,
      classes,
      sections,
      students,
      academicYears,
    ] = await Promise.all([
      fetchRealApi('/academic/faculty'),
      fetchRealApi('/academic/departments'),
      fetchRealApi('/academic/courses'),
      fetchRealApi<Subject[]>('/academic/subjects'),
      (await fetchRealApi<ClassEntity[]>('/academic/classes')),
      Promise.resolve([] as SectionEntity[]),
      fetchRealApi('/academic/students'),
      fetchRealApi('/academic/academicYears'),
    ]);

    const activeAy = academicYears.find((ay) => ay.isActive)?.code || "2026-27";

    const resolvedFaculty: ResolvedFaculty[] = rawFaculty.map((f) => {
      const dept = departments.find((d) => d.id === f.departmentId);
      const hodDept = departments.find((d) => d.hodId === f.id);
      const isHod = Boolean(hodDept) || f.designation.toLowerCase().includes("head of department");

      // Assigned subjects
      const assigned = subjects.filter((s) => s.facultyIds?.includes(f.id));
      const mappedSubjects: FacultySubjectAssignment[] = assigned.map((sub) => {
        const crs = courses.find((c) => c.id === sub.courseId);
        return {
          id: sub.id,
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          type: sub.type,
          semesterNumber: sub.semesterNumber,
          courseId: sub.courseId,
          courseCode: crs?.code || "COURSE",
          courseName: crs?.name || "Academic Program",
          shift: crs?.shift || "SHIFT_I",
        };
      });

      const totalCredits = mappedSubjects.reduce((acc, s) => acc + s.credits, 0);

      // Class Advisories (MUC Rule 4: Normal class year I [Course], etc.)
      const advisories: FacultyClassAdvisory[] = sections
        .filter((sec) => sec.advisorId === f.id)
        .map((sec) => {
          const cls = classes.find((c) => c.id === sec.classId);
          const crs = cls ? courses.find((c) => c.id === cls.courseId) : undefined;
          const studentCount = students.filter((s) => s.sectionId === sec.id).length;
          return {
            classId: sec.classId,
            classCode: cls?.code || "Academic Class",
            sectionName: sec.name,
            academicYear: activeAy,
            courseName: crs?.name || "Program",
            studentCount,
          };
        });

      // Shift derivation based on teaching subjects or department courses
      const shiftsPresent = Array.from(new Set(mappedSubjects.map((s) => s.shift)));
      let primaryShift: "SHIFT_I" | "SHIFT_II" | "DUAL_SHIFT" = "SHIFT_I";
      let shiftLabel = "Shift I (Aided)";

      if (shiftsPresent.includes("SHIFT_I") && shiftsPresent.includes("SHIFT_II")) {
        primaryShift = "DUAL_SHIFT";
        shiftLabel = "Dual Shift (I & II)";
      } else if (shiftsPresent.includes("SHIFT_II")) {
        primaryShift = "SHIFT_II";
        shiftLabel = "Shift II (Self-Financing)";
      } else if (shiftsPresent.includes("SHIFT_I")) {
        primaryShift = "SHIFT_I";
        shiftLabel = "Shift I (Aided)";
      } else {
        const deptCourses = courses.filter((c) => c.departmentId === f.departmentId);
        if (deptCourses.some((c) => c.shift === "SHIFT_II") && !deptCourses.some((c) => c.shift === "SHIFT_I")) {
          primaryShift = "SHIFT_II";
          shiftLabel = "Shift II (Self-Financing)";
        }
      }

      // Total students taught
      const relevantCourseIds = new Set(mappedSubjects.map((s) => s.courseId));
      const totalStudentsTaught = students.filter((s) => relevantCourseIds.has(s.courseId)).length;

      return {
        id: f.id,
        employeeId: f.employeeId,
        firstName: f.firstName,
        lastName: f.lastName,
        fullName: `${f.firstName} ${f.lastName}`.trim(),
        email: f.email,
        phone: f.phone,
        departmentId: f.departmentId,
        departmentName: dept?.name || "Academic Department",
        departmentCode: dept?.code || "DEPT",
        designation: f.designation,
        specialization: f.specialization,
        status: f.status,
        isHod,
        hodDepartmentName: hodDept?.name,
        primaryShift,
        shiftLabel,
        teachingShifts: shiftsPresent,
        workload: {
          assignedSubjectsCount: mappedSubjects.length,
          totalCredits,
          subjects: mappedSubjects,
          advisoryClasses: advisories,
          totalStudentsTaught,
        },
      };
    });

    const metrics: FacultyDirectoryMetrics = {
      totalFaculty: resolvedFaculty.length,
      activeFaculty: resolvedFaculty.filter((f) => f.status === "ACTIVE").length,
      hodCount: resolvedFaculty.filter((f) => f.isHod).length,
      shift1FacultyCount: resolvedFaculty.filter((f) => f.primaryShift === "SHIFT_I" || f.primaryShift === "DUAL_SHIFT").length,
      shift2FacultyCount: resolvedFaculty.filter((f) => f.primaryShift === "SHIFT_II" || f.primaryShift === "DUAL_SHIFT").length,
      unassignedWorkloadCount: resolvedFaculty.filter((f) => f.workload.assignedSubjectsCount === 0).length,
      academicYear: activeAy,
    };

    return {
      faculty: resolvedFaculty,
      departments,
      subjects,
      metrics,
    };
  },
};

export const DepartmentService = {
  getAllDepartments: async (): Promise<Department[]> => {
    return fetchRealApi('/academic/departments');
  },
  getDepartmentDirectoryData: async (): Promise<{
    departments: ResolvedDepartment[];
    metrics: DepartmentDirectoryMetrics;
  }> => {
    const [rawDepts, rawCourses, rawFaculty, rawStudents] = await Promise.all([
      fetchRealApi('/academic/departments'),
      fetchRealApi('/academic/courses'),
      fetchRealApi('/academic/faculty'),
      fetchRealApi('/academic/students'),
    ]);

    const resolvedDepts: ResolvedDepartment[] = rawDepts.map((d) => {
      const deptFaculty = rawFaculty.filter((f) => f.departmentId === d.id);
      const hod = rawFaculty.find((f) => f.id === d.hodId);
      const deptCourses = rawCourses.filter((c) => c.departmentId === d.id);
      const deptStudents = rawStudents.filter((s) => s.departmentId === d.id);

      const hasShift1 = deptCourses.some((c) => c.shift === "SHIFT_I");
      const hasShift2 = deptCourses.some((c) => c.shift === "SHIFT_II");
      let shiftLabel = "Shift I (Aided)";
      if (hasShift1 && hasShift2) shiftLabel = "Both Shifts (I & II)";
      else if (hasShift2) shiftLabel = "Shift II (Self-Financing)";

      return {
        id: d.id,
        code: d.code,
        name: d.name,
        hodId: d.hodId,
        hodName: hod ? `${hod.firstName} ${hod.lastName}`.trim() : "To Be Appointed",
        hodEmployeeId: hod?.employeeId,
        courses: deptCourses.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          shift: c.shift,
          shiftLabel: c.shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (Self-Financing)",
          degree: c.degree,
        })),
        coursesCount: deptCourses.length,
        faculty: deptFaculty.map((f) => ({
          id: f.id,
          employeeId: f.employeeId,
          name: `${f.firstName} ${f.lastName}`.trim(),
          designation: f.designation,
          isHod: f.id === d.hodId,
        })),
        facultyCount: deptFaculty.length,
        studentCount: deptStudents.length,
        shiftDistribution: {
          hasShift1,
          hasShift2,
          shiftLabel,
        },
        status: d.status,
      };
    });

    const metrics: DepartmentDirectoryMetrics = {
      totalDepartments: resolvedDepts.length,
      activeDepartments: resolvedDepts.filter((d) => d.status === "ACTIVE").length,
      totalPrograms: rawCourses.length,
      totalFaculty: rawFaculty.length,
      totalStudents: rawStudents.length,
      departmentsWithHodCount: resolvedDepts.filter((d) => Boolean(d.hodId)).length,
    };

    return { departments: resolvedDepts, metrics };
  },
};

export const CourseService = {
  getAllCourses: async (): Promise<Course[]> => {
    return fetchRealApi('/academic/courses');
  },
  getCourseDirectoryData: async (): Promise<{
    courses: ResolvedCourse[];
    departments: Department[];
    metrics: CourseDirectoryMetrics;
  }> => {
    const [rawCourses, departments, subjects, classes, students] = await Promise.all([
      fetchRealApi('/academic/courses'),
      fetchRealApi('/academic/departments'),
      fetchRealApi<Subject[]>('/academic/subjects'),
      (await fetchRealApi<ClassEntity[]>('/academic/classes')),
      (await fetchRealApi<Student[]>('/academic/students')),
    ]);

    const resolvedCourses: ResolvedCourse[] = rawCourses.map((c) => {
      const dept = departments.find((d) => d.id === c.departmentId);
      const courseSubjects = subjects.filter((s) => s.courseId === c.id);
      const courseClasses = classes.filter((cl) => cl.courseId === c.id);
      const courseStudents = students.filter((s) => s.courseId === c.id);

      const shiftLabel = c.shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (Self-Financing)";
      const shiftType = c.shift === "SHIFT_I" ? "Aided" : "Self-Financing";

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        departmentId: c.departmentId,
        departmentName: dept?.name || "Academic Department",
        departmentCode: dept?.code || "DEPT",
        degree: c.degree,
        regulation: c.regulation,
        durationYears: c.durationYears,
        totalSemesters: c.totalSemesters,
        shift: c.shift,
        shiftLabel,
        shiftType,
        subjectsCount: courseSubjects.length,
        classesCount: courseClasses.length,
        studentCount: courseStudents.length,
        status: c.status,
      };
    });

    const metrics: CourseDirectoryMetrics = {
      totalCourses: resolvedCourses.length,
      aidedShift1Count: resolvedCourses.filter((c) => c.shift === "SHIFT_I").length,
      selfFinancingShift2Count: resolvedCourses.filter((c) => c.shift === "SHIFT_II").length,
      ugCoursesCount: resolvedCourses.filter((c) => c.degree === "UG").length,
      pgCoursesCount: resolvedCourses.filter((c) => c.degree === "PG").length,
      activeCoursesCount: resolvedCourses.filter((c) => c.status === "ACTIVE").length,
    };

    return { courses: resolvedCourses, departments, metrics };
  },
};

export const UserService = {
  getAllUsers: async (): Promise<any[]> => {
    const real = await fetchRealApi<any[]>("/users");
    return real && real.length > 0 ? real : mockUsers;
  },
  createUser: async (user: unknown): Promise<any> => { return user; }
};

export const RoleService = {
  getAllRoles: async (): Promise<Role[]> => {
    return mockRoles;
  }
};

export const PermissionService = {
  getAllPermissions: async (): Promise<Permission[]> => {
    return mockPermissions;
  }
};

export const AuditLogService = {
  getAllLogs: async (): Promise<AuditLog[]> => {
    return mockAuditLogs;
  }
};

export const BackupService = {
  getAllBackups: async (): Promise<BackupRecord[]> => {
    return mockBackups;
  },
  createBackup: async (backup: BackupRecord): Promise<void> => {
    mockBackups.unshift(backup);
  }
};
export const SubjectService = {
  getAllSubjects: async (): Promise<Subject[]> => {
    return fetchRealApi('/academic/subjects');
  },
  getSubjectDirectoryData: async (): Promise<{
    subjects: ResolvedSubject[];
    courses: Course[];
    departments: Department[];
    faculty: Faculty[];
    metrics: SubjectDirectoryMetrics;
  }> => {
    const [rawSubjects, courses, departments, facultyList, classes] = await Promise.all([
      fetchRealApi('/academic/subjects'),
      fetchRealApi('/academic/courses'),
      fetchRealApi('/academic/departments'),
      fetchRealApi('/academic/faculty'),
      (await fetchRealApi<ClassEntity[]>('/academic/classes')),
    ]);

    const resolvedSubjects: ResolvedSubject[] = rawSubjects.map((s) => {
      const course = courses.find((c) => c.id === s.courseId);
      const dept = course ? departments.find((d) => d.id === course.departmentId) : undefined;
      const assignedFac = facultyList
        .filter((f) => s.facultyIds?.includes(f.id))
        .map((f) => ({
          id: f.id,
          employeeId: f.employeeId,
          name: `${f.firstName} ${f.lastName}`.trim(),
          designation: f.designation,
        }));

      const shift = course?.shift || "SHIFT_I";
      const shiftLabel = shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (Self-Financing)";

      let yearNum = 1;
      if (s.semesterNumber >= 5) yearNum = 3;
      else if (s.semesterNumber >= 3) yearNum = 2;
      const semesterLabel = `Semester ${s.semesterNumber} · Year ${yearNum}`;

      const matchingClasses = classes.filter((cl) => cl.courseId === s.courseId && cl.semesterNumber === s.semesterNumber
      );

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        courseId: s.courseId,
        courseCode: course?.code || "COURSE",
        courseName: course?.name || "Program",
        departmentId: course?.departmentId || "",
        departmentName: dept?.name || "Department",
        departmentCode: dept?.code || "DEPT",
        semesterNumber: s.semesterNumber,
        semesterLabel,
        credits: s.credits,
        type: s.type,
        shift,
        shiftLabel,
        facultyIds: s.facultyIds || [],
        assignedFaculty: assignedFac,
        classesCount: matchingClasses.length,
        status: s.status,
      };
    });

    const metrics: SubjectDirectoryMetrics = {
      totalSubjects: resolvedSubjects.length,
      coreSubjectsCount: resolvedSubjects.filter((s) => s.type === "CORE").length,
      electiveLabCount: resolvedSubjects.filter((s) => s.type === "ELECTIVE" || s.type === "LAB").length,
      assignedSubjectsCount: resolvedSubjects.filter((s) => s.facultyIds.length > 0).length,
      unassignedSubjectsCount: resolvedSubjects.filter((s) => s.facultyIds.length === 0).length,
    };

    return { subjects: resolvedSubjects, courses, departments, faculty: facultyList, metrics };
  },
};

export const ClassService = {
  getAllClasses: async (): Promise<ClassEntity[]> => {
    return fetchRealApi<ClassEntity[]>('/academic/classes');
  },
  getAllSections: async (): Promise<SectionEntity[]> => {
    return Promise.resolve(mockSections);
  },
  getClassDirectoryData: async (): Promise<{
    classes: ResolvedClass[];
    courses: Course[];
    departments: Department[];
    academicYears: AcademicYear[];
    metrics: ClassDirectoryMetrics;
  }> => {
    const [rawClasses, rawSections, courses, departments, facultyList, students, subjects, academicYears] = await Promise.all([
      (await fetchRealApi<ClassEntity[]>('/academic/classes')),
      Promise.resolve(mockSections),
      fetchRealApi('/academic/courses'),
      fetchRealApi('/academic/departments'),
      fetchRealApi('/academic/faculty'),
      fetchRealApi('/academic/students'),
      fetchRealApi('/academic/subjects'),
      fetchRealApi('/academic/academicYears'),
    ]);

    const activeAy = academicYears.find((ay) => ay.isActive)?.code || "2026-27";

    const resolvedClasses: ResolvedClass[] = rawClasses.map((cls) => {
      const course = courses.find((c) => c.id === cls.courseId);
      const dept = course ? departments.find((d) => d.id === course.departmentId) : undefined;
      const section = rawSections.find((s) => s.classId === cls.id);
      const advisor = section?.advisorId ? facultyList.find((f) => f.id === section.advisorId) : undefined;

      const shift = course?.shift || "SHIFT_I";
      const shiftLabel = shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (Self-Financing)";
      const shiftType = shift === "SHIFT_I" ? "Aided" : "Self-Financing";

      // MUC Rule 4: Academic class structure is I [Course], II [Course], III [Course]
      let yearRoman = "I";
      if (cls.semesterNumber >= 5) yearRoman = "III";
      else if (cls.semesterNumber >= 3) yearRoman = "II";
      const classYearLabel = `${yearRoman} ${course?.code || "Class"}`;

      let yearNum = 1;
      if (cls.semesterNumber >= 5) yearNum = 3;
      else if (cls.semesterNumber >= 3) yearNum = 2;
      const semesterLabel = `Semester ${cls.semesterNumber} (Year ${yearNum})`;

      const classStudents = section
        ? students.filter((s) => s.sectionId === section.id)
        : students.filter((s) => s.courseId === cls.courseId && s.currentSemester === cls.semesterNumber);

      const classSubjects = subjects.filter((s) => s.courseId === cls.courseId && s.semesterNumber === cls.semesterNumber
      );

      const ay = academicYears.find((a) => a.id === cls.academicYearId);

      return {
        id: cls.id,
        code: cls.code,
        classYearLabel,
        academicYearId: cls.academicYearId,
        academicYearCode: ay?.code || activeAy,
        semesterNumber: cls.semesterNumber,
        semesterLabel,
        courseId: cls.courseId,
        courseCode: course?.code || "COURSE",
        courseName: course?.name || "Program",
        departmentId: course?.departmentId || "",
        departmentName: dept?.name || "Academic Department",
        shift,
        shiftLabel,
        shiftType,
        sectionId: section?.id,
        sectionName: section?.name,
        advisorId: section?.advisorId,
        advisorName: advisor ? `${advisor.firstName} ${advisor.lastName}`.trim() : "To Be Assigned",
        advisorEmployeeId: advisor?.employeeId,
        studentCount: classStudents.length,
        subjectsCount: classSubjects.length,
        status: cls.status,
      };
    });

    const metrics: ClassDirectoryMetrics = {
      totalClasses: resolvedClasses.length,
      shift1ClassesCount: resolvedClasses.filter((c) => c.shift === "SHIFT_I").length,
      shift2ClassesCount: resolvedClasses.filter((c) => c.shift === "SHIFT_II").length,
      activeAcademicYear: activeAy,
      totalEnrolledStudents: resolvedClasses.reduce((acc, c) => acc + c.studentCount, 0),
      classesWithAdvisorCount: resolvedClasses.filter((c) => Boolean(c.advisorId)).length,
    };

    return { classes: resolvedClasses, courses, departments, academicYears, metrics };
  },
};

export const AttendanceService = {
  getAllAttendance: async (): Promise<AttendanceRecord[]> => {
    return fetchRealApi('/attendance/attendance');
  },
  
  // Domain Rules for Attendance
  calculateAttendanceStatus: (percentage: number): { status: "REGULAR" | "CONDONATION" | "REDO", requiredAction?: string } => {
    if (percentage >= 75) {
      return { status: "REGULAR" };
    }
    if (percentage >= 65) {
      return { status: "CONDONATION", requiredAction: "Pay Condonation Fee" };
    }
    return { status: "REDO", requiredAction: "Redo Semester" };
  }
};

export const AcademicYearService = {
  getAllAcademicYears: async (): Promise<AcademicYear[]> => {
    const real = await fetchRealApi<AcademicYear[]>('/academic/academicYears');
    return real && real.length > 0 ? real : mockAcademicYears;
  }
};

export const SemesterService = {
  getAllSemesters: async (): Promise<Semester[]> => {
    const real = await fetchRealApi<Semester[]>('/academic/semesters');
    return real && real.length > 0 ? real : mockSemesters;
  }
};

export const TimetableService = {
  getAllEntries: async (): Promise<TimetableEntry[]> => {
    return fetchRealApi('/academic/timetable/entries');
  }
};

export const ExaminationService = {
  getAllExaminations: async (): Promise<Examination[]> => {
    const real = await fetchRealApi<Examination[]>('/examination/examinations');
    return real && real.length > 0 ? real : mockExaminations;
  }
};

export const ResultService = {
  getAllResults: async (): Promise<Result[]> => {
    const real = await fetchRealApi<Result[]>('/examination/results');
    return real && real.length > 0 ? real : mockResults;
  },
  
  // Centralized result calculation logic
  calculateResult: (marksObtained: number | undefined, maxMarks: number, status: Result["resultStatus"]) => {
    if (status === "ABSENT" || status === "NOT_ENTERED" || status === "WITHHELD" || marksObtained === undefined) {
      return { grade: "-", gradePoint: 0, status };
    }
    
    const percentage = (marksObtained / maxMarks) * 100;
    let grade = "";
    let gradePoint = 0;
    let passStatus: "PASS" | "FAIL" = "PASS";
    
    // MUC Grading Scale based on standard TN university pattern
    if (percentage >= 90) { grade = "O"; gradePoint = 10; }
    else if (percentage >= 80) { grade = "D+"; gradePoint = 9; }
    else if (percentage >= 75) { grade = "D"; gradePoint = 8.5; }
    else if (percentage >= 70) { grade = "A+"; gradePoint = 8; }
    else if (percentage >= 60) { grade = "A"; gradePoint = 7; }
    else if (percentage >= 50) { grade = "B"; gradePoint = 6; }
    else if (percentage >= 40) { grade = "C"; gradePoint = 5; } // Assuming 40% pass for UG
    else { grade = "F"; gradePoint = 0; passStatus = "FAIL"; }
    
    return { grade, gradePoint, status: passStatus };
  }
};

export const FeeService = {
  getAllFeeStructures: async (): Promise<FeeStructure[]> => {
    const real = await fetchRealApi<FeeStructure[]>('/finance/feeStructures');
    return real && real.length > 0 ? real : mockFeeStructures;
  },
  getAllFeeAccounts: async (): Promise<StudentFeeAccount[]> => {
    const real = await fetchRealApi<StudentFeeAccount[]>('/finance/feeAccounts');
    return real && real.length > 0 ? real : mockFeeAccounts;
  },
  getAllPayments: async (): Promise<FeePayment[]> => {
    const real = await fetchRealApi<FeePayment[]>('/finance/payments');
    return real && real.length > 0 ? real : mockFeePayments;
  },
  
  // Centralized Fee Calculation
  calculateAccountStatus: (account: Pick<StudentFeeAccount, "totalAssessed" | "scholarshipAmount" | "fineAmount" | "paidAmount" | "dueDate">) => {
    const netPayable = account.totalAssessed - account.scholarshipAmount + account.fineAmount;
    const outstandingAmount = netPayable - account.paidAmount;
    
    let status: StudentFeeAccount["status"] = "UNPAID";
    
    if (outstandingAmount <= 0) {
      status = "PAID";
    } else if (account.paidAmount > 0) {
      status = "PARTIALLY_PAID";
    } else {
      status = "UNPAID";
    }
    
    // Determine overdue strictly from date
    if ((status === "UNPAID" || status === "PARTIALLY_PAID") && new Date(account.dueDate) < new Date()) {
      status = "OVERDUE";
    }
    
    return {
      netPayable,
      outstandingAmount,
      status
    };
  }
};

export const ScholarshipService = {
  getAllScholarships: async (): Promise<Scholarship[]> => {
    const real = await fetchRealApi<Scholarship[]>('/finance/scholarships');
    return real && real.length > 0 ? real : mockScholarships;
  }
};

export const FineService = {
  getAllFines: async (): Promise<Fine[]> => {
    const real = await fetchRealApi<Fine[]>('/finance/fines');
    return real && real.length > 0 ? real : mockFines;
  },
  
  // Attendance-to-Finance Integration
  processAttendanceFine: (studentId: string, academicYearId: string, semesterId: string, accountId: string, existingFines: Fine[], attendancePercentage: number) => {
    // According to MUC Rules: 65%-74.9% requires condonation fine.
    // >75% requires NO fine.
    // <65% is REDO semester (not handled financially as a condonation fine).
    
    const requiresCondonation = attendancePercentage >= 65 && attendancePercentage < 75;
    const existingAttendanceFine = existingFines.find(f => 
      f.studentId === studentId && 
      f.semesterId === semesterId && 
      f.source === "ATTENDANCE"
    );
    
    if (requiresCondonation && !existingAttendanceFine) {
      // Create new fine
      const newFine: Fine = {
        id: `fine-att-${Date.now()}`,
        studentFeeAccountId: accountId,
        studentId,
        academicYearId,
        semesterId,
        amount: 1000, // Condonation mock amount
        source: "ATTENDANCE",
        reason: "Condonation for attendance below 75%",
        status: "APPLIED",
        createdAt: new Date().toISOString()
      };
      return newFine;
    }
    
    return null;
  }
};

export const LibraryService = {
  getBooks: async (): Promise<LibraryBook[]> => {
    const real = await fetchRealApi<LibraryBook[]>('/library/books');
    return real && real.length > 0 ? real : mockLibraryBooks;
  },
  getCopies: async (): Promise<LibraryBookCopy[]> => {
    const real = await fetchRealApi<LibraryBookCopy[]>('/library/copies');
    return real && real.length > 0 ? real : mockLibraryBookCopies;
  },
  getMembers: async (): Promise<LibraryMember[]> => {
    const real = await fetchRealApi<LibraryMember[]>('/library/members');
    return real && real.length > 0 ? real : mockLibraryMembers;
  },
  getLoans: async (): Promise<LibraryLoan[]> => {
    const real = await fetchRealApi<LibraryLoan[]>('/library/loans');
    return real && real.length > 0 ? real : mockLibraryLoans;
  },
  getReservations: async (): Promise<LibraryReservation[]> => {
    const real = await fetchRealApi<LibraryReservation[]>('/library/reservations');
    return real && real.length > 0 ? real : mockLibraryReservations;
  },
  getResolutionRecords: async (): Promise<LibraryResolutionRecord[]> => {
    const real = await fetchRealApi<LibraryResolutionRecord[]>('/library/resolutionRecords');
    return real && real.length > 0 ? real : mockLibraryResolutionRecords;
  },

  // Validation Logic exposed for UI consumption
  canStudentBorrow: (member: LibraryMember, activeLoans: LibraryLoan[]): { valid: boolean; reason?: string } => {
    if (member.memberType !== "STUDENT") return { valid: true };
    const currentActive = activeLoans.filter(l => l.status === "ACTIVE" && l.memberId === member.id).length;
    if (currentActive >= 2) {
      return { valid: false, reason: "Student has reached the maximum borrowing limit of 2 books." };
    }
    return { valid: true };
  },

  processIssueBook: (
    member: LibraryMember, 
    copy: LibraryBookCopy, 
    dueDate: string, 
    activeLoans: LibraryLoan[],
    issuedBy: string
  ): { success: boolean; loan?: LibraryLoan; error?: string } => {
    if (copy.status !== "AVAILABLE") {
      return { success: false, error: "Copy is not available for issue." };
    }

    const check = LibraryService.canStudentBorrow(member, activeLoans);
    if (!check.valid) {
      return { success: false, error: check.reason };
    }

    const newLoan: LibraryLoan = {
      id: `loan-new-${Date.now()}`,
      memberId: member.id,
      copyId: copy.id,
      issueDate: new Date().toISOString(),
      dueDate,
      renewalCount: 0,
      status: "ACTIVE",
      issuedBy
    };

    return { success: true, loan: newLoan };
  },

  processReturnBook: (
    loan: LibraryLoan,
    acceptedBy: string
  ): { success: boolean; returnedLoan?: LibraryLoan; fine?: Fine; error?: string } => {
    if (loan.status !== "ACTIVE") {
      return { success: false, error: "Loan is not active." };
    }

    const now = new Date();
    const isLate = now > new Date(loan.dueDate);

    const returnedLoan: LibraryLoan = {
      ...loan,
      status: "RETURNED",
      returnDate: now.toISOString(),
      acceptedBy
    };

    // Note: To fully apply a fine, the system needs the student's Fee Account ID. 
    // In a real system, the repository would fetch the FeeAccount. For this mock UI integration,
    // we'll return the fine requirement so the UI can prompt for mapping or handle it.
    let fine: Fine | undefined;
    if (isLate) {
      fine = {
        id: `fine-lib-${Date.now()}`,
        studentFeeAccountId: "", // To be resolved by caller
        studentId: "", // To be resolved by caller mapping the member
        academicYearId: "", // Generic placeholder
        semesterId: "", // Generic placeholder
        amount: 100, // Fixed ₹100 library fine
        source: "OTHER", // Mapped as OTHER or we can add LIBRARY
        reason: `Late return fine for loan ${loan.id}`,
        status: "APPLIED",
        createdAt: now.toISOString()
      };
    }

    return { success: true, returnedLoan, fine };
  },

  processRenewal: (loan: LibraryLoan, newDueDate: string): { success: boolean; renewedLoan?: LibraryLoan; error?: string } => {
    if (loan.status !== "ACTIVE") {
      return { success: false, error: "Cannot renew an inactive loan." };
    }
    if (loan.renewalCount >= 2) {
      return { success: false, error: "Maximum renewal limit (2) reached." };
    }

    const renewedLoan: LibraryLoan = {
      ...loan,
      dueDate: newDueDate,
      renewalCount: loan.renewalCount + 1
    };

    return { success: true, renewedLoan };
  }
};

export const PlacementService = {
  getCompanies: async (): Promise<Company[]> => mockCompanies,
  getDrives: async (): Promise<PlacementDrive[]> => {
    const real = await fetchRealApi<PlacementDrive[]>('/placement/drives');
    return real && real.length > 0 ? real : mockPlacementDrives;
  },
  getJobRoles: async (): Promise<JobRole[]> => mockJobRoles,
  getProfiles: async (): Promise<PlacementProfile[]> => {
    const real = await fetchRealApi<PlacementProfile[]>('/placement/profiles');
    return real && real.length > 0 ? real : mockPlacementProfiles;
  },
  getApplications: async (): Promise<PlacementApplication[]> => {
    const real = await fetchRealApi<PlacementApplication[]>('/placement/applications');
    return real && real.length > 0 ? real : mockPlacementApplications;
  },
  getRounds: async (): Promise<PlacementRound[]> => mockPlacementRounds,
  getRoundResults: async (): Promise<RoundResult[]> => mockRoundResults,
  getOffers: async (): Promise<PlacementOffer[]> => {
    const real = await fetchRealApi<PlacementOffer[]>('/placement/offers');
    return real && real.length > 0 ? real : mockPlacementOffers;
  },

  // Core Business Rules: Eligibility Evaluator
  evaluateEligibility: (
    profile: PlacementProfile, 
    student: Student, // Requires authoritative academic info
    drive: PlacementDrive
  ): { isEligible: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    let isEligible = true;

    // Must be registered for placement
    if (profile.registrationStatus !== "REGISTERED") {
      isEligible = false;
      reasons.push("Student is not registered for placement services.");
    }

    // Must be final year
    const isPG = student.courseId.includes("-msc-") || student.courseId.includes("-ma-");
    const isFinalYear = isPG 
      ? (student.currentSemester === 3 || student.currentSemester === 4)
      : (student.currentSemester === 5 || student.currentSemester === 6);
    
    if (!isFinalYear) {
      isEligible = false;
      reasons.push(`Student in semester ${student.currentSemester} is not in their final year.`);
    }

    if (profile.cgpa < drive.minCgpa) {
      isEligible = false;
      reasons.push(`CGPA ${profile.cgpa} is below drive minimum ${drive.minCgpa}.`);
    }

    if (profile.activeBacklogs > drive.maxBacklogs) {
      isEligible = false;
      reasons.push(`Active backlogs (${profile.activeBacklogs}) exceed allowed maximum (${drive.maxBacklogs}).`);
    }

    if (drive.allowedCourseIds.length > 0 && !drive.allowedCourseIds.includes(student.courseId)) {
      isEligible = false;
      reasons.push(`Course ${student.courseId} is not allowed for this drive.`);
    }

    if (drive.allowedDepartmentIds.length > 0 && !drive.allowedDepartmentIds.includes(student.departmentId)) {
      isEligible = false;
      reasons.push(`Department ${student.departmentId} is not allowed for this drive.`);
    }

    return { isEligible, reasons };
  },

  // Selection Restriction Policy (Configurable by admin conceptually, implemented natively here)
  canApplyBasedOnPolicy: (
    studentId: string, 
    allApplications: PlacementApplication[]
  ): { valid: boolean; reason?: string } => {
    // Current Rule: If a student is "SELECTED" or "JOINED" in any previous drive, they cannot apply to new ones.
    const selectedApp = allApplications.find(a => 
      a.studentId === studentId && (a.status === "SELECTED" || a.status === "OFFER_ACCEPTED" || a.status === "JOINED")
    );

    if (selectedApp) {
      return { valid: false, reason: "Student is already placed and cannot apply for further drives per college policy." };
    }
    return { valid: true };
  },

  processApplication: (
    profile: PlacementProfile,
    student: Student,
    drive: PlacementDrive,
    allApplications: PlacementApplication[]
  ): { success: boolean; application?: PlacementApplication; error?: string } => {
    // 1. Check Policy Restriction
    const policyCheck = PlacementService.canApplyBasedOnPolicy(student.id, allApplications);
    if (!policyCheck.valid) {
      return { success: false, error: policyCheck.reason };
    }

    // 2. Check Drive Eligibility
    const eligibility = PlacementService.evaluateEligibility(profile, student, drive);
    if (!eligibility.isEligible) {
      return { success: false, error: "Not eligible: " + eligibility.reasons.join(" ") };
    }

    // 3. Prevent duplicate applications
    if (allApplications.some(a => a.studentId === student.id && a.driveId === drive.id)) {
      return { success: false, error: "Already applied to this drive." };
    }

    const application: PlacementApplication = {
      id: `app-new-${Date.now()}`,
      studentId: student.id,
      driveId: drive.id,
      status: "APPLIED",
      appliedDate: new Date().toISOString()
    };

    return { success: true, application };
  },

  rejectOffer: (
    offer: PlacementOffer, 
    application: PlacementApplication
  ): { updatedOffer: PlacementOffer; updatedApplication: PlacementApplication } => {
    // Crucial Rule: The application status remains "SELECTED" (permanent history), 
    // but the offer itself is explicitly marked "REJECTED".
    return {
      updatedOffer: { ...offer, status: "REJECTED" },
      // Application might stay SELECTED or transition to something like OFFER_REJECTED depending on strict modeling,
      // but the rule states "record that the student was SELECTED... offer marked REJECTED".
      updatedApplication: { ...application } // Unchanged status per instructions to preserve "SELECTED"
    };
  }
};

export const CertificateService = {
  getCertificateTypes: async (): Promise<CertificateType[]> => {
    const real = await fetchRealApi<CertificateType[]>('/certificates/types');
    return real && real.length > 0 ? real : mockCertificateTypes;
  },
  getCertificateRequests: async (): Promise<CertificateRequest[]> => {
    const real = await fetchRealApi<CertificateRequest[]>('/certificates/requests');
    return real && real.length > 0 ? real : mockCertificateRequests;
  },
  getCertificateRecords: async (): Promise<CertificateRecord[]> => {
    const real = await fetchRealApi<CertificateRecord[]>('/certificates/records');
    return real && real.length > 0 ? real : mockCertificateRecords;
  },
  getCertificateHistory: async (): Promise<CertificateHistory[]> => {
    const real = await fetchRealApi<CertificateHistory[]>('/certificates/histories');
    return real && real.length > 0 ? real : mockCertificateHistory;
  },

  requestCertificate: (
    requesterId: string,
    requesterType: "STUDENT" | "FACULTY",
    typeId: string,
    purpose: string,
    existingRequests: CertificateRequest[]
  ): { success: boolean; request?: CertificateRequest; error?: string } => {
    // Rule: Cannot request the SAME certificate repeatedly if one is already pending or approved.
    // Assuming "approved" implies they got it, they can't ask for a new distinct issue under normal rules
    // (They would need a reissue/correction workflow from Admin if lost).
    const duplicate = existingRequests.find(r => 
      r.requesterId === requesterId && 
      r.certificateTypeId === typeId && 
      (r.status === "REQUESTED" || r.status === "APPROVED")
    );

    if (duplicate) {
      return { success: false, error: "An active or approved request for this certificate type already exists." };
    }

    const newReq: CertificateRequest = {
      id: `cert-req-${Date.now()}`,
      requesterId,
      requesterType,
      certificateTypeId: typeId,
      purpose,
      status: "REQUESTED",
      requestedDate: new Date().toISOString()
    };

    return { success: true, request: newReq };
  },

  approveRequest: (
    request: CertificateRequest,
    certType: CertificateType,
    adminId: string
  ): { updatedRequest: CertificateRequest; generatedFine?: Fine } => {
    // Admin approves the request
    const updatedRequest: CertificateRequest = {
      ...request,
      status: "APPROVED",
      processedDate: new Date().toISOString(),
      processedBy: adminId
    };

    // Rule: Integrate with Finance architecture
    // If the certificate requires a fee, we spawn a Fine/Obligation payload conceptually sent to the Finance module.
    let generatedFine: Fine | undefined;
    if (certType.requiresFee && certType.feeAmount > 0 && request.requesterType === "STUDENT") {
      generatedFine = {
        id: `fine-cert-${Date.now()}`,
        studentFeeAccountId: "mock-sfa-1", // Mock resolution
        studentId: request.requesterId,
        academicYearId: "ay-1",
        semesterId: "sem-1",
        amount: certType.feeAmount,
        source: "OTHER",
        reason: `Certificate Fee: ${certType.name}`,
        status: "APPLIED",
        createdAt: new Date().toISOString()
      };
    }

    return { updatedRequest, generatedFine };
  },

  issueCertificate: (
    request: CertificateRequest,
    adminId: string
  ): { record: CertificateRecord; history: CertificateHistory } => {
    const recordId = `cert-rec-${Date.now()}`;
    const date = new Date().toISOString();

    const record: CertificateRecord = {
      id: recordId,
      certificateRequestId: request.id,
      certificateTypeId: request.certificateTypeId,
      requesterId: request.requesterId,
      requesterType: request.requesterType,
      status: "ISSUED",
      issuedDate: date,
      pdfUrl: `/generated-certs/${recordId}.pdf`
    };

    const history: CertificateHistory = {
      id: `cert-hist-${Date.now()}`,
      certificateRecordId: recordId,
      action: "ISSUED",
      date,
      performedBy: adminId,
      reason: "Initial Issuance"
    };

    return { record, history };
  },

  revokeCertificate: (
    record: CertificateRecord,
    reason: string,
    adminId: string
  ): { updatedRecord: CertificateRecord; history: CertificateHistory } => {
    // Rule: Only Certificate Admin authorizes. Revocation preserves the historical record.
    const date = new Date().toISOString();

    const updatedRecord: CertificateRecord = {
      ...record,
      status: "REVOKED"
    };

    const history: CertificateHistory = {
      id: `cert-hist-${Date.now()}`,
      certificateRecordId: record.id,
      action: "REVOKED",
      date,
      performedBy: adminId,
      reason
    };

    return { updatedRecord, history };
  },

  reissueCertificate: (
    oldRecord: CertificateRecord,
    reason: string,
    adminId: string
  ): { updatedOldRecord: CertificateRecord; newRecord: CertificateRecord; historyOld: CertificateHistory; historyNew: CertificateHistory } => {
    // Rule: Original certificate history remains traceable. Do NOT silently overwrite.
    const date = new Date().toISOString();
    const newRecordId = `cert-rec-${Date.now()}`;

    // Mark old as CORRECTED
    const updatedOldRecord: CertificateRecord = {
      ...oldRecord,
      status: "CORRECTED"
    };

    const historyOld: CertificateHistory = {
      id: `cert-hist-${Date.now()}-1`,
      certificateRecordId: oldRecord.id,
      action: "CORRECTED",
      date,
      performedBy: adminId,
      reason: `Corrected & Reissued as ${newRecordId}: ${reason}`
    };

    // Issue New Record
    const newRecord: CertificateRecord = {
      ...oldRecord,
      id: newRecordId,
      status: "ISSUED",
      issuedDate: date,
      pdfUrl: `/generated-certs/${newRecordId}.pdf`
    };

    const historyNew: CertificateHistory = {
      id: `cert-hist-${Date.now()}-2`,
      certificateRecordId: newRecordId,
      action: "ISSUED",
      date,
      performedBy: adminId,
      reason: `Reissued replacement for ${oldRecord.id}`
    };

    return { updatedOldRecord, newRecord, historyOld, historyNew };
  }
};

export const EventService = {
  getEventTypes: async (): Promise<EventType[]> => mockEventTypes,
  getEventTargetings: async (): Promise<EventTargeting[]> => mockEventTargetings,
  getEvents: async (): Promise<Event[]> => {
    const real = await fetchRealApi<Event[]>('/events/events');
    return real && real.length > 0 ? real : mockEvents;
  },
  getEventRegistrations: async (): Promise<EventRegistration[]> => {
    const real = await fetchRealApi<EventRegistration[]>('/events/registrations');
    return real && real.length > 0 ? real : mockEventRegistrations;
  },
  getEventAttendances: async (): Promise<EventAttendance[]> => mockEventAttendances,
  getEventHistories: async (): Promise<EventHistory[]> => {
    const real = await fetchRealApi<EventHistory[]>('/events/eventHistories');
    return real && real.length > 0 ? real : mockEventHistories;
  },

  registerForEvent: (
    event: Event,
    participantId: string,
    participantType: "STUDENT" | "FACULTY",
    existingRegistrations: EventRegistration[]
  ): { success: boolean; registration?: EventRegistration; error?: string } => {
    
    if (!event.requiresRegistration) {
      return { success: false, error: "This event does not require registration." };
    }

    if (event.status !== "PUBLISHED" && event.status !== "APPROVED") {
      return { success: false, error: "Event is not open for registration." };
    }

    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return { success: false, error: "Registration deadline has passed." };
    }

    const currentRegs = existingRegistrations.filter(r => r.eventId === event.id && r.status === "REGISTERED");
    if (event.capacity && currentRegs.length >= event.capacity) {
      return { success: false, error: "Event has reached maximum capacity." };
    }

    const duplicate = currentRegs.find(r => r.participantId === participantId && r.participantType === participantType);
    if (duplicate) {
      return { success: false, error: "Participant is already registered." };
    }

    const registration: EventRegistration = {
      id: `ereg-${Date.now()}`,
      eventId: event.id,
      participantId,
      participantType,
      status: "REGISTERED",
      registeredAt: new Date().toISOString()
    };

    return { success: true, registration };
  },

  rescheduleEvent: (
    event: Event,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason: string,
    adminId: string
  ): { updatedEvent: Event; history: EventHistory } => {
    const updatedEvent: Event = {
      ...event,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: "RESCHEDULED",
      updatedAt: new Date().toISOString()
    };

    const history: EventHistory = {
      id: `ehist-${Date.now()}`,
      eventId: event.id,
      action: "RESCHEDULED",
      previousStatus: event.status,
      newStatus: "RESCHEDULED",
      previousDate: event.date,
      newDate,
      changedBy: adminId,
      timestamp: new Date().toISOString(),
      reason
    };

    return { updatedEvent, history };
  },

  cancelEvent: (
    event: Event,
    reason: string,
    adminId: string
  ): { updatedEvent: Event; history: EventHistory } => {
    const updatedEvent: Event = {
      ...event,
      status: "CANCELLED",
      updatedAt: new Date().toISOString()
    };

    const history: EventHistory = {
      id: `ehist-${Date.now()}`,
      eventId: event.id,
      action: "CANCELLED",
      previousStatus: event.status,
      newStatus: "CANCELLED",
      changedBy: adminId,
      timestamp: new Date().toISOString(),
      reason
    };

    return { updatedEvent, history };
  },

  markAttendance: (
    eventId: string,
    participantId: string,
    participantType: "STUDENT" | "FACULTY",
    status: "PRESENT" | "ABSENT",
    adminId: string
  ): EventAttendance => {
    return {
      id: `eatt-${Date.now()}`,
      eventId,
      participantId,
      participantType,
      status,
      markedBy: adminId,
      markedAt: new Date().toISOString()
    };
  },

  processEventConclusion: (
    event: Event,
    attendances: EventAttendance[]
  ): { generatedFines: Fine[]; generatedCertificateRequests: CertificateRequest[] } => {
    const generatedFines: Fine[] = [];
    const generatedCertificateRequests: CertificateRequest[] = [];

    const presentParticipants = attendances.filter(a => a.status === "PRESENT");

    presentParticipants.forEach(att => {
      // Generate Certificates if applicable
      if (event.providesCertificate && event.certificateTypeId) {
        generatedCertificateRequests.push({
          id: `cert-req-evt-${Date.now()}-${att.participantId}`,
          requesterId: att.participantId,
          requesterType: att.participantType,
          certificateTypeId: event.certificateTypeId,
          purpose: `Participation in ${event.name}`,
          status: "APPROVED", // Auto-approved based on attendance
          requestedDate: new Date().toISOString(),
          processedDate: new Date().toISOString(),
          processedBy: "system"
        });
      }

      // Generate Fee Fines if applicable (Boundary: we just output the payload, don't execute transaction)
      if (event.requiresFee && event.feeAmount && event.feeAmount > 0 && att.participantType === "STUDENT") {
        generatedFines.push({
          id: `fine-evt-${Date.now()}-${att.participantId}`,
          studentFeeAccountId: "mock-sfa-1",
          studentId: att.participantId,
          academicYearId: "ay-1",
          semesterId: "sem-1",
          amount: event.feeAmount,
          source: "OTHER",
          reason: `Event Registration Fee: ${event.name}`,
          status: "APPLIED",
          createdAt: new Date().toISOString()
        });
      }
    });

    return { generatedFines, generatedCertificateRequests };
  }
};

export const NotificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const real = await fetchRealApi<Notification[]>('/notifications/notifications');
    return real && real.length > 0 ? real : mockNotifications;
  },
  getNotificationDeliveries: async (): Promise<NotificationDelivery[]> => {
    const real = await fetchRealApi<NotificationDelivery[]>('/notifications/deliveries');
    return real && real.length > 0 ? real : mockNotificationDeliveries;
  },
  getNotificationHistory: async (): Promise<NotificationHistory[]> => {
    const real = await fetchRealApi<NotificationHistory[]>('/notifications/histories');
    return real && real.length > 0 ? real : mockNotificationHistory;
  },

  createDraft: (
    data: Omit<Notification, "id" | "status" | "createdAt" | "updatedAt">,
    adminId: string
  ): { notification: Notification; history: NotificationHistory } => {
    const notification: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const history: NotificationHistory = {
      id: `nhist-${Date.now()}`,
      notificationId: notification.id,
      action: "CREATED",
      timestamp: new Date().toISOString(),
      performedBy: adminId
    };

    return { notification, history };
  },

  publishNotification: (
    notification: Notification,
    students: Student[],
    faculty: Faculty[],
    adminId: string
  ): { updatedNotification: Notification; deliveries: NotificationDelivery[]; history: NotificationHistory } => {
    
    // Resolve Recipients based on targeting logic
    const deliveries: NotificationDelivery[] = [];
    
    // Helper to generate delivery object
    const addDelivery = (recipientId: string, recipientType: "STUDENT" | "FACULTY") => {
      deliveries.push({
        id: `ndel-${Date.now()}-${recipientId}`,
        notificationId: notification.id,
        recipientId,
        recipientType,
        status: "DELIVERED",
        deliveredAt: new Date().toISOString()
      });
    };

    if (notification.audience === "STUDENTS" || notification.audience === "BOTH") {
      let targetStudents = students;

      if (notification.targetScope === "SPECIFIC_COURSE") {
        targetStudents = students.filter(s => notification.targetIds.includes(s.courseId));
      } else if (notification.targetScope === "SPECIFIC_DEPARTMENT") {
        targetStudents = students.filter(s => notification.targetIds.includes(s.departmentId));
      } else if (notification.targetScope === "SPECIFIC_USERS") {
        targetStudents = students.filter(s => notification.targetIds.includes(s.id));
      }

      targetStudents.forEach(s => addDelivery(s.id, "STUDENT"));
    }

    if (notification.audience === "FACULTY" || notification.audience === "BOTH") {
      let targetFaculty = faculty;

      if (notification.targetScope === "SPECIFIC_DEPARTMENT") {
        targetFaculty = faculty.filter(f => notification.targetIds.includes(f.departmentId));
      } else if (notification.targetScope === "SPECIFIC_USERS") {
        targetFaculty = faculty.filter(f => notification.targetIds.includes(f.id));
      }

      targetFaculty.forEach(f => addDelivery(f.id, "FACULTY"));
    }

    const updatedNotification: Notification = {
      ...notification,
      status: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const history: NotificationHistory = {
      id: `nhist-${Date.now()}`,
      notificationId: notification.id,
      action: "PUBLISHED",
      timestamp: new Date().toISOString(),
      performedBy: adminId,
      reason: `Published to ${deliveries.length} resolved recipients.`
    };

    return { updatedNotification, deliveries, history };
  },

  cancelNotification: (
    notification: Notification,
    reason: string,
    adminId: string
  ): { updatedNotification: Notification; history: NotificationHistory } => {
    const updatedNotification: Notification = {
      ...notification,
      status: "CANCELLED",
      updatedAt: new Date().toISOString()
    };

    const history: NotificationHistory = {
      id: `nhist-${Date.now()}`,
      notificationId: notification.id,
      action: "CANCELLED",
      timestamp: new Date().toISOString(),
      performedBy: adminId,
      reason
    };

    return { updatedNotification, history };
  },

  markAsRead: (
    delivery: NotificationDelivery
  ): NotificationDelivery => {
    return {
      ...delivery,
      status: "READ",
      readAt: new Date().toISOString()
    };
  }
};

// ==========================================
// REPORTS & ANALYTICS DOMAIN (Cross-Cutting)
// ==========================================

export const ReportService = {
  // Generates the massive cross-domain College Overview Analytics
  getCollegeOverview: async () => {
    const [
      students,
      faculty,
      departments,
      courses,
      classes,
      fees,
      libraryLoans,
      events,
      certificates,
      placements
    ] = await Promise.all([
      fetchRealApi('/academic/students'),
      fetchRealApi('/academic/faculty'),
      fetchRealApi('/academic/departments'),
      fetchRealApi('/academic/courses'),
      fetchRealApi('/academic/classes'),
      FeeService.getAllFeeAccounts(),
      LibraryService.getLoans(),
      EventService.getEvents(),
      CertificateService.getCertificateRecords(),
      PlacementService.getApplications()
    ]);

    const totalStudents = students.length;
    const totalFaculty = faculty.length;
    const totalDepartments = departments.length;
    const totalCourses = courses.length;
    const totalClasses = classes.length;
    
    const outstandingFeesCount = fees.filter((f: StudentFeeAccount) => f.status === "UNPAID" || f.status === "OVERDUE").length;
    
    const now = new Date();
    const libraryOverdueCount = libraryLoans.filter(l => l.status === "ACTIVE" && new Date(l.dueDate) < now).length;
    
    const activeEventsCount = events.filter(e => e.status === "PUBLISHED" || e.status === "APPROVED").length;
    
    return {
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalCourses,
      totalClasses,
      outstandingFeesCount,
      libraryOverdueCount,
      activeEventsCount,
      totalCertificatesIssued: certificates.filter(c => c.status === "ISSUED").length,
      totalPlacementApplications: placements.length
    };
  }
};

export const CircularService = {
  getAllCirculars: async (): Promise<OfficialCircular[]> => {
    return mockOfficialCirculars;
  }
};

export { CommandCenterService } from "./CommandCenterService";
