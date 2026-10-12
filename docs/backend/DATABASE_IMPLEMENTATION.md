# Database Implementation

## Technology Stack
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Primary Keys:** UUIDs for all models.

## Implemented Models
### Platform
- `User`, `Role`, `Permission`, `RolePermission`, `UserRoleAssignment`, `DomainAssignment`
- `AuthSession`, `PasswordResetToken`
- `AuditLog`, `IdempotencyKey`, `OutboxEvent`, `BackupRecord`

### Academic Core
- `AcademicYear`, `AcademicTerm`, `Shift`, `PeriodDefinition`
- `Department`, `Program`, `CurriculumVersion`, `ProgramSubject`, `AcademicClass`
- `Room` (optional)

### People & History
- `Student`, `Faculty`
- `StudentEnrollment`, `TeachingAssignment`, `ClassAdvisory`, `DepartmentLeadershipAssignment`

## Migrations & Seed
- Prisma schema is complete and validated.
- **Migrations:** Blocked by lack of local PostgreSQL instance. Awaiting `npx prisma migrate dev`.
- **Seed:** Deterministic seed script written (`packages/database/prisma/seed.ts`). It handles authoritative static data (Roles, Shifts, H1-H5).
