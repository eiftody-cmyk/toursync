"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ReferralPartner } from "@/config/referral-partners";

interface JoinResponse {
  partner?: string;
  slug?: string;
  display_name?: string;
  url?: string;
  existing?: boolean;
  error?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      getResponse: (id?: number) => string | undefined;
      reset: (id?: number) => void;
    };
  }
}

export function JoinClient({
  partner,
  turnstileSiteKey,
}: {
  partner: ReferralPartner;
  turnstileSiteKey: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<JoinResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const turnstileDiv = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  // Explicit Turnstile render (same site key as /book/manage).
  useEffect(() => {
    if (!turnstileSiteKey) return;
    const renderWidget = () => {
      if (!turnstileDiv.current || !window.turnstile || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(turnstileDiv.current, {
        sitekey: turnstileSiteKey,
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
      });
    };

    // Match by src, not id: /book/manage appends the implicit-render copy
    // with no id, and loading api.js twice in one session breaks rendering.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (existing) {
      if (window.turnstile) renderWidget();
      else existing.addEventListener("load", renderWidget, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  // QR for the personal referral URL (client-side, no tracking).
  useEffect(() => {
    if (!result?.url) return;
    QRCode.toDataURL(result.url, {
      width: 640,
      margin: 2,
      color: { dark: "#1a1613", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((e) => console.error("[RefJoin] QR render failed:", e));
  }, [result?.url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/ref/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partner: partner.slug,
          display_name: name,
          contact,
          token,
        }),
      });
      const data = (await res.json()) as JoinResponse;
      if (!res.ok || !data.url || !data.slug) {
        setError(data.error ?? "Something went wrong — try again.");
        if (window.turnstile && widgetId.current !== null) {
          window.turnstile.reset(widgetId.current);
          setToken("");
        }
        return;
      }
      setResult(data);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyUrl() {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the URL is visible on screen to copy manually.
    }
  }

  if (result) {
    const pageUrl = `/ref/${result.partner}-${result.slug}`;
    return (
      <Card className="border-border">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <div>
            <h1 className="text-xl font-bold">
              {result.existing ? "You're already set up" : "You're all set"}
              , {result.display_name}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              This is your QR code. Give it to customers — when they book through
              it, you receive <strong>¥1,500 per guest</strong>.
            </p>
          </div>

          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`Referral QR code for ${result.display_name}`}
              className="w-60 h-60 rounded-lg bg-white p-2 shadow"
            />
          ) : (
            <div className="w-60 h-60 rounded-lg bg-muted animate-pulse" />
          )}

          <p className="text-sm font-mono break-all text-muted-foreground">
            {pageUrl}
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={copyUrl} variant={copied ? "secondary" : "default"}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
            {qrDataUrl && (
              <a href={qrDataUrl} download={`referral-qr-${result.slug}.png`}>
                <Button variant="outline">Save QR image</Button>
              </a>
            )}
            <Button variant="outline" asChild>
              <a href={pageUrl} target="_blank" rel="noreferrer">
                Open my page
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: screenshot this or save the image. You can come back here any
            time — entering the same LINE ID or email brings up the same QR.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Recommended by
          </p>
          <p className="font-bold text-lg">{partner.displayName}</p>
          <h1 className="text-xl font-bold mt-4">Get your referral QR</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customers scan your personal QR, book the Osaka Castle tour — you get{" "}
            <strong>¥1,500 per guest</strong>. Takes about 10 seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ref-name">Name</Label>
            <Input
              id="ref-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Yuki"
              maxLength={40}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ref-contact">LINE ID or email</Label>
            <Input
              id="ref-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="@yuki_line or yuki@example.com"
              maxLength={100}
              autoComplete="off"
              inputMode="email"
              required
            />
            <p className="text-xs text-muted-foreground">
              This is how Edward pays you — and how your QR stays yours if you
              ever come back.
            </p>
          </div>

          {turnstileSiteKey && (
            <div>
              <div ref={turnstileDiv} className="cf-turnstile" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating…" : "Get my QR"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
