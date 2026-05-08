import type { Metadata } from "next";
import "./globals.css";
import { unstable_cache } from 'next/cache';
// Removed Google Fonts due to build-time network failures
const poppins = { className: "font-sans" };

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Chatbot from "@/components/Chatbot/Chatbot";

import Maintenance from "@/components/Maintenance/Maintenance";
import { GoogleAnalytics } from '@next/third-parties/google';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

export const metadata: Metadata = {
  title: {
    default: "MLBB Top Up India – Cheap Mobile Legends Diamonds | Yujimlbb",
    template: "%s | Yujimlbb"
  },
  description: "Buy Mobile Legends diamonds at the cheapest price in India. Instant delivery, trusted service & secure payment only at Yujimlbb.com.",
  keywords: ["MLBB Top Up", "Mobile Legends Diamonds", "Cheap MLBB Diamonds India", "MLBB Recharge India", "Yuji MLBB", "Instant Diamond Delivery"],
  authors: [{ name: "Yujimlbb" }],
  creator: "Yujimlbb",
  publisher: "Yujimlbb",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://yujimlbb.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MLBB Top Up India – Cheap Mobile Legends Diamonds | Yujimlbb",
    description: "Buy Mobile Legends diamonds at the cheapest price in India. Instant delivery, trusted service & secure payment only at Yujimlbb.com.",
    url: "https://yujimlbb.com",
    siteName: "Yujimlbb",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Yujimlbb Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MLBB Top Up India – Cheap Mobile Legends Diamonds | Yujimlbb",
    description: "Buy Mobile Legends diamonds at the cheapest price in India. Instant delivery, trusted service & secure payment only at Yujimlbb.com.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "SIX1trDeaETK7DDO7IlpYofg4A3QMOENWAid77zLzgU",
  },
};

const getMaintenanceMode = unstable_cache(
  async () => {
    try {
      await connectDB();
      const settings = await SystemSettings.findOne();
      return settings?.maintenanceMode || false;
    } catch (err) {
      console.error("Failed to fetch maintenance mode", err);
      return false;
    }
  },
  ['maintenance-mode'],
  { revalidate: 60 } // Cache for 1 minute
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMaintenance = await getMaintenanceMode();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Yujimlbb",
              "url": "https://yujimlbb.com",
              "logo": "https://yujimlbb.com/logo.png",
              "image": "https://yujimlbb.com/logo.png",
              "description": "Premium game top-up service in India. Buy MLBB Diamonds and credits instantly.",
              "priceRange": "₹",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://www.facebook.com/yujimlbb",
                "https://www.instagram.com/yujimlbb",
                "https://twitter.com/yujimlbb"
              ]
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://yujimlbb.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Games",
                  "item": "https://yujimlbb.com/games"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Leaderboard",
                  "item": "https://yujimlbb.com/leaderboard"
                }
              ]
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={poppins.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          {isMaintenance && <Maintenance />}
          <Header />
          <main className="pt-12">{children}</main>
          <Footer />
          <Chatbot />
        </GoogleOAuthProvider>

      </body>
      <GoogleAnalytics gaId="G-7MQ5K05HZQ" />
      {/* <script src="https://quge5.com/88/tag.min.js" data-zone="191906" async data-cfasync="false"></script> */}
    </html>
  );
}
