import { useState, useEffect } from "react";
import WheelchairCompatibility from "../components/flow/WheelchairCompatibility";
import PickupDestination from "../components/flow/PickupDestination";
import Step4Slots from "../components/flow/Step4Slots";

export default function BookingFlow() {
  const [step, setStep] = useState(1);

  const [booking, setBooking] = useState({
    city: "Lahore",
    purpose: "",
    wheelchairType: "",
    pickup: "",
    destination: "",
    needWait: false,
    needReturn: false,
    selectedSlot: null,
    date: "", // Add date field
    duration: 2, // Default duration in hours (can be set in previous step)
  });

  // Ensure booking.date is set (default to today)
  useEffect(() => {
    if (!booking.date) {
      const todayPK = new Date().toISOString().slice(0, 10);
      setBooking(prev => ({ ...prev, date: todayPK }));
    }
  }, [booking.date]);

  const choosePurpose = (purpose) => {
    setBooking((prev) => ({ ...prev, purpose }));
    setStep(2);
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      {/* DEBUG HEADER */}
      <div style={{ marginBottom: 12, opacity: 0.6 }}>
        Step: {step} | Purpose: {booking.purpose || "—"} | Chair:{" "}
        {booking.wheelchairType || "—"}
      </div>

      {/* SCREEN 1 */}
      {step === 1 && (
        <>
          <h1>Maya Cabs</h1>
          <h3>Wheelchair Accessible Transport</h3>
          <p>Where do you need to go?</p>

          <div style={{ display: "grid", gap: 10, maxWidth: 300 }}>
            <button onClick={() => choosePurpose("Hospital")}>
              🏥 Hospital / Therapy
            </button>
            <button onClick={() => choosePurpose("School")}>🎓 School / Work</button>
            <button onClick={() => choosePurpose("Airport")}>
              ✈️ Airport / Railway
            </button>
            <button onClick={() => choosePurpose("Family")}>👨‍👩‍👧 Family Visit</button>
            <button onClick={() => choosePurpose("Event")}>🎉 Event / Wedding</button>
            <button onClick={() => choosePurpose("Other")}>❓ Something else</button>
          </div>

          <small style={{ marginTop: 20, display: "block" }}>
            Door-to-door assistance. No lifting required.
          </small>
        </>
      )}

      {/* SCREEN 2 */}
      {step === 2 && (
        <WheelchairCompatibility
          booking={booking}
          setBooking={setBooking}
          next={() => setStep(3)}
          back={() => setStep(1)}
        />
      )}

      {/* SCREEN 3 */}
      {step === 3 && (
        <PickupDestination
          booking={booking}
          setBooking={setBooking}
          next={() => setStep(4)}
          back={() => setStep(2)}
        />
      )}

      {/* SCREEN 4: Slots */}
      {step === 4 && (
        <Step4Slots
          booking={booking}
          setBooking={setBooking}
          selectedDate={booking.date}
          routeServiceable={true} // For now, always true
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}
    </div>
  );
}