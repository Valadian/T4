
alter table "public"."MatchPlayer" drop constraint "MatchPlayer_tournament_opponent_id_fkey";

alter table "public"."MatchPlayer" drop constraint "MatchPlayer_tournament_player_id_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."MatchPlayer" add column "tournament_opponent_id" uuid
--  null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."MatchPlayer" add column "tournament_player_id" uuid
--  null;

