export interface TourCatalogEntry {
  url_slug: string;
  historical_periods: string[];
  themes: string[];
  traveler_types: string[];
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
}

export const tourCatalog: Record<string, TourCatalogEntry> = {
  "Before Japan Had a Name": {
    url_slug: "beforejapanhadaname",
    historical_periods: ["Jomon", "Yayoi", "Kofun"],
    themes: ["archaeology", "urban geography", "ancient Japan", "state formation"],
    traveler_types: ["history enthusiasts", "archaeology fans", "repeat Osaka visitors"],
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
  },
  "Warrior Monks, a Peasant, and a Shogun": {
    url_slug: "warriormonkspeasantshogun",
    historical_periods: ["Sengoku", "Azuchi-Momoyama"],
    themes: ["military history", "religious history", "fortifications", "siege warfare"],
    traveler_types: ["history buffs", "Shōgun series viewers", "military history fans"],
    ideal_for: "Travelers interested in the clash between Buddhism and military power",
    best_time_of_day: "morning",
    itinerary_position: "Morning activity before Osaka Castle Museum",
    nearby_attractions: [
      { name: "Ishiyama Honganji site", distance_minutes: 5 },
      { name: "Osaka Castle Park", distance_minutes: 2 },
      { name: "Osaka Castle Museum", distance_minutes: 3 },
    ],
    good_before: ["Osaka Castle Museum", "Osaka Castle Park walk"],
    good_after: ["Dotonbori", "Osaka Museum of History"],
    not_ideal_for: "Travelers wanting only a photographic sightseeing experience",
    meeting_point: "Osaka Castle Park",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
  },
  "A Lord, a Concubine, and a Shogun's Lie": {
    url_slug: "lordconcubineshogunlie",
    historical_periods: ["Sengoku", "Azuchi-Momoyama", "Early Edo"],
    themes: ["political intrigue", "siege warfare", "historical mystery", "archaeology"],
    traveler_types: ["mystery enthusiasts", "history buffs", "detective-minded travelers"],
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
  },
  "Goddess, Queen, Empress, Concubine": {
    url_slug: "goddess_queen_empress_concubine",
    historical_periods: ["Yayoi", "Kofun", "Nara", "Heian", "Sengoku", "Edo"],
    themes: ["women in power", "imperial history", "political dynasties", "Osaka's role in national history"],
    traveler_types: ["serious Japan travelers", "women's history enthusiasts", "academic travelers"],
    ideal_for: "Travelers wanting a comprehensive, museum-quality experience",
    best_time_of_day: "morning",
    itinerary_position: "Full morning — pair with light afternoon activity",
    nearby_attractions: [
      { name: "Naniwa Palace site", distance_minutes: 10 },
      { name: "Osaka Museum of History", distance_minutes: 5 },
      { name: "Sumiyoshi Taisha", distance_minutes: 20 },
    ],
    good_before: [],
    good_after: ["Light lunch", "Dotonbori evening"],
    not_ideal_for: "Travelers on a tight schedule, casual sightseers",
    meeting_point: "Sakidoriya",
    meeting_point_lat: 34.6849,
    meeting_point_lng: 135.5177,
  },
};

export const BASE_URL = "https://osakacastletours.com";
