import {
  AcademicYearService,
  SemesterService,
  CourseService,
  ClassService,
  SubjectService,
  FacultyService,
  StudentService,
  AttendanceService,
  TimetableService
} from "@/services/domain";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const [
    academicYears,
    semesters,
    courses,
    classes,
    sections,
    subjects,
    facultyList,
    students,
    attendanceRecords,
    timetableEntries
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    ClassService.getAllClasses(),
    ClassService.getAllSections(),
    SubjectService.getAllSubjects(),
    FacultyService.getAllFaculty(),
    StudentService.getAllStudents(),
    AttendanceService.getAllAttendance(),
    TimetableService.getAllEntries()
  ]);

  return (
    <AttendanceClient
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      classes={classes}
      sections={sections}
      subjects={subjects}
      facultyList={facultyList}
      students={students}
      attendanceRecords={attendanceRecords}
      timetableEntries={timetableEntries}
    />
  );
}
