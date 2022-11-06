
CREATE TABLE "public"."UserPreferences" ("player_name" text, "club" text, "location" text, "id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON UPDATE restrict ON DELETE cascade);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."UserPreferences" add constraint "UserPreferences_user_id_key" unique ("user_id");

BEGIN TRANSACTION;
ALTER TABLE "public"."UserPreferences" DROP CONSTRAINT "UserPreferences_pkey";

ALTER TABLE "public"."UserPreferences"
    ADD CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("user_id");
COMMIT TRANSACTION;

alter table "public"."UserPreferences" drop column "id" cascade;
