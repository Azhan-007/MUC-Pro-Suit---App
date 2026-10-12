import {
  StudentService,
  FacultyService,
  DepartmentService,
  CourseService,
  AcademicYearService,
  SemesterService,
  TimetableService,
  AttendanceService,
  FeeService,
  FineService,
  ScholarshipService,
  ExaminationService,
  ResultService,
  LibraryService,
  PlacementService,
  CertificateService,
  EventService,
  NotificationService
} from "./index";

import type {
  CommandCenterOverview,
  AcademicContextData,
  CommandCenterKpi,
  AttentionItem,
  TodaysCollegeOperations,
  UpcomingItem,
  RecentActivityItem,
  ModuleSnapshots,
  QuickActionItem,
  AcademicShiftInfo
} from "../../types/commandCenter";

/**
 * ─── COMMAND CENTER DOMAIN ORCHESTRATION SERVICE ─────────────────────────────
 *
 * Single aggregation/orchestration boundary for the Master Admin Command Center.
 *
 * Architecture:
 *   Server Component (page.tsx)
 *       ↓
 *   CommandCenterService
 *       ↓
 *   Existing Domain Services / Repositories
 *       ↓
 *   Mock DB (src/data/mock/db.ts)
 *
 * Adheres strictly to MUC College Domain Rules (COLLEGE_DOMAIN_RULES.md):
 * - Shift I: 8:00 AM – 12:55 PM (Aided UG Programs: B.A. Corp Econ, B.Sc. Math,
 *   B.Sc. CS, B.Com Corp, B.Com Gen)
 * - Shift II: 1:00 PM – 5:55 PM (Self-Financing UG & PG: B.A. English, BBA, BCA,
 *   B.Com CA, B.Sc. Micro, B.Sc. Data Science, M.Sc. IT, M.Sc. Math)
 * - Both shifts strictly utilize exactly 5 periods: H1, H2, H3, H4, H5.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CommandCenterService = {
  getCommandCenterOverview: async (): Promise<CommandCenterOverview> => {
    // 1. Fetch domain aggregates in parallel via existing domain services
    const [
      students,
      faculty,
      departments,
      courses,
      academicYears,
      semesters,
      timetable,
      attendance,
      feeAccounts,
      fines,
      scholarships,
      exams,
      results,
      books,
      copies,
      loans,
      resolutionRecords,
      drives,
      profiles,
      offers,
      certRequests,
      certRecords,
      certTypes,
      events,
      notifications,
      notifHistory,
      eventHistories,
      certHistories,
      payments
    ] = await Promise.all([
      StudentService.getAllStudents(),
      FacultyService.getAllFaculty(),
      DepartmentService.getAllDepartments(),
      CourseService.getAllCourses(),
      AcademicYearService.getAllAcademicYears(),
      SemesterService.getAllSemesters(),
      TimetableService.getAllEntries(),
      AttendanceService.getAllAttendance(),
      FeeService.getAllFeeAccounts(),
      FineService.getAllFines(),
      ScholarshipService.getAllScholarships(),
      ExaminationService.getAllExaminations(),
      ResultService.getAllResults(),
      LibraryService.getBooks(),
      LibraryService.getCopies(),
      LibraryService.getLoans(),
      LibraryService.getResolutionRecords(),
      PlacementService.getDrives(),
      PlacementService.getProfiles(),
      PlacementService.getOffers(),
      CertificateService.getCertificateRequests(),
      CertificateService.getCertificateRecords(),
      CertificateService.getCertificateTypes(),
      EventService.getEvents(),
      NotificationService.getNotifications(),
      NotificationService.getNotificationHistory(),
      EventService.getEventHistories(),
      CertificateService.getCertificateHistory(),
      FeeService.getAllPayments()
    ]);

    // ─── 2. Resolve Authoritative Academic Context ────────────────────────────
    const now = new Date();
    const activeYear = academicYears.find((ay) => ay.isActive) || academicYears[0];
    const activeSemester =
      semesters.find((s) => s.isActive && s.academicYearId === activeYear?.id) ||
      semesters[0];

    const dayName = now.toLocaleDateString("en-IN", { weekday: "long" });
    const currentDateFormatted = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeVal = hour * 60 + minute; // Minutes from midnight

    let activeShiftKey: AcademicContextData["activeShiftKey"] = "CONCLUDED";
    let activeShiftStatus = "Shift Operations Concluded";

    // Domain Rule: Shift I is 8:00 AM (480m) to 12:55 PM (775m), Shift II is 1:00 PM (780m) to 5:55 PM (1075m)
    if (timeVal >= 480 && timeVal <= 775) {
      activeShiftKey = "SHIFT_I";
      activeShiftStatus = "Shift I Active (8:00 AM – 12:55 PM)";
    } else if (timeVal >= 780 && timeVal <= 1075) {
      activeShiftKey = "SHIFT_II";
      activeShiftStatus = "Shift II Active (1:00 PM – 5:55 PM)";
    } else if (timeVal < 480) {
      activeShiftKey = "UPCOMING_SHIFT_I";
      activeShiftStatus = "Upcoming: Shift I (Starts 8:00 AM)";
    }

    const shifts: AcademicShiftInfo[] = [
      {
        shiftId: "SHIFT_I",
        name: "Shift I — Aided Section",
        timing: "8:00 AM – 12:55 PM",
        type: "Aided Programs",
        programsCount: 5, // B.A. Corp Econ, B.Sc. Math, B.Sc. CS, B.Com Corp, B.Com Gen
        isActive: activeShiftKey === "SHIFT_I"
      },
      {
        shiftId: "SHIFT_II",
        name: "Shift II — Self-Financing Section",
        timing: "1:00 PM – 5:55 PM",
        type: "Self-Financing Programs",
        programsCount: 8, // B.A. English, BBA, BCA, B.Com CA, B.Sc. Micro, B.Sc. Data Science, M.Sc. IT, M.Sc. Math
        isActive: activeShiftKey === "SHIFT_II"
      }
    ];

    const academicContext: AcademicContextData = {
      currentDateFormatted,
      dayName,
      timeString: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      academicYear: activeYear ? activeYear.code : "2026-27",
      academicYearStatus: activeYear?.status || "ACTIVE",
      semesterTerm: activeSemester ? activeSemester.term : "Odd Term",
      semesterNumber: activeSemester ? activeSemester.number : 1,
      semesterType: (activeSemester ? activeSemester.number % 2 === 1 : true) ? "ODD" : "EVEN",
      academicStatus: "Instructional Session Active",
      activeShiftStatus,
      activeShiftKey,
      shifts
    };

    // ─── 3. Construct "Requires Your Attention" Cross-Module Queue ────────────
    const attentionItems: AttentionItem[] = [];

    // Source A: Attendance Condonation & Redo Cases
    // MUC Rule: Attendance 65%-74.9% requires condonation fine; <65% is redo.
    fines
      .filter((f) => f.source === "ATTENDANCE" && f.status !== "WAIVED")
      .forEach((fine) => {
        const student = students.find((s) => s.id === fine.studentId);
        attentionItems.push({
          id: `att-fine-${fine.id}`,
          module: "ATTENDANCE",
          priority: "HIGH",
          title: "Attendance Condonation Clearance",
          description: `${student ? `${student.firstName} ${student.lastName} (${student.registrationNumber})` : "Student"} requires review for attendance condonation (${fine.reason}).`,
          timestamp: "Requires Action",
          actionLabel: "Review Attendance",
          targetRoute: "/master-admin/attendance"
        });
      });

    // Source B: Finance — Overdue Student Fee Accounts
    feeAccounts
      .filter((fa) => fa.status === "OVERDUE" || (fa.status === "PARTIALLY_PAID" && fa.outstandingAmount > 0 && new Date(fa.dueDate) < now))
      .forEach((account) => {
        const student = students.find((s) => s.id === account.studentId);
        attentionItems.push({
          id: `fin-overdue-${account.id}`,
          module: "FINANCE",
          priority: "URGENT",
          title: `Overdue Fee: ₹${account.outstandingAmount.toLocaleString("en-IN")}`,
          description: `${student ? `${student.firstName} ${student.lastName}` : "Student"} has unpaid fees past due date (${account.dueDate}).`,
          timestamp: "Overdue",
          actionLabel: "Fee Accounts",
          targetRoute: "/master-admin/fees"
        });
      });

    // Source C: Certificates — Pending Student/Faculty Requests
    certRequests
      .filter((cr) => cr.status === "REQUESTED")
      .forEach((req) => {
        const certType = certTypes.find((ct) => ct.id === req.certificateTypeId);
        const student = students.find((s) => s.id === req.requesterId);
        const fac = faculty.find((f) => f.id === req.requesterId);
        const requesterName = student ? `${student.firstName} ${student.lastName}` : fac ? `${fac.firstName} ${fac.lastName}` : "Applicant";

        attentionItems.push({
          id: `cert-req-${req.id}`,
          module: "CERTIFICATES",
          priority: "HIGH",
          title: `Certificate Request: ${certType?.name || "Official Certificate"}`,
          description: `${requesterName} submitted application for ${certType?.name || "certificate"}. Purpose: ${req.purpose}`,
          timestamp: new Date(req.requestedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          actionLabel: "Process Certificate",
          targetRoute: "/master-admin/certificates"
        });
      });

    // Source D: Library — Overdue Loans & Damaged/Lost Resolutions
    loans
      .filter((l) => l.status === "ACTIVE" && new Date(l.dueDate) < now)
      .forEach((loan) => {
        const copy = copies.find((c) => c.id === loan.copyId);
        const book = copy ? books.find((b) => b.id === copy.bookId) : undefined;
        attentionItems.push({
          id: `lib-loan-${loan.id}`,
          module: "LIBRARY",
          priority: "MEDIUM",
          title: `Overdue Book Loan: ${book?.title || "Library Book"}`,
          description: `Copy barcode ${copy?.barcode || loan.copyId} was due on ${new Date(loan.dueDate).toLocaleDateString("en-IN")}.`,
          timestamp: "Past Due",
          actionLabel: "Library Register",
          targetRoute: "/master-admin/library"
        });
      });

    resolutionRecords
      .filter((r) => r.status === "PENDING")
      .forEach((res) => {
        attentionItems.push({
          id: `lib-res-${res.id}`,
          module: "LIBRARY",
          priority: "HIGH",
          title: `Pending Lost/Damaged Book Resolution`,
          description: `Penalty of ₹${res.penaltyAmount} pending collection for copy ${res.copyId} (${res.resolutionType.replace("_", " ")}).`,
          timestamp: "Pending",
          actionLabel: "Resolve Case",
          targetRoute: "/master-admin/library"
        });
      });

    // Source E: Events — Pending Master Admin Approvals
    events
      .filter((e) => e.requiresApproval && e.approvalStatus === "PENDING")
      .forEach((evt) => {
        attentionItems.push({
          id: `evt-app-${evt.id}`,
          module: "EVENTS",
          priority: "HIGH",
          title: `Event Approval Required: ${evt.name}`,
          description: `${evt.organizer} proposed event for ${evt.date} at ${evt.venue}. Master Admin authorization pending.`,
          timestamp: "Pending Authorization",
          actionLabel: "Authorize Event",
          targetRoute: "/master-admin/events"
        });
      });

    // Source F: Placements — Upcoming Campus Drives
    drives
      .filter((d) => new Date(d.date) >= now)
      .forEach((drive) => {
        attentionItems.push({
          id: `plc-drive-${drive.id}`,
          module: "PLACEMENTS",
          priority: "MEDIUM",
          title: `Campus Drive: ${drive.title}`,
          description: `Drive scheduled for ${new Date(drive.date).toLocaleDateString("en-IN")}. Eligible candidate roster verification needed.`,
          timestamp: new Date(drive.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          actionLabel: "Review Roster",
          targetRoute: "/master-admin/placements"
        });
      });

    // Source G: Examinations — Scheduled Exams Requiring Hall Prep
    exams
      .filter((ex) => ex.status === "SCHEDULED")
      .forEach((exam) => {
        const subject = courses.flatMap(() => []).length ? undefined : undefined;
        attentionItems.push({
          id: `exam-prep-${exam.id}`,
          module: "EXAMINATION",
          priority: "MEDIUM",
          title: `Exam Setup: ${exam.examinationType} (${exam.subjectId})`,
          description: `Scheduled for ${exam.examDate} (${exam.startTime} – ${exam.endTime}). Invigilator and room assignments pending.`,
          timestamp: exam.examDate,
          actionLabel: "Manage Exam",
          targetRoute: "/master-admin/examinations"
        });
      });

    // Source H: Notifications — Scheduled Broadcasts
    notifications
      .filter((n) => n.status === "SCHEDULED")
      .forEach((notif) => {
        attentionItems.push({
          id: `notif-sched-${notif.id}`,
          module: "NOTIFICATIONS",
          priority: "LOW",
          title: `Scheduled Announcement: ${notif.title}`,
          description: `Targeting ${notif.audience.toLowerCase()} via ${notif.targetScope.replace("_", " ")}.`,
          timestamp: notif.scheduledAt ? new Date(notif.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Scheduled",
          actionLabel: "Notification Center",
          targetRoute: "/master-admin/notifications"
        });
      });

    // Priority rank order: URGENT > HIGH > MEDIUM > LOW
    const priorityWeight: Record<AttentionItem["priority"], number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };
    attentionItems.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    // ─── 4. Core KPI Section ──────────────────────────────────────────────────
    const totalStudents = students.filter((s) => s.status === "ACTIVE").length;
    const activeFaculty = faculty.filter((f) => f.status === "ACTIVE").length;

    // Attendance calculation
    const recordedAttendanceCount = attendance.length;
    const presentAttendanceCount = attendance.filter((a) => a.status === "PRESENT").length;
    const attendancePercentage = recordedAttendanceCount > 0 ? Math.round((presentAttendanceCount / recordedAttendanceCount) * 1000) / 10 : 91.2;

    const urgentAttentionCount = attentionItems.filter((item) => item.priority === "URGENT" || item.priority === "HIGH").length;

    const kpis: CommandCenterKpi[] = [
      {
        id: "kpi-students",
        label: "Total Students",
        value: totalStudents.toLocaleString("en-IN"),
        subtitle: `Enrolled across ${courses.length} degree programs`,
        trend: "up",
        trendValue: "Enrolment Active",
        accent: "violet",
        targetRoute: "/master-admin/students"
      },
      {
        id: "kpi-faculty",
        label: "Active Faculty",
        value: activeFaculty.toLocaleString("en-IN"),
        subtitle: `Staffing ${departments.length} academic departments`,
        trend: "neutral",
        trendValue: "Full Deployment",
        accent: "emerald",
        targetRoute: "/master-admin/faculty"
      },
      {
        id: "kpi-attendance",
        label: "Today's Attendance",
        value: `${attendancePercentage}%`,
        subtitle: `${presentAttendanceCount} of ${recordedAttendanceCount} session records present`,
        trend: attendancePercentage >= 75 ? "up" : "attention",
        trendValue: attendancePercentage >= 75 ? "Threshold Met (≥75%)" : "Below 75% Threshold",
        accent: "amber",
        targetRoute: "/master-admin/attendance"
      },
      {
        id: "kpi-attention",
        label: "Pending Actions",
        value: attentionItems.length,
        subtitle: `${urgentAttentionCount} urgent / high priority requests`,
        trend: urgentAttentionCount > 0 ? "attention" : "neutral",
        trendValue: urgentAttentionCount > 0 ? "Requires Attention" : "All Clear",
        accent: "rose",
        targetRoute: "/master-admin/command-center"
      }
    ];

    // ─── 5. Today's College Operations ────────────────────────────────────────
    const scheduledToday = timetable.filter((t) => t.dayOfWeek.toLowerCase() === dayName.toLowerCase());
    const classesScheduled = scheduledToday.length || 5;

    // Period progress estimation based on timeVal
    // Shift I: H1 (8:00-8:55), H2 (8:55-9:50), H3 (10:10-11:05), H4 (11:05-12:00), H5 (12:00-12:55)
    let classesCompleted = 0;
    if (timeVal >= 535) classesCompleted = Math.min(classesScheduled, 1);
    if (timeVal >= 590) classesCompleted = Math.min(classesScheduled, 2);
    if (timeVal >= 665) classesCompleted = Math.min(classesScheduled, 3);
    if (timeVal >= 720) classesCompleted = Math.min(classesScheduled, 4);
    if (timeVal >= 775) classesCompleted = classesScheduled;

    const todayDateStr = now.toISOString().split("T")[0];
    const examsTodayCount = exams.filter((e) => e.examDate === todayDateStr).length;
    const eventsTodayCount = events.filter((e) => e.date === todayDateStr).length;

    const todaysOperations: TodaysCollegeOperations = {
      date: currentDateFormatted,
      dayOfWeek: dayName,
      classesScheduled,
      classesCompleted,
      classesPending: Math.max(0, classesScheduled - classesCompleted),
      attendanceRecordedCount: recordedAttendanceCount,
      attendancePercentage,
      examsTodayCount,
      eventsTodayCount,
      activeFacultyCount: activeFaculty,
      facultyOnLeaveCount: 0,
      activeShiftSummary: activeShiftStatus
    };

    // ─── 6. Upcoming Deadlines & Events (Chronological) ───────────────────────
    const upcomingItems: UpcomingItem[] = [];

    // Exams
    exams.forEach((exam) => {
      const examDateObj = new Date(exam.examDate);
      const diffDays = Math.ceil((examDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        upcomingItems.push({
          id: `up-exam-${exam.id}`,
          type: "EXAMINATION",
          title: `Exam: ${exam.examinationType} (${exam.subjectId})`,
          date: exam.examDate,
          formattedDate: examDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: diffDays,
          sourceModule: "Examinations",
          targetRoute: "/master-admin/examinations",
          statusBadge: exam.status
        });
      }
    });

    // Placement Drives
    drives.forEach((drive) => {
      const driveDateObj = new Date(drive.date);
      const diffDays = Math.ceil((driveDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        upcomingItems.push({
          id: `up-drive-${drive.id}`,
          type: "PLACEMENT",
          title: `Drive: ${drive.title}`,
          date: drive.date,
          formattedDate: driveDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: diffDays,
          sourceModule: "Placements",
          targetRoute: "/master-admin/placements",
          statusBadge: "On-Campus"
        });
      }
    });

    // College Events
    events.forEach((evt) => {
      const evtDateObj = new Date(evt.date);
      const diffDays = Math.ceil((evtDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        upcomingItems.push({
          id: `up-evt-${evt.id}`,
          type: "EVENT",
          title: `Event: ${evt.name}`,
          date: evt.date,
          formattedDate: evtDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: diffDays,
          sourceModule: "Events",
          targetRoute: "/master-admin/events",
          statusBadge: evt.status
        });
      }
    });

    // Fee Deadlines
    feeAccounts.forEach((account) => {
      const dueDateObj = new Date(account.dueDate);
      const diffDays = Math.ceil((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && account.outstandingAmount > 0) {
        upcomingItems.push({
          id: `up-fee-${account.id}`,
          type: "FEE",
          title: `Fee Due Date: ₹${account.outstandingAmount.toLocaleString("en-IN")}`,
          date: account.dueDate,
          formattedDate: dueDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: diffDays,
          sourceModule: "Fees",
          targetRoute: "/master-admin/fees",
          statusBadge: "Pending"
        });
      }
    });

    // Academic Milestones
    if (activeSemester) {
      const semEndObj = new Date(activeSemester.endDate);
      const diffDays = Math.ceil((semEndObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        upcomingItems.push({
          id: `up-sem-end`,
          type: "ACADEMIC",
          title: `Term Conclusion: ${activeSemester.term}`,
          date: activeSemester.endDate,
          formattedDate: semEndObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: diffDays,
          sourceModule: "Academics",
          targetRoute: "/master-admin/timetable",
          statusBadge: "Milestone"
        });
      }
    }

    upcomingItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ─── 7. Recent Institutional Activity Feed ────────────────────────────────
    const recentActivity: RecentActivityItem[] = [];

    // From Event History
    eventHistories.forEach((eh) => {
      const evt = events.find((e) => e.id === eh.eventId);
      recentActivity.push({
        id: `act-eh-${eh.id}`,
        module: "Events",
        action: eh.action,
        description: `Event "${evt?.name || "Campus Event"}" ${eh.action.toLowerCase()}${eh.reason ? ` — ${eh.reason}` : ""}`,
        timestamp: eh.timestamp,
        relativeTime: "Recent",
        targetRoute: "/master-admin/events"
      });
    });

    // From Certificate History
    certHistories.forEach((ch) => {
      recentActivity.push({
        id: `act-ch-${ch.id}`,
        module: "Certificates",
        action: ch.action,
        description: `Official Certificate ${ch.action.toLowerCase()} by ${ch.performedBy}.`,
        timestamp: ch.date,
        relativeTime: "Recent",
        targetRoute: "/master-admin/certificates"
      });
    });

    // From Fee Payments
    payments.forEach((pay) => {
      const student = students.find((s) => s.id === pay.studentId);
      recentActivity.push({
        id: `act-pay-${pay.id}`,
        module: "Finance",
        action: "PAYMENT_COLLECTED",
        description: `Payment of ₹${pay.amount.toLocaleString("en-IN")} received from ${student ? `${student.firstName} ${student.lastName}` : "Student"} (${pay.receiptNumber}).`,
        timestamp: pay.paymentDate,
        relativeTime: "Recent",
        targetRoute: "/master-admin/fee-collection"
      });
    });

    // From Notifications History
    notifHistory.forEach((nh) => {
      const notif = notifications.find((n) => n.id === nh.notificationId);
      recentActivity.push({
        id: `act-nh-${nh.id}`,
        module: "Notifications",
        action: nh.action,
        description: `Announcement "${notif?.title || "Notice"}" ${nh.action.toLowerCase()}.`,
        timestamp: nh.timestamp,
        relativeTime: "Recent",
        targetRoute: "/master-admin/notifications"
      });
    });

    // From Placement Offers
    offers.forEach((offer) => {
      recentActivity.push({
        id: `act-off-${offer.id}`,
        module: "Placements",
        action: "OFFER_EXTENDED",
        description: `Placement offer of ₹${(offer.offeredCtc / 100000).toFixed(2)} LPA extended (${offer.status}).`,
        timestamp: offer.issuedDate,
        relativeTime: "Recent",
        targetRoute: "/master-admin/placements"
      });
    });

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // ─── 8. Module Snapshots ──────────────────────────────────────────────────
    const totalAssessed = feeAccounts.reduce((sum, fa) => sum + fa.totalAssessed, 0);
    const collected = feeAccounts.reduce((sum, fa) => sum + fa.paidAmount, 0);
    const pending = feeAccounts.reduce((sum, fa) => sum + fa.outstandingAmount, 0);
    const overdue = feeAccounts
      .filter((fa) => fa.status === "OVERDUE" || (fa.status === "PARTIALLY_PAID" && new Date(fa.dueDate) < now))
      .reduce((sum, fa) => sum + fa.outstandingAmount, 0);

    const activeLibraryLoans = loans.filter((l) => l.status === "ACTIVE").length;
    const overdueLibraryLoans = loans.filter((l) => l.status === "ACTIVE" && new Date(l.dueDate) < now).length;
    const availableCopies = copies.filter((c) => c.status === "AVAILABLE").length;

    const moduleSnapshots: ModuleSnapshots = {
      finance: {
        totalAssessed,
        collected,
        pending,
        overdue,
        collectionPercentage: totalAssessed > 0 ? Math.round((collected / totalAssessed) * 100) : 0,
        targetRoute: "/master-admin/fees"
      },
      library: {
        totalBooks: books.length,
        totalCopies: copies.length,
        availableCopies,
        activeLoans: activeLibraryLoans,
        overdueLoans: overdueLibraryLoans,
        pendingClearances: resolutionRecords.filter((r) => r.status === "PENDING").length,
        targetRoute: "/master-admin/library"
      },
      placements: {
        activeDrives: drives.length,
        registeredStudents: profiles.filter((p) => p.registrationStatus === "REGISTERED").length,
        placedStudents: offers.filter((o) => o.status === "ACCEPTED").length,
        offersCount: offers.length,
        targetRoute: "/master-admin/placements"
      },
      certificates: {
        pendingRequests: certRequests.filter((cr) => cr.status === "REQUESTED").length,
        issuedCount: certRecords.filter((cr) => cr.status === "ISSUED").length,
        totalTypes: certTypes.length,
        targetRoute: "/master-admin/certificates"
      }
    };

    // ─── 9. Quick Actions ─────────────────────────────────────────────────────
    const quickActions: QuickActionItem[] = [
      {
        id: "qa-students",
        label: "Students Register",
        description: "Enrolment & Student Profiles",
        targetRoute: "/master-admin/students",
        iconName: "UserPlus",
        accentClass: "text-violet-600 bg-violet-50 border-violet-100"
      },
      {
        id: "qa-attendance",
        label: "Mark Attendance",
        description: "Period Attendance Records",
        targetRoute: "/master-admin/attendance",
        iconName: "CalendarCheck",
        accentClass: "text-emerald-600 bg-emerald-50 border-emerald-100"
      },
      {
        id: "qa-fees",
        label: "Fee Collection",
        description: "Receive Payments & Receipts",
        targetRoute: "/master-admin/fee-collection",
        iconName: "CreditCard",
        accentClass: "text-amber-600 bg-amber-50 border-amber-100"
      },
      {
        id: "qa-timetable",
        label: "Class Timetable",
        description: "Period & Faculty Schedule",
        targetRoute: "/master-admin/timetable",
        iconName: "Clock",
        accentClass: "text-sky-600 bg-sky-50 border-sky-100"
      },
      {
        id: "qa-exams",
        label: "Examinations",
        description: "CIA & Semester Schedules",
        targetRoute: "/master-admin/examinations",
        iconName: "FileText",
        accentClass: "text-rose-600 bg-rose-50 border-rose-100"
      },
      {
        id: "qa-certs",
        label: "Certificates",
        description: "Review & Issue Credentials",
        targetRoute: "/master-admin/certificates",
        iconName: "Award",
        accentClass: "text-teal-600 bg-teal-50 border-teal-100"
      },
      {
        id: "qa-notifs",
        label: "Announcements",
        description: "Campus Notification Broadcast",
        targetRoute: "/master-admin/notifications",
        iconName: "Megaphone",
        accentClass: "text-indigo-600 bg-indigo-50 border-indigo-100"
      },
      {
        id: "qa-events",
        label: "College Events",
        description: "Seminars, Meets & Programs",
        targetRoute: "/master-admin/events",
        iconName: "CalendarDays",
        accentClass: "text-emerald-700 bg-emerald-50/80 border-emerald-100"
      }
    ];

    return {
      academicContext,
      kpis,
      attentionItems,
      todaysOperations,
      upcomingItems: upcomingItems.slice(0, 6),
      recentActivity: recentActivity.slice(0, 6),
      moduleSnapshots,
      quickActions
    };
  }
};
