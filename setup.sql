-- ============================================================
-- InviSend — Complete Supabase Database Setup
-- Run this entire file in Supabase SQL Editor
-- Go to: SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLE 1: invitations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                text NOT NULL UNIQUE,
  template_id         integer DEFAULT 1,
  couple_name         text,
  bride_father        text,
  bride_mother        text,
  groom_father        text,
  groom_mother        text,
  wedding_date        timestamp with time zone,
  venue               text,
  message             text,
  swipe_image_a_url   text,
  swipe_image_b_url   text,
  couple_photo_url    text,
  music_url           text,
  google_maps_url     text,
  status              text DEFAULT 'live' CHECK (status IN ('live','expired')),
  expiry_date         timestamp with time zone,
  -- Pre-shoot fields (all optional)
  preshoot_title      text,
  preshoot_video_url  text,
  preshoot_photo_1    text,
  preshoot_photo_2    text,
  preshoot_photo_3    text,
  preshoot_photo_4    text,
  preshoot_photo_5    text,
  preshoot_photo_6    text,
  preshoot_photo_7    text,
  preshoot_photo_8    text,
  preshoot_photo_9    text,
  preshoot_photo_10   text,
  created_at          timestamp with time zone DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE 2: rsvp
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rsvp (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_slug     text NOT NULL REFERENCES public.invitations(slug) ON DELETE CASCADE,
  guest_name          text NOT NULL,
  phone               text,
  attendance          text NOT NULL CHECK (attendance IN ('yes','no')),
  created_at          timestamp with time zone DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE 3: testimonials
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_name         text NOT NULL,
  image_url           text NOT NULL,
  caption             text,
  theme               text,
  sort_order          integer DEFAULT 1,
  is_visible          boolean DEFAULT true,
  created_at          timestamp with time zone DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Invitations: public can read live ones, anon can do everything (dashboard uses anon key)
DROP POLICY IF EXISTS "Public read live invitations" ON public.invitations;
CREATE POLICY "Public read live invitations"
  ON public.invitations FOR SELECT
  USING (status = 'live');

DROP POLICY IF EXISTS "Anon full access invitations" ON public.invitations;
CREATE POLICY "Anon full access invitations"
  ON public.invitations FOR ALL
  USING (true) WITH CHECK (true);

-- RSVP: guests can insert, anon can read all (for dashboard)
DROP POLICY IF EXISTS "Anyone can insert rsvp" ON public.rsvp;
CREATE POLICY "Anyone can insert rsvp"
  ON public.rsvp FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can read rsvp" ON public.rsvp;
CREATE POLICY "Anon can read rsvp"
  ON public.rsvp FOR SELECT
  USING (true);

-- Testimonials: public reads visible ones, anon full access for dashboard
DROP POLICY IF EXISTS "Public read visible testimonials" ON public.testimonials;
CREATE POLICY "Public read visible testimonials"
  ON public.testimonials FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Anon full access testimonials" ON public.testimonials;
CREATE POLICY "Anon full access testimonials"
  ON public.testimonials FOR ALL
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- REALTIME (for live RSVP updates)
-- ─────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvp;

-- ─────────────────────────────────────────────────────────────
-- DONE!
-- After running this, go to Storage and create:
--   Bucket: images  (Public: ON)
--   Bucket: music   (Public: ON)
-- Add "Allow all" policies to both buckets.
-- See README.md for detailed instructions.
-- ─────────────────────────────────────────────────────────────
