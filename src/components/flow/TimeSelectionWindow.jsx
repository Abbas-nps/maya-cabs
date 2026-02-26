import React from "react";

// Receives: booking, setBooking, next, back
// booking.selectedSlot, booking.timeWindow, etc.
// You must pass ALL_SLOTS, statusOf, etc. from App.jsx

export default function TimeSelectionWindow({ booking, setBooking, next, back, ALL_SLOTS, statusOf, isMobile, MOBILE_SLOT_COLUMNS }) {
  const slotGridCols = isMobile
    ? MOBILE_SLOT_COLUMNS === 2
      ? "repeat(2, minmax(0, 1fr))"
      : "1fr"
    : "repeat(3, minmax(0, 1fr))";
  const slotGrid = { display: "grid", gridTemplateColumns: slotGridCols, gap: 12 };

  function badgeStyle(status) {
    const common = {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      lineHeight: "12px",
      whiteSpace: "nowrap",
    };
    if (status === "AVAILABLE") return { ...common, background: "#e5e7eb", color: "#111827" };
    if (status === "HELD") return { ...common, background: "#3b82f6", color: "white" };
    if (status === "BOOKED") return { ...common, background: "#ef4444", color: "white" };
    if (status === "BLOCKED") return { ...common, background: "#111827", color: "white" };
    return { ...common, background: "#e5e7eb", color: "#111827" };
  }

  function slotButtonStyle(status) {
    const base = {
      width: "100%",
      textAlign: "left",
      padding: 14,
      borderRadius: 16,
      border: "1px solid rgba(0,0,0,0.12)",
      background: "white",
      cursor: status === "AVAILABLE" ? "pointer" : "not-allowed",
      opacity: status === "AVAILABLE" ? 1 : 0.6,
    };
    if (status === "BOOKED") return { ...base, borderColor: "rgba(239,68,68,0.6)" };
    if (status === "HELD") return { ...base, borderColor: "rgba(59,130,246,0.6)" };
    if (status === "BLOCKED") return { ...base, borderColor: "rgba(17,24,39,0.6)" };
    return base;
  }

  function handleSelectSlot(slot) {
    setBooking({ ...booking, selectedSlot: slot });
    next();
  }

  return (
    <div>
      <div style={{ fontWeight: 1000, fontSize: 18, marginBottom: 8 }}>Select a time slot</div>
      <div style={slotGrid}>
        {ALL_SLOTS.map((slot) => {
          const status = statusOf(slot.id);
          return (
            <button
              key={slot.id}
              style={slotButtonStyle(status)}
              disabled={status !== "AVAILABLE"}
              onClick={() => status === "AVAILABLE" && handleSelectSlot(slot)}
            >
              <div style={{ fontWeight: 900 }}>{slot.label}</div>
              <div style={{ marginTop: 4 }}>
                <span style={badgeStyle(status)}>{status}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button onClick={back} style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid #ccc" }}>Back</button>
      </div>
    </div>
  );
}
