import { FastifyReply, FastifyRequest } from 'fastify';
import { FinanceService } from './finance.service';
import { z } from 'zod';

export class FinanceController {
  static async allocate(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      paymentId: z.string().uuid(),
      allocations: z.array(z.object({
        financialChargeId: z.string().uuid(),
        amount: z.number()
      }))
    });
    const data = schema.parse(request.body);
    await FinanceService.allocatePayment(data.paymentId, data.allocations, request.user.userId);
    return reply.send({ success: true });
  }

  static async getAllFeeStructures(req: FastifyRequest, reply: FastifyReply) {
    const data = await FinanceService.getAllFeeStructures();
    return reply.send({ success: true, data });
  }

  static async getAllFeeAccounts(req: FastifyRequest, reply: FastifyReply) {
    const data = await FinanceService.getAllFeeAccounts();
    return reply.send({ success: true, data });
  }

  static async getAllFeePayments(req: FastifyRequest, reply: FastifyReply) {
    const data = await FinanceService.getAllFeePayments();
    return reply.send({ success: true, data });
  }

  static async getAllScholarships(req: FastifyRequest, reply: FastifyReply) {
    const data = await FinanceService.getAllScholarships();
    return reply.send({ success: true, data });
  }

  static async getAllFines(req: FastifyRequest, reply: FastifyReply) {
    const data = await FinanceService.getAllFines();
    return reply.send({ success: true, data });
  }
}
