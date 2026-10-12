const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  console.log('=== FULL SYSTEM DATA INTEGRITY CHECK ===\n');

  // 1. Classes
  const classes = await p.academicClass.findMany({
    include: {
      _count: { select: { enrollments: { where: { status: 'ACTIVE' } }, timetableVersions: true } }
    }
  });
  console.log(`[1] Classes: ${classes.length}`);
  classes.forEach(c => console.log(`  - ${c.code} | Enrollments: ${c._count.enrollments} | TT Versions: ${c._count.timetableVersions}`));

  // 2. Students
  const students = await p.student.findMany({ include: { enrollments: { where: { status: 'ACTIVE' } } } });
  console.log(`\n[2] Students: ${students.length}`);
  students.forEach(s => console.log(`  - ${s.firstName} ${s.lastName} | Class: ${s.enrollments[0]?.academicClassId?.slice(0,8) || 'UNENROLLED'}`));

  // 3. Faculty
  const faculty = await p.faculty.findMany({
    include: { teachingAssignments: { where: { status: 'ACTIVE' }, include: { programSubject: true, academicClass: true } } }
  });
  console.log(`\n[3] Faculty: ${faculty.length}`);
  faculty.forEach(f => {
    console.log(`  - ${f.firstName} ${f.lastName} | Assignments: ${f.teachingAssignments.length}`);
    f.teachingAssignments.forEach(a => console.log(`      → ${a.programSubject?.name} in ${a.academicClass?.code}`));
  });

  // 4. Timetable
  const slots = await p.timetableSlot.findMany({
    include: { period: true, teachingAssignment: { include: { programSubject: true, faculty: true, academicClass: true } } }
  });
  console.log(`\n[4] Timetable Slots: ${slots.length}`);
  const byDay = {};
  slots.forEach(s => {
    if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = 0;
    byDay[s.dayOfWeek]++;
  });
  Object.entries(byDay).forEach(([day, count]) => console.log(`  - ${day}: ${count} periods`));

  // 5. Attendance
  const sessions = await p.attendanceSession.findMany({
    include: { _count: { select: { entries: true } }, programSubject: true, academicClass: true }
  });
  console.log(`\n[5] Attendance Sessions: ${sessions.length}`);
  sessions.forEach(s => console.log(`  - ${s.date.toISOString().split('T')[0]} | ${s.academicClass?.code} | ${s.programSubject?.name} | Entries: ${s._count.entries}`));

  // 6. Check for orphans
  const orphanEnrollments = await p.studentEnrollment.count({ where: { academicClass: null } });
  const orphanSlots = await p.timetableSlot.count({ where: { timetableVersion: null } });
  console.log(`\n[6] Orphan Enrollments (no class): ${orphanEnrollments}`);
  console.log(`    Orphan TimetableSlots (no version): ${orphanSlots}`);
  
  console.log('\n=== DONE ===');
}
run().catch(console.error).finally(() => p.$disconnect());
