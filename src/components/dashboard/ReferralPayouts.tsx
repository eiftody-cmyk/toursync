"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { isPartner } from "@/config/referral-partners";
import { calcCommission } from "@/lib/revenue";
import type { Booking, Tour } from "@/types";

export interface StaffRow {
  partner: string;
  slug: string;
  display_name: string;
  contact: string | null;
}

interface AttributionGroup {
  key: string;
  name: string;
  contact: string | null;
  partner: string;
  bookings: number;
  guests: number;
  payout: number;
}

function yen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

function addBooking(
  map: Map<string, AttributionGroup>,
  key: string,
  name: string,
  contact: string | null,
  partner: string,
  booking: Booking,
  payout: number
) {
  let group = map.get(key);
  if (!group) {
    group = { key, name, contact, partner, bookings: 0, guests: 0, payout: 0 };
    map.set(key, group);
  }
  group.bookings += 1;
  group.guests += booking.guest_count;
  group.payout += payout;
}

/**
 * Admin payout report (registration ≠ payout):
 *   1. registered staff — confirmed bookings attributed to a referral_staff
 *      slug (payable at booking value × that partner's payout rate)
 *   2. manual attribution — partner bookings whose referrer_staff text does
 *      not match a registered slug (payable, human-verify the name)
 *   3. unattributed — confirmed bookings without a partner referral (¥0)
 * Cancelled bookings are excluded upstream (dashboard fetch is
 * status='confirmed').
 */
export function ReferralPayouts({
  bookings,
  staff,
  tours,
  rates,
}: {
  bookings: Booking[];
  staff: StaffRow[];
  tours: Tour[];
  rates: Record<string, number> | null;
}) {
  const year = new Date().getFullYear();

  const { registered, manual, unattributed } = useMemo(() => {
    const regMap = new Map<string, AttributionGroup>();
    const manMap = new Map<string, AttributionGroup>();
    const un: AttributionGroup = {
      key: "none",
      name: "No referral (direct/OTA)",
      contact: null,
      partner: "—",
      bookings: 0,
      guests: 0,
      payout: 0,
    };

    const staffKeys = new Set(staff.map((s) => `${s.partner}:${s.slug}`));
    const staffByKey = new Map(staff.map((s) => [`${s.partner}:${s.slug}`, s]));
    const priceById = new Map(tours.map((t) => [t.id, t.price]));

    for (const b of bookings) {
      const source = b.source ?? "";
      if (!isPartner(source)) {
        un.bookings += 1;
        un.guests += b.guest_count;
        continue;
      }
      const price = priceById.get(b.tour_id) ?? 0;
      const payout = calcCommission(source, price, b.guest_count, rates);
      const value = b.referrer_staff?.trim() || "";
      const key = `${source}:${value}`;
      if (value && staffKeys.has(key)) {
        const row = staffByKey.get(key)!;
        addBooking(regMap, key, row.display_name, row.contact, source, b, payout);
      } else {
        addBooking(
          manMap,
          key || `${source}:(none)`,
          value || "(no name)",
          null,
          source,
          b,
          payout
        );
      }
    }

    const byPayout = (a: AttributionGroup, c: AttributionGroup) =>
      c.payout - a.payout || a.name.localeCompare(c.name);

    return {
      registered: [...regMap.values()].sort(byPayout),
      manual: [...manMap.values()].sort(byPayout),
      unattributed: un,
    };
  }, [bookings, staff, tours, rates]);

  const totalPayout =
    registered.reduce((s, g) => s + g.payout, 0) +
    manual.reduce((s, g) => s + g.payout, 0);

  const partnerBookings = registered.length + manual.length;
  if (partnerBookings === 0 && staff.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Referral payouts</CardTitle>
          <Badge variant="secondary">
            {yen(totalPayout)} payable
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Confirmed bookings in {year} · registration alone never pays out
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h4 className="text-sm font-medium mb-2">Registered staff</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Guests</TableHead>
                <TableHead className="text-right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => {
                const g = registered.find((x) => x.key === `${s.partner}:${s.slug}`);
                return (
                  <TableRow key={`${s.partner}:${s.slug}`}>
                    <TableCell className="text-sm font-medium">
                      {s.display_name}
                      <span className="ml-1.5 text-[10px] text-muted-foreground">
                        /ref/{s.partner}-{s.slug}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{s.partner}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.contact || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {g?.bookings ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {g?.guests ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {yen(g?.payout ?? 0)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {staff.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-xs text-muted-foreground py-4"
                  >
                    No staff registered yet — share a partner QR or send
                    /ref/join?partner=… links.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {manual.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Manual attribution{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (typed name, verify identity before paying)
              </span>
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name on booking</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Guests</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manual.map((g) => (
                  <TableRow key={g.key}>
                    <TableCell className="text-sm font-medium">{g.name}</TableCell>
                    <TableCell className="text-xs">{g.partner}</TableCell>
                    <TableCell className="text-right text-sm">
                      {g.bookings}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {g.guests}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {yen(g.payout)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Unattributed</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Guests</TableHead>
                <TableHead className="text-right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm">{unattributed.name}</TableCell>
                <TableCell className="text-right text-sm">
                  {unattributed.bookings}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {unattributed.guests}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  —
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
}
