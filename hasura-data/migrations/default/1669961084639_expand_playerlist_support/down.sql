
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- UPDATE "public"."Faction" SET "image" = E'images/armada/cis.png' WHERE "key" = E'ARMADA_SEPARATIST';
-- UPDATE "public"."Faction" SET "image" = E'images/armada/gar.png' WHERE "key" = E'ARMADA_REPUBLIC';
-- UPDATE "public"."Faction" SET "image" = E'images/armada/empire.png' WHERE "key" = E'ARMADA_EMPIRE';
-- UPDATE "public"."Faction" SET "image" = E'images/armada/rebels.png' WHERE "key" = E'ARMADA_REBELS';

alter table "public"."Entity" drop constraint "Entity_faction_fkey";

alter table "public"."PlayerList" drop constraint "PlayerList_faction_fkey";


DELETE FROM "public"."Faction" WHERE "key" = 'XWING_RESISTANCE';

DELETE FROM "public"."Faction" WHERE "key" = 'XWING_FIRST_ORDER';

DELETE FROM "public"."Faction" WHERE "key" = 'XWING_SCUM';

DELETE FROM "public"."Faction" WHERE "key" = 'XWING_SEPARATIST';

DELETE FROM "public"."Faction" WHERE "key" = 'XWING_REPUBLIC';

DELETE FROM "public"."Faction" WHERE "key" = 'XWING_EMPIRE';

DELETE FROM "public"."Faction" WHERE "key" = 'XWING_REBELS';

DELETE FROM "public"."Faction" WHERE "key" = 'LEGION_MERCENARY';

DELETE FROM "public"."Faction" WHERE "key" = 'LEGION_SEPARATIST';

DELETE FROM "public"."Faction" WHERE "key" = 'LEGION_REPUBLIC';

DELETE FROM "public"."Faction" WHERE "key" = 'LEGION_EMPIRE';

DELETE FROM "public"."Faction" WHERE "key" = 'LEGION_REBELS';

DELETE FROM "public"."Faction" WHERE "key" = 'ARMADA_SEPARATIST';

DELETE FROM "public"."Faction" WHERE "key" = 'ARMADA_REPUBLIC';

DELETE FROM "public"."Faction" WHERE "key" = 'ARMADA_EMPIRE';

DELETE FROM "public"."Faction" WHERE "key" = 'ARMADA_REBELS';

DROP TABLE "public"."Faction";


alter table "public"."PlayerList" drop constraint "PlayerList_match_player_id_key";

alter table "public"."PlayerList" drop constraint "PlayerList_tournament_player_id_key";

alter table "public"."PlayerList" drop constraint "PlayerList_match_player_id_fkey";

alter table "public"."PlayerList" drop constraint "PlayerList_tournament_player_id_fkey";

alter table "public"."MatchPlayer"
  add constraint "MatchPlayer_participant_list_id_fkey"
  foreign key (participant_list_id)
  references "public"."PlayerList"
  (id) on update restrict on delete restrict;
alter table "public"."MatchPlayer" alter column "participant_list_id" drop not null;
alter table "public"."MatchPlayer" add column "participant_list_id" uuid;

alter table "public"."TournamentPlayer"
  add constraint "TournamentPlayer_player_list_id_fkey"
  foreign key (player_list_id)
  references "public"."PlayerList"
  (id) on update restrict on delete restrict;
alter table "public"."TournamentPlayer" alter column "player_list_id" drop not null;
alter table "public"."TournamentPlayer" add column "player_list_id" uuid;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."PlayerList" add column "match_player_id" uuid
--  null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."PlayerList" add column "tournament_player_id" uuid
--  null;

alter table "public"."PlayerList" rename column "raw" to "import_url";
