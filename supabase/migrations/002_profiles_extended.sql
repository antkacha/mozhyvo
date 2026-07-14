-- Add missing profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city            TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS graduation_year TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cv_url          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telegram        TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS interests       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow any role value (admin, org, user, seeker, coordinator)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
