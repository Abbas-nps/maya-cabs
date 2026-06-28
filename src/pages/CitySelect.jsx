import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import TopBar from "../components/TopBar";

export const SELECTED_CITY_KEY = "mayaCabsSelectedCity";

/* ─────────────────────────────────────────────
   Minimalist sketch SVGs — one per city
   ───────────────────────────────────────────── */

function LahoreSketch({ className = "" }) {
  // Badshahi Mosque — four minarets, three domes, arched gateway
  return (
    <svg
      viewBox="0 0 200 118"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Ground */}
      <line x1="0" y1="108" x2="200" y2="108" />

      {/* ── Outer left minaret ── */}
      <line x1="12" y1="22" x2="12" y2="108" />
      <line x1="20" y1="22" x2="20" y2="108" />
      <path d="M12 22 Q16 12 20 22" />
      <line x1="16" y1="12" x2="16" y2="5" />
      <circle cx="16" cy="4" r="2" />
      {/* balcony rings */}
      <line x1="9" y1="56" x2="23" y2="56" />
      <line x1="9" y1="72" x2="23" y2="72" />

      {/* ── Inner left minaret ── */}
      <line x1="48" y1="36" x2="48" y2="108" />
      <line x1="56" y1="36" x2="56" y2="108" />
      <path d="M48 36 Q52 27 56 36" />
      <line x1="52" y1="27" x2="52" y2="20" />
      <circle cx="52" cy="19" r="1.8" />
      <line x1="45" y1="66" x2="59" y2="66" />

      {/* ── Inner right minaret ── */}
      <line x1="144" y1="36" x2="144" y2="108" />
      <line x1="152" y1="36" x2="152" y2="108" />
      <path d="M144 36 Q148 27 152 36" />
      <line x1="148" y1="27" x2="148" y2="20" />
      <circle cx="148" cy="19" r="1.8" />
      <line x1="141" y1="66" x2="155" y2="66" />

      {/* ── Outer right minaret ── */}
      <line x1="180" y1="22" x2="180" y2="108" />
      <line x1="188" y1="22" x2="188" y2="108" />
      <path d="M180 22 Q184 12 188 22" />
      <line x1="184" y1="12" x2="184" y2="5" />
      <circle cx="184" cy="4" r="2" />
      <line x1="177" y1="56" x2="191" y2="56" />
      <line x1="177" y1="72" x2="191" y2="72" />

      {/* ── Left dome ── */}
      <path d="M56 78 Q76 56 96 78" />
      <line x1="56" y1="78" x2="56" y2="108" />
      <line x1="96" y1="78" x2="96" y2="108" />
      {/* dome ledge */}
      <line x1="52" y1="78" x2="100" y2="78" />

      {/* ── Centre dome (tallest) ── */}
      <path d="M68 74 Q100 36 132 74" />
      <line x1="68" y1="74" x2="68" y2="108" />
      <line x1="132" y1="74" x2="132" y2="108" />
      <line x1="64" y1="74" x2="136" y2="74" />

      {/* ── Right dome ── */}
      <path d="M104 78 Q124 56 144 78" />
      <line x1="104" y1="78" x2="104" y2="108" />
      <line x1="144" y1="78" x2="144" y2="108" />
      <line x1="100" y1="78" x2="148" y2="78" />

      {/* ── Main entrance arch ── */}
      <path d="M88 108 L88 92 Q100 81 112 92 L112 108" />

      {/* Side arches */}
      <path d="M62 108 L62 99 Q68 93 74 99 L74 108" />
      <path d="M126 108 L126 99 Q132 93 138 99 L138 108" />

      {/* Courtyard ground walls */}
      <line x1="20" y1="108" x2="48" y2="108" />
      <line x1="152" y1="108" x2="180" y2="108" />
    </svg>
  );
}

