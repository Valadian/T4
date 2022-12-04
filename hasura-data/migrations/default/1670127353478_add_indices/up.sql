
CREATE  INDEX "TournamentPlayer_tournament_id_fkey" on
  "public"."TournamentPlayer" using hash ("tournament_id");

CREATE  INDEX "TournamentRound_tournament_id_fkey" on
  "public"."TournamentRound" using hash ("tournament_id");

CREATE  INDEX "Match_round_id_fkey" on
  "public"."Match" using hash ("round_id");

CREATE  INDEX "MatchPlayer_match_id_fkey" on
  "public"."MatchPlayer" using hash ("match_id");
