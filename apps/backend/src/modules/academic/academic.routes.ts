import { FastifyInstance } from 'fastify';
import { AcademicController } from './academic.controller';
import { MobileController } from './mobile.controller';

export async function academicRoutes(fastify: FastifyInstance) {
  // Common Prehandlers
  const auth = fastify.authenticate;
  const requireAdmin = fastify.requireDomain('ACADEMIC');

  // ─── Timetable (Admin) ───
  fastify.post('/timetable/slot', { preHandler: [auth, requireAdmin] }, AcademicController.assignSlot);
  fastify.get('/timetable/entries', { preHandler: [auth, requireAdmin] }, AcademicController.getTimetableEntries);
  fastify.post('/timetable/entries', { preHandler: [auth, requireAdmin] }, AcademicController.saveTimetableEntry);
  fastify.delete<{Params: {id: string}}>('/timetable/entries/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteTimetableEntry);

  // ─── Mobile — Student ───
  fastify.get('/mobile/timetable', { preHandler: [auth] }, MobileController.getTimetable);

  // ─── Mobile — Faculty ───
  fastify.get('/mobile/faculty-timetable', { preHandler: [auth] }, MobileController.getFacultyTimetable);
  fastify.get('/mobile/faculty-classes', { preHandler: [auth] }, MobileController.getFacultyClasses);
  fastify.get('/mobile/class-students', { preHandler: [auth] }, MobileController.getClassStudents);
  fastify.get('/mobile/faculty-attendance-stats', { preHandler: [auth] }, MobileController.getFacultyAttendanceStats);

  // ─── GET Lists ───
  fastify.get('/students', { preHandler: [auth, requireAdmin] }, AcademicController.getAllStudents);
  fastify.get('/faculty', { preHandler: [auth] }, AcademicController.getAllFacultys);
  fastify.get('/departments', { preHandler: [auth] }, AcademicController.getAllDepartments);
  fastify.get('/courses', { preHandler: [auth] }, AcademicController.getAllCourses);
  fastify.get('/subjects', { preHandler: [auth] }, AcademicController.getAllSubjects);
  fastify.get('/classes', { preHandler: [auth] }, AcademicController.getAllClasss);
  fastify.get('/academicYears', { preHandler: [auth] }, AcademicController.getAllAcademicYears);
  fastify.get('/semesters', { preHandler: [auth] }, AcademicController.getAllSemesters);

  // ─── GET by ID ───
  fastify.get<{Params: {id: string}}>('/students/:id', { preHandler: [auth] }, AcademicController.getStudentById);
  fastify.get<{Params: {id: string}}>('/faculty/:id', { preHandler: [auth] }, AcademicController.getFacultyById);
  fastify.get<{Params: {id: string}}>('/departments/:id', { preHandler: [auth] }, AcademicController.getDepartmentById);
  fastify.get<{Params: {id: string}}>('/courses/:id', { preHandler: [auth] }, AcademicController.getCourseById);
  fastify.get<{Params: {id: string}}>('/classes/:id', { preHandler: [auth] }, AcademicController.getClassById);

  // ─── Mutations (Admin) ───
  fastify.post('/students', { preHandler: [auth, requireAdmin] }, AcademicController.createStudent);
  fastify.put<{Params: {id: string}}>('/students/:id', { preHandler: [auth, requireAdmin] }, AcademicController.updateStudent);
  fastify.delete<{Params: {id: string}}>('/students/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteStudent);

  fastify.post('/faculty', { preHandler: [auth, requireAdmin] }, AcademicController.createFaculty);
  fastify.put<{Params: {id: string}}>('/faculty/:id', { preHandler: [auth, requireAdmin] }, AcademicController.updateFaculty);
  fastify.delete<{Params: {id: string}}>('/faculty/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteFaculty);

  fastify.post('/departments', { preHandler: [auth, requireAdmin] }, AcademicController.createDepartment);
  fastify.put<{Params: {id: string}}>('/departments/:id', { preHandler: [auth, requireAdmin] }, AcademicController.updateDepartment);
  fastify.delete<{Params: {id: string}}>('/departments/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteDepartment);

  fastify.post('/courses', { preHandler: [auth, requireAdmin] }, AcademicController.createCourse);
  fastify.put<{Params: {id: string}}>('/courses/:id', { preHandler: [auth, requireAdmin] }, AcademicController.updateCourse);
  fastify.delete<{Params: {id: string}}>('/courses/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteCourse);

  fastify.post('/classes', { preHandler: [auth, requireAdmin] }, AcademicController.createClass);
  fastify.put<{Params: {id: string}}>('/classes/:id', { preHandler: [auth, requireAdmin] }, AcademicController.updateClass);
  fastify.delete<{Params: {id: string}}>('/classes/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteClass);

  fastify.post('/subjects', { preHandler: [auth, requireAdmin] }, AcademicController.createSubject);
  fastify.put<{Params: {id: string}}>('/subjects/:id', { preHandler: [auth, requireAdmin] }, AcademicController.updateSubject);
  fastify.delete<{Params: {id: string}}>('/subjects/:id', { preHandler: [auth, requireAdmin] }, AcademicController.deleteSubject);
}
