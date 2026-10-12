import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@muc/database';
import { AcademicService } from './academic/academic.service';
import { AttendanceService } from './attendance/attendance.service';

describe('Persistence Integration Tests', () => {
  let dept: any;
  let program: any;
  let acYear: any;
  let acTerm: any;
  let shift: any;

  let createdCurriculumId: string | null = null;
  let createdClassId: string | null = null;

  beforeAll(async () => {
    dept = await prisma.department.findFirstOrThrow();
    program = await prisma.program.findFirstOrThrow();
    acYear = await prisma.academicYear.findFirst({ where: { status: 'ACTIVE' } }) 
      || await prisma.academicYear.findFirstOrThrow();
    acTerm = await prisma.academicTerm.findFirst({ where: { status: 'ACTIVE' } })
      || await prisma.academicTerm.findFirstOrThrow();
    shift = await prisma.shift.findFirstOrThrow();

    // Ensure Active Curriculum Version exists
    let curriculum = await prisma.curriculumVersion.findFirst({
      where: { programId: program.id, status: 'ACTIVE' }
    });
    if (!curriculum) {
      curriculum = await prisma.curriculumVersion.create({
        data: {
          programId: program.id,
          code: 'V-PERSIST-TEST',
          status: 'ACTIVE',
          effectiveFrom: new Date('2026-01-01')
        }
      });
      createdCurriculumId = curriculum.id;
    }

    // Ensure Academic Class exists for Year of Study 1
    const acClass = await prisma.academicClass.findFirst({
      where: { programId: program.id, academicYearId: acYear.id, yearOfStudy: 1 }
    });
    if (!acClass) {
      const newClass = await prisma.academicClass.create({
        data: {
          programId: program.id,
          academicYearId: acYear.id,
          yearOfStudy: 1,
          code: 'I-' + program.code + '-TEST'
        }
      });
      createdClassId = newClass.id;
    }
  });

  afterAll(async () => {
    if (createdClassId) {
      await prisma.academicClass.delete({ where: { id: createdClassId } });
    }
    if (createdCurriculumId) {
      await prisma.curriculumVersion.delete({ where: { id: createdCurriculumId } });
    }
    await prisma.$disconnect();
  });

  describe('STUDENT PERSISTENCE', () => {
    let testStudent: any;

    afterAll(async () => {
      if (testStudent?.id) {
        await prisma.studentEnrollment.deleteMany({ where: { studentId: testStudent.id } });
        await prisma.student.delete({ where: { id: testStudent.id } });
      }
      if (testStudent?.userId) {
        await prisma.userRoleAssignment.deleteMany({ where: { userId: testStudent.userId } });
        await prisma.user.delete({ where: { id: testStudent.userId } });
      }
    });

    it('create persists student, user, and role', async () => {
      const data = {
        registrationNumber: 'REG-PERSIST-X1',
        admissionNumber: 'ADM-PERSIST-X1',
        firstName: 'Test',
        lastName: 'Student',
        email: 'teststudentx1@example.com',
        dateOfBirth: new Date('2000-01-01'),
        admissionDepartmentId: dept.id,
        admissionProgramId: program.id,
      };

      testStudent = await AcademicService.createStudent(data);

      expect(testStudent).toBeDefined();
      expect(testStudent.userId).not.toBeNull();

      const user = await prisma.user.findUnique({ where: { id: testStudent.userId }, include: { roleAssignments: { include: { role: true } } } });
      expect(user).toBeDefined();
      expect(user!.email).toBe('teststudentx1@example.com');
      expect(user!.roleAssignments.some((ra: any) => ra.role.code === 'STUDENT')).toBe(true);
    });

    it('duplicate registration rejected and no orphan user created', async () => {
      const data = {
        registrationNumber: 'REG-PERSIST-X1', // duplicate
        admissionNumber: 'ADM-PERSIST-X2',
        firstName: 'Test',
        lastName: 'Student 2',
        email: 'teststudent2@example.com',
        dateOfBirth: new Date('2000-01-01'),
        admissionDepartmentId: dept.id,
        admissionProgramId: program.id,
      };

      await expect(AcademicService.createStudent(data)).rejects.toThrow('Duplicate record conflict:');
      
      const orphanUser = await prisma.user.findUnique({ where: { normalizedEmail: 'teststudent2@example.com' } });
      expect(orphanUser).toBeNull();
    });

    it('duplicate email handled', async () => {
      const data = {
        registrationNumber: 'REG-PERSIST-3',
        admissionNumber: 'ADM-PERSIST-3',
        firstName: 'Test',
        lastName: 'Student 3',
        email: 'teststudent1@example.com', // duplicate
        dateOfBirth: new Date('2000-01-01'),
        admissionDepartmentId: dept.id,
        admissionProgramId: program.id,
      };

      await expect(AcademicService.createStudent(data)).rejects.toThrow('Duplicate record conflict:');
      
      const orphanStudent = await prisma.student.findUnique({ where: { registrationNumber: 'REG-PERSIST-3' } });
      expect(orphanStudent).toBeNull();
    });
  });

  describe('FACULTY PERSISTENCE', () => {
    let testFaculty: any;

    afterAll(async () => {
      if (testFaculty?.id) {
        await prisma.faculty.delete({ where: { id: testFaculty.id } });
      }
      if (testFaculty?.userId) {
        await prisma.userRoleAssignment.deleteMany({ where: { userId: testFaculty.userId } });
        await prisma.user.delete({ where: { id: testFaculty.userId } });
      }
    });

    it('create persists faculty, user, and role', async () => {
      const data = {
        employeeId: 'EMP-PERSIST-1',
        firstName: 'Test',
        lastName: 'Faculty',
        email: 'testfaculty1@example.com',
        departmentId: dept.id,
        designation: 'Assistant Professor',
      };

      testFaculty = await AcademicService.createFaculty(data);

      expect(testFaculty).toBeDefined();
      expect(testFaculty.userId).not.toBeNull();

      const user = await prisma.user.findUnique({ where: { id: testFaculty.userId }, include: { roleAssignments: { include: { role: true } } } });
      expect(user).toBeDefined();
      expect(user!.roleAssignments.some((ra: any) => ra.role.code === 'FACULTY')).toBe(true);
    });

    it('duplicate employee ID rejected and rollback', async () => {
      const data = {
        employeeId: 'EMP-PERSIST-1', // duplicate
        firstName: 'Test 2',
        lastName: 'Faculty 2',
        email: 'testfaculty2@example.com',
        departmentId: dept.id,
        designation: 'Professor',
      };

      await expect(AcademicService.createFaculty(data)).rejects.toThrow('Duplicate record conflict:');
      
      const orphanUser = await prisma.user.findUnique({ where: { normalizedEmail: 'testfaculty2@example.com' } });
      expect(orphanUser).toBeNull();
    });
  });

  describe('DEPARTMENT PERSISTENCE', () => {
    let newDept: any;
    it('create and dependency-aware delete', async () => {
      const codeSuffix = Date.now().toString();
      newDept = await AcademicService.createDepartment({ code: `TEST-DEPT-${codeSuffix}`, name: 'Test Dept' });
      expect(newDept).toBeDefined();
      
      const updated = await AcademicService.updateDepartment(newDept.id, { name: 'Test Dept Updated' });
      expect(updated.name).toBe('Test Dept Updated');

      // Create a dependency
      const newProg = await AcademicService.createCourse({
        code: `TEST-PROG-${codeSuffix}`,
        name: 'Test Prog',
        departmentId: newDept.id,
        shiftId: shift.id,
        degree: 'UG',
        durationYears: 3,
        totalSemesters: 6,
        fundingType: 'AIDED'
      });

      await expect(AcademicService.deleteDepartment(newDept.id)).rejects.toThrow('Invalid or in-use foreign key relation:');

      await AcademicService.deleteCourse(newProg.id);
      await AcademicService.deleteDepartment(newDept.id);
      
      const checkDept = await prisma.department.findUnique({ where: { id: newDept.id } });
      expect(checkDept).toBeNull();
    });
  });

  describe('CLASS PERSISTENCE', () => {
    let testClass: any;
    it('duplicate rule correctly enforced', async () => {
      const classCode = `TEST-CLASS-${Date.now()}`;
      testClass = await AcademicService.createClass({
        code: classCode,
        academicYearId: acYear.id,
        programId: program.id,
        yearOfStudy: 99
      });

      await expect(AcademicService.createClass({
        code: classCode + '-2', // different code, but duplicate yearOfStudy/program/acYear
        academicYearId: acYear.id,
        programId: program.id,
        yearOfStudy: 99
      })).rejects.toThrow('Duplicate record conflict:');

      await AcademicService.deleteClass(testClass.id);
    });
  });

  describe('ATTENDANCE PERSISTENCE', () => {
    let session: any;
    let enrollment: any;
    let faculty: any;
    let assignment: any;
    let period: any;
    let subject: any;
    let curriculum: any;
    let studentUser: any;
    let student: any;

    beforeAll(async () => {
      period = await prisma.periodDefinition.findFirstOrThrow();
      const uniqueRun = Date.now().toString();
      
      faculty = await prisma.faculty.create({
        data: {
          employeeId: `EMP-ATT-${uniqueRun}`,
          firstName: 'F', lastName: 'L',
          departmentId: dept.id,
          designation: 'P'
        }
      });

      curriculum = await prisma.curriculumVersion.create({
        data: { programId: program.id, code: `ATT-CURR-${uniqueRun}`, effectiveFrom: new Date() }
      });
      subject = await prisma.programSubject.create({
        data: { curriculumVersionId: curriculum.id, code: `ATT-SUB-${uniqueRun}`, name: 'S', semesterNumber: 1, credits: 3, type: 'CORE' }
      });
      const cls = await AcademicService.createClass({
        code: `ATT-CLASS-${uniqueRun}`,
        academicYearId: acYear.id,
        programId: program.id,
        yearOfStudy: 50
      });

      assignment = await prisma.teachingAssignment.create({
        data: { facultyId: faculty.id, academicTermId: acTerm.id, academicClassId: cls.id, programSubjectId: subject.id, effectiveFrom: new Date() }
      });

      studentUser = await prisma.user.create({
        data: { normalizedEmail: `att-stu-${uniqueRun}@example.com`, passwordHash: 'pwd' }
      });
      student = await prisma.student.create({
        data: { userId: studentUser.id, registrationNumber: `ATT-REG-${uniqueRun}`, admissionNumber: `ATT-ADM-${uniqueRun}`, firstName: 'S', lastName: 'L', admissionDepartmentId: dept.id, admissionProgramId: program.id }
      });
      enrollment = await prisma.studentEnrollment.create({
        data: { studentId: student.id, academicYearId: acYear.id, academicTermId: acTerm.id, academicClassId: cls.id, programId: program.id, departmentId: dept.id, curriculumVersionId: curriculum.id, semesterNumber: 1, yearOfStudy: 50, shiftSnapshot: 'SHIFT_I', effectiveFrom: new Date() }
      });
    });

    afterAll(async () => {
      if (enrollment?.id) {
        await prisma.attendanceCorrection.deleteMany({});
        await prisma.attendanceEntry.deleteMany({ where: { studentEnrollmentId: enrollment.id }});
      }
      if (assignment?.id) {
        await prisma.attendanceSession.deleteMany({ where: { teachingAssignmentId: assignment.id }});
      }
      if (enrollment?.id) await prisma.studentEnrollment.delete({ where: { id: enrollment.id }});
      if (student?.id) await prisma.student.delete({ where: { id: student.id }});
      if (studentUser?.id) {
        await prisma.auditLog.deleteMany({ where: { actorId: studentUser.id }});
        await prisma.user.delete({ where: { id: studentUser.id }});
      }
      if (assignment?.id) await prisma.teachingAssignment.delete({ where: { id: assignment.id }});
      if (assignment?.academicClassId) await prisma.academicClass.deleteMany({ where: { id: assignment.academicClassId }});
      if (subject?.id) await prisma.programSubject.delete({ where: { id: subject.id }});
      if (curriculum?.id) await prisma.curriculumVersion.delete({ where: { id: curriculum.id }});
      if (faculty?.id) await prisma.faculty.delete({ where: { id: faculty.id }});
    });

    it('createSession validates relationships', async () => {
      await expect(AttendanceService.createSession({
        academicTermId: acTerm.id,
        academicClassId: dept.id, // invalid class
        programSubjectId: subject.id,
        teachingAssignmentId: assignment.id,
        date: new Date(),
        periodId: period.id
      })).rejects.toThrow('mutually inconsistent');

      session = await AttendanceService.createSession({
        academicTermId: acTerm.id,
        academicClassId: assignment.academicClassId,
        programSubjectId: subject.id,
        teachingAssignmentId: assignment.id,
        date: new Date(),
        periodId: period.id
      });
      expect(session).toBeDefined();
    });

    it('markAttendance validates enrollment belongs to class', async () => {
      const wrongEnrollment = await prisma.studentEnrollment.findFirst({ where: { id: { not: enrollment.id } }});
      if (wrongEnrollment) {
        await expect(AttendanceService.markAttendance(session.id, [{ studentEnrollmentId: wrongEnrollment.id, status: 'PRESENT' }], studentUser.id))
          .rejects.toThrow('does not belong to the class');
      }
    });

    it('markAttendance preserves history with upsert', async () => {
      await AttendanceService.markAttendance(session.id, [{ studentEnrollmentId: enrollment.id, status: 'ABSENT' }], studentUser.id);
      
      const entries = await prisma.attendanceEntry.findMany({ where: { attendanceSessionId: session.id }});
      expect(entries.length).toBe(1);
      expect(entries[0].status).toBe('ABSENT');

      // Now "correct" the attendance
      await AttendanceService.correctAttendance(entries[0].id, 'PRESENT', 'Mistake', studentUser.id);
      
      // If marked again, should just upsert
      await AttendanceService.markAttendance(session.id, [{ studentEnrollmentId: enrollment.id, status: 'PRESENT' }], studentUser.id);

      const entriesAfter = await prisma.attendanceEntry.findMany({ where: { attendanceSessionId: session.id }});
      expect(entriesAfter.length).toBe(1);
      
      const corrections = await prisma.attendanceCorrection.findMany({ where: { attendanceEntryId: entriesAfter[0].id }});
      expect(corrections.length).toBe(1);
    });

    it('markAttendance rejects if LOCKED', async () => {
      await prisma.attendanceSession.update({ where: { id: session.id }, data: { status: 'LOCKED' }});
      await expect(AttendanceService.markAttendance(session.id, [{ studentEnrollmentId: enrollment.id, status: 'PRESENT' }], studentUser.id))
        .rejects.toThrow('Session is locked');
    });
  });
});
