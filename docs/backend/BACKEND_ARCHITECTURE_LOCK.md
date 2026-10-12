# MUC PRO SUITE — Backend Architecture Lock Audit

**Audit date:** 2026-09-24  
**Scope:** architecture and documentation only; no production backend, database, migration, API, or frontend change was made.  
**Classification:** **NEEDS DESIGN** — the target architecture below is the implementation baseline once the listed decisions are made.

## Executive summary

### Facts verified from the repository

- `apps/backend` is a minimal Fastify 4 server with `GET /api/health`; it has no route modules, authentication, authorization, service layer, data access, validation, tests, or PostgreSQL connection.
- `packages/database` declares Prisma 5 and `@prisma/client`, but contains only a `dbPlaceholder` export. There is no Prisma schema, datasource, generator, generated client, migration, seed, SQL file, or `DATABASE_URL`.
- No PostgreSQL, Docker/Compose, backup, file-storage, queue, notification-delivery, or secret-management configuration exists in the active repository.
- The active admin web app is a Next.js mock frontend. Its `MockRepository` and domain services are in `apps/admin-web/src/services`; every displayed business record comes from `src/data/mock/db.ts` or local React state.
- The mobile app is also mock-backed. It has a useful Axios/JWT-refresh boundary in `src/services/api.ts`, but login remains hard-coded and no backend endpoint exists.
- There is no repository file titled *BACKEND & DATABASE READINESS AUDIT*; therefore no claim from such a report could be independently verified.

### Locked architecture

```text
Admin Web / Expo mobile
       │ HTTPS JSON API
       ▼
Fastify v1 route modules ─ request schema + authentication + authorization
       ▼
Domain application services ─ transactions, workflows, audit/outbox
       ▼
Prisma data-access adapters
       ▼
PostgreSQL

Object storage is reached only through a storage-port adapter.
External delivery/payment calls are driven from persisted outbox/webhook records.
```

Business rules, authorization, workflow transitions, financial calculations, and concurrency controls belong in backend services and PostgreSQL constraints—not in React, React Native, Zustand, or mock repositories.

## Repository findings and readiness

| Area | Verified state | Classification |
| --- | --- | --- |
| Fastify runtime | Health endpoint only | NEEDS DESIGN |
| Prisma / PostgreSQL | Packages only; no configured database | BLOCKED until infrastructure is provisioned |
| Authentication | Admin role is local/mock; mobile has mock credentials and token-shaped stubs | NEEDS DESIGN |
| RBAC | UI-only role helpers and mock role records; no enforcement | NEEDS DESIGN |
| Academic master data | Rich mock types/data; not persistent | NEEDS DESIGN |
| Attendance/results/finance | Mock calculations only; no workflow integrity | NEEDS DESIGN |
| Library/placement/certificates/events | Mock domain services only | NEEDS DESIGN |
| Notifications/reports | Mock-derived display models only | NEEDS DESIGN |
| File storage/backups | URL strings and mock metadata only | NEEDS DECISION |
| Frontend migration | Service boundary exists in admin web; mobile API shell exists | READY for a staged contract migration after API design |

## Current mock relationship and workflow audit

