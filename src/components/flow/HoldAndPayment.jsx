import React from "react";

export default function HoldAndPayment({ booking, next, back }) {
  return (
    <div className="container">
      <h2>Payment & Hold</h2>
      <div>
        <b>Hold ID:</b> {booking.holdId}<br />
        <b>Expires At:</b> {booking.holdExpiresAt}<br />
        <b>WhatsApp:</b> <a href={booking.whatsappLink} target="_blank" rel="noopener noreferrer">Share Request</a><br />
      </div>
      <button onClick={back}>Back</button>
      <button onClick={next}>I have paid</button>
    </div>
  );
}
