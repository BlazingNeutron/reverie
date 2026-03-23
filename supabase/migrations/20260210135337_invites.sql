-- CREATE Invite table
CREATE TABLE IF NOT EXISTS "public"."invites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" "text" NOT NULL
);

ALTER TABLE "public"."invites" OWNER TO "postgres";

ALTER TABLE ONLY "public"."invites"
    DROP CONSTRAINT IF EXISTS "invites_pkey";

ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");

DROP POLICY IF EXISTS "Enable insert for service role only" ON "public"."invites";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."invites";

CREATE POLICY "Enable insert for service role only" ON "public"."invites" FOR INSERT TO "service_role" WITH CHECK ( true );

CREATE POLICY "Enable read access for all users" ON "public"."invites" TO public USING ( true );

ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION check_invite_code(check_code text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = "public"
AS $$
DECLARE valid_code boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM "public"."invites" WHERE code = "check_invite_code"."check_code") INTO valid_code;

  return valid_code;
END;
$$;
