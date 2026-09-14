-- CreateEnum
CREATE TYPE "TeamApprovalStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "approval_status" "TeamApprovalStatus" NOT NULL DEFAULT 'APPROVED';
