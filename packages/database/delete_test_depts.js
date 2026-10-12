const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const res = await prisma.department.deleteMany({
    where: {
      name: {
        startsWith: 'Test Dept'
      }
    }
  });
  console.log('Deleted departments:', res.count);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
