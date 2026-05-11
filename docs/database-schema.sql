-- FISHING LAKE MANAGEMENT SAAS - SUPER CLEAN PRODUCTION SCHEMA
-- Comprehensive SQL for Supabase (PostgreSQL)
-- Run this in the Supabase SQL Editor

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES (Safe Creation)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'STAFF',
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    thumbnail TEXT,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hut_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ACTIVE', 
    total_amount NUMERIC DEFAULT 0,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_stats (
    id TEXT PRIMARY KEY, 
    total_revenue NUMERIC DEFAULT 0,
    active_sessions_count INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    inventory_alerts_count INTEGER DEFAULT 0,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION fn_sync_dashboard_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN v_tenant_id := OLD.tenant_id;
    ELSE v_tenant_id := NEW.tenant_id;
    END IF;

    INSERT INTO public.dashboard_stats (id, tenant_id) VALUES (v_tenant_id, v_tenant_id) ON CONFLICT (id) DO NOTHING;

    IF (TG_TABLE_NAME = 'sessions') THEN
        UPDATE public.dashboard_stats SET active_sessions_count = (SELECT count(*) FROM public.sessions WHERE status = 'ACTIVE' AND tenant_id = v_tenant_id) WHERE id = v_tenant_id;
    ELSIF (TG_TABLE_NAME = 'payments') THEN
        UPDATE public.dashboard_stats SET total_revenue = (SELECT COALESCE(sum(amount), 0) FROM public.payments WHERE tenant_id = v_tenant_id) WHERE id = v_tenant_id;
    ELSIF (TG_TABLE_NAME = 'customers') THEN
        UPDATE public.dashboard_stats SET total_customers = (SELECT count(*) FROM public.customers WHERE tenant_id = v_tenant_id) WHERE id = v_tenant_id;
    ELSIF (TG_TABLE_NAME = 'products') THEN
        UPDATE public.dashboard_stats SET inventory_alerts_count = (SELECT count(*) FROM public.products WHERE stock < 10 AND tenant_id = v_tenant_id) WHERE id = v_tenant_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 4. TRIGGERS (Safe Re-creation)
DROP TRIGGER IF EXISTS tr_sessions_updated_at ON public.sessions;
CREATE TRIGGER tr_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_sync_sessions_stats ON public.sessions;
CREATE TRIGGER tr_sync_sessions_stats AFTER INSERT OR UPDATE OR DELETE ON public.sessions FOR EACH ROW EXECUTE PROCEDURE fn_sync_dashboard_stats();
DROP TRIGGER IF EXISTS tr_sync_payments_stats ON public.payments;
CREATE TRIGGER tr_sync_payments_stats AFTER INSERT OR DELETE ON public.payments FOR EACH ROW EXECUTE PROCEDURE fn_sync_dashboard_stats();
DROP TRIGGER IF EXISTS tr_sync_customers_stats ON public.customers;
CREATE TRIGGER tr_sync_customers_stats AFTER INSERT OR DELETE ON public.customers FOR EACH ROW EXECUTE PROCEDURE fn_sync_dashboard_stats();
DROP TRIGGER IF EXISTS tr_sync_products_stats ON public.products;
CREATE TRIGGER tr_sync_products_stats AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE PROCEDURE fn_sync_dashboard_stats();

-- 5. RLS POLICIES (Safe Re-creation)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" error
DROP POLICY IF EXISTS "Tenant read access customers" ON public.customers;
DROP POLICY IF EXISTS "Tenant read access products" ON public.products;
DROP POLICY IF EXISTS "Tenant read access sessions" ON public.sessions;
DROP POLICY IF EXISTS "Tenant read access payments" ON public.payments;
DROP POLICY IF EXISTS "Tenant read access stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Manager write access products" ON public.products;

-- Create clean policies
CREATE POLICY "Tenant read access customers" ON public.customers FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant read access products" ON public.products FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant read access sessions" ON public.sessions FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant read access payments" ON public.payments FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant read access stats" ON public.dashboard_stats FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Manager write access products" ON public.products FOR ALL TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANAGER', 'OWNER'));

-- 6. VIEWS
CREATE OR REPLACE VIEW public.monthly_revenue_stats AS
SELECT tenant_id, TO_CHAR(created_at, 'YYYY-MM') as month, SUM(amount) as revenue, COUNT(id) as payment_count
FROM public.payments GROUP BY tenant_id, month ORDER BY month DESC;

-- 7. REALTIME (Safe Way)
-- This checks if tables are already in publication before adding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sessions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'dashboard_stats') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_stats;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
END $$;

-- 8. SEED DATA (Avoid Duplicates)
INSERT INTO public.products (name, category, price, stock, is_active, tenant_id)
VALUES 
('Mồi cám xanh đặc biệt', 'BAIT', 35000, 100, true, 'default'),
('Cần câu Carbon 5m4', 'EQUIPMENT', 850000, 5, true, 'default'),
('Nước tăng lực Redbull', 'DRINK', 20000, 50, true, 'default')
ON CONFLICT DO NOTHING;
