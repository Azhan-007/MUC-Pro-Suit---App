import { 
  AcademicYearService, 
  SemesterService, 
  CourseService, 
  ClassService,
  SubjectService,
  ExaminationService,
  StudentService,
  ResultService
} from "@/services/domain";
import { ResultClient } from "./ResultClient";

export default async function ResultsPage() {
  const [
    academicYears, 
    semesters, 
    courses, 
    classes, 
    sections, 
    subjects, 
    examinations,
    students,
    initialResults
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    ClassService.getAllClasses(),
    ClassService.getAllSections(),
    SubjectService.getAllSubjects(),
    ExaminationService.getAllExaminations(),
    StudentService.getAllStudents(),
    ResultService.getAllResults()
  ]);

  return (
    <ResultClient 
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      classes={classes}
      sections={sections}
      subjects={subjects}
      examinations={examinations}
      students={students}
      initialResults={initialResults}
    />
  );
}
