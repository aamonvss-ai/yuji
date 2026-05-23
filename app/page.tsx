// app/page.tsx
import HomeSection from "@/components/Home/Home";
import MaintenancePage from "./maintenance/page";

export const metadata = {
  title: "YUJI OFFICIAL – MLBB Diamond Top Up | Instant & Secure",
  description:
    "YUJI official is a fast and secure Mobile Legends (MLBB) diamond top-up platform. Instant delivery, safe payments, and 24/7 automated service.",
  keywords: [
    "MLBB top up",
    "buy MLBB diamonds",
    "Mobile Legends recharge",
    "yuji top up",
    "cheap diamonds",
    "MLBB India",
    "buy mlbb diamonds india",
    "mobile legends top up center",
    "mlbb diamonds cheap price",
    "buy game credits india",
    "ml diamonds india"
  ],
  openGraph: {
    title: "YUJI MAIN – MLBB Diamond Top Up | Instant & Secure",
    description: "Fast and secure Mobile Legends (MLBB) diamond top-up platform.",
    url: "https://yujimlbb.com",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return (
    <main>
      <HomeSection />
      {/* <MaintenancePage /> */}
    </main>
  );
}
