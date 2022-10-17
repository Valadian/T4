
alter table "public"."MatchPlayer" alter column "user_id" drop not null;

alter table "public"."MatchPlayer" add column "player_name" text
 null;

alter table "public"."MatchPlayer" alter column "win" drop not null;

alter table "public"."MatchPlayer" alter column "points" drop not null;

alter table "public"."MatchPlayer" alter column "tournament_points" drop not null;

alter table "public"."Match" add column "table_num" integer
 null;
