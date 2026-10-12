import { FastifyInstance } from 'fastify';
import { FinanceController } from './finance.controller';

export async function financeRoutes(fastify: FastifyInstance) {
  fastify.post('/allocate', { preHandler: [fastify.authenticate, fastify.requireDomain('FINANCE')] }, FinanceController.allocate);
  fastify.get('/feeStructures', { preHandler: [fastify.authenticate] }, FinanceController.getAllFeeStructures);
  fastify.get('/feeAccounts', { preHandler: [fastify.authenticate] }, FinanceController.getAllFeeAccounts);
  fastify.get('/payments', { preHandler: [fastify.authenticate] }, FinanceController.getAllFeePayments);
  fastify.get('/scholarships', { preHandler: [fastify.authenticate] }, FinanceController.getAllScholarships);
  fastify.get('/fines', { preHandler: [fastify.authenticate] }, FinanceController.getAllFines);
}
