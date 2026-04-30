"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

const Analytics = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [productivitySummary, setProductivitySummary] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState('Month'); // 'Week', 'Month', 'Yearly'

  useEffect(() => {
    fetchSchedules();
    fetchProductivitySummary();
  }, [timeFilter]);

  const formatDuration = (seconds: number) => {
    if (!seconds && seconds !== 0) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  };

  const fetchProductivitySummary = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/summary`);
      const data = await res.json();
      setProductivitySummary(data);
    } catch (err) {
      console.error("Failed to fetch productivity summary", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      // Ideally, the API would have endpoints for week/yearly, but we fetch the month by default or conditionally.
      // Assuming typical logic:
      let query = `?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`;
      if (timeFilter === 'Yearly') query = `?year=${currentDate.getFullYear()}`; // Example dynamic query

      const res = await fetch(`${apiUrl}/schedules${query}`);
      let data = await res.json();
      
      // Simple client-side filtering for Week for demonstration
      if (timeFilter === 'Week') {
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        data = data.filter((s: any) => new Date(s.date) >= startOfWeek);
      }

      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    }
  };

  const receivedCount = schedules.filter(s => s.callStatus === 'RECEIVED').length;
  const stoppedCount = schedules.filter(s => s.callStatus === 'STOPPED').length;
  const cancelledCount = schedules.filter(s => s.callStatus === 'CANCELLED').length;
  const unusedCount = schedules.filter(s => s.callStatus === 'CALLING' || !s.callStatus).length;

  const totalCount = schedules.length;
  const completionRate = totalCount > 0 ? Math.round((receivedCount / totalCount) * 100) : 0;

  // Filter Logic Data Generation
  let activeChartData: any[] = [];

  if (timeFilter === 'Yearly') {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    activeChartData = monthNames.map((month, index) => {
      const monthSchedules = schedules.filter(s => new Date(s.date).getMonth() === index);
      const completedCount = monthSchedules.filter(s => s.callStatus === 'RECEIVED').length;
      const uncompletedCount = monthSchedules.filter(s => s.callStatus === 'CANCELLED' || s.callStatus === 'STOPPED').length;
      return { name: month, Total: monthSchedules.length, Completed: completedCount, Uncompleted: uncompletedCount };
    });
  } else if (timeFilter === 'Week') {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    
    activeChartData = dayNames.map((day, index) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + index);
      const daySchedules = schedules.filter(s => new Date(s.date).toDateString() === targetDate.toDateString());
      const completedCount = daySchedules.filter(s => s.callStatus === 'RECEIVED').length;
      const uncompletedCount = daySchedules.filter(s => s.callStatus === 'CANCELLED' || s.callStatus === 'STOPPED').length;
      return { name: day, Total: daySchedules.length, Completed: completedCount, Uncompleted: uncompletedCount };
    });
  } else {
    // Default: Month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    activeChartData = Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const dailySchedules = schedules.filter(s => new Date(s.date).getDate() === day);
      const completedCount = dailySchedules.filter(s => s.callStatus === 'RECEIVED').length;
      const uncompletedCount = dailySchedules.filter(s => s.callStatus === 'CANCELLED' || s.callStatus === 'STOPPED').length;
      return { name: `${day}`, Total: dailySchedules.length, Completed: completedCount, Uncompleted: uncompletedCount };
    });
  }
  const barData = [
    { name: 'Total', value: totalCount, fill: '#3b82f6' },
    { name: 'Completed', value: receivedCount, fill: '#22c55e' },
    { name: 'Uncompleted', value: cancelledCount + stoppedCount, fill: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40 -z-10"></div>
          <p className="text-white font-bold mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.payload.fill || '#fff' }} className="text-sm font-bold flex items-center justify-between gap-6 mb-1 drop-shadow-md">
              <span>{entry.name}</span>
              <span>{entry.name === 'Total' || entry.name === 'Completed' || entry.name === 'Uncompleted' ? entry.value : formatDuration(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ml-64 p-8 min-h-screen">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          <p className="text-gray-400 mt-2">Comprehensive data analysis and operational metrics.</p>
        </div>
        
        {/* Filter Dropdown */}
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-[#11141b] border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
        >
          <option value="Week">This Week</option>
          <option value="Month">This Month</option>
          <option value="Yearly">This Year</option>
        </select>
      </header>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="metric-card group relative overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
            <Activity size={64} className="text-blue-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity size={24} className="text-blue-500" />
            </div>
            {totalCount > 0 && <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-lg text-gray-300">Filtered</span>}
          </div>
          <p className="text-gray-400 font-medium text-sm">Total Schedules</p>
          <h3 className="text-3xl font-black mt-1">{totalCount}</h3>
        </div>

        <div className="metric-card group relative overflow-hidden border border-white/5 hover:border-green-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
            <CheckCircle2 size={64} className="text-green-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">{completionRate}% Rate</span>
          </div>
          <p className="text-gray-400 font-medium text-sm">Completed Calls</p>
          <h3 className="text-3xl font-black mt-1 text-green-400">{receivedCount}</h3>
        </div>

        <div className="metric-card group relative overflow-hidden border border-white/5 hover:border-red-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
            <XCircle size={64} className="text-red-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <XCircle size={24} className="text-red-500" />
            </div>
          </div>
          <p className="text-gray-400 font-medium text-sm">Failed / Cancelled</p>
          <h3 className="text-3xl font-black mt-1 text-red-500">{cancelledCount}</h3>
        </div>

        <div className="metric-card group relative overflow-hidden border border-white/5 hover:border-yellow-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
            <Clock size={64} className="text-yellow-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Clock size={24} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-gray-400 font-medium text-sm">Pending / Stopped</p>
          <h3 className="text-3xl font-black mt-1 text-yellow-500">{unusedCount + stoppedCount}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Main Monthly Trend Area Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-xl">
          <h2 className="text-xl font-bold mb-8">Scheduling Trend ({timeFilter})</h2>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDailyTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDailyCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDailyUncompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} dy={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={(v) => formatDuration(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDailyTotal)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Completed" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorDailyCompleted)" activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Uncompleted" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorDailyUncompleted)" activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Distribution Bar Chart */}
        <div className="glass rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-xl flex flex-col">
          <h2 className="text-xl font-bold mb-8">Status Composition</h2>
          <div className="w-full h-[350px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} dy={15} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Productivity & AI Coach Section */}
      <div className="grid grid-cols-1 mb-10">
        
        {/* Productivity Distribution Bar Chart */}
        <div className="glass rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Productivity Distribution</h2>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs text-gray-400">Study</span>
              <span className="w-3 h-3 rounded-full bg-red-500 ml-2"></span>
              <span className="text-xs text-gray-400">Fun</span>
            </div>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivitySummary?.categoryDistribution || []} layout="vertical" margin={{ left: 40, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} width={100} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="duration" radius={[0, 4, 4, 0]}>
                  {(productivitySummary?.categoryDistribution || []).map((entry: any, index: number) => {
                    const colors: Record<string, string> = {
                      'Development': '#3b82f6',
                      'Entertainment': '#ef4444',
                      'Web Browsing': '#38bdf8',
                      'Social': '#f97316',
                      'Communication': '#8b5cf6',
                      'Idle / Away': '#6b7280'
                    };
                    return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#ffffff20'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tracking List */}
        <div className="glass rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-xl mt-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Recent Tracking Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Application</th>
                  <th className="px-4 py-3">Activity Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productivitySummary?.recentLogs?.length > 0 ? (
                  productivitySummary.recentLogs.map((log: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white">{log.applicationName}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-[200px]">{log.windowTitle}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/5 text-gray-300">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-primary font-bold">{formatDuration(log.duration)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-600 italic">No recent logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


      </div>

      {!productivitySummary && (
        <div className="glass p-10 rounded-2xl border border-primary/20 text-center mb-10">
          <h3 className="text-2xl font-bold mb-4">Track your PC time automatically! 🚀</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">To see your study vs entertainment data and get AI coaching, run this command in your computer's terminal to install the background tracker:</p>
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4 font-mono text-sm group">
            <span className="text-primary truncate">curl -sL http://localhost:5000/api/v1/productivity/installer | bash</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText('curl -sL http://localhost:5000/api/v1/productivity/installer | bash');
                alert('Command copied to clipboard!');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap"
            >
              Copy Command
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Analytics;
