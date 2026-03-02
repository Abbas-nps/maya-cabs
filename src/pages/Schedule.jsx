import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import { supabase } from "../supabase";

// Total bookable slots per day (10 AM – 8 PM = 11 slots)
const TOTAL_SLOTS = 11;

// Derive availability from real booking count
function getAvailability(dateStr, bookingCounts) {
  const count = bookingCounts[dateStr] || 0;
  if (count >= TOTAL_SLOTS) return "booked";
  if (count >= 4) return "limited";
  return "available";
}

// Operating hours: 10:00 AM – 10:00 PM
const SLOT_GROUPS = [
  {
    period: "MORNING",
    emoji: "☀️",
    slots: ["10:00 AM", "11:00 AM"],
  },
  {
    period: "AFTERNOON",
    emoji: "🌤️",
    slots: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
  },
  {
    period: "EVENING",
    emoji: "🌅",
    slots: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
  },
];

/** Convert "10:00 AM" / "2:00 PM" to 24-hour integer */
function slotToHour(timeStr) {
  const [time, meridian] = timeStr.split(" ");
  let h = parseInt(time.split(":")[0], 10);
  if (meridian === "PM" && h !== 12) h += 12;
  if (meridian === "AM" && h === 12) h = 0;
  return h;
}

/** Add `hours` to a time string, return formatted string */
function addHours(timeStr, hours) {
  const r = slotToHour(timeStr) + hours;
  if (r === 0) return "12:00 AM";
  if (r < 12) return `${r}:00 AM`;
  if (r === 12) return "12:00 PM";
  return `${r - 12}:00 PM`;
}

