import {
  NotificationService,
  StudentService,
  FacultyService,
  CourseService,
  DepartmentService
} from "@/services/domain";
import { AnnouncementsClient } from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  const [
    notifications,
    deliveries,
    history,
    students,
    faculty,
    courses,
    departments
  ] = await Promise.all([
    NotificationService.getNotifications(),
    NotificationService.getNotificationDeliveries(),
    NotificationService.getNotificationHistory(),
    StudentService.getAllStudents(),
    FacultyService.getAllFaculty(),
    CourseService.getAllCourses(),
    DepartmentService.getAllDepartments()
  ]);

  return (
    <AnnouncementsClient
      notifications={notifications}
      deliveries={deliveries}
      history={history}
      students={students}
      faculty={faculty}
      courses={courses}
      departments={departments}
    />
  );
}
