import { prisma } from '@muc/database';
import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';

export class CertificateService {
  static async requestCertificate(typeId: string, enrollmentId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const type = await tx.certificateType.findUniqueOrThrow({ where: { id: typeId } });
      const req = await tx.certificateRequest.create({
        data: { certificateTypeId: typeId, studentEnrollmentId: enrollmentId, status: 'REQUESTED' }
      });
      await tx.certificateHistory.create({
        data: { requestId: req.id, status: 'REQUESTED' }
      });

      if (type.requiresFee && type.feeAmount) {
        let account = await tx.financialAccount.findUnique({ where: { studentEnrollmentId: enrollmentId } });
        if (!account) account = await tx.financialAccount.create({ data: { studentEnrollmentId: enrollmentId } });
        await tx.financialCharge.create({
          data: { financialAccountId: account.id, chargeType: 'CERTIFICATE_FEE', amount: type.feeAmount }
        });
      }
      
      await AuditService.log({ actorId, action: 'CERTIFICATE_REQUEST', resourceType: 'CertificateRequest', resourceId: req.id, outcome: AuditOutcome.SUCCESS }, tx);
      return req;
    });
  }

  static async updateStatus(requestId: string, status: any, actorId: string, isCertificateAdmin: boolean) {
    return await prisma.$transaction(async (tx) => {
      if (!isCertificateAdmin && ['APPROVED', 'ISSUED', 'REJECTED', 'REVOKED'].includes(status)) {
        throw new Error('Non-Certificate-Admin cannot approve or issue certificate');
      }

      const req = await tx.certificateRequest.update({
        where: { id: requestId },
        data: { status }
      });
      await tx.certificateHistory.create({
        data: { requestId: req.id, status }
      });
      await AuditService.log({ actorId, action: 'CERTIFICATE_UPDATE', resourceType: 'CertificateRequest', resourceId: req.id, outcome: AuditOutcome.SUCCESS }, tx);
      return req;
    });
  }

  static async reissue(requestId: string, actorId: string, isCertificateAdmin: boolean) {
    return await this.updateStatus(requestId, 'SUPERSEDED', actorId, isCertificateAdmin);
  }

  static async getAllCertificateRequests() {
    return await prisma.certificateRequest.findMany();
  }

  static async getAllCertificateRecords() {
    return await prisma.certificateRequest.findMany();
  }

  static async getAllCertificateTypes() {
    return await prisma.certificateType.findMany();
  }

  static async getAllCertificateHistorys() {
    return await prisma.certificateHistory.findMany();
  }
}
