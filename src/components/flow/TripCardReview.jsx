import React from "react";

export default function TripCardReview({ booking, next, back }) {
  return (
    <div className="container">
      <h2>Trip Summary</h2>
      <div>
        <b>Purpose:</b> {booking.purpose}<br />
        <b>Wheelchair:</b> {booking.wheelchairType}<br />
        <b>Pickup:</b> {booking.pickup}<br />
        <b>Drop-off:</b> {booking.dropoff}<br />
        <b>Slot:</b> {booking.selectedSlot?.label}<br />
        <b>Estimated Cost:</b> PKR {booking.estimatedCost}<br />
      </div>
      <button onClick={back}>Back</button>
      <button onClick={next}>Confirm & Continue</button>
    </div>
  );
}
