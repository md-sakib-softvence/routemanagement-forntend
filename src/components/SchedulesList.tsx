"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ArrowLeft, Trash2, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const SchedulesList = ({ onBack }: { onBack: () => void }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/schedules`);
      const data = await res.json();
      // Sort by date descending
      setSchedules(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mission?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'ALL' || s.callStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ml-64 p-10 min-h-screen relative overflow-hidden bg-[#0a0c10]">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

      <header className="flex justify-between items-end mb-16 relative z-10">
        <div className="animate-in slide-in-from-left duration-1000">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[3px] mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/20"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Mission <span className="text-primary italic relative">Archive
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary/30 blur-sm"></span>
            </span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] opacity-70">
            Secure Historical Log Repository // Authorized Personnel Only
          </p>
        </div>

        <div className="flex gap-4 animate-in slide-in-from-right duration-1000">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="QUERY MISSION DATABASE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-8 text-[10px] font-black tracking-widest text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all w-80 placeholder:text-gray-700"
            />
          </div>

          <div className="relative group">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 text-xs text-gray-400 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all">
              <Filter size={16} className="text-primary" />
              <span className="font-black uppercase tracking-[2px] text-[10px]">{filterStatus}</span>
            </div>
            <div className="absolute right-0 top-full mt-3 w-56 bg-[#0f1116]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {['ALL', 'PLANNED', 'COMPLETED', 'CANCELLED', 'STOPPED'].map(status => (
                <div
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-8 py-4 text-[10px] font-black tracking-widest transition-colors cursor-pointer border-b border-white/5 last:border-0 ${filterStatus === status ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="glass rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-1000">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-[4px] font-black border-b border-white/5">
              <th className="px-12 py-10 font-black">Identity & Status</th>
              <th className="px-12 py-10 font-black">Temporal Signature</th>
              <th className="px-12 py-10 font-black">Mission Objective</th>
              <th className="px-12 py-10 text-right font-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((s, i) => (
                <tr
                  key={i}
                  className="hover:bg-white/[0.01] transition-all cursor-default group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="px-12 py-10">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black tracking-[3px] uppercase relative overflow-hidden ${s.callStatus === 'COMPLETED' || s.callStatus === 'RECEIVED'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : s.callStatus === 'CANCELLED' || s.callStatus === 'STOPPED'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-primary/10 text-primary border border-primary/20 animate-pulse'
                          }`}>
                          {s.callStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                        <span className="text-[10px] font-bold text-gray-600 font-mono tracking-tighter">SIG_{s.id.split('-')[0].toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-black text-white tracking-tight">{new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-primary/50" />
                        <span className="text-xs font-bold text-gray-500 tracking-widest italic">{new Date(s.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10 max-w-xl">
                    <div className="relative">
                      <div className="text-2xl font-black text-white group-hover:text-primary transition-all duration-500 tracking-tight leading-none mb-3">
                        {s.title}
                      </div>
                      {s.description && (
                        <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="w-12 h-12 rounded-2xl bg-red-500/5 text-red-500/40 flex items-center justify-center hover:bg-red-500 transition-all hover:text-white hover:scale-110 border border-transparent hover:border-red-400/50 shadow-lg shadow-transparent hover:shadow-red-500/20"
                        title="REDACT FROM DATABASE"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-12 py-32 text-center">
                  <div className="flex flex-col items-center gap-6 opacity-30 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                      <Search size={40} className="text-gray-500" />
                    </div>
                    <p className="text-2xl font-black text-gray-500 tracking-tighter uppercase italic">No Matches In Vault</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center opacity-20 relative z-10">
        <p className="text-[9px] font-black text-gray-500 tracking-[10px] uppercase">Routing Management System // High Security Archive</p>
      </div>

      <div className="fixed bottom-0 right-0 p-20 pointer-events-none -z-10 opacity-[0.03]">
        <Calendar size={600} strokeWidth={0.2} className="rotate-12" />
      </div>
    </div>
  );
};

export default SchedulesList;
