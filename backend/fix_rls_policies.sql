-- SQL commands to fix RLS policies for consultant_applications table
-- Run these in your Supabase SQL Editor

-- First, check if RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'consultant_applications';

-- If RLS is enabled, we need to add policies that allow service role access

-- Drop existing policies if they exist (optional - only if they're too restrictive)
-- DROP POLICY IF EXISTS "Allow service role full access" ON consultant_applications;
-- DROP POLICY IF EXISTS "Allow public to insert applications" ON consultant_applications;

-- Create a policy that allows service role to do everything
CREATE POLICY "service_role_full_access" ON consultant_applications
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy that allows anyone to insert consultant applications (public submissions)
CREATE POLICY "allow_public_insert_applications" ON consultant_applications
FOR INSERT TO public
WITH CHECK (true);

-- Optional: Allow authenticated users to read their own applications
CREATE POLICY "allow_users_read_own_applications" ON consultant_applications
FOR SELECT TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Check the policies after creation
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'consultant_applications';
