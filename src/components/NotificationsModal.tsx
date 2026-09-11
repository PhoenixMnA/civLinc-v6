import React from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Flame, 
  AlertTriangle, 
  Clock, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { CivicNotification } from '../types';
import { civicStore } from '../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: CivicNotification[];
}

export const NotificationsModal: React.FC<Props> = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  const handleClearAll = () => {
    civicStore.clearAllNotifications();
  };

  const handleMarkRead = (id: string) => {
    civicStore.markNotificationRead(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0a0c12] border border-white/10 shadow-2xl overflow-hidden mt-12 sm:mt-0">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-rose-500"></div>

        {/* Modal Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
              <p className="text-[11px] text-gray-400">Realtime updates from Assemblies and Service Centers</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-gray-400 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="p-4 space-y-2.5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-xs">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1 ${
                  notif.read
                    ? 'bg-[#050608] border-white/5 text-gray-400'
                    : 'bg-[#11141b] border-indigo-500/30 text-gray-200 shadow-md shadow-indigo-600/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {notif.type === 'ticket_called' && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>}
                    {notif.type === 'issue_escalated' && <Flame className="h-3.5 w-3.5 text-rose-400" />}
                    {notif.type === 'issue_resolved' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {notif.type === 'rescheduled' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