| Current model relationship/workflow | Verified implementation | Audit result |
| --- | --- | --- |
| Academic year → semester | `Semester.academicYearId` | Exists in mock types; dates are mock-populated despite the rules not specifying exact calendar dates. |
| Department → course → subject/class | Direct IDs in mock types | Exists structurally, but subject faculty assignments are `facultyIds[]` and no curriculum/enrollment history exists. |
| Class → section → student | `ClassEntity`, `SectionEntity`, `Student.sectionId` | Exists as a UI convention; conflicts with the no-arbitrary-section rule. Mock uses a `General` section, but result mocks reference an absent A section. |
| Faculty → subject/class | `Subject.facultyIds`, section advisor, timetable faculty ID | Partial/mock only; no time-effective teaching assignment or backend authorization. |
| Attendance | Student/subject/section/semester number/date/period records; local browser save | Partial mock facts. Missing academic year/term/class/enrollment foreign keys, session states, correction history, uniqueness, transaction and access enforcement. |
| Timetable/examination/results | IDs link to academic entities; client calculates grades | Partial mock model. No versioning/publication/correction history. BCA Shift-II data is contradicted by a Shift-I timetable/examination mock. |
| Fee structure → account → payment | Structures/components, account totals, payments, scholarships/fines | Partial mock model. Totals are duplicated/calculated in UI; no charge ledger, allocation, receipt immutability, gateway/webhook or reconciliation. |
| Library | Catalog → copy; member → loan/reservation/resolution | Strong mock inventory but count/availability/finance link is client logic; no database concurrency protection. |
| Placement | Company → drive → roles/rounds; student profile/application/offer | Strong mock inventory but eligibility has course-ID-text heuristics and no history rows for application transitions. |
| Certificates | Type → request → record → history | Strong mock inventory, but issue/payment and request states are incomplete for review/reissue enforcement. |
| Events/notifications | Event → targeting/registration/attendance/history; notification → delivery/history | Strong mock inventory, but targets use ID arrays and delivery/state work is browser-only. |
| Auth/RBAC/audit | Mock roles/users/assignments/permissions/audit log plus UI role checks | No credentials/session/role-permission data/effective enforcement. `User` itself has no role; mock access is incomplete. |

## Architecture-lock documents

- [Entity model](BACKEND_ENTITY_MODEL.md): persistent entities, required fields, derived values, history and lifecycle.
- [Relationship map](BACKEND_RELATIONSHIP_MAP.md): cardinalities, junctions and academic-history context.
- [Workflow state map](BACKEND_WORKFLOW_STATE_MAP.md): legal transitions, authorities and audit/concurrency rules.
- [Transaction matrix](BACKEND_TRANSACTION_MATRIX.md): atomic operations, rollback and idempotency.
- [RBAC matrix](BACKEND_RBAC_MATRIX.md), [security model](BACKEND_SECURITY_MODEL.md), and [API architecture](BACKEND_API_ARCHITECTURE.md).
- [Storage](BACKEND_STORAGE_ARCHITECTURE.md), [notifications](BACKEND_NOTIFICATION_ARCHITECTURE.md), and [reporting](BACKEND_REPORTING_ARCHITECTURE.md).
- [Implementation plan](BACKEND_IMPLEMENTATION_PLAN.md) and [decision register](BACKEND_DECISIONS_REQUIRED.md).

## Mandatory implementation principles

1. Keep the locked stack: Node.js, TypeScript, Fastify, PostgreSQL, Prisma, Next.js/React and Expo/React Native. Do not introduce a replacement backend framework or ORM.
2. Use domain-oriented application services. Route handlers parse/authorize/request-map; Prisma adapters persist; neither contains scattered business policy.
3. A mutable student profile is never the source of historic academic facts. Attendance, results, fees, assessments, and eligibility must refer to a term-specific enrollment/context.
4. Prefer append-only histories for financial postings, result changes, attendance corrections, certificates, placement statuses, and audit events. Do not use destructive correction for regulated history.
5. Status columns are not authorization. Services must validate legal prior state, actor permission, idempotency key where needed, and transaction outcome.
6. `DOMAIN_ADMIN` never inherits `MASTER_ADMIN`. Domain access is explicit and backend-enforced.
7. Finance is authoritative from charges, credits/waivers, payment attempts, successful payments, allocations, receipts, and reversals—not a UI total alone.
8. No hostel or transport operational domain is in scope. Do not create tables for either.

## Backend module layout (target)

```text
apps/backend/src/
  app.ts                         # Fastify composition; does not call listen
  server.ts                      # environment validation and process startup
  config/                        # typed configuration only
  plugins/                       # prisma, auth, errors, request context
  modules/
    auth/ access/ academic/ people/ attendance/ examinations/ finance/
    library/ placement/ certificates/ events/ notifications/ reports/
    files/ platform/
      routes.ts schemas.ts service.ts repository.ts policy.ts types.ts
  shared/                        # pagination, errors, ids, clock, outbox
packages/database/
  prisma/schema.prisma
  prisma/migrations/
  src/client.ts                  # singleton lifecycle only
  src/index.ts
```

