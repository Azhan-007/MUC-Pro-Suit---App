import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { prisma } from '@muc/database';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (server) => {
    await server.prisma.$disconnect();
  });
});
