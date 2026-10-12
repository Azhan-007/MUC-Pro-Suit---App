# MUC PRO SUITE — Transaction and Integrity Matrix

| Command | Atomic operations | Rollback / integrity | Concurrency and idempotency |
| --- | --- | --- | --- |
| Create academic enrollment | Validate active program/term/class; insert enrollment; audit | No enrollment if class/program/term invalid or duplicate | Unique student+term; optimistic class capacity only if a future policy adds it |
| Publish timetable version | Validate H1–H5, class/term/assignment and optional room; activate version/slots; archive predecessor; audit | Entire version remains unpublished on any conflict | Serialize activation for same class/term; detect faculty/room overlap before commit |
| Submit/lock attendance | Validate assigned actor/roster; write entries/session state; audit | No partial roster state after submit/lock | Unique session/context + entry/session/enrollment; idempotency key; optimistic version for correction |
| Attendance correction | Validate permitted state/reason/approver; append correction and entry revision; rederive shortage; audit/outbox if threshold changed | Original fact/history persists; reject invalid revision | Lock session/entry or use version check; correction command idempotent |
| Record payment | Validate client key and account/charge balances; create intent/attempt or offline payment; on success create payment, allocations, receipt, audit and outbox | Any allocation/receipt failure rolls back successful recording; reconciliation keeps provider event | Lock account/open charges or serializable transaction; unique provider reference/receipt/client key |
| Process gateway webhook | Verify signature and canonical payload; record webhook; transition attempt; invoke successful-payment transaction; audit | Invalid/replayed/unmatched event cannot mutate finance | Unique provider event ID and payment reference; handler safe to replay |
| Grant concession/waiver | Approve; post immutable credit/adjustment against account/charge; audit | No balance mutation without approved posting | Lock target account/charge; idempotency per source decision |
| Issue library copy | Lock copy and active loans for member; validate availability, reservation order, student two-loan cap; create loan; update copy; audit | Loan and copy status cannot diverge | `SELECT … FOR UPDATE`/appropriate isolation; unique active loan per copy; idempotency key |
| Return library copy | Lock loan/copy; close loan; set copy available; create late finance charge when due date passed; audit/outbox | Any charge failure rolls back return state or enters an explicit recoverable exception—not a silent partial return | One active loan; unique source-origin charge; retry-safe return command |
| Resolve loss/damage | Lock loan/copy; record assessment/resolution; create Finance charge if required; audit | No copy/loan/status mismatch | Aggregate version plus unique resolution finance source |
| Register for event | Lock event/registration set; validate state/target/deadline/duplicate/capacity; insert registration; create charge if applicable; audit | Registration and fee obligation either both exist or neither does | Unique event+participant; row lock/serializable capacity check; idempotency key |
| Complete event | Transition state; persist attendance/history; create certificate work requests if configured; audit/outbox | No automatic certificate approval or payment collection | Lock event; unique attendance/event+participant; repeat-safe completion |
| Apply to placement drive | Validate final-year enrollment, registration, profile, drive policy/eligibility; snapshot decision; create application/history; audit | No partial application without eligibility evidence | Unique student+drive; lock relevant policy/application state; idempotency key |
| Record placement round/final result/offer response | Validate current state and round sequence; insert result/history; create or update offer status; audit/outbox | Selection history cannot be overwritten; rejected offer retains selected application | Optimistic application version; unique application+round and at-most-one active offer relation |
| Approve/issue certificate | Validate Certificate Admin permission, active duplicate/payment policy; update request; create immutable document/file link/history; audit/outbox | Request/document/history must agree; PDF failure rolls back issuance or stays explicit pending-render state | Unique issuance command/request; version check; idempotency key |
| Revoke/reissue certificate | Validate authority/reason; supersede/revoke old document; create new document/history; audit | Historic document remains accessible only by policy | Lock original document; unique replacement chain; repeat-safe command |
| Validate/publish results | Validate all entries/revisions; set assessment/publication state; append publication/audit/outbox | No mixed published batch; no in-place historical edit | Lock assessment/batch; optimistic entry versions; idempotency key |
| Publish notification | Validate audience/target/state; resolve recipients; write notification/history/deliveries/outbox | No partially persisted audience/delivery set | Unique delivery identity; idempotency key; workers retry only outbound delivery |

## Required reconciliation jobs

- Match successful gateway transactions/webhook events to payment records and identify unmatched/duplicate/refund events.
- Check financial charge/payment allocation sums against immutable postings and receipt sequence integrity.
- Detect library copies marked ISSUED without active loan and active loans whose copy is not ISSUED.
- Detect published results without complete publication history and certificates without valid immutable document metadata.
- Detect stuck outbox events/delivery failures. These jobs report exceptions; they do not silently rewrite facts.
