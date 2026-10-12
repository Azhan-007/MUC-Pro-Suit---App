import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';
import { prisma } from '@muc/database';
import { AttendanceStatus } from '@prisma/client';
import { BadRequestError } from '../../utils/errors';

export class AttendanceService {
  /**
   * Create an attendance session with strict relationship validation.
   */
  static async createSession(data: {
    academicTermId: string;
    academicClassId: string;
    programSubjectId: string;
    teachingAssignmentId: string;
    date: Date;
    periodId: string;
  }) {
    const assignment = await prisma.teachingAssignment.findUniqueOrThrow({
      where: { id: data.teachingAssignmentId }
    });

    if (
      assignment.academicTermId !== data.academicTermId ||
      assignment.academicClassId !== data.academicClassId ||
      assignment.programSubjectId !== data.programSubjectId
    ) {
      throw new BadRequestError('Attendance session relationships are mutually inconsistent with the teaching assignment.');
    }

    return await prisma.attendanceSession.create({
      data
    });
  }

  /**
   * Mark attendance for a session, preventing duplicates.
   */
  static async markAttendanceByContext(data: { classId: string, subjectId: string, facultyId?: string, date: string, period: string, entries: { studentId: string, status: AttendanceStatus }[] }, markedById: string) {
    return await prisma.$transaction(async (tx) => {
      const cls = await tx.academicClass.findUniqueOrThrow({ where: { id: data.classId }, include: { program: true } });
      const term = await tx.academicTerm.findFirst({ where: { academicYearId: cls.academicYearId, isActive: true } });
      if (!term) throw new BadRequestError('No active term found for this academic year.');

      const shift = await tx.shift.findUniqueOrThrow({ where: { id: cls.program.shiftId } });
      // The PeriodCode enum might not be natively accessible dynamically, so cast to any
      const periodDef = await tx.periodDefinition.findFirst({ where: { shiftId: shift.id, code: data.period as any } });
      if (!periodDef) throw new BadRequestError('Period not found for shift.');

      let assignment;
      if (data.facultyId) {
        assignment = await tx.teachingAssignment.findFirst({
          where: { academicClassId: data.classId, programSubjectId: data.subjectId, facultyId: data.facultyId },
          include: { faculty: true }
        });
      } else {
        assignment = await tx.teachingAssignment.findFirst({
          where: { academicClassId: data.classId, programSubjectId: data.subjectId },
          include: { faculty: true }
        });
      }

      if (!assignment) {
        throw new BadRequestError('No active teaching assignment exists for this class and subject. Assign a faculty member before marking attendance.');
      }

      if (assignment.status !== 'ACTIVE') {
        throw new BadRequestError('The teaching assignment for this class and subject is not active.');
      }

      if (assignment.faculty.status !== 'ACTIVE') {
        throw new BadRequestError('The assigned faculty member is inactive. Cannot mark attendance.');
      }
      
      const teachingAssignmentId = assignment.id;

      const dateObj = new Date(data.date);

      let session = await tx.attendanceSession.findUnique({
        where: {
          canonical_session: {
            academicTermId: term.id,
            academicClassId: data.classId,
            programSubjectId: data.subjectId,
            date: dateObj,
            periodId: periodDef.id
          }
        }
      });

      if (!session) {
        session = await tx.attendanceSession.create({
          data: {
            academicTermId: term.id,
            academicClassId: data.classId,
            programSubjectId: data.subjectId,
            teachingAssignmentId: teachingAssignmentId,
            date: dateObj,
            periodId: periodDef.id,
            status: 'OPEN'
          }
        });
      }

      if (session.status === 'LOCKED') throw new BadRequestError('Session is locked.');

      const enrollments = await tx.studentEnrollment.findMany({
        where: { studentId: { in: data.entries.map(e => e.studentId) }, academicClassId: data.classId, status: 'ACTIVE' }
      });

      const results = [];
      for (const entry of data.entries) {
        const enrollment = enrollments.find(e => e.studentId === entry.studentId);
        if (!enrollment) throw new BadRequestError(`Student ${entry.studentId} is not enrolled in this class.`);

        const result = await tx.attendanceEntry.upsert({
          where: {
            attendanceSessionId_studentEnrollmentId: {
              attendanceSessionId: session.id,
              studentEnrollmentId: enrollment.id
            }
          },
          update: { status: entry.status },
          create: {
            attendanceSessionId: session.id,
            studentEnrollmentId: enrollment.id,
            status: entry.status
          }
        });
        results.push(result);
      }

      await tx.attendanceSession.update({
        where: { id: session.id },
        data: { status: 'MARKED', markedById }
      });

      return results;
    });
  }

