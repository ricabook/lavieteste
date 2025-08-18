-- Allow public access to view customization options (even without authentication)
DROP POLICY IF EXISTS "Everyone can view active chocolate options" ON public.opcoes_chocolate;
DROP POLICY IF EXISTS "Everyone can view active base options" ON public.opcoes_base;
DROP POLICY IF EXISTS "Everyone can view active ganache options" ON public.opcoes_ganache;
DROP POLICY IF EXISTS "Everyone can view active geleia options" ON public.opcoes_geleia;
DROP POLICY IF EXISTS "Everyone can view active cor options" ON public.opcoes_cor;

-- Create new policies that allow public access
CREATE POLICY "Public can view active chocolate options" 
ON public.opcoes_chocolate 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Public can view active base options" 
ON public.opcoes_base 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Public can view active ganache options" 
ON public.opcoes_ganache 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Public can view active geleia options" 
ON public.opcoes_geleia 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Public can view active cor options" 
ON public.opcoes_cor 
FOR SELECT 
USING (ativo = true);

-- Allow service_role to bypass RLS for direct management via Supabase Dashboard
CREATE POLICY "Service role can manage chocolate options" 
ON public.opcoes_chocolate 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage base options" 
ON public.opcoes_base 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage ganache options" 
ON public.opcoes_ganache 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage geleia options" 
ON public.opcoes_geleia 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage cor options" 
ON public.opcoes_cor 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service_role to manage profiles and user_roles for direct user creation
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage user_roles" 
ON public.user_roles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service_role to manage bombons
CREATE POLICY "Service role can manage bombons" 
ON public.bombons 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);