import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAvailableDates } from "@/lib/schedules/generateDates";
import { tourCatalog, BASE_URL } from "@/lib/tours/catalog";
import { getPaymentProvider } from "@/lib/payments";

function createServer() {
  const server = new McpServer({ name: "toursync", version: "1.0.0" });

  server.registerTool(
    "list_tours",
    {
      description:
        "List all available tours with themes, traveler types, itinerary positioning, and pricing. Use this to match traveler preferences to the right tour. Supports filtering by theme, traveler type, trip context, or neighborhood.",
      inputSchema: {
        themes: z
          .string()
          .optional()
          .describe("Filter by theme keyword (e.g., 'military history', 'archaeology')"),
        traveler_type: z
          .string()
          .optional()
          .describe("Filter by traveler type (e.g., 'history buffs', 'families')"),
        trip_context: z
          .string()
          .optional()
          .describe(
            "Filter by trip context (e.g., 'first morning in Osaka', 'rainy day', 'half-day itinerary')",
          ),
        neighborhood: z
          .string()
          .optional()
          .describe("Filter by neighborhood (e.g., 'tanimachi', 'namba')"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ themes, traveler_type, trip_context, neighborhood }) => {
      const supabase = createServiceClient();
      const { data: tours } = await supabase
        .from("tours")
        .select("id, name, description, capacity, price, currency");

      const result = (tours ?? []).map((tour) => {
        const meta = tourCatalog[tour.name];
        return {
          id: tour.id,
          name: tour.name,
          url: meta ? `${BASE_URL}/${meta.url_slug}` : null,
          description: tour.description,
          price: tour.price,
          currency: tour.currency,
          max_guests: tour.capacity,
          ...(meta
            ? {
                historical_periods: meta.historical_periods,
                themes: meta.themes,
                traveler_types: meta.traveler_types,
                traveler_intent: meta.traveler_intent,
                trip_context: meta.trip_context,
                neighborhood: meta.neighborhood,
                suitable_for: meta.suitable_for,
                ideal_for: meta.ideal_for,
                best_time_of_day: meta.best_time_of_day,
                itinerary_position: meta.itinerary_position,
                not_ideal_for: meta.not_ideal_for,
              }
            : {}),
        };
      });

      let filtered = result;
      if (themes) {
        const q = themes.toLowerCase();
        filtered = filtered.filter((t) =>
          t.themes?.some((th: string) => th.toLowerCase().includes(q)),
        );
      }
      if (traveler_type) {
        const q = traveler_type.toLowerCase();
        filtered = filtered.filter((t) =>
          t.traveler_types?.some((tt: string) => tt.toLowerCase().includes(q)),
        );
      }
      if (trip_context) {
        const q = trip_context.toLowerCase();
        filtered = filtered.filter((t) =>
          t.trip_context?.some((tc: string) => tc.toLowerCase().includes(q)),
        );
      }
      if (neighborhood) {
        const q = neighborhood.toLowerCase();
        filtered = filtered.filter((t) =>
          t.neighborhood?.some((n: string) => n.toLowerCase().includes(q)),
        );
      }

      return {
        content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_tour_availability",
    {
      description:
        "Get available dates and time slots for a specific tour. Returns dates with remaining capacity, blocked dates, and fully booked dates.",
      inputSchema: {
        tour_id: z.string().describe("The tour UUID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ tour_id }) => {
      const supabase = createServiceClient();
      const availability = await generateAvailableDates(supabase, tour_id);
      return {
        content: [{ type: "text", text: JSON.stringify(availability, null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_tours",
    {
      description:
        "Search tours by keyword. Matches against tour name, description, themes, historical periods, traveler types, trip context, and neighborhood.",
      inputSchema: {
        query: z.string().describe("Search keyword (e.g., 'castle', 'samurai', 'Yayoi', 'rainy day')"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ query }) => {
      const supabase = createServiceClient();
      const { data: tours } = await supabase
        .from("tours")
        .select("id, name, description, capacity, price, currency");

      const q = query.toLowerCase();
      const results = (tours ?? []).filter((tour) => {
        const meta = tourCatalog[tour.name];
        const text = [
          tour.name,
          tour.description ?? "",
          ...(meta?.themes ?? []),
          ...(meta?.historical_periods ?? []),
          ...(meta?.traveler_types ?? []),
          ...(meta?.traveler_intent ?? []),
          ...(meta?.trip_context ?? []),
          ...(meta?.neighborhood ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  );

  server.registerTool(
    "build_itinerary",
    {
      description:
        "Build a suggested multi-day itinerary based on traveler interests, time available, and trip context. Returns tour sequence with rationale, pairing suggestions, and neighborhood grouping.",
      inputSchema: {
        days: z.number().min(1).max(3).describe("Number of days available (1-3)"),
        interests: z
          .string()
          .optional()
          .describe(
            "Traveler interests (e.g., 'archaeology', 'military history', 'women in power')",
          ),
        trip_context: z
          .string()
          .optional()
          .describe(
            "Trip context (e.g., 'first morning in Osaka', 'rainy day', 'half-day itinerary')",
          ),
        weather: z
          .enum(["sunny", "rainy", "any"])
          .optional()
          .describe("Weather forecast — rain filters to indoor-friendly tours"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ days, interests, trip_context, weather }) => {
      const tourNames = Object.keys(tourCatalog);
      const q = interests?.toLowerCase() ?? "";
      const ctx = trip_context?.toLowerCase() ?? "";

      const scored = tourNames.map((name) => {
        const meta = tourCatalog[name];
        let score = 0;

        // Interest matching (strongest signal)
        if (q) {
          const text = [...meta.themes, ...meta.historical_periods, ...meta.traveler_types, ...meta.traveler_intent]
            .join(" ")
            .toLowerCase();
          if (text.includes(q)) score += 10;
        }

        // Trip context matching
        if (ctx) {
          if (meta.trip_context.some((tc) => tc.toLowerCase().includes(ctx))) score += 8;
        }

        // Weather filtering — all tours run rain-or-shine, Photography prefers rain
        if (weather === "rainy") {
          if (meta.suitable_for.weather_sensitivity.includes("rain-or-shine")) score += 3;
          if (meta.suitable_for.weather_sensitivity.includes("rain-preferred")) score += 5;
        }

        // Itinerary fit
        if (days === 1 && meta.suitable_for.itinerary_length.includes("morning-only")) score += 3;
        if (days >= 2 && meta.suitable_for.itinerary_length.includes("half-day")) score += 2;
        if (days >= 2 && meta.suitable_for.itinerary_length.includes("full-day")) score += 3;

        // Relationship signals
        if (meta.recommended_next.length > 0) score += 2;
        if (meta.recommended_before.length > 0) score += 1;

        return { name, meta, score };
      });

      scored.sort((a, b) => b.score - a.score);

      const selected: string[] = [];
      if (days >= 1) {
        const morning = scored.find(
          (s) => s.meta.best_time_of_day === "morning" && !selected.includes(s.name),
        );
        if (morning) selected.push(morning.name);
      }
      if (days >= 2) {
        const next = scored.find(
          (s) =>
            !selected.includes(s.name) &&
            selected.some((sel) => tourCatalog[sel].recommended_next.includes(s.name)),
        );
        if (next) {
          selected.push(next.name);
        } else {
          const fallback = scored.find((s) => !selected.includes(s.name));
          if (fallback) selected.push(fallback.name);
        }
      }
      if (days >= 3) {
        const remaining = scored.find((s) => !selected.includes(s.name));
        if (remaining) selected.push(remaining.name);
      }

      const itinerary = selected.map((name, i) => {
        const meta = tourCatalog[name];
        return {
          day: i + 1,
          tour: name,
          duration: meta.itinerary_position.includes("Full morning") ? "5 hours" : "2.5 hours",
          time: meta.best_time_of_day,
          rationale: meta.ideal_for,
          pair_with: meta.pair_with,
          neighborhood: meta.neighborhood,
          weather_fit: weather === "rainy"
            ? meta.suitable_for.weather_sensitivity.includes("rain-preferred")
              ? "rain enhances this tour"
              : "runs rain or shine — umbrellas provided"
            : "any",
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                itinerary,
                rationale: `Suggested ${days}-day itinerary${
                  interests ? ` focused on ${interests}` : ""
                }${
                  trip_context ? ` for ${trip_context}` : ""
                }. Tours are ordered by score (interest fit, context fit, weather fit).`,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_payment_methods",
    {
      description:
        "List available payment methods. Returns current payment providers, their status, and supported currencies.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (_args: Record<string, never>) => {
      const provider = getPaymentProvider();
      const methods = provider.getMethods();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(methods, null, 2) }],
      };
    },
  );

  return server;
}

const handler = createMcpHandler(createServer);

export async function POST(request: Request) {
  return handler.fetch(request);
}

export async function GET() {
  return handler.fetch(new Request("https://toursync.mcp/mcp", { method: "GET" }));
}

export async function DELETE() {
  return handler.fetch(new Request("https://toursync.mcp/mcp", { method: "DELETE" }));
}
