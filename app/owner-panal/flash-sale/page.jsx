"use client";

import { useState, useEffect } from "react";
import { FiSave, FiPlus, FiTrash2, FiClock, FiZap } from "react-icons/fi";
import Loader from "@/components/Loader/Loader";

export default function FlashSaleManagement() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        isActive: false,
        endTime: "",
        items: []
    });

    useEffect(() => {
        fetch("/api/owner/flash-sale")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.flashSale) {
                    const dt = new Date(data.flashSale.endTime || Date.now());
                    // Format for datetime-local input: YYYY-MM-DDThh:mm
                    const tzOffset = dt.getTimezoneOffset() * 60000; // offset in milliseconds
                    const localISOTime = (new Date(dt - tzOffset)).toISOString().slice(0, 16);
                    
                    setConfig({
                        isActive: data.flashSale.isActive || false,
                        endTime: localISOTime,
                        items: data.flashSale.items || []
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/owner/flash-sale", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isActive: config.isActive,
                    endTime: new Date(config.endTime).toISOString(),
                    items: config.items
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Flash Sale updated successfully!");
            } else {
                alert("Failed to update: " + data.message);
            }
        } catch (error) {
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        setConfig(prev => ({
            ...prev,
            items: [...prev.items, {
                id: Date.now().toString(),
                name: "New Item",
                game: "MLBB",
                image: "/game-assets/elite-bundle.jpeg",
                price: "₹99",
                originalPrice: "₹150",
                slug: "weeklymonthly-bundle261",
                badge: "Hot",
                sold: 50
            }]
        }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...config.items];
        newItems[index][field] = value;
        setConfig(prev => ({ ...prev, items: newItems }));
    };

    const removeItem = (index) => {
        const newItems = config.items.filter((_, i) => i !== index);
        setConfig(prev => ({ ...prev, items: newItems }));
    };

    if (loading) return <Loader />;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase italic flex items-center gap-2">
                        <FiZap className="text-amber-500" /> Flash Sale Config
                    </h1>
                    <p className="text-sm text-gray-500">Manage the homepage flash sale section.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black font-black uppercase rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                    <FiSave /> {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {/* General Settings */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
                <h2 className="text-lg font-bold">General Settings</h2>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                        <p className="font-bold">Enable Flash Sale</p>
                        <p className="text-xs text-gray-500">Show or hide the flash sale section on the homepage.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config.isActive}
                            onChange={(e) => setConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="block font-bold text-sm">Sale End Time</label>
                    <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="datetime-local" 
                            value={config.endTime}
                            onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Items Management */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Sale Items</h2>
                    <button 
                        onClick={addItem}
                        className="flex items-center gap-1 text-sm px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                    >
                        <FiPlus /> Add Item
                    </button>
                </div>

                {config.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        No items added yet. Click "Add Item" to start.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {config.items.map((item, index) => (
                            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4 relative bg-gray-50/50 dark:bg-gray-800/30">
                                <button 
                                    onClick={() => removeItem(index)}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <FiTrash2 />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                                        <input type="text" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Game Name</label>
                                        <input type="text" value={item.game} onChange={(e) => updateItem(index, 'game', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Sale Price (e.g. ₹99)</label>
                                        <input type="text" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Original Price</label>
                                        <input type="text" value={item.originalPrice} onChange={(e) => updateItem(index, 'originalPrice', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Target Slug / Link</label>
                                        <input type="text" value={item.slug} onChange={(e) => updateItem(index, 'slug', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Image URL (or path)</label>
                                        <input type="text" value={item.image} onChange={(e) => updateItem(index, 'image', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Badge (e.g. Hot, Value)</label>
                                        <input type="text" value={item.badge} onChange={(e) => updateItem(index, 'badge', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">% Sold (0-100)</label>
                                        <input type="number" min="0" max="100" value={item.sold} onChange={(e) => updateItem(index, 'sold', Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
