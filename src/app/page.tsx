"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Scheduler from "@/components/Scheduler";
import Analytics from "@/components/Analytics";
import ProductivityReports from "@/components/ProductivityReports";
import SchedulesList from "@/components/SchedulesList";
import TodayReport from "@/components/TodayReport";
import AlertOverlay from "@/components/AlertOverlay";

export default function Home() {
  const [activeView, setActiveView] = useState('overview');

  return (
    <main className="min-h-screen bg-[#0a0c10]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      {activeView === 'overview' ? <Dashboard setActiveView={setActiveView} /> :
        activeView === 'analytics' ? <Analytics /> :
          activeView === 'reports' ? <ProductivityReports /> :
            activeView === 'todayReport' ? <TodayReport /> :
              activeView === 'scheduleList' ? <SchedulesList onBack={() => setActiveView('overview')} /> :
                <Scheduler />}
    </main>
  );
}
