import { prisma } from '@muc/database';
import { AuditOutcome } from '@prisma/client';

export interface CreateAuditLogParams {
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId?: string;
  correlationId?: string;
  outcome: AuditOutcome;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(params: CreateAuditLogParams, tx?: typeof prisma | any) {
    const client = tx || prisma;
    
    return client.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        requestId: params.requestId,
        correlationId: params.correlationId,
        outcome: params.outcome,
        beforeState: params.beforeState || null,
        afterState: params.afterState || null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }
}
