import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    reqId: string;
    correlationId: string;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    request.reqId = randomUUID();
    request.correlationId = (request.headers['x-correlation-id'] as string) || request.reqId;
    
    reply.header('x-request-id', request.reqId);
    reply.header('x-correlation-id', request.correlationId);
  });
});
