/** Contact + business details. Everything here is a placeholder — replace before launch. */
export const SITE = {
  name: "Creamio",
  tagline: "Ice Cream & More",
  address: ["Shop No. 00, Your Street Name", "Your Area, Your City 000000"],
  phone: "+91 00000 00000",
  phoneHref: "tel:+910000000000",
  email: "hello@creamio.example",
  hours: [
    { days: "Monday – Thursday", time: "11:00 am – 10:00 pm" },
    { days: "Friday – Saturday", time: "11:00 am – 11:30 pm" },
    { days: "Sunday", time: "10:00 am – 10:30 pm" },
  ],
  socials: [
    { id: "instagram", label: "Instagram", href: "https://instagram.com/", handle: "@creamio.icecream" },
    { id: "facebook", label: "Facebook", href: "https://facebook.com/", handle: "/creamio" },
    { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/910000000000", handle: "Order & enquiries" },
  ],
  /**
   * Google Maps: paste a "Share → Embed a map" URL into NEXT_PUBLIC_MAPS_EMBED_URL (see .env.example)
   * and the placeholder below is replaced by the live map.
   */
  mapsEmbedUrl: process.env.NEXT_PUBLIC_MAPS_EMBED_URL ?? "",
  mapsLink: "https://maps.google.com/",
} as const;
