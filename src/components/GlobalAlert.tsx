"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

const GlobalAlert = () => {
    const [activeAlert, setActiveAlert] = useState<any>(null);

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${apiUrl}/schedules/active-calls`);
                const data = await res.json();
                if (data && data.length > 0) {
                    setActiveAlert(data[0]);
                } else {
                    setActiveAlert(null);
                }
            } catch (err) {
                console.error("Failed to check active alerts", err);
            }
        };

        const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
        checkAlerts();

        return () => clearInterval(interval);
    }, []);

    const handleAcknowledge = async () => {
        if (!activeAlert) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await fetch(`${apiUrl}/schedules/${activeAlert.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callStatus: 'STOPPED' })
            });
            setActiveAlert(null);
        } catch (err) {
            console.error("Failed to acknowledge alert", err);
        }
    };

    if (!activeAlert) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-500/30 bg-[#0f1115] p-10 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl"></div>
                
                <div className="relative flex flex-col items-center text-center">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <Bell className="h-10 w-10 text-red-500 animate-bounce" />
                    </div>

                    <h2 className="mb-4 text-4xl font-black tracking-tight text-white uppercase">
                        CRITICAL ALERT
                    </h2>
                    
                    <p className="mb-2 text-lg text-gray-400">
                        High BGP Latency detected on <b>{activeAlert.title}</b>
                    </p>
                    <p className="mb-10 text-sm text-gray-500">
                        This alert is repeating on both Telegram and Dashboard.
                    </p>

                    <button
                        onClick={handleAcknowledge}
                        className="w-full rounded-2xl bg-red-600 py-5 text-xl font-bold text-white transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/20 uppercase tracking-wider"
                    >
                        ACKNOWLEDGE & STOP
                    </button>

                    <p className="mt-6 text-xs font-medium text-gray-600 uppercase tracking-widest">
                        The notification will loop until acknowledged.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalAlert;
