-- Make linkedin and github columns nullable to match schema.prisma.
-- schema.prisma defines them as String? but the init migration created them as NOT NULL.
ALTER TABLE "students" ALTER COLUMN "linkedin" DROP NOT NULL;
ALTER TABLE "students" ALTER COLUMN "github" DROP NOT NULL;