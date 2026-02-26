import React from "react";

export default function RouteCheckGreenLight({ booking, next, back }) {
  // Simple feasibility check for now
  const feasible = booking.pickup && booking.dropoff;

  return (
    <div className="container">
      <h2>Feasibility Check</h2>
      {feasible ? (
        <>
          <div style={{ color: "green", fontWeight: 900 }}>Good news, your route is serviceable!</div>
          <button onClick={next}>Continue</button>
        </>
      ) : (
        <>
          <div style={{ color: "red", fontWeight: 900 }}>Please enter pickup and drop-off locations.</div>
          <button onClick={back}>Back</button>
        </>
      )}
    </div>
  );
}
