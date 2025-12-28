CREATE TYPE "public"."org_role" AS ENUM('owner', 'admin', 'developer');--> statement-breakpoint
CREATE TABLE "org" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "org_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "org_role" NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_user_unique" UNIQUE("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_org_slug_unique" UNIQUE("org_id","slug")
);
--> statement-breakpoint
ALTER TABLE "org_member" ADD CONSTRAINT "org_member_org_id_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_member" ADD CONSTRAINT "org_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_org_id_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_member_user_idx" ON "org_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_member_org_idx" ON "org_member" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "project_org_idx" ON "project" USING btree ("org_id");