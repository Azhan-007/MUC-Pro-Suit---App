import { CourseService, DepartmentService, SubjectService, ClassService } from "@/services/domain";
import { CoursesClient } from "./CoursesClient";

export const metadata = {
  title: "Degree Programs & Courses | MUC Master Admin",
  description: "Undergraduate and Postgraduate degree programs, shifts, regulations, and departmental affiliations",
};

export default async function CoursesPage() {
  const [data, subjects, classes] = await Promise.all([
    CourseService.getCourseDirectoryData(),
    SubjectService.getAllSubjects(),
    ClassService.getAllClasses(),
  ]);

  return (
    <CoursesClient 
      initialCourses={data.courses} 
      departments={data.departments} 
      metrics={data.metrics}
      subjects={subjects}
      classes={classes}
    />
  );
}
