-- A transfer operation code can only fund one top-up for the same company.
CREATE UNIQUE INDEX "TopUp_companyId_operationCode_key"
ON "TopUp"("companyId", "operationCode");
