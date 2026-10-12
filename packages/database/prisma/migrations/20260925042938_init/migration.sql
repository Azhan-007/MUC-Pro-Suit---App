-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('SUPER_ADMIN', 'MASTER_ADMIN', 'DOMAIN_ADMIN', 'FACULTY', 'STUDENT');

-- CreateEnum
CREATE TYPE "DomainCode" AS ENUM ('ACADEMIC', 'ATTENDANCE', 'FINANCE', 'LIBRARY', 'PLACEMENT', 'CERTIFICATE', 'EVENT', 'EXAMINATION', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "DomainAssignmentState" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TermType" AS ENUM ('ODD', 'EVEN');

-- CreateEnum
CREATE TYPE "ShiftCode" AS ENUM ('SHIFT_I', 'SHIFT_II');

-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('AIDED', 'SELF_FINANCING');

-- CreateEnum
CREATE TYPE "PeriodCode" AS ENUM ('H1', 'H2', 'H3', 'H4', 'H5');

-- CreateEnum
CREATE TYPE "ProgramDegree" AS ENUM ('UG', 'PG');

-- CreateEnum
CREATE TYPE "GenderEligibility" AS ENUM ('ALL', 'FEMALE_ONLY');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('CORE', 'ELECTIVE', 'LAB', 'PROJECT');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'DISCONTINUED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "FacultyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SEPARATED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISCONTINUED', 'TRANSFERRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "LeadershipRole" AS ENUM ('HOD');

-- CreateEnum
CREATE TYPE "AuthClientType" AS ENUM ('WEB', 'MOBILE');

-- CreateEnum
CREATE TYPE "SessionRevocationReason" AS ENUM ('LOGOUT', 'ROTATED', 'TOKEN_REUSE', 'PASSWORD_RESET', 'ACCOUNT_DISABLED', 'ADMIN_REVOKED');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'FAILURE', 'DENIED');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "normalized_username" TEXT,
    "email" TEXT,
    "normalized_email" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" "RoleCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "domain" "DomainCode",
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_by" UUID,
    "starts_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMPTZ(6),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "domain" "DomainCode" NOT NULL,
    "scope_department_id" UUID,
    "scope_program_id" UUID,
    "effective_start" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_end" TIMESTAMPTZ(6),
    "state" "DomainAssignmentState" NOT NULL DEFAULT 'ACTIVE',
    "assigned_by_id" UUID,
    "revoked_at" TIMESTAMPTZ(6),
    "revoked_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "domain_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "parent_session_id" UUID,
    "refresh_token_hash" TEXT NOT NULL,
    "client_type" "AuthClientType" NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_used_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "revoked_reason" "SessionRevocationReason",
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "request_ip" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "request_id" TEXT,
    "correlation_id" TEXT,
    "outcome" "AuditOutcome" NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "subject_key" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "request_hash" TEXT,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "response_code" INTEGER,
    "response_body" JSONB,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "last_error" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_records" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "provider_key" TEXT,
    "checksum" TEXT,
    "status" "BackupStatus" NOT NULL DEFAULT 'REQUESTED',
    "size_bytes" BIGINT,
    "created_by_id" UUID,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_terms" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "type" "TermType" NOT NULL,
    "term_number" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "code" "ShiftCode" NOT NULL,
    "name" TEXT NOT NULL,
    "funding_type" "FundingType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_definitions" (
    "id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "code" "PeriodCode" NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "period_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree" "ProgramDegree" NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "total_semesters" INTEGER NOT NULL,
    "funding_type" "FundingType" NOT NULL,
    "gender_eligibility" "GenderEligibility" NOT NULL DEFAULT 'ALL',
    "regulation" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_versions" (
    "id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "regulation" TEXT,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_subjects" (
    "id" UUID NOT NULL,
    "curriculum_version_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "credits" DECIMAL(5,2) NOT NULL,
    "type" "SubjectType" NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "program_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_classes" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "academic_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_type" TEXT,
    "capacity" INTEGER,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "registration_number" TEXT NOT NULL,
    "admission_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "normalized_email" TEXT,
    "phone" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "blood_group" TEXT,
    "guardian_name" TEXT,
    "guardian_phone" TEXT,
    "admission_department_id" UUID NOT NULL,
    "admission_program_id" UUID NOT NULL,
    "admission_date" DATE,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "employee_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "normalized_email" TEXT,
    "phone" TEXT,
    "department_id" UUID NOT NULL,
    "designation" TEXT NOT NULL,
    "specialization" TEXT,
    "status" "FacultyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "academic_term_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "curriculum_version_id" UUID NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "shift_snapshot" "ShiftCode" NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_assignments" (
    "id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "academic_term_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "program_subject_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "teaching_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_advisories" (
    "id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "class_advisories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_leadership_assignments" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "role" "LeadershipRole" NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "department_leadership_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_normalized_username_key" ON "users"("normalized_username");

-- CreateIndex
CREATE UNIQUE INDEX "users_normalized_email_key" ON "users"("normalized_email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_role_assignments_user_id_status_ends_at_idx" ON "user_role_assignments"("user_id", "status", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_assignments_user_id_role_id_starts_at_key" ON "user_role_assignments"("user_id", "role_id", "starts_at");

-- CreateIndex
CREATE INDEX "domain_assignments_user_id_domain_state_effective_end_idx" ON "domain_assignments"("user_id", "domain", "state", "effective_end");

-- CreateIndex
CREATE UNIQUE INDEX "domain_assignments_user_id_domain_scope_department_id_scope_key" ON "domain_assignments"("user_id", "domain", "scope_department_id", "scope_program_id", "effective_start");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_parent_session_id_key" ON "auth_sessions"("parent_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key" ON "auth_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_revoked_at_expires_at_idx" ON "auth_sessions"("user_id", "revoked_at", "expires_at");

-- CreateIndex
CREATE INDEX "auth_sessions_family_id_idx" ON "auth_sessions"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_expires_at_idx" ON "password_reset_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_created_at_idx" ON "audit_logs"("resource_type", "resource_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_request_id_idx" ON "audit_logs"("request_id");

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_subject_key_key_operation_key" ON "idempotency_keys"("subject_key", "key", "operation");

-- CreateIndex
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");

-- CreateIndex
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx" ON "outbox_events"("aggregate_type", "aggregate_id");

-- CreateIndex
CREATE INDEX "backup_records_status_created_at_idx" ON "backup_records"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_code_key" ON "academic_years"("code");

-- CreateIndex
CREATE INDEX "academic_terms_academic_year_id_is_active_idx" ON "academic_terms"("academic_year_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "academic_terms_academic_year_id_type_key" ON "academic_terms"("academic_year_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "academic_terms_academic_year_id_term_number_key" ON "academic_terms"("academic_year_id", "term_number");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_code_key" ON "shifts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "period_definitions_shift_id_code_key" ON "period_definitions"("shift_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "period_definitions_shift_id_sort_order_key" ON "period_definitions"("shift_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");

-- CreateIndex
CREATE INDEX "programs_department_id_status_idx" ON "programs"("department_id", "status");

-- CreateIndex
CREATE INDEX "programs_shift_id_funding_type_idx" ON "programs"("shift_id", "funding_type");

-- CreateIndex
CREATE INDEX "curriculum_versions_program_id_status_idx" ON "curriculum_versions"("program_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_versions_program_id_code_key" ON "curriculum_versions"("program_id", "code");

-- CreateIndex
CREATE INDEX "program_subjects_curriculum_version_id_semester_number_stat_idx" ON "program_subjects"("curriculum_version_id", "semester_number", "status");

-- CreateIndex
CREATE UNIQUE INDEX "program_subjects_curriculum_version_id_code_key" ON "program_subjects"("curriculum_version_id", "code");

-- CreateIndex
CREATE INDEX "academic_classes_program_id_academic_year_id_status_idx" ON "academic_classes"("program_id", "academic_year_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "academic_classes_academic_year_id_program_id_year_of_study_key" ON "academic_classes"("academic_year_id", "program_id", "year_of_study");

-- CreateIndex
CREATE UNIQUE INDEX "academic_classes_academic_year_id_code_key" ON "academic_classes"("academic_year_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_code_key" ON "rooms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_registration_number_key" ON "students"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_admission_number_key" ON "students"("admission_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_normalized_email_key" ON "students"("normalized_email");

-- CreateIndex
CREATE INDEX "students_admission_department_id_status_idx" ON "students"("admission_department_id", "status");

-- CreateIndex
CREATE INDEX "students_admission_program_id_status_idx" ON "students"("admission_program_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_user_id_key" ON "faculty"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_employee_id_key" ON "faculty"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_normalized_email_key" ON "faculty"("normalized_email");

-- CreateIndex
CREATE INDEX "faculty_department_id_status_idx" ON "faculty"("department_id", "status");

-- CreateIndex
CREATE INDEX "student_enrollments_student_id_effective_from_idx" ON "student_enrollments"("student_id", "effective_from");

-- CreateIndex
CREATE INDEX "student_enrollments_academic_class_id_academic_term_id_stat_idx" ON "student_enrollments"("academic_class_id", "academic_term_id", "status");

-- CreateIndex
CREATE INDEX "student_enrollments_program_id_academic_term_id_idx" ON "student_enrollments"("program_id", "academic_term_id");

-- CreateIndex
CREATE INDEX "student_enrollments_department_id_academic_term_id_idx" ON "student_enrollments"("department_id", "academic_term_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_student_id_academic_term_id_key" ON "student_enrollments"("student_id", "academic_term_id");

-- CreateIndex
CREATE INDEX "teaching_assignments_academic_class_id_academic_term_id_sta_idx" ON "teaching_assignments"("academic_class_id", "academic_term_id", "status");

-- CreateIndex
CREATE INDEX "teaching_assignments_faculty_id_academic_term_id_status_idx" ON "teaching_assignments"("faculty_id", "academic_term_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_assignments_faculty_id_academic_term_id_academic_c_key" ON "teaching_assignments"("faculty_id", "academic_term_id", "academic_class_id", "program_subject_id", "effective_from");

-- CreateIndex
CREATE INDEX "class_advisories_faculty_id_status_idx" ON "class_advisories"("faculty_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "class_advisories_academic_class_id_effective_from_key" ON "class_advisories"("academic_class_id", "effective_from");

-- CreateIndex
CREATE INDEX "department_leadership_assignments_faculty_id_status_idx" ON "department_leadership_assignments"("faculty_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "department_leadership_assignments_department_id_role_effect_key" ON "department_leadership_assignments"("department_id", "role", "effective_from");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_assignments" ADD CONSTRAINT "domain_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_assignments" ADD CONSTRAINT "domain_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_assignments" ADD CONSTRAINT "domain_assignments_scope_department_id_fkey" FOREIGN KEY ("scope_department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_assignments" ADD CONSTRAINT "domain_assignments_scope_program_id_fkey" FOREIGN KEY ("scope_program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_parent_session_id_fkey" FOREIGN KEY ("parent_session_id") REFERENCES "auth_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_records" ADD CONSTRAINT "backup_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_definitions" ADD CONSTRAINT "period_definitions_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_subjects" ADD CONSTRAINT "program_subjects_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_admission_department_id_fkey" FOREIGN KEY ("admission_department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_admission_program_id_fkey" FOREIGN KEY ("admission_program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "academic_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "academic_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_program_subject_id_fkey" FOREIGN KEY ("program_subject_id") REFERENCES "program_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_advisories" ADD CONSTRAINT "class_advisories_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_advisories" ADD CONSTRAINT "class_advisories_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "academic_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_leadership_assignments" ADD CONSTRAINT "department_leadership_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_leadership_assignments" ADD CONSTRAINT "department_leadership_assignments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
