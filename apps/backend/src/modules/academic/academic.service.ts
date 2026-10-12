import { prisma } from '@muc/database';
import { DayOfWeek, Prisma } from '@prisma/client';
import { hashPassword } from '../../utils/password';
import { ConflictError, BadRequestError } from '../../utils/errors';

function handlePrismaError(error: any): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') throw new ConflictError(`Duplicate record conflict: ${error.meta?.target}`);
    if (error.code === 'P2003') throw new BadRequestError(`Invalid or in-use foreign key relation: ${error.meta?.field_name}`);
    if (error.code === 'P2025') throw new BadRequestError(`Record not found or already deleted: ${error.meta?.cause || error.message}`);
  }
  if (error.name === 'NotFoundError') {
      throw new BadRequestError('Record not found.');
  }
  throw error;
}

export class AcademicService {
  /**
   * Timetable assignment with conflict checking.
   */
  static async assignTimetableSlot(data: {
    timetableVersionId: string;
    dayOfWeek: DayOfWeek;
    periodId: string;
    teachingAssignmentId: string;
    roomId?: string;
  }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Lock to prevent concurrent scheduling conflicts for the same faculty
        await tx.$executeRaw`LOCK TABLE timetable_slots IN EXCLUSIVE MODE`;

        const assignment = await tx.teachingAssignment.findUniqueOrThrow({
          where: { id: data.teachingAssignmentId },
          include: { academicClass: true }
        });

        const facultyConflict = await tx.timetableSlot.findFirst({
          where: {
            dayOfWeek: data.dayOfWeek,
            periodId: data.periodId,
            teachingAssignment: {
              facultyId: assignment.facultyId,
              academicTermId: assignment.academicTermId
            }
          }
        });

        if (facultyConflict) {
          throw new ConflictError('Faculty conflict: Faculty is already assigned to another class during this period.');
        }

        return await tx.timetableSlot.create({
          data: {
            timetableVersionId: data.timetableVersionId,
            dayOfWeek: data.dayOfWeek,
            periodId: data.periodId,
            teachingAssignmentId: data.teachingAssignmentId,
            roomId: data.roomId
          }
        });
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Class conflict: A subject is already scheduled for this period.');
      }
      handlePrismaError(error);
    }
  }

  static async getAllStudents(query: { page?: number, limit?: number, classId?: string } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.classId) {
      where.enrollments = { some: { academicClassId: query.classId, status: 'ACTIVE' } };
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          enrollments: {
            where: { status: 'ACTIVE' },
            orderBy: { effectiveFrom: 'desc' },
            take: 1
          }
        }
      })
    ]);
    
    return students.map(s => {
      const activeEnrollment = s.enrollments[0];
      return {
        ...s,
        courseId: activeEnrollment?.programId,
        departmentId: activeEnrollment?.departmentId,
        currentSemester: activeEnrollment?.semesterNumber || 1,
        academicClassId: activeEnrollment?.academicClassId
      };
    });
  }

  static async getStudentById(id: string) {
    const s = await prisma.student.findUniqueOrThrow({
      where: { id },
      include: {
        enrollments: {
          orderBy: { effectiveFrom: 'desc' }
        }
      }
    });
    const activeEnrollment = s.enrollments.find(e => e.status === 'ACTIVE') || s.enrollments[0];
    return {
      ...s,
      courseId: activeEnrollment?.programId,
      departmentId: activeEnrollment?.departmentId,
      currentSemester: activeEnrollment?.semesterNumber || 1,
      academicClassId: activeEnrollment?.academicClassId
    };
  }

  static async getAllFaculty(query: { page?: number, limit?: number, departmentId?: string } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;

    const [total, faculties] = await Promise.all([
      prisma.faculty.count({ where }),
      prisma.faculty.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: true,
        }
      })
    ]);

    return {
      data: faculties,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getFacultyById(id: string) {
    return await prisma.faculty.findUniqueOrThrow({
      where: { id },
      include: {
        department: true,
      }
    });
  }

  static async getAllDepartments() {
    const depts = await prisma.department.findMany({
      include: {
        leadershipAssignments: {
          where: { role: 'HOD', status: 'ACTIVE' },
          take: 1
        }
      }
    });
    
    return depts.map(d => ({
      ...d,
      hodId: d.leadershipAssignments[0]?.facultyId || null
    }));
  }

  static async getDepartmentById(id: string) {
    const d = await prisma.department.findUniqueOrThrow({
      where: { id },
      include: {
        leadershipAssignments: {
          where: { role: 'HOD', status: 'ACTIVE' },
          take: 1
        }
      }
    });
    return {
      ...d,
      hodId: d.leadershipAssignments[0]?.facultyId || null
    };
  }

  static async getAllCourses(query: { page?: number, limit?: number, departmentId?: string } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;

    const [total, courses] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.findMany({
        where,
        skip,
        take: limit,
        include: {
          shift: true
        }
      })
    ]);

    return {
      data: courses.map(c => ({
        ...c,
        shift: c.shift?.code
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getCourseById(id: string) {
    const c = await prisma.program.findUniqueOrThrow({
      where: { id },
      include: {
        shift: true
      }
    });
    return {
      ...c,
      shift: c.shift?.code
    };
  }

  static async getAllSubjects() {
    const subjects = await prisma.programSubject.findMany({
      include: {
        curriculumVersion: true,
        teachingAssignments: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    return subjects.map(s => ({
      ...s,
      courseId: s.curriculumVersion.programId,
      facultyIds: s.teachingAssignments.map(ta => ta.facultyId)
    }));
  }

  static async getAllClasses() {
    const classes = await prisma.academicClass.findMany({
      include: {
        program: {
          include: { shift: true }
        }
      }
    });
    
    return classes.map(c => ({
      ...c,
      courseId: c.programId,
      shift: c.program?.shift?.code,
      semesterNumber: (c.yearOfStudy * 2) - 1 // Approximation for Fall/Odd term
    }));
  }

  static async getClassById(id: string) {
    try {
      const c = await prisma.academicClass.findUniqueOrThrow({
        where: { id },
        include: {
          program: {
            include: { shift: true }
          }
        }
      });
      
      return {
        ...c,
        courseId: c.programId,
        shift: c.program?.shift?.code,
        semesterNumber: (c.yearOfStudy * 2) - 1
      };
    } catch (e) {
      handlePrismaError(e);
    }
  }

  static async getAllAcademicYears() {
    return await prisma.academicYear.findMany();
  }

  static async getAllSemesters() {
    return await prisma.academicTerm.findMany();
  }

  static async getTimetableEntries() {
    const slots = await prisma.timetableSlot.findMany({
      include: {
        teachingAssignment: {
          include: {
            academicClass: { include: { program: { include: { shift: true } } } }
          }
        },
        period: true,
        timetableVersion: true
      }
    });

    return slots.map(s => ({
      id: s.id,
      academicYearId: s.teachingAssignment.academicClass.academicYearId,
      semesterId: s.timetableVersion.academicTermId,
      shift: s.teachingAssignment.academicClass.program.shift.code,
      dayOfWeek: s.dayOfWeek,
      period: s.period.code,
      courseId: s.teachingAssignment.academicClass.programId,
      classId: s.teachingAssignment.academicClassId,
      subjectId: s.teachingAssignment.programSubjectId,
      facultyId: s.teachingAssignment.facultyId,
      roomId: s.roomId
    }));
  }

  static async saveTimetableEntry(data: any) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Lock to prevent concurrent scheduling conflicts
        await tx.$executeRaw`LOCK TABLE timetable_slots IN EXCLUSIVE MODE`;

        // 0. Validate entities
        const faculty = await tx.faculty.findUnique({ where: { id: data.facultyId } });
        if (!faculty) throw new BadRequestError('Faculty not found.');
        if (faculty.status !== 'ACTIVE') throw new BadRequestError('Faculty must be ACTIVE to be assigned to a timetable slot.');

        const cls = await tx.academicClass.findUnique({
           where: { id: data.classId },
           include: { program: true }
        });
        if (!cls) throw new BadRequestError('Class not found.');

        const subject = await tx.programSubject.findUnique({ where: { id: data.subjectId } });
        if (!subject) throw new BadRequestError('Subject not found.');

        const period = await tx.periodDefinition.findUnique({
          where: {
            shiftId_code: {
              shiftId: cls.program.shiftId,
              code: data.period
            }
          }
        });
        if (!period) throw new BadRequestError('Period not found for shift.');

        // 1. Find or create TimetableVersion
        let version = await tx.timetableVersion.findFirst({
          where: { academicTermId: data.semesterId, academicClassId: data.classId }
        });
        if (!version) {
          version = await tx.timetableVersion.create({
            data: {
              academicTermId: data.semesterId,
              academicClassId: data.classId,
              versionName: 'Default Version',
              effectiveFrom: new Date()
            }
          });
        }

        // 2. Find or create TeachingAssignment
        let assignment = await tx.teachingAssignment.findFirst({
          where: {
            facultyId: data.facultyId,
            academicTermId: data.semesterId,
            academicClassId: data.classId,
            programSubjectId: data.subjectId
          }
        });
        if (!assignment) {
          assignment = await tx.teachingAssignment.create({
            data: {
              facultyId: data.facultyId,
              academicTermId: data.semesterId,
              academicClassId: data.classId,
              programSubjectId: data.subjectId,
              status: 'ACTIVE',
              effectiveFrom: new Date()
            }
          });
        } else if (assignment.status !== 'ACTIVE') {
          assignment = await tx.teachingAssignment.update({
            where: { id: assignment.id },
            data: { status: 'ACTIVE' }
          });
        }

        // Check conflicts
        const facultyConflict = await tx.timetableSlot.findFirst({
          where: {
            dayOfWeek: data.dayOfWeek,
            periodId: period.id,
            teachingAssignment: {
              facultyId: data.facultyId,
              academicTermId: data.semesterId
            }
          }
        });

        const isNew = !data.id || String(data.id).startsWith('tt-new');
        if (facultyConflict && (isNew || facultyConflict.id !== data.id)) {
          throw new ConflictError('Faculty conflict: Faculty is already assigned to another class during this period.');
        }

        // Class conflict
        const classConflict = await tx.timetableSlot.findFirst({
          where: {
            dayOfWeek: data.dayOfWeek,
            periodId: period.id,
            timetableVersionId: version.id
          }
        });

        if (classConflict && (isNew || classConflict.id !== data.id)) {
          throw new ConflictError('Class conflict: A subject is already scheduled for this period.');
        }

        if (isNew) {
           return await tx.timetableSlot.create({
             data: {
               timetableVersionId: version.id,
               dayOfWeek: data.dayOfWeek,
               periodId: period.id,
               teachingAssignmentId: assignment.id,
               roomId: data.roomId
             }
           });
        } else {
           return await tx.timetableSlot.update({
             where: { id: data.id },
             data: {
               timetableVersionId: version.id,
               dayOfWeek: data.dayOfWeek,
               periodId: period.id,
               teachingAssignmentId: assignment.id,
               roomId: data.roomId
             }
           });
        }
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }

  static async deleteTimetableEntry(id: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Lock to prevent race conditions during deletion
        await tx.$executeRaw`LOCK TABLE timetable_slots IN EXCLUSIVE MODE`;

        const slot = await tx.timetableSlot.findUnique({
          where: { id },
          include: { teachingAssignment: true }
        });
        
        if (!slot) return null;

        await tx.timetableSlot.delete({ where: { id } });

        // Check if teachingAssignment is still referenced by other timetable slots
        const otherSlotsCount = await tx.timetableSlot.count({
          where: { teachingAssignmentId: slot.teachingAssignmentId }
        });

        if (otherSlotsCount === 0) {
          // Check for historical dependencies (e.g. attendance sessions)
          const attendanceCount = await tx.attendanceSession.count({
            where: { teachingAssignmentId: slot.teachingAssignmentId }
          });

          if (attendanceCount > 0) {
            // Safely deactivate to protect historical data
            await tx.teachingAssignment.update({
              where: { id: slot.teachingAssignmentId },
              data: { status: 'REVOKED', effectiveTo: new Date() }
            });
          } else {
            // Safe to delete physically
            await tx.teachingAssignment.delete({
              where: { id: slot.teachingAssignmentId }
            });
          }
        }

        return slot;
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }

  // --- CRUD Implementations ---

    static async createStudent(data: any) {
    try {
      return await prisma.$transaction(async (tx) => {
        const studentRole = await tx.role.findUnique({ where: { code: 'STUDENT' } });
        let finalUserId = null;
        if (data.email && studentRole) {
          // Check if a user with this username or email already exists (e.g., from a failed previous attempt)
          const existingUser = await tx.user.findFirst({
            where: {
              OR: [
                { normalizedUsername: data.registrationNumber.toLowerCase() },
                { normalizedEmail: data.email.toLowerCase() }
              ]
            }
          });
          if (existingUser) {
            finalUserId = existingUser.id;
          } else {
            const user = await tx.user.create({
              data: {
                normalizedEmail: data.email.toLowerCase(),
                email: data.email,
                username: data.registrationNumber,
                normalizedUsername: data.registrationNumber.toLowerCase(),
                passwordHash: await hashPassword('password123'), // Beta fallback
                status: 'ACTIVE',
                roleAssignments: {
                  create: { roleId: studentRole.id }
                }
              }
            });
            finalUserId = user.id;
          }
        }
        const student = await tx.student.create({
          data: {
            registrationNumber: data.registrationNumber,
            admissionNumber: data.admissionNumber,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            normalizedEmail: data.email ? data.email.toLowerCase() : null,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            admissionDepartmentId: data.departmentId || data.admissionDepartmentId,
            admissionProgramId: data.courseId || data.admissionProgramId,
            userId: finalUserId
          }
        });

        const deptId = data.departmentId || data.admissionDepartmentId;
        const progId = data.courseId || data.admissionProgramId;
        const currentSemester = data.currentSemester || 1;
        const yearOfStudy = Math.ceil(currentSemester / 2);

        // Resolve relations for enrollment
        const year = await tx.academicYear.findFirst({ where: { isActive: true } });
        if (!year) throw new BadRequestError("Active Academic Year is not configured. Cannot enroll student.");

        const term = await tx.academicTerm.findFirst({ where: { academicYearId: year.id, isActive: true } });
        if (!term) throw new BadRequestError("Active Academic Term is not configured. Cannot enroll student.");

        const program = await tx.program.findUnique({ 
          where: { id: progId },
          include: { shift: true }
        });
        if (!program) throw new BadRequestError("Program not found.");
        
        if (program.departmentId !== deptId) {
          throw new BadRequestError("The selected Program does not belong to the selected Department.");
        }

        const curriculum = await tx.curriculumVersion.findFirst({ 
          where: { programId: progId, status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        });
        if (!curriculum) throw new BadRequestError("No active Curriculum Version found for the selected Program.");

        const classes = await tx.academicClass.findMany({
          where: { 
            programId: progId,
            academicYearId: year.id,
            yearOfStudy: yearOfStudy,
            status: 'ACTIVE'
          }
        });

        if (classes.length === 0) {
          throw new BadRequestError(`No active class found for Program ${program.code}, Year ${year.code}, Year of Study ${yearOfStudy}.`);
        }
        if (classes.length > 1) {
          throw new BadRequestError(`Ambiguous class assignment: Multiple active classes found for Year of Study ${yearOfStudy}. Please specify section/class explicitly.`);
        }

        const classRecord = classes[0];

        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            academicYearId: year.id,
            academicTermId: term.id,
            academicClassId: classRecord.id,
            programId: progId,
            departmentId: deptId,
            curriculumVersionId: curriculum.id,
            semesterNumber: currentSemester,
            yearOfStudy: yearOfStudy,
            shiftSnapshot: program.shift.code,
            effectiveFrom: new Date(),
            status: 'ACTIVE'
          }
        });

        return student;
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
  static async updateStudent(id: string, data: any) { 
    try { return await prisma.student.update({ where: { id }, data }); } catch(e) { handlePrismaError(e); }
  }
  static async deleteStudent(id: string) { 
    try { return await prisma.student.delete({ where: { id } }); } catch(e) { handlePrismaError(e); }
  }

  static async createFaculty(data: any) {
    try {
      return await prisma.$transaction(async (tx) => {
        const facultyRole = await tx.role.findUnique({ where: { code: 'FACULTY' } });
        let finalUserId = null;
        if (data.email && facultyRole) {
          // Check if a user with this username or email already exists (e.g., from a failed previous attempt)
          const existingUser = await tx.user.findFirst({
            where: {
              OR: [
                { normalizedUsername: data.employeeId.toLowerCase() },
                { normalizedEmail: data.email.toLowerCase() }
              ]
            }
          });
          if (existingUser) {
            finalUserId = existingUser.id;
          } else {
            const user = await tx.user.create({
              data: {
                normalizedEmail: data.email.toLowerCase(),
                email: data.email,
                username: data.employeeId,
                normalizedUsername: data.employeeId.toLowerCase(),
                passwordHash: await hashPassword('password123'), // Beta fallback
                status: 'ACTIVE',
                roleAssignments: {
                  create: { roleId: facultyRole.id }
                }
              }
            });
            finalUserId = user.id;
          }
        }
        const faculty = await tx.faculty.create({
          data: {
            employeeId: data.employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            normalizedEmail: data.email ? data.email.toLowerCase() : null,
            phone: data.phone,
            departmentId: data.departmentId,
            designation: data.designation,
            specialization: data.specialization,
            userId: finalUserId
          }
        });
        
        return faculty;
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
  static async updateFaculty(id: string, data: any) { 
    try { return await prisma.faculty.update({ where: { id }, data }); } catch(e) { handlePrismaError(e); }
  }
  static async deleteFaculty(id: string) { 
    try { 
      return await prisma.$transaction(async (tx) => {
        const hasAssignments = await tx.teachingAssignment.count({ where: { facultyId: id } });
        if (hasAssignments > 0) throw new BadRequestError('Cannot delete faculty with active teaching assignments.');
        return await tx.faculty.delete({ where: { id } }); 
      });
    } catch(e) { handlePrismaError(e); }
  }

  static async createDepartment(data: any) { 
    try { return await prisma.department.create({ data }); } catch(e) { handlePrismaError(e); }
  }
  static async updateDepartment(id: string, data: any) { 
    try { return await prisma.department.update({ where: { id }, data }); } catch(e) { handlePrismaError(e); }
  }
  static async deleteDepartment(id: string) { 
    try { 
      return await prisma.$transaction(async (tx) => {
        const hasStudents = await tx.student.count({ 
          where: { 
            OR: [
              { admissionDepartmentId: id },
              { enrollments: { some: { departmentId: id } } }
            ]
          } 
        });
        if (hasStudents > 0) throw new BadRequestError('Cannot delete department because it has students enrolled.');
        const hasPrograms = await tx.program.count({ where: { departmentId: id } });
        if (hasPrograms > 0) throw new BadRequestError('Cannot delete department because it has active programs/courses.');
        return await tx.department.delete({ where: { id } }); 
      });
    } catch(e) { handlePrismaError(e); }
  }

  static async createCourse(data: any) { 
    try { return await prisma.program.create({ data }); } catch(e) { handlePrismaError(e); }
  }
  static async updateCourse(id: string, data: any) { 
    try { return await prisma.program.update({ where: { id }, data }); } catch(e) { handlePrismaError(e); }
  }
  static async deleteCourse(id: string) { 
    try { 
      return await prisma.$transaction(async (tx) => {
        const hasClasses = await tx.academicClass.count({ where: { programId: id } });
        if (hasClasses > 0) throw new BadRequestError('Cannot delete course/program because it has active classes.');
        const hasStudents = await tx.studentEnrollment.count({ where: { programId: id } });
        if (hasStudents > 0) throw new BadRequestError('Cannot delete course/program because students are enrolled in it.');
        return await tx.program.delete({ where: { id } }); 
      });
    } catch(e) { handlePrismaError(e); }
  }

  static async createClass(data: any) { 
    try { return await prisma.academicClass.create({ data }); } catch(e) { handlePrismaError(e); }
  }
  static async updateClass(id: string, data: any) { 
    try { return await prisma.academicClass.update({ where: { id }, data }); } catch(e) { handlePrismaError(e); }
  }
  static async deleteClass(id: string) { 
    try { 
      return await prisma.$transaction(async (tx) => {
        const enrollments = await tx.studentEnrollment.count({ where: { academicClassId: id } });
        if (enrollments > 0) throw new BadRequestError('Cannot delete class because students are currently enrolled in it.');
        
        const attendance = await tx.attendanceSession.count({ where: { academicClassId: id } });
        if (attendance > 0) throw new BadRequestError('Cannot delete class because it has recorded attendance sessions.');

        // Cascade delete metadata
        await tx.timetableSlot.deleteMany({ where: { timetableVersion: { academicClassId: id } } });
        await tx.timetableVersion.deleteMany({ where: { academicClassId: id } });
        await tx.teachingAssignment.deleteMany({ where: { academicClassId: id } });
        
        return await tx.academicClass.delete({ where: { id } }); 
      });
    } catch(e) { handlePrismaError(e); }
  }

  static async createSubject(data: any) {
    try {
      return await prisma.$transaction(async (tx) => {
        let curriculum = await tx.curriculumVersion.findFirst({
          where: { programId: data.courseId, status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        });

        if (!curriculum) {
          curriculum = await tx.curriculumVersion.create({
            data: {
              programId: data.courseId,
              code: `DEFAULT-CURRICULUM`,
              effectiveFrom: new Date(),
              status: 'ACTIVE'
            }
          });
        }

        const subject = await tx.programSubject.create({
          data: {
            curriculumVersionId: curriculum.id,
            code: data.code,
            name: data.name,
            semesterNumber: data.semesterNumber,
            credits: data.credits,
            type: data.type
          }
        });

        if (data.facultyId) {
          const year = await tx.academicYear.findFirst({ where: { isActive: true } });
          if (!year) throw new BadRequestError("Active Academic Year is not configured. Cannot assign faculty.");
          
          const term = await tx.academicTerm.findFirst({ where: { academicYearId: year.id, isActive: true } });
          if (!term) throw new BadRequestError("Active Academic Term is not configured. Cannot assign faculty.");
          
          const classRecord = await tx.academicClass.findFirst({
            where: {
              programId: data.courseId,
              academicYearId: year.id,
              yearOfStudy: Math.ceil(data.semesterNumber / 2),
              status: 'ACTIVE'
            }
          });
          
          if (!classRecord) {
            throw new BadRequestError(`Cannot assign faculty: No active class exists for this Program and Year of Study (${Math.ceil(data.semesterNumber / 2)}). Please create the Class first.`);
          }

          await tx.teachingAssignment.create({
            data: {
              facultyId: data.facultyId,
              academicTermId: term.id,
              academicClassId: classRecord.id,
              programSubjectId: subject.id,
              effectiveFrom: new Date(),
              status: 'ACTIVE'
            }
          });
        }
        
        return subject;
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }
  
  static async updateSubject(id: string, data: any) {
    try { return await prisma.programSubject.update({ where: { id }, data }); } catch(e) { handlePrismaError(e); }
  }

  static async deleteSubject(id: string) {
    try { return await prisma.programSubject.delete({ where: { id } }); } catch(e) { handlePrismaError(e); }
  }
}
