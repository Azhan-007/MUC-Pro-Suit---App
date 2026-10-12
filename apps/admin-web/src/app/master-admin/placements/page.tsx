import { 
  PlacementService,
  StudentService 
} from "@/services/domain";
import { PlacementClient } from "./PlacementClient";

export default async function PlacementsPage() {
  const [
    companies,
    drives,
    roles,
    profiles,
    applications,
    rounds,
    results,
    offers,
    students
  ] = await Promise.all([
    PlacementService.getCompanies(),
    PlacementService.getDrives(),
    PlacementService.getJobRoles(),
    PlacementService.getProfiles(),
    PlacementService.getApplications(),
    PlacementService.getRounds(),
    PlacementService.getRoundResults(),
    PlacementService.getOffers(),
    StudentService.getAllStudents()
  ]);

  return (
    <PlacementClient 
      initialCompanies={companies}
      initialDrives={drives}
      initialRoles={roles}
      initialProfiles={profiles}
      initialApplications={applications}
      initialRounds={rounds}
      initialResults={results}
      initialOffers={offers}
      students={students}
    />
  );
}
