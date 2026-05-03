// app/page.tsx
import HomeSection from "@/components/Home/Home";
import MaintenancePage from "./maintenance/page";

export const metadata = {
  title: "YUJI MAIN – MLBB Diamond Top Up | Instant & Secure",
  description:
    "YUJI main is a fast and secure Mobile Legends (MLBB) diamond top-up platform. Instant delivery, safe payments, and 24/7 automated service.",
  keywords: [
    "MLBB top up",
    "buy MLBB diamonds",
    "Mobile Legends recharge",
    "yuji top up",
    "cheap diamonds",
    "MLBB India",
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
