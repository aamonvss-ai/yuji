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
import GoogleTranslate from "@/components/GoogleTranslate";

import { CurrencyProvider } from "@/components/CurrencyContext";

export async function generateMetadata(): Promise<Metadata> {
  let title = "MLBB Top Up India – Cheap Mobile Legends Diamonds | Yujimlbb";
  let description = "Buy Mobile Legends diamonds at the cheapest price in India. Instant delivery, trusted service & secure payment only at Yujimlbb.com.";
  let keywords = [
    "MLBB Top Up", "Mobile Legends Diamonds", "Cheap MLBB Diamonds India", "MLBB Recharge India", 
    "Yuji MLBB", "Instant Diamond Delivery", "buy mlbb diamonds", "mobile legends top up center", 
    "mlbb diamonds cheap price", "yujimlbb top up", "buy diamonds mlbb india", "mlbb recharge center", 
    "mobile legends bang bang top up", "mlbb store", "mobile legends top up site", "buy game credits india", 
    "ml diamonds india"
  ];

  try {
    await connectDB();
    const settings = await SystemSettings.findOne();
    if (settings) {
      if (settings.seoTitle) title = settings.seoTitle;
      if (settings.seoDescription) description = settings.seoDescription;
      if (settings.seoKeywords && settings.seoKeywords.length > 0) {
        // Append new keywords to default keywords
        keywords = [...keywords, ...settings.seoKeywords];
      }
    }
  } catch (err) {
    console.error("Failed to fetch settings for metadata", err);
  }

  return {
    title: {
      default: title,
      template: "%s | Yujimlbb"
    },
    description: description,
    keywords: keywords,
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
      title: title,
      description: description,
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
      title: title,
      description: description,
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
}

const getSystemSettingsCache = unstable_cache(
  async () => {
    try {
      await connectDB();
      const settings = await SystemSettings.findOne();
      return {
        maintenanceMode: settings?.maintenanceMode || false,
        enableAutoTranslation: settings?.enableAutoTranslation || false
      };
    } catch (err) {
      console.error("Failed to fetch system settings", err);
      return {
        maintenanceMode: false,
        enableAutoTranslation: false
      };
    }
  },
  ['system-settings-cache'],
  { revalidate: 60 } // Cache for 1 minute
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { maintenanceMode, enableAutoTranslation } = await getSystemSettingsCache();

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
                "https://www.instagram.com/yujimlbb_official",
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
          <CurrencyProvider>
            {maintenanceMode && <Maintenance />}
            <Header enableAutoTranslation={enableAutoTranslation} />
            <main className="pt-12">{children}</main>
            <Footer />
            <Chatbot />
          </CurrencyProvider>
        </GoogleOAuthProvider>
      </body>
      <GoogleAnalytics gaId="G-7MQ5K05HZQ" />
      {/* <script src="https://quge5.com/88/tag.min.js" data-zone="191906" async data-cfasync="false"></script> */}
    </html>
  );
}
