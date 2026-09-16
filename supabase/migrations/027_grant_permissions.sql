-- Grant service_role access to education_inquiries table
-- Run this in Supabase SQL Editor

GRANT ALL ON education_inquiries TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
