"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@/lib/analytics";
import { sanitizeStaffName } from "@/lib/referral/misaki";
import type { ReferralTour } from "@/lib/referral/tour";
import "./referral.css";

interface PartnerInfo {
  slug: string;
  displayName: string;
}

export interface RegisteredStaff {
  slug: string;
  displayName: string;
}

const REVIEWS = [
  {
    text: "\"Edward's tour was a tour de force! I had visited what I thought was Osaka Castle 15 years ago and realise now that I only had a superficial view. The tour gave a thorough understanding of the historical significance of this iconic landmark to both Osaka and Japan as a whole. Such an interesting experience and Edward is an impeccable host. Thank you for showing us beyond the postcard and sharing your enthusiasm for Osaka. Highly recommend.\"",
    author: "Claire, Australia · Google",
    featured: true,
  },
  {
    text: "\"We had the most incredible experience with Edward exploring Osaka Castle. Edward was incredibly knowledgeable and so friendly. Seeing Osaka Castle through Edward's historical lens was an absolute highlight of our trip to Japan.\"",
    author: "David, Australia",
    featured: false,
  },
  {
    text: "\"Excellent storytelling combined with deep research. Finally Osaka gets a proper history tour.\"",
    author: "Timi, Singapore",
    featured: false,
  },
];

/**
 * Shared conversion page for /ref/{partner} and /ref/{partner}-{staff}
 * (and the legacy /misaki wrapper).
 *
 * Attribution modes:
 *   - registered staff QR → locked chip carrying the staff SLUG (guest can
 *     clear it via "Not …?" to fall back to free text)
 *   - partner QR (/ref/misaki, /misaki) → required typed staff name
 */
