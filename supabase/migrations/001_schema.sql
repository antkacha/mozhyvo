-- ════════════════════════════════════════════════════════
-- Mozhyvo — full schema with RLS
-- Run this once in the Supabase SQL editor
-- ════════════════════════════════════════════════════════

-- ── Helper: auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- TABLE: profiles
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name       TEXT,
  last_name        TEXT,
  email            TEXT,
  phone            TEXT,
  country          TEXT,
  city             TEXT,
  institution      TEXT,
  degree           TEXT,
  graduation_year  TEXT,
  languages        TEXT[]    DEFAULT '{}',
  bio              TEXT,
  avatar_url       TEXT,
  cv_url           TEXT,
  linkedin_url     TEXT,
  telegram         TEXT,
  interests        TEXT[]    DEFAULT '{}',
  role             TEXT      NOT NULL DEFAULT 'user'
                             CHECK (role IN ('user', 'admin')),
  onboarding_done  BOOLEAN   DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ════════════════════════════════════════════════════════
-- TABLE: applications
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.applications (
  id                  UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID      REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_slug    TEXT      NOT NULL,
  opportunity_title   TEXT      NOT NULL,
  org                 TEXT      NOT NULL DEFAULT '',
  deadline            TEXT      NOT NULL DEFAULT '',
  first_name          TEXT      NOT NULL,
  last_name           TEXT      NOT NULL,
  email               TEXT      NOT NULL,
  phone               TEXT,
  country             TEXT      NOT NULL DEFAULT '',
  institution         TEXT      NOT NULL DEFAULT '',
  degree              TEXT      NOT NULL DEFAULT '',
  graduation_year     TEXT,
  languages           TEXT[]    DEFAULT '{}',
  motivation          TEXT,
  cv_url              TEXT,
  portfolio_url       TEXT,
  status              TEXT      NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','reviewing','accepted','rejected')),
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user    ON public.applications(user_id);
CREATE INDEX idx_applications_slug    ON public.applications(opportunity_slug);
CREATE INDEX idx_applications_status  ON public.applications(status);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications"   ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications"  ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admins can update any application" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ════════════════════════════════════════════════════════
-- TABLE: saved_opportunities
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id               UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID      REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_slug TEXT      NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_slug)
);

CREATE INDEX idx_saved_user ON public.saved_opportunities(user_id);

ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own saved" ON public.saved_opportunities
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════
-- TABLE: reminders
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.reminders (
  id                  UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID      REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_slug    TEXT      NOT NULL,
  opportunity_title   TEXT      NOT NULL,
  deadline            TEXT      NOT NULL,
  days_before         INTEGER   NOT NULL DEFAULT 3,
  email               TEXT      NOT NULL,
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_slug, days_before)
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own reminders" ON public.reminders
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════
-- TABLE: user_notification_settings
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email_new_opportunities BOOLEAN DEFAULT TRUE,
  email_reminders         BOOLEAN DEFAULT TRUE,
  email_status_updates    BOOLEAN DEFAULT TRUE,
  email_weekly_digest     BOOLEAN DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own notification settings" ON public.user_notification_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════
-- TABLE: admin_notes
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id     UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type  TEXT    NOT NULL CHECK (target_type IN ('user','opportunity','application')),
  target_id    TEXT    NOT NULL,
  note         TEXT    NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only — admin_notes" ON public.admin_notes
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ════════════════════════════════════════════════════════
-- TABLE: broadcast_logs
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.broadcast_logs (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id        UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  subject         TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  segment         TEXT    NOT NULL DEFAULT 'all' CHECK (segment IN ('all','users','orgs')),
  recipient_count INTEGER DEFAULT 0,
  sent_at         TIMESTAMPTZ,
  scheduled_at    TIMESTAMPTZ,
  status          TEXT    NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','scheduled','sent','failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.broadcast_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only — broadcast_logs" ON public.broadcast_logs
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ════════════════════════════════════════════════════════
-- TABLE: activity_logs
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    REFERENCES auth.users(id) ON DELETE CASCADE,
  action      TEXT    NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user   ON public.activity_logs(user_id);
CREATE INDEX idx_activity_action ON public.activity_logs(action);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own activity"  ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own activity"    ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity"   ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
