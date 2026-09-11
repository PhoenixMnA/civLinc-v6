import React from 'react';
import { motion } from 'motion/react';
import { Layers, Radio } from 'lucide-react';
import { UserRole } from '../types';
import { sounds } from '../services/soundEffects';

interface Props {
  activeView: 'civiconnect' | 'queues' | 'admin';
  onChangeView: (view: 'civiconnect' | 'queues' | 'admin') => void;
  currentRole: UserRole;
  onOpenGhostDoorGatekeeper?: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeView,
  onChangeView
}) => {
  const tabs = [
    {
      id: 'civiconnect' as const,
      label: 'Civiconnect',
      sublabel: 'Incident Feed',
      icon: Layers,
      accentColor: '#CE1126',
      activeTextColor: 'text-[#CE1126]',
      bgGlow: 'rgba(206, 17, 38, 0.25)',
      onClick: () => {
        sounds.playVotePop();
        onChangeView('civiconnect');
      }
    },
    {
      id: 'queues' as const,
      label: 'Live Queue',
      sublabel: 'Appointments',
      icon: Radio,
      accentColor: '#FCD116',
      activeTextColor: 'text-[#FCD116]',
      bgGlow: 'rgba(252, 209, 22, 0.25)',
      onClick: () => {
        sounds.playVotePop();
        onChangeView('queues');
      }
    }
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden pointer-events-none">
      {/* Floating Pill Container with Liquid Backdrop */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto max-w-sm mx-auto rounded-3xl bg-[#090b11]/92 backdrop-blur-2xl border border-white/15 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Subtle Ghana Tricolor Edge Accent */}
        <div className="absolute top-0 left-6 right-6 h-[2px] flex opacity-60">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        <div className="grid grid-cols-2 relative items-center">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.onClick}
                className={`relative z-10 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 select-none ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {/* Liquid Fluid Indicator Animation */}
                {isActive && (
                  <motion.div
                    layoutId="liquid-active-pill"
                    className="absolute inset-0 rounded-2xl border shadow-lg"
                    style={{
                      backgroundColor: tab.bgGlow,
                      borderColor: `${tab.accentColor}55`,
                      boxShadow: `0 0 20px ${tab.bgGlow}`
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}

                {/* Icon with scale bounce on active */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="relative z-20"
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? tab.activeTextColor : 'text-gray-400'
                    }`}
                  />
                </motion.div>

                {/* Label text */}
                <span
                  className={`text-[10px] font-extrabold tracking-wide mt-1 relative z-20 transition-colors ${
                    isActive ? 'text-white font-black' : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active Indicator Micro-Dot */}
                {isActive && (
                  <motion.div
                    layoutId="liquid-micro-dot"
                    className="h-1 w-1 rounded-full mt-0.5 relative z-20"
                    style={{ backgroundColor: tab.accentColor }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
