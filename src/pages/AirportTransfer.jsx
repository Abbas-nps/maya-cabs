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
            Travelling by air as a wheelchair user presents unique challenges at every step —
            from leaving home to reaching the check-in counter. Maya Cabs provides dedicated
            wheelchair accessible airport transfers to and from Allama Iqbal International Airport
            in Lahore, ensuring the ground journey is smooth, safe, and dignified.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Departures — Getting to the Airport</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For outbound travel, we recommend booking a 3- or 4-hour slot depending on your
            flight departure time and home location. The driver picks you up at your scheduled
            time, loads your wheelchair and luggage with the hydraulic ramp, and drives directly
            to the terminal building at Allama Iqbal International Airport.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            The driver navigates directly to the departure hall drop-off zone. He assists you
            off the ramp and accompanies you to the check-in area entrance if needed. Most
            international and domestic terminals have airport wheelchair assistance services
            from check-in onwards — Maya Cabs covers the door-to-terminal portion that standard
            airline services do not provide.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            We recommend requesting airport wheelchair assistance directly from your airline at
            least 48 hours before travel. Maya Cabs handles the home-to-airport portion. The
            airline's ground handling team takes over from the airport entrance.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Arrivals — Picking Up from the Airport</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For airport pickup after a flight, provide us with your flight number and expected
            arrival time when booking. We monitor flight arrival status and adjust pickup timing
            accordingly. The driver will be waiting in the arrivals area with sufficient time for
            you to clear immigration, collect luggage, and exit the terminal.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            For international arrivals, please allow 45–90 minutes from landing to exit,
            depending on immigration queues. The driver will wait for up to 2 hours within the
            booking window. If your flight is significantly delayed, please contact us via
            WhatsApp so we can reschedule without penalty.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Luggage and Equipment</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The van's boot area accommodates standard travel luggage — up to 3 large suitcases —
            alongside the wheelchair. If travelling with a powered wheelchair, the battery may
            need to be detached for the vehicle journey depending on size. For travel with a
            powered chair, please contact us in advance at +92 339 6292222 so we can confirm
            compatibility and prepare accordingly.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            If travelling with medical equipment such as a portable oxygen concentrator or a
            CPAP machine, inform us when booking so the driver is prepared. Maya Cabs does not
            operate medical support equipment — the passenger or their carer is responsible for
            all medical devices during the journey.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Booking Your Airport Transfer</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            All airport transfers are booked online. Select a 3-hour (domestic) or 4-hour
            (international) slot. Enter your home address as pickup and "Allama Iqbal Airport
            Lahore" as the destination. For arrivals, enter the airport as pickup and your home
            as destination. Include your flight number in the notes field via WhatsApp during
            confirmation.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            We strongly recommend booking airport transfers at least 24 hours in advance to
            guarantee slot availability, especially for early morning or late evening flights.
            Same-day airport bookings are subject to 4-hour advance notice and slot availability.
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
