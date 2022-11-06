
CREATE TABLE "public"."UserPreferences" ("player_name" text, "club" text, "location" text, "user_id" text NOT NULL, PRIMARY KEY ("user_id") , FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON UPDATE restrict ON DELETE cascade);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
