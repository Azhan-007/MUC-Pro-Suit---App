import { FastifyInstance } from 'fastify';
import { PlacementController } from './placement.controller';

export async function placementRoutes(fastify: FastifyInstance) {
  fastify.post('/register', { preHandler: [fastify.authenticate, fastify.requireDomain('PLACEMENT', ['STUDENT'])] }, PlacementController.register);
  fastify.get('/drives', { preHandler: [fastify.authenticate] }, PlacementController.getAllDrives);
  fastify.get('/profiles', { preHandler: [fastify.authenticate] }, PlacementController.getAllProfiles);
  fastify.get('/offers', { preHandler: [fastify.authenticate] }, PlacementController.getAllOffers);
}
