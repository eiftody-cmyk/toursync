/**
 * Minimal GA4 loader + event helper.
 *
 * The static marketing pages embed gtag inline; the React app has no
 * analytics. This lazy-loads the same GA4 property (G-P4C79TD3WJ) only on
 * pages that call track(), so nothing changes for other routes.
 */

const GA4_ID = "G-P4C79TD3WJ";
const SCRIPT_ID = "ga4-script";

export type TrackParams = Record<string, string | number | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loadPromise: Promise<void> | null = null;

function loadGA4(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.gtag && document.getElementById(SCRIPT_ID)) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve) => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { send_page_view: false });
  });

  return loadPromise;
}

/** Fire a GA4 event (loads gtag on first use). Safe to call during SSR. */
export function track(name: string, params?: TrackParams): void {
  if (typeof window === "undefined") return;
  loadGA4().then(() => {
    window.gtag?.("event", name, params ?? {});
  });
}
