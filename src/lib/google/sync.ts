import type { SupabaseClient } from "@supabase/supabase-js";
import { GoogleDisconnectedError } from "./auth";
import {
  createBusyEvent,
  deleteCalendarEvent,
  getCalendarIdForTour,
  getValidAccessTokenWithClient,
} from "./calendar";

/** Single gate for outbound Google Calendar pushes (OTA_SYNC_ENABLED). */
export function isGoogleSyncEnabled(): boolean {
  return process.env.OTA_SYNC_ENABLED === "true";
}

export type BlockSlotParams = {
  supabase: SupabaseClient;
  userId: string;
  tourId: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  summary?: string;
  description?: string;
  isAutoBlocked?: boolean;
};

export type BlockSlotResult = {
  eventId: string | null;
  calendarId: string | null;
  blockedRowId: string | null;
  skipped: boolean;
  warning?: string;
  error?: string;
};

function slotQuery(
  supabase: SupabaseClient,
  params: { userId: string; tourId: string; date: string; startTime?: string | null }
) {
  const q = supabase
    .from("blocked_dates")
    .select("*")
    .eq("user_id", params.userId)
    .eq("tour_id", params.tourId)
    .eq("date", params.date);
  const start = params.startTime ?? null;
  return start ? q.eq("start_time", start) : q.is("start_time", null);
}

async function insertBlockedRow(
  supabase: SupabaseClient,
  row: Record<string, unknown>
) {
  let result = await supabase.from("blocked_dates").insert(row).select("id");
  if (
    result.error &&
    (result.error.message?.includes("calendar_id") || result.error.code === "42703")
  ) {
    const { calendar_id: _calendarId, ...rest } = row;
    result = await supabase.from("blocked_dates").insert(rest).select("id");
  }
  return result;
}

async function cleanupGoogleEvent(
  supabase: SupabaseClient,
  userId: string,
  calendarId: string | null,
  eventId: string
) {
  if (!calendarId) return;
  try {
    const { accessToken } = await getValidAccessTokenWithClient(supabase, userId);
    await deleteCalendarEvent({ accessToken, calendarId, eventId });
  } catch (e) {
    console.error("[google/sync] cleanup Google event failed:", e instanceof Error ? e.message : e);
  }
}

/**
 * Create a Google busy event and persist the blocked_dates row together.
 * Idempotent: if the slot is already blocked, returns the existing event.
 * Server owns both the Google event and the DB row — no client insert needed.
 */
