-- CLEAN UP OLD NAMES
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = 'documents'
    ) THEN
        ALTER TABLE "public"."documents" RENAME CONSTRAINT "doc_index_pkey" TO "documents_pkey";
        ALTER TABLE "public"."documents" RENAME CONSTRAINT "doc_index_user_id_fkey" TO "documents_user_id_fkey";
    ELSE
        RAISE NOTICE 'Constraints have already been renamed; nothing to do.';
    END IF;
END $$;

-- DROP FAULTY profile sync
DROP TRIGGER IF EXISTS sync_profile_after_upsert on auth.users;

DROP FUNCTION IF EXISTS public.sync_profile_from_auth;

-- APPLY sync straight from the documentation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (new.id, new.email, new.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- CREATE Snapshot table
CREATE TABLE IF NOT EXISTS "public"."yjs_snapshots" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "doc_id" "uuid" NOT NULL,
    "snapshot" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."yjs_snapshots" OWNER TO "postgres";

ALTER TABLE ONLY "public"."yjs_snapshots"
    DROP CONSTRAINT IF EXISTS "yjs_snapshots_pkey";

ALTER TABLE ONLY "public"."yjs_snapshots"
    ADD CONSTRAINT "yjs_snapshots_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."yjs_snapshots"
    DROP CONSTRAINT IF EXISTS "yjs_snapshots_doc_id_fkey";

ALTER TABLE ONLY "public"."yjs_snapshots"
    ADD CONSTRAINT "yjs_snapshots_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "public"."documents"("doc_id") ON DELETE CASCADE;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."yjs_snapshots";

CREATE POLICY "Enable insert for authenticated users only" ON "public"."yjs_snapshots" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM shared s
  WHERE ((s.doc_id = yjs_snapshots.doc_id) AND (s.user_id = auth.uid())))));

DROP POLICY IF EXISTS "Enable users to view their own data only" ON "public"."yjs_snapshots";

CREATE POLICY "Enable users to view their own data only" ON "public"."yjs_snapshots" FOR SELECT TO "authenticated" USING (  (EXISTS ( SELECT 1
   FROM shared s
  WHERE ((s.doc_id = yjs_snapshots.doc_id) AND (s.user_id = auth.uid())))));

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."yjs_snapshots";

CREATE POLICY "Enable delete for authenticated users only" ON "public"."yjs_snapshots" FOR DELETE TO "authenticated" USING (  (EXISTS ( SELECT 1
   FROM shared s
  WHERE ((s.doc_id = yjs_snapshots.doc_id) AND (s.user_id = auth.uid())))));

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."yjs_updates";

CREATE POLICY "Enable delete for authenticated users only" ON "public"."yjs_updates" FOR DELETE TO "authenticated" USING (  (EXISTS ( SELECT 1
   FROM shared s
  WHERE ((s.doc_id = yjs_updates.doc_id) AND (s.user_id = auth.uid())))));

ALTER TABLE "public"."yjs_snapshots" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM   pg_publication_tables
        WHERE  pubname    = 'supabase_realtime'
          AND  schemaname = 'public'
          AND  tablename  = 'yjs_snapshots'
    ) THEN
        RAISE NOTICE 'Dropping table "public.yjs_snapshots" from publication "supabase_realtime".';
        ALTER PUBLICATION "supabase_realtime"
            DROP TABLE ONLY "public"."yjs_snapshots";
    ELSE
        RAISE NOTICE 'Table "public.yjs_snapshots" is not part of publication "supabase_realtime"; nothing to do.';
    END IF;
END $$;

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."yjs_snapshots";


GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."yjs_snapshots" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."yjs_snapshots" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."yjs_snapshots" TO "service_role";