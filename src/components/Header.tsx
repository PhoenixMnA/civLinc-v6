import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  Smartphone, 
  Layers,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { UserRole, GhanaCardProfile, CivicNotification } from '../types';

interface Props {
  activeView: 'civiconnect' | 'queues' | 'admin';
  onChangeView: (view: 'civiconnect' | 'queues' | 'admin') => void;
  currentUser: GhanaCardProfile | null;
  currentRole: UserRole;
  notifications: CivicNotification[];
  onOpenNotifications: () => void;
  onOpenAccountDrawer: () => void;
  onOpenGhanaCardAuth: () => void;
  onOpenGhostDoorGatekeeper: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMobileSimulatorMode: boolean;
  onToggleMobileSimulator: () => void;
}

export const Header: React.FC<Props> = ({
  activeView,
  onChangeView,
  currentUser,
  currentRole,
  notifications,
  onOpenNotifications,
  onOpenAccountDrawer,
  onOpenGhanaCardAuth,
  onOpenGhostDoorGatekeeper,
  isMuted,
  onToggleMute,
  isMobileSimulatorMode,
  onToggleMobileSimulator
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full max-w-full border-b border-white/10 bg-[#07080b]/95 backdrop-blur-xl shadow-2xl">
      {/* Ghana Flag Tricolor Top Accent Line */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#CE1126]"></div>
        <div className="h-full w-1/3 bg-[#FCD116]"></div>
        <div className="h-full w-1/3 bg-[#006B3F]"></div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 overflow-x-hidden">
        {/* Zone 1: Ghanaian Brand Title with Iconic Black Star Stealth Trigger */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => onChangeView('civiconnect')}
            className="flex items-center space-x-2 sm:space-x-3 text-left group focus:outline-none"
            title="CivicLink Ghana Citizen Home"
          >
            {/* National Black Star Emblem */}
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#CE1126] via-[#FCD116] to-[#006B3F] p-[2px] shadow-[0_0_15px_rgba(252,209,22,0.3)] transition-transform group-hover:scale-105 shrink-0">
              <div className="h-full w-full bg-[#07080b] rounded-[9px] flex items-center justify-center">
                <span className="text-sm sm:text-base font-bold leading-none select-none" style={{ color: '#ffbd0a' }}>★</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-xs sm:text-sm font-extrabold tracking-wider group-hover:text-[#FCD116] transition-colors whitespace-nowrap" style={{ color: '#e5e509' }}>
                  CIVICLINK <span className="text-[#CE1126]">GHANA</span>
                </span>
              </div>
              <span className="text-[9px] text-gray-400 font-mono hidden sm:inline">
                Gov.gh Public Portal
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links (Hidden on Mobile screens < 768px in favor of Liquid Bottom Nav) */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#0d0f15]/90 p-1 rounded-xl border border-white/10 shrink">
          <button
            type="button"
            onClick={() => onChangeView('civiconnect')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeView === 'civiconnect'
                ? 'bg-[#CE1126] text-white shadow-md shadow-red-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Civiconnect</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('queues')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeView === 'queues'
                ? 'bg-[#FCD116] text-black shadow-md shadow-amber-400/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Live Queues</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Audio, Notifications, Phone Simulator & Account Details) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Mobile Simulator Toggle for Defense Presentation */}
          <button
            type="button"
            onClick={onToggleMobileSimulator}
            title="Toggle Native Mobile Simulator Frame"
            className={`p-1.5 sm:p-2 rounded-xl border text-xs transition hidden lg:flex items-center gap-1.5 ${
              isMobileSimulatorMode
                ? 'bg-amber-500/20 border-amber-500/50 text-[#FCD116]'
                : 'bg-[#12151e] border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-[11px] font-bold">Mobile View</span>
          </button>

          {/* Audio Chime Mute/Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
            className="p-1.5 sm:p-2 rounded-xl bg-[#12151e] border border-white/10 text-gray-400 hover:text-white transition shrink-0"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" /> : <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FCD116]" />}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-xl bg-[#12151e] border border-white/10 text-gray-400 hover:text-white transition shrink-0"
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#CE1126] text-white font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-600/50 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Account Details Profile Button (Triggers slide-open drawer) */}
          <button
            type="button"
            onClick={onOpenAccountDrawer}
            title="Open Account Details & Settings"
            className="flex items-center space-x-1.5 sm:space-x-2 bg-[#12151e] hover:bg-[#181c28] border border-white/10 hover:border-amber-500/40 p-1 sm:p-1.5 sm:pl-2.5 rounded-xl transition text-left shrink-0 shadow-sm"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#FCD116]">
                {currentRole === 'super_admin' ? 'Super Admin' : currentRole === 'municipal_admin' ? 'MMDA Staff' : 'Account'}
              </span>
              <span className="text-[11px] font-semibold text-white font-mono truncate max-w-[100px]">
                {currentUser ? (currentUser.fullName.split(' ')[0] || currentUser.idNumber) : 'Sign In'}
              </span>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-amber-500/30 bg-gradient-to-tr from-amber-950 to-black p-0.5 shrink-0">
              <div className="h-full w-full rounded-[5px] bg-[#090b10] flex items-center justify-center text-[10px] font-bold text-[#FCD116]">
                {currentUser?.fullName ? currentUser.fullName.slice(0, 2).toUpperCase() : 'GH'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
