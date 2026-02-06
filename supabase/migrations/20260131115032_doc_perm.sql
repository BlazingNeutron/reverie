DROP POLICY IF EXISTS "Enable read access for users with document shared" ON "public"."documents";
CREATE POLICY "Enable read access for users with document shared"
ON "public"."documents"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.shared s
      WHERE s.doc_id = documents.doc_id
        AND s.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Enable insert for users based on user_id" on "public"."documents";

DROP POLICY IF EXISTS "Allow update for owner or shared users" on "public"."documents";

CREATE POLICY "Allow update for owner or shared users" 
  ON "public"."documents"
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT s.user_id FROM public.shared s
      WHERE s.doc_id = documents.doc_id
        AND s.user_id = auth.uid()
    )
  );

ALTER POLICY "Enable insert for authenticated users only"
ON "public"."documents"
TO PUBLIC
WITH CHECK (
  ((user_id = auth.uid()) OR (EXISTS ( SELECT s.user_id
   FROM shared s
  WHERE ((s.doc_id = documents.doc_id) AND (s.user_id = auth.uid())))))
);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "public"."profiles";

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."profiles";

alter policy "Enable delete for all users"
on "public"."shared"
to authenticated
using (
  ((user_id = auth.uid()) OR (EXISTS (SELECT 1
   FROM documents d
  WHERE ((d.doc_id = shared.doc_id) AND (d.user_id = auth.uid())))))
);

alter policy "Enable insert for authenticated users only"
on "public"."shared"
to authenticated
with check (
  (EXISTS (SELECT 1
   FROM documents d
  WHERE ((d.doc_id = shared.doc_id) AND (d.user_id = auth.uid()))))
);

alter policy "Enable insert for authenticated users only"
on "public"."yjs_updates"
to authenticated
with check (
  (EXISTS ( SELECT 1
   FROM shared s
  WHERE ((s.doc_id = yjs_updates.doc_id) AND (s.user_id = auth.uid()))))
);

DROP POLICY "Enable delete for users based on user_id" ON "public"."yjs_updates";

ALTER TABLE "public"."yjs_updates"
    DROP COLUMN IF EXISTS "user_id" CASCADE;
