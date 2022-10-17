
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."Match" add column "table_num" integer
--  null;

alter table "public"."MatchPlayer" alter column "tournament_points" set not null;

alter table "public"."MatchPlayer" alter column "points" set not null;

alter table "public"."MatchPlayer" alter column "win" set not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."MatchPlayer" add column "player_name" text
--  null;

alter table "public"."MatchPlayer" alter column "user_id" set not null;
