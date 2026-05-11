-- ADDING MISSING TABLES FOR FULL FUNCTIONALITY

-- 1. LAKE CONFIGURATION
CREATE TABLE IF NOT EXISTS public.lake_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    receipt_footer TEXT,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FISHING PACKAGES
CREATE TABLE IF NOT EXISTS public.fishing_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FISH TYPES (For Buyback)
CREATE TABLE IF NOT EXISTS public.fish_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    buyback_price_per_kg NUMERIC NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSION PRODUCTS (Link products to a session)
CREATE TABLE IF NOT EXISTS public.session_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time NUMERIC NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FISH BUYBACKS (Record fish bought back from customer)
CREATE TABLE IF NOT EXISTS public.fish_buybacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    fish_type_id UUID REFERENCES public.fish_types(id) ON DELETE SET NULL,
    weight NUMERIC NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE public.lake_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fishing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_buybacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant access lake_configs" ON public.lake_configs FOR ALL TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant access fishing_packages" ON public.fishing_packages FOR ALL TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant access fish_types" ON public.fish_types FOR ALL TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant access session_products" ON public.session_products FOR ALL TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
CREATE POLICY "Tenant access fish_buybacks" ON public.fish_buybacks FOR ALL TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id'));
