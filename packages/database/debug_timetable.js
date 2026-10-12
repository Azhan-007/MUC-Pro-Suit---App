const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const slots = await p.timetableSlot.findMany({
    where: {
      teachingAssignment: {
        academicClassId: 'eef7d70b-37fb-45cf-9809-7a65e830b6c2'
      }
    }
  });
  console.log('Class 1 slots:', slots.length);
  const slots2 = await p.timetableSlot.findMany({
    where: {
      teachingAssignment: {
        academicClassId: '346382f6-b8cb-4adb-b7c3-44202dfc46db'
      }
    }
  });
  console.log('Class 2 slots:', slots2.length);
}
run().catch(console.error).finally(() => p.$disconnect());
