const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const classes = await p.academicClass.findMany({
    include: {
      program: { include: { department: true } }
    }
  });
  console.log(JSON.stringify(classes, null, 2));
}
run().catch(console.error).finally(() => p.$disconnect());
