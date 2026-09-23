/**
 * Filter a Supabase query by tour start_time slot.
 *
 * PostgREST's `is` operator only accepts null/true/false — passing a time
 * string like "10:00" returns HTTP 400 and callers that do `data ?? []`
 * silently count 0. `eq` with null emits `eq.null`, which never matches
 * SQL NULL on a `time` column.
 *
 * Usage: filterBySlot(query, startTime) where startTime is string | null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterBySlot(query: any, startTime: string | null | undefined): any {
  return startTime ? query.eq("start_time", startTime) : query.is("start_time", null);
}
