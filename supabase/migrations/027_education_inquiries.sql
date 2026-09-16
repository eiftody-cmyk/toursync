-- Education inquiries table for Osaka History Field Lessons
-- Stores inquiries from the education landing pages

CREATE TABLE education_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact info
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Curriculum details
  subject TEXT,                          -- what they're teaching
  angle TEXT,                            -- the question/angle they want explored
  
  -- Logistics
  school_type TEXT NOT NULL,             -- Junior High / Senior High / University / International
  class_size TEXT NOT NULL,              -- 'Up to 15' / 'Up to 30' / 'Up to 40'
  language TEXT NOT NULL,                -- Japanese / English / Bilingual
  materials TEXT[],                      -- array: Discussion questions, Source analysis, Quiz, etc.
  
  -- Optional
  preferred_dates TEXT,
  notes TEXT,
  locale TEXT DEFAULT 'en',              -- which language version they used
  
  -- Tracking
  configurator_url TEXT,                 -- the URL they arrived from
  status TEXT DEFAULT 'new',             -- new / contacted / booked / completed
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can access (no public read/write)
ALTER TABLE education_inquiries ENABLE ROW LEVEL SECURITY;

-- Index for status-based queries
CREATE INDEX idx_education_inquiries_status ON education_inquiries(status);
CREATE INDEX idx_education_inquiries_created ON education_inquiries(created_at DESC);
