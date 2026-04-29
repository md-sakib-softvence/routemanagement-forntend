import React from 'react';
import { Plus, Clock, FileText, Sparkles, X } from 'lucide-react';

export const EditScheduleModal = ({
  editingSchedule,
  selectedDate,
  formData,
  setFormData,
  handleSubmit,
  closeModal,
  isGeneratingMotivation,
  setIsGeneratingMotivation,
  handleStatusUpdate
}: any) => {
  return (
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
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.title) return;
                    setIsGeneratingMotivation(true);
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
                      const res = await fetch(`${apiUrl}/schedules/generate-motivation`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: formData.title,
                          description: formData.description,
                          motivationTitle: formData.motivationTitle
                        })
                      });
                      const data = await res.json();
                      if (data.motivation) {
                        setFormData((prev: any) => ({ ...prev, motivationTitle: data.motivation }));
                      }
                    } finally {
                      setIsGeneratingMotivation(false);
                    }
                  }}
                  disabled={isGeneratingMotivation || !formData.title}
                  title="Generate Motivation via AI"
                  className="absolute left-1.5 top-1.5 p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 z-10"
                >
                  <Sparkles size={16} className={`text-accent ${isGeneratingMotivation ? 'animate-pulse text-white' : ''}`} />
                </button>
                <input
                  type="text"
                  value={formData.motivationTitle}
                  onChange={(e) => setFormData({ ...formData, motivationTitle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-accent"
                  placeholder="Goal..."
                  disabled={isGeneratingMotivation}
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
  );
};
