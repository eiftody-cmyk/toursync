"use client";

import { useState, useEffect, useCallback } from "react";

const SITES = [
  {
    id: "hoenzaka" as const,
    label: ["HOENZAKA", "WAREHOUSES"],
    image: "/Hoenzaka.webp",
    alt: "Historical reconstruction of Hoenzaka warehouses along the Yodo River in Osaka",
  },
  {
    id: "naniwa" as const,
    label: ["NANIWA", "PALACE"],
    image: "/formerniwapalace.webp",
    alt: "Historical reconstruction of Naniwa Palace, the ancient imperial residence in Osaka",
  },
  {
    id: "ishiyama" as const,
    label: ["ISHIYAMA", "HONGAN-JI"],
    image: "/ishiyamahonganji.webp",
    alt: "Historical reconstruction of Ishiyama Hongan-ji, the great Buddhist fortress temple in Osaka",
  },
  {
    id: "toyotomi" as const,
    label: ["TOYOTOMI", "PALACE"],
    image: "/toyotomipalace.webp",
    alt: "Historical reconstruction of Toyotomi Palace within Osaka Castle",
  },
];

type SiteId = (typeof SITES)[number]["id"];

export default function LandscapePage() {
  const [selected, setSelected] = useState<SiteId | null>(null);

  const close = useCallback(() => {
    setSelected(null);
    if (window.history.state?.open) {
      window.history.back();
    }
  }, []);

  const open = useCallback(
    (id: SiteId) => {
      setSelected(id);
      window.history.pushState({ open: true }, "");
    },
    [],
  );

  useEffect(() => {
    const onPopState = () => {
      if (selected) {
        setSelected(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected) {
        close();
      }
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected, close]);

  // Check for direct URL access: /landscape?site=hoenzaka
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const site = params.get("site") as SiteId | null;
    if (site && SITES.some((s) => s.id === site)) {
      setSelected(site);
      window.history.replaceState({ open: true }, "");
    }
  }, []);

  const site = SITES.find((s) => s.id === selected);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: var(--edu-ink, #1a1510);
          font-family: 'Cinzel', serif;
          -webkit-font-smoothing: antialiased;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .landing {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          width: 100vw;
          padding: 1.5rem;
          gap: 1rem;
        }

        .landing-title {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--edu-gold, #c8a96e);
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .landing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          width: 100%;
          max-width: 480px;
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .landing {
            padding: 0.75rem 1.5rem;
            gap: 0.5rem;
          }
          .landing-title {
            margin-bottom: 0.25rem;
          }
          .landing-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
            max-width: none;
            flex: 1;
          }
        }

        @media (orientation: landscape) and (min-height: 500px) {
          .landing-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 600px;
          }
        }

        .landing-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--edu-ink, #1a1510);
          background: var(--edu-gold, #c8a96e);
          border: 1px solid var(--edu-gold, #c8a96e);
          border-radius: 3px;
          padding: 1.25rem 1rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-align: center;
          line-height: 1.6;
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-user-select: none;
          user-select: none;
        }

        .landing-btn:hover,
        .landing-btn:focus-visible {
          background: var(--edu-gold-light, #e8d5a3);
          transform: translateY(-1px);
        }

        .landing-btn:active {
          transform: scale(0.97);
        }

        .landing-btn:focus-visible {
          outline: 2px solid var(--edu-gold, #c8a96e);
          outline-offset: 2px;
        }

        .viewer {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .viewer-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          -webkit-user-select: none;
          user-select: none;
        }

        .back-btn {
          position: fixed;
          top: max(env(safe-area-inset-top, 12px), 12px);
          left: max(env(safe-area-inset-left, 12px), 12px);
          z-index: 1001;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          color: #fff;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          -webkit-user-select: none;
          user-select: none;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .back-btn:hover,
        .back-btn:focus-visible {
          background: rgba(0, 0, 0, 0.75);
        }

        .back-btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>

      {/* Landing */}
      {!selected && (
        <div className="landing">
          <div className="landing-title">Osaka&apos;s Lost Landscapes</div>
          <div className="landing-grid">
            {SITES.map((s) => (
              <button
                key={s.id}
                className="landing-btn"
                onClick={() => open(s.id)}
                aria-label={`View ${s.label.join(" ")}`}
              >
                {s.label.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < s.label.length - 1 && <br />}
                  </span>
                ))}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image viewer */}
      {site && (
        <div className="viewer" role="dialog" aria-label={site.alt}>
          <button
            className="back-btn"
            onClick={close}
            aria-label="Back to locations"
          >
            ←
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="viewer-img"
            src={site.image}
            alt={site.alt}
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
