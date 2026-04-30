import React from 'react';
import { Clock, X } from 'lucide-react';

export const CalendarGrid = ({
  currentDate,
  schedules,
  setSelectedDate,
  setShowModal,
  handleDrop,
  handleDragStart,
  handleScheduleClick,
  handleDelete
}: any) => {

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

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
      const daySchedules = schedules.filter((s: any) => new Date(s.date).toDateString() === dayDate.toDateString());

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
            {daySchedules.map((s: any, idx: number) => (
              <div
                key={s.id || idx}
                onClick={(e) => handleScheduleClick(e, s)}
                className={`text-[10px] px-1.5 py-0.5 rounded truncate border transition-colors flex justify-between items-center group/item hover:bg-opacity-30 ${s.callStatus === 'CALLING' ? 'bg-red-500/20 text-red-500 border-red-500/10 animate-pulse' :
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
                {new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    className="opacity-0 group-hover/item:opacity-100 hover:text-red-500 transition-all ml-1 p-0.5"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="grid grid-cols-7 gap-0 border border-white/5 rounded-2xl overflow-hidden glass">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
        <div key={d} className="bg-white/5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">
          {d}
        </div>
      ))}
      {renderCalendar()}
    </div>
  );
};
