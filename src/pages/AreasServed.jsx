import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function AreasServed() {
  return (
    <>
      <Helmet>
        <title>Areas Served in Lahore | Wheelchair Transport Coverage | Maya Cabs</title>
        <meta
          name="description"
          content="Maya Cabs serves all major areas of Lahore for wheelchair accessible transport including DHA, Gulberg, Johar Town, Iqbal Town, Model Town, Cantt, and all surrounding areas."
        />
        <link rel="canonical" href="https://mayacabs.pk/areas-served" />
        <meta property="og:title" content="Lahore Areas Served | Wheelchair Transport | Maya Cabs" />
        <meta property="og:url" content="https://mayacabs.pk/areas-served" />
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
            Areas We Serve in Lahore
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Maya Cabs provides wheelchair accessible transport across the entire metropolitan
            area of Lahore, Punjab, Pakistan. Whether you live in a planned housing society
            like DHA or Bahria Town, or an older neighbourhood like Ichhra or Mozang, we come
            to your door. All bookings are door-to-door — we do not require you to meet the
            van at a central point.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-5">Neighbourhoods and Areas Covered</h2>
          <div className="grid grid-cols-2 gap-2.5 mb-10">
            {[
              "DHA (All Phases)", "Bahria Town", "Johar Town", "Gulberg I–V", "Model Town",
              "Iqbal Town", "Garden Town", "Cantt / Cantonment", "Wapda Town", "Faisal Town",
              "Allama Iqbal Town", "Township", "Samanabad", "Shalimar Link Road", "Raiwind Road",
              "Ferozepur Road", "GT Road (Lahore)", "Bedian Road", "Thokar Niaz Baig",
              "Lake City", "EME Housing Society", "PAF Falcon Complex", "Walton Road",
              "Jail Road", "MM Alam Road Area", "Wahdat Colony", "Nishtar Colony",
              "Shadman", "Aziz Bhatti Town", "Ichhra", "Mozang",
              "Baghbanpura", "Shahdara", "Rizvia Society", "Green Town",
              "Cavalry Ground", "Askari areas", "Airport Road area", "Manga Mandi",
            ].map((area) => (
              <div key={area} className="bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium shadow-sm border border-slate-100">
                📍 {area}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Coverage Boundaries</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our primary service coverage is within Lahore city boundaries. All booking slots
            include sufficient time to complete your journey within the selected 2, 3, or 4-hour
            window. For areas at the far outskirts or adjacent towns such as Sheikhupura,
            Raiwind, or Kot Radha Kishan, please contact us via WhatsApp before booking to
            confirm availability and that your journey will fit within the chosen slot.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Journeys to Allama Iqbal International Airport are included in our standard coverage.
            Long-distance intercity transport (to other cities in Punjab) is not currently offered.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Major Hospitals We Reach in Lahore</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Many of our passengers travel to hospitals located in central or inner Lahore from
            residential neighbourhoods. Below are the major hospital destinations we regularly serve:
          </p>
          <div className="grid grid-cols-2 gap-2.5 mb-10">
            {[
              "Services Hospital (Jail Road)", "Jinnah Hospital (Canal Road)",
              "Mayo Hospital (Abbott Road)", "Shaukat Khanum (DHA)",
              "Doctors Hospital (Ferozepur Road)", "Hameed Latif Hospital (Shadman)",
              "Sheikh Zayed Hospital (Canal Bank Road)", "Lahore General Hospital",
              "Ittefaq Hospital (Model Town)", "National Hospital (DHA)",
              "Sir Ganga Ram Hospital", "Surgeon Hospital (DHA)",
              "Chughtai Lab (All branches)", "Essa Lab (All branches)",
            ].map((h) => (
              <div key={h} className="bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium shadow-sm border border-slate-100">
                🏥 {h}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">How to Confirm Your Area is Covered</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The simplest way to confirm is to start a booking on our website. Enter your pickup
            address and destination. If you are unsure whether your specific address is within
            range, send us a quick WhatsApp message at +92 339 6292222 before booking. Our team
            responds quickly and will confirm availability for your specific journey.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            We are expanding our service area as demand grows. If you are in a nearby city and
            would like wheelchair accessible transport, let us know — we will do our best to
            accommodate you or connect you with a suitable service.
          </p>

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
