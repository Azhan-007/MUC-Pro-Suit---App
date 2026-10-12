# MUC PRO SUITE — Backend Workflow and State-Machine Lock

**Rule:** an enum is a storage value, not permission to update a status. Each command loads the current aggregate, authorizes the actor, validates the transition and required data, writes facts/history/audit together, and returns the new version.

## Attendance — NEEDS DECISION for correction approval detail

```text
OPEN → MARKED → SAVED → SUBMITTED → LOCKED
                               │              │
                               └──────────────┴→ CORRECTION_REQUESTED → CORRECTED → LOCKED
```

| Transition | Authorized actor | Required transaction/audit | Illegal cases |
| --- | --- | --- | --- |
| Open/create session | Assigned faculty; Attendance Admin/Master Admin by scope | Session/context + audit | Non-working day or a non-H1–H5 period; actor not assigned to subject/class/term |
| Mark/save | Assigned faculty before submission | Upsert entries only within current session revision | Duplicate student entry; enrollment not in class; locked session |
| Submit | Assigned faculty | Validate complete roster policy, mark submitted/time/actor, audit | Empty/invalid session or already locked |
| Lock | Attendance Admin or authorized Master Admin | Lock state and audit | Not submitted unless exceptional authorized command/reason |
| Request/correct/relock | Faculty may request; Attendance Admin controls approval/correction | Append correction/change set, reason, actor/approver, old/new values, re-lock | Direct update of locked row; correction with no reason |

The domain rules deliberately do not prescribe who approves a faculty correction or whether faculty can directly correct before/after locking. Implement no approval path until that policy is decided. Percentage and condonation/redo status are recalculated from locked/corrected facts. The treatment of `LATE` for percentage is also decision-required.

## Finance — READY for core model; gateway details need decision

```text
Charge: DRAFT → POSTED → SETTLED | PARTIALLY_SETTLED | WAIVED | VOIDED/REVERSED
Payment intent: CREATED → PENDING → SUCCESS | FAILED | EXPIRED | CANCELLED
Payment: SUCCESS → REFUNDED/REVERSED only through a compensating financial posting
Account display: UNPAID → PARTIALLY_PAID → PAID (or OVERDUE while open after due date)
```

- Finance Admin/Master Admin posts approved charges, concessions and waivers; Fee Counter/Master Admin records permitted offline payments; gateway webhook service confirms online payment after signature verification.
- A successful payment creates payment, allocation(s), receipt and audit atomically. Failed/pending attempts do not mutate account balances.
- A posted charge/payment/receipt is immutable. Correction is reversal/credit plus a new posting, never amount editing or deletion.
- Illegal: payment allocation beyond open charge; successful payment replay; payment above the requested/allocation capacity; receipt reuse; directly setting account to PAID.
- The database transaction must serialize competing allocations for the affected financial account/charges. Provider and client idempotency keys are mandatory.

## Library — READY

```text
Copy: AVAILABLE → ISSUED → AVAILABLE
                     ├→ LOST
                     └→ DAMAGED
Loan: ACTIVE → RETURNED | LOST | DAMAGED
Reservation: ACTIVE → FULFILLED | CANCELLED | EXPIRED
```

| Command | Authority | Rules |
| --- | --- | --- |
| Issue | Library Admin (future) / Master Admin | Copy must be AVAILABLE; student must have fewer than two active loans; due date is manually entered; create loan and set copy ISSUED atomically. Faculty has no fixed limit. |
| Renew | Library Admin / Master Admin | ACTIVE loan only; at most two renewal histories; manually enter new due date. |
| Return/accept | Library Admin / Master Admin | ACTIVE loan only; physical acceptance actor/time required; close loan/set AVAILABLE; if late create exactly one ₹100 `LIBRARY_FINE` finance charge in same transaction. |
| Lost/damaged resolve | Library Admin / Master Admin | Mark loan/copy; record resolution. Paid-price/replacement/damage penalty must be approved and, when money is due, creates a Finance charge; Library does not collect payment. |

Reservations are catalog-level and fulfillment respects oldest active reservation. Manual copying of `activeLoansCount` or `hasUnresolvedFines` is forbidden; both are read models. Student clearance must evaluate loans/resolutions/finance obligations. Faculty clearance is required only when the faculty member used the library and has pending obligations.

## Placement — NEEDS DECISION for reapplication policy value

```text
Registration: NOT_REGISTERED → REGISTERED → WITHDRAWN
Application: APPLIED → SHORTLISTED → APTITUDE → TECHNICAL_INTERVIEW → HR_INTERVIEW → SELECTED | REJECTED
Offer: PENDING → ACCEPTED | REJECTED → JOINED (when accepted and joining is recorded)
```

