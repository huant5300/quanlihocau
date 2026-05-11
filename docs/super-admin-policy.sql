-- SUPER ADMIN POLICIES
-- Allowing Huant5300@gmail.com to see all data regardless of tenant_id

-- 1. Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email' = 'Huant5300@gmail.com');
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 2. Update Policies
DROP POLICY IF EXISTS "Tenant read access customers" ON public.customers;
CREATE POLICY "Tenant read access customers" ON public.customers FOR SELECT TO authenticated 
USING (public.is_super_admin() OR tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

DROP POLICY IF EXISTS "Tenant read access products" ON public.products;
CREATE POLICY "Tenant read access products" ON public.products FOR SELECT TO authenticated 
USING (public.is_super_admin() OR tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

DROP POLICY IF EXISTS "Tenant read access sessions" ON public.sessions;
CREATE POLICY "Tenant read access sessions" ON public.sessions FOR SELECT TO authenticated 
USING (public.is_super_admin() OR tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));

DROP POLICY IF EXISTS "Tenant read access payments" ON public.payments;
CREATE POLICY "Tenant read access payments" ON public.payments FOR SELECT TO authenticated 
USING (public.is_super_admin() OR tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
