import { ClassService, FacultyService, StudentService } from "@/services/domain";
import { ClassesClient } from "./ClassesClient";

export const metadata = {
  title: "Academic Classes & Cohorts | MUC Master Admin",
  description: "Academic class cohorts, class advisors, program affiliations, and instructional rosters",
};

export default async function ClassesPage() {
  const [data, facultyList, students] = await Promise.all([
    ClassService.getClassDirectoryData(),
    FacultyService.getAllFaculty(),
    StudentService.getAllStudents(),
  ]);

  return (
    <ClassesClient 
      initialClasses={data.classes} 
      courses={data.courses} 
      departments={data.departments} 
      academicYears={data.academicYears} 
      metrics={data.metrics}
      facultyList={facultyList}
      students={students}
    />
  );
}
