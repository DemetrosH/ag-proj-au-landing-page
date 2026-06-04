-- 1. Enable Row Level Security on the profiles table
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing potentially conflicting policies to ensure clean state
DROP POLICY IF EXISTS "Allow users to read their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow users to update their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow admins to update any profile" ON "public"."profiles";

-- 3. Create security definer function to check if the current user is an admin
-- This runs with security definer privileges to bypass RLS and prevent infinite recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute privilege on the check function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4. Policy to allow users to read their own profile
CREATE POLICY "Allow users to read their own profile" ON "public"."profiles"
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 5. Policy to allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON "public"."profiles"
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6. Policy to allow admins to view all profiles
CREATE POLICY "Allow admins to read all profiles" ON "public"."profiles"
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- 7. Policy to allow admins to update any profile role
CREATE POLICY "Allow admins to update any profile" ON "public"."profiles"
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