  static async markAttendance(sessionId: string, entries: { studentEnrollmentId: string; status: AttendanceStatus }[], markedById: string) {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.attendanceSession.findUniqueOrThrow({ where: { id: sessionId } });
      if (session.status === 'LOCKED') throw new BadRequestError('Session is locked.');

      const enrollments = await tx.studentEnrollment.findMany({
        where: { id: { in: entries.map(e => e.studentEnrollmentId) } }
      });

      for (const e of entries) {
        const enrollment = enrollments.find(en => en.id === e.studentEnrollmentId);
        if (!enrollment || enrollment.academicClassId !== session.academicClassId) {
          throw new BadRequestError(`Enrollment ${e.studentEnrollmentId} does not belong to the class of this session.`);
        }
      }

      const results = [];
      for (const entry of entries) {
        const result = await tx.attendanceEntry.upsert({
          where: {
            attendanceSessionId_studentEnrollmentId: {
              attendanceSessionId: sessionId,
              studentEnrollmentId: entry.studentEnrollmentId
            }
          },
          update: { status: entry.status },
          create: {
            attendanceSessionId: sessionId,
            studentEnrollmentId: entry.studentEnrollmentId,
            status: entry.status
          }
        });
        results.push(result);
      }

      await tx.attendanceSession.update({
        where: { id: sessionId },
        data: { status: 'MARKED', markedById }
      });

      return results;
    });
  }

  /**
   * Correct attendance entry.
   */
  static async correctAttendance(entryId: string, newStatus: AttendanceStatus, reason: string, correctedById: string) {
    return await prisma.$transaction(async (tx) => {
      const entry = await tx.attendanceEntry.findUniqueOrThrow({ where: { id: entryId } });

      await tx.attendanceCorrection.create({
        data: {
          attendanceEntryId: entry.id,
          previousStatus: entry.status,
          newStatus,
          reason,
          correctedById
        }
      });

      const res = await tx.attendanceEntry.update({
        where: { id: entryId },
        data: { status: newStatus }
      });
      await AuditService.log({
        actorId: correctedById,
        action: 'ATTENDANCE_CORRECTION',
        resourceType: 'AttendanceEntry',
        resourceId: entry.id,
        outcome: AuditOutcome.SUCCESS,
        beforeState: { status: entry.status },
        afterState: { status: newStatus }
      }, tx);
      return res;
    });
  }

  /**
   * Get attendance percentage for a student in a specific term.
   */
  static async getAttendancePercentage(studentEnrollmentId: string) {
    const entries = await prisma.attendanceEntry.findMany({
      where: { studentEnrollmentId },
      select: { status: true }
    });

    const total = entries.length;
    if (total === 0) return { total: 0, presentCount: 0, percentage: 0 };

    // LATE counts as PRESENT for attendance percentage calculation as per business rule
    const presentCount = entries.filter(e => e.status === 'PRESENT' || e.status === 'LATE' || e.status === 'ON_DUTY').length;

    return {
      total,
      presentCount,
      percentage: (presentCount / total) * 100
    };
  }

  static async getAttendances(user: { id: string, role: string }, query: any) {
    const { page, pageSize, fromDate, toDate, classId, subjectId, facultyId, status } = query;

    const where: any = {};
    const sessionWhere: any = {};

    if (fromDate || toDate) {
      sessionWhere.date = {};
      if (fromDate) sessionWhere.date.gte = new Date(fromDate);
      if (toDate) sessionWhere.date.lte = new Date(toDate);
    }
    
    if (classId) sessionWhere.academicClassId = classId;
    if (subjectId) sessionWhere.programSubjectId = subjectId;
    
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (!student) throw new BadRequestError('Student record not found for user');
      where.studentEnrollment = { studentId: student.id };
    } else if (user.role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({ where: { userId: user.id, status: 'ACTIVE' } });
      if (!faculty) throw new BadRequestError('Active faculty record not found for user');
      sessionWhere.teachingAssignment = { facultyId: faculty.id, status: 'ACTIVE' };
    } else {
      if (facultyId) {
        sessionWhere.teachingAssignment = { facultyId };
      }
    }

    if (Object.keys(sessionWhere).length > 0) {
      where.attendanceSession = sessionWhere;
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.attendanceEntry.count({ where });
    const skip = (page - 1) * pageSize;
    const entries = await prisma.attendanceEntry.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        attendanceSession: {
          include: { period: true, programSubject: true, academicClass: true }
        },
        studentEnrollment: {
          include: { student: true }
        }
      }
    });

    const data = entries.map(e => ({
      id: e.id,
      studentId: e.studentEnrollment.studentId,
      studentName: user.role === 'STUDENT' ? undefined : `${e.studentEnrollment.student.firstName} ${e.studentEnrollment.student.lastName}`,
      classId: e.attendanceSession.academicClassId,
      className: e.attendanceSession.academicClass.code,
      subjectId: e.attendanceSession.programSubjectId,
      subjectName: e.attendanceSession.programSubject.name,
      date: e.attendanceSession.date.toISOString().split('T')[0],
      period: e.attendanceSession.period.code,
      status: e.status,
      facultyId: e.attendanceSession.markedById || '',
      recordedBy: e.attendanceSession.markedById || '',
      isCorrected: false,
    }));

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
}
