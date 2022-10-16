
CREATE TABLE "public"."TournamentRound" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "tournament_id" uuid NOT NULL, "round_num" Numeric NOT NULL, "description" text NOT NULL DEFAULT ' ', PRIMARY KEY ("id") , FOREIGN KEY ("tournament_id") REFERENCES "public"."Tournament"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."Match" drop constraint "Match_tournament_id_fkey";

alter table "public"."Match" rename column "tournament_id" to "round_id";

alter table "public"."Match"
  add constraint "Match_round_id_fkey"
  foreign key ("round_id")
  references "public"."TournamentRound"
  ("id") on update restrict on delete restrict;
