import { DepartmentService, FacultyService } from "@/services/domain";
import { DepartmentsClient } from "./DepartmentsClient";

export const metadata = {
  title: "Academic Departments | MUC Master Admin",
  description: "Institutional department structures, degree programs, faculty allocations, and student enrollments",
};

export default async function DepartmentsPage() {
  const [data, facultyList] = await Promise.all([
    DepartmentService.getDepartmentDirectoryData(),
    FacultyService.getAllFaculty(),
  ]);

  return (
    <DepartmentsClient 
      initialDepartments={data.departments} 
      metrics={data.metrics}
      availableFaculty={facultyList}
    />
  );
}
