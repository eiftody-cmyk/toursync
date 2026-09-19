"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/education/language-context";

const INVESTIGATION_STOPS = [
  {
    label: "1",
    name: "Hoenzaka Warehouse",
    nameJa: "塁釣倉庫",
    date: "c. 450 AD",
    lat: 34.68188,
    lng: 135.52021,
    img: "ojinsuccession.webp",
    teaser:
      "The Ōjin succession crisis triggers two generations of brother betraying brother ...",
    caption: "Prince Ōyamamori escaping across the Uji River, c. 410 AD",
  },
  {
    label: "2",
    name: "Naniwa Palace",
    nameJa: "難波宮",
    date: "c. 645 AD",
    lat: 34.68012,
    lng: 135.52304,
    img: "assassination.webp",
    teaser: "A betrayal paid back in full ...",
    caption:
      "The Soga Clan leader — assassinated by the son of the Empress Kōgyoku, c. 645",
  },
  {
    label: "3",
    name: "Ishiyama Honganji",
    nameJa: "石山本願寺",
    date: "1496–1580",
    lat: 34.68457,
    lng: 135.52445,
    img: "azaiclanbetrayal.webp",
    teaser:
      "Oda Nobunaga is betrayed and nearly killed by his own brother-in-law, Lord Azai in 1564 ...",
    caption:
      "Oda Nobunaga's army in a desperate retreat. The Azai Clan betray a blood oath to honor an ancestral pact. Omi Province — summer 1570.",
  },
  {
    label: "4",
    name: "Osaka Castle",
    nameJa: "大阪城",
    date: "1583",
    lat: 34.68766,
    lng: 135.52705,
    img: "hideyoriyamazatomaru.webp",
    teaser:
      "Lady Yodo spent her lifetime close to powerful men making promises they never intended to keep ...",
    caption:
      "Summer siege — 1615. Lady Yodo and Hideyori waiting for an answer that will never come.",
  },
];

export function InvestigationMap() {
  const { locale } = useLocale();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ remove(): void } | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => initMap();
    document.head.appendChild(script);

    function initMap() {
      const L = (window as unknown as { L: typeof import("leaflet") }).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [34.6836, 135.5238],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const attr = document.querySelector(".leaflet-control-attribution") as HTMLElement | null;
      if (attr) attr.style.cssText = "background:rgba(14,12,9,0.8);color:#7a6240;font-size:0.6rem;";

      function makeIcon(label: string) {
        return L.divIcon({
          html: `<div class="cm-pin stop"><div class="cm-circle">${label}</div><div class="cm-tail"></div></div>`,
          className: "",
          iconSize: [40, 52],
          iconAnchor: [20, 52],
          popupAnchor: [0, -56],
        });
      }

      INVESTIGATION_STOPS.forEach((stop) => {
        const marker = L.marker([stop.lat, stop.lng], { icon: makeIcon(stop.label) }).addTo(map);
        const name = locale === "ja" ? stop.nameJa : stop.name;
        marker.bindPopup(
          `<img class="lpop-img" src="/${stop.img}" alt="${name}">
           <div class="lpop-body">
             <p class="lpop-date">${stop.date}</p>
             <p class="lpop-name">${name}</p>
             <p class="lpop-teaser">${stop.teaser}</p>
             <p class="lpop-caption">${stop.caption}</p>
           </div>`,
          { maxWidth: 300, minWidth: 300, autoPan: true, closeButton: true }
        );
      });

      const bounds = L.latLngBounds(INVESTIGATION_STOPS.map((s) => [s.lat, s.lng]));
      const isMobile = window.innerWidth <= 560;
      map.fitBounds(bounds, { padding: isMobile ? [20, 20] : [48, 48] });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locale]);

  return (
    <div className="edu-map-section">
      <h2>{locale === "ja" ? "探究の候補地点" : "Possible Investigation Stops"}</h2>
      <p className="section-subtitle">
        {locale === "ja"
          ? "訪問する地点は、選択する探究によって異なります。"
          : "The sites we visit depend on the investigation you choose."}
      </p>
      <div className="edu-map-outer">
        <div id="edu-map" ref={mapRef} />
      </div>
    </div>
  );
}
