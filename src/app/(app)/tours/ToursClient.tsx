"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Tour, TourChannelListing, TourPricingCategory, Channel } from "@/types";
import { CHANNEL_LABELS, CHANNELS } from "@/types";
import { ScheduleEditor } from "@/components/tours/ScheduleEditor";

const GYG_CATEGORIES = ["ADULT", "CHILD", "YOUTH", "INFANT", "SENIOR", "STUDENT"] as const;
const GYG_GROUP_CATEGORIES = ["GROUP"] as const;

type ListingsByTour = Record<string, TourChannelListing[]>;

const CODE_PATTERNS: Record<Channel, RegExp> = {
  viator: /^\d{7}P\d+$/,
  gyg: /^T-\d+$/,
  travelio: /^PRD-[A-Z0-9]{6}$/,
};

function validateCode(channel: Channel, code: string): string | null {
  if (!code.trim()) return "Code is required";
  if (!CODE_PATTERNS[channel].test(code.trim())) {
    if (channel === "viator") return "Format: 5636104P1, 5636104P6, etc.";
    if (channel === "gyg") return "Format: T-1221780";
    if (channel === "travelio") return "Format: PRD-XXXXXX (6 uppercase alphanumeric)";
  }
  return null;
}

export function ToursClient({
  initialTours,
  initialListings,
}: {
  initialTours: Tour[];
  initialListings: TourChannelListing[];
}) {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [listings, setListings] = useState<TourChannelListing[]>(initialListings);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    capacity: string;
    price: string;
    currency: string;
    cutoff_minutes: string;
    product_type: "time_point" | "time_period";
    ticket_type: "individual" | "group";
    group_size_min: string;
    group_size_max: string;
    opening_from: string;
    opening_to: string;
  }>({
    name: "",
    description: "",
    capacity: "6",
    price: "9500",
    currency: "JPY",
    cutoff_minutes: "60",
    product_type: "time_point",
    ticket_type: "individual",
    group_size_min: "1",
    group_size_max: "10",
    opening_from: "09:00",
    opening_to: "18:00",
  });
  const [pricingCategories, setPricingCategories] = useState<
    Array<{ category: string; price: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  // Channel listing form state
  const [addingChannel, setAddingChannel] = useState<string | null>(null); // tour_id or null
  const [channelForm, setChannelForm] = useState<{ channel: Channel; code: string }>({
    channel: "viator",
    code: "",
  });
  const [channelLoading, setChannelLoading] = useState(false);

  const listingsByTour: ListingsByTour = {};
  for (const l of listings) {
    if (!listingsByTour[l.tour_id]) listingsByTour[l.tour_id] = [];
    listingsByTour[l.tour_id].push(l);
  }

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from("tours").select("*").order("created_at");
    if (data) setTours(data as Tour[]);
    const { data: lData } = await supabase.from("tour_channel_listings").select("*").order("created_at");
    if (lData) setListings(lData as TourChannelListing[]);
  }

  function startCreate() {
    setEditing(null);
    setForm({
      name: "", description: "", capacity: "6", price: "9500", currency: "JPY", cutoff_minutes: "60",
      product_type: "time_point", ticket_type: "individual",
      group_size_min: "1", group_size_max: "10",
      opening_from: "09:00", opening_to: "18:00",
    });
    setPricingCategories([{ category: "ADULT", price: "9500" }]);
    setOpen(true);
  }

  function startEdit(t: Tour) {
    setEditing(t);
    const oh = t.opening_hours as { fromTime?: string; toTime?: string } | null;
    setForm({
      name: t.name,
      description: t.description ?? "",
      capacity: String(t.capacity),
      price: t.price != null ? String(t.price) : "",
      currency: t.currency || "JPY",
      cutoff_minutes: String(t.cutoff_minutes ?? 60),
      product_type: t.product_type ?? "time_point",
      ticket_type: t.ticket_type ?? "individual",
      group_size_min: String(t.group_size_min ?? 1),
      group_size_max: String(t.group_size_max ?? 10),
      opening_from: oh?.fromTime ?? "09:00",
      opening_to: oh?.toTime ?? "18:00",
    });
    loadPricingCategories(t.id);
    setOpen(true);
  }

  async function loadPricingCategories(tourId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("tour_pricing_categories")
      .select("category, price")
      .eq("tour_id", tourId)
      .order("category");
    if (data?.length) {
      setPricingCategories(data.map((pc) => ({ category: pc.category, price: String(pc.price) })));
    } else {
      // Default to ADULT with tour price
      setPricingCategories([{ category: "ADULT", price: form.price || "0" }]);
    }
  }

  async function submit() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      capacity: parseInt(form.capacity, 10) || 6,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency.trim() || "JPY",
      cutoff_minutes: parseInt(form.cutoff_minutes, 10) || 60,
      product_type: form.product_type,
      ticket_type: form.ticket_type,
      group_size_min: parseInt(form.group_size_min, 10) || 1,
      group_size_max: parseInt(form.group_size_max, 10) || 10,
      opening_hours: form.product_type === "time_period"
        ? { fromTime: form.opening_from, toTime: form.opening_to }
        : null,
    };

    let error;
    let newTourId: string | null = null;
    if (editing) {
      const res = await supabase.from("tours").update(payload).eq("id", editing.id);
      error = res.error;
    } else {
      const res = await supabase.from("tours").insert(payload).select("id").single();
      error = res.error;
      newTourId = res.data?.id ?? null;
    }

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Save pricing categories
    const tourId = editing?.id ?? newTourId;
    if (tourId) {
      // Delete existing categories
      await supabase.from("tour_pricing_categories").delete().eq("tour_id", tourId);

      // Insert new categories (only non-empty prices)
      const validCategories = pricingCategories.filter((pc) => pc.price && pc.category);
      if (validCategories.length > 0) {
        const catPayload = validCategories.map((pc) => ({
          tour_id: tourId,
          category: pc.category,
          price: parseInt(pc.price, 10) || 0,
          currency: form.currency.trim() || "JPY",
        }));
        await supabase.from("tour_pricing_categories").insert(catPayload);
      }
    }

    setLoading(false);
    toast.success(editing ? "Tour updated" : "Tour created");
    setOpen(false);
    refresh();
    if (newTourId) {
      fetch("/api/calendar/create-tour-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: newTourId }),
      })
        .then((r) => r.json())
        .then((j) => {
          if (j.calendar_id) toast.success(`Calendar created: ${j.summary}`);
        })
        .catch(() => {});
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this tour? Bookings and blocks for this tour will be removed.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Tour deleted");
      refresh();
    }
  }

  // Channel listing handlers
  function startAddChannel(tourId: string) {
    setAddingChannel(tourId);
    // Auto-suggest next available channel
    const existing = (listingsByTour[tourId] ?? []).map((l) => l.channel);
    const next = CHANNELS.find((c) => !existing.includes(c)) ?? "viator";
    setChannelForm({ channel: next, code: "" });
  }

  async function saveChannel(tourId: string) {
    const err = validateCode(channelForm.channel, channelForm.code);
    if (err) {
      toast.error(err);
      return;
    }
    setChannelLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setChannelLoading(false);
      return;
    }

    const { error } = await supabase.from("tour_channel_listings").upsert(
      {
        tour_id: tourId,
        user_id: user.id,
        channel: channelForm.channel,
        external_product_code: channelForm.code.trim(),
        is_active: true,
      },
      { onConflict: "tour_id,channel" }
    );

    setChannelLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${CHANNEL_LABELS[channelForm.channel]} code saved`);
      setAddingChannel(null);
      refresh();
    }
  }

  async function toggleListingActive(listing: TourChannelListing) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tour_channel_listings")
      .update({ is_active: !listing.is_active })
      .eq("id", listing.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`${CHANNEL_LABELS[listing.channel]} ${listing.is_active ? "deactivated" : "activated"}`);
      refresh();
    }
  }

  async function removeListing(listing: TourChannelListing) {
    if (!confirm(`Remove ${CHANNEL_LABELS[listing.channel]} code ${listing.external_product_code}?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("tour_channel_listings").delete().eq("id", listing.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`${CHANNEL_LABELS[listing.channel]} removed`);
      refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{tours.length} tour{tours.length !== 1 && "s"}</p>
        <Button onClick={startCreate}>+ New Tour</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Tour" : "New Tour"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Warrior Monks, a Peasant, and a Shogun"
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="150-min investigative tour..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="cap">Capacity</Label>
                  <Input
                    id="cap"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Base Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="curr">Currency</Label>
                  <Select value={form.currency ?? "JPY"} onValueChange={(v: string | null) => setForm({ ...form, currency: v ?? "JPY" })}>
                    <SelectTrigger id="curr">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JPY">¥ JPY</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                      <SelectItem value="AUD">A$ AUD</SelectItem>
                      <SelectItem value="CAD">C$ CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="cutoff">Booking Cutoff (minutes before start)</Label>
                <Input
                  id="cutoff"
                  type="number"
                  min={0}
                  value={form.cutoff_minutes}
                  onChange={(e) => setForm({ ...form, cutoff_minutes: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Default: 60 minutes. Set to 0 for no cutoff.</p>
              </div>

              {/* Product Type & Ticket Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="product_type">Product Type</Label>
                  <Select value={form.product_type} onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, product_type: v as "time_point" | "time_period" });
                  }}>
                    <SelectTrigger id="product_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_point">Time Point (specific start times)</SelectItem>
                      <SelectItem value="time_period">Time Period (opening hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ticket_type">Ticket Type</Label>
                  <Select value={form.ticket_type} onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, ticket_type: v as "individual" | "group" });
                  }}>
                    <SelectTrigger id="ticket_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual (per-person tickets)</SelectItem>
                      <SelectItem value="group">Group (collective tickets)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Opening Hours (Time Period only) */}
              {form.product_type === "time_period" && (
                <div className="grid grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
                  <div>
                    <Label htmlFor="open_from">Opening Time</Label>
                    <Input
                      id="open_from"
                      type="time"
                      value={form.opening_from}
                      onChange={(e) => setForm({ ...form, opening_from: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="open_to">Closing Time</Label>
                    <Input
                      id="open_to"
                      type="time"
                      value={form.opening_to}
                      onChange={(e) => setForm({ ...form, opening_to: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Group Size (Group only) */}
              {form.ticket_type === "group" && (
                <div className="grid grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
                  <div>
                    <Label htmlFor="gs_min">Min Group Size</Label>
                    <Input
                      id="gs_min"
                      type="number"
                      min={1}
                      value={form.group_size_min}
                      onChange={(e) => setForm({ ...form, group_size_min: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gs_max">Max Group Size</Label>
                    <Input
                      id="gs_max"
                      type="number"
                      min={1}
                      value={form.group_size_max}
                      onChange={(e) => setForm({ ...form, group_size_max: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Pricing Categories */}
              <div className="space-y-2">
                <Label>Pricing Categories</Label>
                <p className="text-xs text-muted-foreground">Set prices per ticket type. For Group products, use GROUP category.</p>
                {pricingCategories.map((pc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select
                      value={pc.category}
                      onValueChange={(v) => {
                        const updated = [...pricingCategories];
                        updated[idx] = { ...updated[idx], category: v ?? pc.category };
                        setPricingCategories(updated);
                      }}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(form.ticket_type === "group" ? [...GYG_CATEGORIES, ...GYG_GROUP_CATEGORIES] : GYG_CATEGORIES).map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 text-xs flex-1"
                      placeholder="Price"
                      value={pc.price}
                      onChange={(e) => {
                        const updated = [...pricingCategories];
                        updated[idx] = { ...updated[idx], price: e.target.value };
                        setPricingCategories(updated);
                      }}
                    />
                    {pricingCategories.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setPricingCategories(pricingCategories.filter((_, i) => i !== idx))}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {pricingCategories.length < GYG_CATEGORIES.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const used = new Set(pricingCategories.map((pc) => pc.category));
                      const next = GYG_CATEGORIES.find((c) => !used.has(c));
                      if (next) {
                        setPricingCategories([...pricingCategories, { category: next, price: "" }]);
                      }
                    }}
                  >
                    + Add Category
                  </Button>
                )}
              </div>
              <Button onClick={submit} disabled={loading} className="w-full">
                {loading ? "Saving..." : editing ? "Save Changes" : "Create Tour"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tours.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground text-center">
            No tours yet. Create one to start blocking dates and tracking capacity.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tours.map((t) => {
            const tourListings = listingsByTour[t.id] ?? [];
            return (
              <Card key={t.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{t.name}</span>
                    <Badge variant="secondary">
                      {t.capacity} guests · {t.price ? `${t.price} ${t.currency}` : "no price"} · {t.cutoff_minutes ?? 60}min cutoff · {t.product_type === "time_period" ? "Time Period" : "Time Point"} · {t.ticket_type === "group" ? "Group" : "Individual"}
                    </Badge>
                  </CardTitle>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Channel listings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Channel Codes</p>
                      {addingChannel !== t.id && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => startAddChannel(t.id)}>
                          + Add
                        </Button>
                      )}
                    </div>

                    {tourListings.length > 0 && (
                      <div className="space-y-1">
                        {tourListings.map((l) => (
                          <div key={l.id} className="flex items-center gap-2 text-sm">
                            <Badge variant={l.is_active ? "default" : "outline"} className="w-20 justify-center text-xs">
                              {CHANNEL_LABELS[l.channel]}
                            </Badge>
                            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.external_product_code}</code>
                            <Switch
                              checked={l.is_active}
                              onCheckedChange={() => toggleListingActive(l)}
                              className="scale-75"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeListing(l)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {tourListings.length === 0 && addingChannel !== t.id && (
                      <p className="text-xs text-muted-foreground italic">No channel codes yet</p>
                    )}

                    {addingChannel === t.id && (
                      <div className="flex items-end gap-2 border rounded-md p-2 bg-muted/30">
                        <div className="flex-1">
                          <Label className="text-xs">Channel</Label>
                          <Select
                            value={channelForm.channel}
                            onValueChange={(v: string | null) => {
                              if (v) setChannelForm({ ...channelForm, channel: v as Channel });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHANNELS.filter((c) => !(listingsByTour[t.id] ?? []).some((l) => l.channel === c)).map((c) => (
                                <SelectItem key={c} value={c}>
                                  {CHANNEL_LABELS[c]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Product Code</Label>
                          <Input
                            className="h-8 text-xs font-mono"
                            placeholder={
                              channelForm.channel === "viator"
                                ? "5636104P1"
                                : channelForm.channel === "gyg"
                                  ? "T-1221780"
                                  : channelForm.channel === "travelio"
                                    ? "PRD-XXXXXX"
                                    : "calendar URL or code"
                            }
                            value={channelForm.code}
                            onChange={(e) => setChannelForm({ ...channelForm, code: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveChannel(t.id);
                            }}
                          />
                        </div>
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() => saveChannel(t.id)}
                          disabled={channelLoading}
                        >
                          {channelLoading ? "..." : "Save"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => setAddingChannel(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Tour schedule */}
                  <div className="border-t pt-3">
                    <ScheduleEditor tourId={t.id} />
                  </div>

                  {/* Tour actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(t)}>
                      Edit Tour
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/book?tour=${t.id}`} target="_blank" rel="noopener noreferrer">
                        Booking Page
                      </a>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(t.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