- Placement Admin manages company, drives, rounds, eligibility and final status; Master Admin has oversight. Students self-register, maintain their own placement profile, and apply only after final-year/eligibility validation.
- `SELECTED` is a historical result. Rejection of its offer changes **offer** state to `REJECTED`; it does not erase/downgrade `SELECTED` application history.
- Each transition records `application_status_history`; each round result is separately immutable/audited. Final Selected/Rejected is an explicit authorized admin command, not inferred from passed rounds.
- Illegal: faculty/non-final-year student placement registration/application; duplicate application; application when drive is not open; status jump skipping required record; changing final result without history; finance charge in placement.
- Whether selected or offer-rejecting students may apply to subsequent drives is a configured policy but the exact rule is not supplied. Block its implementation decision until confirmed.

## Events — READY, except fee eligibility policy

```text
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → COMPLETED
  └────────────────────────────────────────────────────→ CANCELLED
APPROVED/PUBLISHED → RESCHEDULED → APPROVED or PUBLISHED (reapproval policy must be explicit)
```

- Event owner creates draft; authorized Event Admin/Domain Admin submits; authorized approver/Master Admin approves; authorized publisher publishes; authorized event staff marks attendance/completion. Every state change creates `event_history`.
- Registration is allowed only for PUBLISHED, registration-required, in-deadline events and must atomically enforce target eligibility, one registration per participant, and capacity.
- Illegal: publish before required approval, complete cancelled/draft event, register outside target/deadline/capacity, arbitrary edit of completed/cancelled event, direct capacity counter update.
- Event fees are finance charges tied to a registration, not `Fine` records generated on attendance. Event attendance may create a certificate-work item only; it must not auto-approve/issue a certificate because Certificate Admin owns approval.

## Certificates — READY except payment-gate decision

```text
REQUESTED → UNDER_REVIEW → APPROVED → ISSUED
REQUESTED/UNDER_REVIEW → REJECTED
ISSUED → REVOKED
ISSUED → SUPERSEDED (correction/reissue) → new ISSUED document
```

- Student/faculty may request; an admin may originate on their behalf. Certificate Admin exclusively reviews, approves/rejects, issues, revokes and reissues; Master Admin observes/oversees according to permission.
- An active duplicate guard prevents repeat same-type requests by the same requester. Reissue/correction is an authorized replacement flow, not an evasion of duplicate protection.
- If a type requires a fee, approval creates/references a finance charge. Whether issue is permitted only after payment is **not specified** and must be decided per type/policy. There is no hard-coded library/finance/no-dues clearance dependency.
- Issuance captures an immutable rendered data snapshot and file metadata. Revocation and correction preserve every original document/history.

## Results and assessment — NEEDS DECISION for canonical grading rules

```text
Entry → VALIDATION → SUBMITTED → APPROVED → PUBLISHED
                                     │
                                     └→ CORRECTION_REQUESTED → CORRECTED → APPROVED → PUBLISHED
```

- Faculty/authorized examiner enters marks only for assigned assessment scope. COE validates, submits/approves/publishes according to assigned permissions. Exam Cell has operational scheduling/facility permissions only; it is not COE.
- Validation requires an assessment/enrollment/subject match, allowed mark range, completeness/exception reason, controlled ABSENT/WITHHELD handling and optimistic version check.
- Publishing a result batch and audit/history is atomic. Published entries are corrected through revision with reason/actor/approver and republishing policy; no direct overwrite.
- Current mock code assumes an unapproved grade scale and 40% UG pass mark. It is not a locked college rule and must not become backend law until COE confirms it.

## Notifications — READY for in-app state; delivery provider needs decision

```text
DRAFT → SCHEDULED → PUBLISHED → EXPIRED
DRAFT/SCHEDULED → CANCELLED
Delivery: PENDING → DELIVERED → READ | FAILED
```

Creation, target resolution, notification state/history and outbox events commit together. Delivery attempts occur after commit. A notification that is published cannot have audience/content silently rewritten; cancel/replace and audit it. `read` is a recipient-scoped update only.

## Common workflow controls

- Required audit: actor, authorization context, request/correlation ID, prior/new state, reason, affected entity IDs, timestamp, outcome.
- Required concurrency control: aggregate `version` for administrative edits; row locks/serializable transactions for stock, capacity, monetary allocation and single-use state transitions.
- Required idempotency: payment initiation/webhooks, issue/return where scanner/retry clients are possible, attendance submission, certificate issuance, event registration, notification publication and result publication.
