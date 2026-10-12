import { prisma } from '@muc/database';
import { IdempotencyStatus } from '@prisma/client';
import { ConflictError } from '../utils/errors';

export interface CheckIdempotencyParams {
  actorId?: string;
  subjectKey: string;
  key: string;
  operation: string;
  requestHash?: string;
  ttlSeconds?: number;
}

export class IdempotencyService {
  static async executeWithIdempotency<T>(
    params: CheckIdempotencyParams,
    operationFn: () => Promise<T>
  ): Promise<T> {
    const ttl = params.ttlSeconds || 86400; // default 24h
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const existingKey = await prisma.idempotencyKey.findUnique({
      where: {
        subjectKey_key_operation: {
          subjectKey: params.subjectKey,
          key: params.key,
          operation: params.operation,
        }
      }
    });

    if (existingKey) {
      if (existingKey.status === IdempotencyStatus.COMPLETED) {
        return existingKey.responseBody as unknown as T;
      }
      if (existingKey.status === IdempotencyStatus.IN_PROGRESS) {
        throw new ConflictError('Operation is already in progress');
      }
    }

    const key = await prisma.idempotencyKey.upsert({
      where: {
        subjectKey_key_operation: {
          subjectKey: params.subjectKey,
          key: params.key,
          operation: params.operation,
        }
      },
      create: {
        actorId: params.actorId,
        subjectKey: params.subjectKey,
        key: params.key,
        operation: params.operation,
        requestHash: params.requestHash,
        status: IdempotencyStatus.IN_PROGRESS,
        expiresAt,
      },
      update: {
        status: IdempotencyStatus.IN_PROGRESS,
        expiresAt,
      }
    });

    try {
      const result = await operationFn();

      await prisma.idempotencyKey.update({
        where: { id: key.id },
        data: {
          status: IdempotencyStatus.COMPLETED,
          responseCode: 200,
          responseBody: result ? (result as any) : null,
        }
      });

      return result;
    } catch (error: any) {
      await prisma.idempotencyKey.update({
        where: { id: key.id },
        data: {
          status: IdempotencyStatus.FAILED,
          responseCode: error.statusCode || 500,
          responseBody: { message: error.message },
        }
      });
      throw error;
    }
  }
}
