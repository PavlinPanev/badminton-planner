CREATE TABLE "group_invitations" (
  "id" serial PRIMARY KEY NOT NULL,
  "group_id" integer NOT NULL,
  "invite_code" varchar(96) NOT NULL,
  "used_at" timestamp with time zone,
  "user_id" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "group_invitations" ADD CONSTRAINT "group_invitations_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "group_invitations" ADD CONSTRAINT "group_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "group_invitations_invite_code_idx" ON "group_invitations" USING btree ("invite_code");
--> statement-breakpoint
CREATE INDEX "group_invitations_group_id_idx" ON "group_invitations" USING btree ("group_id");
--> statement-breakpoint
CREATE INDEX "group_invitations_user_id_idx" ON "group_invitations" USING btree ("user_id");
