-- ==========================================================
-- GRANT USERS TABLE PERMISSIONS TO AUTHENTICATED USERS
-- ==========================================================

-- Grant the ability to SELECT, INSERT, UPDATE for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
