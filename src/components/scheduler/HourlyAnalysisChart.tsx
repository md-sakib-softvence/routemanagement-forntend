import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export const HourlyAnalysisChart = ({ schedules }: { schedules: any[] }) => {
  const chartData = Array.from({ length: 24 }).map((_, i) => {
    const displayHour = i === 0 ? '12:00 AM' : i < 12 ? `${i.toString().padStart(2, '0')}:00 AM` : i === 12 ? '12:00 PM' : `${(i - 12).toString().padStart(2, '0')}:00 PM`;
    const schedulesInHour = schedules.filter(s => {
      const date = new Date(s.date);
      return date.getHours() === i;
    });

    const receivedCount = schedulesInHour.filter(s => s.callStatus === 'RECEIVED').length;
    const failedCount = schedulesInHour.filter(s => s.callStatus === 'CANCELLED' || s.callStatus === 'STOPPED').length;

    return {
      hour: displayHour,
      Total: schedulesInHour.length > 0 ? 100 : 0,
      Completed: schedulesInHour.length > 0 ? Math.round((receivedCount / schedulesInHour.length) * 100) : 0,
      Uncompleted: schedulesInHour.length > 0 ? Math.round((failedCount / schedulesInHour.length) * 100) : 0,
      _RawTotal: schedulesInHour.length,
      _RawCompleted: receivedCount,
      _RawUncompleted: failedCount
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40 -z-10"></div>
          <p className="text-white font-bold mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm font-bold flex items-center justify-between gap-6 mb-1 drop-shadow-md">
              <span>{entry.name}</span>
              <span>{entry.value}% <span className="text-xs opacity-70">({entry.payload[`_Raw${entry.name}`]})</span></span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-10 glass p-8 rounded-3xl border border-white/5 relative z-10 w-full overflow-hidden">
      <h3 className="text-xl font-extrabold mb-8 drop-shadow-md">Hourly Spline Analysis</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUncompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="hour" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} dy={15} axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} />
            <YAxis 
              stroke="#9ca3af" 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              axisLine={false} 
              tickLine={false} 
              allowDecimals={false} 
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              tickFormatter={(value) => `${value}%`}
              width={45}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
            <Area type="monotone" dataKey="Completed" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorCompleted)" />
            <Area type="monotone" dataKey="Uncompleted" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorUncompleted)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-8 mt-8">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div><span className="text-sm font-bold text-gray-400">Total</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div><span className="text-sm font-bold text-gray-400">Completed</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div><span className="text-sm font-bold text-gray-400">Uncompleted</span></div>
      </div>
    </div>
  );
};
