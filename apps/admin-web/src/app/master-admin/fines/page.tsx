import { 
  AcademicYearService, 
  SemesterService, 
  CourseService, 
  StudentService,
  FineService,
  FeeService,
  AttendanceService
} from "@/services/domain";
import { FinesClient } from "./FinesClient";
import { AttendanceSummary } from "@/types/domain";

export default async function FinesPage() {
  const [
    academicYears, 
    semesters, 
    courses, 
    students,
    initialFines,
    initialFeeAccounts,
    allAttendance
  ] = await Promise.all([
    AcademicYearService.getAllAcademicYears(),
    SemesterService.getAllSemesters(),
    CourseService.getAllCourses(),
    StudentService.getAllStudents(),
    FineService.getAllFines(),
    FeeService.getAllFeeAccounts(),
    AttendanceService.getAllAttendance()
  ]);

  // Generate Attendance Summaries for integration demo
  // Group by student and semester
  const summaryMap = new Map<string, { present: number, total: number }>();
  allAttendance.forEach(a => {
    const key = `${a.studentId}-${a.semesterNumber}`;
    if (!summaryMap.has(key)) summaryMap.set(key, { present: 0, total: 0 });
    const s = summaryMap.get(key)!;
    s.total++;
    if (a.status === "PRESENT" || a.status === "ON_DUTY" || a.status === "LATE") {
      s.present++;
    }
  });

  const attendanceSummaries: AttendanceSummary[] = Array.from(summaryMap.entries()).map(([key, val]) => {
    const [studentId, semNum] = key.split('-');
    return {
      studentId,
      semesterNumber: parseInt(semNum),
      totalClasses: val.total,
      attendedClasses: val.present,
      percentage: val.total === 0 ? 0 : (val.present / val.total) * 100
    };
  });

  // For testing the condonation fine, artificially add a 70% summary for a student if none exist
  if (!attendanceSummaries.find(a => a.studentId === "stu-1" && a.percentage >= 65 && a.percentage < 75)) {
    attendanceSummaries.push({
      studentId: "stu-1",
      semesterNumber: 1,
      totalClasses: 100,
      attendedClasses: 70,
      percentage: 70
    });
  }

  return (
    <FinesClient 
      academicYears={academicYears}
      semesters={semesters}
      courses={courses}
      students={students}
      initialFines={initialFines}
      initialFeeAccounts={initialFeeAccounts}
      attendanceSummaries={attendanceSummaries}
    />
  );
}
