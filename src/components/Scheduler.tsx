"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HourlyAnalysisChart } from './scheduler/HourlyAnalysisChart';
import { ViewScheduleModal } from './scheduler/ViewScheduleModal';
import { EditScheduleModal } from './scheduler/EditScheduleModal';
import { CalendarGrid } from './scheduler/CalendarGrid';

const Scheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSchedule, setViewSchedule] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isGeneratingMotivation, setIsGeneratingMotivation] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    motivationTitle: '',
    time: '12:00'
  });

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
      const res = await fetch(`${apiUrl}/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const handleScheduleClick = (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    setViewSchedule(schedule);
    setShowViewModal(true);
  };

  const openEditModal = (schedule: any) => {
    setShowViewModal(false);
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
        body: JSON.stringify({ ...dataToSend, date: fullDate.toISOString() })
      });
      if (res.ok) {
        closeModal();
        fetchSchedules();
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
        if (editingSchedule && editingSchedule.id === id) closeModal();
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

  const todayStr = new Date().toDateString();
  const todaySchedules = schedules.filter(s => new Date(s.date).toDateString() === todayStr);
  const todayReceived = todaySchedules.filter(s => s.callStatus === 'RECEIVED').length;
  const todayFailed = todaySchedules.filter(s => s.callStatus === 'CANCELLED' || s.callStatus === 'STOPPED').length;

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

      <CalendarGrid 
        currentDate={currentDate} 
        schedules={schedules} 
        setSelectedDate={setSelectedDate} 
        setShowModal={setShowModal} 
        handleDrop={handleDrop} 
        handleDragStart={handleDragStart} 
        handleScheduleClick={handleScheduleClick} 
        handleDelete={handleDelete} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="metric-card">
          <span className="metric-label">Today Total Schedules</span>
          <span className="metric-value text-primary">{todaySchedules.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Today Completed</span>
          <span className="metric-value text-green-400">{todayReceived}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Today Uncompleted</span>
          <span className="metric-value text-red-500">{todayFailed}</span>
        </div>
      </div>

      <HourlyAnalysisChart schedules={schedules} />

      {showModal && (
        <EditScheduleModal 
          editingSchedule={editingSchedule}
          selectedDate={selectedDate}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
          isGeneratingMotivation={isGeneratingMotivation}
          setIsGeneratingMotivation={setIsGeneratingMotivation}
          handleStatusUpdate={handleStatusUpdate}
        />
      )}

      {showViewModal && viewSchedule && (
        <ViewScheduleModal 
          viewSchedule={viewSchedule}
          setShowViewModal={setShowViewModal}
          setViewSchedule={setViewSchedule}
          handleStatusUpdate={handleStatusUpdate}
          openEditModal={openEditModal}
        />
      )}
    </div>
  );
};

export default Scheduler;
