import { prisma } from '@muc/database';
import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';

export class LibraryService {
  static async issueBook(memberId: string, bookCopyId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const copy = await tx.bookCopy.findUniqueOrThrow({ where: { id: bookCopyId } });
      if (copy.status !== 'AVAILABLE') throw new Error('Book is not available');

      const member = await tx.libraryMember.findUniqueOrThrow({
        where: { id: memberId }
      });

      const assignments = await tx.userRoleAssignment.findMany({
        where: { userId: member.userId },
        include: { role: true }
      });
      const isStudent = assignments.some(a => a.role.code === 'STUDENT');
      const isFaculty = assignments.some(a => a.role.code === 'FACULTY');
      
      const activeLoans = await tx.libraryLoan.count({
        where: { libraryMemberId: memberId, status: 'ACTIVE' }
      });
      
      if (isStudent && !isFaculty) {
        if (activeLoans >= 2) throw new Error('Maximum active loans reached for student');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loan = await tx.libraryLoan.create({
        data: { libraryMemberId: memberId, bookCopyId, dueDate }
      });

      await tx.bookCopy.update({ where: { id: bookCopyId }, data: { status: 'LOANED' } });

      await AuditService.log({
        actorId, action: 'LIBRARY_ISSUE', resourceType: 'LibraryLoan', resourceId: loan.id, outcome: AuditOutcome.SUCCESS, afterState: loan
      }, tx);

      return loan;
    });
  }

  static async returnBook(loanId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.libraryLoan.findUniqueOrThrow({ where: { id: loanId }, include: { libraryMember: true } });
      if (loan.status !== 'ACTIVE') throw new Error('Loan is not active');

      const now = new Date();
      await tx.libraryLoan.update({
        where: { id: loanId },
        data: { status: 'RETURNED', returnDate: now }
      });
      await tx.bookCopy.update({ where: { id: loan.bookCopyId }, data: { status: 'AVAILABLE' } });

      // Fine logic
      if (now > loan.dueDate) {
        const enrollment = await tx.studentEnrollment.findFirst({
          where: { student: { userId: loan.libraryMember.userId } },
          orderBy: { createdAt: 'desc' }
        });
        if (enrollment) {
          let account = await tx.financialAccount.findUnique({ where: { studentEnrollmentId: enrollment.id } });
          if (!account) {
            account = await tx.financialAccount.create({ data: { studentEnrollmentId: enrollment.id } });
          }
          await tx.financialCharge.create({
            data: { financialAccountId: account.id, chargeType: 'LIBRARY_FINE', amount: 100 }
          });
        }
      }

      await AuditService.log({ actorId, action: 'LIBRARY_RETURN', resourceType: 'LibraryLoan', resourceId: loan.id, outcome: AuditOutcome.SUCCESS }, tx);
      return { success: true };
    });
  }

  static async renewBook(loanId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.libraryLoan.findUniqueOrThrow({ where: { id: loanId }, include: { renewals: true } });
      if (loan.status !== 'ACTIVE') throw new Error('Loan is not active');
      if (loan.renewals.length >= 2) throw new Error('Maximum renewals reached');

      const newDueDate = new Date(loan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 14);

      const renewal = await tx.loanRenewal.create({
        data: { libraryLoanId: loan.id, newDueDate }
      });

      await tx.libraryLoan.update({ where: { id: loanId }, data: { dueDate: newDueDate } });
      await AuditService.log({ actorId, action: 'LIBRARY_RENEWAL', resourceType: 'LibraryLoan', resourceId: loan.id, outcome: AuditOutcome.SUCCESS }, tx);
      return renewal;
    });
  }

  static async getAllBooks() {
    return await prisma.bookCatalog.findMany();
  }

  static async getAllCopys() {
    return await prisma.bookCopy.findMany();
  }

  static async getAllMembers() {
    return await prisma.libraryMember.findMany();
  }

  static async getAllLoans() {
    return await prisma.libraryLoan.findMany();
  }

  static async getAllReservations() {
    return await prisma.libraryReservation.findMany();
  }

  static async getAllResolutionRecords() {
    return await prisma.libraryResolution.findMany();
  }
}
