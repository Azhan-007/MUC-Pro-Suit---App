import { FastifyReply, FastifyRequest } from 'fastify';
import { AttendanceService } from './attendance.service';
import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';
import { BadRequestError, ForbiddenError } from '../../utils/errors';

export class AttendanceController {
  static async mark(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      classId: z.string().uuid(),
      subjectId: z.string().uuid(),
      facultyId: z.string().uuid().optional(),
      date: z.string(),
      period: z.string(),
      entries: z.array(z.object({
        studentId: z.string().uuid(),
        status: z.nativeEnum(AttendanceStatus)
      }))
    });
    const data = schema.parse(request.body);
    const created = await AttendanceService.markAttendanceByContext(data, request.user.userId);
    return reply.send({ success: true, count: created.length });
  }

  static async correct(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      entryId: z.string().uuid(),
      newStatus: z.nativeEnum(AttendanceStatus),
      reason: z.string()
    });
    const data = schema.parse(request.body);
    const updated = await AttendanceService.correctAttendance(data.entryId, data.newStatus, data.reason, request.user.userId);
    return reply.send({ success: true, updated });
  }

  static async getAllAttendances(req: FastifyRequest, reply: FastifyReply) {
    let isAdmin = false;
    try {
      await req.server.requireDomain('ATTENDANCE')(req, reply);
      isAdmin = true;
    } catch {
      isAdmin = false;
    }

    const user = req.user as any;
    if (!isAdmin && user.role !== 'STUDENT' && user.role !== 'FACULTY') {
      throw new ForbiddenError('Insufficient permissions to view attendance');
    }

    const querySchema = z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(50),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      classId: z.string().uuid().optional(),
      subjectId: z.string().uuid().optional(),
      facultyId: z.string().uuid().optional(),
      status: z.nativeEnum(AttendanceStatus).optional()
    });
    
    let query;
    try {
      query = querySchema.parse(req.query);
    } catch (e: any) {
      throw new BadRequestError('Invalid query parameters: ' + e.message);
    }
    if (query.fromDate && query.toDate && new Date(query.fromDate) > new Date(query.toDate)) {
      throw new BadRequestError('fromDate must be on or before toDate');
    }

    const resolvedRole = isAdmin ? 'ADMIN' : user.role;
    const result = await AttendanceService.getAttendances({ id: user.userId, role: resolvedRole }, query);
    
    return reply.send({ success: true, ...result });
  }
}
