"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_COMMISSION_RATES, COMMISSION_LABELS } from "@/lib/revenue";


type Rates = Record<string, number>;

const RATE_KEYS = ["airbnb", "viator", "gyg", "travelio", "direct", "walk_in", "other"] as const;

export function CommissionSettingsCard({
  initialRates,
}: {
  initialRates: Rates | null;
}) {
  const [rates, setRates] = useState<Rates>(initialRates ?? { ...DEFAULT_COMMISSION_RATES });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("operator_settings")
      .upsert(
        { user_id: user.id, commission_rates: rates, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Commission rates saved");
    }
  }

  function updateRate(key: string, value: string) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) return;
    setRates((prev) => ({ ...prev, [key]: num }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform Commission Rates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Set the commission percentage each platform charges. These are used to calculate net revenue on your dashboard.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {RATE_KEYS.map((key) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{COMMISSION_LABELS[key]}</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={rates[key] ?? 0}
                  onChange={(e) => updateRate(key, e.target.value)}
                  className="w-20 text-sm h-8"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Rates"}
        </Button>
      </CardContent>
    </Card>
  );
}
