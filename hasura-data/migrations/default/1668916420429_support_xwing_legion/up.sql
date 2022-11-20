

alter table "public"."MatchPlayer" add column "draw" boolean
 null;

INSERT INTO "public"."Game"("value", "key") VALUES (E'Star Wars: X-Wing', E'STAR_WARS_XWING');

INSERT INTO "public"."ScoringRuleset"("id", "name", "game") VALUES (E'22ca1085-2ac0-441a-a1eb-8d51effed2fd', E'800pt Battle Points', E'STAR_WARS_LEGION');

INSERT INTO "public"."ScoringRuleset"("id", "name", "game") VALUES (E'e436322e-5272-4b9d-906e-0f14d4ed0f56', E'20pt Hotshot', E'STAR_WARS_XWING');

ALTER TABLE "public"."MatchPlayer" ALTER COLUMN "mov" TYPE numeric;

ALTER TABLE "public"."TournamentPlayer" ALTER COLUMN "mov" TYPE numeric;

CREATE TABLE "public"."UserGamePreferences" ("user_id" text NOT NULL, "game" text NOT NULL, "id" uuid NOT NULL DEFAULT gen_random_uuid(), PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("game") REFERENCES "public"."Game"("key") ON UPDATE restrict ON DELETE cascade);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."UserGamePreferences"
  add constraint "UserGamePreferences_user_id_fkey2"
  foreign key ("user_id")
  references "public"."UserPreferences"
  ("user_id") on update restrict on delete cascade;

alter table "public"."UserGamePreferences" drop constraint "UserGamePreferences_user_id_fkey2";

alter table "public"."UserGamePreferences" add constraint "UserGamePreferences_user_id_game_key" unique ("user_id", "game");
