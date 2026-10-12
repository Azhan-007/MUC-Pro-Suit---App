import { prisma } from '@muc/database';
import { OutboxStatus } from '@prisma/client';

export interface CreateOutboxEventParams {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  requestId?: string;
}

export class OutboxService {
  static async createEvent(params: CreateOutboxEventParams, tx?: typeof prisma) {
    const client = tx || prisma;
    
    return client.outboxEvent.create({
      data: {
        eventType: params.eventType,
        aggregateType: params.aggregateType,
        aggregateId: params.aggregateId,
        payload: params.payload,
        status: OutboxStatus.PENDING,
        requestId: params.requestId,
      },
    });
  }
}
