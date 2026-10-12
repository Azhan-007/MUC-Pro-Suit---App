const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const classes = await p.academicClass.findMany({
    where: { code: { in: ['2026-27-BSC-CS-Y1', '2026-27-BSC_CS-Y1'] } },
    include: { teachingAssignments: { include: { faculty: true, programSubject: true } } }
  });
  
  for (const c of classes) {
    console.log(`\nClass: ${c.code}`);
    for (const a of c.teachingAssignments) {
      console.log(`- Subject: ${a.programSubject.name} | Faculty: ${a.faculty.firstName} ${a.faculty.lastName}`);
    }
  }
}
run().catch(console.error).finally(() => p.$disconnect());
