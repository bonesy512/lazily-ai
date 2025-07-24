CREATE TABLE "credit_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"credits_purchased" integer NOT NULL,
	"amount_paid" integer,
	"stripe_checkout_session_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_purchases_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "lot";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "block";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "addition";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "county";