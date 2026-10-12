const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const slots = await p.timetableSlot.findMany({
    where: {
      teachingAssignment: {
        academicClassId: 'eef7d70b-37fb-45cf-9809-7a65e830b6c2'
      }
    },
    include: { period: true }
  });
  console.log(slots.map(s => `${s.dayOfWeek} ${s.period.code}`).join('\n'));
}
run().catch(console.error).finally(() => p.$disconnect());
