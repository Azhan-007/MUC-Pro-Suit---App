# MUC Pro Suite — College Domain Rules

## 1. College Working Structure

### Working Days

The college operates:

* Monday
* Tuesday
* Wednesday
* Thursday
* Friday

Saturday and Sunday are not regular instructional working days unless a future explicit requirement introduces them.

---

# 2. Shifts

The college has exactly two academic shifts.

## Shift I

**Time:** 8:00 AM – 12:55 PM

Shift I contains:

### UG — Aided Programs

1. B.A. Corporate Economics
2. B.Sc. Mathematics
3. B.Sc. Computer Science
4. B.Com. Corporate Secretaryship
5. B.Com. General / Commerce

---

## Shift II

**Time:** 1:00 PM – 5:55 PM

Shift II contains:

### UG — Self-Financing Programs

1. B.A. English
2. B.B.A. — Bachelor of Business Administration
3. B.C.A. — Bachelor of Computer Applications
4. B.Com. Computer Applications
5. B.Sc. Microbiology — Exclusively for Girls
6. B.Sc. Data Science

### PG — Self-Financing Programs

1. M.Sc. Information Technology
2. M.Sc. Mathematics

---

# 3. Period Structure

IMPORTANT:

**Both Shift I and Shift II use exactly five academic periods: H1, H2, H3, H4 and H5.**

Do not create different period counts for the two shifts.

---

## Shift I Periods

| Period | Time                |
| ------ | ------------------- |
| H1     | 8:00 AM – 8:55 AM   |
| H2     | 8:55 AM – 9:50 AM   |
| Break  | 9:50 AM – 10:10 AM  |
| H3     | 10:10 AM – 11:05 AM |
| H4     | 11:05 AM – 12:00 PM |
| H5     | 12:00 PM – 12:55 PM |

Break duration:

**20 minutes**

---

## Shift II Periods

| Period | Time              |
| ------ | ----------------- |
| H1     | 1:00 PM – 1:55 PM |
| H2     | 1:55 PM – 2:50 PM |
| H3     | 2:50 PM – 3:45 PM |
| H4     | 3:45 PM – 4:40 PM |
| Break  | 4:40 PM – 5:00 PM |
| H5     | 5:00 PM – 5:55 PM |

Break duration:

**20 minutes**

---

# 4. Classes / Sections

The college uses a simple class structure.

A course does NOT automatically create multiple sections such as:

```text
I BCA - A
I BCA - B
I BCA - C
```

Do NOT assume A/B/C sections.

For each course, the normal academic class structure is:

```text
I [Course]
II [Course]
III [Course]
```

For example:

```text
B.C.A.
├── I BCA
├── II BCA
└── III BCA
```

Another example:

```text
B.Sc. Computer Science
├── I B.Sc. CS
├── II B.Sc. CS
└── III B.Sc. CS
```

This same year/class structure applies to the relevant UG courses.

### Shift applies to the class

A class belongs to its assigned course and therefore inherits the course's shift.

Do not create arbitrary shift assignments independently for individual classes unless explicitly required later.

---

# 5. UG Program Duration

UG programs:

**3 years**

Total:

**6 semesters**

Structure:

```text
Year 1
├── Semester 1
└── Semester 2

Year 2
├── Semester 3
└── Semester 4

Year 3
├── Semester 5
└── Semester 6
```

---

# 6. PG Program Duration

PG programs:

**2 years**

Total:

**4 semesters**

Structure:

```text
Year 1
├── Semester 1
└── Semester 2

Year 2
├── Semester 3
└── Semester 4
```

---

# 7. Academic Year

Current academic year:

**2026–27**

An academic year contains two semesters:

```text
Academic Year 2026–27
├── Odd Semester
└── Even Semester
```

## Odd Semester

Start:

**June**

End:

**November**

## Even Semester

Start:

**December**

End:

**May**

The exact dates are not currently specified.

Do NOT invent exact start/end dates.

---

# 8. Attendance

Attendance is based on academic periods.

Each instructional day contains:

**5 attendance periods**

Therefore:

```text
H1 = 1 attendance
H2 = 1 attendance
H3 = 1 attendance
H4 = 1 attendance
H5 = 1 attendance
```

Maximum attendance per full instructional day:

**5**

The system must support attendance for both:

* Shift I
* Shift II

Both shifts use:

```text
H1
H2
H3
H4
H5
```

---

# 9. Attendance Percentage

The system must calculate attendance percentage.

The system must also support the applicable attendance-status rules:

### 75% and above

Student is eligible without attendance fine/condonation.

### 65% – 74.9%

Student falls under condonation.

A fine may be applicable.

