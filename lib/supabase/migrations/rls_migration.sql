-- ============================================================
-- FILE: supabase/migrations/20240001_rls_policies.sql
--
-- Production-ready Row Level Security policies for EduFlow.
--
-- DESIGN PRINCIPLES:
-- 1. The Next.js server uses the ANON key + JWT (user context).
--    auth.uid() returns the UUID of the authenticated user.
-- 2. The service role key BYPASSES RLS entirely — used only for
--    admin provisioning (inviteUserByEmail) and never for user queries.
-- 3. "User" table id = Supabase auth.uid() — this is the bridge.
-- 4. institutionId is the multi-tenant isolation key.
-- 5. SUPER_ADMIN (role = 'SUPER_ADMIN') can read/write everything.
-- 6. Policies are PERMISSIVE (OR logic within same command).
-- ============================================================

-- ── 0. Helper: fetch the caller's DB role without recursion ──
-- Calling supabase.from("User") inside an RLS policy on "User"
-- causes infinite recursion. We use auth.jwt() -> raw_user_meta_data
-- which is set at invite time, OR a security-definer function.
-- The function below is the safest approach.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER   -- runs as the function owner (postgres), not the caller
SET search_path = public
AS $$
  SELECT role::text FROM "User" WHERE id = auth.uid()::text;
$$;

-- ── 1. "User" table ───────────────────────────────────────────
-- The @map("User") in Prisma schema means the table is literally named "User".

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read their own row.
-- This is the row DashboardLayout fetches to get role + name.
CREATE POLICY "user_select_own"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

-- SUPER_ADMIN can read ALL user rows (needed for central hub / institution mgmt).
CREATE POLICY "user_select_super_admin"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'SUPER_ADMIN');

-- ADMIN can read all users within their own institution.
CREATE POLICY "user_select_same_institution"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (
    institutionId IS NOT NULL
    AND institutionId = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('ADMIN', 'MODERATOR')
  );

-- Only SUPER_ADMIN and ADMIN can INSERT new User rows.
-- The actual insert happens via the service role key in provisionUser()
-- so this policy is a belt-and-suspenders guard for direct REST calls.
CREATE POLICY "user_insert_admin"
  ON "User"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
  );

-- A user can update their own non-sensitive fields (name only via UI).
CREATE POLICY "user_update_own"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING  (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- ADMIN can update users within their institution (e.g. role changes).
CREATE POLICY "user_update_admin"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (
    institutionId = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
  )
  WITH CHECK (
    institutionId = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
  );

-- Only SUPER_ADMIN can delete User rows.
CREATE POLICY "user_delete_super_admin"
  ON "User"
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'SUPER_ADMIN');


-- ── 2. "Institution" table ────────────────────────────────────
-- DashboardLayout fetches the institution name via a second query.
-- Users need SELECT on their own institution row.

ALTER TABLE "Institution" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read their institution row.
CREATE POLICY "institution_select_member"
  ON "Institution"
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    OR public.get_my_role() = 'SUPER_ADMIN'
  );

-- Only SUPER_ADMIN can create / mutate institutions.
CREATE POLICY "institution_insert_super_admin"
  ON "Institution"
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'SUPER_ADMIN');

CREATE POLICY "institution_update_super_admin"
  ON "Institution"
  FOR UPDATE
  TO authenticated
  USING  (public.get_my_role() = 'SUPER_ADMIN')
  WITH CHECK (public.get_my_role() = 'SUPER_ADMIN');

CREATE POLICY "institution_delete_super_admin"
  ON "Institution"
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'SUPER_ADMIN');


-- ── 3. "Student" table ────────────────────────────────────────

ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;

-- ADMIN, MODERATOR, TEACHER can read students in their institution.
CREATE POLICY "student_select_staff"
  ON "Student"
  FOR SELECT
  TO authenticated
  USING (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'TEACHER')
  );

-- SUPER_ADMIN sees all students.
CREATE POLICY "student_select_super_admin"
  ON "Student"
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'SUPER_ADMIN');

-- ADMIN and MODERATOR can insert students.
CREATE POLICY "student_insert_admin"
  ON "Student"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  );

-- ADMIN and MODERATOR can update student records.
CREATE POLICY "student_update_admin"
  ON "Student"
  FOR UPDATE
  TO authenticated
  USING (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  )
  WITH CHECK (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  );

-- Only ADMIN+ can delete student records.
CREATE POLICY "student_delete_admin"
  ON "Student"
  FOR DELETE
  TO authenticated
  USING (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
  );


-- ── 4. "Notice" table ────────────────────────────────────────

ALTER TABLE "Notice" ENABLE ROW LEVEL SECURITY;

-- All members of an institution can read notices.
CREATE POLICY "notice_select_member"
  ON "Notice"
  FOR SELECT
  TO authenticated
  USING (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    OR public.get_my_role() = 'SUPER_ADMIN'
  );

-- ADMIN, MODERATOR, TEACHER can post notices.
CREATE POLICY "notice_insert_staff"
  ON "Notice"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'TEACHER')
    AND "authorId" = auth.uid()::text
  );

-- Authors can update their own notices; ADMIN can update any notice.
CREATE POLICY "notice_update_author_or_admin"
  ON "Notice"
  FOR UPDATE
  TO authenticated
  USING (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND (
      "authorId" = auth.uid()::text
      OR public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
    )
  )
  WITH CHECK (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND (
      "authorId" = auth.uid()::text
      OR public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ADMIN+ and authors can delete notices.
CREATE POLICY "notice_delete_author_or_admin"
  ON "Notice"
  FOR DELETE
  TO authenticated
  USING (
    "institutionId" = (
      SELECT institutionId FROM "User" WHERE id = auth.uid()::text
    )
    AND (
      "authorId" = auth.uid()::text
      OR public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
    )
  );


-- ── 5. "Attendance" and "Payment" tables ──────────────────────
-- These are child tables of Student. Access is scoped by institution
-- through the Student relation.

ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select_staff"
  ON "Attendance"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Student" s
      WHERE s.id = "Attendance"."studentId"
        AND s."institutionId" = (
          SELECT institutionId FROM "User" WHERE id = auth.uid()::text
        )
    )
    OR public.get_my_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "attendance_insert_teacher"
  ON "Attendance"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'TEACHER')
    AND EXISTS (
      SELECT 1 FROM "Student" s
      WHERE s.id = "Attendance"."studentId"
        AND s."institutionId" = (
          SELECT institutionId FROM "User" WHERE id = auth.uid()::text
        )
    )
  );

CREATE POLICY "attendance_update_teacher"
  ON "Attendance"
  FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'TEACHER')
    AND EXISTS (
      SELECT 1 FROM "Student" s
      WHERE s.id = "Attendance"."studentId"
        AND s."institutionId" = (
          SELECT institutionId FROM "User" WHERE id = auth.uid()::text
        )
    )
  )
  WITH CHECK (
    public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'TEACHER')
  );

ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_select_staff"
  ON "Payment"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Student" s
      WHERE s.id = "Payment"."studentId"
        AND s."institutionId" = (
          SELECT institutionId FROM "User" WHERE id = auth.uid()::text
        )
    )
    OR public.get_my_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "payment_insert_admin"
  ON "Payment"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
    AND EXISTS (
      SELECT 1 FROM "Student" s
      WHERE s.id = "Payment"."studentId"
        AND s."institutionId" = (
          SELECT institutionId FROM "User" WHERE id = auth.uid()::text
        )
    )
  );

-- ── 6. Grant execute on helper function to authenticated role ─
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- ── 7. Verify (run manually, not in migration) ────────────────
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;