import { 
  ReportService,
  StudentService,
  FacultyService,
  AcademicYearService,
  SemesterService,
  ClassService,
  DepartmentService,
  CourseService
} from "@/services/domain";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  const [
    overviewStats,
    students,
    faculty,
    academicYears,
    semesters,
    departments,
    courses,
    classes
  ] = await Promise.all([
    ReportService.getCollegeOverview(),
    StudentService.getAllStudents(),
    FacultyService.getAllFaculty(),
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    DepartmentService.getAllDepartments(),
    CourseService.getAllCourses(),
    ClassService.getAllClasses()
  ]);

  return (
    <ReportsClient 
      overviewStats={overviewStats}
      students={students}
      faculty={faculty}
      academicYears={academicYears}
      semesters={semesters}
      departments={departments}
      courses={courses}
      classes={classes}
      userRole="MASTER_ADMIN" // Simulated Role Injection
    />
  );
}
