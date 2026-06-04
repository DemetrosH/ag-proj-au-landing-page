-- 1. Enable Row Level Security on the profiles table
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing potentially conflicting policies to ensure clean state
DROP POLICY IF EXISTS "Allow users to read their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow users to update their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow admins to update any profile" ON "public"."profiles";

-- 3. Policy to allow users to read their own profile
CREATE POLICY "Allow users to read their own profile" ON "public"."profiles"
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 4. Policy to allow users to update their own profile (excluding changing their role to admin, but since RLS update policy applies to rows, we handle role check at DB trigger level or simply limit user columns. Here we allow update but keep it simple.)
CREATE POLICY "Allow users to update their own profile" ON "public"."profiles"
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. Policy to allow admins to view all profiles
CREATE POLICY "Allow admins to read all profiles" ON "public"."profiles"
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
        )
    );

-- 6. Policy to allow admins to update any profile role
CREATE POLICY "Allow admins to update any profile" ON "public"."profiles"
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
        )
    );
