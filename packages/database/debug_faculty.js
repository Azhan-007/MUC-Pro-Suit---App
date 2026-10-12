const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const f = await p.faculty.findMany({
    include: {
      teachingAssignments: true
    }
  });
  console.log(JSON.stringify(f, null, 2));
}
run().catch(console.error).finally(() => p.$disconnect());
