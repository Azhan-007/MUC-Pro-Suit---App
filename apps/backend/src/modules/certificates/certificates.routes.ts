import { FastifyInstance } from 'fastify';
import { CertificateController } from './certificates.controller';

export async function certificateRoutes(fastify: FastifyInstance) {
  fastify.post('/request', { preHandler: [fastify.authenticate] }, CertificateController.request);
  fastify.get('/requests', { preHandler: [fastify.authenticate] }, CertificateController.getAllCertificateRequests);
  fastify.get('/records', { preHandler: [fastify.authenticate] }, CertificateController.getAllCertificateRecords);
  fastify.get('/types', { preHandler: [fastify.authenticate] }, CertificateController.getAllCertificateTypes);
  fastify.get('/histories', { preHandler: [fastify.authenticate] }, CertificateController.getAllCertificateHistorys);
}
