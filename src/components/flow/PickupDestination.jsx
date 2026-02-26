export default function PickupDestination({ booking, setBooking, next, back }) {
  const canContinue =
    (booking.city || "").trim().length > 0 &&
    booking.pickup.trim().length > 0 &&
    booking.destination.trim().length > 0;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>Pickup & Destination</h2>

      <div style={{ display: "grid", gap: 12, maxWidth: 520, marginTop: 16 }}>
        {/* CITY (required) */}
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            City (service area)
          </label>

          <select
            style={{ width: "100%", padding: 12, fontSize: 16 }}
            value={booking.city || "Lahore"}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, city: e.target.value }))
            }
          >
            <option value="Lahore">Lahore</option>
            {/* Future expansion:
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            */}
          </select>

          <small style={{ display: "block", marginTop: 6, opacity: 0.7 }}>
            Maya Cabs currently operates in Lahore only.
          </small>
        </div>

        {/* PICKUP */}
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Pickup area / landmark (within {booking.city || "city"})
          </label>
          <input
            style={{ width: "100%", padding: 12, fontSize: 16 }}
            placeholder="e.g., DHA Phase 6, Near X"
            value={booking.pickup}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, pickup: e.target.value }))
            }
          />
        </div>

        {/* DESTINATION */}
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Destination (within {booking.city || "city"})
          </label>
          <input
            style={{ width: "100%", padding: 12, fontSize: 16 }}
            placeholder="e.g., Doctors Hospital Lahore"
            value={booking.destination}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, destination: e.target.value }))
            }
          />
        </div>

        {/* TOGGLES */}
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={booking.needWait}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, needWait: e.target.checked }))
            }
          />
          I need the vehicle to wait during appointment
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={booking.needReturn}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, needReturn: e.target.checked }))
            }
          />
          I also need a return trip home
        </label>

        {/* ACTIONS */}
        <div style={{ marginTop: 10 }}>
          <button onClick={back} style={{ marginRight: 10 }}>
            Back
          </button>

          <button disabled={!canContinue} onClick={next}>
            Check Route Availability
          </button>
        </div>
      </div>
    </div>
  );
}