# MUC PRO SUITE — API Architecture and Frontend Migration Map

**Base:** `/api/v1`. Domain routes expose commands and resources; they do not expose generic database CRUD that bypasses workflow services.

## Contract conventions

- JSON response envelope: `{ "data": T, "meta": { "requestId", "page?", "pageSize?", "total?" } }`. Errors: `{ "error": { "code", "message", "details?", "requestId" } }`.
- Validate params/query/body at the Fastify boundary. Domain services receive typed command objects and actor/request context. Do not share Prisma models as API DTOs.
- Lists use cursor pagination by default: `cursor`, `limit` (bounded), `sort`, and domain allow-listed filters. Response metadata exposes `nextCursor`; reports may use bounded page/offset only where justified.
- Use ISO 8601 UTC timestamps and `YYYY-MM-DD` date values. Monetary values are decimal strings in API payloads to avoid JavaScript float loss.
- Require `Idempotency-Key` for state-changing payment, attendance submit, library, event registration, certificate issuance, result publication and outbound-notification commands.
- Return `409` for version/state/conflict, `422` for valid syntax but failed domain rule, `403` for authorization, `401` for authentication, `404` only where disclosure policy permits, and a stable problem code for client handling.

## Route families

| Domain | Representative routes/commands |
| --- | --- |
| Auth | `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/password-reset/request`, `/auth/password-reset/confirm`, `GET /auth/me` |
| Platform/access | `/users`, `/roles`, `/permissions`, `/domain-assignments`, `/audit-logs`, `/backups` (all policy-protected) |
| Academic/master | `/academic-years`, `/terms`, `/departments`, `/programs`, `/curricula`, `/subjects`, `/classes`, `/enrollments`, `/teaching-assignments`, `/timetables` |
| People | `/students`, `/faculty`, `/me/student-profile`, `/me/faculty-profile` |
| Attendance | `POST /attendance/sessions`, `PATCH /attendance/sessions/:id/entries`, `POST /:id/submit`, `/lock`, `/corrections`; `GET` summaries/shortage endpoints |
| Examinations/results | `/assessments`, `/result-entries`, `POST /assessments/:id/validate|submit|approve|publish`, `/result-corrections` |
| Finance | `/fee-structures`, `/financial-accounts`, `/charges`, `/concessions`, `POST /payments/intents`, `/payments/offline`, `/webhooks/:provider`, `/receipts` |
| Library | `/library/catalog`, `/copies`, `/members`, `POST /loans/issue`, `/:id/renew`, `/:id/return`, `/resolutions`, `/reservations`, `/clearances` |
| Placement | `/placement/registrations`, `/profiles`, `/companies`, `/drives`, `/applications`, `/round-results`, `/offers` |
| Certificates | `/certificate-types`, `/certificate-requests`, `POST /:id/review|approve|issue|revoke|reissue` |
| Events | `/event-types`, `/events`, `POST /:id/submit|approve|publish|reschedule|cancel|complete`, `/registrations`, `/attendance` |
| Notifications | `/notifications`, `POST /:id/schedule|publish|cancel`, `/deliveries`, `POST /deliveries/:id/read` |
| Files | `POST /files/upload-intents`, `POST /files/:id/complete`, `GET /files/:id/download` |
| Reporting | `/reports/student-dossier`, `/attendance/shortage-report`, `/finance/defaulters`, `/reports/library`, `/reports/placement`, `/reports/events`, `/reports/certificates`, `/reports/audit` |

## Mock-to-API migration

| Existing client source | Current data behavior | Future API / response needed | Migration risk |
| --- | --- | --- | --- |
| Admin `MockRepository` + `StudentService` | `mockStudents`, computed dossier/metrics | `/students`, `/students/:id/dossier`, paginated list + command endpoints | Current UI assumes current semester/General section and computes summaries in browser. Map to enrollment-based DTOs. |
| Admin Faculty/Department/Course/Subject/Class services | Mock arrays, `facultyIds[]`, SectionEntity | Academic master/assignment endpoints | Replace raw ID arrays and optional General section with normalized server DTO; preserve display shape with adapter. |
| Admin AttendanceService/page | Mock records and local save only | Session/entry/submit/lock/correction plus summary/report endpoints | UI currently treats browser save as durable and identifies classes through section ID. Highest migration/state risk. |
| Admin Timetable/Examination/Result services | Static arrays + client grade function | Timetable version, assessment/result workflow endpoints | Remove invalid mock shift/section assumptions; grade policy must come from server. |
| Admin Fee/Scholarship/Fine pages | Browser-calculated account totals and mock payments | Fee structure/account/charge/payment/receipt endpoints | Never trust UI totals; shifts to decimal strings, allocation/receipt state and webhook pending states. |
| Admin Library service/page | Mock issue/return calculations | Catalog/copy/loan/reservation/resolution/clearance endpoints | Current return constructs placeholder finance IDs. Server must resolve member/enrollment/account. |
| Admin Placement service/page | Mock eligibility and application arrays | Profile/registration/drive/application/round/offer endpoints | Current final-year check derives from ID text and policy is hard-coded. Server returns eligibility reasons/snapshot. |
| Admin Certificates/Event services | Mock state/history; event auto-approval path | Certificate/event workflow command endpoints | Must prevent UI from passing arbitrary statuses or bypassing Certificate Admin. |
| Admin Notification/Report/Command Center services | Mock lists, in-memory recipient calculation, derived widgets | Notification commands/deliveries and reporting/read-model endpoints | Dashboard must consume designed read DTOs; no direct domain table joins in UI. |
| Admin auth store/lib | LocalStorage flag, fixed role | Auth endpoints, secure cookie/session-aware `me` response | Remove client-controlled role/authorization. |
| Mobile `authService` / Axios client | Hard-coded users; SecureStore mock tokens | Same auth contract; role/self-profile result | Preserve Axios boundary but coordinate web cookie vs mobile secure-store response. |
| Mobile campus store/mock data | In-memory mutations for fees, attendance, results, library, events, notifications | Self-scoped `/me/*` and domain list/command endpoints | Replace optimistic local facts with query cache + server mutations; normalize dates/amounts/statuses. |
| Mobile faculty mocks | Local attendance/marks/timetable/placement/leave/assignment data | Assigned-work endpoints first | Attendance/marks require scope/lock handling. Leave/HR and assignment/storage requirements are not yet locked. |

## Migration sequence and compatibility

Introduce an HTTP repository implementation behind the existing admin domain-service interfaces, one read-only domain at a time. Keep response adapters temporarily so frozen UI display contracts do not force database-shaped DTOs. Then migrate commands with explicit loading/error/conflict UI. Do not enable a mixed mock/API mutation path for a financial or workflow aggregate. TanStack Query owns server cache; Zustand retains UI/session presentation state, not authoritative academic or financial records.
