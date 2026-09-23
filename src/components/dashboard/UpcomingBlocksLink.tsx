"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlockedDate } from "@/types";

export function UpcomingBlocksLink({ blocked }: { blocked: BlockedDate[] }) {
  const count = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return blocked.filter((b) => b.date >= todayStr).length;
  }, [blocked]);

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Upcoming blocks:{" "}
            <span className="font-medium text-foreground">{count}</span>
          </span>
          <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2">
            <Link href="/calendar">Calendar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