export function ReferralLanding({
  tour,
  partner,
  registeredStaff = null,
  initialStaff = null,
}: {
  tour: ReferralTour;
  partner: PartnerInfo;
  registeredStaff?: RegisteredStaff | null;
  initialStaff?: string | null;
}) {
  const [typed, setTyped] = useState(initialStaff ?? "");
  const [cleared, setCleared] = useState(false);
  const [staffError, setStaffError] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pageTracked = useRef(false);
  const staffTracked = useRef(false);

  // Locked until the guest explicitly clears it.
  const lockedStaff = registeredStaff && !cleared ? registeredStaff : null;
  const typedName = sanitizeStaffName(typed) ?? "";
  const attribution = lockedStaff ? lockedStaff.slug : typedName;
  const staffValid = attribution.length > 0;
  // Human-readable name for analytics display.
  const staffLabel = lockedStaff ? lockedStaff.displayName : typedName;

  useEffect(() => {
    if (pageTracked.current) return;
    pageTracked.current = true;
    track("misaki_page_view", {
      partner: partner.slug,
      staff_name: staffLabel || undefined,
      tour: tour.name,
      tour_id: tour.id,
    });
  }, [partner.slug, staffLabel, tour.name, tour.id]);

  // Keep the referral cookie fresh so attribution survives back-navigation.
  // Format: "<partner>|<staff>" (legacy misaki_ref values are read as
  // staff-only text for misaki by create-order).
  useEffect(() => {
    if (!staffValid) return;
    document.cookie = `ref_attr=${encodeURIComponent(
      `${partner.slug}|${attribution}`
    )}; max-age=31536000; path=/; SameSite=Lax`;
  }, [staffValid, attribution, partner.slug]);

  useEffect(() => {
    if (!staffValid || staffTracked.current) return;
    staffTracked.current = true;
    track("misaki_staff_identified", {
      partner: partner.slug,
      staff_name: staffLabel,
      tour: tour.name,
      tour_id: tour.id,
    });
  }, [staffValid, staffLabel, partner.slug, tour.name, tour.id]);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bookingHref = (() => {
    const qs = new URLSearchParams({ tour: tour.id, ref: partner.slug });
    if (attribution) qs.set("staff", attribution);
    // Display-only: /book shows "Referred by …"; never used for payout.
    if (lockedStaff) qs.set("name", lockedStaff.displayName);
    return `/book?${qs.toString()}`;
  })();
  const priceLabel = `¥${tour.price.toLocaleString()}`;
  const metaLine = `2.5 hours · English · ${priceLabel}/person · Small groups`;

  function handleCtaClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!staffValid) {
      e.preventDefault();
      setStaffError(true);
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const clearReferral = () => {
    setCleared(true);
    setStaffError(false);
    // Expire attribution cookies so a later direct /book visit (back-nav,
    // typed URL) can't re-attribute to the staff the guest just cleared.
    // Typing a replacement name re-sets ref_attr via the effect above.
    document.cookie = "ref_attr=; max-age=0; path=/; SameSite=Lax";
    document.cookie = "misaki_ref=; max-age=0; path=/; SameSite=Lax";
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="misaki-page">
      {/* 1. Referral attribution */}
      <header className="misaki-referral">
        <div className="misaki-referral-inner">
          <p className="misaki-referred-by">
            Recommended by <strong>{partner.displayName}</strong>
          </p>

          {lockedStaff ? (
            <>
              <div className="misaki-chip-row">
                <span className="misaki-chip">
                  Referred by <strong>{lockedStaff.displayName}</strong>
                </span>
                <button
                  type="button"
                  className="misaki-chip-clear"
                  aria-label={`Remove referral to ${lockedStaff.displayName}`}
                  onClick={clearReferral}
                >
                  ×
                </button>
              </div>
              <p className="misaki-staff-help">
                Your booking is tracked to {lockedStaff.displayName}.{" "}
                <button
                  type="button"
                  className="misaki-chip-change"
                  onClick={clearReferral}
                >
                  Not {lockedStaff.displayName}?
                </button>
              </p>
            </>
          ) : (
            <>
              <label className="misaki-staff-label" htmlFor="referral-staff">
                Staff member&apos;s name
              </label>
              <input
                id="referral-staff"
                ref={inputRef}
                type="text"
                className={`misaki-staff-input${staffError && !staffValid ? " invalid" : ""}`}
                placeholder="Enter name"
                value={typed}
                maxLength={40}
                autoComplete="off"
                autoCapitalize="words"
                onChange={(e) => {
                  setTyped(e.target.value);
                  if (staffError) setStaffError(false);
                }}
              />
              <p className="misaki-staff-help">
                Please enter the name of the {partner.displayName} staff member
                who recommended this experience.
              </p>
            </>
          )}

          {staffError && !staffValid && (
            <p className="misaki-staff-error">
              Please enter the staff member&apos;s name to continue.
            </p>
          )}
        </div>
      </header>

      {/* 2–6. Hero */}
      <section className="misaki-hero">
        <Image
          src="/images/toyotomicastle.webp"
          alt="Osaka Castle above its stone walls"
          fill
          priority
          sizes="100vw"
          className="misaki-hero-img"
        />
        <div className="misaki-hero-overlay" />
        <div className="misaki-hero-content">
          <p className="misaki-hero-eyebrow">{tour.name}</p>
          <h1>
            Walk Through the World of <span>Shōgun</span>
          </h1>
          <p className="misaki-hero-sub">Explore Osaka Castle with a Resident Historian</p>
          <p className="misaki-hero-copy">
            Step into the world of samurai, shōgun, and the great struggles that
            shaped Japan. Walk the actual landscape where the Toyotomi and
            Tokugawa conflict reached its climax.
          </p>
          <p className="misaki-hero-alt">
            The drama gives you the characters. We&apos;ll take you to the actual
            landscape where their world existed.
          </p>
          <p className="misaki-meta">{metaLine}</p>
          <a href={bookingHref} onClick={handleCtaClick} className="misaki-cta">
            Check Availability
          </a>
        </div>
      </section>

      {/* 7. Kimono connection */}
      <section className="misaki-kimono">
        <Image
          src="/images/itinerary/stop3.webp"
          alt="Osaka Castle turrets through cherry blossoms"
          fill
          sizes="100vw"
        />
        <div className="misaki-kimono-overlay" />
        <div className="misaki-kimono-content">
          <h2>You&apos;ve dressed for the history. Now walk through it.</h2>
          <p>
            Your kimono gives you a glimpse of Japan&apos;s past. This experience
            takes you into the landscape where that past actually unfolded — the
            ridge, the walls, and the ground the castle was built to control.
          </p>
        </div>
      </section>

      {/* 8. Shōgun → real history */}
      <section className="misaki-section">
        <p className="misaki-eyebrow">From the screen to the ground</p>
        <h2>From the world of Shōgun to the real Osaka</h2>
        <p className="misaki-lead">
          Shōgun brings the people and politics of Japan&apos;s warrior age to
          life. Here, you can walk through the landscape where those struggles
          actually unfolded.
        </p>
        <ul className="misaki-facts">
          <li>
            <strong>Toyotomi Hideyoshi</strong> — the peasant who rose to rule
            Japan and built Osaka Castle in 1583.
          </li>
          <li>
            <strong>Tokugawa Ieyasu</strong> — the shogun whose clan displaced
            the Toyotomi and remade the castle in their own image.
          </li>
          <li>
            <strong>The Toyotomi–Tokugawa conflict</strong> — resolved at Osaka
            in the sieges of 1614–1615, the last armed conflict of Japan&apos;s
            age of civil war.
          </li>
          <li>
            <strong>Surviving terrain</strong> — earthworks, ridges, and
            waterways you can still read on the ground today.
          </li>
        </ul>
        <p className="misaki-note">
          Not a recap of the series — the real people, the real place, and what
          the ground still shows.
        </p>
      </section>

      {/* 9. What you'll explore */}
      <section className="misaki-section misaki-section-wide">
        <p className="misaki-eyebrow">The experience</p>
        <h2>What you&apos;ll explore</h2>
        <p className="misaki-lead">
          You aren&apos;t just looking at Osaka Castle. You&apos;re learning how
          to read the place.
        </p>
        <div className="misaki-cards">
          <article className="misaki-card">
            <div className="misaki-card-img">
              <Image
                src="/tourstart.webp"
                alt="Guests with the resident historian at Osaka Castle"
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </div>
            <div className="misaki-card-body">
              <h3>The Castle</h3>
              <p>
                Explore Osaka Castle and the landscape around it — not just the
                keep, but the ground it was built to dominate.
              </p>
            </div>
          </article>

          <article className="misaki-card">
            <div className="misaki-card-img">
              <Image
                src="/images/PXL_20260927_032124036.webp"
                alt="Osaka Castle stone walls rising from the moat"
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </div>
            <div className="misaki-card-body">
              <h3>The Fortifications</h3>
              <p>
                Read the surviving terrain and defensive geography — how walls,
                ridges, and water were arranged to make the castle defensible.
              </p>
            </div>
          </article>

          <article className="misaki-card">
            <div className="misaki-card-img">
              <Image
                src="/images/itinerary/wm1.webp"
                alt="Statue of a Sengoku-era warrior"
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </div>
            <div className="misaki-card-body">
              <h3>The Toyotomi–Tokugawa Struggle</h3>
              <p>
                Understand how the conflict of 1614–1615 transformed Osaka and
                ended one of Japan&apos;s great dynasties.
              </p>
            </div>
          </article>

          <article className="misaki-card">
            <div className="misaki-card-img">
              <Image
                src="/Hoenzaka.webp"
                alt="Reconstructed pit dwellings at an archaeological site"
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </div>
            <div className="misaki-card-body">
              <h3>The Layers Beneath Modern Osaka</h3>
              <p>
                Connect the castle to older political and archaeological layers —
                earlier strongholds that each buried the last.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 10. Resident Historian */}
      <section className="misaki-section misaki-historian">
        <div className="misaki-historian-img">
          <Image
            src="/images/IMG20260522110710.webp"
            alt="Edward Iftody with guests at Osaka Castle"
            fill
            sizes="(min-width: 900px) 45vw, 100vw"
          />
        </div>
        <div className="misaki-historian-copy">
          <p className="misaki-eyebrow">Your guide</p>
          <h2>Meet Your Resident Historian</h2>
          <p>
            <strong>Edward Iftody</strong> is a Canadian historian and
            long-term resident of Japan. He has lived in Japan since 2012 and
            lives beside Osaka Castle.
          </p>
          <p>
            He researches Japanese political history, historical geography,
            archaeology, and the relationship between political institutions and
            the physical landscape — and he has taught English in Japan since
            2009.
          </p>
          <p className="misaki-note">
            This is not a scripted sightseeing tour. You walk the ground with
            someone who studies it.
          </p>
        </div>
      </section>

      {/* 11. Reviews */}
      <section className="misaki-section">
        <p className="misaki-eyebrow">Guest reviews</p>
        <h2>Seen differently</h2>
        <div className="misaki-reviews">
          {REVIEWS.map((r) => (
            <figure
              key={r.author}
              className={`misaki-review${r.featured ? " featured" : ""}`}
            >
              <blockquote>{r.text}</blockquote>
              <figcaption>— {r.author}</figcaption>
            </figure>
          ))}
        </div>
        <a className="misaki-link" href="/testimonials">
          More guest reviews →
        </a>
      </section>

      {/* 12. Final CTA */}
      <section className="misaki-final">
        <h2>Walk through the world of Shōgun</h2>
        <p className="misaki-final-sub">
          At the real Osaka Castle, with a resident historian.
        </p>
        <p className="misaki-tour-name">{tour.name}</p>
        <p className="misaki-meta">{metaLine}</p>
        <a href={bookingHref} onClick={handleCtaClick} className="misaki-cta">
          Check Availability
        </a>
        {tour.meeting_point_address && (
          <p className="misaki-meeting">Meets at {tour.meeting_point_address}</p>
        )}
      </section>

      <footer className="misaki-footer">
        <p className="misaki-footer-brand">
          <strong>Osaka Castle Walks with Edward</strong> — History Beyond the
          Postcard
        </p>
        <p>
          <a href="mailto:edward@osakacastletours.com">
            edward@osakacastletours.com
          </a>
        </p>
        <p className="misaki-disclaimer">
          Recommended by {partner.displayName}. SHŌGUN is a trademark of its
          respective owners. This independent history tour is not affiliated
          with, endorsed by, or sponsored by the SHŌGUN television series.
        </p>
      </footer>

      {/* Sticky mobile CTA */}
      <div className={`misaki-sticky${stickyVisible ? " visible" : ""}`}>
        <span className="misaki-sticky-meta">
          2.5 hours · {priceLabel}/person
          {lockedStaff ? ` · via ${lockedStaff.displayName}` : ""}
        </span>
        <a
          href={bookingHref}
          onClick={handleCtaClick}
          className="misaki-cta misaki-cta-small"
        >
          Check Availability
        </a>
      </div>
    </div>
  );
}
