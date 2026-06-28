import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { normalizeDuration } from "../lib/pricing";

const DAYS_TO_SHOW = 14;
const CITIES = ["Lahore", "Karachi"];
const MIN_SLOT_GAP_HOURS = 2;

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildDaysList() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < DAYS_TO_SHOW; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(toDateStr(d));
  }
  return days;
}

function formatDate(ds) {
  const d = new Date(`${ds}T00:00:00`);
  return d.toLocaleDateString("en-PK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isBlockingStatus(status) {
  return status === "pending" || status === "confirmed" || status === "completed";
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
    slots.push({
      startHour,
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

function isSlotTimeEligible(dateStr, slot) {
  const now = new Date();
  const slotStart = new Date(`${dateStr}T${String(slot.startHour).padStart(2, "0")}:00:00`);
  const isSunday = slotStart.getDay() === 0;
  const leadMs = isSunday ? 12 * 60 * 60 * 1000 : 0;
  return now.getTime() + leadMs < slotStart.getTime();
}

function statusForSlot(dateRecords, selectedDuration, slot, dateStr) {
  const bookings = (dateRecords || []).filter((record) => isBlockingStatus(record.status));
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

function isDateOpen(dateStr, recordsForDate, blockedSet) {
  if (blockedSet.has(dateStr)) return false;

  const sixHourStatuses = buildSlotsForDuration(6).map((slot) =>
    statusForSlot(recordsForDate, 6, slot, dateStr)
  );
  const twelveHourStatuses = buildSlotsForDuration(12).map((slot) =>
    statusForSlot(recordsForDate, 12, slot, dateStr)
  );

  return [...sixHourStatuses, ...twelveHourStatuses].some((status) => status === "AVAILABLE");
}

export default function Calendar() {
  const [city, setCity] = useState("Lahore");
  const [bookingsByDate, setBookingsByDate] = useState({});
  const [blockedSet, setBlockedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => buildDaysList(), []);

  useEffect(() => {
    let alive = true;

    const fetchAvailability = async () => {
      setLoading(true);
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      const holdCutoff = new Date(Date.now() - 120 * 60 * 1000).toISOString();

      const [bookingsResp, blockedResp] = await Promise.all([
        supabase
          .from("bookings")
          .select("booking_date, slot_time, slot_end, duration, status, created_at, city")
          .eq("city", city)
          .gte("booking_date", firstDay)
          .lte("booking_date", lastDay)
          .neq("status", "cancelled")
          .or(`status.neq.pending,created_at.gte.${holdCutoff}`),
        supabase
          .from("blocked_dates")
          .select("date")
          .gte("date", firstDay)
          .lte("date", lastDay),
      ]);

      if (!alive) return;

      const grouped = {};
      (bookingsResp.data || []).forEach((row) => {
        if (!grouped[row.booking_date]) grouped[row.booking_date] = [];
        grouped[row.booking_date].push(row);
      });
      setBookingsByDate(grouped);

      const blockedDates = new Set((blockedResp.data || []).map((row) => row.date));
      setBlockedSet(blockedDates);
      setLoading(false);
    };

    fetchAvailability();
    return () => {
      alive = false;
    };
  }, [city, days]);

  const summary = useMemo(() => {
    const openCount = days.filter((ds) => isDateOpen(ds, bookingsByDate[ds], blockedSet)).length;
    return {
      openCount,
      closedCount: days.length - openCount,
    };
  }, [days, bookingsByDate, blockedSet]);

  return (
    <>
      <Helmet>
        <title>Calendar Availability | Maya Cabs</title>
        <meta
          name="description"
          content="Public calendar availability for Maya Cabs bookings in Lahore and Karachi."
        />
        <link rel="canonical" href="https://mayacabs.pk/calender" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <header className="bg-teal-700 text-white px-5 py-4 sticky top-0 z-30">
          <Link to="/home" className="font-bold text-lg">Maya Cabs</Link>
          <div className="text-teal-100 text-sm">Public Calendar Availability</div>
        </header>

        <main className="max-w-3xl mx-auto px-5 py-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Open and Closed Dates</h1>
          <p className="text-slate-600 text-sm mb-6">
            Choose a city to view the next 14 days availability.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
            <div className="text-xs font-semibold text-slate-500 mb-2">City Availability</div>
            <div className="flex gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold border ${
                    city === c
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-600">
              Open: <span className="font-bold text-emerald-700">{summary.openCount}</span> · Closed: <span className="font-bold text-rose-700">{summary.closedCount}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {days.map((ds) => {
              const open = isDateOpen(ds, bookingsByDate[ds], blockedSet);
              return (
                <div
                  key={ds}
                  className={`rounded-xl border p-3 ${open ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
                >
                  <div className="text-sm font-bold text-slate-900">{formatDate(ds)}</div>
                  <div className={`text-xs font-semibold mt-1 ${open ? "text-emerald-700" : "text-rose-700"}`}>
                    {loading ? "Checking..." : open ? "Open" : "Closed"}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