This is a recommended destination, not a request to create it in this audit.

## PostgreSQL and Prisma lock

- Use one PostgreSQL database and the `public` database schema. Organize logical domains through Prisma models and module ownership, rather than prematurely splitting PostgreSQL schemas.
- Use Prisma schema/migrations in `packages/database/prisma`. Production migration deployment is `prisma migrate deploy`; local development uses reviewed named migrations. Never use `db push` as production migration control.
- Primary keys: PostgreSQL `uuid` values generated by Prisma (`uuid()`); external receipt/certificate references are separate business identifiers, never database primary keys.
- Timestamps: `created_at timestamptz NOT NULL`, `updated_at timestamptz NOT NULL`; all instants stored in UTC. Date-only academic/calendar data uses `date`; period/time-of-day uses typed `time` plus the shift/period master. The college timezone for presentation and business-day comparisons must be configured before go-live.
- Monetary amounts are `numeric(14,2)`, never float. Percentages/marks use explicit `numeric` precision/range checks.
- Nullable means genuinely unknown/not applicable. Do not encode unknown values as empty strings or sentinel IDs.
- Operational masters may have `archived_at`/`status`; historic facts, payments, results, certificates, and audit entries are not soft-deleted. Their lifecycle state/histories preserve the record.
- Foreign keys default to `RESTRICT` for institutional, finance, assessment, certificate, attendance, audit, and history data. Use `CASCADE` only for purely dependent, unposted configuration/junction rows after explicit review.
- Prisma schema is one source file initially. Split only when Prisma support and migration review practices make multi-file composition safe for the installed version.

## Immediate blockers and decisions

See [BACKEND_DECISIONS_REQUIRED.md](BACKEND_DECISIONS_REQUIRED.md) for the owned decision register. The implementation blockers are: PostgreSQL environment/secrets, production file-storage provider, payment gateway choice, delivery provider(s), worker/scheduler hosting, calendar exact dates, attendance-correction approval policy, canonical grading policy, and placement reapplication policy.

## Verified frontend/domain findings requiring migration attention

- `packages/shared-types` defines `SUPERADMIN`/`ADMIN`, whereas the domain requires `SUPER_ADMIN`, `MASTER_ADMIN`, `DOMAIN_ADMIN`, `FACULTY`, and `STUDENT`. It cannot be reused as an authorization source unchanged.
- Root workspaces omit `apps/mobile`; mobile has a separate lockfile. This is an infrastructure consistency risk, not a reason to alter the locked stack.
- `Student.currentSemester`, `Student.sectionId`, and raw `facultyIds` are mutable mock conveniences. They do not preserve enrollment or teaching history.
- `SectionEntity` models generic/A–B sections even though the college forbids assumed arbitrary sections. The target model has one normal academic class per course/year, with no default Section table.
- BCA is locked to Shift II, but mock timetable entry `tt-3` and mock examination `exam-1` label BCA as Shift I. Mock results also reference non-existent `sec-bca-1-a`. These are data/UI defects, not target facts.
- `Fine.source` lacks `LIBRARY`, while library code emits an `OTHER` fine with placeholder student/account/term IDs. The target finance charge must carry a typed source and real origin reference.
- Current placement final-year detection inspects course-ID text and treats semesters 3/4 as PG final year. The target must derive final year from the enrolled program’s `duration_years` and academic-year-of-study.
- Event conclusion code auto-creates an `APPROVED` certificate request. That violates the rule that Certificate Admin exclusively controls approval; target events may request/notify certificate work but cannot bypass certificate approval.
- Mobile department timetable mocks H1–H8 and A/B/G sections, contrary to the fixed H1–H5 and no-arbitrary-section rules. Mobile fee presentation also labels hostel-related strings despite hostel exclusion. These are frontend mock defects to remove during its later migration.

## Final readiness classification

The repository is **not backend-ready for production implementation**. It is **ready for architecture-led implementation planning** because the active frontend exposes a substantial mock entity/workflow inventory and the authoritative college rules are present. The architecture becomes implementation-ready after required decisions are accepted and the first infrastructure/auth/database foundation is built.
