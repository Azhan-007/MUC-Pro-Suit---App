import { FastifyReply, FastifyRequest } from 'fastify';
import { EventService } from './events.service';
import { z } from 'zod';

export class EventController {
  static async register(req: FastifyRequest, reply: FastifyReply) {
    const { eventId } = z.object({ eventId: z.string().uuid() }).parse(req.body);
    const reg = await EventService.register(eventId, req.user.userId, req.user.userId);
    return reply.send({ success: true, reg });
  }

  static async getAllEvents(req: FastifyRequest, reply: FastifyReply) {
    const data = await EventService.getAllEvents();
    return reply.send({ success: true, data });
  }

  static async getAllEventHistorys(req: FastifyRequest, reply: FastifyReply) {
    const data = await EventService.getAllEventHistorys();
    return reply.send({ success: true, data });
  }
}
