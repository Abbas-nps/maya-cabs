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
          purpose-modified vans with built in ramp, four-point tie-down anchor systems,
            and trained drivers who assist wheelchair users safely from their front door to any
            destination in the city.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">What Makes Our Van Accessible</h2>
          <div className="space-y-4 mb-8">
            {[
              {
                title: "Hydraulic Boarding Ramp",
                body: `Electronic winch system which pulls the wheelchairs up the in built wheelchair ramp, removing the need for manual pushing up the ramp, ensuring a safe entry and exit. When deployed, the
ramp creates a gentle slope from ground level to the van floor. Wheelchair users — whether in
a manual or powered chair — can be wheeled up the ramp without any lifting, step-climbing, or
transfer out of the chair. The ramp can support up to 250 kg and has non-slip surface texturing.
The ramp takes approximately 15 seconds to deploy and retract, and is controlled by the driver.
Family members can assist guiding the chair up the ramp. The ramp width accommodates wheelchairs
up to 73 cm wide, covering the vast majority of standard and powered chairs available in Pakistan.`,
              },
              {
                title: "Four-Point Wheelchair Securement System",
                body: `Once inside the van, the wheelchair is secured using a four-point tie-down system designed to prevent movement during the journey.

Two heavy-duty ratchet straps anchor the wheelchair in place from the rear, locking the chair firmly to the vehicle floor. At the front, two secure hooks connect to the wheelchair and are also used during boarding: the electronic winch pulls the wheelchair up the ramp and into the vehicle. After entry, the winch connection remains attached, providing an additional forward restraint and added safety.

Together, the two rear ratchet straps and the two forward hook points create four independent securement positions, stabilizing the wheelchair from both forward and backward motion while the vehicle is in transit.

While seated in the wheelchair, the passenger uses a standard vehicle safety seat belt for personal safety throughout the ride.`,
              },
              {
                title: "Lowered Floor Wheelchair Area",
                body: `The van features a dedicated wheelchair section with a lowered floor to reduce the ramp angle during boarding. This allows smoother entry for both manually assisted wheelchairs and powered chairs, while also providing improved headroom once inside the vehicle.

The side door opening remains standard; access is provided through the rear ramp. The interior layout is kept clear to allow the wheelchair to be guided directly into its securement position rather than manoeuvred or turned within the vehicle.`,
              },
              {
                title: "Passenger Comfort",
                body: `During the journey, the wheelchair user travels facing forward in the normal direction of travel. The driver's area is open to the passenger compartment, allowing easy communication when needed. Air conditioning from the vehicle serves the passenger area, and seating is available for accompanying family members or attendants.

The service can accommodate up to three passengers in total (including the wheelchair user) in addition to the MayaCabs driver, with one seat available in the front and one in the rear alongside the wheelchair position.`,
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 text-base mb-2">♿ {item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{item.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Types of Wheelchairs We Transport</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600 mb-3">
            <li>Standard manual wheelchairs (folding and rigid frame)</li>
            <li>Lightweight transit/attendant-propelled wheelchairs</li>
            <li>Powered/electric wheelchairs (all standard sizes)</li>
            <li>Tilt-in-space and reclining wheelchairs</li>
            <li>Paediatric wheelchairs (children must be accompanied by a caregiver)</li>
          </ul>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-8">
            ⚠️ We are unable to accommodate wheelchairs wider than 28 inches (71cm). Please check your wheelchair width before booking.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Driver Training and Assistance</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our drivers are selected for their patience, professionalism, and physical capability to assist wheelchair users safely. They are primarily Urdu-speaking and are trained specifically in the safe operation of the rear ramp, electronic winch, and four-point tie-down system. Drivers are responsible for securing the wheelchair correctly and ensuring it is safely positioned for travel.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            The driver will assist the passenger and accompanying family member from the entrance of the home to the secured position inside the van, including operating the ramp, winch, and ratchet straps. If there are steps at the residence, the driver may assist with careful manoeuvring; however, for significant staircases or complex access situations, we request that this be communicated in advance so appropriate arrangements can be considered.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our team is trained with an understanding of disability awareness and respectful communication. In Pakistan, accessible transport services are still developing, and we aim to promote independence while offering assistance when needed. Some wheelchair users prefer minimal assistance, while others may require more active support. We approach each situation with sensitivity, ensuring that assistance is provided from a place of care, safety, and respect — never from a position of assumption or infantilisation.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Maya Cabs is not a medical transport service, and our drivers are not paramedics. Passengers requiring medical monitoring or emergency-level care during transit should arrange a licensed ambulance service. Our service is designed for stable mobility-impaired passengers attending appointments, visiting family, or travelling for daily life activities.
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
