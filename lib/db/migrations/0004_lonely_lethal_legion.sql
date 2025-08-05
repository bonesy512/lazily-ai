ALTER TABLE "contracts" DROP CONSTRAINT "contracts_property_id_properties_id_fk";
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "contract_data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "status" varchar(50) DEFAULT 'pending_generation';--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN "property_id";