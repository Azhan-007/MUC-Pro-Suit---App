import { 
  AcademicYearService, 
  SemesterService, 
  CourseService, 
  ClassService,
  SubjectService,
  FacultyService,
  TimetableService
} from "@/services/domain";
import { TimetableClient } from "./TimetableClient";

export default async function TimetablePage() {
  const [
    academicYears, 
    semesters, 
    courses, 
    classes, 
    sections, 
    subjects, 
    facultyList, 
    timetableEntries
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    ClassService.getAllClasses(),
    ClassService.getAllSections(),
    SubjectService.getAllSubjects(),
    FacultyService.getAllFaculty(),
    TimetableService.getAllEntries()
  ]);

  return (
    <TimetableClient 
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      classes={classes}
      sections={sections}
      subjects={subjects}
      facultyList={facultyList}
      timetableEntries={timetableEntries}
    />
  );
}