function KarachiSketch({ className = "" }) {
  // Coastal skyline — towers, Quaid Mausoleum dome cluster, sea waves
  return (
    <svg
      viewBox="0 0 200 118"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Ground / quay edge */}
      <line x1="0" y1="100" x2="200" y2="100" />

      {/* Arabian Sea waves */}
      <path d="M0 108 Q25 103 50 108 Q75 113 100 108 Q125 103 150 108 Q175 113 200 108" />
      <path d="M0 116 Q25 111 50 116 Q75 121 100 116 Q125 111 150 116 Q175 121 200 116" />

      {/* Building 1 – short */}
      <rect x="4" y="76" width="20" height="24" />
      <line x1="4" y1="83" x2="24" y2="83" />
      <line x1="4" y1="91" x2="24" y2="91" />

      {/* Building 2 – mid-tall */}
      <rect x="30" y="52" width="20" height="48" />
      <line x1="30" y1="60" x2="50" y2="60" />
      <line x1="30" y1="68" x2="50" y2="68" />
      <line x1="30" y1="76" x2="50" y2="76" />
      <line x1="30" y1="84" x2="50" y2="84" />
      <line x1="30" y1="92" x2="50" y2="92" />

      {/* Building 3 – medium */}
      <rect x="56" y="64" width="18" height="36" />
      <line x1="56" y1="72" x2="74" y2="72" />
      <line x1="56" y1="80" x2="74" y2="80" />
      <line x1="56" y1="88" x2="74" y2="88" />

      {/* Building 4 – tallest (Habib Bank Plaza / tower) with stepped crown + antenna */}
      <rect x="80" y="24" width="26" height="76" />
      <line x1="80" y1="34" x2="106" y2="34" />
      <line x1="80" y1="44" x2="106" y2="44" />
      <line x1="80" y1="54" x2="106" y2="54" />
      <line x1="80" y1="64" x2="106" y2="64" />
      <line x1="80" y1="74" x2="106" y2="74" />
      <line x1="80" y1="84" x2="106" y2="84" />
      <line x1="80" y1="94" x2="106" y2="94" />
      {/* stepped crown */}
      <rect x="84" y="18" width="18" height="6" />
      <rect x="88" y="14" width="10" height="4" />
      {/* antenna */}
      <line x1="93" y1="14" x2="93" y2="6" />
      <line x1="89" y1="9" x2="97" y2="9" />

      {/* Building 5 – medium right */}
      <rect x="114" y="56" width="20" height="44" />
      <line x1="114" y1="64" x2="134" y2="64" />
      <line x1="114" y1="72" x2="134" y2="72" />
      <line x1="114" y1="80" x2="134" y2="80" />
      <line x1="114" y1="88" x2="134" y2="88" />

      {/* Quaid-e-Azam Mausoleum – three domes, four spires */}
      {/* Platform */}
      <rect x="144" y="80" width="52" height="20" />
      {/* Main dome */}
      <path d="M148 80 Q170 54 192 80" />
      {/* Finial */}
      <line x1="170" y1="54" x2="170" y2="46" />
      <circle cx="170" cy="45" r="2" />
      {/* Side mini domes */}
      <path d="M144 80 Q152 70 160 80" />
      <path d="M180 80 Q188 70 196 80" />
      {/* Four corner spires */}
      <line x1="144" y1="64" x2="144" y2="80" />
      <path d="M141 64 Q144 57 147 64" />
      <line x1="196" y1="64" x2="196" y2="80" />
      <path d="M193 64 Q196 57 199 64" />
    </svg>
  );
}

