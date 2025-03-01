-- CreateTable
CREATE TABLE "PollResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentSessionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PollResponse_studentSessionId_sessionId_key" ON "PollResponse"("studentSessionId", "sessionId");

-- AddForeignKey
ALTER TABLE "PollResponse" ADD CONSTRAINT "PollResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResponse" ADD CONSTRAINT "PollResponse_studentSessionId_fkey" FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
