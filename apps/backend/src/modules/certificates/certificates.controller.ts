import { FastifyReply, FastifyRequest } from 'fastify';
import { CertificateService } from './certificates.service';
import { z } from 'zod';

export class CertificateController {
  static async request(req: FastifyRequest, reply: FastifyReply) {
    const { typeId, enrollmentId } = z.object({ typeId: z.string().uuid(), enrollmentId: z.string().uuid() }).parse(req.body);
    const result = await CertificateService.requestCertificate(typeId, enrollmentId, req.user.userId);
    return reply.send({ success: true, request: result });
  }

  static async getAllCertificateRequests(req: FastifyRequest, reply: FastifyReply) {
    const data = await CertificateService.getAllCertificateRequests();
    return reply.send({ success: true, data });
  }

  static async getAllCertificateRecords(req: FastifyRequest, reply: FastifyReply) {
    const data = await CertificateService.getAllCertificateRecords();
    return reply.send({ success: true, data });
  }

  static async getAllCertificateTypes(req: FastifyRequest, reply: FastifyReply) {
    const data = await CertificateService.getAllCertificateTypes();
    return reply.send({ success: true, data });
  }

  static async getAllCertificateHistorys(req: FastifyRequest, reply: FastifyReply) {
    const data = await CertificateService.getAllCertificateHistorys();
    return reply.send({ success: true, data });
  }
}
