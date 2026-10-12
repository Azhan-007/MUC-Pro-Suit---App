import { FastifyReply, FastifyRequest } from 'fastify';
import { ExaminationService } from './examination.service';
import { z } from 'zod';

export class ExaminationController {
  static async submit(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      assessmentId: z.string().uuid(),
      entries: z.array(z.object({
        studentEnrollmentId: z.string().uuid(),
        marksObtained: z.number().nullable(),
        isAbsent: z.boolean()
      }))
    });
    const data = schema.parse(request.body);
    await ExaminationService.submitMarks(data.assessmentId, data.entries, request.user.userId);
    return reply.send({ success: true });
  }

  static async revise(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      resultEntryId: z.string().uuid(),
      newMarks: z.number().nullable(),
      reason: z.string()
    });
    const data = schema.parse(request.body);
    const updated = await ExaminationService.reviseMarks(data.resultEntryId, data.newMarks, data.reason, request.user.userId);
    return reply.send({ success: true, updated });
  }

  static async getAllExaminations(req: FastifyRequest, reply: FastifyReply) {
    const data = await ExaminationService.getAllExaminations();
    return reply.send({ success: true, data });
  }

  static async getAllResults(req: FastifyRequest, reply: FastifyReply) {
    const data = await ExaminationService.getAllResults();
    return reply.send({ success: true, data });
  }
}
