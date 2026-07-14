-- Add applicant_user_id to link org_applications to auth users
ALTER TABLE public.org_applications
  ADD COLUMN IF NOT EXISTS applicant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
