import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import { calculateBookingTotalPkr, getDistanceCapKm, normalizeDuration } from "../lib/pricing";
import { SELECTED_CITY_KEY, getSelectedCitySlug } from "./CitySelect";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function formatDate(ds) {
  if (!ds) return "—";
  const d = new Date(ds + "T00:00:00");
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`text-sm font-bold text-right max-w-[55%] ${highlight ? "text-teal-700" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

export default function Review({ onNext, onBack }) {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const booking = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
  const [selectedCity, setSelectedCity] = useState(null);

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

  const durationValue = normalizeDuration(booking.duration);
  const duration = durationValue || "—";
  const distanceCapKm = getDistanceCapKm(durationValue, selectedCity);
  const total = calculateBookingTotalPkr(booking.duration, selectedCity, booking.total);
  const date = formatDate(booking.date);
  const timeSlot = booking.slotTime && booking.slotEnd
    ? `${booking.slotTime} → ${booking.slotEnd}`
    : "—";
  const city = booking.city || selectedCity || "—";
  const passenger = booking.fullName || "—";
  const phone = booking.phone || "—";
  const pickup = booking.pickup || "—";
  const destination = booking.destination || "—";
  const tripType = booking.tripType === "one-way" ? "One-Way" : booking.tripType === "wait-return" ? "Wait & Return" : "—";
  const wheelchair = booking.wheelchairType === "standard"
    ? "Standard Width (under 28 in)"
    : booking.wheelchairType === "wide"
    ? "Wide / Power Chair (28 in and above - on-call confirmation required)"
    : "—";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Review Booking"
        subtitle="Confirm your booking details"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={4} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-1">Review Your Booking</h2>
        <p className="text-slate-500 text-sm mb-5">
          Please check everything below before confirming.
        </p>

        {/* Trip details */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-teal-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="white" strokeWidth={1.8}>
                <rect x="2" y="3" width="16" height="15" rx="2" />
                <path d="M7 1v3M13 1v3M2 8h16" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-white text-base">Trip Details</span>
          </div>
          <div className="px-4 py-1">
            <Row label="City" value={city} />
            <Row label="Date" value={date} />
            <Row label="Time Slot" value={timeSlot} />
            <Row label="Duration" value={`${duration} hours`} />
            <Row label="Distance Cap" value={`${distanceCapKm} km (city-only use)`} />
            <Row label="Pickup" value={pickup} />
            <Row label="Destination" value={destination} />
            <Row label="Trip Type" value={tripType} />
          </div>
        </div>

        {/* Passenger details */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-teal-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="white" strokeWidth={1.8}>
                <circle cx="10" cy="7" r="4" />
                <path d="M3 18c0-4 3.1-7 7-7s7 3 7 7" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-white text-base">Passenger Details</span>
          </div>
          <div className="px-4 py-1">
            <Row label="Full Name" value={passenger} />
            <Row label="Phone" value={phone} />
            <Row label="Wheelchair" value={wheelchair} />
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-teal-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="white" strokeWidth={1.8}>
                <rect x="1" y="5" width="18" height="12" rx="2" />
                <path d="M1 9h18" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-white text-base">Price Breakdown</span>
          </div>
          <div className="px-4 py-1">
            <Row label={`${duration} Hour Slot`} value={total ? `PKR ${Number(total).toLocaleString()}` : "—"} />
            <Row label="Payment Method" value="Prepaid (online)" />
            <Row label="Slot Policy" value="Exactly fixed duration • No extensions allowed" />
            <div className="flex items-center justify-between py-3">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-extrabold text-teal-700 text-xl">{total ? `PKR ${Number(total).toLocaleString()}` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="#d97706" strokeWidth={1.8} className="flex-shrink-0 mt-0.5">
            <circle cx="10" cy="10" r="8" /><path d="M10 7v3m0 3h.01" strokeLinecap="round" />
          </svg>
          <p className="text-amber-800 text-xs leading-relaxed">
            Your booking will be confirmed via WhatsApp. Please keep your phone available after submitting.
          </p>
        </div>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 text-sm">Total payable</span>
          <span className="font-extrabold text-teal-700 text-lg">{total ? `PKR ${Number(total).toLocaleString()}` : "—"}</span>
        </div>
        <button
          className="w-full bg-teal-700 text-white font-bold text-base rounded-2xl py-4 hover:bg-teal-800 transition"
          onClick={() => {
            const activeCitySlug = citySlug || getSelectedCitySlug();
            if (onNext) onNext();
            else navigate(`/booking/city/${activeCitySlug}/payment`);
          }}
        >
          Confirm &amp; Continue to Payment →
        </button>
      </div>
    </div>
  );
}
