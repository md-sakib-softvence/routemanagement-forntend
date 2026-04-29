"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, FileText, Sparkles, Trash2, X } from 'lucide-react';

const Scheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
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

  const closeModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setFormData({ title: '', description: '', motivationTitle: '', time: '12:00' });
  };

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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/schedules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSchedules();
      }
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const handleScheduleClick = (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    setEditingSchedule(schedule);
    const date = new Date(schedule.date);
    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      motivationTitle: schedule.motivationTitle || '',
      time: time
    });
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const fullDate = new Date(selectedDate);
    const [hours, minutes] = formData.time.split(':');
    fullDate.setHours(parseInt(hours), parseInt(minutes));

    try {
      const { time, ...dataToSend } = formData;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(editingSchedule ? `${apiUrl}/schedules/${editingSchedule.id}` : `${apiUrl}/schedules`, {
        method: editingSchedule ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToSend,
          date: fullDate.toISOString()
        })
      });

      if (res.ok) {
        setShowModal(false);
        setEditingSchedule(null);
        fetchSchedules();
        setFormData({ title: '', description: '', motivationTitle: '', time: '12:00' });
      }
    } catch (err) {
      console.error("Failed to save schedule", err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callStatus: status })
      });
      if (res.ok) {
        fetchSchedules();
        if (editingSchedule && editingSchedule.id === id) {
          closeModal();
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDragStart = (e: React.DragEvent, schedulesToDrag: any[]) => {
    e.dataTransfer.setData('schedules', JSON.stringify(schedulesToDrag));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const schedulesData = e.dataTransfer.getData('schedules');
    if (!schedulesData) return;

    const originalSchedules = JSON.parse(schedulesData);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      await Promise.all(originalSchedules.map(async (originalSchedule: any) => {
        const newDate = new Date(date);
        const originalDate = new Date(originalSchedule.date);
        newDate.setHours(originalDate.getHours(), originalDate.getMinutes());

        return fetch(`${apiUrl}/schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: originalSchedule.title,
            description: originalSchedule.description,
            motivationTitle: originalSchedule.motivationTitle,
            date: newDate.toISOString()
          })
        });
      }));
      fetchSchedules();
    } catch (err) {
      console.error("Failed to clone schedules", err);
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
          draggable={daySchedules.length > 0}
          onDragStart={(e) => handleDragStart(e, daySchedules)}
          className={`h-32 border border-white/5 p-2 cursor-pointer hover:bg-white/10 transition-all relative group ${isToday ? 'bg-primary/10' : ''} ${daySchedules.length > 0 ? 'cursor-grab active:cursor-grabbing border-primary/20' : ''}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-500'}`}>{d}</span>
            {daySchedules.length > 0 && <span className="text-[10px] text-gray-400 bg-white/5 px-1 rounded">ALL</span>}
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
            {daySchedules.map((s, idx) => (
              <div
                key={s.id || idx}
                onClick={(e) => handleScheduleClick(e, s)}
                className={`text-[10px] px-1.5 py-0.5 rounded truncate border transition-colors flex justify-between items-center group/item hover:bg-opacity-30 ${
                  s.callStatus === 'CALLING' ? 'bg-red-500/20 text-red-500 border-red-500/10 animate-pulse' :
                  s.callStatus === 'RECEIVED' ? 'bg-green-500/20 text-green-500 border-green-500/10' :
                  s.callStatus === 'CANCELLED' ? 'bg-gray-500/20 text-gray-500 border-gray-500/10' :
                  s.callStatus === 'STOPPED' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/10' :
                  'bg-primary/20 text-primary border-primary/10'
                }`}
              >
                <span className="truncate flex items-center gap-1">
                  {s.callStatus === 'CALLING' && <Clock size={8} />}
                  {s.title}
                </span>
                <button
                  onClick={(e) => handleDelete(e, s.id)}
                  className="opacity-0 group-hover/item:opacity-100 hover:text-red-500 transition-all ml-1 p-0.5"
                >
                  <X size={10} />
                </button>
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
          <div className="glass w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              {editingSchedule ? <FileText className="text-primary" /> : <Plus className="text-primary" />}
              {editingSchedule ? 'Schedule Details' : `New Schedule for ${selectedDate?.toLocaleDateString()}`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Schedule Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, motivationTitle: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-primary h-24 resize-none"
                  placeholder="Details..."
                />
              </div>
              {editingSchedule && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Call Controls</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      type="button"
                      onClick={() => handleStatusUpdate(editingSchedule.id, 'RECEIVED')}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${editingSchedule.callStatus === 'RECEIVED' ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                    >
                      Receive
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleStatusUpdate(editingSchedule.id, 'CANCELLED')}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${editingSchedule.callStatus === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleStatusUpdate(editingSchedule.id, 'STOPPED')}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${editingSchedule.callStatus === 'STOPPED' ? 'bg-yellow-500 text-white' : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'}`}
                    >
                      Stop
                    </button>
                  </div>
                  {editingSchedule.callStatus === 'CALLING' && (
                    <p className="text-[10px] text-red-400 animate-pulse text-center">Currently Calling on Telegram (Attempt ${editingSchedule.callAttempt})...</p>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-lg transition-colors border border-white/10 font-medium"
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/80 py-3 rounded-lg transition-colors text-white font-medium shadow-lg shadow-primary/20"
                >
                  {editingSchedule ? 'Update Details' : 'Save Schedule'}
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