function IslamabadSketch({ className = "" }) {
  // Faisal Mosque – triangular tent prayer hall, four pencil minarets, Margalla hills outline
  return (
    <svg
      viewBox="0 0 200 118"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Margalla Hills – gentle silhouette */}
      <path d="M0 70 Q18 52 40 55 Q68 60 100 42 Q132 26 162 48 Q182 58 200 62" />

      {/* Ground */}
      <line x1="0" y1="108" x2="200" y2="108" />

      {/* ── Outer left pencil minaret ── */}
      <line x1="26" y1="20" x2="26" y2="108" />
      <line x1="32" y1="20" x2="32" y2="108" />
      <path d="M26 20 Q29 12 32 20" />
      <line x1="29" y1="12" x2="29" y2="6" />
      <line x1="22" y1="50" x2="36" y2="50" />

      {/* ── Outer right pencil minaret ── */}
      <line x1="168" y1="20" x2="168" y2="108" />
      <line x1="174" y1="20" x2="174" y2="108" />
      <path d="M168 20 Q171 12 174 20" />
      <line x1="171" y1="12" x2="171" y2="6" />
      <line x1="164" y1="50" x2="178" y2="50" />

      {/* ── Inner left minaret ── */}
      <line x1="64" y1="36" x2="64" y2="108" />
      <line x1="70" y1="36" x2="70" y2="108" />
      <path d="M64 36 Q67 28 70 36" />
      <line x1="67" y1="28" x2="67" y2="22" />

      {/* ── Inner right minaret ── */}
      <line x1="130" y1="36" x2="130" y2="108" />
      <line x1="136" y1="36" x2="136" y2="108" />
      <path d="M130 36 Q133 28 136 36" />
      <line x1="133" y1="28" x2="133" y2="22" />

      {/* ── Triangular tent (main prayer hall) ── */}
      <path d="M48 108 L100 40 L152 108 Z" />
      {/* Horizontal banding lines */}
      <line x1="60" y1="90" x2="140" y2="90" />
      <line x1="54" y1="99" x2="146" y2="99" />

      {/* Entrance portal arch */}
      <path d="M91 108 L91 98 Q100 90 109 98 L109 108" />

      {/* Front courtyard platform */}
      <line x1="38" y1="108" x2="162" y2="108" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   City data
   ───────────────────────────────────────────── */

const CITIES = [
  {
    id: "Lahore",
    label: "Lahore",
    region: "Punjab",
    status: "active",
    badge: "Active",
    badgeClass: "bg-teal-100 text-teal-700",
    cardClass:
      "bg-white border-2 border-transparent hover:border-teal-500 active:border-teal-700 cursor-pointer shadow-sm hover:shadow-md transition-all",
    sketchColor: "text-teal-700",
    Sketch: LahoreSketch,
  },
  {
    id: "Karachi",
    label: "Karachi",
    region: "Sindh",
    status: "active",
    badge: "Active",
    badgeClass: "bg-teal-100 text-teal-700",
    cardClass:
      "bg-white border-2 border-transparent hover:border-teal-500 active:border-teal-700 cursor-pointer shadow-sm hover:shadow-md transition-all",
    sketchColor: "text-teal-700",
    Sketch: KarachiSketch,
  },
  {
    id: "Islamabad",
    label: "Islamabad",
    region: "Federal Capital",
    status: "coming-soon",
    badge: "Coming Soon",
    badgeClass: "bg-slate-200 text-slate-500",
    cardClass:
      "bg-slate-50 border-2 border-slate-200 cursor-not-allowed opacity-60 select-none",
    sketchColor: "text-slate-400",
    Sketch: IslamabadSketch,
  },
];

function cityIdToSlug(cityId) {
  return String(cityId || "").trim().toLowerCase();
}

function slugToCityId(slug) {
  const normalized = String(slug || "").trim().toLowerCase();
  if (normalized === "lahore") return "Lahore";
  if (normalized === "karachi") return "Karachi";
  return null;
}

export function getSelectedCitySlug() {
  const cityId = localStorage.getItem(SELECTED_CITY_KEY) || "Lahore";
  return cityIdToSlug(cityId);
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */

export default function CitySelect() {
  const navigate = useNavigate();
  const { citySlug } = useParams();

  useEffect(() => {
    if (!citySlug) return;

    const cityId = slugToCityId(citySlug);
    const selectedCity = CITIES.find((city) => city.id === cityId && city.status === "active");
    if (!selectedCity) {
      navigate("/booking/city", { replace: true });
      return;
    }

    localStorage.setItem(SELECTED_CITY_KEY, selectedCity.id);
    const existing = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
    localStorage.setItem("mayaCabsBooking", JSON.stringify({ ...existing, city: selectedCity.id }));
    navigate(`/booking/city/${cityIdToSlug(selectedCity.id)}/duration`, { replace: true });
  }, [citySlug, navigate]);

  function handleSelect(city) {
    if (city.status !== "active") return;
    navigate(`/booking/city/${cityIdToSlug(city.id)}`);
  }

  return (
    <>
      <Helmet>
        <title>Select City | Maya Cabs</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-slate-100 flex flex-col">
        <TopBar
          title="Select Your City"
          subtitle="Wheelchair accessible transport"
          showBack
          onBack={() => navigate("/about")}
          rightLabel={null}
        />

        <div className="flex-1 flex flex-col px-4 pt-6 pb-24">
          <p className="text-slate-500 text-sm text-center mb-6">
            Choose the city you need a ride in
          </p>

          <div className="flex flex-col gap-4">
            {CITIES.map((city) => {
              const { Sketch } = city;
              const isActive = city.status === "active";

              return (
                <div
                  key={city.id}
                  role={isActive ? "button" : undefined}
                  tabIndex={isActive ? 0 : undefined}
                  aria-disabled={!isActive}
                  onClick={() => handleSelect(city)}
                  onKeyDown={(e) => {
                    if (isActive && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleSelect(city);
                    }
                  }}
                  className={`rounded-2xl p-4 ${city.cardClass}`}
                >
                  {/* Sketch illustration */}
                  <div
                    className={`w-full flex items-center justify-center mb-4 ${city.sketchColor}`}
                    style={{ height: "9rem" }}
                  >
                    <Sketch className="h-full w-auto max-w-[18rem]" />
                  </div>

                  {/* Label row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-lg leading-tight">
                        {city.label}
                      </div>
                      <div className="text-slate-500 text-sm mt-0.5">
                        {city.region}
                        {isActive && (
                          <span className="ml-2 text-teal-600 text-xs">
                            · Service available
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${city.badgeClass}`}
                    >
                      {city.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-slate-400 text-xs text-center mt-8 leading-relaxed">
            More cities coming as our network grows across Pakistan
          </p>
        </div>
      </div>
    </>
  );
}
