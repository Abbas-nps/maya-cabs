import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Maya Cabs | Wheelchair Transport Lahore | +92 339 6292222</title>
        <meta
          name="description"
          content="Contact Maya Cabs for wheelchair accessible transport in Lahore. WhatsApp: +92 339 6292222. Book online or message us for regular bookings, questions, and support."
        />
        <link rel="canonical" href="https://mayacabs.pk/contact" />
        <meta property="og:title" content="Contact Maya Cabs | Wheelchair Transport Lahore" />
        <meta property="og:url" content="https://mayacabs.pk/contact" />
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
            Contact Maya Cabs
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            The easiest way to reach us is via WhatsApp. Our team is available Monday to Saturday
            from 9:00 AM to 10:00 PM. For general enquiries, recurring booking arrangements,
            or any questions about our wheelchair accessible transport service in Lahore,
            please get in touch using the details below.
          </p>

          <div className="space-y-4 mb-10">
            <a
              href="https://wa.me/923396292222"
              className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 hover:bg-green-100 transition"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width={26} height={26} fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.113.552 4.097 1.518 5.824L0 24l6.336-1.518A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.575-.498-5.063-1.367l-.364-.21-3.763.902.918-3.669-.236-.378A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base">WhatsApp</div>
                <div className="text-green-700 font-semibold text-sm">+92 339 6292222</div>
                <div className="text-slate-500 text-xs mt-0.5">Tap to open WhatsApp directly</div>
              </div>
            </a>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="font-bold text-slate-900 text-base mb-1">📍 Service Area</div>
              <div className="text-slate-600 text-sm">Lahore, Punjab, Pakistan</div>
              <div className="text-slate-500 text-xs mt-1">All areas within Lahore city. See <Link to="/areas-served" className="text-teal-700 underline">full coverage map</Link></div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="font-bold text-slate-900 text-base mb-1">🕐 Operating Hours</div>
              <div className="text-slate-600 text-sm">Monday – Saturday: 10:00 AM – 10:00 PM</div>
              <div className="text-slate-500 text-xs mt-1">Booking requires minimum 4 hours advance notice</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {[
              {
                q: "Can I book for someone else?",
                a: "Yes. Family members, caregivers, and social workers commonly book on behalf of the patient or wheelchair user. Provide the passenger's name and contact number during booking.",
              },
              {
                q: "How far in advance must I book?",
                a: "We require a minimum of 4 hours advance notice. For hospital appointments or airport transfers, we recommend booking at least the day before.",
              },
              {
                q: "Can the driver assist inside the hospital?",
                a: "The driver assists from the front door of your home to the hospital entrance. Inside the hospital, the driver does not accompany the patient. For patients who need support inside, please bring a family member or carer.",
              },
              {
                q: "What if my appointment runs longer than my booked slot?",
                a: "Contact us via WhatsApp as soon as you know the appointment will overrun. We will do our best to extend your slot or arrange an alternative pickup time, subject to availability.",
              },
              {
                q: "Is this service available for children in wheelchairs?",
                a: "Yes. Paediatric wheelchair users are welcome, but must be accompanied by a parent or guardian at all times.",
              },
              {
                q: "Is this an emergency service?",
                a: "No. Maya Cabs is not an emergency or ambulance service. For medical emergencies, call Rescue 1122.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="font-semibold text-slate-900 text-sm mb-1.5">{faq.q}</div>
                <div className="text-slate-600 text-sm leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book a Ride →
          </Link>
        </main>
      </div>
    </>
  );
}
