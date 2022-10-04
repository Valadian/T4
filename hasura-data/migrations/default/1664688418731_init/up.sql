SET check_function_bodies = false;
CREATE TABLE public."Entity" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    cost integer,
    faction text,
    type text NOT NULL
);
CREATE TABLE public."EntityUpgrade" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    cost integer,
    faction text,
    type text,
    entity_id uuid NOT NULL
);
CREATE TABLE public."Game" (
    value text NOT NULL,
    key text NOT NULL
);
INSERT INTO public."Game" VALUES ("Star Wars: Armada","STAR_WARS_ARMADA")
CREATE TABLE public."Match" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    tournament_id uuid
);
CREATE TABLE public."MatchPlayer" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    win boolean NOT NULL,
    points integer NOT NULL,
    tournament_points integer NOT NULL,
    match_id uuid NOT NULL,
    participant_list_id uuid,
    confirmed boolean DEFAULT false NOT NULL
);
CREATE TABLE public."PlayerList" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    faction text,
    import_url text
);
CREATE TABLE public."PlayerListEntity" (
    player_list_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    count integer,
    id uuid DEFAULT public.gen_random_uuid() NOT NULL
);
CREATE TABLE public."ScoringRuleset" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    game text NOT NULL
);
CREATE TABLE public."Tournament" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    start date NOT NULL,
    "end" date,
    creator_id text NOT NULL,
    scoring_ruleset_id uuid,
    lists_visible boolean DEFAULT true NOT NULL,
    lists_locked boolean DEFAULT false NOT NULL,
    ladder_visible boolean DEFAULT true NOT NULL,
    signups_open boolean DEFAULT true NOT NULL,
    game text,
    public boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);
CREATE TABLE public."TournamentPlayer" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    player_list_id uuid NOT NULL,
    tournament_id uuid NOT NULL,
    rank integer,
    win integer DEFAULT 0 NOT NULL,
    loss integer DEFAULT 0 NOT NULL,
    tournament_points integer DEFAULT 0 NOT NULL,
    mov integer DEFAULT 0 NOT NULL,
    sos numeric DEFAULT '0'::numeric NOT NULL,
    club text,
    "group" text
);
CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    username text,
    picture text,
    nickname text
);
ALTER TABLE ONLY public."EntityUpgrade"
    ADD CONSTRAINT "EntityUpgrade_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_key_key" UNIQUE (key);
ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (key);
ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."PlayerList"
    ADD CONSTRAINT "ParticipantList_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."PlayerListEntity"
    ADD CONSTRAINT "PlayerListEntity_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ScoringRuleset"
    ADD CONSTRAINT "ScoringRuleset_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."TournamentPlayer"
    ADD CONSTRAINT "TournamentPlayer_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Tournament"
    ADD CONSTRAINT "Tournament_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."EntityUpgrade"
    ADD CONSTRAINT "EntityUpgrade_entity_id_fkey" FOREIGN KEY (entity_id) REFERENCES public."Entity"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_match_id_fkey" FOREIGN KEY (match_id) REFERENCES public."Match"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_participant_list_id_fkey" FOREIGN KEY (participant_list_id) REFERENCES public."PlayerList"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_tournament_id_fkey" FOREIGN KEY (tournament_id) REFERENCES public."Tournament"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."PlayerListEntity"
    ADD CONSTRAINT "PlayerListEntity_entity_id_fkey" FOREIGN KEY (entity_id) REFERENCES public."Entity"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."PlayerListEntity"
    ADD CONSTRAINT "PlayerListEntity_player_list_id_fkey" FOREIGN KEY (player_list_id) REFERENCES public."PlayerList"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ScoringRuleset"
    ADD CONSTRAINT "ScoringRuleset_game_fkey" FOREIGN KEY (game) REFERENCES public."Game"(key) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TournamentPlayer"
    ADD CONSTRAINT "TournamentPlayer_player_list_id_fkey" FOREIGN KEY (player_list_id) REFERENCES public."PlayerList"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TournamentPlayer"
    ADD CONSTRAINT "TournamentPlayer_tournament_id_fkey" FOREIGN KEY (tournament_id) REFERENCES public."Tournament"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TournamentPlayer"
    ADD CONSTRAINT "TournamentPlayer_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Tournament"
    ADD CONSTRAINT "Tournament_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public."User"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Tournament"
    ADD CONSTRAINT "Tournament_game_fkey" FOREIGN KEY (game) REFERENCES public."Game"(key) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Tournament"
    ADD CONSTRAINT "Tournament_scoring_ruleset_id_fkey" FOREIGN KEY (scoring_ruleset_id) REFERENCES public."ScoringRuleset"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
