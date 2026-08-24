/*
# Disaster Management App - Core Schema

## Overview
Creates the full schema for a disaster management MVP bridging emergency agencies (NDRF/SDRF) and the public. Supports role-based access (citizen/admin), event registration with QR tickets, early warning alerts, resource datasheets, and emergency contacts.

## Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per user, created on signup
- `role` (text, 'citizen' | 'admin') — determines access level
- `full_name` (text) — display name
- `pin_code` (text) — postal code for location targeting
- `created_at` (timestamptz)

### events
- `id` (uuid, PK)
- `title` (text)
- `type` (text, 'SSP' | 'CAP' | 'Mock Drill')
- `date` (date)
- `location` (text)
- `description` (text)
- `created_by` (uuid, references auth.users) — admin who created it
- `created_at` (timestamptz)

### registrations
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — citizen who registered
- `event_id` (uuid, references events) — the event
- `status` (text, 'registered' | 'attended') — attendance tracking
- `qr_code` (text) — mock QR identifier for ticket scanning
- `created_at` (timestamptz)

### alerts
- `id` (uuid, PK)
- `severity` (text, 'low' | 'high' | 'critical')
- `message` (text)
- `active_status` (boolean, default true) — whether alert is currently active
- `created_by` (uuid, references auth.users) — admin who triggered it
- `created_at` (timestamptz)

### emergency_contacts
- `id` (uuid, PK)
- `name` (text) — e.g. "Police", "Ambulance"
- `phone` (text) — phone number for click-to-call
- `description` (text)
- `created_at` (timestamptz)

### resources
- `id` (uuid, PK)
- `disaster_type` (text) — e.g. "Earthquake", "Flood", "Fire"
- `title` (text)
- `dos` (text[]) — list of do's
- `donts` (text[]) — list of don'ts
- `created_at` (timestamptz)

## Security (RLS)

All tables have RLS enabled. Policies:
- **profiles**: users read/update own profile; admins can read all profiles.
- **events**: anyone authenticated can SELECT; only admins can INSERT/UPDATE/DELETE.
- **registrations**: citizens can SELECT/INSERT/UPDATE their own; admins can SELECT all and UPDATE.
- **alerts**: anyone authenticated can SELECT; only admins can INSERT/UPDATE.
- **emergency_contacts**: anyone authenticated can SELECT; only admins can INSERT/UPDATE/DELETE.
- **resources**: anyone authenticated can SELECT; only admins can INSERT/UPDATE/DELETE.

Admin checks use a SECURITY DEFINER helper function `is_admin()` that checks the profile role.
*/

-- ============ TABLES (created first so is_admin() can reference profiles) ============

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  full_name text NOT NULL DEFAULT '',
  pin_code text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('SSP', 'CAP', 'Mock Drill')),
  date date NOT NULL,
  location text NOT NULL DEFAULT '',
  description text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended')),
  qr_code text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL CHECK (severity IN ('low', 'high', 'critical')),
  message text NOT NULL,
  active_status boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_type text NOT NULL,
  title text NOT NULL,
  dos text[] NOT NULL DEFAULT '{}',
  donts text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============ HELPER FUNCTION ============

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============ RLS ============

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- profiles policies
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- events policies
DROP POLICY IF EXISTS "select_events" ON public.events;
CREATE POLICY "select_events" ON public.events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_events_admin" ON public.events;
CREATE POLICY "insert_events_admin" ON public.events FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_events_admin" ON public.events;
CREATE POLICY "update_events_admin" ON public.events FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_events_admin" ON public.events;
CREATE POLICY "delete_events_admin" ON public.events FOR DELETE
  TO authenticated USING (public.is_admin());

-- registrations policies
DROP POLICY IF EXISTS "select_registrations" ON public.registrations;
CREATE POLICY "select_registrations" ON public.registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_registration" ON public.registrations;
CREATE POLICY "insert_own_registration" ON public.registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_registrations" ON public.registrations;
CREATE POLICY "update_registrations" ON public.registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_own_registration" ON public.registrations;
CREATE POLICY "delete_own_registration" ON public.registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- alerts policies
DROP POLICY IF EXISTS "select_alerts" ON public.alerts;
CREATE POLICY "select_alerts" ON public.alerts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_alerts_admin" ON public.alerts;
CREATE POLICY "insert_alerts_admin" ON public.alerts FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_alerts_admin" ON public.alerts;
CREATE POLICY "update_alerts_admin" ON public.alerts FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- emergency_contacts policies
DROP POLICY IF EXISTS "select_contacts" ON public.emergency_contacts;
CREATE POLICY "select_contacts" ON public.emergency_contacts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_contacts_admin" ON public.emergency_contacts;
CREATE POLICY "insert_contacts_admin" ON public.emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_contacts_admin" ON public.emergency_contacts;
CREATE POLICY "update_contacts_admin" ON public.emergency_contacts FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_contacts_admin" ON public.emergency_contacts;
CREATE POLICY "delete_contacts_admin" ON public.emergency_contacts FOR DELETE
  TO authenticated USING (public.is_admin());

-- resources policies
DROP POLICY IF EXISTS "select_resources" ON public.resources;
CREATE POLICY "select_resources" ON public.resources FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_resources_admin" ON public.resources;
CREATE POLICY "insert_resources_admin" ON public.resources FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_resources_admin" ON public.resources;
CREATE POLICY "update_resources_admin" ON public.resources FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_resources_admin" ON public.resources;
CREATE POLICY "delete_resources_admin" ON public.resources FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.alerts(active_status);
