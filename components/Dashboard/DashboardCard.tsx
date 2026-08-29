import { JSX } from "react";
import {
  ShoppingBag,
  Users,
  Wallet,
  Activity,
  CreditCard,
  MessageSquare,
  ChevronRight,
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
  order: <ShoppingBag size={18} />,
  orders: <ShoppingBag size={18} />,
  support: <MessageSquare size={18} />,
  query: <MessageSquare size={18} />,
  wallet: <Wallet size={18} />,
  account: <Users size={18} />,
  users: <Users size={18} />,
  revenue: <Wallet size={18} />,
  activity: <Activity size={18} />,
};

export default function DashboardCard({
  tab,
  activeTab,
  onClick,
}: DashboardCardProps) {
  const isActive = activeTab === tab.key;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group relative p-3.5 sm:p-4 rounded-xl cursor-pointer border
                  transition-all duration-300 overflow-hidden w-full
        ${isActive
          ? "border-[var(--accent)] bg-[var(--card)]/90 shadow-sm"
          : "border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--card)] hover:border-[var(--accent)]/30"
        }`}
    >
      {/* GLOW EFFECT FOR ACTIVE */}
      {isActive && (
        <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-xl blur-xl -z-10" />
      )}

      {/* ================= ROW CONTENT ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
              ${isActive
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--muted)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/20"
              }`}
          >
            {ICON_MAP[tab.key] || <Activity size={18} />}
          </div>

          <div className="flex flex-col text-left">
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {tab.label_alt || tab.label}
            </p>
            <h2 className={`text-sm sm:text-base font-bold tracking-tight transition-colors
              ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)] group-hover:text-[var(--accent)]"}`}>
              {tab.value}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
          <ChevronRight size={16} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}
