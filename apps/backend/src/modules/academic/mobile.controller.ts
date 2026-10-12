import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@muc/database';

export class MobileController {

  // ─────────────────────────────────────────────
  // STUDENT — Timetable
  // ─────────────────────────────────────────────
  static async getTimetable(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const userId = user?.userId || user?.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    let slots: any[] = [];

    if (student && student.enrollments.length > 0) {
      const enrollment = student.enrollments[0];
      slots = await prisma.timetableSlot.findMany({
        where: {
          teachingAssignment: {
            academicClassId: enrollment.academicClassId
          }
        },
        include: {
          period: true,
          room: true,
          teachingAssignment: {
            include: {
              programSubject: true,
              faculty: true,
            }
          }
        }
      });
    }

    const formatTime = (date?: Date) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'UTC' // Prisma maps Time(0) to 1970-01-01T... UTC
      }).format(date);
    };

    const mobileDTO = slots.map(slot => ({
      id: slot.id,
      day: slot.dayOfWeek,
      time: `${formatTime(slot.period?.startTime)} - ${formatTime(slot.period?.endTime)}`,
      subject: slot.teachingAssignment?.programSubject?.name || 'Unknown Subject',
      professor: slot.teachingAssignment?.faculty
        ? `${slot.teachingAssignment.faculty.firstName} ${slot.teachingAssignment.faculty.lastName}`
        : 'Faculty',
      room: slot.room?.code || 'TBA',
      periodCode: slot.period?.code || '',
      isLunchBreak: false,
      status: 'UPCOMING'
    }));

    return reply.send(mobileDTO);
  }

  // ─────────────────────────────────────────────
  // STUDENT — Attendance Overview (with subject breakdown)
  // ─────────────────────────────────────────────
  static async getAttendanceOverview(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const userId = user?.userId || user?.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!student || student.enrollments.length === 0) {
      return reply.send({
        overview: {
          overallPercentage: 0, presentDays: 0, absentDays: 0, totalDays: 0,
          totalAttendedClasses: 0, missedClasses: 0, classesTo75Percent: 0, currentStreak: 0
        },
        subjects: [],
        daily: []
      });
    }

    const enrollment = student.enrollments[0];

    const entries = await prisma.attendanceEntry.findMany({
      where: { studentEnrollmentId: enrollment.id },
      include: {
        attendanceSession: {
          include: {
            programSubject: true,
            period: true,
            teachingAssignment: {
              include: {
                faculty: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Overall counts
    let attended = 0;
    const total = entries.length;
    let missed = 0;

    entries.forEach(e => {
      if (e.status === 'PRESENT' || e.status === 'LATE' || e.status === 'ON_DUTY') attended++;
      if (e.status === 'ABSENT') missed++;
    });

    const percentage = total > 0 ? (attended / total) * 100 : 0;
    const requiredFor75 = Math.max(0, Math.ceil((0.75 * total) - attended));

    // Current streak (consecutive present days)
    const sortedByDate = [...entries].sort(
      (a, b) => new Date(b.attendanceSession.date).getTime() - new Date(a.attendanceSession.date).getTime()
    );
    let streak = 0;
    let lastDate: string | null = null;
    for (const e of sortedByDate) {
      const dateStr = e.attendanceSession.date.toISOString().split('T')[0];
      if (e.status === 'PRESENT' || e.status === 'LATE' || e.status === 'ON_DUTY') {
        if (lastDate === null || lastDate !== dateStr) {
          streak++;
          lastDate = dateStr;
        }
      } else {
        break;
      }
    }

    // Subject-wise breakdown
    const subjectMap = new Map<string, {
      subjectId: string;
      subjectName: string;
      attended: number;
      total: number;
    }>();

    // Pre-populate with all subjects taught in this class
    const assignments = await prisma.teachingAssignment.findMany({
      where: { academicClassId: enrollment.academicClassId },
      include: { programSubject: true }
    });

    for (const assign of assignments) {
      if (assign.programSubject) {
        subjectMap.set(assign.programSubjectId, {
          subjectId: assign.programSubjectId,
          subjectName: assign.programSubject.name,
          attended: 0,
          total: 0
        });
      }
    }

    for (const e of entries) {
      const subId = e.attendanceSession.programSubjectId;
      const subName = e.attendanceSession.programSubject?.name || 'Unknown';
      if (!subjectMap.has(subId)) {
        subjectMap.set(subId, { subjectId: subId, subjectName: subName, attended: 0, total: 0 });
      }
      const rec = subjectMap.get(subId)!;
      rec.total++;
      if (e.status === 'PRESENT' || e.status === 'LATE' || e.status === 'ON_DUTY') rec.attended++;
    }

    const subjects = Array.from(subjectMap.values()).map(s => {
      const pct = s.total > 0 ? (s.attended / s.total) * 100 : 0;
      const reqMore = Math.max(0, Math.ceil((0.75 * s.total) - s.attended));
      const statusLevel = pct >= 75 ? 'SAFE' : pct >= 65 ? 'WARNING' : 'DANGER';
      return {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        fraction: `${s.attended}/${s.total} Classes`,
        percentage: Math.round(pct * 10) / 10,
        classesNeeded: reqMore,
        statusLevel
      };
    });

    // Daily attendance (last 30 days, grouped by date)
    const dailyMap = new Map<string, { date: string; periods: { period: string; status: string; subject: string; professor?: string }[] }>();
    for (const e of entries) {
      const dateStr = e.attendanceSession.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { date: dateStr, periods: [] });
      }
      const faculty = (e.attendanceSession as any).teachingAssignment?.faculty;
      const profName = faculty ? `${faculty.firstName} ${faculty.lastName}`.trim() : undefined;
      dailyMap.get(dateStr)!.periods.push({
        period: e.attendanceSession.period?.code || '',
        status: e.status,
        subject: e.attendanceSession.programSubject?.name || '',
        professor: profName,
      });
    }

    const daily = Array.from(dailyMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    return reply.send({
      overview: {
        overallPercentage: Math.round(percentage * 10) / 10,
        presentDays: attended,
        absentDays: missed,
        totalDays: total,
        totalAttendedClasses: attended,
        missedClasses: missed,
        classesTo75Percent: requiredFor75,
        currentStreak: streak
      },
      subjects,
      daily
    });
  }

  // ─────────────────────────────────────────────
  // FACULTY — Own Timetable
  // ─────────────────────────────────────────────
  static async getFacultyTimetable(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const userId = user?.userId || user?.id;

    const faculty = await prisma.faculty.findUnique({
      where: { userId }
    });

    if (!faculty) {
      return reply.send([]);
    }

    const slots = await prisma.timetableSlot.findMany({
      where: {
        teachingAssignment: {
          facultyId: faculty.id
        }
      },
      include: {
        period: true,
        room: true,
        timetableVersion: {
          include: { academicTerm: true }
        },
        teachingAssignment: {
          include: {
            programSubject: true,
            academicClass: {
              include: {
                program: {
                  include: { shift: true }
                }
              }
            }
          }
        }
      }
    });

    const formatTime = (date?: Date) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'UTC' // Prisma maps Time(0) to 1970-01-01T... UTC
      }).format(date);
    };

    const mobileDTO = slots.map(slot => ({
      id: slot.id,
      day: slot.dayOfWeek,
      time: `${formatTime(slot.period?.startTime)} - ${formatTime(slot.period?.endTime)}`,
      periodCode: slot.period?.code || '',
      subject: slot.teachingAssignment?.programSubject?.name || 'Unknown Subject',
      subjectId: slot.teachingAssignment?.programSubjectId || '',
      className: slot.teachingAssignment?.academicClass?.code || 'Unknown Class',
      classId: slot.teachingAssignment?.academicClassId || '',
      shift: slot.teachingAssignment?.academicClass?.program?.shift?.code || '',
      room: slot.room?.code || 'TBA',
      status: 'UPCOMING' as const,
      totalStudents: 0  // populated lazily on the client if needed
    }));

    return reply.send(mobileDTO);
  }

  // ─────────────────────────────────────────────
  // FACULTY — Classes taught (for attendance marking)
  // ─────────────────────────────────────────────
  static async getFacultyClasses(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const userId = user?.userId || user?.id;

    const faculty = await prisma.faculty.findUnique({
      where: { userId }
    });

    if (!faculty) {
      return reply.send([]);
    }

    const assignments = await prisma.teachingAssignment.findMany({
      where: {
        facultyId: faculty.id,
        status: 'ACTIVE'
      },
      include: {
        programSubject: true,
        academicClass: {
          include: {
            program: {
              include: { shift: true }
            },
            _count: {
              select: { enrollments: { where: { status: 'ACTIVE' } } }
            }
          }
        }
      }
    });

    const result = assignments.map(a => ({
      assignmentId: a.id,
      classId: a.academicClassId,
      className: a.academicClass?.code || '',
      classDisplayName: a.academicClass?.code || '',
      subjectId: a.programSubjectId,
      subjectName: a.programSubject?.name || '',
      shift: a.academicClass?.program?.shift?.code || '',
      totalStudents: a.academicClass?._count?.enrollments || 0
    }));

    return reply.send(result);
  }

  // ─────────────────────────────────────────────
  // FACULTY — Students in a class (for attendance marking)
  // ─────────────────────────────────────────────
  static async getClassStudents(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { classId?: string };
    if (!query.classId) {
      return reply.status(400).send({ error: 'classId is required' });
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        academicClassId: query.classId,
        status: 'ACTIVE'
      },
      include: {
        student: true
      },
      orderBy: [
        { student: { registrationNumber: 'asc' } }
      ]
    });

    const result = enrollments.map(en => ({
      studentId: en.studentId,
      enrollmentId: en.id,
      name: `${en.student.firstName} ${en.student.lastName}`,
      registrationNumber: en.student.registrationNumber,
      rollNumber: (en.student as any).rollNumber || en.student.registrationNumber,
    }));

    return reply.send(result);
  }

  // ─────────────────────────────────────────────
  // FACULTY — Attendance stats for a class/subject
  // ─────────────────────────────────────────────
  static async getFacultyAttendanceStats(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const userId = user?.userId || user?.id;
    const query = request.query as { classId?: string; subjectId?: string };

    const faculty = await prisma.faculty.findUnique({
      where: { userId }
    });

    if (!faculty) {
      return reply.send({ students: [], summary: { total: 0, defaulters: 0, safe: 0 } });
    }

    // Build where clause
    const sessionWhere: any = {};
    if (query.classId) sessionWhere.academicClassId = query.classId;
    if (query.subjectId) sessionWhere.programSubjectId = query.subjectId;
    sessionWhere.teachingAssignment = { facultyId: faculty.id };

    const entries = await prisma.attendanceEntry.findMany({
      where: { attendanceSession: sessionWhere },
      include: {
        attendanceSession: {
          include: { programSubject: true }
        },
        studentEnrollment: {
          include: { student: true }
        }
      }
    });

    // Aggregate per student
    const studentMap = new Map<string, {
      studentId: string;
      enrollmentId: string;
      name: string;
      registrationNumber: string;
      attended: number;
      total: number;
    }>();

    for (const e of entries) {
      const sid = e.studentEnrollment.studentId;
      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          studentId: sid,
          enrollmentId: e.studentEnrollmentId,
          name: `${e.studentEnrollment.student.firstName} ${e.studentEnrollment.student.lastName}`,
          registrationNumber: e.studentEnrollment.student.registrationNumber,
          attended: 0,
          total: 0
        });
      }
      const rec = studentMap.get(sid)!;
      rec.total++;
      if (e.status === 'PRESENT' || e.status === 'LATE' || e.status === 'ON_DUTY') rec.attended++;
    }

    const students = Array.from(studentMap.values()).map(s => {
      const pct = s.total > 0 ? (s.attended / s.total) * 100 : 0;
      const roundedPct = Math.round(pct * 10) / 10;
      const statusLevel = pct >= 75 ? 'SAFE' : pct >= 65 ? 'CONDONATION' : 'DEFAULTER';
      return {
        studentId: s.studentId,
        enrollmentId: s.enrollmentId,
        name: s.name,
        registrationNumber: s.registrationNumber,
        attended: s.attended,
        total: s.total,
        percentage: roundedPct,
        statusLevel
      };
    });

    const defaulters = students.filter(s => s.percentage < 75).length;
    const safe = students.filter(s => s.percentage >= 75).length;

    return reply.send({
      students,
      summary: { total: students.length, defaulters, safe }
    });
  }
}
