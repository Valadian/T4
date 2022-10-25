alter table "public"."MatchPlayer" drop constraint "MatchPlayer_match_id_fkey",
  add constraint "MatchPlayer_match_id_fkey"
  foreign key ("match_id")
  references "public"."Match"
  ("id") on update restrict on delete cascade;
