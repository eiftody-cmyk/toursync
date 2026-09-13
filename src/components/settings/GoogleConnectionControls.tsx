"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Busy = "idle" | "testing" | "syncing";

export function GoogleConnectionControls() {
  const [busy, setBusy] = useState<Busy>("idle");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function run(path: string, mode: Exclude<Busy, "idle">) {
    setBusy(mode);
    setMessage(null);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && data.ok === false && !data.synced)) {
        setMessage({ kind: "err", text: data.error || "Request failed" });
      } else if (path.endsWith("/test")) {
        setMessage({
          kind: "ok",
          text: `Connection OK — calendar "${data.calendarId ?? "primary"}" is writable.`,
        });
      } else {
        const failedCount = Array.isArray(data.failed) ? data.failed.length : 0;
        setMessage({
          kind: failedCount ? "err" : "ok",
          text: `Synced ${data.synced ?? 0} pending block(s) to Google` +
            (failedCount ? `; ${failedCount} failed — see Cloudflare logs` : "."),
        });
      }
    } catch {
      setMessage({ kind: "err", text: "Network error" });
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== "idle"}
          onClick={() => run("/api/calendar/test", "testing")}
        >
          {busy === "testing" ? "Testing…" : "Test connection"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== "idle"}
          onClick={() => run("/api/calendar/sync", "syncing")}
        >
          {busy === "syncing" ? "Syncing…" : "Sync pending blocks to Google"}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${message.kind === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}