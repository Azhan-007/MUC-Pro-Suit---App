const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  const c1 = await p.academicClass.findFirst({ where: { code: '2026-27-BSC-CS-Y1' }, include: { enrollments: true, teachingAssignments: true, timetableVersions: true } });
  const c2 = await p.academicClass.findFirst({ where: { code: '2026-27-BSC_CS-Y1' }, include: { enrollments: true, teachingAssignments: true, timetableVersions: true } });
  
  if (!c1 || !c2) {
    console.log("One or both classes not found");
    return;
  }
  
  console.log(`Target class: ${c1.id} (Enrollments: ${c1.enrollments.length})`);
  console.log(`Source class: ${c2.id} (Enrollments: ${c2.enrollments.length})`);

  // Move enrollments from c2 to c1
  const moved = await p.studentEnrollment.updateMany({
    where: { academicClassId: c2.id },
    data: { academicClassId: c1.id }
  });
  console.log(`Moved ${moved.count} enrollments`);

  // Move TeachingAssignments
  const taMoved = await p.teachingAssignment.updateMany({
    where: { academicClassId: c2.id },
    data: { academicClassId: c1.id }
  });
  console.log(`Moved ${taMoved.count} teaching assignments`);

  // Move TimetableVersions
  const tvMoved = await p.timetableVersion.updateMany({
    where: { academicClassId: c2.id },
    data: { academicClassId: c1.id }
  });
  console.log(`Moved ${tvMoved.count} timetable versions`);

  // Delete duplicate class
  await p.academicClass.delete({ where: { id: c2.id } });
  console.log(`Deleted duplicate class ${c2.code}`);
}
run().catch(console.error).finally(() => p.$disconnect());
