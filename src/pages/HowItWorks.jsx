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
            Maya Cabs is designed to make wheelchair-accessible transport in Lahore straightforward and reliable. Bookings can be completed online by a family member or caregiver on behalf of the wheelchair user. The process takes only a few minutes and is confirmed via WhatsApp before payment.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">The 4-Step Booking Process</h2>

          <div className="space-y-5 mb-10">
            {[
              {
                step: "1",
                title: "Choose Your Duration",
                body: `Select the duration type you need. Maya Cabs offers 6-hour and 12-hour slots only.

Pricing is fixed: 6-hour slot = PKR 15,000 and 12-hour slot = PKR 30,000.

Slots are exact-duration windows and cannot be extended once started.`,
              },
              {
                step: "2",
                title: "Select Your Date and Time Slot",
                body: `Our calendar displays live availability:

• Light grey — available
• Red — booked
• Blue (HELD) — temporarily reserved while another customer completes booking
• Black — unavailable

Choose the date and your preferred start time on a 24-hour clock. You can start at any hour as long as your selected 6-hour or 12-hour window is available.`,
              },
              {
                step: "3",
                title: "Enter Your Details",
                body: `Provide the required journey and wheelchair information:

• Wheelchair type
• Pickup address
• Destination
• One-way or wait-and-return
• Estimated round-trip distance (km)
• Passenger name and contact number

City-only distance caps apply:
• 6-hour slot: up to 120 km total
• 12-hour slot: up to 160 km total

If your trip exceeds this limit, please contact Maya Cabs for a custom quote.`,
              },
              {
                step: "4",
                title: "Confirm via WhatsApp",
                body: `After reviewing your booking summary, select "Confirm via WhatsApp." Your request is sent directly to our operations team at +92 339 6292222. Payment is prepaid and confirmed via WhatsApp.

You will receive confirmation along with the driver and vehicle details. On the day of your ride, the driver will call approximately 30 minutes before arrival.`,
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
            The driver arrives with the rear ramp prepared for boarding. The wheelchair user is assisted into the van using the ramp and electronic winch.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Once inside, the wheelchair is secured using a four-point tie-down system. A standard vehicle safety seat belt is used while the passenger remains seated in their wheelchair. The vehicle does not move until the wheelchair is fully secured.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            At the destination, the process is reversed — ramp deployment, securement release, and assisted exit. For wait-and-return bookings, the driver remains available within the booked time slot.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Driver assistance is limited to safe entry into and exit from the vehicle. Movement within buildings or facilities must be managed by family members or staff.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Equipment and Safety</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The vehicle and securement equipment are checked regularly before service. Drivers are trained in safe ramp operation, electronic winch use, and proper wheelchair tie-down procedures.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Maya Cabs is <strong>not a medical transport service</strong>. Drivers are not paramedics and do not provide medical monitoring or first aid during transit.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Wheelchair Size and Compatibility</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Maya Cabs accommodates wheelchairs <strong>up to 29 inches in width</strong>. This includes standard manual wheelchairs and compatible powered wheelchairs within that size range.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            We <strong>do not accommodate mobility scooters of any kind</strong>.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            If you are unsure about your wheelchair's dimensions, please confirm the width before booking to ensure compatibility with the vehicle.
          </p>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book a Ride Now →
          </Link>

          <Link
            to="/policy-updates"
            className="block w-full mt-3 text-center border border-slate-300 text-slate-700 font-semibold text-sm rounded-2xl py-3 hover:bg-slate-100 transition"
          >
            View Policy Change Log
          </Link>
        </main>
      </div>
    </>
  );
}
