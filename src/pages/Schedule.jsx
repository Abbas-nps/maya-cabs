import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";

const getAvailability = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00").getDay();
  if (d === 0) return "closed";
  const day = new Date(dateStr + "T00:00:00").getDate();
  if (day % 7 === 5) return "limited";
  if (day % 11 === 0) return "booked";
  return "available";
};

const SLOT_GROUPS = [
  {
    period: "MORNING",
    emoji: "☀️",
    slots: [
      { time: "7:00 AM", endTime: "9:00 AM" },
      { time: "9:00 AM", endTime: "11:00 AM" },
      { time: "11:00 AM", endTime: "1:00 PM" },
    ],
  },
  {
    period: "AFTERNOON",
    emoji: "☀️",
    slots: [
      { time: "1:00 PM", endTime: "3:00 PM" },
      { time: "3:00 PM", endTime: "5:00 PM" },
    ],
  },
  {
    period: "EVENING",
    emoji: "🌅",
    slots: [{ time: "5:00 PM", endTime: "7:00 PM" }],
  },
];

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
              const avail = getAvailability(dateStr);
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
          <p className="text-slate-400 text-xs mb-4">Booked slots are grayed out</p>

          {SLOT_GROUPS.map((group) => (
            <div key={group.period} className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{group.emoji}</span>
                <span className="text-slate-500 text-xs font-bold tracking-widest">
                  {group.period}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.slots.map((slot) => {
                  const isActive = selectedSlot?.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        "rounded-xl border-2 px-4 py-3 font-bold text-sm transition text-center",
                        isActive
                          ? "bg-teal-700 border-teal-700 text-white"
                          : "bg-white border-slate-200 text-slate-800 hover:border-teal-300",
                      ].join(" ")}
                    >
                      {slot.time}
                      {isActive && (
                        <div className="text-teal-200 text-xs font-normal mt-0.5">
                          until {slot.endTime}
                        </div>
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
            if (onNext) onNext(selectedDate, selectedSlot);
            else navigate("/booking/details");
          }}
        >
          Confirm Date &amp; Time →
        </button>
      </div>
    </div>
  );
}