### Below 65%

Student must redo the semester according to the stated college rule.

Do not replace these thresholds with generic attendance policies.

---

# 10. Attendance Responsibility

### Faculty

Faculty members mark attendance for their assigned classes/subjects.

Faculty can later make attendance corrections.

### Attendance Administration

Attendance administration controls attendance corrections and attendance management.

Therefore:

```text
Faculty
   ↓
Marks Attendance
   ↓
Can request/make correction
   ↓
Attendance Administration controls/oversees
```

The exact approval workflow can be defined later.

Do not invent an approval workflow unless explicitly requested.

---

# 11. Attendance Fine

Attendance-related fines are handled through the attendance management process.

However:

**Attendance Management applies/defines the attendance fine.**

**Finance Management collects the money.**

Therefore the domain relationship is:

```text
Attendance Management
        ↓
Determines / applies attendance fine
        ↓
Finance Management
        ↓
Collects payment
```

Do not merge these responsibilities.

---

# 12. Faculty Rules

A faculty member MAY:

* Teach multiple subjects
* Teach multiple classes/sections
* Teach in Shift I
* Teach in Shift II
* Be a class advisor
* Be an HOD

A faculty member can therefore have multiple academic responsibilities simultaneously.

There is currently:

**No workload limit.**

Do not introduce a maximum workload restriction.

---

# 13. Faculty Workload

Faculty workload is calculated based on:

**Periods / Subjects**

Workload is therefore related to teaching assignments and academic periods.

Do not create a workload calculation based on arbitrary hours, salary, or generic ERP assumptions.

---

# 14. Fees

Fee structures are not globally identical.

Fees can vary according to:

* Course
* Shift
* Category
* Semester

Fees are collected:

**Semester-wise**

Not annually by default.

---

## Payment Methods

The college accepts:

* UPI
* Online payment gateway
* Offline payment / cash counter

The exact bank-payment workflow is currently unspecified.

**Do not invent bank integration details.**

---

## Installments

Installment payment may be supported when required.

It is not necessarily mandatory for every fee structure.

---

## Late Fee

Late-payment fine is supported.

---

## Scholarship / Concession

Scholarships and fee concessions are supported.

---

# 15. Examination Structure

The examination system includes:

## CIA

Two internal examinations:

* CIA I
* CIA II

## Semester End Examination

The college also conducts:

* Semester End Examination
* Practical examinations
* Project / Viva

---

# 16. Examination Responsibilities

There are two distinct responsibilities.

## COE — Controller of Examinations

COE controls:

* Examinations
* Results
* Paper valuation
* Examination-related academic control

## Exam Cell

Exam Cell manages the facilities and operational arrangements required for examinations.

Do NOT merge COE and Exam Cell into a single role.

---

# 17. Library

Library:

**YES**

Library is an active college service/module.

It should therefore be represented as a real operational domain in the ERP.

---

# 18. Hostel

Hostel:

**NO**

Do NOT build hostel functionality into the current college domain model.

Do not create hostel workflows, hostel rooms, hostel fees, hostel allocation, etc., unless the requirement changes explicitly.

---

# 19. Placement

Placement:

**YES**

Placement is an active college service/module.

---

# 20. Transport

Transport:

**NO**

Do NOT build transport management functionality into the current domain model.

---

# 21. Important Program/Shift Mapping

The following mapping is authoritative.

## Shift I — Aided

| Program                        | Type |
| ------------------------------ | ---- |
| B.A. Corporate Economics       | UG   |
| B.Sc. Mathematics              | UG   |
| B.Sc. Computer Science         | UG   |
| B.Com. Corporate Secretaryship | UG   |
| B.Com. General / Commerce      | UG   |

## Shift II — Self-Financing

| Program                      | Type            |
| ---------------------------- | --------------- |
| B.A. English                 | UG              |
| B.B.A.                       | UG              |
| B.C.A.                       | UG              |
| B.Com. Computer Applications | UG              |
| B.Sc. Microbiology           | UG — Girls Only |
| B.Sc. Data Science           | UG              |
| M.Sc. Information Technology | PG              |
| M.Sc. Mathematics            | PG              |

---

# 22. Important Domain Boundaries

The application has three administrative levels.

## Super Admin

Super Admin controls the **platform itself**.

Responsibilities include:

* Platform administration
* Technical/system administration
* User and access infrastructure
* RBAC
* Global configuration
* System monitoring
* Audit/security
* Platform analytics
* Backup/recovery
* System communications

Super Admin is NOT the normal administrator of the college's day-to-day academic operations.

---

## Master Admin

Master Admin controls the **entire college**.

Master Admin is responsible for the complete institutional administration, including:

