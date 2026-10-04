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

    const [isFormOpen, setIsFormOpen] = useState(false);

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
        setIsFormOpen(true);
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
        setIsFormOpen(false);
    };

    const cancelEdit = () => {
        setNewItem(defaultNewItem);
        setEditingIndex(null);
        setIsFormOpen(false);
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
        <div className="space-y-6 pb-6 px-1 sm:px-2 max-w-full">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                        <FiZap className="text-amber-500 shrink-0" /> 
                        <span>Flash Sale Configuration</span>
                    </h2>
                    <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">Manage the homepage flash sale banner and featured deals.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all shrink-0 w-full sm:w-auto shadow-md shadow-amber-500/20"
                >
                    <FiSave className="shrink-0" size={14} /> 
                    <span>{saving ? "Saving..." : "Save Settings"}</span>
                </button>
            </div>

            {/* GENERAL CONTROLS */}
            <div className="divide-y divide-[var(--border)]">
                {/* TOGGLE */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">Enable Flash Sale</p>
                        <p className="text-xs text-[var(--muted)]">Show or hide the flash sale section on the homepage.</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config.isActive}
                            onChange={(e) => setConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <div className="w-12 h-6.5 bg-[var(--foreground)]/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                </div>

                {/* END TIME */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                        <label className="block text-sm font-semibold text-[var(--foreground)]">Sale End Time</label>
                        <p className="text-xs text-[var(--muted)]">Countdown timer expiry timestamp</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
                        <input 
                            type="datetime-local" 
                            value={config.endTime}
                            onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full pl-9 pr-3 py-2 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl focus:border-amber-500 outline-none text-xs text-[var(--foreground)] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* ITEMS LIST */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
                            Active Items ({config.items.length})
                        </h3>
                        <p className="text-[10px] text-[var(--muted)]">Items displayed inside the homepage flash sale slider</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (isFormOpen && editingIndex === null) {
                                setIsFormOpen(false);
                            } else {
                                setNewItem(defaultNewItem);
                                setEditingIndex(null);
                                setIsFormOpen(true);
                            }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            isFormOpen && editingIndex === null
                                ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                                : "bg-amber-500 text-black shadow-sm shadow-amber-500/20 hover:bg-amber-400 active:scale-95"
                        }`}
                    >
                        <FiPlus size={14} className={isFormOpen && editingIndex === null ? "rotate-45 transition-transform" : ""} />
                        <span>{isFormOpen && editingIndex === null ? "Close" : "Add Item"}</span>
                    </button>
                </div>

                {/* ADD / EDIT ITEM FORM (TOGGLED) */}
                {isFormOpen && (
                    <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                            <span className="font-bold text-xs text-[var(--foreground)] uppercase tracking-wider">
                                {editingIndex !== null ? "Edit Flash Item" : "New Flash Item"}
                            </span>
                            <button 
                                onClick={cancelEdit} 
                                className="text-[10px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-0.5 rounded-lg border border-[var(--border)] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Item Name</label>
                                <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Weekly Pass" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Game Name</label>
                                <input type="text" value={newItem.game} onChange={(e) => setNewItem({...newItem, game: e.target.value})} placeholder="MLBB" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Sale Price</label>
                                <input type="text" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="₹149" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Original Price</label>
                                <input type="text" value={newItem.originalPrice} onChange={(e) => setNewItem({...newItem, originalPrice: e.target.value})} placeholder="₹170" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Link Slug</label>
                                <input type="text" value={newItem.slug} onChange={(e) => setNewItem({...newItem, slug: e.target.value})} placeholder="mobile-legends114" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Image URL</label>
                                <input type="text" value={newItem.image} onChange={(e) => setNewItem({...newItem, image: e.target.value})} placeholder="/game-assets/1.jpg" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">Badge (Optional)</label>
                                <input type="text" value={newItem.badge} onChange={(e) => setNewItem({...newItem, badge: e.target.value})} placeholder="Hot Deal" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[var(--muted)]">% Sold</label>
                                <input type="number" min="0" max="100" value={newItem.sold} onChange={(e) => setNewItem({...newItem, sold: Number(e.target.value)})} placeholder="80" className="w-full px-3 py-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] focus:border-amber-500 rounded-lg text-xs text-[var(--foreground)] focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button 
                                onClick={saveItem}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                                <FiPlus size={13} /> 
                                <span>{editingIndex !== null ? "Update Item" : "Save Item"}</span>
                            </button>
                        </div>
                    </div>
                )}

                {config.items.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-2xl">
                        No items added yet. Click &quot;Add Item&quot; above to create one.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {config.items.map((item, index) => (
                            <div 
                                key={index} 
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                    editingIndex === index 
                                        ? "border-amber-500 bg-amber-500/5 shadow-xs" 
                                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/20"
                                }`}
                            >
                                {/* Image */}
                                <div className="w-12 h-12 shrink-0 bg-[var(--foreground)]/[0.04] rounded-lg overflow-hidden border border-[var(--border)]">
                                    <img 
                                        src={item.image || "/placeholder.png"} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }} 
                                    />
                                </div>
                                
                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{item.name || "Unnamed"}</h4>
                                        {item.badge && (
                                            <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[8px] font-black rounded uppercase shrink-0">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[var(--muted)] truncate mt-0.5">
                                        {item.game} • {item.slug}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-extrabold text-[var(--foreground)]">{item.price}</span>
                                        {item.originalPrice && (
                                            <span className="text-[10px] text-[var(--muted)] line-through">{item.originalPrice}</span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button 
                                        onClick={() => handleEdit(index)}
                                        className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Edit Item"
                                    >
                                        <FiEdit2 size={13} />
                                    </button>
                                    <button 
                                        onClick={() => removeItem(index)}
                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Remove Item"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
