CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"address" varchar(255) NOT NULL,
	"property_type" varchar(50),
	"sale_price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;