import { FastifyInstance } from 'fastify';
import { getAppVersion } from './system.controller';

export async function systemRoutes(fastify: FastifyInstance) {
  fastify.get('/ota', getAppVersion);
}
