import { 
  NotificationService,
  StudentService,
  FacultyService,
  DepartmentService,
  CourseService
} from "@/services/domain";
import { NotificationClient } from "./NotificationClient";

export default async function NotificationsPage() {
  const [
    notifications,
    deliveries,
    histories,
    students,
    faculty,
    departments,
    courses
  ] = await Promise.all([
    NotificationService.getNotifications(),
    NotificationService.getNotificationDeliveries(),
    NotificationService.getNotificationHistory(),
    StudentService.getAllStudents(),
    FacultyService.getAllFaculty(),
    DepartmentService.getAllDepartments(),
    CourseService.getAllCourses()
  ]);

  return (
    <NotificationClient 
      initialNotifications={notifications}
      initialDeliveries={deliveries}
      initialHistories={histories}
      students={students}
      faculty={faculty}
      departments={departments}
      courses={courses}
    />
  );
}
