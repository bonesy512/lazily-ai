ALTER TABLE "contracts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ALTER COLUMN "listing_firm_name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ALTER COLUMN "listing_firm_license_no" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ALTER COLUMN "listing_associate_name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ALTER COLUMN "listing_associate_license_no" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ALTER COLUMN "escrow_agent_name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "listing_associate_email" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "listing_associate_phone" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "listing_supervisor_name" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "listing_supervisor_license_no" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "listing_broker_address" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "other_firm_name" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "other_firm_license_no" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "other_associate_name" varchar;--> statement-breakpoint
ALTER TABLE "team_contract_defaults" ADD COLUMN "other_associate_license_no" varchar;