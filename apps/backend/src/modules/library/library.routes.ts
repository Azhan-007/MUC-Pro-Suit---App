import { FastifyInstance } from 'fastify';
import { LibraryController } from './library.controller';

export async function libraryRoutes(fastify: FastifyInstance) {
  fastify.post('/issue', { preHandler: [fastify.authenticate, fastify.requireDomain('LIBRARY')] }, LibraryController.issue);
  fastify.post('/return', { preHandler: [fastify.authenticate, fastify.requireDomain('LIBRARY')] }, LibraryController.returnBook);
  fastify.post('/renew', { preHandler: [fastify.authenticate, fastify.requireDomain('LIBRARY', ['STUDENT', 'FACULTY'])] }, LibraryController.renew);
  fastify.get('/books', { preHandler: [fastify.authenticate] }, LibraryController.getAllBooks);
  fastify.get('/copies', { preHandler: [fastify.authenticate] }, LibraryController.getAllCopys);
  fastify.get('/members', { preHandler: [fastify.authenticate] }, LibraryController.getAllMembers);
  fastify.get('/loans', { preHandler: [fastify.authenticate] }, LibraryController.getAllLoans);
  fastify.get('/reservations', { preHandler: [fastify.authenticate] }, LibraryController.getAllReservations);
  fastify.get('/resolutionRecords', { preHandler: [fastify.authenticate] }, LibraryController.getAllResolutionRecords);
}
