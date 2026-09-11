-- Add the missing "semester" column to the students table.
-- schema.prisma requires it (Int, NOT NULL) but no prior migration added it,
-- causing Prisma P2022 "column does not exist" → 500 on any student query.
-- Existing rows are backfilled with a safe default (1) so the ALTER succeeds.

ALTER TABLE "students" ADD COLUMN "semester" INTEGER NOT NULL DEFAULT 1;
