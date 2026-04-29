"use client";

import React from 'react';
import { Home, Settings, Bell, BarChart2, Users, LogOut, Calendar } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }: { activeView: string, setActiveView: (v: string) => void }) => {
  return (
    <div className="w-64 h-screen bg-[#11141b] border-r border-white/5 flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-4 py-6 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl">R</div>
        <span className="text-xl font-bold tracking-tight">ROUTING MGMT</span>
      </div>

      <nav className="flex-1 space-y-2">
        <div 
          onClick={() => setActiveView('overview')}
          className={`sidebar-link cursor-pointer ${activeView === 'overview' ? 'active' : ''}`}
        >
          <Home size={20} /> Overview
        </div>
        <div className="sidebar-link cursor-pointer"><Users size={20} /> Routers</div>
        <div className="sidebar-link cursor-pointer"><Bell size={20} /> Alerts</div>
        <div 
          onClick={() => setActiveView('analytics')}
          className={`sidebar-link cursor-pointer ${activeView === 'analytics' ? 'active' : ''}`}
        >
          <BarChart2 size={20} /> Analytics
        </div>
        <div 
          onClick={() => setActiveView('scheduling')}
          className={`sidebar-link cursor-pointer ${activeView === 'scheduling' ? 'active' : ''}`}
        >
          <Calendar size={20} /> Scheduling
        </div>
      </nav>

      <div className="mt-auto space-y-2">
        <div className="sidebar-link cursor-pointer"><Settings size={20} /> Settings</div>
        <div className="sidebar-link cursor-pointer text-red-400"><LogOut size={20} /> Logout</div>
      </div>
    </div>
  );
};

export default Sidebar;
