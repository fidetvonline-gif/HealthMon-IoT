-- ==============================================================================
-- VitaTrack IoT: Supabase PostgreSQL Schema & Security Policies (RLS)
-- University Student IoT Health Monitoring & Abnormal Condition Detection System
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'HEALTHCARE', 'ADMIN')),
    student_id TEXT,
    faculty TEXT,
    department TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. DEVICES TABLE
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_uid TEXT NOT NULL UNIQUE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    device_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'CONNECTING', 'ERROR')),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    wifi_status BOOLEAN DEFAULT true,
    wifi_rssi INTEGER DEFAULT -65,
    last_seen TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    firmware_version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HEALTH READINGS TABLE
CREATE TABLE IF NOT EXISTS public.health_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    heart_rate NUMERIC NOT NULL,
    spo2 NUMERIC NOT NULL,
    temperature NUMERIC NOT NULL,
    activity TEXT NOT NULL CHECK (activity IN ('Sitting', 'Standing', 'Walking', 'Running', 'Inactive', 'Possible Fall')),
    status TEXT NOT NULL CHECK (status IN ('Normal', 'Warning', 'Abnormal')),
    battery_level INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reading_id UUID REFERENCES public.health_readings(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL,
    parameter TEXT NOT NULL,
    value TEXT NOT NULL,
    threshold TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVIEWED', 'RESOLVED')),
    resolution_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. THRESHOLDS TABLE
CREATE TABLE IF NOT EXISTS public.thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parameter TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    minimum_value NUMERIC NOT NULL,
    maximum_value NUMERIC NOT NULL,
    enabled BOOLEAN DEFAULT true,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_by TEXT DEFAULT 'System Admin'
);

-- 6. DEVICE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.device_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    actor TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_readings_student ON public.health_readings(student_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_student ON public.alerts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_devices_uid ON public.devices(device_uid);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES:
-- 1. Profiles: Students view own profile; Healthcare & Admin view all
CREATE POLICY "Profiles select policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('HEALTHCARE', 'ADMIN'))
    );

CREATE POLICY "Profiles update policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 2. Readings: Student reads own; Healthcare & Admin read all
CREATE POLICY "Readings select policy" ON public.health_readings
    FOR SELECT USING (
        student_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('HEALTHCARE', 'ADMIN'))
    );

CREATE POLICY "Readings insert policy" ON public.health_readings
    FOR INSERT WITH CHECK (true); -- Allows IoT device API key or authenticated student

-- 3. Alerts: Student reads own; Healthcare & Admin manage
CREATE POLICY "Alerts select policy" ON public.alerts
    FOR SELECT USING (
        student_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('HEALTHCARE', 'ADMIN'))
    );

CREATE POLICY "Alerts update policy" ON public.alerts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('HEALTHCARE', 'ADMIN'))
    );

-- 4. Thresholds: Everyone reads, Admins update
CREATE POLICY "Thresholds select policy" ON public.thresholds FOR SELECT USING (true);
CREATE POLICY "Thresholds manage policy" ON public.thresholds FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- REALTIME CONFIGURATION
-- Run this to enable Supabase Realtime for health readings and alerts:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.health_readings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
