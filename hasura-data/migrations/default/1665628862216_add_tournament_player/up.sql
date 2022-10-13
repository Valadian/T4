
alter table "public"."TournamentPlayer" add column "player_name" text
 null;

alter table "public"."TournamentPlayer" alter column "user_id" drop not null;

alter table "public"."TournamentPlayer" alter column "player_list_id" drop not null;
