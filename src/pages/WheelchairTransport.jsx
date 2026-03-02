import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function WheelchairTransport() {
  return (
    <>
      <Helmet>
        <title>Wheelchair Transport in Lahore | Hydraulic Ramp Van | Maya Cabs</title>
        <meta
          name="description"
          content="Wheelchair accessible van transport in Lahore. Hydraulic ramp, 4-point tie-down, trained driver, door-to-door service. Pakistan's first dedicated wheelchair transport service."
        />
        <link rel="canonical" href="https://mayacabs.pk/wheelchair-transport" />
        <meta property="og:title" content="Wheelchair Transport in Lahore | Maya Cabs" />
        <meta property="og:url" content="https://mayacabs.pk/wheelchair-transport" />
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
            Wheelchair Transport in Lahore
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            Maya Cabs is Lahore's dedicated wheelchair accessible transport service. We operate
            purpose-modified vans with hydraulic boarding ramps, four-point tie-down anchor systems,
            and trained drivers who assist wheelchair users safely from their front door to any
            destination in the city.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">What Makes Our Van Accessible</h2>
          <div className="space-y-4 mb-8">
            {[
              {
                title: "Hydraulic Boarding Ramp",
                body: `Our van is fitted with a power-operated hydraulic ramp at the rear. When deployed, the
ramp creates a gentle slope from ground level to the van floor. Wheelchair users — whether in
a manual or powered chair — can be wheeled up the ramp without any lifting, step-climbing, or
transfer out of the chair. The ramp can support up to 350 kg and has non-slip surface texturing.
The ramp takes approximately 15 seconds to deploy and retract, and is controlled by the driver.
Family members can assist guiding the chair up the ramp. The ramp width accommodates wheelchairs
up to 76 cm wide, covering the vast majority of standard and powered chairs available in Pakistan.`,
              },
              {
                title: "Four-Point Tie-Down System",
                body: `Once inside the van, the wheelchair is secured using a four-point tie-down system.
Four heavy-duty straps attach to the wheelchair frame at the front and rear on both sides.
Each strap is tensioned and locked using a ratchet mechanism that prevents any movement of
the chair during the journey. The tie-down system meets international W19 (ISO 10542)
wheelchair transport standards. In addition to the chair tie-down, an occupant restraint
system — a lap belt and shoulder harness — is offered to the passenger. These straps are
adjusted to the passenger's body size and provide the same protection as standard vehicle
seat belts.`,
              },
              {
                title: "Widened Interior and Lowered Floor",
                body: `The van's interior has been modified with a widened side door opening and a floor that
sits lower than a standard van. This reduces the angle and distance of the ramp, making
boarding smoother for both manual chair pushers and passengers in powered chairs. The interior
ceiling height is sufficient for passengers who remain upright in high-back wheelchairs or
head-support frames. The van's interior is clear of obstacles, with sufficient turning radius
for a powered wheelchair to manoeuvre into the secured position without difficulty.`,
              },
              {
                title: "Passenger Comfort",
                body: `During the journey, the wheelchair-secured passenger faces forward, in the standard
travelling direction. This is important for passenger comfort, reducing motion sickness and
anxiety. The driver's cab is separated by a clear window, allowing easy communication without
the driver turning around. Air conditioning vents are accessible from the passenger area.
A carer or family member may travel alongside the passenger in the adjacent seat. We encourage
at least one accompanying person for passengers with complex medical needs.`,
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 text-base mb-2">♿ {item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{item.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Types of Wheelchairs We Transport</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600 mb-8">
            <li>Standard manual wheelchairs (folding and rigid frame)</li>
            <li>Lightweight transit/attendant-propelled wheelchairs</li>
            <li>Wide manual wheelchairs (bariatric up to 76cm width)</li>
            <li>Powered/electric wheelchairs (all standard sizes)</li>
            <li>Tilt-in-space and reclining wheelchairs</li>
            <li>Paediatric wheelchairs (children must be accompanied by a caregiver)</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Driver Training and Assistance</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our drivers are selected for their patience, communication skills, and physical
            capability to assist wheelchair users. Every driver undergoes training in wheelchair
            tie-down and occupant restraint procedures, safe ramp operation, disability awareness
            and appropriate communication, and basic first-aid.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            The driver will assist the passenger from the front door of their home to the secured
            position in the van. If the passenger lives in a house with steps, the driver can
            assist in manoeuvring the chair down the steps — but for significant staircase
            situations, please inform us in advance so additional assistance can be arranged.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Maya Cabs is not a medical transport service and our drivers are not paramedics.
            Passengers with acute medical conditions requiring medical monitoring during transit
            should use an appropriate medical ambulance service. Our service is for stable
            mobility-impaired passengers attending appointments, visiting family, or travelling
            for daily life activities.
          </p>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book Wheelchair Transport →
          </Link>
        </main>
      </div>
    </>
  );
}
