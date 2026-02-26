import React, { useEffect, useMemo, useState } from "react";
import { fetchBusyIntervals } from "../../lib/fetchBusyIntervals";

/** Format Date -> "YYYY-MM-DD" (local) */
function toYYYYMMDD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Build 60-min slots from 08:00 to 20:00 (last start 19:00) */
function buildSlotsForDay(dateObj) {
  const slots = [];
  for (let hour = 8; hour <= 19; hour++) {
    const start = new Date(dateObj);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(dateObj);
    end.setHours(hour + 1, 0, 0, 0);

    slots.push({
      start,
      end,
      label: `${hour}:00 - ${hour + 1}:00`,
    });
  }
  return slots;
}

/** Filter slots based on busy intervals + rules */
function filterSlots(slots, busyIntervals, now) {
  return slots.filter((slot) => {
    // Same-day: must be at least 3 hours in advance
    if (
      slot.start.toDateString() === now.toDateString() &&
      slot.start.getTime() - now.getTime() < 3 * 60 * 60 * 1000
    ) {
      return false;
    }

    // Overlap + 1-hour buffer AFTER busy interval
    for (const busy of busyIntervals) {
      const busyStart = new Date(busy.start);
      const busyEndBuffered = new Date(busy.end);
      busyEndBuffered.setHours(busyEndBuffered.getHours() + 1);

      if (busyStart < slot.end && busyEndBuffered > slot.start) return false;
    }

    return true;
  });
}

export default function Step4Slots({
  booking,
  setBooking,
  selectedDate,
  routeServiceable,
  onBack,
  onNext,
}) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let alive = true;

    async function loadSlotsForDate(dateStr) {
      const dateObj = new Date(dateStr);
      dateObj.setHours(0, 0, 0, 0);

      const busyIntervals = await fetchBusyIntervals(dateStr);
      const slots = buildSlotsForDay(dateObj);
      return filterSlots(slots, busyIntervals, new Date());
    }

    async function run() {
      setLoading(true);
      setNextAvailableDate(null);

      try {
        // 1) Try selectedDate first
        const slotsToday = await loadSlotsForDate(selectedDate);

        if (!alive) return;
        setAvailableSlots(slotsToday);

        // 2) If none, find next available within next 3 days
        if (slotsToday.length === 0) {
          const base = new Date(selectedDate);
          base.setHours(0, 0, 0, 0);

          let found = null;
          for (let i = 1; i <= 3; i++) {
            const d = new Date(base);
            d.setDate(d.getDate() + i);
            const ds = toYYYYMMDD(d);

            const slots = await loadSlotsForDate(ds);
            if (slots.length > 0) {
              found = ds;
              break;
            }
          }

          if (!alive) return;
          setNextAvailableDate(found);
        }
      } catch (e) {
        if (!alive) return;
        setAvailableSlots([]);
        setNextAvailableDate(null);
        console.error("Step4Slots load error:", e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [selectedDate]);

  if (!routeServiceable) {
    return (
      <div>
        <h2>Select a Time Slot</h2>
        <p>Route not serviceable for the selected pickup/dropoff.</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Select a Time Slot</h2>

      {loading ? (
        <div>Loading slots...</div>
      ) : availableSlots.length === 0 ? (
        <div>
          <p>No slots available for {selectedDate}.</p>

          {nextAvailableDate ? (
            <button
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "1px solid #ccc",
                fontWeight: 900,
              }}
              onClick={() =>
                setBooking((prev) => ({ ...prev, date: nextAvailableDate }))
              }
            >
              View slots for {nextAvailableDate}
            </button>
          ) : (
            <p>No slots available for the next 3 days.</p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {availableSlots.map((slot, idx) => (
            <button
              key={idx}
              onClick={() => {
                setBooking({
                  ...booking,
                  start_time: slot.start.toISOString(),
                  end_time: slot.end.toISOString(),
                });
                onNext();
              }}
              style={{
                padding: "12px 24px",
                borderRadius: "6px",
                border: "1px solid #333",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}