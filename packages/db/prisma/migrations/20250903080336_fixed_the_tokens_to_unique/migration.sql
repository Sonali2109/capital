/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_token_key" ON "public"."Transaction"("token");
