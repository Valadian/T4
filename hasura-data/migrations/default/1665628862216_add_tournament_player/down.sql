
alter table "public"."TournamentPlayer" alter column "player_list_id" set not null;

alter table "public"."TournamentPlayer" alter column "user_id" set not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."TournamentPlayer" add column "player_name" text
--  null;
