import { FastifyReply, FastifyRequest } from 'fastify';
import { PlacementService } from './placement.service';
import { z } from 'zod';

export class PlacementController {
  static async register(req: FastifyRequest, reply: FastifyReply) {
    const { enrollmentId } = z.object({ enrollmentId: z.string().uuid() }).parse(req.body);
    const reg = await PlacementService.register(enrollmentId, req.user.userId);
    return reply.send({ success: true, reg });
  }

  static async getAllDrives(req: FastifyRequest, reply: FastifyReply) {
    const data = await PlacementService.getAllDrives();
    return reply.send({ success: true, data });
  }

  static async getAllProfiles(req: FastifyRequest, reply: FastifyReply) {
    const data = await PlacementService.getAllProfiles();
    return reply.send({ success: true, data });
  }

  static async getAllOffers(req: FastifyRequest, reply: FastifyReply) {
    const data = await PlacementService.getAllOffers();
    return reply.send({ success: true, data });
  }
}
