"use client";

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart2,
  ChevronRight,
  Clock,
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ProductivityReport {
  id: string;
  title: string;
  content: string;
  type: 'DAILY' | 'WEEKLY';
  date: string;
}

const ProductivityReports = () => {
  const [reports, setReports] = useState<ProductivityReport[]>([]);
  const [latestReport, setLatestReport] = useState<ProductivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/reports`);
      const data = await res.json();
      setReports(data);
      if (data.length > 0 && !latestReport) {
        setLatestReport(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const [cooldown, setCooldown] = useState(0);

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
        setCooldown(60);
      } else if (res.status === 429) {
        alert("Rate limit reached. Please wait 1 minute.");
        setCooldown(30);
      }
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWeeklyAudit = async () => {
    if (cooldown > 0) return;
    setIsGeneratingWeekly(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/reports/weekly`, { method: 'POST' });
      if (res.ok) {
        await fetchReports();
        setCooldown(60);
      } else if (res.status === 429) {
        alert("Rate limit reached. Please wait 1 minute.");
        setCooldown(30);
      }
    } catch (err) {
      console.error("Failed to generate weekly report", err);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const selectReport = (report: ProductivityReport) => {
    setLatestReport(report);
  };

  const parseSections = (content: string) => {
    const sections = {
      dataCoverage: '',
      primaryGoal: '',
      improvement: '',
      wrongs: '',
      howTo: ''
    };

    const parts = content.split(/###\s+/);
    parts.forEach(part => {
      if (part.startsWith('DATA COVERAGE')) {
        sections.dataCoverage = part.replace('DATA COVERAGE', '').trim();
      } else if (part.startsWith('PRIMARY GOAL FOR TOMORROW')) {
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

  const reportSections = latestReport ? parseSections(latestReport.content) as any : null;

  const weeklyReports = reports.filter(r => r.type === 'WEEKLY');
  const dailyReports = reports.filter(r => r.type === 'DAILY');

  return (
    <div className="ml-64 p-8 min-h-screen bg-[#0a0c10]">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Audit Archive</h1>
          <p className="text-gray-500 mt-2 font-medium">Historical logs of your performance and coaching cycles.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={generateWeeklyAudit}
            disabled={isGeneratingWeekly || cooldown > 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isGeneratingWeekly || cooldown > 0 ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-primary hover:bg-primary/80 shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)]'}`}
          >
            {isGeneratingWeekly ? <RefreshCw size={20} className="animate-spin" /> : <BarChart2 size={20} />}
            {isGeneratingWeekly ? 'Syncing Week...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Analysis Weekly'}
          </button>
        </div>
      </header>



      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 opacity-50">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Consulting your history...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/5 text-center max-w-2xl mx-auto mt-20">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">🎯</div>
          <h2 className="text-2xl font-bold mb-4">Awaiting Data Sync</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">Connect your behavior logs and schedule to unlock the AI coach.</p>
          <button
            onClick={generateWeeklyAudit}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors"
          >
            Generate Weekly Audit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* History Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Audit History</h3>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 no-scrollbar">
                {reports
                  .filter(r => r.type === 'WEEKLY')
                  .map((report) => (
                    <div
                      key={report.id}
                      onClick={() => selectReport(report)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${latestReport?.id === report.id ? 'bg-blue-500/15 border-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      <p className={`text-xs font-bold ${latestReport?.id === report.id ? 'text-blue-400' : 'text-gray-300'}`}>{report.title}</p>
                      <p className="text-[9px] text-gray-500 mt-1 font-bold opacity-60">
                        {report.type} • {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Main Analysis View */}
          <div className="lg:col-span-3">
            {latestReport && reportSections && (
              <div className="space-y-8 animate-fade-in pb-20">

                {/* PRIMARY GOAL SECTION: High Visibility Card */}
                <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-r from-primary via-blue-500 to-purple-500 shadow-2xl shadow-primary/20">
                  <div className="bg-[#0e1117] rounded-[2.4rem] p-10 flex flex-col items-center text-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary rounded-full text-[10px] font-black uppercase tracking-[3px] text-white shadow-lg">
                      Main Objective
                    </div>
                    <div className="mb-6 p-4 bg-primary/20 rounded-full text-primary ring-4 ring-primary/10">
                      <CheckCircle size={32} />
                    </div>
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight">
                        {reportSections.primaryGoal.replace(/^[*\s]+|[*\s]+$/g, '')}
                      </h2>
                      <p className="text-gray-500 font-medium italic">"Your brain has captured the target. Execute tomorrow with zero excuses."</p>
                    </div>
                  </div>
                </div>

                {/* Data Coverage Section (New) */}
                {reportSections.dataCoverage && (
                  <div className="glass rounded-[2rem] border border-white/10 p-6 bg-white/5 flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl text-gray-400">
                      <BarChart2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-1">Data Intelligence Coverage</h3>
                      <p className="text-gray-300 font-medium">{reportSections.dataCoverage}</p>
                    </div>
                  </div>
                )}

                {/* Header Section: Weekly Improvement */}
                <div className="glass rounded-[2rem] border border-blue-500/20 p-8 bg-gradient-to-r from-blue-500/5 to-transparent relative overflow-hidden transition-all hover:bg-blue-500/10">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={80} className="text-blue-500" />
                  </div>
                  <h3 className="text-xs font-black text-blue-500 uppercase tracking-[2px] mb-4">Performance Velocity</h3>
                  <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-white">
                    <ReactMarkdown>{reportSections.improvement}</ReactMarkdown>
                  </div>
                </div>

                {/* Split Section: Wrongs (Right) and How to Improve (Left) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                  {/* Left Side: How to Improve */}
                  <div className="glass rounded-[2rem] border border-green-500/20 p-10 bg-gradient-to-br from-green-500/10 to-transparent relative group">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-green-500/20 rounded-2xl text-green-500 ring-4 ring-green-500/10 transition-transform group-hover:scale-110">
                        <CheckCircle size={28} />
                      </div>
                      <h3 className="text-2xl font-black text-white">The Execution Plan</h3>
                    </div>
                    <div className="prose prose-invert max-w-none 
                      prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-6
                      prose-li:text-gray-300 prose-li:mb-4 prose-li:leading-[1.6]
                      prose-strong:text-white prose-strong:font-black
                      prose-headings:text-white prose-headings:mb-6
                      prose-ul:list-disc prose-ul:pl-6
                      [&_li::marker]:text-green-500 [&_li::marker]:text-xl
                    ">
                      <ReactMarkdown>{reportSections.howTo}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Right Side: What You Are Doing Wrong */}
                  <div className="glass rounded-[2rem] border border-red-500/20 p-10 bg-gradient-to-br from-red-500/10 to-transparent relative group">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-red-500/20 rounded-2xl text-red-500 ring-4 ring-red-500/10 transition-transform group-hover:scale-110">
                        <AlertCircle size={28} />
                      </div>
                      <h3 className="text-2xl font-black text-white">The Audit (Wrongs)</h3>
                    </div>
                    <div className="prose prose-invert max-w-none 
                      prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-6
                      prose-li:text-gray-300 prose-li:mb-4 prose-li:leading-[1.6]
                      prose-strong:text-white prose-strong:font-black
                      prose-headings:text-white prose-headings:mb-6
                      prose-ul:list-disc prose-ul:pl-6
                      [&_li::marker]:text-red-500 [&_li::marker]:text-xl
                    ">
                      <ReactMarkdown>{reportSections.wrongs}</ReactMarkdown>
                    </div>
                  </div>

                </div>

                <footer className="text-center p-8 bg-white/5 rounded-2xl border border-white/5 opacity-50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  <p className="text-xs italic text-gray-400 font-medium relative z-10">"Discipline is the bridge between goals and accomplishment."</p>
                </footer>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityReports;
