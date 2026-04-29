"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, FileText, Sparkles } from 'lucide-react';

const Scheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    motivationTitle: '',
    time: '12:00'
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/schedules?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`);
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const fullDate = new Date(selectedDate);
    const [hours, minutes] = formData.time.split(':');
    fullDate.setHours(parseInt(hours), parseInt(minutes));

    try {
      const { time, ...dataToSend } = formData;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToSend,
          date: fullDate.toISOString()
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchSchedules();
        setFormData({ title: '', description: '', motivationTitle: '', time: '12:00' });
      }
    } catch (err) {
      console.error("Failed to create schedule", err);
    }
  };

  const handleDragStart = (e: React.DragEvent, schedule: any) => {
    e.dataTransfer.setData('schedule', JSON.stringify(schedule));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const scheduleData = e.dataTransfer.getData('schedule');
    if (!scheduleData) return;

    const originalSchedule = JSON.parse(scheduleData);
    const newDate = new Date(date);
    const originalDate = new Date(originalSchedule.date);
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes());

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: originalSchedule.title,
          description: originalSchedule.description,
          motivationTitle: originalSchedule.motivationTitle,
          date: newDate.toISOString()
        })
      });
      if (res.ok) {
        fetchSchedules();
      }
    } catch (err) {
      console.error("Failed to clone schedule", err);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-white/5 opacity-50"></div>);
    }

    for (let d = 1; d <= daysCount; d++) {
      const dayDate = new Date(year, month, d);
      const isToday = new Date().toDateString() === dayDate.toDateString();
      const daySchedules = schedules.filter(s => new Date(s.date).toDateString() === dayDate.toDateString());

      days.push(
        <div 
          key={d} 
          onClick={() => { setSelectedDate(dayDate); setShowModal(true); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, dayDate)}
          className={`h-32 border border-white/5 p-2 cursor-pointer hover:bg-white/10 transition-all relative group ${isToday ? 'bg-primary/10' : ''}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-500'}`}>{d}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {daySchedules.map((s, idx) => (
                <div 
                  key={idx} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, s)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded truncate border border-primary/10 cursor-grab active:cursor-grabbing hover:bg-primary/30 transition-colors"
                >
                  {s.title}
                </div>
              ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="ml-64 p-8 min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Scheduling Overview</h1>
          <p className="text-gray-400">Plan and automate your routing operations.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-lg font-bold min-w-32 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-0 border border-white/5 rounded-2xl overflow-hidden glass">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="bg-white/5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">
            {d}
          </div>
        ))}
        {renderCalendar()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="metric-card">
          <span className="metric-label">Total Schedules</span>
          <span className="metric-value text-primary">{schedules.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Planned Calls</span>
          <span className="metric-value text-accent">{schedules.length > 0 ? (schedules.length * 1.5).toFixed(0) : 0}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Motivation Quota</span>
          <span className="metric-value text-purple-400">Active</span>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-primary" /> Schedule for {selectedDate?.toLocaleDateString()}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Schedule Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-primary"
                  placeholder="e.g. Core Update"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Motivation</label>
                  <div className="relative">
                    <Sparkles size={16} className="absolute left-3 top-3 text-accent" />
                    <input 
                      type="text" 
                      value={formData.motivationTitle}
                      onChange={(e) => setFormData({...formData, motivationTitle: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-accent"
                      placeholder="Goal..."
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-primary h-24 resize-none"
                  placeholder="Details..."
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors border border-white/10 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/80 py-2 rounded-lg transition-colors text-white font-medium shadow-lg shadow-primary/20"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
