import { prisma } from '@muc/database';
import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';

export class EventService {
  static async register(eventId: string, userId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const ev = await tx.event.findUniqueOrThrow({ where: { id: eventId } });
      if (ev.status !== 'PUBLISHED') throw new Error('Event is not published');
      
      const existing = await tx.eventRegistration.findFirst({
        where: { eventId, userId }
      });
      if (existing) throw new Error('Duplicate registration prevented');

      if (ev.capacity) {
        const count = await tx.eventRegistration.count({ where: { eventId } });
        if (count >= ev.capacity) throw new Error('Event capacity reached');
      }

      const reg = await tx.eventRegistration.create({
        data: { eventId, userId }
      });

      await AuditService.log({ actorId, action: 'EVENT_REGISTER', resourceType: 'EventRegistration', resourceId: reg.id, outcome: AuditOutcome.SUCCESS }, tx);
      return reg;
    });
  }

  static async markAttendance(eventId: string, userId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const att = await tx.eventAttendance.create({
        data: { eventId, userId }
      });
      await AuditService.log({ actorId, action: 'EVENT_ATTENDANCE', resourceType: 'EventAttendance', resourceId: att.id, outcome: AuditOutcome.SUCCESS }, tx);
      // NOTE: "Event attendance MUST NEVER automatically approve or issue a certificate."
      return att;
    });
  }

  static async getAllEvents() {
    return await prisma.event.findMany();
  }

  static async getAllEventHistorys() {
    return await prisma.eventAttendance.findMany();
  }
}
