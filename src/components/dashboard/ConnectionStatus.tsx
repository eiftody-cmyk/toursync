"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Tour } from "@/types";

type TokenInfo = { calendar_id: string | null; token_expiry: string | null } | null;

export function ConnectionStatus({
  tokens,
  tours,
}: {
  tokens: TokenInfo;
  tours: Tour[];
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);

  const channels = useMemo(() => {
    const connected = new Set<string>();
    for (const tour of tours) {
      const listings = (
        tour as Tour & {
          tour_channel_listings?: Array<{ channel: string; is_active: boolean }>;
        }
      ).tour_channel_listings;
      if (listings) {
        for (const l of listings) {
          if (l.is_active) connected.add(l.channel);
        }
      }
    }
    return connected;
  }, [tours]);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/calendar/test", { method: "POST" });
      setTestResult(res.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    }
    setTesting(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="text-muted-foreground">Connections:</span>
            <ConnectionBadge
              name="Google Calendar"
              connected={!!tokens}
              testResult={testResult}
            />
            {(["viator", "gyg", "travelio", "airbnb"] as const).map((ch) => (
              <ConnectionBadge
                key={ch}
                name={
                  ch === "gyg"
                    ? "GYG"
                    : ch.charAt(0).toUpperCase() + ch.slice(1)
                }
                connected={channels.has(ch)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? "Testing…" : "Test Google"}
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2">
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionBadge({
  name,
  connected,
  testResult,
}: {
  name: string;
  connected: boolean;
  testResult?: "ok" | "fail" | null;
}) {
  if (testResult === "ok" && name === "Google Calendar") {
    return (
      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
        {name} connected
      </Badge>
    );
  }
  if (testResult === "fail" && name === "Google Calendar") {
    return <Badge variant="destructive" className="text-[10px]">{name} failed</Badge>;
  }
  if (connected) {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground">
        {name} configured
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] text-muted-foreground opacity-50">
      {name} not configured
    </Badge>
  );
}
