import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import { getDistanceCapKm, normalizeDuration } from "../lib/pricing";
import { SELECTED_CITY_KEY, getSelectedCitySlug } from "./CitySelect";
import {
  clearCustomerSession,
  formatCustomerPhone,
  readCustomerSession,
  upsertCustomerProfile,
} from "../lib/customerProfile";

const SAVED_LOCATIONS_KEY = "mayaCabsSavedLocations";
const MAX_SAVED_LOCATIONS = 8;

const WHEELCHAIR_OPTIONS = [
  {
    id: "standard",
    label: "Standard Width",
    badge: "Fits Easily",
    badgeColor: "bg-teal-100 text-teal-700",
    dimension: "Under 28 inches (under 71 cm)",
    desc: "Most manual and transport wheelchairs. Fits our van comfortably.",
  },
  {
    id: "wide",
    label: "Wide / Power Chair",
    badge: "On-Call Confirmation",
    badgeColor: "bg-amber-100 text-amber-700",
    dimension: "28 inches and above (71 cm+)",
    desc: "Requires on-call confirmation before booking confirmation.",
  },
];

export default function Details({ onNext, onBack }) {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const booking = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
  const [selectedCity, setSelectedCity] = useState(null);
  const [customerSession, setCustomerSession] = useState(() => readCustomerSession());

  useEffect(() => {
    const city = localStorage.getItem(SELECTED_CITY_KEY) || null;
    setSelectedCity(city);
  }, []);

  useEffect(() => {
    if (!citySlug) return;
    const normalized = String(citySlug).trim().toLowerCase();
    if (normalized === "lahore") localStorage.setItem(SELECTED_CITY_KEY, "Lahore");
    if (normalized === "karachi") localStorage.setItem(SELECTED_CITY_KEY, "Karachi");
    setSelectedCity(localStorage.getItem(SELECTED_CITY_KEY) || null);
  }, [citySlug]);

  const selectedDuration = normalizeDuration(booking.duration);
  const distanceCapKm = getDistanceCapKm(selectedDuration, selectedCity);

  const [wheelchairType, setWheelchairType] = useState(booking.wheelchairType || "");
  const [pickup, setPickup] = useState(booking.pickup || "");
  const [destination, setDestination] = useState(booking.destination || "");
  const [tripType, setTripType] = useState(booking.tripType || "");
  const [fullName, setFullName] = useState(booking.fullName || "");
  const [phone, setPhone] = useState(booking.phone || "");
  const [notEmergency, setNotEmergency] = useState(Boolean(booking.notEmergency));
  const [profileSyncing, setProfileSyncing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [savedLocations, setSavedLocations] = useState({ pickup: [], destination: [] });
  const [locationMessage, setLocationMessage] = useState("");

  const allValid =
    wheelchairType &&
    pickup.trim() &&
    destination.trim() &&
    tripType &&
    fullName.trim() &&
    phone.trim() &&
    notEmergency;

  const saveLocationsToStorage = (nextLocations) => {
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(nextLocations));
    setSavedLocations(nextLocations);
  };

  const saveLocation = (type, value) => {
    const text = String(value || "").trim();
    if (!text) return;

    const current = savedLocations[type] || [];
    const filtered = current.filter((entry) => entry.toLowerCase() !== text.toLowerCase());
    const next = [text, ...filtered].slice(0, MAX_SAVED_LOCATIONS);
    const nextLocations = { ...savedLocations, [type]: next };
    saveLocationsToStorage(nextLocations);
    setLocationMessage(`${type === "pickup" ? "Pickup" : "Destination"} location saved.`);
  };

  useEffect(() => {
    const profile = customerSession?.profile;
    if (!profile) return;

    setWheelchairType((current) => current || profile.wheelchair_type || "");
    setPickup((current) => current || profile.pickup || "");
    setDestination((current) => current || profile.destination || "");
    setTripType((current) => current || profile.trip_type || "");
    setFullName((current) => current || profile.full_name || "");
    setPhone((current) => current || formatCustomerPhone(profile.phone || customerSession.phone || ""));
  }, [customerSession]);

  useEffect(() => {
    const persisted = JSON.parse(localStorage.getItem(SAVED_LOCATIONS_KEY) || "{}");
    const persistedPickup = Array.isArray(persisted.pickup) ? persisted.pickup : [];
    const persistedDestination = Array.isArray(persisted.destination) ? persisted.destination : [];

    const mergeUnique = (values) => {
      const merged = [];
      values.forEach((value) => {
        const text = String(value || "").trim();
        if (!text) return;
        if (merged.some((entry) => entry.toLowerCase() === text.toLowerCase())) return;
        merged.push(text);
      });
      return merged.slice(0, MAX_SAVED_LOCATIONS);
    };

    setSavedLocations({
      pickup: mergeUnique([customerSession?.profile?.pickup, ...persistedPickup]),
      destination: mergeUnique([customerSession?.profile?.destination, ...persistedDestination]),
    });
  }, [customerSession]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Confirm Details"
        subtitle="Wheelchair & passenger information"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={3} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-1">Confirm Your Details</h2>
        <p className="text-slate-500 text-sm mb-5">
          We need this information before confirming your booking
        </p>

        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#059669" strokeWidth={1.8}>
                <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
                <path d="M9.5 12.5l1.75 1.75L15 10.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Customer Profile</span>
              <p className="text-slate-500 text-xs mt-0.5">Sign in once and use the same saved details on all devices.</p>
            </div>
          </div>
          <div className="px-4 pb-4 flex flex-col gap-3">
            {customerSession ? (
              <div>
                <div className="font-bold text-slate-900 text-sm">Signed in as {customerSession.profile?.full_name || "Customer"}</div>
                <div className="text-slate-500 text-xs mt-1">Phone: {formatCustomerPhone(customerSession.phone)}</div>
                <div className="text-slate-500 text-xs mt-1">Saved profile fields are auto-filled here and updated when you continue.</div>
              </div>
            ) : null}

            {customerSession ? (
              <button
                type="button"
                onClick={() => {
                  clearCustomerSession();
                  setCustomerSession(null);
                  setProfileMessage("Signed out on this device.");
                }}
                className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Sign Out On This Device
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const activeCitySlug = citySlug || getSelectedCitySlug();
                  navigate(`/customer-login?next=/booking/city/${activeCitySlug}/details`);
                }}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
              >
                Sign In / Create Synced Profile
              </button>
            )}

            {profileMessage && <div className="text-xs text-emerald-700 font-semibold">{profileMessage}</div>}
          </div>
        </div>

        {/* Wheelchair Type card */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#0d9488" strokeWidth={1.8}>
                <circle cx="12" cy="6" r="2" />
                <path d="M9 12h3l1 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 17a4 4 0 1 0 8 0" strokeLinecap="round" />
                <path d="M16 10l2 2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Wheelchair Type</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <p className="px-4 pb-3 text-slate-500 text-sm">
            Select the width of your wheelchair so we can confirm our van can accommodate it.
          </p>
          <div className="px-4 pb-4 flex flex-col gap-3">
            {WHEELCHAIR_OPTIONS.map((opt) => {
              const isSelected = wheelchairType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setWheelchairType(opt.id)}
                  className={[
                    "w-full text-left rounded-2xl border-2 px-4 py-4 flex items-start gap-3 transition",
                    isSelected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected ? "border-teal-600 bg-teal-600" : "border-slate-300",
                    ].join(" ")}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-slate-900 text-sm">{opt.label}</span>
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-teal-700 font-bold text-xs mb-1">{opt.dimension}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Journey Details card */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#0d9488" strokeWidth={1.8}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Journey Details</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <p className="px-4 pb-3 text-slate-500 text-sm">
            Where are we picking you up and where are we going?
          </p>
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Pickup Location <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                placeholder="e.g. 15-B Model Town, Lahore"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Saved pickup locations</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                  onClick={() => saveLocation("pickup", pickup)}
                >
                  Save this pickup
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {savedLocations.pickup.length ? (
                  savedLocations.pickup.map((item) => (
                    <button
                      key={`pickup-${item}`}
                      type="button"
                      onClick={() => setPickup(item)}
                      className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No pickup locations saved yet.</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                placeholder="e.g. Services Hospital, Lahore"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Saved destinations</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                  onClick={() => saveLocation("destination", destination)}
                >
                  Save this destination
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {savedLocations.destination.length ? (
                  savedLocations.destination.map((item) => (
                    <button
                      key={`destination-${item}`}
                      type="button"
                      onClick={() => setDestination(item)}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No destination locations saved yet.</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-2">
                Trip Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {[
                  { id: "one-way", label: "One-Way", desc: "Drop off only" },
                  { id: "wait-return", label: "Wait & Return", desc: "Driver waits & brings back" },
                ].map((t) => {
                  const isSel = tripType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTripType(t.id)}
                      className={[
                        "flex-1 text-left rounded-2xl border-2 px-3 py-3 flex flex-col gap-1 transition",
                        isSel ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={["w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", isSel ? "border-teal-600 bg-teal-600" : "border-slate-300"].join(" ")}>
                          {isSel && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{t.label}</span>
                      </div>
                      <span className="text-slate-500 text-xs pl-5">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3">
              <div className="text-slate-900 text-sm font-bold mb-2">Trip & Refund Policy</div>
              <p className="text-amber-900 text-xs leading-relaxed mb-3">
                Allowed trip distance for this booking: <span className="font-bold">up to {distanceCapKm} km</span>.
              </p>
              <div className="text-slate-800 text-xs font-semibold mb-1">Standard Individual Customers</div>
              <div className="flex flex-col gap-1 text-xs text-slate-700">
                <div>48+ hours: Full refund</div>
                <div>24-48 hours: 90% refund</div>
                <div>12-24 hours: 50% refund or credit</div>
                <div>&lt;12 hours: Forfeit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger info card */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#3b82f6" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Passenger Information</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <p className="px-4 pb-3 text-slate-500 text-sm">
            Enter details of the person being transported.
          </p>
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                placeholder="e.g. Muhammad Tariq"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
              />
            </div>
          </div>
        </div>

        {/* Emergency confirmation */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#f59e0b" strokeWidth={1.8}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Important Confirmation</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setNotEmergency(!notEmergency)}
              className={[
                "w-full text-left rounded-2xl border-2 px-4 py-4 flex items-start gap-3 transition",
                notEmergency ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  notEmergency ? "border-teal-600 bg-teal-600" : "border-slate-300",
                ].join(" ")}
              >
                {notEmergency && (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">
                  I confirm this is NOT a medical emergency
                </div>
                <div className="text-slate-500 text-xs">
                  For emergencies, please call 1122 (Rescue)
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        {!allValid && (
          <p className="text-orange-500 font-semibold text-sm text-center mb-3">
            Complete all required fields above to continue
          </p>
        )}
        <button
          disabled={!allValid || profileSyncing}
          className={[
            "w-full font-bold text-base rounded-2xl py-4 transition",
            allValid && !profileSyncing
              ? "bg-teal-700 text-white hover:bg-teal-800"
              : "bg-slate-200 text-slate-400 cursor-not-allowed",
          ].join(" ")}
          onClick={async () => {
            if (!allValid || profileSyncing) return;
            setProfileSyncing(true);
            const existing = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
            const updatedBooking = {
              ...existing,
              wheelchairType,
              pickup,
              destination,
              tripType,
              fullName,
              phone,
              notEmergency,
            };
            localStorage.setItem(
              "mayaCabsBooking",
              JSON.stringify(updatedBooking)
            );

            const dedupe = (values) => values
              .map((value) => String(value || "").trim())
              .filter(Boolean)
              .filter((value, index, arr) => arr.findIndex((entry) => entry.toLowerCase() === value.toLowerCase()) === index)
              .slice(0, MAX_SAVED_LOCATIONS);

            const nextLocations = {
              pickup: dedupe([pickup, ...(savedLocations.pickup || [])]),
              destination: dedupe([destination, ...(savedLocations.destination || [])]),
            };
            saveLocationsToStorage(nextLocations);

            try {
              if (customerSession?.phone && customerSession?.pinHash) {
                const nextSession = await upsertCustomerProfile({
                  phone: customerSession.phone,
                  pinHash: customerSession.pinHash,
                  profile: {
                    fullName,
                    wheelchairType,
                    pickup,
                    destination,
                    tripType,
                  },
                });
                setCustomerSession(nextSession);
                setPhone(formatCustomerPhone(nextSession.phone));
              }
            } catch (error) {
              setProfileMessage(error.message || "Unable to sync customer profile right now.");
              setProfileSyncing(false);
              return;
            }

            setProfileSyncing(false);
            const activeCitySlug = citySlug || getSelectedCitySlug();
            if (onNext) onNext({ wheelchairType, pickup, destination, tripType, fullName, phone });
            else navigate(`/booking/city/${activeCitySlug}/review`);
          }}
        >
          {allValid ? (profileSyncing ? "Syncing Profile..." : "Continue to Review →") : "Fill in all required fields"}
        </button>
        {locationMessage && <p className="text-teal-700 font-semibold text-xs text-center mt-2">{locationMessage}</p>}
      </div>
    </div>
  );
}
