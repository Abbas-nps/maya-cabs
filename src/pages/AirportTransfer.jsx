import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function AirportTransfer() {
  return (
    <>
      <Helmet>
        <title>Wheelchair Accessible Airport Transfer Lahore | Maya Cabs</title>
        <meta
          name="description"
          content="Wheelchair accessible airport transfer to and from Allama Iqbal International Airport, Lahore. Hydraulic ramp van, luggage assistance, flight tracking. Book online at Maya Cabs."
        />
        <link rel="canonical" href="https://mayacabs.pk/airport-transfer" />
        <meta property="og:title" content="Wheelchair Airport Transfer Lahore | Maya Cabs" />
        <meta property="og:url" content="https://mayacabs.pk/airport-transfer" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <header className="bg-teal-700 text-white px-5 py-4 sticky top-0 z-30">
          <Link to="/home" className="flex items-center gap-3">
            <div className="font-bold text-lg">Maya Cabs</div>
            <span className="text-teal-200 text-sm">Wheelchair Accessible Transport</span>
          </Link>
        </header>

        <main className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Wheelchair Accessible Airport Transfer in Lahore
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            Travelling by air as a wheelchair user presents unique challenges at every step — from leaving home to reaching the check-in counter. Maya Cabs provides wheelchair-accessible airport transfers to and from Allama Iqbal International Airport, ensuring the ground journey between home and the terminal is safe and predictable.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Departures — Getting to the Airport</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For outbound travel, we recommend booking sufficient hours based on your flight timing and distance from the airport. The driver arrives at the scheduled time, operates the ramp and securement system, and transports you directly to the airport terminal drop-off area.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Driver assistance is limited to helping the wheelchair user safely enter and exit the van. Assistance beyond the vehicle — including movement through the airport building, check-in counters, or security areas — must be arranged directly with the airline or airport assistance services. We strongly recommend requesting airport wheelchair assistance from your airline in advance.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            At the time of booking, we can provide the vehicle registration details so that airport assistance staff or family members can coordinate pickup and drop-off.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Arrivals — Pickup from the Airport</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For airport pickups, the booking must include the flight number and approximate arrival time. Maya Cabs does not monitor flight status, immigration processing, or baggage claim times.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Waiting time is included within the booked time slot. The van will wait during the scheduled booking window only. If the arrival process takes longer than the booked hours, a new booking will be required and the vehicle may need to depart to honour other scheduled rides. We therefore advise booking ample hours to account for immigration, baggage collection, and airport procedures.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            For international travellers, please follow airport security procedures and coordinate with airport assistance services before exiting the terminal.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Luggage and Equipment</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The vehicle is configured primarily for a wheelchair user seated in their wheelchair. When the wheelchair position is occupied, remaining space for luggage is limited. Passengers should plan luggage arrangements accordingly and may consider a separate vehicle for additional baggage if required.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            If travelling with equipment such as portable oxygen concentrators or CPAP devices, these remain the responsibility of the passenger or accompanying person. Maya Cabs does not operate or supervise medical equipment during transit.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Booking Your Airport Transfer</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Airport transfers are booked online. Select the appropriate number of hours based on your travel needs. Enter your home address and "Allama Iqbal Airport Lahore" as the destination (or vice versa for arrivals), and provide your flight details during confirmation via WhatsApp.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            We recommend booking at least 24 hours in advance, especially for early morning or late-night flights. Same-day bookings depend on availability and sufficient advance notice.
          </p>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book Airport Transfer →
          </Link>
        </main>
      </div>
    </>
  );
}
