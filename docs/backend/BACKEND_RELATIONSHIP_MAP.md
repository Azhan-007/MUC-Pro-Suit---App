# MUC PRO SUITE — Relationship and Academic-History Map

**Status:** target relational map. All arrows are foreign-key relationships; named bridge entities are mandatory N:M junctions.

## Core map

```text
Department 1 ──< Program 1 ──< CurriculumVersion 1 ──< ProgramSubject
                                   │
AcademicYear 1 ──< AcademicTerm    └──< AcademicClass >── 1 Program
                                         │
Student 1 ──< StudentEnrollment >──┘     │
                                         └──< TeachingAssignment >── Faculty

AcademicTerm + AcademicClass + ProgramSubject
       ├──< TimetableVersion ──< TimetableSlot >── optional Room
       ├──< AttendanceSession ──< AttendanceEntry >── StudentEnrollment
       └──< Assessment ──< ResultEntry >── StudentEnrollment
```

## Identity and authorization

```text
User 0..1 ── Student
User 0..1 ── Faculty
User 1 ──< UserRoleAssignment >── 1 Role ──< RolePermission >── 1 Permission
User 1 ──< DomainAssignment (DOMAIN_ADMIN only; 1..N domains/scopes)
User 1 ──< AuditLog / OutboxEvent / IdempotencyKey
```

A person can hold multiple role assignments only through explicit records. `DOMAIN_ADMIN` has one or more `DomainAssignment` rows and receives no implicit access outside those rows. `MASTER_ADMIN` is institutional scope through role permission, not a copied collection of domain assignments.

## Academic history requirements

| Historic domain | Required context | Why mutable student state is insufficient |
| --- | --- | --- |
| Attendance | `attendance_session` → academic term, class, program subject, teaching assignment; `attendance_entry` → student enrollment | A student can progress, change course/status, or be moved; previous period attendance must stay in its original class/term/subject. |
| Results | assessment → term/class/program subject; result entry → enrollment; result revision/publication | Current semester/course cannot determine the attempted exam after promotion or correction. |
| Fees | financial account → enrollment; charges → structure version/source; payment allocation → charge | Fee applicability differs by course/shift/category/semester and must survive later reclassification or fee-structure edits. |
| Examination | assessment holds scheduled shift/class/term/subject and optional room; result uses enrollment | A current class is not evidence of the examination cohort or timetable at the time. |
| Timetable | published timetable version → term/class/teaching assignment/period; archive old versions | A current assignment must not change a past class schedule or attendance attribution. |
| Placement | application stores student, drive, eligibility evaluation/snapshot and final-year enrollment at application time | Eligibility must be explainable even after grade/profile/current-semester changes. |

## Finance, library, certificate and events

```text
FeeStructure 1 ──< Components / InstallmentRules
StudentEnrollment 1 ── 1 FinancialAccount ──< FinancialCharge
FinancialAccount 1 ──< ScholarshipConcession / FinancialAdjustment
PaymentIntent ──< PaymentAttempt ── 0..1 Payment ──< PaymentAllocation >── FinancialCharge
Payment 1 ── 1 Receipt

LibraryMember 1 ──< LibraryLoan >── BookCopy >── BookCatalog
LibraryMember 1 ──< LibraryReservation >── BookCatalog
LibraryLoan 1 ──< LoanRenewal / LibraryResolution ── 0..1 FinancialCharge

CertificateType 1 ──< CertificateRequest ── 0..1 FinancialCharge
CertificateRequest 1 ──< CertificateDocument 1 ──< CertificateHistory

Event 1 ──< EventRegistration / EventAttendance / EventHistory
Event 1 ──< EventTargetDepartment | EventTargetProgram | EventTargetClass | EventTargetUser
EventRegistration 0..1 ── FinancialCharge (when charge applies)
```

`FinancialCharge.source_type/source_id` links a library resolution, attendance condonation, certificate request, event registration, or late payment rule to one—and only one where applicable—finance obligation. The source module creates the obligation in a transaction or through a trusted domain command; Finance alone records collection/payment.

## Placement map

```text
Company 1 ──< PlacementDrive 1 ──< DriveJobRole
PlacementDrive 1 ──< DriveRound
PlacementDrive >──< Program          (DriveCourseEligibility)
PlacementDrive >──< Department       (DriveDepartmentEligibility)
Student 1 ── 0..1 PlacementRegistration / PlacementProfile
Student 1 ──< PlacementApplication >── 1 PlacementDrive
PlacementApplication 1 ──< ApplicationStatusHistory
PlacementApplication 1 ──< RoundResult >── 1 DriveRound
PlacementApplication 0..1 ──< PlacementOffer >── 1 DriveJobRole
```

`PlacementApplication` has a unique student/drive constraint under the current rule. If product later needs a student to apply separately to different roles in one drive, that is a **decision-required change** to student+drive+role uniqueness rather than an unreviewed UI change.

## Index and junction audit

Required bridges: role permissions, user roles, domain assignments, program subjects/curriculum, student enrollments, teaching assignments, drive course eligibility, drive department eligibility, event targets, payment allocations, and notification targets. Do not persist ID arrays such as current mock `facultyIds`, `targetIds`, `allowedCourseIds`, or `allowedDepartmentIds` as the relational source of truth.

Required important unique indexes include: user identifiers; academic year code; term/year ordinal; program code; active class per year/program/study-year; enrollment per student/term; attendance session/context and entry/session+enrollment; result/assessment+enrollment; barcode; active loan/copy; active reservation/member+catalog; payment provider reference; webhook event ID; receipt number; active certificate duplicate guard; placement application/student+drive; drive round sequence; round result/application+round; event registration/event+participant; and notification delivery/notification+recipient+channel.

## Prohibited relationship shortcuts

- Do not use a course ID’s text to determine degree/final year; use program and enrollment fields.
- Do not keep a student’s `currentSemester`/`sectionId` as the only FK from finance, results, or attendance.
- Do not join library member to an untyped string without a user/person relationship.
- Do not use polymorphic raw IDs without either a constrained source pair or a dedicated junction table where FK integrity is required.
- Do not create default A/B/C sections; normal classes are course/year cohorts. A future, explicitly approved exceptional grouping design requires its own documented rule.
