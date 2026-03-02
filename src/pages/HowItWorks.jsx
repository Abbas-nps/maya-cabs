import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <>
      <Helmet>
        <title>How Maya Cabs Works | Booking Wheelchair Transport in Lahore</title>
        <meta
          name="description"
          content="Learn how to book a wheelchair accessible ride with Maya Cabs. Simple 4-step online booking, WhatsApp confirmation, prepaid payment and door-to-door service in Lahore."
        />
        <link rel="canonical" href="https://mayacabs.pk/how-it-works" />
        <meta property="og:title" content="How Maya Cabs Works | Booking Wheelchair Transport in Lahore" />
        <meta property="og:url" content="https://mayacabs.pk/how-it-works" />
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
            How to Book Wheelchair Transport with Maya Cabs
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Maya Cabs makes booking wheelchair accessible transport in Lahore as simple as possible.
            Our online booking system is designed to be used by family members or caregivers on
            behalf of the passenger. The entire process takes about 3 minutes and is confirmed via
            WhatsApp before any payment is made.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">The 4-Step Booking Process</h2>

          <div className="space-y-5 mb-10">
            {[
              {
                step: "1",
                title: "Choose Your Duration",
                body: `Start by selecting how long you will need the van. Maya Cabs offers three slot durations:
2 hours, 3 hours, and 4 hours. The duration includes your travel time to the destination,
waiting time at the facility, and return journey to your home. For a simple one-way hospital
drop and return, 2 hours is usually sufficient for nearby hospitals. For specialist appointments,
diagnostic procedures, or therapy sessions that may run long, choose 3 or 4 hours. Once your
slot duration begins, the van is yours until the slot ends — the driver will not leave during
your appointment.`,
              },
              {
                step: "2",
                title: "Select Your Date and Time Slot",
                body: `Our calendar shows real-time slot availability. Green slots are available to book.
Orange slots are already booked by another passenger. Amber slots are temporarily on hold for
someone completing a booking at that moment. Select any available date and time that works for
your appointment. We operate Monday through Saturday, 10:00 AM to 10:00 PM. We require at least
4 hours advance notice before any booking. This ensures the driver can plan the route and the van
is properly prepared. We recommend booking the night before or as early as possible on the day
of your appointment.`,
              },
              {
                step: "3",
                title: "Enter Your Details",
                body: `Tell us about your wheelchair and journey. You will enter: the type of wheelchair
(standard or wide/powered), the pickup address (your home or facility), the drop-off destination,
whether this is a one-way or wait-and-return trip, and the passenger name and contact number.
This information is essential for the driver to plan boarding, allocate correct equipment,
and navigate correctly. All information is kept private and is only used for your booking.`,
              },
              {
                step: "4",
                title: "Confirm via WhatsApp",
                body: `After reviewing your booking summary, you are taken to a payment screen. Click
"Confirm via WhatsApp" to send your booking details directly to our operations team on WhatsApp
at +92 339 6292222. Payment is prepaid and confirmed by our team within minutes. You will receive
a WhatsApp confirmation message with the driver's name and vehicle details. On the day of your
ride, the driver calls 30 minutes before arrival so you can prepare.`,
              },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">{s.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">On the Day of Your Ride</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Thirty minutes before the start of your booked slot, the driver will call the passenger's
            contact number to confirm he is on the way. He will arrive at the pickup address with
            the van already positioned for boarding — rear door open, hydraulic ramp deployed, and
            interior prepared with the wheelchair anchor straps ready.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            The driver will greet the passenger and caregiver, confirm the destination, and assist
            the wheelchair up the ramp. The wheelchair is positioned in the designated secured area
            of the van and locked to four anchor points on the floor. The passenger is offered a
            lap belt and shoulder strap for the journey. The driver will not move the vehicle until
            the wheelchair is fully secured.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            On arrival at the destination, the driver performs the same process in reverse — ramp
            deployment, wheelchair release, and assisted exit. If the trip is wait-and-return, the
            driver parks nearby and waits for the duration of the booked slot. He checks in via
            WhatsApp at the driver is available to return whenever you are ready within your slot.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Equipment and Safety</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Safety is the foundation of every Maya Cabs journey. The van is inspected daily before
            service begins. The hydraulic ramp is tested at the start of each shift. All anchor
            straps are rated to international wheelchair transport standards. The driver carries a
            first-aid kit and has basic training in medical emergency response — though Maya Cabs
            is not a medical emergency service.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            If you travel with a powered wheelchair or heavy motorised scooter, please mention this
            when booking so the driver can confirm the weight and size is compatible with the van's
            specifications. Standard powered chairs and wide manual chairs are accommodated. Very
            large motorised scooters may require advance arrangement.
          </p>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book a Ride Now →
          </Link>
        </main>
      </div>
    </>
  );
}
