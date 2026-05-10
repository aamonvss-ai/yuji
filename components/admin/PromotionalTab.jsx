"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Search,
  Plus,
  Mail,
  Type,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Database,
  RefreshCw,
  Eye,
  Trash2,
  ArrowRight
} from "lucide-react";

const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
  }
`;

export default function PromotionalTab() {
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [history, setHistory] = useState([]);

  const [composer, setComposer] = useState({
    subject: "",
    header: "",
    bannerUrl: "",
    message: "",
  });

  const [stats, setStats] = useState({
    sentToday: 0,
    reach: 0,
    external: 0,
    database: 0
  });

  useEffect(() => {
    fetchRecipients();
    fetchHistory();
  }, []);

  const fetchRecipients = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promotional/sync", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecipients(data.data);
        setStats(prev => ({
          ...prev,
          database: data.data.length,
          reach: data.data.length
        }));
      }
    } finally {
      setSyncing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promotional/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        // Calculate sent today
        const today = new Date().toDateString();
        const sentToday = data.data
          .filter(c => new Date(c.createdAt).toDateString() === today)
          .reduce((acc, c) => acc + c.successCount, 0);
        setStats(prev => ({ ...prev, sentToday }));
      }
    } catch (err) {}
  };

  const filteredRecipients = recipients.filter(r => {
    const username = r.username || "";
    const email = r.email || "";
    const type = r.type || "";

    const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "ALL" || type.toUpperCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id) => {
    setSelectedRecipients(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map(r => r.id));
    }
  };

  const handleSend = async () => {
    if (!composer.subject || !composer.message || selectedRecipients.length === 0) {
      alert("Please fill in all fields and select at least one recipient.");
      return;
    }

    if (!confirm(`Are you sure you want to send this email to ${selectedRecipients.length} users?`)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promotional/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...composer,
          recipients: recipients.filter(r => selectedRecipients.includes(r.id))
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setComposer({ subject: "", header: "", bannerUrl: "", message: "" });
        setSelectedRecipients([]);
        fetchHistory();
      } else {
        alert(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (campaign) => {
    setComposer({
      subject: campaign.subject,
      header: campaign.header,
      bannerUrl: campaign.bannerUrl,
      message: campaign.message
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <style>{scrollbarStyle}</style>
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase italic">
            Promotional <span className="text-[var(--accent)]">Hub</span>
          </h1>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">
            Advanced Audience Segmentation & Automated Delivery
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="SENT TODAY" value={stats.sentToday} icon={<Send className="text-emerald-500" />} />
          <StatCard label="REACH" value={stats.reach} icon={<Users className="text-orange-500" />} />
          <StatCard label="EXTERNAL" value={stats.external} icon={<ExternalLink className="text-blue-500" />} />
          <StatCard label="DATABASE" value={stats.database} icon={<Database className="text-purple-500" />} />
          
          <button 
            onClick={fetchRecipients}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            SYNC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECIPIENTS LIST */}
        <div className="lg:col-span-4 flex flex-col h-[600px] bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--foreground)]/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[var(--accent)]" />
                <h3 className="text-xs font-black uppercase tracking-widest">Recipients ({selectedRecipients.length})</h3>
              </div>
              <button 
                onClick={selectAll}
                className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline"
              >
                {selectedRecipients.length === filteredRecipients.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {["ALL", "USER", "ADMIN", "OWNER", "EXTERNAL"].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all
                    ${filterType === type ? "bg-[var(--accent)] text-white" : "bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)]"}
                  `}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
              <input 
                type="text"
                placeholder="Search username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-xs outline-none focus:border-[var(--accent)]/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredRecipients.map(user => (
              <div 
                key={user.id}
                onClick={() => toggleSelect(user.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                  ${selectedRecipients.includes(user.id) 
                    ? "bg-[var(--accent)]/10 border-[var(--accent)]/30" 
                    : "bg-transparent border-transparent hover:bg-[var(--foreground)]/5"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs
                    ${selectedRecipients.includes(user.id) ? "bg-[var(--accent)] text-white" : "bg-[var(--foreground)]/5 text-[var(--muted)]"}
                  `}>
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">{user.username || "Unknown"}</p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">{user.email || "No Email"}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                  ${selectedRecipients.includes(user.id) ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]"}
                `}>
                  {selectedRecipients.includes(user.id) && <CheckCircle2 size={10} className="text-white" />}
                </div>
              </div>
            ))}
            {filteredRecipients.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[var(--muted)] opacity-50">
                <Users size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No Records</p>
              </div>
            )}
          </div>
        </div>

        {/* COMPOSER */}
        <div className="lg:col-span-8 flex flex-col h-[600px] bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--foreground)]/[0.02] flex items-center gap-2">
            <Mail size={16} className="text-[var(--accent)]" />
            <h3 className="text-xs font-black uppercase tracking-widest">Email Composer</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Subject</label>
                  <div className="relative">
                    <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input 
                      type="text"
                      placeholder="Summer Promotion..."
                      value={composer.subject}
                      onChange={(e) => setComposer({...composer, subject: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-sm font-bold outline-none focus:border-[var(--accent)]/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Body Header</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input 
                      type="text"
                      placeholder="Hey there!"
                      value={composer.header}
                      onChange={(e) => setComposer({...composer, header: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-sm font-bold outline-none focus:border-[var(--accent)]/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Banner URL</label>
                  <div className="relative">
                    <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={composer.bannerUrl}
                      onChange={(e) => setComposer({...composer, bannerUrl: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-sm font-bold outline-none focus:border-[var(--accent)]/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Message</label>
                  <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-tighter">HTML Supported</span>
                </div>
                <textarea 
                  placeholder="Your promotional message here..."
                  value={composer.message}
                  onChange={(e) => setComposer({...composer, message: e.target.value})}
                  className="w-full h-[220px] p-4 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-2xl text-sm font-medium outline-none focus:border-[var(--accent)]/50 transition-all resize-none"
                />
              </div>
            </div>

            {/* PREVIEW BUTTONS */}
            <div className="flex gap-4">
              <button className="flex-1 py-3 px-6 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] text-xs font-black uppercase tracking-widest hover:bg-[var(--foreground)]/10 transition-all">
                Preview
              </button>
              <button 
                onClick={handleSend}
                disabled={loading || selectedRecipients.length === 0}
                className="flex-[2] py-3 px-6 rounded-2xl bg-[var(--accent)] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    SEND TO {selectedRecipients.length} USERS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--foreground)]/[0.02] flex items-center gap-2">
          <Clock size={16} className="text-[var(--accent)]" />
          <h3 className="text-xs font-black uppercase tracking-widest">History</h3>
        </div>
        
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest border-b border-[var(--border)]">
                <th className="pb-4 px-4">Subject</th>
                <th className="pb-4 px-4">Recipients</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4">Sent At</th>
                <th className="pb-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {history.map(item => (
                <tr key={item._id} className="text-xs font-bold hover:bg-[var(--foreground)]/[0.02] transition-all">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      {item.subject}
                    </div>
                    <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5 ml-4">By {item.sentBy}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-emerald-500">{item.successCount} OK</span>
                      <span className="text-red-500">{item.errorCount} ERR</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase
                      ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[var(--muted)]">
                    {new Date(item.createdAt).toLocaleDateString()}
                    <p className="text-[10px] opacity-50">{new Date(item.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => useTemplate(item)}
                      className="px-3 py-1 rounded-lg bg-[var(--foreground)]/5 text-[10px] font-black uppercase hover:bg-[var(--accent)] hover:text-white transition-all"
                    >
                      USE
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-[var(--muted)] opacity-50">
                    <Clock size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No History</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col gap-2 min-w-[120px] shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--foreground)]/5" />
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <span className="text-lg font-black text-[var(--foreground)] leading-none">{value}</span>
    </div>
  );
}
