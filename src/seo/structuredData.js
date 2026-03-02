export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://mayacabs.pk",
  name: "Maya Cabs",
  alternateName: "MayaCabs.pk",
  description:
    "Pakistan's first wheelchair accessible transport service. Trained drivers, hydraulic ramp vans, door-to-door service in Lahore for hospital visits, therapy, airport transfers and daily assisted mobility.",
  url: "https://mayacabs.pk",
  logo: "https://mayacabs.pk/og-image.png",
  image: "https://mayacabs.pk/og-image.png",
  telephone: "+92-339-6292222",
  priceRange: "$$",
  currenciesAccepted: "PKR",
  paymentAccepted: "Prepaid Online",
  areaServed: [
    {
      "@type": "City",
      name: "Lahore",
      addressCountry: "PK",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "31.5204",
    longitude: "74.3587",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:00",
      closes: "22:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Wheelchair Accessible Transport Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Wheelchair Transport Lahore",
          description:
            "Door-to-door wheelchair accessible van service in Lahore with hydraulic ramp and trained driver.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Hospital Transport Service",
          description:
            "Safe patient transport to hospitals, clinics, and medical centres in Lahore for wheelchair users.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Therapy Visit Transport",
          description:
            "Reliable transport for physiotherapy, occupational therapy, and rehabilitation centre visits.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Airport Transfer",
          description:
            "Wheelchair accessible airport transfer service to and from Allama Iqbal International Airport, Lahore.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Assisted Mobility Rides",
          description:
            "Everyday assisted transport for elderly and mobility-impaired passengers across Lahore.",
        },
      },
    ],
  },
  sameAs: ["https://mayacabs.pk"],
};

export const serviceSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Wheelchair Accessible Transport",
    provider: { "@type": "Organization", name: "Maya Cabs" },
    areaServed: { "@type": "City", name: "Lahore" },
    description:
      "Wheelchair accessible van transport in Lahore. Hydraulic ramp, safety straps, trained driver assistance.",
    url: "https://mayacabs.pk/wheelchair-transport",
  },
];
