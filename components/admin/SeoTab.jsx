"use client";

import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SeoTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seoForm, setSeoForm] = useState({ title: "", description: "", keywords: "" });
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
                setSeoForm({
                    title: data.settings.seoTitle || "",
                    description: data.settings.seoDescription || "",
                    keywords: (data.settings.seoKeywords || []).join(", ")
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
            showToast("Could not load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSeo = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const keywordsArray = seoForm.keywords
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0)
                .slice(0, 20); // up to 20 keywords
                
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    seoTitle: seoForm.title,
                    seoDescription: seoForm.description,
                    seoKeywords: keywordsArray
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("SEO settings updated");
            } else {
                showToast(data.message || "Could not save changes", "error");
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
                <p className="text-[10px] font-bold uppercase tracking-widest">Loading SEO settings</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
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
                <h2 className="text-xl font-bold text-[var(--foreground)]">SEO Settings</h2>
                <button
                    onClick={fetchSettings}
                    className="p-2 hover:bg-[var(--foreground)]/[0.05] rounded-lg text-[var(--muted)] transition-colors"
                >
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="p-6 rounded-3xl border bg-[var(--foreground)]/[0.02] border-[var(--border)] space-y-4">
                <div>
                    <h3 className="font-bold text-[var(--foreground)]">Search Engine Optimization</h3>
                    <p className="text-xs text-[var(--muted)]">Manage search engine optimization tags. These tags will be appended to the default website tags.</p>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Meta Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" 
                            value={seoForm.title}
                            onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                            placeholder="Enter additional website title or leave blank for default"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Meta Description</label>
                        <textarea 
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] h-20" 
                            value={seoForm.description}
                            onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value })}
                            placeholder="Enter additional website description or leave blank for default"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Meta Keywords (comma separated, max 20)</label>
                        <input 
                            type="text" 
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" 
                            value={seoForm.keywords}
                            onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                    </div>
                    <button 
                        onClick={handleSaveSeo}
                        disabled={saving}
                        className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold mt-2 disabled:opacity-50"
                    >
                        Save SEO Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
