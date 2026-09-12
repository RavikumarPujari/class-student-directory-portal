-- CreateTable
CREATE TABLE "team_messages" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_messages_team_id_idx" ON "team_messages"("team_id");

-- CreateIndex
CREATE INDEX "team_messages_created_at_idx" ON "team_messages"("created_at");

-- AddForeignKey
ALTER TABLE "team_messages" ADD CONSTRAINT "team_messages_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_messages" ADD CONSTRAINT "team_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
