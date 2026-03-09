import { JSX } from "react";
import {
  ShoppingBag,
  Users,
  Wallet,
  Activity,
  CreditCard,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  tab: {
    key: string;
    label: string;
    label_alt?: string;
    value: string | number;
  };
  activeTab: string;
  onClick: () => void;
}

/* ================= ICON MAP ================= */
const ICON_MAP: Record<string, JSX.Element> = {
  order: <ShoppingBag size={20} />,
  orders: <ShoppingBag size={20} />,
  support: <MessageSquare size={20} />,
  query: <MessageSquare size={20} />,
  wallet: <Wallet size={20} />,
  account: <Users size={20} />,
  users: <Users size={20} />,
  revenue: <Wallet size={20} />,
  activity: <Activity size={20} />,
};

export default function DashboardCard({
  tab,
  activeTab,
  onClick,
}: DashboardCardProps) {
  const isActive = activeTab === tab.key;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group relative p-4 rounded-2xl cursor-pointer border
                  transition-all duration-300 overflow-hidden
        ${isActive
          ? "border-[var(--accent)] bg-[var(--card)] shadow-lg shadow-[var(--accent)]/5"
          : "border-[var(--border)] bg-[var(--background)]/40 hover:bg-[var(--card)] hover:border-[var(--accent)]/20"
        }`}
    >
      {/* GLOW EFFECT FOR ACTIVE */}
      {isActive && (
        <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-2xl blur-xl -z-10" />
      )}

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {tab.label_alt || tab.label}
          </p>
          <h2 className={`text-lg md:text-xl font-bold mt-1 tracking-tight transition-colors
            ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/80 group-hover:text-[var(--foreground)]"}`}>
            {tab.value}
          </h2>
        </div>

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
            ${isActive
              ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
              : "bg-black/5 text-[var(--muted)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)]"
            }`}
        >
          {ICON_MAP[tab.key] || <Activity size={18} />}
        </div>
      </div>

      {/* ================= ACTIVE INDICATOR ================= */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" />
      )}
    </motion.div>
  );
}
