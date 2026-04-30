import React from 'react';
import { Clock, X, Sparkles, FileText, AlertCircle } from 'lucide-react';

export const ViewScheduleModal = ({ 
  viewSchedule, 
  setShowViewModal, 
  setViewSchedule, 
  handleStatusUpdate, 
  openEditModal 
}: { 
  viewSchedule: any, 
  setShowViewModal: (val: boolean) => void, 
  setViewSchedule: (val: any) => void, 
  handleStatusUpdate: (id: string, status: string) => void, 
  openEditModal: (schedule: any) => void 
}) => {
  if (!viewSchedule) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass w-full max-w-2xl min-h-[50vh] max-h-[90vh] overflow-y-auto rounded-3xl p-10 border border-white/10 shadow-2xl relative flex flex-col">
        <button
          onClick={() => { setShowViewModal(false); setViewSchedule(null); }}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full p-2"
        >
          <X size={20} />
        </button>

        <div className="flex justify-between items-start mb-8 pr-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">{viewSchedule.title}</h2>
            <div className="flex items-center gap-2 text-primary font-medium">
              <Clock size={16} />
              {new Date(viewSchedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <span className="text-gray-500 mx-2">•</span>
              {new Date(viewSchedule.date).toLocaleDateString()}
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${viewSchedule.callStatus === 'CALLING' ? 'bg-red-500/20 text-red-500 border-red-500/20 animate-pulse' :
              viewSchedule.callStatus === 'RECEIVED' ? 'bg-green-500/20 text-green-500 border-green-500/20' :
                viewSchedule.callStatus === 'CANCELLED' ? 'bg-gray-500/20 text-gray-500 border-gray-500/20' :
                  viewSchedule.callStatus === 'STOPPED' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' :
                    'bg-primary/20 text-primary border-primary/20'
            }`}>
            {viewSchedule.callStatus || 'PLANNED'}
          </div>
        </div>

        {viewSchedule.motivationTitle && (
          <div className="bg-gradient-to-r from-accent/20 to-transparent p-6 rounded-2xl border-l-4 border-accent mb-8 relative overflow-hidden">
            <Sparkles size={100} className="absolute -right-6 -top-6 text-accent/10 rotate-12" />
            <h3 className="text-lg font-bold text-accent mb-2 uppercase tracking-wider text-[10px]">Goal / Motivation</h3>
            <p className="text-2xl font-serif italic text-white leading-relaxed">
              "{viewSchedule.motivationTitle}"
            </p>
          </div>
        )}

        {viewSchedule.description && (
          <div className="mb-8 flex-1">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Description</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg bg-white/5 p-6 rounded-2xl border border-white/5">
              {viewSchedule.description}
            </p>
          </div>
        )}

        {new Date(viewSchedule.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && (
          <div className="mt-auto pt-8 border-t border-white/10 space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Call Controls</p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => { handleStatusUpdate(viewSchedule.id, 'RECEIVED'); setShowViewModal(false); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${viewSchedule.callStatus === 'RECEIVED' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'}`}
                >
                  Receive
                </button>
                <button
                  onClick={() => { handleStatusUpdate(viewSchedule.id, 'CANCELLED'); setShowViewModal(false); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${viewSchedule.callStatus === 'CANCELLED' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { handleStatusUpdate(viewSchedule.id, 'STOPPED'); setShowViewModal(false); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${viewSchedule.callStatus === 'STOPPED' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20'}`}
                >
                  Stop
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => openEditModal(viewSchedule)}
                className="flex-1 bg-primary/20 hover:bg-primary/40 py-4 rounded-xl transition-all border border-primary/30 font-bold text-white flex items-center justify-center gap-2"
              >
                <FileText size={18} /> Edit Schedule Details
              </button>
            </div>
          </div>
        )}
        {new Date(viewSchedule.date) < new Date(new Date().setHours(0, 0, 0, 0)) && (
          <div className="mt-auto pt-8 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} className="text-gray-500" />
              <p className="text-gray-500 text-sm font-medium italic">
                This schedule has passed and is locked for historical auditing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
