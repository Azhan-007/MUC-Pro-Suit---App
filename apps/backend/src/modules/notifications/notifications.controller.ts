import { FastifyReply, FastifyRequest } from 'fastify';
import { NotificationService } from './notifications.service';
import { z } from 'zod';

export class NotificationController {
  static async publish(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.body);
    const result = await NotificationService.publish(id, req.user.userId);
    return reply.send({ success: true, notification: result });
  }

  static async getAllNotifications(req: FastifyRequest, reply: FastifyReply) {
    const data = await NotificationService.getAllNotifications();
    return reply.send({ success: true, data });
  }

  static async getAllNotificationHistorys(req: FastifyRequest, reply: FastifyReply) {
    const data = await NotificationService.getAllNotificationHistorys();
    return reply.send({ success: true, data });
  }
}
