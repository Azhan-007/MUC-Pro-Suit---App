const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  // Find all timetable slots and their period times
  const slots = await p.timetableSlot.findMany({
    include: {
      period: true,
      room: true,
      timetableVersion: { include: { academicClass: true } },
      teachingAssignment: {
        include: {
          programSubject: true,
          faculty: true,
          academicClass: true
        }
      }
    }
  });
  
  console.log(`Total slots: ${slots.length}`);
  for (const s of slots) {
    console.log({
      day: s.dayOfWeek,
      period: s.period?.code,
      startTime: s.period?.startTime,
      endTime: s.period?.endTime,
      subject: s.teachingAssignment?.programSubject?.name,
      faculty: s.teachingAssignment?.faculty?.firstName,
      class: s.teachingAssignment?.academicClass?.code
    });
  }
}
run().catch(console.error).finally(() => p.$disconnect());
