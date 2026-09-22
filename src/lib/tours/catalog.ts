export interface TourCatalogEntry {
  url_slug: string;
  historical_periods: string[];
  themes: string[];
  traveler_types: string[];
  traveler_intent: string[];
  trip_context: string[];
  neighborhood: string[];
  suitable_for: {
    itinerary_length: string[];
    pairing_type: string[];
    weather_sensitivity: string[];
  };
  ideal_for: string;
  best_time_of_day: string;
  itinerary_position: string;
  nearby_attractions: Array<{ name: string; distance_minutes: number }>;
  good_before: string[];
  good_after: string[];
  not_ideal_for: string;
  meeting_point: string;
  meeting_point_lat: number;
  meeting_point_lng: number;
  recommended_next: string[];
  recommended_before: string[];
  solo_day: string;
  pair_with: string;
}

export const tourCatalog: Record<string, TourCatalogEntry> = {
  "Osaka Castle: Before Japan Had a Name": {
    url_slug: "beforejapanhadaname",
    historical_periods: ["Jomon", "Yayoi", "Kofun"],
    themes: ["archaeology", "urban geography", "ancient Japan", "state formation"],
    traveler_types: ["history enthusiasts", "archaeology fans", "repeat Osaka visitors"],
    traveler_intent: [
      "first-time visitor",
      "repeat visitor",
      "archaeology enthusiast",
      "urban explorer",
    ],
    trip_context: [
      "first morning in Osaka",
      "before museum visit",
      "half-day itinerary",
      "rainy day option",
    ],
    neighborhood: ["osaka-castle-area", "tanimachi"],
    suitable_for: {
      itinerary_length: ["morning-only", "half-day"],
      pairing_type: ["standalone", "museum-complement"],
      weather_sensitivity: ["rain-or-shine"],
    },
    ideal_for: "Travelers who want to understand why Osaka exists where it does",
    best_time_of_day: "morning",
    itinerary_position: "Morning activity before museum visits or city exploration",
    nearby_attractions: [
      { name: "Osaka Museum of History", distance_minutes: 5 },
      { name: "Naniwa Palace site", distance_minutes: 15 },
      { name: "Tanimachi subway", distance_minutes: 3 },
    ],
    good_before: ["Osaka Museum of History", "Naniwa Palace"],
    good_after: ["Dotonbori", "Namba", "Shinsekai"],
    not_ideal_for: "Travelers wanting only castle tower views",
    meeting_point: "Osaka Castle Park",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
    recommended_next: [
      "Osaka Castle: Warrior Monks, a Peasant, and a Shogun",
      "Osaka Castle: A Lord, a Concubine, and a Shogun's Lie",
    ],
    recommended_before: [],
    solo_day: "Fits a morning. Pair with Osaka Museum of History or Naniwa Palace in the afternoon.",
    pair_with: "Osaka Museum of History",
  },
  "Osaka Castle: Warrior Monks, a Peasant, and a Shogun": {
    url_slug: "warriormonkspeasantshogun",
    historical_periods: ["Sengoku", "Azuchi-Momoyama"],
    themes: ["military history", "religious history", "fortifications", "siege warfare"],
    traveler_types: ["history buffs", "Shōgun series viewers", "military history fans"],
    traveler_intent: [
      "first-time visitor",
      "Shōgun series fan",
      "military history enthusiast",
      "drama fan",
    ],
    trip_context: [
      "first morning in Osaka",
      "before museum visit",
      "half-day itinerary",
      "rainy day option",
    ],
    neighborhood: ["osaka-castle-area"],
    suitable_for: {
      itinerary_length: ["morning-only", "half-day"],
      pairing_type: ["standalone", "museum-complement"],
      weather_sensitivity: ["rain-or-shine"],
    },
    ideal_for: "Travelers interested in the clash between Buddhism and military power",
    best_time_of_day: "morning",
    itinerary_position: "Morning activity before Osaka Castle Museum",
    nearby_attractions: [
      { name: "Ishiyama Honganji site", distance_minutes: 5 },
      { name: "Osaka Castle Park", distance_minutes: 2 },
      { name: "Osaka Castle Museum", distance_minutes: 3 },
    ],
    good_before: ["Osaka Museum of History", "Osaka Castle Park walk"],
    good_after: ["Dotonbori", "Osaka Museum of History"],
    not_ideal_for: "Travelers wanting only a photographic sightseeing experience",
    meeting_point: "Osaka Castle Park",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
    recommended_next: [
      "Osaka Castle: A Lord, a Concubine, and a Shogun's Lie",
    ],
    recommended_before: [
      "Osaka Castle: Before Japan Had a Name",
    ],
    solo_day: "Fits a morning. Pair with Osaka Castle Museum in the afternoon.",
    pair_with: "Osaka Castle Museum",
  },
  "Osaka Castle: A Lord, a Concubine, and a Shogun's Lie": {
    url_slug: "lordconcubineshogunlie",
    historical_periods: ["Sengoku", "Azuchi-Momoyama", "Early Edo"],
    themes: ["political intrigue", "siege warfare", "historical mystery", "archaeology"],
    traveler_types: ["mystery enthusiasts", "history buffs", "detective-minded travelers"],
    traveler_intent: [
      "first-time visitor",
      "repeat visitor",
      "mystery fan",
      "political history enthusiast",
    ],
    trip_context: [
      "flexible morning or afternoon",
      "half-day itinerary",
      "full-day itinerary",
      "rainy day option",
    ],
    neighborhood: ["osaka-castle-area"],
    suitable_for: {
      itinerary_length: ["morning-only", "half-day", "full-day"],
      pairing_type: ["standalone"],
      weather_sensitivity: ["rain-or-shine"],
    },
    ideal_for: "Travelers who want to solve a 400-year-old cold case",
    best_time_of_day: "morning or afternoon",
    itinerary_position: "Flexible — works any time before evening",
    nearby_attractions: [
      { name: "Osaka Castle Park", distance_minutes: 2 },
      { name: "Toyokuni Shrine", distance_minutes: 5 },
      { name: "Tamatsukuri Shrine", distance_minutes: 10 },
    ],
    good_before: ["Osaka Castle Museum"],
    good_after: ["Dotonbori", "Shinsekai"],
    not_ideal_for: "Families with young children (complex political narrative)",
    meeting_point: "Osaka Castle Park",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
    recommended_next: [],
    recommended_before: [
      "Osaka Castle: Warrior Monks, a Peasant, and a Shogun",
      "Osaka Castle: Before Japan Had a Name",
    ],
    solo_day: "Fits a morning or afternoon. Flexible — pairs with anything.",
    pair_with: "Osaka Castle Museum",
  },
  "Osaka Castle Goddess, Queen, Empress, Concubine": {
    url_slug: "goddess_queen_empress_concubine",
    historical_periods: ["Yayoi", "Kofun", "Nara", "Heian", "Sengoku", "Edo"],
    themes: ["women in power", "imperial history", "political dynasties", "Osaka's role in national history"],
    traveler_types: ["serious Japan travelers", "women's history enthusiasts", "academic travelers"],
    traveler_intent: [
      "first-time visitor",
      "serious history traveler",
      "women's history enthusiast",
      "academic traveler",
      "couples",
    ],
    trip_context: [
      "first morning in Osaka",
      "full-day itinerary",
      "rainy day option",
      "museum-quality experience",
    ],
    neighborhood: ["osaka-castle-area", "sumiyoshi"],
    suitable_for: {
      itinerary_length: ["full-day"],
      pairing_type: ["standalone"],
      weather_sensitivity: ["rain-or-shine"],
    },
    ideal_for: "Travelers wanting a comprehensive, museum-quality experience",
    best_time_of_day: "morning",
    itinerary_position: "Full morning — pair with light afternoon activity",
    nearby_attractions: [
      { name: "Naniwa Palace site", distance_minutes: 10 },
      { name: "Osaka Museum of History", distance_minutes: 5 },
      { name: "Sumiyoshi Taisha", distance_minutes: 20 },
    ],
    good_before: [],
    good_after: ["Dotonbori evening"],
    not_ideal_for: "Travelers on a tight schedule, casual sightseers",
    meeting_point: "Sakidoriya",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
    recommended_next: [],
    recommended_before: [],
    solo_day: "Fills a full morning (5 hours) plus lunch. Tour ends at Lunch at The Garden Oriental Osaka — zen, tea philosophy, and samurai culture over a meal. Lunch is included in the price.",
    pair_with: "Lunch at The Garden Oriental Osaka (included)",
  },
  "Osaka Castle: Historian's Choice": {
    url_slug: "historianschoice",
    historical_periods: ["custom"],
    themes: ["custom investigation", "personalized tour", "flexible itinerary"],
    traveler_types: ["undecided travelers", "repeat visitors", "history enthusiasts"],
    traveler_intent: [
      "first-time visitor",
      "repeat visitor",
      "flexible explorer",
      "personalized experience",
    ],
    trip_context: [
      "flexible morning or afternoon",
      "half-day itinerary",
      "full-day itinerary",
      "rainy day option",
    ],
    neighborhood: ["osaka-castle-area"],
    suitable_for: {
      itinerary_length: ["morning-only", "half-day", "full-day"],
      pairing_type: ["standalone"],
      weather_sensitivity: ["rain-or-shine"],
    },
    ideal_for: "Travelers who want a personalized investigation built around their interests",
    best_time_of_day: "morning or afternoon",
    itinerary_position: "Flexible — works any time",
    nearby_attractions: [
      { name: "Osaka Castle Park", distance_minutes: 2 },
      { name: "Osaka Museum of History", distance_minutes: 5 },
      { name: "Naniwa Palace site", distance_minutes: 10 },
    ],
    good_before: ["Osaka Museum of History", "Dotonbori"],
    good_after: ["Dotonbori", "Shinsekai"],
    not_ideal_for: "Travelers who prefer a fixed, pre-designed route",
    meeting_point: "Osaka Castle Park",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
    recommended_next: [],
    recommended_before: [],
    solo_day: "Flexible timing. Edward builds the route around your curiosity.",
    pair_with: "Your choice — or leave it to Edward",
  },
  "Osaka Castle: Photography after dark": {
    url_slug: "",
    historical_periods: [],
    themes: ["photography", "night photography", "Osaka Castle"],
    traveler_types: ["photographers", "night owls", "Instagram travelers"],
    traveler_intent: [
      "photographer",
      "night owl",
      "Instagram content creator",
      "solo traveler",
    ],
    trip_context: [
      "last night in Osaka",
      "evening activity",
      "after daytime sightseeing",
    ],
    neighborhood: ["osaka-castle-area"],
    suitable_for: {
      itinerary_length: ["evening-only"],
      pairing_type: ["standalone", "evening-follow-up"],
      weather_sensitivity: ["rain-preferred"],
    },
    ideal_for: "Travelers who want to photograph Osaka Castle at night",
    best_time_of_day: "evening",
    itinerary_position: "Evening activity after daytime sightseeing",
    nearby_attractions: [
      { name: "Osaka Castle Park", distance_minutes: 2 },
      { name: "Osaka Castle Tower", distance_minutes: 5 },
    ],
    good_before: [],
    good_after: ["Dotonbori nightlife"],
    not_ideal_for: "Travelers wanting historical content",
    meeting_point: "Osaka Castle Park",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
    recommended_next: [],
    recommended_before: [],
    solo_day: "Evening activity. Pair with a morning walking tour.",
    pair_with: "Morning walking tour",
  },
};

export const BASE_URL = "https://osakacastletours.com";
