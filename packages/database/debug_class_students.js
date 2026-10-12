const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const classes = await p.academicClass.findMany({ include: { enrollments: { include: { student: true } } } });
  for (const c of classes) {
    if (c.enrollments.length > 0) {
      console.log(`\nClass: ${c.code} (${c.id})`);
      for (const en of c.enrollments) {
        console.log(`- ${en.student.firstName} ${en.student.lastName} (Status: ${en.status})`);
      }
    }
  }
}
run().catch(console.error).finally(() => p.$disconnect());
