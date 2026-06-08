-- ================================================================
-- Моживо — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ================================================================

-- ── Profiles (extends auth.users) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT    NOT NULL DEFAULT '',
  last_name     TEXT    NOT NULL DEFAULT '',
  phone         TEXT    NOT NULL DEFAULT '',
  country       TEXT    NOT NULL DEFAULT '',
  institution   TEXT    NOT NULL DEFAULT '',
  degree        TEXT    NOT NULL DEFAULT '',
  languages     TEXT[]  NOT NULL DEFAULT '{}',
  bio           TEXT    NOT NULL DEFAULT '',
  role          TEXT    NOT NULL DEFAULT 'seeker'
                  CHECK (role IN ('seeker', 'coordinator')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── Auto-create profile on signup ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      NULLIF(split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), ''),
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── Saved opportunities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_slug TEXT        NOT NULL,
  saved_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, opportunity_slug)
);

ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved: owner all"
  ON public.saved_opportunities
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Applications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_slug   TEXT        NOT NULL,
  opportunity_title  TEXT        NOT NULL DEFAULT '',
  org                TEXT        NOT NULL DEFAULT '',
  deadline           TEXT        NOT NULL DEFAULT '',
  status             TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  first_name         TEXT        NOT NULL DEFAULT '',
  last_name          TEXT        NOT NULL DEFAULT '',
  email              TEXT        NOT NULL DEFAULT '',
  phone              TEXT        NOT NULL DEFAULT '',
  country            TEXT        NOT NULL DEFAULT '',
  institution        TEXT        NOT NULL DEFAULT '',
  degree             TEXT        NOT NULL DEFAULT '',
  graduation_year    TEXT        NOT NULL DEFAULT '',
  languages          TEXT[]      NOT NULL DEFAULT '{}',
  motivation         TEXT        NOT NULL DEFAULT '',
  cv_url             TEXT        NOT NULL DEFAULT '',
  portfolio_url      TEXT        NOT NULL DEFAULT '',
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications: owner select"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "applications: owner insert"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
