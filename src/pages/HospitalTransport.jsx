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
            Attending a hospital appointment in Lahore is already stressful for a wheelchair user and their family. Navigating Lahore's traffic in a standard taxi or ride-hailing vehicle — one that is not designed for wheelchair access — makes the experience even harder. Maya Cabs addresses this by providing wheelchair-accessible vans with trained drivers who take your family member from their front door to the hospital entrance, with no transfers and no lifting.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Hospitals We Serve</h2>
          <p className="text-slate-600 mb-4">
            Maya Cabs can transport passengers to hospitals and medical facilities across Lahore, including but not limited to:
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
                body: `Regular outpatient consultations are one of the most common transport needs for wheelchair users. Whether it is a periodic specialist visit, a medication review, or a follow-up after a procedure, Maya Cabs can take your family member to their OPD appointment and return them home. Most OPD visits can be completed within a 2- or 3-hour booking slot.`,
              },
              {
                title: "Diagnostic Tests and Imaging",
                body: `Blood tests, CT scans, MRI scans, ultrasounds, and X-rays often take unpredictable amounts of time due to queues at diagnostic centres. We can provide a 3- or 4-hour wait-and-return booking.

Our service can transport passengers to major diagnostic labs such as Chughtai Lab, Essa Lab, Aga Khan Lab, as well as hospital radiology departments.`,
              },
              {
                title: "Dialysis Sessions",
                body: `Dialysis users require transport several times per week for sessions lasting 3 to 4 hours. Reliability and punctuality are especially important for these trips. Maya Cabs can be scheduled on a recurring basis for dialysis transport to centres across Lahore.`,
              },
              {
                title: "Physiotherapy and Rehabilitation",
                body: `Recovery from stroke, spinal injury, orthopaedic surgery, or neurological conditions often requires months of physiotherapy. Maya Cabs can transport passengers to physiotherapy clinics, occupational therapy sessions, hydrotherapy facilities, and rehabilitation centres across Lahore. Consistent attendance at these sessions supports recovery and long-term mobility.`,
              },
              {
                title: "Surgical Admission and Discharge",
                body: `Individuals being admitted for surgery or returning home after a hospital stay may not be able to travel safely in a standard vehicle if they depend on a wheelchair. Maya Cabs can provide admission and discharge transport with careful handling.

Please note: this is not a medical transport service. Anyone requiring monitoring equipment or clinical supervision during transit should arrange a licensed medical ambulance.`,
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
            Booking is completed online through this website. Select a date and time slot (we recommend booking 24 hours in advance for hospital appointments to ensure availability). Enter the passenger's name, wheelchair type, home address, and hospital name and department if known. Confirm via WhatsApp, and payment is collected in advance.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            For recurring appointments such as dialysis or regular therapy sessions, you may contact us via WhatsApp at <strong>+92 339 6292222</strong> to arrange a schedule.
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
