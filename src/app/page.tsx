"use client";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import AlertOverlay from "@/components/AlertOverlay";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0c10]">
      <Sidebar />
      <Dashboard />
      <AlertOverlay />
    </main>
  );
}
