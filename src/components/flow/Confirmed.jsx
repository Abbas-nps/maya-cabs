import React from "react";

export default function Confirmed({ booking }) {
  return (
    <div className="container">
      <h2>Booking Confirmed!</h2>
      <div>
        <b>Purpose:</b> {booking.purpose}<br />
        <b>Wheelchair:</b> {booking.wheelchairType}<br />
        <b>Pickup:</b> {booking.pickup}<br />
        <b>Drop-off:</b> {booking.dropoff}<br />
        <b>Slot:</b> {booking.selectedSlot?.label}<br />
        <b>Estimated Cost:</b> PKR {booking.estimatedCost}<br />
      </div>
      <div style={{ marginTop: 20 }}>
        <b>Need help?</b> <a href="https://wa.me/03396292222" target="_blank" rel="noopener noreferrer">WhatsApp Support</a>
      </div>
    </div>
  );
}
