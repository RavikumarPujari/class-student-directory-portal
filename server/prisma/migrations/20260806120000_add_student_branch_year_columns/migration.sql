-- Add missing columns to synchronize the students table with schema.prisma.
-- These columns existed in the Prisma schema but the migration to add them
-- was never generated/applied, causing P2022 "column does not exist" → 500.

-- branch and year are required (NOT NULL). Existing rows are backfilled with
-- safe defaults so the ALTER TABLE succeeds without dropping data.
ALTER TABLE "students" ADD COLUMN "branch" TEXT NOT NULL DEFAULT 'CSE';
ALTER TABLE "students" ADD COLUMN "year" TEXT NOT NULL DEFAULT '1st Year';

-- Record last successful student login timestamp; nullable.
ALTER TABLE "students" ADD COLUMN "last_login_at" TIMESTAMP(3);

