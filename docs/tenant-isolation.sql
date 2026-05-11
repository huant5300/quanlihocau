-- TENANT ISOLATION TRIGGERS
-- Automatically set tenant_id from auth.jwt() metadata on insert

CREATE OR REPLACE FUNCTION public.fn_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tenant_id := (auth.jwt() -> 'user_metadata' ->> 'tenant_id');
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := 'default'; -- Fallback for testing or public users if allowed
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Apply to all relevant tables
DROP TRIGGER IF EXISTS tr_set_tenant_customers ON public.customers;
CREATE TRIGGER tr_set_tenant_customers BEFORE INSERT ON public.customers FOR EACH ROW EXECUTE PROCEDURE public.fn_set_tenant_id();

DROP TRIGGER IF EXISTS tr_set_tenant_products ON public.products;
CREATE TRIGGER tr_set_tenant_products BEFORE INSERT ON public.products FOR EACH ROW EXECUTE PROCEDURE public.fn_set_tenant_id();

DROP TRIGGER IF EXISTS tr_set_tenant_sessions ON public.sessions;
CREATE TRIGGER tr_set_tenant_sessions BEFORE INSERT ON public.sessions FOR EACH ROW EXECUTE PROCEDURE public.fn_set_tenant_id();

DROP TRIGGER IF EXISTS tr_set_tenant_payments ON public.payments;
CREATE TRIGGER tr_set_tenant_payments BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE PROCEDURE public.fn_set_tenant_id();

DROP TRIGGER IF EXISTS tr_set_tenant_lake_configs ON public.lake_configs;
CREATE TRIGGER tr_set_tenant_lake_configs BEFORE INSERT ON public.lake_configs FOR EACH ROW EXECUTE PROCEDURE public.fn_set_tenant_id();

DROP TRIGGER IF EXISTS tr_set_tenant_fishing_packages ON public.fishing_packages;
CREATE TRIGGER tr_set_tenant_fishing_packages BEFORE INSERT ON public.fishing_packages FOR EACH ROW EXECUTE PROCEDURE public.fn_set_tenant_id();
