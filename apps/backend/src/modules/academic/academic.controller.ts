import { FastifyReply, FastifyRequest } from 'fastify';
import { AcademicService } from './academic.service';
import { z } from 'zod';
import { DayOfWeek, RecordStatus, TermType, SubjectType } from '@prisma/client';
import { ForbiddenError } from '../../utils/errors';

export class AcademicController {
  static async assignSlot(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      timetableVersionId: z.string().uuid(),
      dayOfWeek: z.nativeEnum(DayOfWeek),
      periodId: z.string().uuid(),
      teachingAssignmentId: z.string().uuid(),
      roomId: z.string().uuid().optional(),
    });
    const data = schema.parse(request.body);
    const slot = await AcademicService.assignTimetableSlot(data);
    return reply.send({ success: true, slot });
  }

  static async getAllStudents(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50)
    });
    const query = schema.parse(req.query);
    const data = await AcademicService.getAllStudents({
      page: query.page,
      limit: query.limit
    });
    return reply.send({ success: true, data });
  }

  static async getStudentById(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const data = await AcademicService.getStudentById(req.params.id);
    
    let isAdmin = true;
    try {
      await req.server.requireDomain('ACADEMIC')(req, reply);
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      if (String(data.userId) !== String(req.user.userId)) {
        throw new ForbiddenError(`Insufficient permissions to view another student\'s record`);
      }
      return reply.send({ 
        success: true, 
        data: {
          id: data.id,
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          registrationNumber: data.registrationNumber,
          admissionNumber: data.admissionNumber,
          email: data.email,
          currentSemester: data.currentSemester,
          courseId: data.courseId,
          departmentId: data.departmentId,
          academicClassId: data.academicClassId
        } 
      });
    }

    return reply.send({ success: true, data });
  }

  static async getAllFacultys(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50)
    });
    const query = schema.parse(req.query);
    const res = await AcademicService.getAllFaculty({
      page: query.page,
      limit: query.limit
    });

    let isAdmin = true;
    try {
      await req.server.requireDomain('ACADEMIC')(req, reply);
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      const safeData = res.data.map(f => ({
        id: f.id,
        firstName: f.firstName,
        lastName: f.lastName,
        departmentId: f.departmentId,
        designation: f.designation,
        email: f.email, // Expose basic directory info
        department: f.department ? { name: f.department.name } : null
      }));
      return reply.send({ success: true, data: safeData, meta: res.meta });
    }

    return reply.send({ success: true, data: res.data, meta: res.meta });
  }

  static async getFacultyById(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const data = await AcademicService.getFacultyById(req.params.id);

    let isAdmin = true;
    try {
      await req.server.requireDomain('ACADEMIC')(req, reply);
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      if (String(data.userId) !== String(req.user.userId)) {
        throw new ForbiddenError('Insufficient permissions to view another faculty\'s record');
      }
      return reply.send({ 
        success: true, 
        data: {
          id: data.id,
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          employeeId: data.employeeId,
          departmentId: data.departmentId,
          designation: data.designation,
          specialization: data.specialization
        } 
      });
    }

    return reply.send({ success: true, data });
  }

  static async getAllDepartments(req: FastifyRequest, reply: FastifyReply) {
    const data = await AcademicService.getAllDepartments();
    return reply.send({ success: true, data });
  }

  static async getDepartmentById(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const data = await AcademicService.getDepartmentById(req.params.id);
    return reply.send({ success: true, data });
  }

  static async getAllCourses(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50)
    });
    const query = schema.parse(req.query);
    const data = await AcademicService.getAllCourses({
      page: query.page,
      limit: query.limit
    });
    return reply.send({ success: true, ...data });
  }

  static async getCourseById(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const data = await AcademicService.getCourseById(req.params.id);
    return reply.send({ success: true, data });
  }

  static async getAllSubjects(req: FastifyRequest, reply: FastifyReply) {
    const data = await AcademicService.getAllSubjects();
    return reply.send({ success: true, data });
  }

  static async getAllClasss(req: FastifyRequest, reply: FastifyReply) {
    const data = await AcademicService.getAllClasses();
    return reply.send({ success: true, data });
  }

  static async getClassById(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const data = await AcademicService.getClassById(req.params.id);
    return reply.send({ success: true, data });
  }

  static async getAllAcademicYears(req: FastifyRequest, reply: FastifyReply) {
    const data = await AcademicService.getAllAcademicYears();
    return reply.send({ success: true, data });
  }

  static async getAllSemesters(req: FastifyRequest, reply: FastifyReply) {
    const data = await AcademicService.getAllSemesters();
    return reply.send({ success: true, data });
  }

  static async getTimetableEntries(req: FastifyRequest, reply: FastifyReply) {
    const data = await AcademicService.getTimetableEntries();
    return reply.send({ success: true, data });
  }

  static async saveTimetableEntry(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      id: z.string().optional(),
      academicYearId: z.string().uuid(),
      semesterId: z.string().uuid(),
      shift: z.enum(['SHIFT_I', 'SHIFT_II']),
      dayOfWeek: z.nativeEnum(DayOfWeek),
      period: z.enum(['H1', 'H2', 'H3', 'H4', 'H5']),
      courseId: z.string().uuid(),
      classId: z.string().uuid(),
      subjectId: z.string().uuid(),
      facultyId: z.string().uuid(),
      roomId: z.string().uuid().nullable().optional(),
    });
    const data = schema.parse(request.body);
    const slot = await AcademicService.saveTimetableEntry(data);
    return reply.send({ success: true, slot });
  }

  static async deleteTimetableEntry(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const id = request.params.id;
    await AcademicService.deleteTimetableEntry(id);
    return reply.send({ success: true });
  }

  // --- CRUD Mutations with Zod ---

  static async createStudent(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      registrationNumber: z.string(),
      admissionNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      dateOfBirth: z.string().transform(v => new Date(v)),
      admissionDepartmentId: z.string().uuid().optional(),
      admissionProgramId: z.string().uuid().optional(),
      departmentId: z.string().uuid().optional(),
      courseId: z.string().uuid().optional(),
      currentSemester: z.number().int().min(1).max(10).default(1),
      gender: z.string().optional(),
      bloodGroup: z.string().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    }).refine(data => data.admissionDepartmentId || data.departmentId, { message: "Department ID is required" })
      .refine(data => data.admissionProgramId || data.courseId, { message: "Program/Course ID is required" });
    const data = schema.parse(req.body);
    const result = await AcademicService.createStudent(data);
    return reply.send({ success: true, data: result });
  }

  static async updateStudent(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().transform(v => new Date(v)).optional(),
      gender: z.string().optional(),
      bloodGroup: z.string().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.updateStudent(req.params.id, data);
    return reply.send({ success: true, data: result });
  }

  static async deleteStudent(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    await AcademicService.deleteStudent(req.params.id);
    return reply.send({ success: true });
  }

  static async createFaculty(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      employeeId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      departmentId: z.string().uuid(),
      designation: z.string(),
      specialization: z.string().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.createFaculty(data);
    return reply.send({ success: true, data: result });
  }

  static async updateFaculty(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      departmentId: z.string().uuid().optional(),
      designation: z.string().optional(),
      specialization: z.string().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.updateFaculty(req.params.id, data);
    return reply.send({ success: true, data: result });
  }

  static async deleteFaculty(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    await AcademicService.deleteFaculty(req.params.id);
    return reply.send({ success: true });
  }

  static async createDepartment(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      code: z.string(),
      name: z.string(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.createDepartment(data);
    return reply.send({ success: true, data: result });
  }

  static async updateDepartment(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const schema = z.object({
      name: z.string().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.updateDepartment(req.params.id, data);
    return reply.send({ success: true, data: result });
  }

  static async deleteDepartment(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    await AcademicService.deleteDepartment(req.params.id);
    return reply.send({ success: true });
  }

  static async createCourse(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      code: z.string(),
      name: z.string(),
      departmentId: z.string().uuid(),
      shiftId: z.string().uuid(),
      degree: z.string(),
      durationYears: z.number(),
      totalSemesters: z.number(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.createCourse(data);
    return reply.send({ success: true, data: result });
  }

  static async updateCourse(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const schema = z.object({
      name: z.string().optional(),
      departmentId: z.string().uuid().optional(),
      shiftId: z.string().uuid().optional(),
      degree: z.string().optional(),
      durationYears: z.number().optional(),
      totalSemesters: z.number().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.updateCourse(req.params.id, data);
    return reply.send({ success: true, data: result });
  }

  static async deleteCourse(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    await AcademicService.deleteCourse(req.params.id);
    return reply.send({ success: true });
  }

  static async createClass(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      code: z.string(),
      academicYearId: z.string().uuid(),
      programId: z.string().uuid(),
      yearOfStudy: z.number(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.createClass(data);
    return reply.send({ success: true, data: result });
  }

  static async updateClass(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const schema = z.object({
      code: z.string().optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.updateClass(req.params.id, data);
    return reply.send({ success: true, data: result });
  }

  static async deleteClass(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    await AcademicService.deleteClass(req.params.id);
    return reply.send({ success: true });
  }

  static async createSubject(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      code: z.string(),
      name: z.string(),
      courseId: z.string().uuid(),
      semesterNumber: z.number(),
      credits: z.number(),
      type: z.nativeEnum(SubjectType),
      facultyId: z.string().uuid().optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.createSubject(data);
    return reply.send({ success: true, data: result });
  }

  static async updateSubject(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const schema = z.object({
      code: z.string().optional(),
      name: z.string().optional(),
      semesterNumber: z.number().optional(),
      credits: z.number().optional(),
      type: z.nativeEnum(SubjectType).optional(),
      status: z.nativeEnum(RecordStatus).optional(),
    });
    const data = schema.parse(req.body);
    const result = await AcademicService.updateSubject(req.params.id, data);
    return reply.send({ success: true, data: result });
  }

  static async deleteSubject(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    await AcademicService.deleteSubject(req.params.id);
    return reply.send({ success: true });
  }
}
