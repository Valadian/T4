
alter table "public"."UserGamePreferences" drop constraint "UserGamePreferences_user_id_game_key";

alter table "public"."UserGamePreferences"
  add constraint "UserGamePreferences_user_id_fkey2"
  foreign key ("user_id")
  references "public"."UserPreferences"
  ("user_id") on update restrict on delete cascade;

alter table "public"."UserGamePreferences" drop constraint "UserGamePreferences_user_id_fkey2";

DROP TABLE "public"."UserGamePreferences";


ALTER TABLE "public"."TournamentPlayer" ALTER COLUMN "mov" TYPE integer;

ALTER TABLE "public"."MatchPlayer" ALTER COLUMN "mov" TYPE integer;

DELETE FROM "public"."ScoringRuleset" WHERE "id" = 'e436322e-5272-4b9d-906e-0f14d4ed0f56';

DELETE FROM "public"."ScoringRuleset" WHERE "id" = '22ca1085-2ac0-441a-a1eb-8d51effed2fd';

DELETE FROM "public"."Game" WHERE "key" = ' STAR_WARS_XWING';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."MatchPlayer" add column "draw" boolean
--  null;
