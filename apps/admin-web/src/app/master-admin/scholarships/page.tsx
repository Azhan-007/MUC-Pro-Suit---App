import { 
  AcademicYearService, 
  SemesterService, 
  CourseService, 
  StudentService,
  ScholarshipService,
  FeeService
} from "@/services/domain";
import { ScholarshipsClient } from "./ScholarshipsClient";

export default async function ScholarshipsPage() {
  const [
    academicYears, 
    semesters, 
    courses, 
    students,
    initialScholarships,
    initialFeeAccounts
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    StudentService.getAllStudents(),
    ScholarshipService.getAllScholarships(),
    FeeService.getAllFeeAccounts()
  ]);

  return (
    <ScholarshipsClient 
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      students={students}
      initialScholarships={initialScholarships}
      initialFeeAccounts={initialFeeAccounts}
    />
  );
}
