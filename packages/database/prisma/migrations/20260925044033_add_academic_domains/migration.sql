-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('OPEN', 'MARKED', 'SAVED', 'SUBMITTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'ON_DUTY', 'LATE');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('CIA_I', 'CIA_II', 'SEMESTER_END', 'PRACTICAL', 'PROJECT');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('SCHEDULED', 'CONDUCTED', 'EVALUATED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('ENTRY', 'VALIDATION', 'SUBMITTED', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('FEE', 'ATTENDANCE_FINE', 'LIBRARY_FINE', 'LIBRARY_LOSS', 'LIBRARY_DAMAGE', 'CERTIFICATE_FEE', 'EVENT_FEE', 'LATE_FEE');

-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('DRAFT', 'POSTED', 'SETTLED', 'PARTIALLY_SETTLED', 'WAIVED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'GATEWAY', 'BANK_TRANSFER');

-- CreateTable
CREATE TABLE "timetable_versions" (
    "id" UUID NOT NULL,
    "academic_term_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "version_name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "timetable_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" UUID NOT NULL,
    "timetable_version_id" UUID NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "period_id" UUID NOT NULL,
    "teaching_assignment_id" UUID NOT NULL,
    "room_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" UUID NOT NULL,
    "academic_term_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "program_subject_id" UUID NOT NULL,
    "teaching_assignment_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "period_id" UUID NOT NULL,
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'OPEN',
    "marked_by_id" UUID,
    "submitted_by_id" UUID,
    "locked_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_entries" (
    "id" UUID NOT NULL,
    "attendance_session_id" UUID NOT NULL,
    "student_enrollment_id" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "attendance_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" UUID NOT NULL,
    "attendance_entry_id" UUID NOT NULL,
    "previous_status" "AttendanceStatus" NOT NULL,
    "new_status" "AttendanceStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "corrected_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "academic_term_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "program_subject_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "date" DATE,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_components" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "max_marks" DECIMAL(5,2) NOT NULL,
    "weight" DECIMAL(5,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "assessment_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_entries" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "student_enrollment_id" UUID NOT NULL,
    "marks_obtained" DECIMAL(5,2),
    "is_absent" BOOLEAN NOT NULL DEFAULT false,
    "status" "ResultStatus" NOT NULL DEFAULT 'ENTRY',
    "entered_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "result_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_revisions" (
    "id" UUID NOT NULL,
    "result_entry_id" UUID NOT NULL,
    "previous_marks" DECIMAL(5,2),
    "new_marks" DECIMAL(5,2),
    "reason" TEXT NOT NULL,
    "revised_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "result_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_publications" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_by_id" UUID NOT NULL,

    CONSTRAINT "result_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "program_id" UUID,
    "shift_id" UUID,
    "category" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structure_components" (
    "id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fee_structure_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_installment_rules" (
    "id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "due_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fee_installment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" UUID NOT NULL,
    "student_enrollment_id" UUID NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_charges" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "charge_type" "ChargeType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE,
    "source_id" TEXT,
    "status" "FinancialStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_concessions" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by_id" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "scholarship_concessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_adjustments" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "adjusted_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" UUID NOT NULL,
    "payment_intent_id" UUID NOT NULL,
    "provider_reference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gateway_webhook_events" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gateway_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "payment_intent_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCESS',
    "payment_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt_number" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "financial_charge_id" UUID NOT NULL,
    "allocated_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_by_id" UUID,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timetable_versions_academic_class_id_academic_term_id_statu_idx" ON "timetable_versions"("academic_class_id", "academic_term_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_slots_timetable_version_id_day_of_week_period_id_key" ON "timetable_slots"("timetable_version_id", "day_of_week", "period_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_academic_class_id_date_idx" ON "attendance_sessions"("academic_class_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessions_academic_term_id_academic_class_id_prog_key" ON "attendance_sessions"("academic_term_id", "academic_class_id", "program_subject_id", "date", "period_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_entries_attendance_session_id_student_enrollment_key" ON "attendance_entries"("attendance_session_id", "student_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_academic_term_id_academic_class_id_program_subj_key" ON "assessments"("academic_term_id", "academic_class_id", "program_subject_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "result_entries_assessment_id_student_enrollment_id_key" ON "result_entries"("assessment_id", "student_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_code_version_key" ON "fee_structures"("code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "financial_accounts_student_enrollment_id_key" ON "financial_accounts"("student_enrollment_id");

-- CreateIndex
CREATE INDEX "financial_charges_financial_account_id_status_due_date_idx" ON "financial_charges"("financial_account_id", "status", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "gateway_webhook_events_event_id_key" ON "gateway_webhook_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_number_key" ON "payments"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_payment_id_key" ON "receipts"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- AddForeignKey
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "academic_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_timetable_version_id_fkey" FOREIGN KEY ("timetable_version_id") REFERENCES "timetable_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "period_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_teaching_assignment_id_fkey" FOREIGN KEY ("teaching_assignment_id") REFERENCES "teaching_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "academic_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_program_subject_id_fkey" FOREIGN KEY ("program_subject_id") REFERENCES "program_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_teaching_assignment_id_fkey" FOREIGN KEY ("teaching_assignment_id") REFERENCES "teaching_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "period_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_marked_by_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_locked_by_id_fkey" FOREIGN KEY ("locked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_entries" ADD CONSTRAINT "attendance_entries_attendance_session_id_fkey" FOREIGN KEY ("attendance_session_id") REFERENCES "attendance_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_entries" ADD CONSTRAINT "attendance_entries_student_enrollment_id_fkey" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_attendance_entry_id_fkey" FOREIGN KEY ("attendance_entry_id") REFERENCES "attendance_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_corrected_by_id_fkey" FOREIGN KEY ("corrected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "academic_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_program_subject_id_fkey" FOREIGN KEY ("program_subject_id") REFERENCES "program_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_components" ADD CONSTRAINT "assessment_components_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_student_enrollment_id_fkey" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_entered_by_id_fkey" FOREIGN KEY ("entered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_revisions" ADD CONSTRAINT "result_revisions_result_entry_id_fkey" FOREIGN KEY ("result_entry_id") REFERENCES "result_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_revisions" ADD CONSTRAINT "result_revisions_revised_by_id_fkey" FOREIGN KEY ("revised_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_publications" ADD CONSTRAINT "result_publications_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_publications" ADD CONSTRAINT "result_publications_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structure_components" ADD CONSTRAINT "fee_structure_components_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_installment_rules" ADD CONSTRAINT "fee_installment_rules_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_student_enrollment_id_fkey" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_charges" ADD CONSTRAINT "financial_charges_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_concessions" ADD CONSTRAINT "scholarship_concessions_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_concessions" ADD CONSTRAINT "scholarship_concessions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_adjustments" ADD CONSTRAINT "financial_adjustments_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_adjustments" ADD CONSTRAINT "financial_adjustments_adjusted_by_id_fkey" FOREIGN KEY ("adjusted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_financial_charge_id_fkey" FOREIGN KEY ("financial_charge_id") REFERENCES "financial_charges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
