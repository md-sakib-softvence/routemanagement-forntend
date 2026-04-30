import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, CheckCircle, AlertCircle, Clock, Zap, Activity, Server, ShieldCheck, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ setActiveView }: { setActiveView: (v: string) => void }) => {
  const [stats, setStats] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [motivation, setMotivation] = useState("Your potential is infinite, Sakib. Let's build something legendary today.");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState('15d');

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

  useEffect(() => {
    checkProductivity();
    fetchStats(selectedRange);
    fetchMotivation();

    // Enable Real-time Polling (Every 30 seconds)
    const interval = setInterval(() => fetchStats(selectedRange), 30000);
    return () => clearInterval(interval);
  }, [selectedRange]);

  const fetchMotivation = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/summary`);
      if (res.ok) {
        const data = await res.json();
        // Use a fallback if the backend doesn't provide a specific daily quote yet
        // In a real scenario, this would come from the Gemini coaching engine
        if (data.coaching && data.coaching.length > 20) {
          setMotivation(data.coaching.split('.')[0] + '.');
        }
      }
    } catch (err) {
      console.error("Failed to fetch motivation", err);
    }
  };

  const fetchStats = async (range: string = '15d') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      // Fetch Dashboard Aggregates
      const statsRes = await fetch(`${apiUrl}/productivity/stats`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      // Fetch Trend Data with Range
      const summaryRes = await fetch(`${apiUrl}/productivity/summary?range=${range}`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const now = new Date();
        const length = range === '7d' ? 7 : range === '15d' ? 15 : range === '30d' ? 30 : 12;

        const processedTrend = Array.from({ length }).map((_, i) => {
          const d = new Date(now);
          if (range === '1y') {
            d.setMonth(d.getMonth() - (length - 1 - i));
            const monthKey = d.toISOString().substring(0, 7);
            const match = summaryData.dailyTrend.find((dt: any) => dt.date === monthKey);
            return {
              date: d.toLocaleDateString('en-US', { month: 'long' }),
              studySeconds: match ? match.Study : 0
            };
          } else {
            d.setDate(d.getDate() - (length - 1 - i));
            const dateKey = d.toISOString().split('T')[0];
            const match = summaryData.dailyTrend.find((dt: any) => dt.date === dateKey);
            return {
              date: range === '7d'
                ? d.toLocaleDateString('en-US', { weekday: 'short' })
                : d.getDate().toString(),
              studySeconds: match ? match.Study : 0
            };
          }
        });
        setTrendData(processedTrend);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const checkProductivity = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/productivity/summary`);
      const data = await res.json();
      if (!data.totalLogs) {
        setShowSetup(true);
      }
    } catch (err) {
      console.error("Failed to check productivity", err);
    }
  };

  const metrics = [
    { label: 'Alerts Triggered', value: '29', trend: '+8%', color: 'text-primary' },
    { label: 'Active Routers', value: '1,482', sub: '1,481 Online', color: 'text-accent' },
    { label: 'System Uptime', value: '99.98%', sub: '34 Days 12h', color: 'text-green-400' },
    { label: 'Avg. Response Time', value: '42ms', trend: '-1.2%', color: 'text-purple-400' },
  ];


  return (
    <div className="ml-64 p-8 min-h-screen relative">
      {/* Productivity Tracker Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="glass max-w-2xl w-full p-10 rounded-3xl border border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="text-9xl font-black italic">TRACK</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl">🚀</div>
              <div>
                <h2 className="text-3xl font-black">Enable AI Productivity Monitoring</h2>
                <p className="text-gray-400">Transform your PC activities into actionable AI coaching insights.</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">1</span>
                  Automatic Installation (Linux)
                </h3>
                <p className="text-sm text-gray-400 mb-4 lh-relaxed">Open your system terminal and paste this command. It installs the background daemon and sets up automatic window tracking.</p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-sm flex items-center justify-between gap-4">
                  <code className="text-primary truncate">curl -sL http://localhost:5000/api/v1/productivity/installer | bash</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('curl -sL http://localhost:5000/api/v1/productivity/installer | bash');
                      alert('Copied to clipboard!');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">2</span>
                  Real-time AI Coaching
                </h3>
                <p className="text-sm text-gray-400">Once running, your "Analytics" page will populate with study vs fun hours, and Gemini will provide a custom plan for you.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSetup(false)}
                className="flex-1 py-4 px-6 bg-primary hover:bg-primary/80 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
              >
                Done / I'll do it later
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="animate-in slide-in-from-left duration-700">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 underline decoration-primary/30 decoration-4 underline-offset-8">
            Sakib <span className="text-primary italic">Al Hasan</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Command Center Online</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12 justify-center flex-1 mx-10 border-x border-white/5 py-2 animate-in fade-in zoom-in duration-1000">
          <div className="text-center group cursor-help">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[3px] block mb-1 group-hover:text-primary transition-colors">Efficiency Core</span>
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <Activity size={18} className="text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse"></div>
              </div>
              <span className="text-3xl font-black text-white leading-none">
                {stats ? Math.round((stats.studyTimeSeconds / (stats.totalTrackedSeconds || 1)) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="text-center group cursor-help">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[3px] block mb-1 group-hover:text-accent transition-colors">Session Pulse</span>
            <div className="flex items-center justify-center gap-3">
              <Clock size={18} className="text-accent" />
              <span className="text-3xl font-black text-white leading-none">
                {stats ? `${Math.floor(stats.studyTimeSeconds / 3600)}h ${Math.floor((stats.studyTimeSeconds % 3600) / 60)}m` : '0h 0m'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 bg-gradient-to-r from-primary/5 to-transparent max-w-md relative overflow-hidden group animate-in slide-in-from-right duration-700">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[3px] mb-1 block">Daily Insight</span>
              <p className="text-sm text-gray-200 font-medium leading-relaxed italic">
                "{motivation}"
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Productivity Intelligence Section */}

      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Network Infrastructure</h3>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-top duration-700">
          <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">Study Velocity</h4>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-blue-500">{formatDuration(stats.studyTimeSeconds)}</span>
              <BookOpen className="text-blue-500 opacity-20" size={32} />
            </div>
            <p className="text-[10px] text-gray-500 mt-4 font-bold opacity-60">Focus time is higher today</p>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">Recovery / Fun</h4>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-purple-500">{formatDuration(stats.funTimeSeconds)}</span>
              <Heart className="text-purple-500 opacity-20" size={32} />
            </div>
            <p className="text-[10px] text-gray-500 mt-4 font-bold opacity-60">Recharge balance maintained</p>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-green-500/10 to-transparent">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">Schedules Sync</h4>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-green-500">{stats.schedulesCompleted}</span>
              <CheckCircle className="text-green-500 opacity-20" size={32} />
            </div>
            <p className="text-[10px] text-gray-500 mt-4 font-bold opacity-60">Total Completed tasks</p>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">Uncompleted Debt</h4>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-red-500">{stats.schedulesUncompleted}</span>
              <Activity className="text-red-500 opacity-20" size={32} />
            </div>
            <p className="text-[10px] text-gray-500 mt-4 font-bold opacity-60">Pending action items</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-8 mb-10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <TrendingUp size={120} />
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Productivity velocity ({selectedRange === '7d' ? 'Weekly' : selectedRange === '30d' ? 'Monthly' : selectedRange === '1y' ? 'Yearly' : '15-Day'} Trend)
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Visualizing your daily focus performance</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Timeframe Switcher */}
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 mr-4">
              {[
                { label: '7D', value: '7d' },
                { label: '15D', value: '15d' },
                { label: '30D', value: '30d' },
                { label: '1Y', value: '1y' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-md transition-all ${selectedRange === range.value
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-500 hover:text-white'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/40 border border-primary"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Study Time</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => formatDuration(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 20, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any) => [formatDuration(value), 'Study Time']}
                cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Area
                type="monotone"
                dataKey="studySeconds"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorStudy)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-700 delay-300">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <CheckCircle size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Today's Mission Progress</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Real-time status of your scheduled tasks</p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('scheduleList')}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            View Scheduler
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Mission Title</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stats?.todaySchedules?.length > 0 ? (
              stats.todaySchedules.map((s: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${s.status === 'COMPLETED' || s.status === 'RECEIVED'
                        ? 'bg-green-500/20 text-green-500'
                        : s.status === 'CANCELLED' || s.status === 'STOPPED'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-primary/20 text-primary'
                      }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-400">{s.time}</td>
                  <td className="px-6 py-4 font-bold text-white">{s.title}</td>
                  <td className="px-6 py-4">
                    <button className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold italic">
                  No missions scheduled for today yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
