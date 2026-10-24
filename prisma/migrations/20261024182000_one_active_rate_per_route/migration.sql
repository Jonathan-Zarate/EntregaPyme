CREATE UNIQUE INDEX "DeliveryRate_one_active_per_route"
ON "DeliveryRate" ("originDistrictId", "destinationDistrictId")
WHERE "active" = true;
