import {
  StudentService,
  FeeService,
  CourseService,
  ScholarshipService,
  FineService,
  DepartmentService
} from "@/services/domain";
import { FeeCollectionClient } from "./FeeCollectionClient";

export default async function FeeCollectionPage() {
  const [
    students,
    feeStructures,
    feeAccounts,
    feePayments,
    courses,
    scholarships,
    fines,
    departmentData
  ] = await Promise.all([
    StudentService.getAllStudents(),
    FeeService.getAllFeeStructures(),
    FeeService.getAllFeeAccounts(),
    FeeService.getAllPayments(),
    CourseService.getAllCourses(),
    ScholarshipService.getAllScholarships(),
    FineService.getAllFines(),
    DepartmentService.getAllDepartments()
  ]);

  return (
    <FeeCollectionClient
      students={students}
      feeStructures={feeStructures}
      feeAccounts={feeAccounts}
      feePayments={feePayments}
      courses={courses}
      scholarships={scholarships}
      fines={fines}
      departments={departmentData}
    />
  );
}
