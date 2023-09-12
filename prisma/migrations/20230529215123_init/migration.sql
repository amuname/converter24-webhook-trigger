-- CreateTable
CREATE TABLE "Script" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "scriptJSON" JSONB NOT NULL,
    "accountId" INTEGER NOT NULL,
    "configId" INTEGER NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptConfig" (
    "id" SERIAL NOT NULL,
    "allowedMethods" TEXT[],
    "requiredHeaders" TEXT[],
    "waitForScriptEnd" BOOLEAN NOT NULL,

    CONSTRAINT "ScriptConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Script_configId_key" ON "Script"("configId");

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ScriptConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
