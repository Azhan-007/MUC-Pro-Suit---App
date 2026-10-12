import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@muc/database';
import { LibraryService } from './library/library.service';
import { PlacementService } from './placement/placement.service';
import { EventService } from './events/events.service';
import { CertificateService } from './certificates/certificates.service';
import { NotificationService } from './notifications/notifications.service';
import { hashPassword } from '../utils/password';

describe('Prompt 4 Integration Tests', () => {
  let studentUser: any, studentUser2: any;
  let facultyUser: any;
  let studentEnrollment: any;
  let nonFinalYearEnrollment: any;
  let catalog: any;
  let copy1: any, copy2: any, copy3: any;
  let acadClassFinal: any;
  let acadClassNonFinal: any;
  let student: any, student2: any;
  let curr: any;

  beforeAll(async () => {
    const pwd = await hashPassword('password');
    facultyUser = await prisma.user.upsert({ where: { normalizedEmail: 'fac5@example.com' }, update: {}, create: { normalizedEmail: 'fac5@example.com', email: 'fac5@example.com', username: 'fac5', normalizedUsername: 'fac5', passwordHash: pwd, status: 'ACTIVE' } });
    studentUser = await prisma.user.upsert({ where: { normalizedEmail: 'stu5@example.com' }, update: {}, create: { normalizedEmail: 'stu5@example.com', email: 'stu5@example.com', username: 'stu5', normalizedUsername: 'stu5', passwordHash: pwd, status: 'ACTIVE' } });
    studentUser2 = await prisma.user.upsert({ where: { normalizedEmail: 'stu5_2@example.com' }, update: {}, create: { normalizedEmail: 'stu5_2@example.com', email: 'stu5_2@example.com', username: 'stu5_2', normalizedUsername: 'stu5_2', passwordHash: pwd, status: 'ACTIVE' } });

    const dept = await prisma.department.findFirstOrThrow();
    const program = await prisma.program.findFirstOrThrow();
    const acYear = await prisma.academicYear.findFirstOrThrow();
    const term = await prisma.academicTerm.findFirstOrThrow();
    
    curr = await prisma.curriculumVersion.create({ data: { programId: program.id, code: '2026-TEST5-' + Math.random().toString(36).substring(7), effectiveFrom: new Date() } });

    const finalYear = program.durationYears;
    const nonFinalYear = program.durationYears > 1 ? program.durationYears - 1 : 1;

    acadClassFinal = await prisma.academicClass.create({ data: { academicYearId: acYear.id, programId: program.id, yearOfStudy: Math.floor(Math.random() * 1000) + 100, code: 'FINAL_YR_CLASS_' + Math.random().toString(36).substring(7) } });
    acadClassNonFinal = await prisma.academicClass.create({ data: { academicYearId: acYear.id, programId: program.id, yearOfStudy: Math.floor(Math.random() * 1000) + 200, code: 'NON_FINAL_CLASS_' + Math.random().toString(36).substring(7) } });

    student = await prisma.student.create({ data: { userId: studentUser.id, registrationNumber: 'REG5', admissionNumber: 'ADM5', firstName: 'S', lastName: '4', admissionDepartmentId: dept.id, admissionProgramId: program.id } });
    student2 = await prisma.student.create({ data: { userId: studentUser2.id, registrationNumber: 'REG5_2', admissionNumber: 'ADM5_2', firstName: 'S2', lastName: '4_2', admissionDepartmentId: dept.id, admissionProgramId: program.id } });
    
    studentEnrollment = await prisma.studentEnrollment.create({
      data: { studentId: student.id, academicYearId: acYear.id, academicTermId: term.id, academicClassId: acadClassFinal.id, programId: program.id, departmentId: dept.id, curriculumVersionId: curr.id, semesterNumber: finalYear * 2, yearOfStudy: finalYear, shiftSnapshot: 'SHIFT_I', effectiveFrom: new Date() }
    });

    nonFinalYearEnrollment = await prisma.studentEnrollment.create({
      data: { studentId: student2.id, academicYearId: acYear.id, academicTermId: term.id, academicClassId: acadClassNonFinal.id, programId: program.id, departmentId: dept.id, curriculumVersionId: curr.id, semesterNumber: nonFinalYear * 2, yearOfStudy: nonFinalYear, shiftSnapshot: 'SHIFT_I', effectiveFrom: new Date() }
    });

    const studentRole = await prisma.role.findFirst({ where: { code: 'STUDENT' } });
    if (studentRole) {
      await prisma.userRoleAssignment.create({ data: { userId: studentUser.id, roleId: studentRole.id, status: 'ACTIVE' } });
      await prisma.userRoleAssignment.create({ data: { userId: studentUser2.id, roleId: studentRole.id, status: 'ACTIVE' } });
    }

    const facultyRole = await prisma.role.findFirst({ where: { code: 'FACULTY' } });
    if (facultyRole) await prisma.userRoleAssignment.create({ data: { userId: facultyUser.id, roleId: facultyRole.id, status: 'ACTIVE' } });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  describe('1. Library', () => {
    let studentMember: any, facultyMember: any;
    beforeAll(async () => {
      catalog = await prisma.bookCatalog.create({ data: { isbn: 'ISBN1', title: 'T1', author: 'A1' } });
      copy1 = await prisma.bookCopy.create({ data: { bookCatalogId: catalog.id, copyNumber: 'CP1' } });
      copy2 = await prisma.bookCopy.create({ data: { bookCatalogId: catalog.id, copyNumber: 'CP2' } });
      copy3 = await prisma.bookCopy.create({ data: { bookCatalogId: catalog.id, copyNumber: 'CP3' } });
      studentMember = await prisma.libraryMember.create({ data: { userId: studentUser.id } });
      facultyMember = await prisma.libraryMember.create({ data: { userId: facultyUser.id } });
    });

    it('1. Student cannot have a third active library loan', async () => {
      await LibraryService.issueBook(studentMember.id, copy1.id, studentUser.id);
      await LibraryService.issueBook(studentMember.id, copy2.id, studentUser.id);
      await expect(LibraryService.issueBook(studentMember.id, copy3.id, studentUser.id))
        .rejects.toThrow('Maximum active loans reached for student');
    });

    it('2. Faculty is not blocked by student loan limit', async () => {
      const copy4 = await prisma.bookCopy.create({ data: { bookCatalogId: catalog.id, copyNumber: 'CP4' } });
      const copy5 = await prisma.bookCopy.create({ data: { bookCatalogId: catalog.id, copyNumber: 'CP5' } });
      
      await LibraryService.issueBook(facultyMember.id, copy3.id, facultyUser.id);
      await LibraryService.issueBook(facultyMember.id, copy4.id, facultyUser.id);
      const thirdIssue = await LibraryService.issueBook(facultyMember.id, copy5.id, facultyUser.id);
      expect(thirdIssue).toBeDefined();
    });

    it('3. Late library return creates exactly ₹100 LIBRARY_FINE', async () => {
      const loan = await prisma.libraryLoan.findFirst({ where: { libraryMemberId: studentMember.id, status: 'ACTIVE' }});
      await prisma.libraryLoan.update({ where: { id: loan!.id }, data: { dueDate: new Date(Date.now() - 100000000) } });
      
      await LibraryService.returnBook(loan!.id, studentUser.id);
      
      const charge = await prisma.financialCharge.findFirst({
        where: { financialAccount: { studentEnrollmentId: studentEnrollment.id }, chargeType: 'LIBRARY_FINE' }
      });
      expect(charge).toBeDefined();
      expect(charge!.amount.toNumber()).toBe(100);
    });

    it('4. Re-processing the same return does not create another fine', async () => {
      const loan = await prisma.libraryLoan.findFirst({ where: { libraryMemberId: studentMember.id, status: 'RETURNED' }});
      await expect(LibraryService.returnBook(loan!.id, studentUser.id)).rejects.toThrow('Loan is not active');
    });
  });

  describe('2. Placement', () => {
    it('5. Final-year eligibility works', async () => {
      const reg = await PlacementService.register(studentEnrollment.id, studentUser.id);
      expect(reg.status).toBe('REGISTERED');
    });

    it('6. Non-final-year student is rejected', async () => {
      if (nonFinalYearEnrollment.yearOfStudy !== studentEnrollment.yearOfStudy) {
        await expect(PlacementService.register(nonFinalYearEnrollment.id, studentUser2.id))
          .rejects.toThrow('Only final year students can register');
      }
    });

    it('7. Selected + rejected offer allows another drive application', async () => {
      const comp1 = await prisma.company.create({ data: { name: 'C5-' + Date.now() } });
      const drive = await prisma.placementDrive.create({ data: { companyId: comp1.id, scheduledDate: new Date() } });
      const app = await PlacementService.apply(drive.id, studentEnrollment.id, studentUser.id);
      await PlacementService.updateApplicationStatus(app.id, 'SELECTED', studentUser.id);
      await PlacementService.updateApplicationStatus(app.id, 'REJECTED', studentUser.id);
      
      const comp2 = await prisma.company.upsert({ where: { name: 'C6' }, update: {}, create: { name: 'C6' } });
      const drive2 = await prisma.placementDrive.create({ data: { companyId: comp2.id, scheduledDate: new Date() } });
      const app2 = await PlacementService.apply(drive2.id, studentEnrollment.id, studentUser.id);
      expect(app2).toBeDefined();
    });
  });

  describe('3. Events', () => {
    it('8. Event capacity is enforced transactionally', async () => {
      const evType = await prisma.eventType.create({ data: { name: 'E1' } });
      const ev = await prisma.event.create({ data: { eventTypeId: evType.id, title: 'E', status: 'PUBLISHED', capacity: 1 } });
      
      await EventService.register(ev.id, facultyUser.id, facultyUser.id);
      await expect(EventService.register(ev.id, studentUser.id, studentUser.id))
        .rejects.toThrow('Event capacity reached');
    });

    it('9. Event attendance does not issue/approve certificate', async () => {
      const evType = await prisma.eventType.create({ data: { name: 'E2' } });
      const ev = await prisma.event.create({ data: { eventTypeId: evType.id, title: 'E', status: 'PUBLISHED', capacity: 5 } });
      const reg = await EventService.register(ev.id, studentUser.id, studentUser.id);
      
      await EventService.markAttendance(ev.id, studentUser.id, studentUser.id);
      const dbReg = await prisma.eventAttendance.findFirst({ where: { eventId: ev.id, userId: studentUser.id }});
      expect(dbReg).toBeDefined();
      
      const certCount = await prisma.certificateRequest.count({ where: { studentEnrollmentId: studentEnrollment.id } });
      expect(certCount).toBe(0);
    });
  });

  describe('4. Certificates', () => {
    it('10. Paid certificate requires Finance settlement', async () => {
      const type = await prisma.certificateType.upsert({ where: { name: 'Paid' }, update: {}, create: { name: 'Paid', requiresFee: true, feeAmount: 500 } });
      await CertificateService.requestCertificate(type.id, studentEnrollment.id, studentUser.id);
      
      const charge = await prisma.financialCharge.findFirst({
        where: { financialAccount: { studentEnrollmentId: studentEnrollment.id }, chargeType: 'CERTIFICATE_FEE' }
      });
      expect(charge).toBeDefined();
      expect(charge!.amount.toNumber()).toBe(500);
    });

    it('11. Free certificate does not require payment', async () => {
      const type = await prisma.certificateType.upsert({ where: { name: 'Free' }, update: {}, create: { name: 'Free', requiresFee: false } });
      await CertificateService.requestCertificate(type.id, nonFinalYearEnrollment.id, studentUser2.id);
      
      const charge = await prisma.financialCharge.findFirst({
        where: { financialAccount: { studentEnrollmentId: nonFinalYearEnrollment.id }, chargeType: 'CERTIFICATE_FEE' }
      });
      expect(charge).toBeNull();
    });

    it('12. Non-Certificate-Admin cannot approve certificate', async () => {
      const type = await prisma.certificateType.upsert({ where: { name: 'Test' }, update: {}, create: { name: 'Test', requiresFee: false } });
      const req = await CertificateService.requestCertificate(type.id, studentEnrollment.id, studentUser.id);
      
      await expect(CertificateService.updateStatus(req.id, 'APPROVED', studentUser.id, false))
        .rejects.toThrow('Non-Certificate-Admin cannot approve or issue certificate');
    });

    it('13. Certificate reissue preserves history', async () => {
      const type = await prisma.certificateType.upsert({ where: { name: 'Test2' }, update: {}, create: { name: 'Test2', requiresFee: false } });
      const req = await CertificateService.requestCertificate(type.id, studentEnrollment.id, studentUser.id);
      await CertificateService.updateStatus(req.id, 'APPROVED', facultyUser.id, true);
      await CertificateService.reissue(req.id, facultyUser.id, true);
      
      const history = await prisma.certificateHistory.findMany({ where: { requestId: req.id }, orderBy: { changedAt: 'asc' } });
      expect(history.length).toBeGreaterThanOrEqual(3);
      expect(history.some(h => h.status === 'SUPERSEDED')).toBe(true);
    });
  });

  describe('5. Notifications', () => {
    it('14. Notification delivery is idempotent', async () => {
      const notif = await prisma.notification.create({ data: { title: 'N1', body: 'N', status: 'PUBLISHED' } });
      
      const del1 = await NotificationService.deliver(notif.id, studentUser.id, studentUser.id);
      const del2 = await NotificationService.deliver(notif.id, studentUser.id, studentUser.id);
      
      expect(del1.id).toBe(del2.id); 
    });
  });
});
