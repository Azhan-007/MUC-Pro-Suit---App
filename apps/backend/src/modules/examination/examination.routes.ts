import { FastifyInstance } from 'fastify';
import { ExaminationController } from './examination.controller';

export async function examinationRoutes(fastify: FastifyInstance) {
  fastify.post('/submit', { preHandler: [fastify.authenticate, fastify.requireDomain('EXAMINATION', ['FACULTY'])] }, ExaminationController.submit);
  fastify.post('/revise', { preHandler: [fastify.authenticate, fastify.requireDomain('EXAMINATION')] }, ExaminationController.revise);
  fastify.get('/examinations', { preHandler: [fastify.authenticate] }, ExaminationController.getAllExaminations);
  fastify.get('/results', { preHandler: [fastify.authenticate] }, ExaminationController.getAllResults);
}
