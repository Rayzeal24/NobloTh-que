ALTER TABLE "User" ADD COLUMN "usernameKey" TEXT;

CREATE UNIQUE INDEX "User_usernameKey_key" ON "User"("usernameKey");
