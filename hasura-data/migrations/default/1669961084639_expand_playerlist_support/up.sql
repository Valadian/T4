

alter table "public"."PlayerList" rename column "import_url" to "raw";

alter table "public"."PlayerList" add column "tournament_player_id" uuid
 null;

alter table "public"."PlayerList" add column "match_player_id" uuid
 null;

alter table "public"."TournamentPlayer" drop column "player_list_id" cascade;

alter table "public"."MatchPlayer" drop column "participant_list_id" cascade;

alter table "public"."PlayerList"
  add constraint "PlayerList_tournament_player_id_fkey"
  foreign key ("tournament_player_id")
  references "public"."TournamentPlayer"
  ("id") on update restrict on delete cascade;

alter table "public"."PlayerList"
  add constraint "PlayerList_match_player_id_fkey"
  foreign key ("match_player_id")
  references "public"."MatchPlayer"
  ("id") on update restrict on delete cascade;

alter table "public"."PlayerList" add constraint "PlayerList_tournament_player_id_key" unique ("tournament_player_id");

alter table "public"."PlayerList" add constraint "PlayerList_match_player_id_key" unique ("match_player_id");


CREATE TABLE "public"."Faction" ("key" text NOT NULL, "name" text NOT NULL, "game" text NOT NULL, "image" text, "acronym" text NOT NULL, PRIMARY KEY ("key") , FOREIGN KEY ("game") REFERENCES "public"."Game"("key") ON UPDATE restrict ON DELETE restrict, UNIQUE ("key"));

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'ARMADA_REBELS', E'Rebellion', E'STAR_WARS_ARMADA', null, E'REB');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'ARMADA_EMPIRE', E'Empire', E'STAR_WARS_ARMADA', null, E'IMP');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'ARMADA_REPUBLIC', E'Republic', E'STAR_WARS_ARMADA', null, E'GAR');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'ARMADA_SEPARATIST', E'Separatists', E'STAR_WARS_ARMADA', null, E'CIS');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'LEGION_REBELS', E'Rebellion', E'STAR_WARS_LEGION', null, E'REB');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'LEGION_EMPIRE', E'Empire', E'STAR_WARS_LEGION', null, E'IMP');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'LEGION_REPUBLIC', E'Republic', E'STAR_WARS_LEGION', null, E'GAR');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'LEGION_SEPARATIST', E'Separatists', E'STAR_WARS_LEGION', null, E'CIS');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'LEGION_MERCENARY', E'Mercenaries', E'STAR_WARS_LEGION', null, E'MER');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_REBELS', E'Rebellion', E'STAR_WARS_XWING', null, E'REB');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_EMPIRE', E'Empire', E'STAR_WARS_XWING', null, E'IMP');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_REPUBLIC', E'Republic', E'STAR_WARS_XWING', null, E'GAR');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_SEPARATIST', E'Separatists', E'STAR_WARS_XWING', null, E'CIS');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_SCUM', E'Scum', E'STAR_WARS_XWING', null, E'SCU');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_FIRST_ORDER', E'First Order', E'STAR_WARS_XWING', null, E'FO');

INSERT INTO "public"."Faction"("key", "name", "game", "image", "acronym") VALUES (E'XWING_RESISTANCE', E'Resistance', E'STAR_WARS_XWING', null, E'RES');

alter table "public"."PlayerList"
  add constraint "PlayerList_faction_fkey"
  foreign key ("faction")
  references "public"."Faction"
  ("key") on update restrict on delete restrict;

alter table "public"."Entity"
  add constraint "Entity_faction_fkey"
  foreign key ("faction")
  references "public"."Faction"
  ("key") on update restrict on delete restrict;

UPDATE "public"."Faction" SET "image" = E'/images/armada/cis.png' WHERE "key" = E'ARMADA_SEPARATIST';
UPDATE "public"."Faction" SET "image" = E'/images/armada/gar.png' WHERE "key" = E'ARMADA_REPUBLIC';
UPDATE "public"."Faction" SET "image" = E'/images/armada/empire.png' WHERE "key" = E'ARMADA_EMPIRE';
UPDATE "public"."Faction" SET "image" = E'/images/armada/rebels.png' WHERE "key" = E'ARMADA_REBELS';

UPDATE "public"."Faction" SET "image" = E'/images/legion/cis.png' WHERE "key" = E'LEGION_SEPARATIST';
UPDATE "public"."Faction" SET "image" = E'/images/legion/gar.png' WHERE "key" = E'LEGION_REPUBLIC';
UPDATE "public"."Faction" SET "image" = E'/images/legion/empire.png' WHERE "key" = E'LEGION_EMPIRE';
UPDATE "public"."Faction" SET "image" = E'/images/legion/rebels.png' WHERE "key" = E'LEGION_REBELS';
UPDATE "public"."Faction" SET "image" = E'/images/legion/merc.png' WHERE "key" = E'LEGION_MERCENARY';

UPDATE "public"."Faction" SET "image" = E'/images/xwing/cis.png' WHERE "key" = E'XWING_SEPARATIST';
UPDATE "public"."Faction" SET "image" = E'/images/xwing/gar.png' WHERE "key" = E'XWING_REPUBLIC';
UPDATE "public"."Faction" SET "image" = E'/images/xwing/empire.png' WHERE "key" = E'XWING_EMPIRE';
UPDATE "public"."Faction" SET "image" = E'/images/xwing/rebels.png' WHERE "key" = E'XWING_REBELS';
UPDATE "public"."Faction" SET "image" = E'/images/xwing/first_order.png' WHERE "key" = E'XWING_FIRST_ORDER';
UPDATE "public"."Faction" SET "image" = E'/images/xwing/resistance.png' WHERE "key" = E'XWING_RESISTANCE';
UPDATE "public"."Faction" SET "image" = E'/images/xwing/scum.png' WHERE "key" = E'XWING_SCUM';
