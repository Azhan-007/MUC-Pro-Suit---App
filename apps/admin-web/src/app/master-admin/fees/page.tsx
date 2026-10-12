import { 
  AcademicYearService, 
  SemesterService, 
  CourseService, 
  StudentService,
  FeeService
} from "@/services/domain";
import { FeeClient } from "./FeeClient";

export default async function FeesPage() {
  const [
    academicYears, 
    semesters, 
    courses, 
    students,
    initialStructures,
    initialAccounts,
    initialPayments
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    StudentService.getAllStudents(),
    FeeService.getAllFeeStructures(),
    FeeService.getAllFeeAccounts(),
    FeeService.getAllPayments()
  ]);

  return (
    <FeeClient 
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      students={students}
      initialStructures={initialStructures}
      initialAccounts={initialAccounts}
      initialPayments={initialPayments}
    />
  );
}
