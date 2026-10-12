import { test } from 'vitest';
import { prisma } from '@muc/database';

test('clean db', async () => {
  await prisma.eventAttendance.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.libraryLoan.deleteMany();
  await prisma.bookCopy.deleteMany();
  await prisma.bookCatalog.deleteMany();
  await prisma.libraryMember.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.timetableVersion.deleteMany();
  await prisma.attendanceCorrection.deleteMany();
  await prisma.attendanceEntry.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.resultRevision.deleteMany();
  await prisma.resultEntry.deleteMany();
  await prisma.assessmentComponent.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.paymentIntent.deleteMany();
  await prisma.financialCharge.deleteMany();
  await prisma.financialAccount.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.placementApplication.deleteMany();
  await prisma.placementRegistration.deleteMany();
  await prisma.placementDrive.deleteMany();
  await prisma.certificateHistory.deleteMany();
  await prisma.certificateRequest.deleteMany();
  await prisma.profileUpdateRequest.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.academicClass.deleteMany({ where: { code: { contains: 'test', mode: 'insensitive' } } });
  await prisma.programSubject.deleteMany({ where: { code: { contains: 'test', mode: 'insensitive' } } });
  await prisma.curriculumVersion.deleteMany({ where: { code: { contains: 'test', mode: 'insensitive' } } });
  await prisma.program.deleteMany({ where: { code: 'BCA4' } });
  await prisma.faculty.deleteMany();
  await prisma.userRoleAssignment.deleteMany({
    where: {
      user: {
        normalizedEmail: {
          notIn: ['admin@muc.edu', 'superadmin@muc.edu', 'masteradmin@muc.edu', 'master@muc.edu']
        }
      }
    }
  });
  await prisma.faculty.deleteMany();
  await prisma.notificationDelivery.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany({
    where: {
      normalizedEmail: { in: ['faculty@example.com', 'stu@example.com', 'fac4@example.com', 'stu4@example.com', 'fac5@example.com', 'stu5@example.com', 'stu6@example.com'] }
    }
  });
});
