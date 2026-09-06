-- Grant table permissions to service_role for GYG API routes
GRANT ALL ON public.tours TO service_role, authenticated;
GRANT ALL ON public.tour_schedules TO service_role, authenticated;
GRANT ALL ON public.tour_channel_listings TO service_role, authenticated;
GRANT ALL ON public.bookings TO service_role, authenticated;
GRANT ALL ON public.blocked_dates TO service_role, authenticated;
GRANT ALL ON public.gyg_reservations TO service_role, authenticated;
GRANT ALL ON public.notifications TO service_role, authenticated;
GRANT ALL ON public.profiles TO service_role, authenticated;
