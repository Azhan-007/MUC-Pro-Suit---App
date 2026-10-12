# MUC PRO SUITE — Reporting Architecture

**Classification:** NEEDS DESIGN — report contracts follow the authoritative model; no report table is a source of truth.

## Reporting method

Start with permission-scoped, indexed PostgreSQL queries from reporting services. Use select projections/read DTOs and cursor/bounded pagination. Add ordinary database views for stable, repeated joins only after their query contract is stable. Add materialized views only after measurement demonstrates that indexed queries cannot meet the required response window; refresh strategy and freshness label must accompany each materialized view.

Do not persist dashboard totals copied from the frontend. Cache/rebuildable read models may be added later, with source data and refresh/failure monitoring defined.

| Report | Authoritative inputs | First implementation | Scope/control |
| --- | --- | --- | --- |
| Student dossier | student, enrollments, locked attendance, published results, financial charges/payments, library loans | Normal composed query/service | Student self; authorized academic/admin scope |
| Attendance shortage/condonation | locked attendance sessions/entries, enrollment, approved fine charges | Indexed aggregate by term/class/student | Attendance/Master scope; expose self summary only to student |
| Fee defaulters / account statement | accounts, posted charges, credits, successful payment allocations, due dates | Indexed ledger/account query | Finance/Master scope; student self statement |
| Finance collection/reconciliation | payments, receipts, allocations, provider attempts/webhooks | Normal query plus export; reconciliation exception query | Finance/Master, sensitive export audit |
| Library assets/history/clearance | catalog/copy/loan/reservation/resolution/finance-origin charge | Indexed list/aggregate | Library/Master, member self history |
| Placement analytics | registrations, drives, applications/history/offers, program/enrollment snapshot | Aggregate query grouped by permitted dimensions | Placement/Master only; no resume/PII in aggregate export |
| Event participation | event, registrations, attendance, targets | Normal query/aggregate | Event/Master scope |
| Certificate records | request/document/history/file metadata | Indexed lifecycle query | Certificate/Master scope; requester self records |
| Audit/security report | append-only audit log, session/outbox errors | Dedicated protected query; retention-aware | Super Admin/security scope only |

Exports must execute from the same authorized filter scope as the interactive report, record an audit event, and avoid unrestricted raw CSV of PII. Large exports should be asynchronous only when a concrete measured size/time requirement appears; generated files use the storage architecture and restricted expiration.

The current command-center service is a mock-derived view model and can inform future response shape, but its fallback percentages, static dates and browser-side aggregates are not authoritative reporting logic.
