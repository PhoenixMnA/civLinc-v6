/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CiviconnectFeed } from './components/CiviconnectFeed';
import { ServiceAppointmentsView } from './components/ServiceAppointmentsView';
import { GhostDoorAdminPortal } from './components/GhostDoorAdminPortal';
import { GhanaCardAuthModal } from './components/GhanaCardAuthModal';
import { CiviconnectNewReportModal } from './components/CiviconnectNewReportModal';
import { ResolutionProofModal } from './components/ResolutionProofModal';
import { NotificationsModal } from './components/NotificationsModal';
import { GhostDoorGatekeeperModal } from './components/GhostDoorGatekeeperModal';
import { LandingAuthView } from './components/LandingAuthView';
import { AccountDetailsDrawer } from './components/AccountDetailsDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { civicStore } from './services/store';
import { sounds } from './services/soundEffects';
import { CivicIssue } from './types';
import { Smartphone, LogIn } from 'lucide-react';

export default function App() {
  // Store reactive state
  const [, setTick] = useState(0);
  useEffect(() => {
    return civicStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const issues = civicStore.getIssues();
  const assemblies = civicStore.getAssemblies();
  const branches = civicStore.getBranches();
  const tickets = civicStore.getTickets();
  const auditLogs = civicStore.getAuditLogs();
  const notifications = civicStore.getNotifications();
  const currentUser = civicStore.getCurrentUser();
  const currentRole = civicStore.getCurrentRole();

  // Navigation State: 'auth' | 'civiconnect' | 'queues' | 'admin'
  // Default to 'auth' if unauthenticated
  const [activeView, setActiveView] = useState<'auth' | 'civiconnect' | 'queues' | 'admin'>(() => {
    return civicStore.isAuthenticated() ? 'civiconnect' : 'auth';
  });

  // Guard: if user logs out or is unauthenticated, stay on 'auth'
  useEffect(() => {
    if (!civicStore.isAuthenticated() && activeView !== 'auth') {
      setActiveView('auth');
    }
  }, [currentUser, activeView]);

  // Modals & Drawers
  const [isGhanaCardAuthOpen, setIsGhanaCardAuthOpen] = useState(false);
  const [isGhostDoorGatekeeperOpen, setIsGhostDoorGatekeeperOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [selectedProofIssue, setSelectedProofIssue] = useState<CivicIssue | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Audio Mute State
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());

  // Global Interface Color Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return civicStore.getTheme();
  });

  // Synchronize Theme with Document Root Element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = (newTheme: 'dark' | 'light') => {
    civicStore.setTheme(newTheme);
    setTheme(newTheme);
  };

  // Mobile Device Simulator Frame (Citizen Mobile Flutter Experience)
  const [isMobileSimulatorMode, setIsMobileSimulatorMode] = useState(false);

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    sounds.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) {
      sounds.playSuccessTone();
    }
  };

  const handleNavigateView = (view: 'civiconnect' | 'queues' | 'admin') => {
    if (view === 'admin') {
      if (currentRole === 'citizen') {
        setIsGhostDoorGatekeeperOpen(true);
      } else {
        setActiveView('admin');
      }
    } else {
      setActiveView(view);
    }
  };

  const handleLogout = () => {
    civicStore.logout();
    setIsAccountDrawerOpen(false);
    setActiveView('auth');
  };

  // If unauthenticated or user explicitly navigates to Landing Auth View
  if (activeView === 'auth' || !civicStore.isAuthenticated()) {
    return (
      <LandingAuthView
        assemblies={assemblies}
        onAuthenticated={() => {
          const role = civicStore.getCurrentRole();
          if (role === 'super_admin' || role === 'municipal_admin') {
            setActiveView('admin');
          } else {
            setActiveView('civiconnect');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-gray-300 flex flex-col font-sans selection:bg-[#CE1126] selection:text-white antialiased overflow-x-hidden">
      {/* Top Bar Navigation */}
      <Header
        activeView={activeView === 'admin' ? 'admin' : activeView === 'queues' ? 'queues' : 'civiconnect'}
        onChangeView={handleNavigateView}
        currentUser={currentUser}
        currentRole={currentRole}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
        onOpenGhanaCardAuth={() => setIsAccountDrawerOpen(true)}
        onOpenGhostDoorGatekeeper={() => setIsGhostDoorGatekeeperOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isMobileSimulatorMode={isMobileSimulatorMode}
        onToggleMobileSimulator={() => setIsMobileSimulatorMode(!isMobileSimulatorMode)}
      />

      {/* Main Content Area (extra bottom padding for mobile floating nav) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
        {/* Real-Time Citizen Ticket Call Broadcast Notice */}
        {currentRole === 'citizen' && tickets.some((t) => t.status === 'called') && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-[#CE1126] text-white shadow-xl shadow-red-950/60 border border-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse-subtle">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-[#0b0b0b] text-[#000000] flex items-center justify-center font-black animate-bounce shrink-0 text-base">
                🔔
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#ffb500]">
                  LIVE TICKET CALL NOTICE
                </div>
                <div className="text-sm font-bold">
                  Your ticket{' '}
                  <span className="font-mono underline font-black">
                    {tickets.find((t) => t.status === 'called')?.ticketNumber}
                  </span>{' '}
                  is being called at{' '}
                  <span className="text-[#fbb500] font-extrabold">
                    {tickets.find((t) => t.status === 'called')?.assignedCounter || 'Counter 4'}
                  </span>
                  !
                </div>
              </div>
            </div>
            <button
              id="ticket-call-broadcast-btn"
              type="button"
              onClick={() => setActiveView('queues')}
              className="px-4 py-2 bg-white text-[#000000] hover:bg-gray-100 text-xs font-black rounded-xl shadow-md transition shrink-0 whitespace-nowrap self-start sm:self-center"
            >
              View Live Pass & Counter →
            </button>
          </div>
        )}

        {isMobileSimulatorMode && activeView !== 'admin' ? (
          /* Flutter Mobile Simulator Frame for Citizen Experience */
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-3 text-xs text-gray-400 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-[#FCD116]" />
              <span>Simulating Citizen Mobile APK View (Portrait 390x844)</span>
              <button
                type="button"
                onClick={() => setIsMobileSimulatorMode(false)}
                className="text-[#FCD116] hover:underline font-semibold ml-2"
              >
                Expand to Full Screen
              </button>
            </div>

            <div className="relative w-full max-w-[420px] rounded-[42px] p-3.5 bg-[#0a0c12] border-4 border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
              {/* Phone speaker & camera notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 h-4 w-28 bg-[#050608] rounded-full z-30 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-gray-800 mr-2"></div>
                <div className="h-1.5 w-10 rounded-full bg-gray-800"></div>
              </div>

              {/* Inner phone screen container */}
              <div className="relative rounded-[32px] bg-[#050608] border border-white/5 overflow-hidden h-[740px] flex flex-col">
                {/* Mobile Status Bar */}
                <div className="pt-2 px-6 pb-2 flex items-center justify-between text-[10px] font-mono text-gray-400 z-20 bg-[#0a0c12]/90 backdrop-blur-md">
                  <span>09:41</span>
                  <div className="flex items-center space-x-1">
                    <span>MTN GH 5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Scrollable Mobile App Area */}
                <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar space-y-4">
                  {activeView === 'civiconnect' && (
                    <CiviconnectFeed
                      issues={issues}
                      assemblies={assemblies}
                      onOpenNewReport={() => setIsNewReportModalOpen(true)}
                      onOpenResolutionProof={(issue) => setSelectedProofIssue(issue)}
                      onOpenGhanaCardAuth={() => setIsAccountDrawerOpen(true)}
                    />
                  )}

                  {activeView === 'queues' && (
                    <ServiceAppointmentsView
                      branches={branches}
                      tickets={tickets}
                      onOpenGhanaCardAuth={() => setIsAccountDrawerOpen(true)}
                    />
                  )}
                </div>

                {/* Mobile Simulator Bottom Nav */}
                <MobileBottomNav
                  activeView={activeView === 'admin' ? 'admin' : activeView === 'queues' ? 'queues' : 'civiconnect'}
                  onChangeView={handleNavigateView}
                  currentRole={currentRole}
                  onOpenGhostDoorGatekeeper={() => setIsGhostDoorGatekeeperOpen(true)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Full Desktop & Mobile Responsive View */
          <div>
            {activeView === 'civiconnect' && (
              <CiviconnectFeed
                issues={issues}
                assemblies={assemblies}
                onOpenNewReport={() => setIsNewReportModalOpen(true)}
                onOpenResolutionProof={(issue) => setSelectedProofIssue(issue)}
                onOpenGhanaCardAuth={() => setIsAccountDrawerOpen(true)}
              />
            )}

            {activeView === 'queues' && (
              <ServiceAppointmentsView
                branches={branches}
                tickets={tickets}
                onOpenGhanaCardAuth={() => setIsAccountDrawerOpen(true)}
              />
            )}

            {activeView === 'admin' && (
              <GhostDoorAdminPortal
                issues={issues}
                assemblies={assemblies}
                tickets={tickets}
                branches={branches}
                auditLogs={auditLogs}
                onOpenResolutionProof={(issue) => setSelectedProofIssue(issue)}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Liquid Bottom Navigation Tab Bar for Mobile (< 768px) - Hidden for Municipal Admin and Super Admin */}
      {!isMobileSimulatorMode && currentRole === 'citizen' && (
        <MobileBottomNav
          activeView={activeView === 'admin' ? 'admin' : activeView === 'queues' ? 'queues' : 'civiconnect'}
          onChangeView={handleNavigateView}
          currentRole={currentRole}
          onOpenGhostDoorGatekeeper={() => setIsGhostDoorGatekeeperOpen(true)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0c12] py-6 text-xs text-gray-500 w-full mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-white">CIVICLINK GHANA</span>
            <span>•</span>
            <span className="text-[11px] sm:text-xs">National Civic Incident & Municipal Service Delivery Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-gray-400">
            <button
              type="button"
              onClick={handleLogout}
              className="text-[#FCD116] hover:underline flex items-center gap-1 font-bold"
            >
              <LogIn className="h-3 w-3" />
              <span>Sign Out / Switch Portal</span>
            </button>
            <span>•</span>
            <span>NIA Active</span>
            <span>•</span>
            <span>Realtime Sync</span>
            <span>•</span>
            <span>Ghost Door Geofenced</span>
          </div>
        </div>
      </footer>

      {/* Account Details & Global Theme Toggle Drawer */}
      <AccountDetailsDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onLogout={handleLogout}
      />

      {/* Modals */}
      <GhanaCardAuthModal
        isOpen={isGhanaCardAuthOpen}
        onClose={() => setIsGhanaCardAuthOpen(false)}
        onSuccess={() => {}}
      />

      <GhostDoorGatekeeperModal
        isOpen={isGhostDoorGatekeeperOpen}
        onClose={() => setIsGhostDoorGatekeeperOpen(false)}
        onSuccess={(role) => {
          setActiveView('admin');
        }}
        assemblies={assemblies}
      />

      <CiviconnectNewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onSuccess={() => {}}
      />

      <ResolutionProofModal
        issue={selectedProofIssue}
        isOpen={!!selectedProofIssue}
        onClose={() => setSelectedProofIssue(null)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}
