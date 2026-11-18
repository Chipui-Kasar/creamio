import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Creamio — Ice Cream, Fresh Juice & Coffee",
  description:
    "A little scoop of happiness. Premium ice cream, softy, fresh juice and espresso coffee from a small boutique shop — explore the shop in 3D.",
  openGraph: {
    title: "Creamio — Ice Cream & More",
    description: "Ice Cream, Fresh Juice & Coffee. Explore our shop in 3D.",
    images: ["/images/brand/logo-full.png"],
  },
  icons: { icon: "/images/brand/mascot.png" },
};

export const viewport: Viewport = {
  themeColor: "#fff6e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
