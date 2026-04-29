"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Scheduler from "@/components/Scheduler";
import AlertOverlay from "@/components/AlertOverlay";

export default function Home() {
  const [activeView, setActiveView] = useState('overview');

  return (
    <main className="min-h-screen bg-[#0a0c10]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      {activeView === 'overview' ? <Dashboard /> : <Scheduler />}
    </main>
  );
}
