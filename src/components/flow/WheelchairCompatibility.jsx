import { useState } from "react";

export default function WheelchairCompatibility({ booking, setBooking, next, back }) {

  const [type, setType] = useState(booking.wheelchairType || "");

  const continueFlow = () => {
    setBooking(prev => ({
      ...prev,
      wheelchairType: type
    }));
    next();
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>Tell us about the wheelchair</h2>
      <p>This helps us ensure safe loading and securement.</p>

      <div style={{ display: "grid", gap: 10, maxWidth: 300, marginTop: 20 }}>

        <label>
          <input
            type="radio"
            name="wheelchair"
            onChange={() => setType("Manual")}
          />
          Manual wheelchair
        </label>

        <label>
          <input
            type="radio"
            name="wheelchair"
            onChange={() => setType("Electric")}
          />
          Electric wheelchair
        </label>

        <label>
          <input
            type="radio"
            name="wheelchair"
            onChange={() => setType("Recliner")}
          />
          Recliner / High-back
        </label>

        <label>
          <input
            type="radio"
            name="wheelchair"
            onChange={() => setType("Not sure")}
          />
          I’m not sure
        </label>

      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={back} style={{ marginRight: 10 }}>
          Back
        </button>

        <button
          disabled={!type}
          onClick={continueFlow}
        >
          Continue
        </button>
      </div>

      <small style={{ display: "block", marginTop: 20 }}>
        We verify fitment before confirming — this prevents unsafe travel.
      </small>
    </div>
  );
}