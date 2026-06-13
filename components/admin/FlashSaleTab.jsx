"use client";

import { useState, useEffect } from "react";
import { FiSave, FiPlus, FiTrash2, FiClock, FiZap, FiEdit2 } from "react-icons/fi";
import Loader from "@/components/Loader/Loader";

export default function FlashSaleTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        isActive: false,
        endTime: "",
        items: []
    });

    const defaultNewItem = {
        id: "",
        name: "",
        game: "",
        image: "",
        price: "",
        originalPrice: "",
        slug: "",
        badge: "",
        sold: 0
    };
    const [newItem, setNewItem] = useState(defaultNewItem);
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        fetch("/api/owner/flash-sale")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.flashSale) {
                    const dt = new Date(data.flashSale.endTime || Date.now());
                    const tzOffset = dt.getTimezoneOffset() * 60000;
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

    const handleEdit = (index) => {
        setNewItem(config.items[index]);
        setEditingIndex(index);
    };

    const saveItem = () => {
        if (!newItem.name || !newItem.price) {
            alert("Item Name and Sale Price are required.");
            return;
        }
        
        const updatedItems = [...config.items];
        if (editingIndex !== null) {
            updatedItems[editingIndex] = newItem;
        } else {
            updatedItems.push({ ...newItem, id: Date.now().toString() });
        }
        
        setConfig(prev => ({ ...prev, items: updatedItems }));
        setNewItem(defaultNewItem);
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setNewItem(defaultNewItem);
        setEditingIndex(null);
    };

    const removeItem = (index) => {
        const newItems = config.items.filter((_, i) => i !== index);
        setConfig(prev => ({ ...prev, items: newItems }));
        if (editingIndex === index) {
            cancelEdit();
        } else if (editingIndex !== null && editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                        <FiZap className="text-amber-500 shrink-0" /> 
                        <span>Flash Sale Config</span>
                    </h2>
                    <p className="text-sm text-[var(--muted)]">Manage the homepage flash sale section.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-black font-black uppercase rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors shrink-0 w-full sm:w-auto"
                >
                    <FiSave className="shrink-0" /> 
                    <span>{saving ? "Saving..." : "Save Settings"}</span>
                </button>
            </div>

            {/* General Settings */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-[var(--foreground)]">General Settings</h2>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                        <p className="font-bold text-[var(--foreground)]">Enable Flash Sale</p>
                        <p className="text-xs text-[var(--muted)]">Show or hide the flash sale section on the homepage.</p>
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
                    <label className="block font-bold text-sm text-[var(--foreground)]">Sale End Time</label>
                    <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="datetime-local" 
                            value={config.endTime}
                            onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none text-[var(--foreground)]"
                        />
                    </div>
                </div>
            </div>

            {/* Items Management */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">Flash Sale Items ({config.items.length})</h2>
                </div>

                {config.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl mb-6">
                        No items added yet. Use the form below to add one.
                    </div>
                ) : (
                    <div className="space-y-3 mb-8">
                        {config.items.map((item, index) => (
                            <div key={index} className={`flex items-center gap-4 p-4 border rounded-2xl transition-all ${editingIndex === index ? "border-blue-500 bg-blue-500/5 shadow-sm" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/50 shadow-sm"}`}>
                                {/* Image */}
                                <div className="w-16 h-16 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
                                    <img src={item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }} />
                                </div>
                                
                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-[var(--foreground)] truncate">{item.name || "Unnamed Item"}</h3>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded uppercase tracking-wider whitespace-nowrap">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--muted)] truncate mb-1">
                                        {item.game} <span className="mx-1">|</span> Slug: {item.slug}
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <span className="font-extrabold text-[var(--foreground)]">{item.price}</span>
                                        {item.originalPrice && (
                                            <span className="text-xs text-[var(--muted)] line-through">{item.originalPrice}</span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button 
                                        onClick={() => handleEdit(index)}
                                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Edit Item"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Remove Item"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add / Edit Form */}
                <div className="bg-[var(--card)] border border-[var(--border)] p-5 md:p-6 rounded-2xl shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[var(--foreground)] text-lg">
                            {editingIndex !== null ? "Edit Item" : "Add New Item"}
                        </h3>
                        {editingIndex !== null && (
                            <button onClick={cancelEdit} className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-1.5 bg-[var(--background)] rounded-lg transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-1">
                            <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Item Name (e.g. Weekly Pass)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={newItem.game} onChange={(e) => setNewItem({...newItem, game: e.target.value})} placeholder="Game Name (e.g. MLBB)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Discounted Price (e.g. ₹149)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={newItem.originalPrice} onChange={(e) => setNewItem({...newItem, originalPrice: e.target.value})} placeholder="Original Price (e.g. ₹170)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={newItem.slug} onChange={(e) => setNewItem({...newItem, slug: e.target.value})} placeholder="Link Slug (e.g. mobile-legends270)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={newItem.image} onChange={(e) => setNewItem({...newItem, image: e.target.value})} placeholder="Image URL (e.g. /game-assets/1.jpg)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={newItem.badge} onChange={(e) => setNewItem({...newItem, badge: e.target.value})} placeholder="Badge (e.g. Hot Deal)" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                        <div className="space-y-1 flex items-center">
                            <input type="number" min="0" max="100" value={newItem.sold} onChange={(e) => setNewItem({...newItem, sold: Number(e.target.value)})} placeholder="% Sold" className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none transition-colors" />
                        </div>
                    </div>

                    <button 
                        onClick={saveItem}
                        className="w-full py-3 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--foreground)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        <FiPlus className="text-lg" /> {editingIndex !== null ? "Update Item" : "Add Item"}
                    </button>
                </div>
            </div>
        </div>
    );
}
