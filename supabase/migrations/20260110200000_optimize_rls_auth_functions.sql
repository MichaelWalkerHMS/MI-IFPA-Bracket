-- Migration: Optimize RLS policies to prevent per-row auth function re-evaluation
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
--
-- Issue: Calls to auth.uid() in RLS policies are re-evaluated for each row scanned.
-- Fix: Wrap auth.uid() in a subquery (select auth.uid()) so it's evaluated once per query.

-- ============================================================================
-- BRACKETS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create brackets before lock" ON brackets;
DROP POLICY IF EXISTS "Users can delete own brackets before lock" ON brackets;
DROP POLICY IF EXISTS "Users can update own brackets before lock" ON brackets;
DROP POLICY IF EXISTS "Users can view their own brackets" ON brackets;
DROP POLICY IF EXISTS "Admins can update brackets" ON brackets;

-- Recreate with optimized auth.uid() calls

CREATE POLICY "Users can create brackets before lock" ON brackets
FOR INSERT
WITH CHECK (
  user_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_id
    AND tournaments.lock_date > now()
  )
);

CREATE POLICY "Users can delete own brackets before lock" ON brackets
FOR DELETE
USING (
  user_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_id
    AND tournaments.lock_date > now()
  )
);

CREATE POLICY "Users can update own brackets before lock" ON brackets
FOR UPDATE
USING (
  user_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_id
    AND tournaments.lock_date > now()
  )
);

CREATE POLICY "Users can view their own brackets" ON brackets
FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can update brackets" ON brackets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- PICKS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create picks before lock" ON picks;
DROP POLICY IF EXISTS "Users can delete picks before lock" ON picks;
DROP POLICY IF EXISTS "Users can update picks before lock" ON picks;
DROP POLICY IF EXISTS "Users can view their own picks" ON picks;
DROP POLICY IF EXISTS "Admins can update is_correct on any pick" ON picks;

-- Recreate with optimized auth.uid() calls

CREATE POLICY "Users can create picks before lock" ON picks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brackets
    JOIN tournaments ON tournaments.id = brackets.tournament_id
    WHERE brackets.id = bracket_id
    AND brackets.user_id = (select auth.uid())
    AND tournaments.lock_date > now()
  )
);

CREATE POLICY "Users can delete picks before lock" ON picks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM brackets
    JOIN tournaments ON tournaments.id = brackets.tournament_id
    WHERE brackets.id = bracket_id
    AND brackets.user_id = (select auth.uid())
    AND tournaments.lock_date > now()
  )
);

CREATE POLICY "Users can update picks before lock" ON picks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM brackets
    JOIN tournaments ON tournaments.id = brackets.tournament_id
    WHERE brackets.id = bracket_id
    AND brackets.user_id = (select auth.uid())
    AND tournaments.lock_date > now()
  )
);

CREATE POLICY "Users can view their own picks" ON picks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM brackets
    WHERE brackets.id = bracket_id
    AND brackets.user_id = (select auth.uid())
  )
);

CREATE POLICY "Admins can update is_correct on any pick" ON picks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE
USING (id = (select auth.uid()));
