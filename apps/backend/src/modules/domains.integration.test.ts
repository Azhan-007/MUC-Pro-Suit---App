import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@muc/database';
import { AcademicService } from './academic/academic.service';
import { AttendanceService } from './attendance/attendance.service';
import { ExaminationService } from './examination/examination.service';
import { FinanceService } from './finance/finance.service';
import { LibraryService } from './library/library.service';
import { PlacementService } from './placement/placement.service';
import { EventService } from './events/events.service';
import { CertificateService } from './certificates/certificates.service';
import { NotificationService } from './notifications/notifications.service';

import { hashPassword } from '../utils/password';

describe('Domains Integration Test', () => {
  let testUser: any;
  let term: any;
  let acadClass: any;
  let subject: any;
  let faculty: any;
  let assignment: any;
  let period: any;
  let enrollment: any;
  let timetableVersion: any;

  beforeAll(async () => {

    // 1. Create a test user and faculty
    testUser = await prisma.user.upsert({
      where: { normalizedEmail: 'faculty@example.com' },
      update: {},
      create: {
        normalizedEmail: 'faculty@example.com',
        email: 'faculty@example.com',
        username: 'faculty1',
        normalizedUsername: 'faculty1',
        passwordHash: await hashPassword('password'),
        status: 'ACTIVE'
      }
    });

    const dept = await prisma.department.findFirstOrThrow();
    const program = await prisma.program.findFirstOrThrow();
    const acYear = await prisma.academicYear.findFirstOrThrow();
    term = await prisma.academicTerm.findFirstOrThrow();

    await prisma.faculty.deleteMany({ where: { userId: testUser.id } });
    faculty = await prisma.faculty.create({
      data: {
        userId: testUser.id,
        employeeId: 'EMP123',
        firstName: 'John',
        lastName: 'Doe',
        departmentId: dept.id,
        designation: 'Professor'
      }
    });

    const curriculum = await prisma.curriculumVersion.create({
      data: { programId: program.id, code: '2026-REG-' + Math.random().toString(36).substring(7), effectiveFrom: new Date() }
    });

    subject = await prisma.programSubject.create({
      data: {
        curriculumVersionId: curriculum.id,
        code: 'CS101',
        name: 'Intro to CS',
        semesterNumber: 1,
        credits: 3,
        type: 'CORE'
      }
    });

    acadClass = await prisma.academicClass.create({
      data: {
        academicYearId: acYear.id,
        programId: program.id,
        yearOfStudy: 97,
        code: 'I BCA DOMAIN TEST'
      }
    });

    assignment = await prisma.teachingAssignment.create({
      data: {
        facultyId: faculty.id,
        academicTermId: term.id,
        academicClassId: acadClass.id,
        programSubjectId: subject.id,
        effectiveFrom: new Date()
      }
    });

    period = await prisma.periodDefinition.findFirstOrThrow();

    timetableVersion = await prisma.timetableVersion.create({
      data: {
        academicTermId: term.id,
        academicClassId: acadClass.id,
        versionName: 'V1',
        effectiveFrom: new Date()
      }
    });

    const studentUser = await prisma.user.create({
      data: { normalizedEmail: 'stu@example.com', passwordHash: 'pwd' }
    });

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        registrationNumber: 'REG1',
        admissionNumber: 'ADM1',
        firstName: 'Jane',
        lastName: 'Smith',
        admissionDepartmentId: dept.id,
        admissionProgramId: program.id
      }
    });

    enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        academicYearId: acYear.id,
        academicTermId: term.id,
        academicClassId: acadClass.id,
        programId: program.id,
        departmentId: dept.id,
        curriculumVersionId: curriculum.id,
        semesterNumber: 1,
        yearOfStudy: 1,
        shiftSnapshot: 'SHIFT_I',
        effectiveFrom: new Date()
      }
    });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('Timetable: Should prevent faculty conflict', async () => {
    // 1. Assign correctly
    await AcademicService.assignTimetableSlot({
      timetableVersionId: timetableVersion.id,
      dayOfWeek: 'MONDAY',
      periodId: period.id,
      teachingAssignmentId: assignment.id
    });

    const secondClass = await prisma.academicClass.create({
      data: { academicYearId: acadClass.academicYearId, programId: acadClass.programId, yearOfStudy: Math.floor(Math.random() * 1000) + 10, code: 'IV BCA ' + Math.random().toString(36).substring(7) }
    });
    
    const secondVersion = await prisma.timetableVersion.create({
      data: { academicTermId: term.id, academicClassId: secondClass.id, versionName: 'V1', effectiveFrom: new Date() }
    });

    const secondSubject = await prisma.programSubject.create({
      data: { curriculumVersionId: subject.curriculumVersionId, code: 'CS102-' + Math.random().toString(36).substring(7), name: 'Another Subject', semesterNumber: 1, credits: 3, type: 'CORE' }
    });

    const secondAssignment = await prisma.teachingAssignment.create({
      data: { facultyId: faculty.id, academicTermId: term.id, academicClassId: secondClass.id, programSubjectId: secondSubject.id, effectiveFrom: new Date() }
    });

    await expect(AcademicService.assignTimetableSlot({
      timetableVersionId: secondVersion.id,
      dayOfWeek: 'MONDAY',
      periodId: period.id,
      teachingAssignmentId: secondAssignment.id
    })).rejects.toThrow('Faculty conflict');

    await prisma.teachingAssignment.delete({ where: { id: secondAssignment.id } });
  });

  it('Attendance: Should correctly calculate percentage with LATE as present', async () => {
    const session = await prisma.attendanceSession.create({
      data: {
        academicTermId: term.id,
        academicClassId: acadClass.id,
        programSubjectId: subject.id,
        teachingAssignmentId: assignment.id,
        date: new Date(),
        periodId: period.id,
      }
    });

    await AttendanceService.markAttendance(session.id, [{ studentEnrollmentId: enrollment.id, status: 'LATE' }], testUser.id);
    
    const stats = await AttendanceService.getAttendancePercentage(enrollment.id);
    expect(stats.total).toBe(1);
    expect(stats.presentCount).toBe(1); // LATE counts as PRESENT
    expect(stats.percentage).toBe(100);
  });

  it('Finance: Should prevent overallocation of payment', async () => {
    const account = await prisma.financialAccount.create({
      data: { studentEnrollmentId: enrollment.id }
    });

    const charge = await prisma.financialCharge.create({
      data: {
        financialAccountId: account.id,
        chargeType: 'FEE',
        amount: 1000
      }
    });

    const intent = await prisma.paymentIntent.create({
      data: { financialAccountId: account.id, amount: 500, method: 'CASH' }
    });

    const payment = await prisma.payment.create({
      data: { paymentIntentId: intent.id, amount: 500, status: 'SUCCESS' }
    });

    // 1. Allocate full 500 payment to the 1000 charge - should succeed
    await FinanceService.allocatePayment(payment.id, [{ financialChargeId: charge.id, amount: 500 }]);

    // 2. Try to allocate another 100 from the SAME payment - should fail (payment fully allocated)
    await expect(FinanceService.allocatePayment(payment.id, [{ financialChargeId: charge.id, amount: 100 }]))
      .rejects.toThrow('Total allocations exceed payment amount.');
  });

  it('Library and Events: Should issue book and register event', async () => {
    const catalog = await prisma.bookCatalog.create({ data: { isbn: 'TEST1234', title: 'Test', author: 'A' } });
    const copy = await prisma.bookCopy.create({ data: { bookCatalogId: catalog.id, copyNumber: 'COPY1' } });
    
    const member = await prisma.libraryMember.create({ data: { userId: testUser.id } });
    await LibraryService.issueBook(member.id, copy.id, testUser.id);
    
    const dbCopy = await prisma.bookCopy.findUnique({ where: { id: copy.id }});
    expect(dbCopy!.status).toBe('LOANED');
    
    const evType = await prisma.eventType.create({ data: { name: 'TestEvent' } });
    const ev = await prisma.event.create({ data: { eventTypeId: evType.id, title: 'EV1', status: 'PUBLISHED', capacity: 5 } });
    
    await EventService.register(ev.id, testUser.id, testUser.id);
    const regCount = await prisma.eventRegistration.count({ where: { eventId: ev.id }});
    expect(regCount).toBe(1);
  });
});
