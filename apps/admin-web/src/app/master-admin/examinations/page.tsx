import { 
  AcademicYearService, 
  SemesterService, 
  CourseService, 
  ClassService,
  SubjectService,
  ExaminationService
} from "@/services/domain";
import { ExaminationClient } from "./ExaminationClient";

export default async function ExaminationsPage() {
  const [
    academicYears, 
    semesters, 
    courses, 
    classes, 
    sections, 
    subjects, 
    examinations
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    ClassService.getAllClasses(),
    ClassService.getAllSections(),
    SubjectService.getAllSubjects(),
    ExaminationService.getAllExaminations()
  ]);

  return (
    <ExaminationClient 
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      classes={classes}
      sections={sections}
      subjects={subjects}
      initialExaminations={examinations}
    />
  );
}
