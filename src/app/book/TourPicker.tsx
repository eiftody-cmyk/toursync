import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function isHiddenTour(tourId: string): boolean {
  const hidden = process.env.HIDDEN_TOUR_IDS ?? "";
  return hidden.split(",").map((s) => s.trim()).filter(Boolean).includes(tourId);
}

/**
 * Shown when /book or /book/custom is opened without ?tour=.
 * Static-site CTAs link to bare /book/custom — pick a tour to continue.
 */
export async function TourPicker({ mode }: { mode: "instant" | "custom" }) {
  const supabase = await createClient();
  const { data } = await supabase.from("tours").select("id, name, price, currency, capacity").order("name");
  const tours = (data ?? []).filter((t) => !isHiddenTour(t.id));

  return (
    <div className="min-h-screen bg-[#0e0c09] text-[#f5efe3] px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-[#c8a96e] text-sm tracking-widest uppercase mb-2">
          Osaka Castle Walks with Edward
        </p>
        <h1 className="font-[Cinzel] text-3xl mb-2">Choose a Tour</h1>
        <p className="text-sm opacity-80 mb-8">
          {mode === "custom"
            ? "Pick a tour to request a custom time."
            : "Pick a tour to see available dates and book."}
        </p>
        <ul className="space-y-3">
          {tours.map((tour) => (
            <li key={tour.id}>
              <Link
                href={
                  mode === "custom"
                    ? `/book/custom?tour=${tour.id}`
                    : `/book?tour=${tour.id}`
                }
                className="block border border-[#c8a96e]/40 rounded-lg px-5 py-4 hover:bg-[#c8a96e]/10 transition-colors"
              >
                <span className="font-[Cormorant_Garamond] text-lg">{tour.name}</span>
                {tour.price != null && (
                  <span className="float-right text-[#c8a96e]">
                    ¥{tour.price.toLocaleString()}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {tours.length === 0 && (
          <p className="text-sm opacity-70">No tours available right now.</p>
        )}
      </div>
    </div>
  );
}
