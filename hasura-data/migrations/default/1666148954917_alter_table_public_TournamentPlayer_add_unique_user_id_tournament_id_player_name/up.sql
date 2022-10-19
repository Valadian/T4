alter table "public"."TournamentPlayer" add constraint "TournamentPlayer_user_id_tournament_id_player_name_key" unique ("user_id", "tournament_id", "player_name");
