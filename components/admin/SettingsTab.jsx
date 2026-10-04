"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, RefreshCcw, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({ maintenanceMode: false });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/settings", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
            showToast("Could not load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates) => {
        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
                showToast(`Maintenance mode ${updates.maintenanceMode ? "on" : "off"}`);
            }
        } catch (err) {
            console.error("Failed to update settings", err);
            showToast("Could not save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <RefreshCcw className="animate-spin text-[var(--accent)] mb-4" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Loading settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6 px-1 sm:px-2 max-w-full">
            {/* TOAST */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl text-xs font-bold border backdrop-blur-md shadow-lg
                            ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]"}`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">System Settings</h2>
                    <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">
                        Manage global platform availability and store preferences
                    </p>
                </div>
                <button
                    onClick={fetchSettings}
                    title="Refresh Settings"
                    className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-90"
                >
                    <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* SETTINGS LIST */}
            <div className="divide-y divide-[var(--border)]">
                {/* MAINTENANCE MODE */}
                <div className="py-4 flex items-center justify-between gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${settings.maintenanceMode ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] border border-[var(--border)]"}`}>
                            {settings.maintenanceMode ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">Maintenance Mode</h3>
                            <p className="text-xs text-[var(--muted)] leading-tight">Hide the website from customers.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
                        disabled={saving}
                        aria-label="Toggle Maintenance Mode"
                        className={`shrink-0 relative w-12 h-6.5 rounded-full transition-colors flex items-center p-0.5
                            ${settings.maintenanceMode ? "bg-orange-500" : "bg-[var(--foreground)]/15"}
                            ${saving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                    >
                        <motion.div
                            animate={{ x: settings.maintenanceMode ? 22 : 0 }}
                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>

                {/* TRANSLATOR TOGGLE */}
                <div className="py-4 flex items-center justify-between gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${settings.enableAutoTranslation ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] border border-[var(--border)]"}`}>
                            <span className="font-bold text-xs sm:text-sm">A/अ</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">Google Translate</h3>
                            <p className="text-xs text-[var(--muted)] leading-tight">Let customers translate the website.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => updateSettings({ enableAutoTranslation: !settings.enableAutoTranslation })}
                        disabled={saving}
                        aria-label="Toggle Google Translate"
                        className={`shrink-0 relative w-12 h-6.5 rounded-full transition-colors flex items-center p-0.5
                            ${settings.enableAutoTranslation ? "bg-blue-500" : "bg-[var(--foreground)]/15"}
                            ${saving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                    >
                        <motion.div
                            animate={{ x: settings.enableAutoTranslation ? 22 : 0 }}
                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>

                {/* ORDERS TOGGLE */}
                <div className="py-4">
                    <div className="flex items-center justify-between gap-3 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${settings.acceptingOrders === false ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"}`}>
                                {settings.acceptingOrders === false ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">Accept Orders</h3>
                                <p className="text-xs text-[var(--muted)] leading-tight">Turn off to stop receiving orders.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => updateSettings({ acceptingOrders: !settings.acceptingOrders })}
                            disabled={saving}
                            aria-label="Toggle Accept Orders"
                            className={`shrink-0 relative w-12 h-6.5 rounded-full transition-colors flex items-center p-0.5
                                ${settings.acceptingOrders !== false ? "bg-green-500" : "bg-[var(--foreground)]/15"}
                                ${saving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                        >
                            <motion.div
                                animate={{ x: settings.acceptingOrders !== false ? 22 : 0 }}
                                className="w-5 h-5 bg-white rounded-full shadow-sm"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    <AnimatePresence>
                        {settings.acceptingOrders === false && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-3 mt-3">
                                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Store Closed Message</label>
                                    <textarea
                                        value={settings.notAcceptingOrdersMessage || ""}
                                        onChange={(e) => setSettings({ ...settings, notAcceptingOrdersMessage: e.target.value })}
                                        onBlur={() => updateSettings({ notAcceptingOrdersMessage: settings.notAcceptingOrdersMessage })}
                                        className="w-full min-h-[72px] bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none resize-none"
                                        placeholder="We are not taking orders right now. Please come back later."
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
