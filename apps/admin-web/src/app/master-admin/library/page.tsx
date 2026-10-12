import { 
  LibraryService,
  StudentService,
  FacultyService
} from "@/services/domain";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const [
    initialBooks,
    initialCopies,
    initialMembers,
    initialLoans,
    initialReservations,
    initialResolutions,
    students,
    faculty
  ] = await Promise.all([
    LibraryService.getBooks(),
    LibraryService.getCopies(),
    LibraryService.getMembers(),
    LibraryService.getLoans(),
    LibraryService.getReservations(),
    LibraryService.getResolutionRecords(),
    StudentService.getAllStudents(),
    FacultyService.getAllFaculty()
  ]);

  return (
    <LibraryClient 
      initialBooks={initialBooks}
      initialCopies={initialCopies}
      initialMembers={initialMembers}
      initialLoans={initialLoans}
      initialReservations={initialReservations}
      initialResolutions={initialResolutions}
      students={students}
      faculty={faculty}
    />
  );
}
