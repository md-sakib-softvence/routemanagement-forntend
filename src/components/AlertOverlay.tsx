"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, BellRing } from 'lucide-react';

const AlertOverlay = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Simulate an alert after 10 seconds
    const timer = setTimeout(() => {
      setActive(true);
      // Play alert sound logic here
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#11141b] border border-red-500/50 rounded-3xl p-10 max-w-lg w-full text-center pulsate shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <BellRing size={48} className="text-red-500" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">CRITICAL ALERT</h2>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          High BGP Latency detected on <b>RT-NY-CORE1</b>. This alert is repeating on both Telegram and Dashboard.
        </p>
        <button 
          onClick={() => setActive(false)}
          className="w-full bg-red-500 hover:bg-red-600 transition-colors text-white font-bold py-4 rounded-2xl text-xl shadow-lg"
        >
          ACKNOWLEDGE & STOP
        </button>
        <p className="mt-6 text-sm text-gray-500">
          The notification will loop until acknowledged.
        </p>
      </div>
    </div>
  );
};

export default AlertOverlay;
