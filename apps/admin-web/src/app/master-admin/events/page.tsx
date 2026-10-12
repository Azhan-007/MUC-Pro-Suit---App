import { 
  EventService,
  StudentService,
  FacultyService
} from "@/services/domain";
import { EventClient } from "./EventClient";

export default async function EventsPage() {
  const [
    types,
    events,
    targetings,
    registrations,
    attendances,
    histories,
    students,
    faculty
  ] = await Promise.all([
    EventService.getEventTypes(),
    EventService.getEvents(),
    EventService.getEventTargetings(),
    EventService.getEventRegistrations(),
    EventService.getEventAttendances(),
    EventService.getEventHistories(),
    StudentService.getAllStudents(),
    FacultyService.getAllFaculty()
  ]);

  return (
    <EventClient 
      initialTypes={types}
      initialEvents={events}
      initialTargetings={targetings}
      initialRegistrations={registrations}
      initialAttendances={attendances}
      initialHistories={histories}
      students={students}
      faculty={faculty}
    />
  );
}
