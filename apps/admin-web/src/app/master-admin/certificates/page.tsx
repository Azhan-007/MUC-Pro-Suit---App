import { 
  CertificateService,
  StudentService 
} from "@/services/domain";
import { CertificateClient } from "./CertificateClient";

export default async function CertificatesPage() {
  const [
    types,
    requests,
    records,
    history,
    students
  ] = await Promise.all([
    CertificateService.getCertificateTypes(),
    CertificateService.getCertificateRequests(),
    CertificateService.getCertificateRecords(),
    CertificateService.getCertificateHistory(),
    StudentService.getAllStudents()
  ]);

  return (
    <CertificateClient 
      initialTypes={types}
      initialRequests={requests}
      initialRecords={records}
      initialHistory={history}
      students={students}
    />
  );
}
