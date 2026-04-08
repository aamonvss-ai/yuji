"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, RefreshCcw, ShieldCheck } from "lucide-react";
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
        <div className="max-w-2xl mx-auto py-4 space-y-6">
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

            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-[var(--foreground)]">System Settings</h2>
                <button
                    onClick={fetchSettings}
                    className="p-2 hover:bg-[var(--foreground)]/[0.05] rounded-lg text-[var(--muted)] transition-colors"
                >
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* TOGGLE CARD */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ${settings.maintenanceMode ? "bg-orange-500/5 border-orange-500/20" : "bg-[var(--foreground)]/[0.02] border-[var(--border)]"}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${settings.maintenanceMode ? "bg-orange-500 text-white" : "bg-[var(--foreground)]/5 text-[var(--muted)]"}`}>
                            {settings.maintenanceMode ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--foreground)]">Maintenance Mode</h3>
                            <p className="text-xs text-[var(--muted)]">Hide the store from public users.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
                        disabled={saving}
                        className={`relative w-14 h-7 rounded-full transition-colors flex items-center p-1
                            ${settings.maintenanceMode ? "bg-orange-500" : "bg-[var(--foreground)]/10"}
                            ${saving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                    >
                        <motion.div
                            animate={{ x: settings.maintenanceMode ? 28 : 0 }}
                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-center text-[var(--muted)] uppercase tracking-widest opacity-30">
                System Core v2.4.9
            </p>
        </div>
    );
}
