import { FastifyInstance } from 'fastify';
import { AttendanceController } from './attendance.controller';
import { MobileController } from '../academic/mobile.controller';

export async function attendanceRoutes(fastify: FastifyInstance) {
  fastify.post('/mark', { preHandler: [fastify.authenticate, fastify.requireDomain('ATTENDANCE', ['FACULTY'])] }, AttendanceController.mark);
  fastify.post('/correct', { preHandler: [fastify.authenticate, fastify.requireDomain('ATTENDANCE', ['FACULTY'])] }, AttendanceController.correct);
  fastify.get('/attendance', { preHandler: [fastify.authenticate] }, AttendanceController.getAllAttendances);
  fastify.get('/mobile-overview', { preHandler: [fastify.authenticate] }, MobileController.getAttendanceOverview);
}
