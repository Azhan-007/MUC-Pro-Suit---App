const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  // Find all classes that are clearly test/garbage entries
  const fakePatterns = ['FINAL_YR_CLASS_', 'NON_FINAL_CLASS_', 'IV BCA'];
  
  const classes = await p.academicClass.findMany({
    include: {
      _count: { select: { enrollments: true, teachingAssignments: true, timetableVersions: true, attendanceSessions: true } }
    }
  });
  
  const toDelete = classes.filter(c => {
    const isFake = fakePatterns.some(p => c.code.startsWith(p) || c.code.includes(p));
    const hasNoData = c._count.enrollments === 0 && c._count.timetableVersions === 0 && c._count.attendanceSessions === 0;
    return isFake && hasNoData;
  });
  
  console.log(`Found ${toDelete.length} fake classes to delete:`);
  toDelete.forEach(c => console.log(`  - ${c.id}: ${c.code}`));
  
  for (const cls of toDelete) {
    // Delete any empty teaching assignments first
    if (cls._count.teachingAssignments > 0) {
      await p.teachingAssignment.deleteMany({ where: { academicClassId: cls.id } });
    }
    await p.academicClass.delete({ where: { id: cls.id } });
    console.log(`Deleted: ${cls.code}`);
  }
  
  const remaining = await p.academicClass.count();
  console.log(`\nClasses remaining: ${remaining}`);
}
run().catch(console.error).finally(() => p.$disconnect());
