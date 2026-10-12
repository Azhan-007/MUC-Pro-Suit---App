import { FastifyInstance } from 'fastify';
import { EventController } from './events.controller';

export async function eventsRoutes(fastify: FastifyInstance) {
  fastify.post('/register', { preHandler: [fastify.authenticate] }, EventController.register);
  fastify.get('/eventHistories', { preHandler: [fastify.authenticate] }, EventController.getAllEventHistorys);
  fastify.get('/events', { preHandler: [fastify.authenticate] }, EventController.getAllEvents);
}
