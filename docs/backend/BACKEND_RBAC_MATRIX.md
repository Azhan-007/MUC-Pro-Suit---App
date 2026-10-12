# MUC PRO SUITE — RBAC and Authorization Lock

**Enforcement point:** Fastify authentication establishes actor identity; a route-level permission guard verifies coarse permission; domain service policy verifies ownership, domain assignment, institutional scope, record state and field-level constraints. UI menus are cosmetic and never authorization.

## Role boundary matrix

| Role | Permitted scope | Explicit boundary |
| --- | --- | --- |
| `SUPER_ADMIN` | Platform configuration, user/access infrastructure, RBAC, monitoring, audit/security, backups/recovery, platform analytics and system communications | Not a day-to-day academic/finance/library/placement operator. No automatic Master Admin role. |
| `MASTER_ADMIN` | Whole college operational oversight across named institutional domains; assigns operational/domain admins | Does not receive platform-security authority merely by being Master Admin. No Master Admin assignment module. |
| `DOMAIN_ADMIN` | Only explicitly assigned domain(s), optional approved organizational scope | Never inherits all Master Admin permissions or unrelated domain permissions. |
| `FACULTY` | Self and assigned teaching/class work: assigned attendance/marks, their approved academic materials/assignments in future scope | Cannot administer institutional master data, finance, placement companies/drives, or cross-class PII without explicit role/assignment. |
| `STUDENT` | Self-only profile-limited data, own academic results/attendance/fees/library/placement/certificate/event interactions | Cannot read peer data, alter institutional facts, or approve any workflow. |

## Domain Admin assignment model

`DOMAIN_ADMIN` is a role assignment plus one or more active `domain_assignment` records. A record contains domain (`ATTENDANCE`, `FINANCE`, `LIBRARY`, `PLACEMENT`, `CERTIFICATES`, `EVENTS`, etc.), optional approved organizational restriction (e.g. department/program if the domain supports it), effective dates, assigner and status. A single user may hold multiple domains. This model replaces the current mock `AdminAssignment.domain?: string` shortcut and supports audit/revocation without role cloning.

## Permission family matrix

| Domain/resource actions | Super | Master | Assigned Domain Admin | Faculty | Student |
| --- | --- | --- | --- | --- | --- |
| Users, roles, permissions, backups, platform audit | manage | no default | no | no | no |
| Departments/programs/curriculum/terms/classes | view (support only) | manage | only explicit academic scope | assigned-view | self-context view |
| Student/faculty authoritative identity | support-limited | manage | scoped manage where delegated | assigned/student-limited view | self limited edit |
| Timetable/teaching assignments | view (support only) | manage | scoped manage | assigned view | own class view |
| Attendance | audit/support only | manage/override | attendance scope manage | assigned mark/request correction | own view |
| Examinations/results | audit/support only | oversight/manage per COE delegation | exam/COE scope manage | assigned entry | own published view |
| Finance/payment/receipt | audit/support only | manage | finance scope manage | no | own read/initiate allowed payment only |
| Library | audit/support only | manage | library scope manage | own member view | own member view |
| Placement | audit/support only | oversight | placement scope manage | no default | self profile/register/apply/read |
| Certificates | audit/support only | oversight | certificate scope approve/issue/revoke | self request/read | self request/read |
| Events | audit/support only | manage | event scope manage | assigned/event actions only | register/self view |
| Notifications | system communications | institutional publish | assigned domain publish | assigned notices only | own delivery/read |
| Reports | platform only | institutional reports | domain-scoped reports | own/class-scoped | self only |

“Manage” still requires state-specific policy. For example, only Certificate Admin permission can approve a certificate; only COE permission can approve/publish results; Exam Cell operational permission does not grant COE result authority.

## Authorization implementation rules

- Permissions use stable codes such as `attendance.session.mark`, `finance.payment.collect`, `certificate.request.approve`, and `placement.drive.manage`; do not depend on display labels.
- Scope checks occur inside services using FK-linked domain/context records, never a client-provided department ID alone.
- Owner/self checks are resolved from user→student/faculty linkage server-side.
- Every denied sensitive action is security-audited at an appropriate level without logging password/token/document contents.
- Elevated/domain assignments are effective-dated and revocable. Tokens/sessions must re-check status/authorization at refresh and sensitive command time.
