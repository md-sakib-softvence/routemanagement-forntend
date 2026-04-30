"use client";

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle, AlertCircle, Clock, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TodayReport = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        const daily = data.filter((r: any) => r.type === 'DAILY');
        if (daily.length > 0 && !report) {
          setReport(daily[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const generateReport = async () => {
    if (cooldown > 0) return;
    setIsGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/reports/generate`, { method: 'POST' });
      if (res.ok) {
        await fetchReports();
        await fetchStats();
        setCooldown(60);
      } else if (res.status === 429) {
        alert("Gemini Rate Limit reached. Please wait 1 minute.");
        setCooldown(30);
      }
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectReport = (r: any) => {
    setReport(r);
  };

  const parseSections = (content: string) => {
    const sections = {
      primaryGoal: '',
      improvement: '',
      wrongs: '',
      howTo: ''
    };

    const parts = content.split(/###\s+/);
    parts.forEach(part => {
      if (part.startsWith('PRIMARY GOAL FOR TOMORROW')) {
        sections.primaryGoal = part.replace('PRIMARY GOAL FOR TOMORROW', '').trim();
      } else if (part.startsWith('PREVIOUS WEEK IMPROVEMENT')) {
        sections.improvement = part.replace('PREVIOUS WEEK IMPROVEMENT', '').trim();
      } else if (part.startsWith('WHAT YOU ARE DOING WRONG')) {
        sections.wrongs = part.replace('WHAT YOU ARE DOING WRONG', '').trim();
      } else if (part.startsWith('HOW TO IMPROVE')) {
        sections.howTo = part.replace('HOW TO IMPROVE', '').trim();
      }
    });

    return sections;
  };

  const reportSections = report ? parseSections(report.content) : null;

  return (
    <div className="ml-64 p-8 min-h-screen bg-[#0a0c10]">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="text-primary" /> Today's Analysis
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Your real-time AI coach and performance auditor.</p>
        </div>
        <button
          onClick={generateReport}
          disabled={isGenerating || cooldown > 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isGenerating || cooldown > 0 ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-primary hover:bg-primary/80 shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)]'}`}
        >
          {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : cooldown > 0 ? <RefreshCw size={20} className="animate-pulse" /> : <Activity size={20} />}
          {isGenerating ? 'Analyzing...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Analysis Today'}
        </button>
      </header>

      {/* Statistical Dashboard */}


      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <RefreshCw size={40} className="text-primary animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Consulting AI Coach...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* History Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Daily History</h3>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 no-scrollbar">
                {reports
                  .filter(r => r.type === 'DAILY')
                  .map((r) => (
                    <div
                      key={r.id}
                      onClick={() => selectReport(r)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${report?.id === r.id ? 'bg-primary/15 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      <p className={`text-xs font-bold ${report?.id === r.id ? 'text-primary' : 'text-gray-300'}`}>{r.title}</p>
                      <p className="text-[9px] text-gray-500 mt-1 font-bold opacity-60">
                        DAILY • {new Date(r.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Main View */}
          <div className="lg:col-span-3">
            {reportSections ? (
              <div className="space-y-8 animate-in fade-in duration-700">
                {/* Main Objective Card */}
                <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 border border-white/10 p-12 text-center text-white">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary px-6 py-1 rounded-b-xl text-[10px] font-black tracking-[0.2em] uppercase text-black">
                    Daily Mission
                  </div>
                  <div className="mb-8 flex justify-center">
                    <div className="p-4 bg-primary/20 rounded-full text-primary ring-8 ring-primary/5">
                      <CheckCircle size={40} />
                    </div>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight max-w-4xl mx-auto">
                    "{reportSections.primaryGoal}"
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass rounded-[2rem] border border-green-500/20 p-10 bg-gradient-to-br from-green-500/10 to-transparent">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-green-500/20 rounded-2xl text-green-500 ring-4 ring-green-500/10">
                        <CheckCircle size={28} />
                      </div>
                      <h3 className="text-2xl font-black text-white">The Execution Plan</h3>
                    </div>
                    <div className="prose prose-invert max-w-none 
                prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-6
                prose-li:text-gray-300 prose-li:mb-4 prose-li:leading-[1.6]
                prose-strong:text-white prose-strong:font-black
                prose-ul:list-disc prose-ul:pl-6
                [&_li::marker]:text-green-500 [&_li::marker]:text-xl
              ">
                      <ReactMarkdown>{reportSections.howTo}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="glass rounded-[2rem] border border-red-500/20 p-10 bg-gradient-to-br from-red-500/10 to-transparent">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-red-500/20 rounded-2xl text-red-500 ring-4 ring-red-500/10">
                        <AlertCircle size={28} />
                      </div>
                      <h3 className="text-2xl font-black text-white">Behavior Auditor</h3>
                    </div>
                    <div className="prose prose-invert max-w-none 
                prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-6
                prose-li:text-gray-300 prose-li:mb-4 prose-li:leading-[1.6]
                prose-strong:text-white prose-strong:font-black
                prose-ul:list-disc prose-ul:pl-6
                [&_li::marker]:text-red-500 [&_li::marker]:text-xl
              ">
                      <ReactMarkdown>{reportSections.wrongs}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-white">
                <Activity size={80} className="text-gray-800" />
                <h2 className="text-2xl font-bold text-gray-400">Ready to start today's audit?</h2>
                <button onClick={generateReport} className="btn-primary px-10 py-4 rounded-2xl font-black text-lg">
                  GENERATE INITIAL SCAN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayReport;
