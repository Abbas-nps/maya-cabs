import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import { supabase } from "../supabase";
import { getSlotPrice, normalizeDuration } from "../lib/pricing";
import { SELECTED_CITY_KEY, getSelectedCitySlug } from "./CitySelect";

const DAYS_TO_SHOW = 7;
const MAX_BOOKING_AHEAD_DAYS = 14;
const MIN_SLOT_GAP_HOURS = 2;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLong(ds) {
  const d = new Date(`${ds}T00:00:00`);
  return `${DOW_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShort(ds) {
  const d = new Date(`${ds}T00:00:00`);
  return `${DOW_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

function buildDaysList() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(toDateStr(d));
  }

  return days;
}

function isBookedRecord(r) {
  return r.status === "pending" || r.status === "confirmed" || r.status === "completed";
}

function formatHourLabel(hour24) {
  const normalized = ((Number(hour24) % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${hour12}:00 ${suffix}`;
}

function parseHourLabel(label) {
  const match = String(label || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = String(match[3]).toUpperCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes !== 0) return null;

  let hour24 = hours % 12;
  if (suffix === "PM") hour24 += 12;
  return hour24;
}

function getBookingWindow(dateStr, bookingRow) {
  const startHour = parseHourLabel(bookingRow?.slot_time);
  if (startHour === null) return null;

  const start = new Date(`${dateStr}T${String(startHour).padStart(2, "0")}:00:00`);

  const endHour = parseHourLabel(bookingRow?.slot_end);
  if (endHour !== null) {
    const end = new Date(start);
    end.setHours(endHour, 0, 0, 0);
    if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
    return { start, end };
  }

  const durationHours = normalizeDuration(bookingRow?.duration);
  const end = new Date(start);
  end.setHours(end.getHours() + durationHours);
  return { start, end };
}

function isBookingCompletedForDate(dateStr, bookingRow) {
  if (!bookingRow) return false;
  if (bookingRow.status === "completed") return true;

  const window = getBookingWindow(dateStr, bookingRow);
  if (!window) return false;

  const end = window.end;
  return Date.now() >= end.getTime();
}

function buildSlotsForDuration(duration) {
  const normalizedDuration = normalizeDuration(duration);
  const latestStart = 24 - normalizedDuration;
  const slots = [];

  for (let startHour = 0; startHour <= latestStart; startHour += 1) {
    const endHour = startHour + normalizedDuration;
    slots.push({
      id: `${normalizedDuration}H_${String(startHour).padStart(2, "0")}`,
      startHour,
      endHour,
      title: `${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:00`,
      subtitle: `${formatHourLabel(startHour)} - ${formatHourLabel(endHour)}`,
      startLabel: formatHourLabel(startHour),
      endLabel: formatHourLabel(endHour),
    });
  }

  return slots;
}

function hasSlotConflictWithGap(startA, endA, startB, endB, gapHours = MIN_SLOT_GAP_HOURS) {
  const startAMs = startA.getTime();
  const endAMs = endA.getTime() + gapHours * 60 * 60 * 1000;
  const startBMs = startB.getTime();
  const endBMs = endB.getTime() + gapHours * 60 * 60 * 1000;
  return startAMs < endBMs && startBMs < endAMs;
}

// Returns false if the slot start time has already passed, or if it's a Sunday
// and the booking is placed less than 12 hours before the slot starts.
function isSlotTimeEligible(dateStr, slot) {
  const now = new Date();
  const slotStart = new Date(`${dateStr}T${String(slot.startHour).padStart(2, "0")}:00:00`);
  const isSunday = slotStart.getDay() === 0;
  const leadMs = isSunday ? 12 * 60 * 60 * 1000 : 0;
  return now.getTime() + leadMs < slotStart.getTime();
}

function statusForSlot(dateRecords, selectedDuration, slot, dateStr) {
  const bookings = (dateRecords || []).filter(isBookedRecord);
  const slotStart = new Date(`${dateStr}T${String(slot.startHour).padStart(2, "0")}:00:00`);
  const slotEnd = new Date(slotStart);
  slotEnd.setHours(slotEnd.getHours() + normalizeDuration(selectedDuration));

  let hasCompletedOverlap = false;

  for (const bookingRow of bookings) {
    const existingWindow = getBookingWindow(dateStr, bookingRow);
    if (!existingWindow) continue;

    const existingStart = existingWindow.start;
    const existingEnd = existingWindow.end;

    if (!hasSlotConflictWithGap(slotStart, slotEnd, existingStart, existingEnd)) continue;

    if (isBookingCompletedForDate(dateStr, bookingRow)) {
      hasCompletedOverlap = true;
      continue;
    }

    return "BOOKED";
  }

  if (hasCompletedOverlap) return "COMPLETED";
  if (!isSlotTimeEligible(dateStr, slot)) return "UNAVAILABLE";
  return "AVAILABLE";
}

function dayAvailability(dateRecords, selectedDuration, dateStr, blockedSet) {
  if (blockedSet?.has(dateStr)) return "unavailable";
  const slots = buildSlotsForDuration(selectedDuration);
  const statuses = slots.map((slot) => statusForSlot(dateRecords, selectedDuration, slot, dateStr));
  if (statuses.some((s) => s === "AVAILABLE")) return "available";
  if (statuses.some((s) => s === "COMPLETED")) return "completed";
  if (statuses.some((s) => s === "BOOKED")) return "booked";
  return "unavailable";
}

export default function Schedule({ onNext, onBack }) {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const booking = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
  const selectedDuration = normalizeDuration(booking.duration);
  const [selectedCity, setSelectedCity] = useState(
    booking.city || localStorage.getItem(SELECTED_CITY_KEY) || "Lahore"
  );

  const days = useMemo(() => buildDaysList(), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingsByDate, setBookingsByDate] = useState({});
  const [blockedSet, setBlockedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citySlug) return;
    const normalized = String(citySlug).trim().toLowerCase();
    if (normalized === "lahore") {
      localStorage.setItem(SELECTED_CITY_KEY, "Lahore");
      setSelectedCity("Lahore");
      return;
    }
    if (normalized === "karachi") {
      localStorage.setItem(SELECTED_CITY_KEY, "Karachi");
      setSelectedCity("Karachi");
    }
  }, [citySlug]);

  useEffect(() => {
    let alive = true;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + (MAX_BOOKING_AHEAD_DAYS - 1));

    const firstDay = toDateStr(start);
    const lastDay = toDateStr(end);
    const holdCutoff = new Date(Date.now() - 120 * 60 * 1000).toISOString();

    setLoading(true);
    let bookingsQuery = supabase
      .from("bookings")
      .select("booking_date, slot_time, slot_end, duration, status, created_at")
      .gte("booking_date", firstDay)
      .lte("booking_date", lastDay)
      .neq("status", "cancelled")
      .or(`status.neq.pending,created_at.gte.${holdCutoff}`);

    if (selectedCity) {
      bookingsQuery = bookingsQuery.eq("city", selectedCity);
    }

    Promise.all([
      bookingsQuery,
      supabase
        .from("blocked_dates")
        .select("date")
        .gte("date", firstDay)
        .lte("date", lastDay),
    ]).then(([bookingsResp, blockedResp]) => {
        if (!alive) return;

        const grouped = {};
        (bookingsResp.data || []).forEach((row) => {
          if (!grouped[row.booking_date]) grouped[row.booking_date] = [];
          grouped[row.booking_date].push(row);
        });

        setBookingsByDate(grouped);

        const blockedDates = new Set((blockedResp.data || []).map((row) => row.date));
        setBlockedSet(blockedDates);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedCity]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate, selectedDuration]);

  const slots = useMemo(() => buildSlotsForDuration(selectedDuration), [selectedDuration]);
  const selectedDateRecords = bookingsByDate[selectedDate] || [];
  const price = getSlotPrice(selectedDuration, selectedCity) || 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Pick Date & Time"
        subtitle="Choose any start time (24-hour clock)"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={2} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-1">Select your slot</h2>
        <p className="text-slate-500 text-sm mb-4">
          {selectedDuration}-Hour slot • PKR {price.toLocaleString()} • Start at any hour • No extensions allowed
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-900 font-bold text-sm">Next 7 days availability</span>
            <span className="text-slate-500 text-xs">Booking window: up to 14 days ahead</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {days.map((ds) => {
              const availability = dayAvailability(bookingsByDate[ds], selectedDuration, ds, blockedSet);
              const isSelected = ds === selectedDate;

              return (
                <button
                  key={ds}
                  type="button"
                  onClick={() => setSelectedDate(ds)}
                  className={[
                    "rounded-xl border px-3 py-2 text-left transition",
                    isSelected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div className="text-slate-800 font-bold text-sm">{formatShort(ds)}</div>
                  <div className={[
                    "text-xs font-semibold mt-0.5",
                    availability === "available"
                      ? "text-teal-700"
                      : availability === "completed"
                      ? "text-emerald-700"
                      : availability === "booked"
                      ? "text-orange-600"
                      : "text-slate-500",
                  ].join(" ")}>
                    [{
                      availability === "available"
                        ? "Available"
                        : availability === "completed"
                        ? "Ride completed"
                        : availability === "booked"
                        ? "Booked"
                        : "Unavailable"
                    }]
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-slate-900 font-bold text-base mb-1">{formatLong(selectedDate)}</div>
          <p className="text-slate-500 text-xs mb-3">24-hour rolling starts in 1-hour steps</p>

          {loading ? (
            <div className="text-slate-500 text-sm">Loading availability...</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {slots.map((slot) => {
                const status = blockedSet.has(selectedDate)
                  ? "UNAVAILABLE"
                  : statusForSlot(selectedDateRecords, selectedDuration, slot, selectedDate);
                const isBooked = status === "BOOKED";
                const isCompleted = status === "COMPLETED";
                const isUnavailable = status === "UNAVAILABLE";
                const isLocked = isBooked || isCompleted || isUnavailable;
                const isSelected = selectedSlot?.id === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setSelectedSlot(slot)}
                    className={[
                      "w-full rounded-xl border-2 px-4 py-3 text-left transition",
                      isSelected
                        ? "border-teal-600 bg-teal-50"
                        : isBooked
                        ? "border-orange-200 bg-orange-50 text-orange-500 cursor-not-allowed"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-not-allowed"
                        : isUnavailable
                        ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                        : "border-slate-200 bg-white hover:border-teal-300",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm">{slot.title}</div>
                        <div className="text-xs text-slate-500">{slot.subtitle}</div>
                      </div>
                      <span className={[
                        "text-xs font-bold rounded-full px-2.5 py-1",
                        isBooked
                          ? "bg-orange-100 text-orange-700"
                          : isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : isUnavailable
                          ? "bg-slate-200 text-slate-700"
                          : "bg-teal-100 text-teal-700",
                      ].join(" ")}>
                        [{isBooked ? "Booked" : isCompleted ? "Ride completed" : isUnavailable ? "Unavailable" : "Available"}]
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            You are booking a fixed time slot. No extensions are allowed. If you need more time,
            book another slot (subject to availability).
          </p>
          {blockedSet.has(selectedDate) && (
            <p className="text-rose-700 text-xs mt-2 font-semibold">
              This date is blocked by admin and is unavailable for booking.
            </p>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 text-sm">{formatShort(selectedDate)}</span>
          {selectedSlot ? (
            <span className="font-extrabold text-slate-900 text-base">
              {selectedSlot.startLabel} → {selectedSlot.endLabel}
            </span>
          ) : (
            <span className="text-slate-400 text-sm">Select a slot</span>
          )}
        </div>
        <button
          type="button"
          disabled={!selectedSlot}
          className={[
            "w-full font-bold text-base rounded-2xl py-4 transition",
            selectedSlot
              ? "bg-teal-700 text-white hover:bg-teal-800"
              : "bg-slate-200 text-slate-400 cursor-not-allowed",
          ].join(" ")}
          onClick={() => {
            if (!selectedSlot) return;
            const existing = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
            localStorage.setItem(
              "mayaCabsBooking",
              JSON.stringify({
                ...existing,
                date: selectedDate,
                duration: selectedDuration,
                slotCode: selectedSlot.id,
                slotTime: selectedSlot.startLabel,
                slotEnd: selectedSlot.endLabel,
                total: price,
              })
            );

            const activeCitySlug = citySlug || getSelectedCitySlug();
            if (onNext) onNext(selectedDate, selectedSlot);
            else navigate(`/booking/city/${activeCitySlug}/details`);
          }}
        >
          Confirm Date &amp; Time →
        </button>
      </div>
    </div>
  );
}
