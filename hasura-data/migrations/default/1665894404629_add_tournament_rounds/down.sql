
alter table "public"."Match" drop constraint "Match_round_id_fkey";

alter table "public"."Match" rename column "round_id" to "tournament_id";

alter table "public"."Match"
  add constraint "Match_tournament_id_fkey"
  foreign key ("tournament_id")
  references "public"."Tournament"
  ("id") on update restrict on delete restrict;

DROP TABLE "public"."TournamentRound";
