import { FastifyInstance } from 'fastify';
import { NotificationController } from './notifications.controller';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.post('/publish', { preHandler: [fastify.authenticate, fastify.requireDomain('NOTIFICATION')] }, NotificationController.publish);
  fastify.get('/histories', { preHandler: [fastify.authenticate] }, NotificationController.getAllNotificationHistorys);
  fastify.get('/notifications', { preHandler: [fastify.authenticate] }, NotificationController.getAllNotifications);
}
