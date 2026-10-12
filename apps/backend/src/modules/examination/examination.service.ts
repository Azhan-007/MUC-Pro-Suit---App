import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';
import { prisma } from '@muc/database';
import { ResultStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ExaminationService {
  /**
   * Submit marks for an assessment
   */
  static async submitMarks(assessmentId: string, entries: { studentEnrollmentId: string; marksObtained: number | null; isAbsent: boolean }[], enteredById: string) {
    return await prisma.$transaction(async (tx) => {
      const assessment = await tx.assessment.findUniqueOrThrow({ where: { id: assessmentId } });
      if (assessment.status === 'PUBLISHED') throw new Error('Cannot submit marks for a published assessment.');

      // We upsert entries
      for (const entry of entries) {
        await tx.resultEntry.upsert({
          where: {
            assessmentId_studentEnrollmentId: {
              assessmentId,
              studentEnrollmentId: entry.studentEnrollmentId
            }
          },
          update: {
            marksObtained: entry.marksObtained,
            isAbsent: entry.isAbsent,
            status: 'SUBMITTED'
          },
          create: {
            assessmentId,
            studentEnrollmentId: entry.studentEnrollmentId,
            marksObtained: entry.marksObtained,
            isAbsent: entry.isAbsent,
            status: 'SUBMITTED',
            enteredById
          }
        });
      }

      await tx.assessment.update({
        where: { id: assessmentId },
        data: { status: 'EVALUATED' }
      });

      return { success: true };
    });
  }

  /**
   * Revise marks with history
   */
  static async reviseMarks(resultEntryId: string, newMarks: number | null, reason: string, revisedById: string) {
    return await prisma.$transaction(async (tx) => {
      const entry = await tx.resultEntry.findUniqueOrThrow({ where: { id: resultEntryId } });
      
      await tx.resultRevision.create({
        data: {
          resultEntryId: entry.id,
          previousMarks: entry.marksObtained,
          newMarks: newMarks ? new Decimal(newMarks) : null,
          reason,
          revisedById
        }
      });

      const res = await tx.resultEntry.update({
        where: { id: resultEntryId },
        data: { marksObtained: newMarks }
      });
      await AuditService.log({
        actorId: revisedById,
        action: 'RESULT_REVISION',
        resourceType: 'ResultEntry',
        resourceId: entry.id,
        outcome: AuditOutcome.SUCCESS,
        beforeState: { marksObtained: entry.marksObtained },
        afterState: { marksObtained: newMarks }
      }, tx);
      return res;
    });
  }

  static async getAllExaminations() {
    return await prisma.assessment.findMany();
  }

  static async getAllResults() {
    return await prisma.resultEntry.findMany();
  }
}
