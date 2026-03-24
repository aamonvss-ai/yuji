import type { Metadata } from "next";
import "./globals.css";
import { unstable_cache } from 'next/cache';
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import SocialFloat from "@/components/SocialFloat/SocialFloat";
import Chatbot from "@/components/Chatbot/Chatbot";

import Maintenance from "@/components/Maintenance/Maintenance";
import { GoogleAnalytics } from '@next/third-parties/google';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

export const metadata: Metadata = {
  title: "MLBB Top Up India – Cheap Mobile Legends Diamonds | Yujimlbb",
  description: "Buy Mobile Legends diamonds at the cheapest price in India. Instant delivery, trusted service & secure payment only at Yujimlbb.com.",
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
          <main className="pt-20">{children}</main>
          <Footer />
          <SocialFloat />
          <Chatbot />
        </GoogleOAuthProvider>

      </body>
      <GoogleAnalytics gaId="G-7MQ5K05HZQ" />
      {/* <script src="https://quge5.com/88/tag.min.js" data-zone="191906" async data-cfasync="false"></script> */}
    </html>
  );
}
