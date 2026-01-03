


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  begin
    insert into public.profiles (id, email, display_name)
    values (new.id, new.email, split_part(new.email, '@', 1));
    return new;
  end;
  $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  begin
    return exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    );
  end;
  $$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."brackets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tournament_id" "uuid" NOT NULL,
    "name" "text",
    "is_public" boolean DEFAULT true NOT NULL,
    "final_winner_games" integer,
    "final_loser_games" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "brackets_final_loser_games_check" CHECK ((("final_loser_games" >= 0) AND ("final_loser_games" <= 3))),
    CONSTRAINT "brackets_final_winner_games_check" CHECK ((("final_winner_games" >= 1) AND ("final_winner_games" <= 4)))
);


ALTER TABLE "public"."brackets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."picks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bracket_id" "uuid" NOT NULL,
    "round" integer NOT NULL,
    "match_position" integer NOT NULL,
    "winner_seed" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."picks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tournament_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "seed" integer NOT NULL,
    "ifpa_id" integer,
    "matchplay_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "email" "text",
    "is_admin" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tournament_id" "uuid" NOT NULL,
    "round" integer NOT NULL,
    "match_position" integer NOT NULL,
    "winner_seed" integer NOT NULL,
    "loser_seed" integer NOT NULL,
    "winner_games" integer,
    "loser_games" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournaments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "state" "text" NOT NULL,
    "year" integer NOT NULL,
    "lock_date" timestamp with time zone NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "player_count" integer DEFAULT 24 NOT NULL,
    "status" "text" DEFAULT 'upcoming'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "timezone" "text" DEFAULT 'America/New_York'::"text" NOT NULL,
    "scoring_config" "jsonb" DEFAULT '{"semis": 4, "finals": 5, "opening": 1, "quarters": 3, "round_of_16": 2}'::"jsonb" NOT NULL,
    "matchplay_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tournaments_status_check" CHECK (("status" = ANY (ARRAY['upcoming'::"text", 'in_progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."tournaments" OWNER TO "postgres";


ALTER TABLE ONLY "public"."brackets"
    ADD CONSTRAINT "brackets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brackets"
    ADD CONSTRAINT "brackets_user_id_tournament_id_key" UNIQUE ("user_id", "tournament_id");



ALTER TABLE ONLY "public"."picks"
    ADD CONSTRAINT "picks_bracket_id_round_match_position_key" UNIQUE ("bracket_id", "round", "match_position");



ALTER TABLE ONLY "public"."picks"
    ADD CONSTRAINT "picks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_tournament_id_seed_key" UNIQUE ("tournament_id", "seed");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_tournament_id_round_match_position_key" UNIQUE ("tournament_id", "round", "match_position");



ALTER TABLE ONLY "public"."tournaments"
    ADD CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_brackets_tournament" ON "public"."brackets" USING "btree" ("tournament_id");



CREATE INDEX "idx_brackets_user" ON "public"."brackets" USING "btree" ("user_id");



CREATE INDEX "idx_picks_bracket" ON "public"."picks" USING "btree" ("bracket_id");



CREATE INDEX "idx_players_tournament" ON "public"."players" USING "btree" ("tournament_id");



CREATE INDEX "idx_results_tournament" ON "public"."results" USING "btree" ("tournament_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."brackets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."results" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."tournaments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."brackets"
    ADD CONSTRAINT "brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."brackets"
    ADD CONSTRAINT "brackets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."picks"
    ADD CONSTRAINT "picks_bracket_id_fkey" FOREIGN KEY ("bracket_id") REFERENCES "public"."brackets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can do everything with tournaments" ON "public"."tournaments" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage players" ON "public"."players" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage results" ON "public"."results" USING ("public"."is_admin"());



CREATE POLICY "Anyone can view active tournaments" ON "public"."tournaments" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view picks from public brackets" ON "public"."picks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."brackets"
  WHERE (("brackets"."id" = "picks"."bracket_id") AND ("brackets"."is_public" = true)))));



CREATE POLICY "Anyone can view players" ON "public"."players" FOR SELECT USING (true);



CREATE POLICY "Anyone can view profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Anyone can view public brackets" ON "public"."brackets" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Anyone can view results" ON "public"."results" FOR SELECT USING (true);



CREATE POLICY "Users can create brackets before lock" ON "public"."brackets" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "brackets"."tournament_id") AND ("tournaments"."lock_date" > "now"()))))));



CREATE POLICY "Users can create picks before lock" ON "public"."picks" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."brackets" "b"
     JOIN "public"."tournaments" "t" ON (("b"."tournament_id" = "t"."id")))
  WHERE (("b"."id" = "picks"."bracket_id") AND ("b"."user_id" = "auth"."uid"()) AND ("t"."lock_date" > "now"())))));



CREATE POLICY "Users can delete own brackets before lock" ON "public"."brackets" FOR DELETE USING ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "brackets"."tournament_id") AND ("tournaments"."lock_date" > "now"()))))));



CREATE POLICY "Users can delete picks before lock" ON "public"."picks" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."brackets" "b"
     JOIN "public"."tournaments" "t" ON (("b"."tournament_id" = "t"."id")))
  WHERE (("b"."id" = "picks"."bracket_id") AND ("b"."user_id" = "auth"."uid"()) AND ("t"."lock_date" > "now"())))));



CREATE POLICY "Users can update own brackets before lock" ON "public"."brackets" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "brackets"."tournament_id") AND ("tournaments"."lock_date" > "now"()))))));



CREATE POLICY "Users can update picks before lock" ON "public"."picks" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."brackets" "b"
     JOIN "public"."tournaments" "t" ON (("b"."tournament_id" = "t"."id")))
  WHERE (("b"."id" = "picks"."bracket_id") AND ("b"."user_id" = "auth"."uid"()) AND ("t"."lock_date" > "now"())))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own brackets" ON "public"."brackets" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own picks" ON "public"."picks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."brackets"
  WHERE (("brackets"."id" = "picks"."bracket_id") AND ("brackets"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."brackets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."picks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournaments" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


















GRANT ALL ON TABLE "public"."brackets" TO "anon";
GRANT ALL ON TABLE "public"."brackets" TO "authenticated";
GRANT ALL ON TABLE "public"."brackets" TO "service_role";



GRANT ALL ON TABLE "public"."picks" TO "anon";
GRANT ALL ON TABLE "public"."picks" TO "authenticated";
GRANT ALL ON TABLE "public"."picks" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."results" TO "anon";
GRANT ALL ON TABLE "public"."results" TO "authenticated";
GRANT ALL ON TABLE "public"."results" TO "service_role";



GRANT ALL ON TABLE "public"."tournaments" TO "anon";
GRANT ALL ON TABLE "public"."tournaments" TO "authenticated";
GRANT ALL ON TABLE "public"."tournaments" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