/** Format a 24-hour integer to display string */
function formatHour(h) {
  if (h <= 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DOW_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DOW_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function formatShort(ds) {
  if (!ds) return "";
  const d = new Date(ds + "T00:00:00");
  return `${DOW_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}
function formatLong(ds) {
  if (!ds) return "";
  const d = new Date(ds + "T00:00:00");
  return `${DOW_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Schedule({ onNext, onBack }) {
  const navigate = useNavigate();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingCounts, setBookingCounts] = useState({});
  const [takenSlots, setTakenSlots] = useState({}); // { "10:00 AM": "pending" | "confirmed" | ... }

  // Fetch real booking counts from Supabase for the visible month
  useEffect(() => {
    const firstDay = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
    const lastDay = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${new Date(calYear, calMonth + 1, 0).getDate()}`;
    // Only count confirmed/completed + pending holds still within 15-min window
    const holdCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    supabase
      .from("bookings")
      .select("booking_date")
      .gte("booking_date", firstDay)
      .lte("booking_date", lastDay)
      .neq("status", "cancelled")
      .or(`status.neq.pending,created_at.gte.${holdCutoff}`)
      .then(({ data }) => {
        if (!data) return;
        const counts = {};
        data.forEach(({ booking_date }) => {
          counts[booking_date] = (counts[booking_date] || 0) + 1;
        });
        setBookingCounts(counts);
      });
  }, [calYear, calMonth]);

  // Duration chosen in previous step (default 2 hrs) — must be before slot useEffect
  const storedDuration = parseInt(
    JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}").duration || "2",
    10
  );

  // Fetch slot-level status for the selected date (range-aware + 1hr buffer)
  useEffect(() => {
    if (!selectedDate) return;
    const holdCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    supabase
      .from("bookings")
      .select("slot_time, duration, status, created_at")
      .eq("booking_date", selectedDate)
      .neq("status", "cancelled")
      .or(`status.neq.pending,created_at.gte.${holdCutoff}`)
      .then(({ data }) => {
        if (!data) return;
        // For every possible slot on the page, check if any existing booking's
        // occupied window (start → start + duration + 1hr buffer) overlaps with
        // the new slot's window (slotStart → slotStart + customerDuration).
        const ALL_SLOTS = SLOT_GROUPS.flatMap((g) => g.slots);
        const slots = {};
        ALL_SLOTS.forEach((slotTime) => {
          const newStart = slotToHour(slotTime);
          const newEnd   = newStart + storedDuration;
          data.forEach(({ slot_time, duration: existingDur, status }) => {
            const existStart  = slotToHour(slot_time);
            const existEnd    = existStart + (existingDur || 2) + 1; // +1hr buffer
            const overlaps    = newStart < existEnd && newEnd > existStart;
            if (overlaps) {
              // Confirmed/completed beats pending in priority
              const current = slots[slotTime];
              if (!current || current === "pending") {
                slots[slotTime] = status;
              }
            }
          });
        });
        setTakenSlots(slots);
      });
  }, [selectedDate, storedDuration]);

  // 4-hour advance booking rule
  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  const earliestDecimalHour = currentDecimalHour + 4; // must book ≥4 hrs ahead
  const earliestDisplayHour = Math.ceil(earliestDecimalHour); // round up to next full hour

  // Last allowed start = 22:00 (10 PM) minus duration
  const latestStartHour = 22 - storedDuration;

  const isSlotLocked = (timeStr) => {
    const h = slotToHour(timeStr);
    if (selectedDate === todayStr && h < earliestDecimalHour) return "too-soon";
    if (h > latestStartHour) return "too-late";
    return false;
  };

  const days = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calYear, calMonth]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Pick Date & Time"
        subtitle="Select an available booking slot"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={2} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-0.5">Pick a date &amp; time</h2>
        <p className="text-slate-500 text-sm mb-4">All times are in Pakistan Standard Time (PKT)</p>

        {/* Calendar card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              onClick={prevMonth}
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="text-center">
              <div className="font-bold text-slate-900 text-base">{MONTHS[calMonth]}</div>
              <div className="text-slate-500 text-xs">{calYear}</div>
            </div>
            <button
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              onClick={nextMonth}
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DOW_SHORT.map((d) => (
              <div
                key={d}
                className={`text-center text-xs font-semibold py-1 ${
                  d === "Sun" ? "text-red-500" : "text-slate-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((d, idx) => {
              if (!d) return <div key={`e${idx}`} />;
              const dateStr = toDateStr(calYear, calMonth, d);
              const avail = getAvailability(dateStr, bookingCounts);
              const isSun = new Date(dateStr + "T00:00:00").getDay() === 0;
              const isPast = dateStr < todayStr;
              const isSelected = dateStr === selectedDate;
              const dot = !isSun && !isPast
                ? avail === "available"
                  ? "bg-teal-500"
                  : avail === "limited"
                  ? "bg-amber-400"
                  : avail === "booked"
                  ? "bg-slate-300"
                  : null
                : null;

              return (
                <button
                  key={d}
                  disabled={isPast || isSun || avail === "booked"}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedSlot(null);
                  }}
                  className={[
                    "flex flex-col items-center py-0.5 rounded-xl transition",
                    isSelected ? "bg-teal-600" : "",
                    !isSelected && !isPast && !isSun ? "hover:bg-slate-100" : "",
                    isPast || avail === "booked" ? "opacity-40 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-xl",
                      isSelected ? "text-white" : "",
                      !isSelected && isSun ? "text-red-400" : "",
                      !isSelected && !isSun && !isPast ? "text-slate-800" : "",
                      !isSelected && isPast ? "text-slate-300" : "",
                    ].join(" ")}
                  >
                    {d}
                  </span>
                  <span className="h-2 flex items-center justify-center">
                    {dot && <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                <span className="text-slate-500 text-xs">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-500 text-xs">Limited slots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-500 text-xs">Fully booked</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-red-400 font-bold text-xs border border-red-300 rounded px-1.5 py-0.5">
                OFF
              </span>
              <span className="text-slate-500 text-xs">Closed (Sunday)</span>
            </div>
          </div>
        </div>

        {/* Selected date banner */}
        {selectedDate && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
            <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="#0d9488" strokeWidth={1.8}>
              <rect x="2" y="3" width="16" height="15" rx="2" />
              <path d="M7 1v3M13 1v3M2 8h16" strokeLinecap="round" />
            </svg>
            <span className="text-teal-800 font-bold text-sm">{formatLong(selectedDate)}</span>
          </div>
        )}

        {/* Time slot selection */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="#0d9488" strokeWidth={1.8}>
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-slate-900 text-base">Select Start Time</span>
          </div>
          <p className="text-slate-400 text-xs mb-3">Slots run 10:00 AM – 10:00 PM (PKT)</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-white border-2 border-slate-200 inline-block" />
              <span className="text-slate-500 text-xs">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-50 border-2 border-amber-300 inline-block" />
              <span className="text-slate-500 text-xs">On Hold (15 min)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-100 border-2 border-slate-200 inline-block" />
              <span className="text-slate-500 text-xs">Booked</span>
            </div>
          </div>

          {/* 4-hour advance notice — shown only when today is selected */}
          {selectedDate === todayStr && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2 mb-4">
              <svg viewBox="0 0 20 20" width={16} height={16} fill="none" stroke="#d97706" strokeWidth={1.8} className="flex-shrink-0 mt-0.5">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-amber-800 text-xs leading-snug">
                Bookings require <span className="font-bold">4 hours advance notice.</span>{" "}
                Earliest available slot today:{" "}
                <span className="font-bold">
                  {earliestDisplayHour >= 22
                    ? "No slots available today — please select another date"
                    : formatHour(earliestDisplayHour)}
                </span>
              </p>
            </div>
          )}

          {SLOT_GROUPS.map((group) => (
            <div key={group.period} className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{group.emoji}</span>
                <span className="text-slate-500 text-xs font-bold tracking-widest">
                  {group.period}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.slots.map((slotTime) => {
                  const endTime = addHours(slotTime, storedDuration);
                  const locked = isSlotLocked(slotTime);
                  const takenStatus = takenSlots[slotTime]; // "pending" | "confirmed" | "completed" | undefined
                  const isPending = takenStatus === "pending";
                  const isBooked = takenStatus === "confirmed" || takenStatus === "completed";
                  const isDisabled = !!locked || isBooked;
                  const isActive = selectedSlot?.time === slotTime;
                  return (
                    <button
                      key={slotTime}
                      disabled={isDisabled}
                      onClick={() => !isPending && setSelectedSlot({ time: slotTime, endTime })}
                      className={[
                        "rounded-xl border-2 px-4 py-3 font-bold text-sm transition text-center relative min-w-[100px]",
                        isActive
                          ? "bg-teal-700 border-teal-700 text-white"
                          : isBooked
                          ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                          : isPending
                          ? "bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed"
                          : locked
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : "bg-white border-slate-200 text-slate-800 hover:border-teal-300",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-1 justify-center">
                        {(locked || isBooked) && !isPending && (
                          <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <rect x="3" y="7" width="10" height="7" rx="1.5" />
                            <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                          </svg>
                        )}
                        {slotTime}
                      </span>
                      {isActive && (
                        <div className="text-teal-200 text-xs font-normal mt-0.5">until {endTime}</div>
                      )}
                      {isPending && (
                        <div className="text-amber-600 text-xs font-semibold mt-0.5">⏳ On Hold</div>
                      )}
                      {isBooked && (
                        <div className="text-slate-400 text-xs font-normal mt-0.5">Booked</div>
                      )}
                      {locked === "too-late" && !isBooked && !isPending && (
                        <div className="text-slate-300 text-xs font-normal mt-0.5">ends after 10 PM</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 text-sm">
            {selectedDate ? formatShort(selectedDate) : "Select a date"}
          </span>
          {selectedSlot && (
            <span className="font-extrabold text-slate-900 text-base">
              {selectedSlot.time} → {selectedSlot.endTime}
            </span>
          )}
        </div>
        <button
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
            localStorage.setItem("mayaCabsBooking", JSON.stringify({ ...existing, date: selectedDate, slotTime: selectedSlot.time, slotEnd: selectedSlot.endTime }));
            if (onNext) onNext(selectedDate, selectedSlot); else navigate("/booking/details");
          }}
        >
          Confirm Date &amp; Time →
        </button>
      </div>
    </div>
  );
}