export async function blockSlot(params: BlockSlotParams): Promise<BlockSlotResult> {
  const { supabase, userId, tourId, date } = params;
  const startTime = params.startTime ?? null;
  const endTime = params.endTime ?? null;

  const existing = await slotQuery(supabase, { userId, tourId, date, startTime }).maybeSingle();
  if (existing.data?.google_calendar_event_id) {
    return {
      eventId: existing.data.google_calendar_event_id,
      calendarId: existing.data.calendar_id ?? null,
      blockedRowId: existing.data.id,
      skipped: true,
    };
  }

  if (!isGoogleSyncEnabled()) {
    if (!existing.data) {
      const insert = await insertBlockedRow(supabase, {
        tour_id: tourId,
        user_id: userId,
        date,
        start_time: startTime,
        end_time: endTime,
        reason: params.reason ?? null,
        google_calendar_event_id: null,
        calendar_id: null,
        is_auto_blocked: params.isAutoBlocked ?? false,
      });
      if (insert.error && insert.error.code !== "23505") {
        return { eventId: null, calendarId: null, blockedRowId: null, skipped: false, error: insert.error.message };
      }
    }
    return {
      eventId: null,
      calendarId: null,
      blockedRowId: existing.data?.id ?? null,
      skipped: true,
      warning: "OTA sync paused — local block only",
    };
  }

  let calendarId: string;
  let accessToken: string;
  try {
    ({ accessToken } = await getValidAccessTokenWithClient(supabase, userId));
    calendarId = await getCalendarIdForTour(supabase, tourId, userId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const disconnected = e instanceof GoogleDisconnectedError;
    if (!disconnected && !msg.includes("not connected") && !msg.includes("No valid")) {
      return { eventId: null, calendarId: null, blockedRowId: existing.data?.id ?? null, skipped: false, error: msg };
    }
    // Google not connected — still create/keep local block so Settings can surface it
    if (!existing.data) {
      await insertBlockedRow(supabase, {
        tour_id: tourId,
        user_id: userId,
        date,
        start_time: startTime,
        end_time: endTime,
        reason: params.reason ?? null,
        google_calendar_event_id: null,
        calendar_id: null,
        is_auto_blocked: params.isAutoBlocked ?? false,
      });
    }
    return {
      eventId: null,
      calendarId: null,
      blockedRowId: existing.data?.id ?? null,
      skipped: true,
      warning: "Google not connected; local block only. Reconnect in Settings.",
    };
  }

  const tourName = params.summary ?? `Blocked${params.reason ? ` - ${params.reason}` : ""}`;
  let event: { id?: string };
  try {
    event = await createBusyEvent({
      accessToken,
      calendarId,
      summary: tourName,
      description: params.description ?? (params.reason ? `Reason: ${params.reason}` : undefined),
      date,
      startTime: startTime ?? undefined,
      endTime: endTime ?? undefined,
    });
  } catch (e) {
    return {
      eventId: null,
      calendarId,
      blockedRowId: existing.data?.id ?? null,
      skipped: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const eventId = event.id;
  if (!eventId) {
    return {
      eventId: null,
      calendarId,
      blockedRowId: existing.data?.id ?? null,
      skipped: false,
      error: "Google Calendar event created without id",
    };
  }

  if (existing.data) {
    await supabase
      .from("blocked_dates")
      .update({ google_calendar_event_id: eventId, calendar_id: calendarId })
      .eq("id", existing.data.id);
    return { eventId, calendarId, blockedRowId: existing.data.id, skipped: false };
  }

  const insert = await insertBlockedRow(supabase, {
    tour_id: tourId,
    user_id: userId,
    date,
    start_time: startTime,
    end_time: endTime,
    reason: params.reason ?? null,
    google_calendar_event_id: eventId,
    calendar_id: calendarId,
    is_auto_blocked: params.isAutoBlocked ?? false,
  });

  if (insert.error) {
    if (insert.error.code === "23505") {
      // Concurrent request already inserted a row — adopt it and clean up our event
      const row = await slotQuery(supabase, { userId, tourId, date, startTime }).maybeSingle();
      if (row.data?.google_calendar_event_id && row.data.google_calendar_event_id !== eventId) {
        await cleanupGoogleEvent(supabase, userId, calendarId, eventId);
        return {
          eventId: row.data.google_calendar_event_id,
          calendarId: row.data.calendar_id ?? calendarId,
          blockedRowId: row.data.id,
          skipped: true,
        };
      }
      if (row.data) {
        await supabase
          .from("blocked_dates")
          .update({ google_calendar_event_id: eventId, calendar_id: calendarId })
          .eq("id", row.data.id);
        return { eventId, calendarId, blockedRowId: row.data.id, skipped: false };
      }
    }
    // DB insert failed — remove orphan Google event so we don't lose track of it
    await cleanupGoogleEvent(supabase, userId, calendarId, eventId);
    return { eventId: null, calendarId, blockedRowId: null, skipped: false, error: insert.error.message };
  }

  const rowId = insert.data?.[0]?.id ?? null;
  return { eventId, calendarId, blockedRowId: rowId, skipped: false };
}

export type UnblockSlotParams = {
  supabase: SupabaseClient;
  blockedId: string;
};

export type UnblockSlotResult = {
  ok: boolean;
  googleDeleted: boolean;
  rowDeleted: boolean;
  error?: string;
};

/**
 * Delete the Google event first, then the DB row.
 * If Google delete fails, the DB row is kept so the delete can be retried
 * (never lose the event id).
 */
export async function unblockSlot(params: UnblockSlotParams): Promise<UnblockSlotResult> {
  const { supabase, blockedId } = params;

  const { data: blocked, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("id", blockedId)
    .single();

  if (error || !blocked) {
    return { ok: false, googleDeleted: false, rowDeleted: false, error: "Not found" };
  }

  if (blocked.google_calendar_event_id && blocked.calendar_id) {
    try {
      const { accessToken } = await getValidAccessTokenWithClient(supabase, blocked.user_id);
      await deleteCalendarEvent({
        accessToken,
        calendarId: blocked.calendar_id,
        eventId: blocked.google_calendar_event_id,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Keep the row so event id is not lost — retryable via unblock or sync
      console.error("[google/sync] unblock Google delete failed (row kept):", msg);
      return { ok: false, googleDeleted: false, rowDeleted: false, error: msg };
    }
  }

  await supabase.from("blocked_dates").delete().eq("id", blockedId);
  return { ok: true, googleDeleted: true, rowDeleted: true };
}

export type SyncPendingParams = {
  supabase: SupabaseClient;
  userId: string;
};

export type SyncPendingResult = {
  synced: string[];
  failed: { id: string; reason: string }[];
  total: number;
};

/** Backfill blocked_dates rows that have no google_calendar_event_id. */
export async function syncPendingBlocks(params: SyncPendingParams): Promise<SyncPendingResult> {
  const { supabase, userId } = params;

  const { data: pending, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("user_id", userId)
    .is("google_calendar_event_id", null)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);

  const synced: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  for (const row of pending ?? []) {
    try {
      const { accessToken } = await getValidAccessTokenWithClient(supabase, userId);
      const calendarId = row.tour_id
        ? await getCalendarIdForTour(supabase, row.tour_id, userId)
        : row.calendar_id ?? "primary";

      const data = await createBusyEvent({
        accessToken,
        calendarId,
        summary: row.reason ? `Blocked - ${row.reason}` : "Blocked",
        description: row.reason ? `Reason: ${row.reason}` : undefined,
        date: row.date,
        startTime: row.start_time ?? undefined,
        endTime: row.end_time ?? undefined,
      });

      await supabase
        .from("blocked_dates")
        .update({ google_calendar_event_id: data.id, calendar_id: calendarId })
        .eq("id", row.id);

      synced.push(row.id);
    } catch (e) {
      failed.push({ id: row.id, reason: e instanceof Error ? e.message : String(e) });
    }
  }

  return { synced, failed, total: pending?.length ?? 0 };
}
