import { FacultyService } from "@/services/domain";
import { FacultyClient } from "./FacultyClient";

export const metadata = {
  title: "Faculty Directory | MUC Master Admin",
  description: "Manage faculty identity, academic assignments, and instructional workload",
};

export default async function FacultyPage() {
  const data = await FacultyService.getFacultyDirectoryData();

  return (
    <FacultyClient 
      initialFaculty={data.faculty} 
      departments={data.departments} 
      subjects={data.subjects} 
      metrics={data.metrics}
    />
  );
}
