-- Migration: 20260822_anti_abuse_tracking.sql
-- Purpose: IP Address and Hardware Fingerprint anti-abuse tracking to enforce the 1-free-export policy across multiple accounts and browser sessions.

CREATE TABLE IF NOT EXISTS public.device_ip_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    device_fingerprint TEXT NOT NULL,
    composite_fingerprint TEXT UNIQUE NOT NULL,
    export_count INTEGER DEFAULT 1,
    last_ip_sample TEXT,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_ids JSONB DEFAULT '[]'::jsonb
);

-- Index for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_device_ip_records_ip_hash ON public.device_ip_records(ip_hash);
CREATE INDEX IF NOT EXISTS idx_device_ip_records_composite ON public.device_ip_records(composite_fingerprint);

-- Enable RLS
ALTER TABLE public.device_ip_records ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated clients to read and upsert usage tracking
CREATE POLICY "Allow public read of device_ip_records for limit checking"
    ON public.device_ip_records
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public upsert of device_ip_records"
    ON public.device_ip_records
    FOR ALL
    USING (true)
    WITH CHECK (true);
