import React from "react";

export default function LandingPurpose({ booking, setBooking, next }) {
  const select = (purpose) => {
    setBooking({ ...booking, purpose });
    next();
  };

  return (
    <div className="container">
      <h1>Maya Cabs</h1>
      <h3>Wheelchair Accessible Transport</h3>
      <p>Where do you need to go?</p>
      <div className="grid">
        <button onClick={() => select("Hospital")}>🏥 Hospital / Therapy</button>
        <button onClick={() => select("School")}>🎓 School / Work</button>
        <button onClick={() => select("Airport")}>✈️ Airport / Railway</button>
        <button onClick={() => select("Family")}>👨‍👩‍👧 Family Visit</button>
        <button onClick={() => select("Event")}>🎉 Event / Wedding</button>
        <button onClick={() => select("Other")}>❓ Something else</button>
      </div>
      <small>Door-to-door assistance. No lifting required.</small>
    </div>
  );
}
