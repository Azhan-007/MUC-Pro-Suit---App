const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const program = await prisma.program.findFirst({ where: { code: 'BSC_CS' } });
  console.log('Program:', program);
  const classes = await prisma.academicClass.findMany({ where: { programId: program?.id } });
  console.log('Classes:', classes);
}
run().catch(console.error).finally(() => prisma.$disconnect());
