-- Corporate team-building inquiries (/corporate)
-- Stores enquiries from the corporate team-building pages (quote-based offering)

CREATE TABLE public.corporate_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Group details
  group_size TEXT NOT NULL,               -- '10–15' / '16–30' / '31–40' / '40+'
  language TEXT NOT NULL,                 -- Japanese / English / Bilingual
  preferred_dates TEXT,
  notes TEXT,

  locale TEXT DEFAULT 'en',               -- which language version they used
  status TEXT DEFAULT 'new'               -- new / contacted / booked / completed
    CHECK (status IN ('new', 'contacted', 'booked', 'completed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can access (no public read/write)
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Explicit grants (Supabase no longer auto-grants new public tables; see AGENTS.md).
-- RLS is enabled with no policies, so anon/authenticated get nothing; service_role
-- bypasses RLS and can manage rows for the server-side inquiry API.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.corporate_inquiries TO service_role;

-- Index for status-based queries
CREATE INDEX idx_corporate_inquiries_status ON public.corporate_inquiries(status);
CREATE INDEX idx_corporate_inquiries_created ON public.corporate_inquiries(created_at DESC);
