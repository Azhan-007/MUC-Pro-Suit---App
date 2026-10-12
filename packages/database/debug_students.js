const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const students = await p.student.findMany({
    include: {
      enrollments: true
    }
  });
  console.log(JSON.stringify(students, null, 2));
}
run().catch(console.error).finally(() => p.$disconnect());
