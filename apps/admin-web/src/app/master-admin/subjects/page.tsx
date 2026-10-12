import { SubjectService } from "@/services/domain";
import { SubjectsClient } from "./SubjectsClient";

export const metadata = {
  title: "Curriculum & Subjects | MUC Master Admin",
  description: "Academic syllabus, core and elective subject mappings, credits, and faculty allocations",
};

export default async function SubjectsPage() {
  const data = await SubjectService.getSubjectDirectoryData();

  return (
    <SubjectsClient 
      initialSubjects={data.subjects} 
      courses={data.courses} 
      departments={data.departments} 
      facultyList={data.faculty} 
      metrics={data.metrics}
    />
  );
}
