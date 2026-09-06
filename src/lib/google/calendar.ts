import { google } from "googleapis";
import { decryptToken } from "./auth";
import { nextDay } from "@/lib/time";

/** Create a new Google Calendar for a specific tour */
export async function createCalendarForTour(
  accessToken: string,
  tourName: string
): Promise<{ id: string; summary: string }> {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.calendars.insert({
    requestBody: {
      summary: `ExperienceRelay — ${tourName}`,
      timeZone: "Asia/Tokyo",
    },
  });
  return { id: res.data.id!, summary: res.data.summary ?? tourName };
}

/** Delete a Google Calendar (not primary) */
export async function deleteCalendarFromGoogle(
  accessToken: string,
  calendarId: string
) {
  const calendar = getCalendarClient(accessToken);
  await calendar.calendars.delete({ calendarId });
}

/** Get the Google calendar_id for a specific tour — falls back to primary calendar */
export async function getCalendarIdForTour(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  tourId: string,
  userId?: string
): Promise<string> {
  const { data: tour, error } = await supabase
    .from("tours")
    .select("google_calendar_id, user_id")
    .eq("id", tourId)
    .single();
  if (error) throw new Error(`Could not read tour calendar: ${error.message}`);
  if (tour?.google_calendar_id && tour.google_calendar_id !== "primary") {
    return tour.google_calendar_id;
  }
  const uid = userId ?? tour?.user_id;
  if (!uid) return "primary";
  const { data: tokens } = await supabase
    .from("google_tokens")
    .select("calendar_id")
    .eq("user_id", uid)
    .maybeSingle();
  return tokens?.calendar_id ?? "primary";
}

export function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

export async function createBusyEvent(params: {
  accessToken: string;
  calendarId?: string;
  summary: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}) {
  const calendar = getCalendarClient(params.accessToken);
  const calendarId = params.calendarId;
  if (!calendarId) throw new Error("calendarId required — tour has no per-tour calendar");

  const timeZone = "Asia/Tokyo";
  let start: { date?: string; dateTime?: string; timeZone?: string };
  let end: { date?: string; dateTime?: string; timeZone?: string };

  if (params.startTime && params.endTime) {
    start = { dateTime: `${params.date}T${params.startTime}:00`, timeZone };
    end = { dateTime: `${params.date}T${params.endTime}:00`, timeZone };
  } else if (params.startTime) {
    // If only start, block 8 hours (typical tour day)
    start = { dateTime: `${params.date}T${params.startTime}:00`, timeZone };
    end = { dateTime: `${params.date}T23:59:00`, timeZone };
  } else {
    // All-day busy event
    // Google all-day uses date (no time) and end is exclusive
    const nextDayStr = nextDay(params.date);
    start = { date: params.date };
    end = { date: nextDayStr };
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start,
      end,
      transparency: "opaque", // marks as "busy" — Google pushes this to Airbnb immediately
      visibility: "private",
      status: "confirmed",
    },
  });

  return res.data;
}

export async function deleteCalendarEvent(params: {
  accessToken: string;
  calendarId?: string;
  eventId: string;
}) {
  const calendar = getCalendarClient(params.accessToken);
  const calendarId = params.calendarId;
  if (!calendarId) throw new Error("calendarId required — cannot delete event without calendar");

  await calendar.events.delete({
    calendarId,
    eventId: params.eventId,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getValidAccessToken(_userId: string): Promise<{
  accessToken: string;
  calendarId: string;
}> {
  // This is called from server routes — we fetch from Supabase
  // Decrypt and refresh if needed. The caller passes Supabase client.
  // Keeping logic here for reuse.
  throw new Error("Use getValidAccessTokenWithClient — see api route");
}

export async function getValidAccessTokenWithClient(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<{ accessToken: string; calendarId: string }> {
  const { data, error } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Google Calendar not connected");

  let accessToken = data.access_token
    ? decryptToken(data.access_token)
    : null;

  // Check expiry (refresh 5 min early)
  const expiry = data.token_expiry ? new Date(data.token_expiry) : null;
  const needsRefresh = !expiry || expiry.getTime() - Date.now() < 5 * 60 * 1000;

  if (needsRefresh && data.refresh_token) {
    const refreshToken = decryptToken(data.refresh_token);
    const { refreshAccessToken } = await import("./auth");
    const tokens = await refreshAccessToken(refreshToken);
    accessToken = tokens.access_token;

    const { encryptToken } = await import("./auth");
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase
      .from("google_tokens")
      .update({
        access_token: encryptToken(tokens.access_token),
        token_expiry: newExpiry,
      })
      .eq("user_id", userId);
  }

  if (!accessToken) throw new Error("No valid access token");

  return { accessToken, calendarId: data.calendar_id ?? "primary" };
}
