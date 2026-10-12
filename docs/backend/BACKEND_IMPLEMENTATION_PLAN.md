# MUC PRO SUITE — Recommended Backend Implementation Order

**Classification:** phased plan; do not start a phase whose stated decisions are unresolved.

1. **Foundation and deployment design — BLOCKED by environment decisions**
   - Confirm PostgreSQL provisioning, database credentials/secret manager, API origins/TLS, college timezone, migration deployment, logging and worker hosting.
   - Add typed configuration, Fastify composition, error/request IDs, health/readiness boundaries, test harness and CI checks.

2. **Database package and migrations — BLOCKED until Phase 1 environment**
   - Build the Prisma datasource/generator/client lifecycle; implement migration baseline and seed only approved static masters (shifts H1–H5 and approved program mapping).
   - Establish UUID/timestamp/audit/outbox/idempotency conventions before business tables.

3. **Authentication, sessions, RBAC — NEEDS provider/deployment decisions**
   - Implement user/session/password-reset models, Argon2id, token rotation/revocation, permission/domain assignment policy and server enforcement.
   - Migrate authentication clients before trusting browser/mobile roles.

4. **Academic master data and people — NEEDS DESIGN**
   - Academic years/terms, programs/curricula/subjects, faculty/student identities, enrollments, teaching/advisory assignments, shifts/periods and classes.
   - Enforce no default sections; confirm exact calendar-date administration.

5. **Timetable, attendance, examinations/results — NEEDS outstanding academic decisions**
   - Versioned timetable, attendance workflow/history, assessment/result workflow, COE/Exam Cell permissions and reporting read paths.
   - Before results: confirm grading/pass/withheld and attendance-correction policies.

6. **Finance — NEEDS gateway decision**
   - Versioned fees, charges/credits/waivers, account ledger, offline collection, payment intent/gateway adapter/webhooks, allocation, receipt and reconciliation.
   - Integrate attendance and library/certificate/event obligations by typed source charge only.

7. **Library — NEEDS DESIGN**
   - Catalog/copies/member/loan/renewal/reservation/resolution/clearance and Finance charge integration; enforce concurrent issue constraints.

8. **Placement — NEEDS reapplication-policy decision**
   - Registration/profile/file handling, company/drive/role/eligibility, rounds/application history/offers, notifications and analytics.

9. **Events and certificates — NEEDS fee-gate policy**
   - Event workflow/registration/capacity/history then Certificate Admin workflow/PDF storage/reissue/revocation. Never auto-approve certificates from event attendance.

10. **Notifications, files and reports — NEEDS provider/operations decisions**
    - Transactional outbox/worker, in-app delivery, storage adapter/scan and initial protected reporting services.

11. **Frontend integration — after each stable domain contract**
    - Replace mock reads with HTTP repository adapters first, then commands; remove client authority/calculations after server acceptance; update mobile self and assigned-work flows.
    - Do not convert all modules at once or mix mock/API writes in finance/workflows.

12. **Hardening and production readiness**
    - Integration/concurrency/security tests, migration rehearsal, backup restore test, load/profile checks, provider reconciliation, access review, observability/alerting and recovery runbooks.

## Required test categories

- Domain transition tests for every legal/illegal state change.
- Prisma/PostgreSQL integration tests for FK/unique/check/transaction behavior.
- Race tests: duplicate payment/webhook, overpayment, concurrent library issue/limit, attendance submit/correction, result publish, event capacity, certificate issuance and placement status updates.
- Authorization tests for self, assigned Faculty, Domain Admin scope, Master Admin and Super Admin boundaries.
- Migration compatibility tests for each frozen UI adapter and API response.

## Out-of-scope until a future requirement

Hostel, transport, public certificate verification/QR, a Master Admin assignment module, generic faculty workload limits, and production persistence for mobile leave/HR/payroll/substitution/study-material/assignment features. The only assignment ownership rule currently locked is Faculty App authorship → Student App use; persistence/workflow/file requirements must be specified separately.
