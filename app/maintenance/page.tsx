import type { Metadata } from "next";
import Maintenance from "@/components/Maintenance/Maintenance";

export const metadata: Metadata = {
  title: "Under Maintenance | Yuji",
  description: "We are making things better and will be back shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen">
      <Maintenance forceShow={true} />
    </main>
  );
}
