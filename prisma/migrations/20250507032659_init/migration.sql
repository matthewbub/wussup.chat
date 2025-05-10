-- CreateTable
CREATE TABLE "ChatHistory" (
    "userId" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("userId")
);
