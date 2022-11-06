
alter table "public"."UserPreferences" alter column "id" set default gen_random_uuid();
alter table "public"."UserPreferences" alter column "id" drop not null;
alter table "public"."UserPreferences" add column "id" uuid;

alter table "public"."UserPreferences" drop constraint "UserPreferences_pkey";
alter table "public"."UserPreferences"
    add constraint "UserPreferences_pkey"
    primary key ("id");

alter table "public"."UserPreferences" drop constraint "UserPreferences_user_id_key";

DROP TABLE "public"."UserPreferences";
