import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAvailableDates } from "@/lib/schedules/generateDates";
import { tourCatalog, BASE_URL } from "@/lib/tours/catalog";

function createServer() {
  const server = new McpServer({ name: "toursync", version: "1.0.0" });

  server.registerTool(
    "list_tours",
    {
      description:
        "List all available tours with themes, traveler types, itinerary positioning, and pricing. Use this to match traveler preferences to the right tour.",
      inputSchema: {
        themes: z
          .string()
          .optional()
          .describe("Filter by theme keyword (e.g., 'military history', 'archaeology')"),
        traveler_type: z
          .string()
          .optional()
          .describe("Filter by traveler type (e.g., 'history buffs', 'families')"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ themes, traveler_type }) => {
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
        "Search tours by keyword. Matches against tour name, description, themes, and historical periods.",
      inputSchema: {
        query: z.string().describe("Search keyword (e.g., 'castle', 'samurai', 'Yayoi')"),
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