* Students
* Faculty
* Departments
* Courses
* Subjects
* Classes
* Attendance
* Timetable
* Examinations
* Results
* Assignments
* Fees
* Fee collection
* Scholarships
* Fines
* Library
* Placement
* Events
* Certificates
* Announcements
* Notifications
* Circulars
* Reports

Master Admin can also assign operational/domain administrators.

---

## Domain Admins

Domain Admins are administrators assigned by the Master Admin to manage specific operational domains.

Examples:

```text
Master Admin
    │
    ├── Attendance Admin
    ├── Fees Admin
    ├── Library Admin
    ├── Placement Admin
    └── Other Domain Admins
```

A Domain Admin does NOT automatically control the entire college.

Their access must be scoped to the domain assigned by the Master Admin.

---

# 23. Current Development Scope

The current project development priority is:

### Phase 1

Super Admin + Master Admin

### Phase 2

Master Admin institutional modules

### Later Phase

Domain Admin modules such as:

* Attendance Admin
* Fees Admin
* Library Admin
* Placement Admin
* etc.

Do NOT prematurely redesign the permission hierarchy or introduce domain-admin functionality unless explicitly requested.

---

# 24. Data Integrity Rules

The ERP must use relational data.

For example:

```text
Department
   ↓
Course
   ↓
Class
   ↓
Student
```

And:

```text
Faculty
   ↓
Subject
   ↓
Class
   ↓
Attendance
```

And:

```text
Student
   ↓
Fee Account
   ↓
Fee Structure
   ↓
Payment
```

And:

```text
Attendance
   ↓
Attendance Fine
   ↓
Finance Collection
```

Do not duplicate unrelated versions of the same entity across modules.

A student must remain the same student across:

* Student Management
* Attendance
* Fees
* Examinations
* Results
* Library
* Placement
* Reports

Likewise, the same Faculty entity must be reusable across academic modules.

---

# 25. Implementation Rule for Future Agents

Before implementing any module:

1. Read `docs/COLLEGE_DOMAIN_RULES.md`.
2. Check the module against these rules.
3. Reuse existing domain entities.
4. Reuse existing relationships.
5. Do not invent college policies.
6. Do not invent missing dates.
7. Do not invent additional sections.
8. Do not change shift timings.
9. Do not change attendance thresholds.
10. Do not change program/shift assignments.
11. Do not add Hostel or Transport functionality.
12. Do not merge Super Admin, Master Admin, and Domain Admin responsibilities.
13. If a requirement is ambiguous or conflicts with this document, ask for clarification before implementation.

---

# 26. Library Management

## Members
- Students and Faculty are library members.
- Student membership is automatic upon joining and spans the entire college period. (Do NOT tie membership strictly to a semester).
- Faculty can borrow as required.

## Books & Copies
- Track: Book Name, Author, Publisher, Subject, Category, Department, Rack.
- **Every physical copy** must have its own unique Book Number / Barcode.
- Physical copies have lifecycles: `AVAILABLE`, `ISSUED`, `RESERVED`, `LOST`, `DAMAGED`.

## Borrowing Rules
- Students: maximum **2 books** at a time.
- Faculty: **No fixed borrowing limit**.
- The Librarian **manually sets the due date** at the time of issue (it is not automatically calculated from semester dates).

## Renewal
- Maximum **2 renewals** per issue transaction.
- Librarian handles renewal (updates due date and counts).

## Return & Fines
- Librarian must physically check and **confirm/accept** the return.
- If late, a fine of **₹100** is created.
- The Library creates the fine obligation (`FineService`), but **Finance / Fee Counter collects the actual money**. (Do not build duplicate payment systems in Library).

## Lost / Damaged Books
- **Lost Book**: Member either pays the book price OR provides a replacement. Librarian approves resolution.
- **Damaged Book**: Librarian assesses the damage and manually determines the penalty amount.
- Required financial penalties flow directly into Finance.

## Reservations
- Members can reserve currently borrowed books (at the Book Title / Catalog level).
- Reservation queue is respected.

## Clearances
- Students require a Library No-Dues/Clearance when graduating or leaving.
- Faculty require clearance only if they have used the library and have pending obligations.

## Authority Boundary
- **Master Admin**: Complete institutional oversight.
- **Library Admin**: Future operational control (Add/Edit books, Issue/Return, Fines, Members).
- **Finance**: Sole authority for money collection.

---

# 27. Placement Management

## Placement Eligibility & Registration
- Placement services are for **FINAL-YEAR STUDENTS only** (UG: 3rd-year, PG: 2nd-year).
- Other years and faculty are not eligible.
- Eligible students must explicitly **REGISTER** for placement services. The system maintains a placement registration status.

