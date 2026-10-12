import { prisma } from '@muc/database';
import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';

export class NotificationService {
  static async deliver(notificationId: string, userId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.notificationDelivery.findFirst({
        where: { notificationId, userId }
      });
      
      if (existing) {
        if (existing.status === 'DELIVERED') return existing; // idempotent
      }

      const delivery = await tx.notificationDelivery.upsert({
        where: {
          id: existing ? existing.id : '00000000-0000-0000-0000-000000000000'
        },
        create: {
          notificationId, userId, status: 'DELIVERED'
        },
        update: { status: 'DELIVERED' }
      });
      
      await AuditService.log({ actorId, action: 'NOTIFICATION_DELIVER', resourceType: 'NotificationDelivery', resourceId: delivery.id, outcome: AuditOutcome.SUCCESS }, tx);
      return delivery;
    });
  }

  static async publish(notificationId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const notif = await tx.notification.update({
        where: { id: notificationId },
        data: { status: 'PUBLISHED' }
      });
      await AuditService.log({ actorId, action: 'NOTIFICATION_PUBLISH', resourceType: 'Notification', resourceId: notificationId, outcome: AuditOutcome.SUCCESS }, tx);
      return notif;
    });
  }

  static async getAllNotifications() {
    return await prisma.notification.findMany();
  }

  static async getAllNotificationHistorys() {
    return await prisma.notificationDelivery.findMany();
  }
}
