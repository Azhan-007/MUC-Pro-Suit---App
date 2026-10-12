import { StudentService } from "@/services/domain";
import { StudentsClient } from "./StudentsClient";

export default async function StudentsPage() {
  const { students, departments, courses, metrics } =
    await StudentService.getStudentRegisterData();

  return (
    <StudentsClient
      students={students}
      departments={departments}
      courses={courses}
      metrics={metrics}
    />
  );
}
