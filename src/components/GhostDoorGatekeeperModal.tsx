import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, AlertTriangle, X, Terminal, Radio, CheckCircle2, ChevronRight } from 'lucide-react';
import { UserRole, MunicipalAssembly } from '../types';
import { civicStore } from '../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole, districtId?: string) => void;
  assemblies: MunicipalAssembly[];
}

export const GhostDoorGatekeeperModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  assemblies
}) => {
  const [passkey, setPasskey] = useState('');
  const [targetRole, setTargetRole] = useState<'municipal_admin' | 'super_admin'>('municipal_admin');
  const [selectedDistrictId, setSelectedDistrictId] = useState(assemblies[0]?.id || 'asm-ama-01');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setErrorMsg('Please enter the Ghost Door stealth security passkey.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    const result = await civicStore.unlockGhostDoorGatekeeper(passkey, targetRole, selectedDistrictId);
    setIsVerifying(false);

    if (result.success) {
      onSuccess(targetRole, selectedDistrictId);
      onClose();
    } else {
      setErrorMsg(result.error || 'Authentication failed: Invalid security passcode.');
    }
  };

  const handleUsePreset = (code: string) => {
    setPasskey(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-amber-500/30 shadow-[0_0_40px_rgba(252,209,22,0.15)] overflow-hidden">
        {/* Ghana Flag Header Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <span className="text-xl leading-none">★</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Ghost Door Gatekeeper</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  Stealth Access
                </span>
              </div>
              <p className="text-[11px] text-gray-400">National Municipal & Super Admin Switchboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleVerify} className="p-4 sm:p-6 space-y-4">
          <div className="p-3 rounded-xl bg-[#12151e] border border-white/5 text-xs text-gray-300 space-y-1.5">
            <div className="flex items-center justify-between text-amber-400 font-mono text-[11px] font-bold">
              <span className="flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5" /> SECURE DISPATCH PROTOCOL
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse" /> GEOFENCED
              </span>
            </div>
          </div>

          {/* Role Choice */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Authorization Target Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetRole('municipal_admin')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 text-center ${
                  targetRole === 'municipal_admin'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span>Municipal Engineer</span>
                <span className="text-[10px] font-normal text-gray-400">MMDA Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole('super_admin')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 text-center ${
                  targetRole === 'super_admin'
                    ? 'bg-red-600/15 border-red-600/40 text-red-400 shadow-sm'
                    : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span>Super Administrator</span>
                <span className="text-[10px] font-normal text-gray-400">Jubilee House Root</span>
              </button>
            </div>
          </div>

          {/* District Selection if Municipal Admin */}
          {targetRole === 'municipal_admin' && (
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Assigned Municipal Assembly (MMDA)
              </label>
              <select
                value={selectedDistrictId ?? ''}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#12151e] border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
              >
                {assemblies.map((asm) => (
                  <option key={asm.id} value={asm.id}>
                    {asm.code} - {asm.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Passkey Input */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Stealth Gatekeeper Passkey
            </label>
            <div className="relative">
              <input
                type="password"
                value={passkey ?? ''}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter secret passkey (e.g. GH-ADMIN-2026)"
                className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-[#12151e] border border-white/10 text-white text-xs font-mono tracking-wider focus:border-amber-400 focus:outline-none"
              />
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Presentation Quick-Fill Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Defense Presentation Quick Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleUsePreset('GH-ADMIN-2026')}
                className="px-2 py-1 rounded bg-[#181c28] hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/30 text-[10px] font-mono text-amber-300 transition"
              >
                GH-ADMIN-2026 (Standard)
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('GHOST-DOOR-ROOT')}
                className="px-2 py-1 rounded bg-[#181c28] hover:bg-red-600/20 border border-white/5 hover:border-red-600/30 text-[10px] font-mono text-red-300 transition"
              >
                GHOST-DOOR-ROOT
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('BLACKSTAR-2026')}
                className="px-2 py-1 rounded bg-[#181c28] hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 text-[10px] font-mono text-emerald-300 transition"
              >
                BLACKSTAR-2026
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-bold text-xs transition border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span>Verifying Biometrics...</span>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlock Ghost Door</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
