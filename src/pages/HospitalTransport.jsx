import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function HospitalTransport() {
  return (
    <>
      <Helmet>
        <title>Hospital Transport for Wheelchair Users in Lahore | Maya Cabs</title>
        <meta
          name="description"
          content="Pre-booked wheelchair accessible hospital transport in Lahore. Door-to-door service to Services Hospital, Jinnah, Mayo, Shaukat Khanum, Doctors Hospital and all major clinics."
        />
        <link rel="canonical" href="https://mayacabs.pk/hospital-transport" />
        <meta property="og:title" content="Hospital Transport for Wheelchair Users | Maya Cabs Lahore" />
        <meta property="og:url" content="https://mayacabs.pk/hospital-transport" />
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
            Hospital Transport for Wheelchair Users in Lahore
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            Attending a hospital appointment in Lahore is already stressful for patients in
            wheelchairs. Navigating Lahore's traffic in a standard taxi or ride-hailing vehicle
            — one that is not designed for wheelchair users — makes the experience even harder.
            Maya Cabs solves this by providing purpose-built wheelchair accessible vans with
            trained drivers that take your family member from their front door to the hospital
            entrance, no transfers, no lifting, no stress.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Hospitals We Serve</h2>
          <p className="text-slate-600 mb-4">
            Maya Cabs transports passengers to all hospitals and medical facilities in Lahore,
            including but not limited to:
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              "Services Hospital", "Jinnah Hospital", "Mayo Hospital", "Shaukat Khanum Cancer Hospital",
              "Doctors Hospital", "Hameed Latif Hospital", "Sir Ganga Ram Hospital", "Sheikh Zayed Hospital",
              "Ittefaq Hospital", "Lahore General Hospital", "National Hospital", "Chaudhry Pervaiz Elahi Institute",
              "Fatima Memorial Hospital", "Farooq Hospital", "Akhtar Saeed Medical College",
              "Private clinics in DHA, Gulberg, Model Town",
            ].map((h) => (
              <div key={h} className="bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium shadow-sm border border-slate-100">
                🏥 {h}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Types of Appointments We Support</h2>
          <div className="space-y-4 mb-8">
            {[
              {
                title: "Outpatient (OPD) Clinic Visits",
                body: `Regular outpatient appointments are one of the most frequent transport needs for wheelchair
users. Whether it is a fortnightly specialist consultation, a monthly medication review, or a
follow-up after a procedure, Maya Cabs is here to take your family member to their OPD appointment
and return them home. Most OPD visits are completed within a 2- or 3-hour booking slot.`,
              },
              {
                title: "Diagnostic Tests and Imaging",
                body: `Blood tests, CT scans, MRI scans, ultrasounds, and X-rays often take unpredictable amounts
of time due to queue lengths at diagnostic centres. We offer a 3- or 4-hour wait-and-return
slot so the driver waits through the full process and takes the passenger home when the tests
are done. We serve all major diagnostic labs including Chughtai Lab, Essa Lab, Agha Khan Lab,
and hospital radiology departments.`,
              },
              {
                title: "Dialysis Sessions",
                body: `Kidney dialysis patients require transport three times per week, every week, for sessions
lasting 3 to 4 hours. We understand the critical importance of reliability and punctuality for
dialysis patients — missing a session is medically dangerous. Maya Cabs can be booked on a
recurring basis for regular dialysis patients at all major dialysis centres in Lahore.`,
              },
              {
                title: "Physiotherapy and Rehabilitation",
                body: `Recovery from stroke, spinal injury, orthopaedic surgery, or neurological conditions
often requires months of regular physiotherapy. Maya Cabs regularly transports patients to
physiotherapy clinics, occupational therapy sessions, hydrotherapy centres, and rehabilitation
hospitals across Lahore. Consistent attendance at these sessions is essential for recovery.`,
              },
              {
                title: "Surgical Admission and Discharge",
                body: `Patients being admitted for surgery, or discharged after a hospital stay, cannot safely
travel in a standard vehicle if they are wheelchair-dependent. Maya Cabs provides hospital
admission and discharge transport with extra care for post-operative patients who may be
fragile, drowsy, or on IV equipment. Please note this is not a medical transport service —
patients requiring IV lines or monitoring equipment during transit need a clinical ambulance.`,
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{item.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Booking Hospital Transport</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Booking is done online through this website. Select your date and time slot (we
            recommend booking 24 hours in advance for hospital appointments to ensure availability).
            Enter the patient's name, wheelchair type, home address, and hospital name and
            department if known. Confirm via WhatsApp and payment is collected prepaid.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            For recurring appointments such as dialysis or weekly physiotherapy, contact us via
            WhatsApp at +92 339 6292222 to arrange a regular booking schedule.
          </p>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book Hospital Transport →
          </Link>
        </main>
      </div>
    </>
  );
}
