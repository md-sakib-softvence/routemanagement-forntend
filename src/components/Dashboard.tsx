"use client";

import React from 'react';

const Dashboard = () => {
  const metrics = [
    { label: 'Alerts Triggered', value: '29', trend: '+8%', color: 'text-primary' },
    { label: 'Active Routers', value: '1,482', sub: '1,481 Online', color: 'text-accent' },
    { label: 'System Uptime', value: '99.98%', sub: '34 Days 12h', color: 'text-green-400' },
    { label: 'Avg. Response Time', value: '42ms', trend: '-1.2%', color: 'text-purple-400' },
  ];

  const alerts = [
    { id: '101', timestamp: '14:31:02', device: 'RT-NY-CORE1', type: 'High BGP Latency', severity: 'CRITICAL', status: 'UNACKNOWLEDGED' },
    { id: '102', timestamp: '14:31:02', device: 'RT-NY-CORE1', type: 'High BGP Latency', severity: 'MAJOR', status: 'UNACKNOWLEDGED' },
    { id: '103', timestamp: '14:31:02', device: 'RT-NY-CORE1', type: 'High BGP Latency', severity: 'ACTIVE', status: 'ACKNOWLEDGED' },
  ];

  return (
    <div className="ml-64 p-8 min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Hi, Md Sakib Al Hasan 👋</h1>
          <p className="text-gray-400">Welcome back to the Routing Control Panel.</p>
        </div>
        <div className="flex gap-4">
          <input type="text" placeholder="Search..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-primary w-64" />
          <button className="bg-primary hover:bg-primary/80 transition-colors px-6 py-2 rounded-lg font-medium">+ Add Router</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="metric-card">
            <span className="metric-label">{m.label}</span>
            <div className="flex items-baseline gap-3">
              <span className={`metric-value ${m.color}`}>{m.value}</span>
              {m.trend && <span className="text-sm font-medium text-green-400">{m.trend}</span>}
            </div>
            {m.sub && <span className="text-xs text-gray-500 mt-1">{m.sub}</span>}
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-8 mb-10 overflow-hidden">
        <h2 className="text-xl font-bold mb-6">Network Traffic - Real-Time (Last 24h)</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
          <p className="text-gray-500">[ Interactive Traffic Chart - Simulating Data ]</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold">Current Alerts</h2>
          <button className="text-gray-400 hover:text-white transition-colors text-sm font-medium">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Device</th>
              <th className="px-6 py-4">Alert Type</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {alerts.map((a, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-gray-400">{a.id}</td>
                <td className="px-6 py-4">{a.timestamp}</td>
                <td className="px-6 py-4">{a.device}</td>
                <td className="px-6 py-4">{a.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : a.severity === 'MAJOR' ? 'bg-orange-500/20 text-orange-500' : 'bg-primary/20 text-primary'}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-400">{a.status}</td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:underline text-sm font-medium">Acknowledge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
