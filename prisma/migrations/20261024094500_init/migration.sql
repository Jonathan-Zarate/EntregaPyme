-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "CourierApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'BLOCKED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TopUpStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('TOP_UP', 'RESERVE', 'RELEASE', 'CAPTURE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_ASSIGNMENT', 'ACCEPTED', 'HEADING_TO_PICKUP', 'PICKED_UP', 'HEADING_TO_DESTINATION', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('DOCUMENT', 'SMALL', 'MEDIUM', 'LARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('AVAILABLE', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'COMMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'COMPANY',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "impersonatedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ruc" VARCHAR(11) NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "phone" VARCHAR(20),
    "pickupAddress" TEXT,
    "pickupReference" TEXT,
    "districtId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" VARCHAR(10) NOT NULL,
    "documentNumber" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "vehiclePlate" VARCHAR(10),
    "approvalStatus" "CourierApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "ubigeo" VARCHAR(6) NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRate" (
    "id" TEXT NOT NULL,
    "originDistrictId" TEXT NOT NULL,
    "destinationDistrictId" TEXT NOT NULL,
    "companyPrice" DECIMAL(12,2) NOT NULL,
    "courierPayment" DECIMAL(12,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "availableBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "reservedBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "availableAfter" DECIMAL(14,2) NOT NULL,
    "reservedAfter" DECIMAL(14,2) NOT NULL,
    "orderId" TEXT,
    "topUpId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopUp" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "operationCode" TEXT,
    "evidenceUrl" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewReason" TEXT,

    CONSTRAINT "TopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryOrder" (
    "id" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "rateId" TEXT NOT NULL,
    "assignedCourierId" TEXT,
    "assignedById" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "pickupDistrictId" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupReference" TEXT,
    "deliveryDistrictId" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryReference" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" VARCHAR(20) NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "packageDescription" TEXT,
    "observations" TEXT,
    "companyPrice" DECIMAL(12,2) NOT NULL,
    "courierPayment" DECIMAL(12,2) NOT NULL,
    "platformMargin" DECIMAL(12,2) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderOffer" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'AVAILABLE',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryEvidence" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "url" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ruc_key" ON "Company"("ruc");

-- CreateIndex
CREATE INDEX "Company_districtId_idx" ON "Company"("districtId");

-- CreateIndex
CREATE INDEX "Company_active_idx" ON "Company"("active");

-- CreateIndex
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourierProfile_userId_key" ON "CourierProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourierProfile_documentNumber_key" ON "CourierProfile"("documentNumber");

-- CreateIndex
CREATE INDEX "CourierProfile_approvalStatus_idx" ON "CourierProfile"("approvalStatus");

-- CreateIndex
CREATE INDEX "CourierProfile_reviewedById_idx" ON "CourierProfile"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "District_ubigeo_key" ON "District"("ubigeo");

-- CreateIndex
CREATE INDEX "District_department_province_name_idx" ON "District"("department", "province", "name");

-- CreateIndex
CREATE INDEX "District_active_idx" ON "District"("active");

-- CreateIndex
CREATE INDEX "DeliveryRate_originDistrictId_destinationDistrictId_active_idx" ON "DeliveryRate"("originDistrictId", "destinationDistrictId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRate_originDistrictId_destinationDistrictId_validFr_key" ON "DeliveryRate"("originDistrictId", "destinationDistrictId", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_companyId_key" ON "Wallet"("companyId");

-- CreateIndex
CREATE INDEX "Wallet_companyId_version_idx" ON "Wallet"("companyId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_idempotencyKey_key" ON "WalletTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_orderId_idx" ON "WalletTransaction"("orderId");

-- CreateIndex
CREATE INDEX "WalletTransaction_topUpId_idx" ON "WalletTransaction"("topUpId");

-- CreateIndex
CREATE INDEX "TopUp_companyId_status_requestedAt_idx" ON "TopUp"("companyId", "status", "requestedAt");

-- CreateIndex
CREATE INDEX "TopUp_reviewedById_idx" ON "TopUp"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOrder_publicCode_key" ON "DeliveryOrder"("publicCode");

-- CreateIndex
CREATE INDEX "DeliveryOrder_companyId_createdAt_idx" ON "DeliveryOrder"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryOrder_status_createdAt_idx" ON "DeliveryOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryOrder_assignedCourierId_status_idx" ON "DeliveryOrder"("assignedCourierId", "status");

-- CreateIndex
CREATE INDEX "DeliveryOrder_pickupDistrictId_deliveryDistrictId_status_idx" ON "DeliveryOrder"("pickupDistrictId", "deliveryDistrictId", "status");

-- CreateIndex
CREATE INDEX "OrderOffer_courierId_status_createdAt_idx" ON "OrderOffer"("courierId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderOffer_orderId_courierId_key" ON "OrderOffer"("orderId", "courierId");

-- CreateIndex
CREATE INDEX "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusEvent_actorId_createdAt_idx" ON "OrderStatusEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryEvidence_orderId_createdAt_idx" ON "DeliveryEvidence"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "DeliveryEvidence_courierId_createdAt_idx" ON "DeliveryEvidence"("courierId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierProfile" ADD CONSTRAINT "CourierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierProfile" ADD CONSTRAINT "CourierProfile_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRate" ADD CONSTRAINT "DeliveryRate_originDistrictId_fkey" FOREIGN KEY ("originDistrictId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRate" ADD CONSTRAINT "DeliveryRate_destinationDistrictId_fkey" FOREIGN KEY ("destinationDistrictId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DeliveryOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_topUpId_fkey" FOREIGN KEY ("topUpId") REFERENCES "TopUp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopUp" ADD CONSTRAINT "TopUp_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopUp" ADD CONSTRAINT "TopUp_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "DeliveryRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_assignedCourierId_fkey" FOREIGN KEY ("assignedCourierId") REFERENCES "CourierProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_pickupDistrictId_fkey" FOREIGN KEY ("pickupDistrictId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_deliveryDistrictId_fkey" FOREIGN KEY ("deliveryDistrictId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOffer" ADD CONSTRAINT "OrderOffer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DeliveryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOffer" ADD CONSTRAINT "OrderOffer_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "CourierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DeliveryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryEvidence" ADD CONSTRAINT "DeliveryEvidence_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DeliveryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryEvidence" ADD CONSTRAINT "DeliveryEvidence_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "CourierProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryEvidence" ADD CONSTRAINT "DeliveryEvidence_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain checks that Prisma cannot express in schema.prisma.
ALTER TABLE "User"
  ADD CONSTRAINT "User_role_check" CHECK ("role" IN ('ADMIN', 'COMPANY', 'COURIER'));

ALTER TABLE "Company"
  ADD CONSTRAINT "Company_ruc_check" CHECK ("ruc" ~ '^[0-9]{11}$');

ALTER TABLE "DeliveryRate"
  ADD CONSTRAINT "DeliveryRate_amounts_check" CHECK (
    "companyPrice" >= 0 AND
    "courierPayment" >= 0 AND
    "companyPrice" >= "courierPayment"
  ),
  ADD CONSTRAINT "DeliveryRate_validity_check" CHECK (
    "validUntil" IS NULL OR "validUntil" > "validFrom"
  );

ALTER TABLE "Wallet"
  ADD CONSTRAINT "Wallet_balances_check" CHECK (
    "availableBalance" >= 0 AND "reservedBalance" >= 0
  );

ALTER TABLE "WalletTransaction"
  ADD CONSTRAINT "WalletTransaction_amounts_check" CHECK (
    "amount" > 0 AND "availableAfter" >= 0 AND "reservedAfter" >= 0
  );

ALTER TABLE "TopUp"
  ADD CONSTRAINT "TopUp_amount_check" CHECK ("amount" > 0);

ALTER TABLE "DeliveryOrder"
  ADD CONSTRAINT "DeliveryOrder_amounts_check" CHECK (
    "companyPrice" >= 0 AND
    "courierPayment" >= 0 AND
    "platformMargin" >= 0 AND
    "companyPrice" = "courierPayment" + "platformMargin"
  );

ALTER TABLE "DeliveryEvidence"
  ADD CONSTRAINT "DeliveryEvidence_payload_check" CHECK (
    ("type" = 'PHOTO' AND "url" IS NOT NULL) OR
    ("type" = 'COMMENT' AND "comment" IS NOT NULL)
  );

-- Guard the state machine even if a caller bypasses the application layer.
CREATE OR REPLACE FUNCTION validate_delivery_order_transition()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'DRAFT' AND NEW.status IN ('PENDING_ASSIGNMENT', 'CANCELLED')) OR
    (OLD.status = 'PENDING_ASSIGNMENT' AND NEW.status IN ('ACCEPTED', 'CANCELLED')) OR
    (OLD.status = 'ACCEPTED' AND NEW.status IN ('HEADING_TO_PICKUP', 'CANCELLED')) OR
    (OLD.status = 'HEADING_TO_PICKUP' AND NEW.status IN ('PICKED_UP', 'CANCELLED')) OR
    (OLD.status = 'PICKED_UP' AND NEW.status = 'HEADING_TO_DESTINATION') OR
    (OLD.status = 'HEADING_TO_DESTINATION' AND NEW.status = 'DELIVERED')
  ) THEN
    RAISE EXCEPTION 'Invalid delivery order transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'PENDING_ASSIGNMENT' AND NEW."confirmedAt" IS NULL THEN
    RAISE EXCEPTION 'A confirmed order requires confirmedAt'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'ACCEPTED' AND NEW."assignedCourierId" IS NULL THEN
    RAISE EXCEPTION 'An accepted order requires an assigned courier'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'CANCELLED' AND NULLIF(BTRIM(NEW."cancellationReason"), '') IS NULL THEN
    RAISE EXCEPTION 'A cancelled order requires a reason'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'DELIVERED' AND NOT EXISTS (
    SELECT 1 FROM "DeliveryEvidence" evidence WHERE evidence."orderId" = NEW.id
  ) THEN
    RAISE EXCEPTION 'A delivered order requires evidence'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "DeliveryOrder_validate_transition"
BEFORE UPDATE OF "status" ON "DeliveryOrder"
FOR EACH ROW EXECUTE FUNCTION validate_delivery_order_transition();
