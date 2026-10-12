import { PrismaClient, ShiftCode, FundingType, RoleCode, ProgramDegree, GenderEligibility, TermType, PeriodCode } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to hash password if we need to create an initial super admin
async function generateHash(password: string) {
  return new Promise<string>((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString('hex'));
    });
  });
}

async function main() {
  console.log('Starting seed...');

  // 1. Roles
  console.log('Seeding roles...');
  const roles = [
    { code: RoleCode.SUPER_ADMIN, name: 'Super Admin', description: 'Platform Administrator' },
    { code: RoleCode.MASTER_ADMIN, name: 'Master Admin', description: 'Institutional Administrator' },
    { code: RoleCode.DOMAIN_ADMIN, name: 'Domain Admin', description: 'Specific Domain Administrator' },
    { code: RoleCode.FACULTY, name: 'Faculty', description: 'Teaching Staff' },
    { code: RoleCode.STUDENT, name: 'Student', description: 'Enrolled Student' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }

  // 2. Shifts
  console.log('Seeding shifts...');
  const shift1 = await prisma.shift.upsert({
    where: { code: ShiftCode.SHIFT_I },
    update: {},
    create: { code: ShiftCode.SHIFT_I, name: 'Shift I', fundingType: FundingType.AIDED },
  });

  const shift2 = await prisma.shift.upsert({
    where: { code: ShiftCode.SHIFT_II },
    update: {},
    create: { code: ShiftCode.SHIFT_II, name: 'Shift II', fundingType: FundingType.SELF_FINANCING },
  });

  // 3. Period Definitions
  console.log('Seeding periods...');
  const shift1Periods = [
    { code: PeriodCode.H1, sortOrder: 1, startTime: new Date('1970-01-01T08:00:00Z'), endTime: new Date('1970-01-01T08:55:00Z') },
    { code: PeriodCode.H2, sortOrder: 2, startTime: new Date('1970-01-01T08:55:00Z'), endTime: new Date('1970-01-01T09:50:00Z') },
    { code: PeriodCode.H3, sortOrder: 3, startTime: new Date('1970-01-01T10:10:00Z'), endTime: new Date('1970-01-01T11:05:00Z') },
    { code: PeriodCode.H4, sortOrder: 4, startTime: new Date('1970-01-01T11:05:00Z'), endTime: new Date('1970-01-01T12:00:00Z') },
    { code: PeriodCode.H5, sortOrder: 5, startTime: new Date('1970-01-01T12:00:00Z'), endTime: new Date('1970-01-01T12:55:00Z') },
  ];

  const shift2Periods = [
    { code: PeriodCode.H1, sortOrder: 1, startTime: new Date('1970-01-01T13:00:00Z'), endTime: new Date('1970-01-01T13:55:00Z') },
    { code: PeriodCode.H2, sortOrder: 2, startTime: new Date('1970-01-01T13:55:00Z'), endTime: new Date('1970-01-01T14:50:00Z') },
    { code: PeriodCode.H3, sortOrder: 3, startTime: new Date('1970-01-01T14:50:00Z'), endTime: new Date('1970-01-01T15:45:00Z') },
    { code: PeriodCode.H4, sortOrder: 4, startTime: new Date('1970-01-01T15:45:00Z'), endTime: new Date('1970-01-01T16:40:00Z') },
    { code: PeriodCode.H5, sortOrder: 5, startTime: new Date('1970-01-01T17:00:00Z'), endTime: new Date('1970-01-01T17:55:00Z') },
  ];

  for (const p of shift1Periods) {
    await prisma.periodDefinition.upsert({
      where: { shiftId_code: { shiftId: shift1.id, code: p.code } },
      update: {},
      create: { ...p, shiftId: shift1.id },
    });
  }

  for (const p of shift2Periods) {
    await prisma.periodDefinition.upsert({
      where: { shiftId_code: { shiftId: shift2.id, code: p.code } },
      update: {},
      create: { ...p, shiftId: shift2.id },
    });
  }

  // 4. Academic Year & Terms
  console.log('Seeding academic year...');
  const ay = await prisma.academicYear.upsert({
    where: { code: '2026-27' },
    update: { isActive: true },
    create: {
      code: '2026-27',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-05-31'),
      isActive: true,
    },
  });

  const termOdd = await prisma.academicTerm.upsert({
    where: { academicYearId_type: { academicYearId: ay.id, type: TermType.ODD } },
    update: { isActive: true },
    create: {
      academicYearId: ay.id,
      type: TermType.ODD,
      termNumber: 1,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-11-30'),
      isActive: true,
    }
  });

  const termEven = await prisma.academicTerm.upsert({
    where: { academicYearId_type: { academicYearId: ay.id, type: TermType.EVEN } },
    update: { isActive: false },
    create: {
      academicYearId: ay.id,
      type: TermType.EVEN,
      termNumber: 2,
      startDate: new Date('2026-12-01'),
      endDate: new Date('2027-05-31'),
      isActive: false,
    }
  });

  // 5. Departments
  console.log('Seeding departments...');
  const depts = [
    { code: 'ECON', name: 'Corporate Economics' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'CS', name: 'Computer Science' },
    { code: 'CORP', name: 'Corporate Secretaryship' },
    { code: 'COM', name: 'Commerce' },
    { code: 'ENG', name: 'English' },
    { code: 'BBA', name: 'Business Administration' },
    { code: 'CA', name: 'Computer Applications' },
    { code: 'MICRO', name: 'Microbiology' },
    { code: 'DS', name: 'Data Science' },
    { code: 'IT', name: 'Information Technology' },
  ];

  const deptMap = new Map();
  for (const d of depts) {
    const created = await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
    deptMap.set(d.code, created.id);
  }

  // 6. Programs (Courses)
  console.log('Seeding programs...');
  const programs = [
    // Shift I
    { code: 'BA_ECON', name: 'B.A. Corporate Economics', dept: 'ECON', shiftId: shift1.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.AIDED },
    { code: 'BSC_MATH', name: 'B.Sc. Mathematics', dept: 'MATH', shiftId: shift1.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.AIDED },
    { code: 'BSC_CS', name: 'B.Sc. Computer Science', dept: 'CS', shiftId: shift1.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.AIDED },
    { code: 'BCOM_CORP', name: 'B.Com. Corporate Secretaryship', dept: 'CORP', shiftId: shift1.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.AIDED },
    { code: 'BCOM_GEN', name: 'B.Com. General / Commerce', dept: 'COM', shiftId: shift1.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.AIDED },
    
    // Shift II
    { code: 'BA_ENG', name: 'B.A. English', dept: 'ENG', shiftId: shift2.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.SELF_FINANCING },
    { code: 'BBA_GEN', name: 'B.B.A.', dept: 'BBA', shiftId: shift2.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.SELF_FINANCING },
    { code: 'BCA_GEN', name: 'B.C.A.', dept: 'CA', shiftId: shift2.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.SELF_FINANCING },
    { code: 'BCOM_CA', name: 'B.Com. Computer Applications', dept: 'CA', shiftId: shift2.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.SELF_FINANCING },
    { code: 'BSC_MICRO', name: 'B.Sc. Microbiology', dept: 'MICRO', shiftId: shift2.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.SELF_FINANCING, genderEligibility: GenderEligibility.FEMALE_ONLY },
    { code: 'BSC_DS', name: 'B.Sc. Data Science', dept: 'DS', shiftId: shift2.id, degree: ProgramDegree.UG, durationYears: 3, totalSemesters: 6, fundingType: FundingType.SELF_FINANCING },
    { code: 'MSC_IT', name: 'M.Sc. Information Technology', dept: 'IT', shiftId: shift2.id, degree: ProgramDegree.PG, durationYears: 2, totalSemesters: 4, fundingType: FundingType.SELF_FINANCING },
    { code: 'MSC_MATH', name: 'M.Sc. Mathematics', dept: 'MATH', shiftId: shift2.id, degree: ProgramDegree.PG, durationYears: 2, totalSemesters: 4, fundingType: FundingType.SELF_FINANCING },
  ];

  const programMap = new Map();
  for (const p of programs) {
    const { dept, ...pData } = p;
    const created = await prisma.program.upsert({
      where: { code: pData.code },
      update: {},
      create: { ...pData, departmentId: deptMap.get(dept) },
    });
    programMap.set(p.code, created.id);
  }

  // 7. Academic Classes (Years of Study)
  console.log('Seeding academic classes...');
  for (const p of programs) {
    const programId = programMap.get(p.code);
    
    for (let year = 1; year <= p.durationYears; year++) {
      const classCode = `${ay.code}-${p.code}-Y${year}`;
      await prisma.academicClass.upsert({
        where: { academicYearId_code: { academicYearId: ay.id, code: classCode } },
        update: { status: 'ACTIVE' },
        create: {
          academicYearId: ay.id,
          programId: programId,
          yearOfStudy: year,
          code: classCode,
          status: 'ACTIVE',
        },
      });
    }
  }

  // 7b. Curriculum Versions
  console.log('Seeding curriculum versions...');
  const allExistingPrograms = await prisma.program.findMany();
  for (const prog of allExistingPrograms) {
    const currCode = `${prog.code}-2026`;
    await prisma.curriculumVersion.upsert({
      where: {
        programId_code: {
          programId: prog.id,
          code: currCode,
        }
      },
      update: { status: 'ACTIVE' },
      create: {
        programId: prog.id,
        code: currCode,
        regulation: '2026',
        effectiveFrom: new Date('2026-06-01'),
        status: 'ACTIVE',
      },
    });

    for (let year = 1; year <= prog.durationYears; year++) {
      const classCode = `${ay.code}-${prog.code}-Y${year}`;
      await prisma.academicClass.upsert({
        where: { academicYearId_code: { academicYearId: ay.id, code: classCode } },
        update: { status: 'ACTIVE' },
        create: {
          academicYearId: ay.id,
          programId: prog.id,
          yearOfStudy: year,
          code: classCode,
          status: 'ACTIVE',
        },
      });
    }
  }

  // 8. Super Admin & Master Admin Users
  console.log('Seeding administrative users...');
  const superAdminRole = await prisma.role.findUnique({ where: { code: RoleCode.SUPER_ADMIN } });
  const masterAdminRole = await prisma.role.findUnique({ where: { code: RoleCode.MASTER_ADMIN } });
  
  // Argon2 hash for "password" (compatible with Fastify auth)
  const defaultPwdHash = '$argon2id$v=19$m=65536,t=3,p=4$6ijb2zI5DFe2AT25I8SLuw$XUXrRsDLN16EXsAwbqV2vsJDB1KxQcu+7YTY1iuJ2Cs';
  const start = new Date('1970-01-01T00:00:00Z');

  // Master Admin (masteradmin@muc.edu and master@muc.edu)
  if (masterAdminRole) {
    for (const [email, username] of [['masteradmin@muc.edu', 'masteradmin'], ['master@muc.edu', 'master']]) {
      let masterUser = await prisma.user.findUnique({ where: { normalizedEmail: email } });
      if (!masterUser) {
        masterUser = await prisma.user.create({
          data: {
            email,
            normalizedEmail: email,
            username,
            normalizedUsername: username,
            passwordHash: defaultPwdHash,
            status: 'ACTIVE',
          },
        });
      } else {
        await prisma.user.update({
          where: { id: masterUser.id },
          data: { passwordHash: defaultPwdHash, status: 'ACTIVE' },
        });
      }

      await prisma.userRoleAssignment.upsert({
        where: { userId_roleId_startsAt: { userId: masterUser.id, roleId: masterAdminRole.id, startsAt: start } },
        update: { status: 'ACTIVE' },
        create: {
          userId: masterUser.id,
          roleId: masterAdminRole.id,
          startsAt: start,
          status: 'ACTIVE',
        },
      });
    }
  }

  // Super Admin (admin@muc.edu and superadmin@muc.edu)
  if (superAdminRole) {
    for (const [email, username] of [['admin@muc.edu', 'admin'], ['superadmin@muc.edu', 'superadmin']]) {
      let superUser = await prisma.user.findUnique({ where: { normalizedEmail: email } });
      if (!superUser) {
        superUser = await prisma.user.create({
          data: {
            email,
            normalizedEmail: email,
            username,
            normalizedUsername: username,
            passwordHash: defaultPwdHash,
            status: 'ACTIVE',
          },
        });
      } else {
        await prisma.user.update({
          where: { id: superUser.id },
          data: { passwordHash: defaultPwdHash, status: 'ACTIVE' },
        });
      }

      await prisma.userRoleAssignment.upsert({
        where: { userId_roleId_startsAt: { userId: superUser.id, roleId: superAdminRole.id, startsAt: start } },
        update: { status: 'ACTIVE' },
        create: {
          userId: superUser.id,
          roleId: superAdminRole.id,
          startsAt: start,
          status: 'ACTIVE',
        },
      });
    }
  }

  // 9. Test Student User (for mobile app testing)
  console.log('Seeding test student...');
  const studentRole = await prisma.role.findUnique({ where: { code: RoleCode.STUDENT } });
  const facultyRole = await prisma.role.findUnique({ where: { code: RoleCode.FACULTY } });

  if (studentRole) {
    const studentEmail = 'student@muc.edu';
    const studentRegNo = '1764710';
    const studentAdmNo = 'ADM-2026-001';
    
    let studentUser = await prisma.user.findUnique({ where: { normalizedEmail: studentEmail } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: studentEmail,
          normalizedEmail: studentEmail,
          username: studentRegNo,
          normalizedUsername: studentRegNo.toLowerCase(),
          passwordHash: defaultPwdHash,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: { passwordHash: defaultPwdHash, status: 'ACTIVE' },
      });
    }

    await prisma.userRoleAssignment.upsert({
      where: { userId_roleId_startsAt: { userId: studentUser.id, roleId: studentRole.id, startsAt: start } },
      update: { status: 'ACTIVE' },
      create: {
        userId: studentUser.id,
        roleId: studentRole.id,
        startsAt: start,
        status: 'ACTIVE',
      },
    });

    // Create Student record
    const csDeptId = deptMap.get('CS');
    const csProgramId = programMap.get('BSC_CS');
    
    if (csDeptId && csProgramId) {
      let studentRecord = await prisma.student.findUnique({ where: { registrationNumber: studentRegNo } });
      if (!studentRecord) {
        studentRecord = await prisma.student.create({
          data: {
            userId: studentUser.id,
            registrationNumber: studentRegNo,
            admissionNumber: studentAdmNo,
            firstName: 'Mohammed',
            lastName: 'Azhan',
            email: studentEmail,
            normalizedEmail: studentEmail,
            phone: '9876543210',
            dateOfBirth: new Date('2005-03-15'),
            gender: 'MALE',
            bloodGroup: 'O+',
            guardianName: 'Parent Name',
            guardianPhone: '9876543211',
            admissionDepartmentId: csDeptId,
            admissionProgramId: csProgramId,
            admissionDate: new Date('2026-06-15'),
            status: 'ACTIVE',
          },
        });
      } else {
        // Link user if not linked
        if (!studentRecord.userId) {
          await prisma.student.update({
            where: { id: studentRecord.id },
            data: { userId: studentUser.id },
          });
        }
      }

      // Create enrollment for current term
      const csClassY1 = await prisma.academicClass.findFirst({
        where: { academicYearId: ay.id, programId: csProgramId, yearOfStudy: 1 },
      });
      const currVersion = await prisma.curriculumVersion.findFirst({
        where: { programId: csProgramId, status: 'ACTIVE' },
      });

      if (csClassY1 && currVersion) {
        await prisma.studentEnrollment.upsert({
          where: { studentId_academicTermId: { studentId: studentRecord.id, academicTermId: termOdd.id } },
          update: { status: 'ACTIVE' },
          create: {
            studentId: studentRecord.id,
            academicYearId: ay.id,
            academicTermId: termOdd.id,
            academicClassId: csClassY1.id,
            programId: csProgramId,
            departmentId: csDeptId,
            curriculumVersionId: currVersion.id,
            semesterNumber: 1,
            yearOfStudy: 1,
            shiftSnapshot: ShiftCode.SHIFT_I,
            status: 'ACTIVE',
            effectiveFrom: new Date('2026-06-01'),
          },
        });
      }
    }
  }

  // 10. Test Faculty User (for mobile app testing)
  console.log('Seeding test faculty...');
  if (facultyRole) {
    const facultyEmail = 'faculty@muc.edu';
    const facultyEmpId = 'FAC001';

    let facultyUser = await prisma.user.findUnique({ where: { normalizedEmail: facultyEmail } });
    if (!facultyUser) {
      facultyUser = await prisma.user.create({
        data: {
          email: facultyEmail,
          normalizedEmail: facultyEmail,
          username: facultyEmpId.toLowerCase(),
          normalizedUsername: facultyEmpId.toLowerCase(),
          passwordHash: defaultPwdHash,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.user.update({
        where: { id: facultyUser.id },
        data: { passwordHash: defaultPwdHash, status: 'ACTIVE' },
      });
    }

    await prisma.userRoleAssignment.upsert({
      where: { userId_roleId_startsAt: { userId: facultyUser.id, roleId: facultyRole.id, startsAt: start } },
      update: { status: 'ACTIVE' },
      create: {
        userId: facultyUser.id,
        roleId: facultyRole.id,
        startsAt: start,
        status: 'ACTIVE',
      },
    });

    const csDeptId = deptMap.get('CS');
    if (csDeptId) {
      const existingFaculty = await prisma.faculty.findUnique({ where: { employeeId: facultyEmpId } });
      if (!existingFaculty) {
        await prisma.faculty.create({
          data: {
            userId: facultyUser.id,
            employeeId: facultyEmpId,
            firstName: 'Dr. Arun',
            lastName: 'Kumar',
            email: facultyEmail,
            normalizedEmail: facultyEmail,
            phone: '9876543212',
            departmentId: csDeptId,
            designation: 'Assistant Professor',
            specialization: 'Computer Science',
            status: 'ACTIVE',
          },
        });
      }
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
