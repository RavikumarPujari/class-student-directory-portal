/*
  Warnings:

  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TEAM_INVITATION', 'INVITATION_ACCEPTED', 'INVITATION_DECLINED', 'TEAM_MEMBER_JOINED', 'TEAM_MESSAGE');

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");