## Student Placement Profile
- Requires tracking placement-specific info (skills, resume, certifications, backlogs) independently.
- Core academic and personal data must be referenced from existing master records; do NOT duplicate authoritative institutional student records.
- Students can update their own placement profile. Placement Admin has oversight but cannot modify authoritative academic records.

## Companies & Drives
- **Company Management**: Managed by Placement Admin with Master Admin oversight. Do not assign to Finance or Faculty.
- Store detailed company info: Name, Industry, Location, Contact, Job roles, Salary/Package, Eligibility criteria, Interview details.
- **Drives**: Can be ON-CAMPUS or OFF-CAMPUS / ONLINE. A company can conduct multiple drives. A drive can contain multiple distinct job roles.

## Drive Eligibility & Application
- Placement Admin configures custom eligibility rules per drive (minimum CGPA, max backlogs, course restrictions, etc.). No fixed universal formula.
- Eligible students must explicitly **APPLY** to a drive. They can apply to multiple drives simultaneously.

## Selection & Stages
- **Selection Restriction**: A configured policy restricts students from freely applying to future drives once selected (e.g., stopping further applications unless allowed).
- **Tracked Stages**: REGISTERED, ELIGIBLE, APPLIED, SHORTLISTED, APTITUDE, TECHNICAL INTERVIEW, HR INTERVIEW, SELECTED, REJECTED, OFFER ACCEPTED, JOINED.
- **Rounds**: Drives can have multiple distinct selection rounds. Results (pass/fail) must be recorded for each.
- **Final Result**: The final Selected/Rejected outcome must be explicitly recorded by an Admin (not inferred from round results).
- **Offer Rejection**: If a selected student rejects an offer, the system must record "SELECTED" but the offer is marked "REJECTED". It remains in history permanently.

## Placement History
- The complete history of applications, rounds, rejections, selections, and offer responses is permanently maintained. Never overwrite previous attempts.

## Reports & Notifications
- **Reports**: Master Admin can view total drives, companies, registrations, shortlists, selections, rejections, placement percentages, course/dept-wise analytics, and drive/company statistics.
- **Salary Stats**: Salary/CTC is stored per offer, but advanced statistical analysis (highest/average/median) is NOT a hard requirement.
- **Notifications**: Required for new drives, eligibility, deadlines, shortlisting, schedules, results, selection, and offers.

## Domain Boundaries
- **Placement Cell/Admin**: Dedicated authority for managing the placement workflow.
- **Finance Boundary**: Placement Management has **NO FINANCIAL TRANSACTIONS**. There are no fees or fines. Salary/CTC is purely informative.
- **Clearance Boundary**: Placement status (placed/unplaced) does NOT affect graduation, library, or finance clearance.

---

# 28. Certificate Management

## Certificate Users & Types
- Both **Students** and **Faculty** can be certificate users.
- Certificate types (Bonafide, TC, Provisional, Clearance, etc.) must be dynamically configurable, not hardcoded.
- There is no mandatory unique certificate numbering scheme. Do not invent one.

## Requests & Approval
- Users can request certificates via the Student App, or Admins can originate requests on their behalf.
- **Certificate Admin** exclusively controls approval. Master Admin has oversight. Do not automatically approve requests.
- Students cannot request the same certificate repeatedly (no automatic duplicate requests).

## Generation, Issuance & Formats
- Certificates must reference the single authoritative master academic entities (Student, Department, Course, etc.). Do not duplicate academic data.
- The system generates certificates digitally (PDF context). Ensure the data is retained for PDF delivery workflows.
- QR Codes and public online verification are explicitly **NOT** required.

## Lifecycle: Corrections & Revocations
- **Revocation**: Issued certificates can be revoked by the Certificate Admin. The revoked state remains in the historical record (do not delete).
- **Correction/Reissue**: Admins can correct and reissue certificates. The original issued certificate history must remain traceable alongside the corrected version.

## Clearances & Rules
- Certificate issuance currently has **no mandatory clearance dependency** (Library/Finance/No-Dues do NOT block generation). Do not hardcode clearance restrictions.
- Do not hardcode graduation/leaving requirements unless a specific certificate's logic inherently requires it (e.g., Degree completion info).

## Fees & Finance Integration
- Certificate fees are configurable. Not all are free, not all are paid.
- If a certificate requires a fee, it must integrate directly with the existing **Finance/Fee Management architecture**. Certificate Management does NOT independently collect money.

## Boundaries
- Certificate Admin handles operational logic.
- Master Admin handles institutional overview.
- Do not add faculty-specific workflows or constraints until explicitly defined later.
