
alter table "public"."MatchPlayer" add column "tournament_player_id" uuid
 null;

alter table "public"."MatchPlayer" add column "tournament_opponent_id" uuid
 null;

alter table "public"."MatchPlayer"
  add constraint "MatchPlayer_tournament_player_id_fkey"
  foreign key ("tournament_player_id")
  references "public"."TournamentPlayer"
  ("id") on update restrict on delete cascade;

alter table "public"."MatchPlayer"
  add constraint "MatchPlayer_tournament_opponent_id_fkey"
  foreign key ("tournament_opponent_id")
  references "public"."TournamentPlayer"
  ("id") on update restrict on delete cascade;
