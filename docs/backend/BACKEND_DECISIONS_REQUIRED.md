# MUC PRO SUITE — Architecture Decision Register

**Status key:** FACT = verified repository state; DOMAIN RULE = authoritative college rule; RECOMMENDATION = architecture lock; DECISION REQUIRED = cannot be invented from the repository/rules.

| Decision | Current state | Recommendation | Why | Blocker? | User confirmation required? |
| --- | --- | --- | --- | --- | --- |
| 1. Authentication strategy | FACT: no backend auth; web uses local state; mobile has token-shaped mock shell | Short JWT access + rotating opaque refresh family; web HTTP-only cookie and mobile SecureStore | Fits Fastify, browser and Expo without client-controlled roles | Yes, deployment origin/cookie settings | Yes for final deployment topology; otherwise recommendation is locked |
| 2. Password hashing | FACT: none | Argon2id | Current security best practice and maintainable Node implementation | No | No |
| 3. Domain Admin assignment | FACT: mock optional `domain` string only | User may hold multiple active explicit `domain_assignment` rows, optional supported scope/effective dates | Required to prevent inherited Master access and supports revocation/audit | No | No |
| 4. Payment gateway/webhook | DOMAIN RULE: UPI, gateway and offline cash allowed; bank workflow unspecified | Provider adapter, verified signed webhook, immutable event, idempotent payment/allocation/receipt transaction | Provider signature, reconciliation and operational flow cannot be guessed | Yes for online payments | **Yes: choose gateway/provider and settlement/refund operations** |
| 5. Library→Finance fine integration | DOMAIN RULE: Library creates obligation; Finance collects; late fine ₹100 | `LIBRARY_FINE`/loss/damage financial charge with source FK; no library payment table | Preserves boundary and real account context | No | No |
| 6. Timetable rooms | FACT: mock `roomId` optional; no room source; domain rules do not require rooms | Keep room optional; add room master/conflict enforcement only if scheduling policy requires it | Do not invent compulsory room architecture | No for initial optional field | **Yes** before mandatory room booking/room conflict scope |
| 7. Placement offer rejection/reapplication | DOMAIN RULE: selected+rejected offer history remains; future-drive restriction is configurable | Preserve application SELECTED and offer REJECTED; make reapplication rule a versioned policy | Exact rule (block selected? rejected offer? accept override?) is absent | Yes for application enforcement | **Yes** |
| 8. Certificate approval workflow | DOMAIN RULE: Certificate Admin exclusively approves; Master oversight; duplicate guard; corrections/revocations persist | Request→review→approve/reject→issue; document replacement chain; no auto event approval | Explicit rule | No | No |
| 9. Certificate fee payment gate | DOMAIN RULE: fees configurable and finance-integrated | Create Finance charge; decide whether each type requires successful payment before issue | Rule does not state approval/issue gate | Yes for paid issuance | **Yes** |
| 10. File storage | FACT: only mock URLs; no provider | Storage port + PostgreSQL metadata + private object storage/signed access | Provider, scanning, retention and backup posture unknown | Yes for PDFs/resumes/uploads | **Yes** |
| 11. Background jobs/queue | FACT: no worker/queue | PostgreSQL transactional outbox and scheduled worker first; no queue yet | Concrete reliable delivery/retry need exists, but queue scale is not evidenced | Yes for scheduled/outbound work hosting | **Yes: choose worker/scheduler deployment** |
| 12. Email/SMS/push | FACT: no provider/configuration | In-app first; provider adapters later | Consent, templates, cost/provider and sender identity absent | Yes for external delivery | **Yes** |
| 13. PostgreSQL schema organization | FACT: no schema | One database / `public`; logical Prisma/domain modules; reviewed migrations | Simplest integrity/migration model for current single college ERP | No | No |
| 14. Academic calendar exact dates | DOMAIN RULE: months only; explicit instruction not to invent dates | Store dates administratively; seed no fabricated exact dates | Needed for working day, due/semester operations | Yes for calendar-dependent automation | **Yes** |
| 15. Attendance correction approval and LATE weighting | DOMAIN RULE: faculty can correct; administration controls/oversees; exact workflow unspecified | Append correction request/revision/audit; calculate from locked data | Cannot assume approval actor/state or LATE credit | Yes for correction implementation | **Yes** |
| 16. Results grading/pass policy | FACT: mock assumes TN-style scale/40% pass; not a domain rule | Configurable approved grading/passing policy version, applied/snapshotted per assessment | Do not convert mock assumption into official result policy | Yes for result calculation/publish | **Yes: COE confirmation** |
| 17. Finance waivers/refunds/overpayment | DOMAIN RULE: scholarship/concession/late fee supported; refund specifics absent | Immutable credit/waiver/reversal postings; hard block unallocated overpayment pending explicit policy | High-integrity financial process cannot be invented | Yes for exception handling | **Yes** |
| 18. Faculty library penalties | DOMAIN RULE: faculty borrows unlimited; finance collects required penalties, but financial account model names student fees | Support a person/member finance receivable or confirm faculty recovery process | Existing student-account-only mock cannot represent all faculty penalties | Yes for faculty loss/damage collection | **Yes** |
| 19. Event fee scope/refund/reschedule policy | FACT: mocks expose events/fees; no rule for fee conditions/refunds | Charge only against confirmed eligible registration; use finance reversal for authorized refund | Avoid attendance-generated “fine” and silent losses | Yes for paid event operations | **Yes** |
| 20. Retention/privacy/backup targets | FACT: no policy | Define retention, access review, encryption/scan, RPO/RTO and restore test cadence | PII, financial records, resumes/certificates and audit logs require operations policy | Yes for production | **Yes** |

## Decision outcomes already locked by authoritative rules

- Exactly two shifts and exactly H1–H5 periods; Shift I is Aided and Shift II is Self-Financing, with the stated program mapping.
- UG is 3 years/6 semesters; PG is 2 years/4 semesters; no arbitrary A/B/C sections.
- Attendance: ≥75% regular, 65–74.9% condonation, <65% redo; attendance defines a fine and Finance collects it.
- Library students have maximum two active books, faculty no fixed limit, manual due date, max two renewals, ₹100 late fine, Finance collection boundary.
- Placement only for registered final-year students; permanent selection/offer response history; no finance or clearance tie.
- Certificate types dynamic; Certificate Admin exclusive approval; no automatic duplicate requests; no mandatory clearance; no public QR verification.
- Hostel/transport excluded; assignments belong Faculty App→Student App and no Master Admin assignment module.
