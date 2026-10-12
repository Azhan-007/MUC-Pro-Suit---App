-- CreateEnum
CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'LOANED', 'LOST', 'DAMAGED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'RETURNED', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LibraryResolutionType" AS ENUM ('PAID', 'REPLACED');

-- CreateEnum
CREATE TYPE "PlacementRegistrationStatus" AS ENUM ('NOT_REGISTERED', 'REGISTERED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DriveMode" AS ENUM ('ON_CAMPUS', 'OFF_CAMPUS', 'ONLINE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'APTITUDE', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'SELECTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'JOINED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "CertificateRequestStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'REJECTED', 'REVOKED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "library_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,

    CONSTRAINT "library_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_catalogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "book_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_copies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_catalog_id" UUID NOT NULL,
    "copy_number" TEXT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "book_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_loans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "library_member_id" UUID NOT NULL,
    "book_copy_id" UUID NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "library_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_renewals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "library_loan_id" UUID NOT NULL,
    "renewal_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "new_due_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_resolutions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "library_loan_id" UUID NOT NULL,
    "resolution_type" "LibraryResolutionType" NOT NULL,
    "resolved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "library_member_id" UUID NOT NULL,
    "book_catalog_id" UUID NOT NULL,
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "library_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_enrollment_id" UUID NOT NULL,
    "status" "PlacementRegistrationStatus" NOT NULL DEFAULT 'NOT_REGISTERED',

    CONSTRAINT "placement_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID NOT NULL,
    "resume_url" TEXT,

    CONSTRAINT "placement_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "skill_name" TEXT NOT NULL,

    CONSTRAINT "placement_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,

    CONSTRAINT "placement_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "industry" TEXT,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_drives" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "mode" "DriveMode" NOT NULL DEFAULT 'ON_CAMPUS',
    "scheduled_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_job_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "drive_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "ctc" DECIMAL(10,2),

    CONSTRAINT "drive_job_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_course_eligibilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "drive_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,

    CONSTRAINT "drive_course_eligibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_department_eligibilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "drive_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,

    CONSTRAINT "drive_department_eligibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_rounds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "drive_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "drive_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "drive_id" UUID NOT NULL,
    "student_enrollment_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',

    CONSTRAINT "placement_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "round_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "ctc" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "placement_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER,
    "fee_amount" DECIMAL(10,2),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "attended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stored_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "requires_fee" BOOLEAN NOT NULL DEFAULT false,
    "fee_amount" DECIMAL(10,2),

    CONSTRAINT "certificate_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "certificate_type_id" UUID NOT NULL,
    "student_enrollment_id" UUID NOT NULL,
    "status" "CertificateRequestStatus" NOT NULL DEFAULT 'REQUESTED',

    CONSTRAINT "certificate_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "status" "CertificateRequestStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "stored_file_id" UUID NOT NULL,

    CONSTRAINT "certificate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_members_user_id_key" ON "library_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_catalogs_isbn_key" ON "book_catalogs"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "book_copies_copy_number_key" ON "book_copies"("copy_number");

-- CreateIndex
CREATE UNIQUE INDEX "library_resolutions_library_loan_id_key" ON "library_resolutions"("library_loan_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_registrations_student_enrollment_id_key" ON "placement_registrations"("student_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_profiles_registration_id_key" ON "placement_profiles"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "placement_offers_application_id_key" ON "placement_offers"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_types_name_key" ON "event_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_event_id_user_id_key" ON "event_attendances"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_types_name_key" ON "certificate_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_documents_request_id_key" ON "certificate_documents"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_documents_stored_file_id_key" ON "certificate_documents"("stored_file_id");

-- AddForeignKey
ALTER TABLE "library_members" ADD CONSTRAINT "library_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_copies" ADD CONSTRAINT "book_copies_book_catalog_id_fkey" FOREIGN KEY ("book_catalog_id") REFERENCES "book_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_library_member_id_fkey" FOREIGN KEY ("library_member_id") REFERENCES "library_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_book_copy_id_fkey" FOREIGN KEY ("book_copy_id") REFERENCES "book_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_renewals" ADD CONSTRAINT "loan_renewals_library_loan_id_fkey" FOREIGN KEY ("library_loan_id") REFERENCES "library_loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_resolutions" ADD CONSTRAINT "library_resolutions_library_loan_id_fkey" FOREIGN KEY ("library_loan_id") REFERENCES "library_loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_reservations" ADD CONSTRAINT "library_reservations_library_member_id_fkey" FOREIGN KEY ("library_member_id") REFERENCES "library_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_reservations" ADD CONSTRAINT "library_reservations_book_catalog_id_fkey" FOREIGN KEY ("book_catalog_id") REFERENCES "book_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_registrations" ADD CONSTRAINT "placement_registrations_student_enrollment_id_fkey" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_profiles" ADD CONSTRAINT "placement_profiles_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "placement_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_skills" ADD CONSTRAINT "placement_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "placement_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_certifications" ADD CONSTRAINT "placement_certifications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "placement_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_drives" ADD CONSTRAINT "placement_drives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_job_roles" ADD CONSTRAINT "drive_job_roles_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "placement_drives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_course_eligibilities" ADD CONSTRAINT "drive_course_eligibilities_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "placement_drives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_course_eligibilities" ADD CONSTRAINT "drive_course_eligibilities_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_department_eligibilities" ADD CONSTRAINT "drive_department_eligibilities_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "placement_drives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_department_eligibilities" ADD CONSTRAINT "drive_department_eligibilities_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_rounds" ADD CONSTRAINT "drive_rounds_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "placement_drives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_applications" ADD CONSTRAINT "placement_applications_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "placement_drives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_applications" ADD CONSTRAINT "placement_applications_student_enrollment_id_fkey" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "placement_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_results" ADD CONSTRAINT "round_results_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "placement_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_offers" ADD CONSTRAINT "placement_offers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "placement_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_certificate_type_id_fkey" FOREIGN KEY ("certificate_type_id") REFERENCES "certificate_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_student_enrollment_id_fkey" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_history" ADD CONSTRAINT "certificate_history_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "certificate_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_documents" ADD CONSTRAINT "certificate_documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "certificate_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_documents" ADD CONSTRAINT "certificate_documents_stored_file_id_fkey" FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
